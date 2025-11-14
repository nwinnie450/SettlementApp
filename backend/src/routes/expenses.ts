import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all expenses for a group
router.get('/group/:groupId', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { groupId } = req.params;

    // Verify user is member of group
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': req.userId,
      'members.isActive': true,
    });

    if (!group) {
      res.status(403).json({ error: 'Access denied to this group' });
      return;
    }

    const expenses = await Expense.find({ groupId })
      .sort({ date: -1 })
      .populate('paidBy', 'name email')
      .populate('createdBy', 'name email');

    res.json({ expenses });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create new expense
router.post(
  '/',
  [
    body('groupId').notEmpty().withMessage('Group ID is required'),
    body('description').trim().isLength({ min: 1, max: 200 }),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isLength({ min: 3, max: 3 }),
    body('baseCurrencyAmount').isFloat({ min: 0.01 }),
    body('category').isIn([
      'food',
      'transport',
      'entertainment',
      'utilities',
      'shopping',
      'healthcare',
      'education',
      'travel',
      'housing',
      'other',
    ]),
    body('date').isISO8601(),
    body('paidBy').notEmpty(),
    body('splits').isArray({ min: 1 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const {
        groupId,
        description,
        amount,
        currency,
        baseCurrencyAmount,
        category,
        date,
        paidBy,
        photoUrl,
        splits,
      } = req.body;

      // Verify user is member of group
      const group = await Group.findOne({
        _id: groupId,
        'members.userId': req.userId,
        'members.isActive': true,
      });

      if (!group) {
        res.status(403).json({ error: 'Access denied to this group' });
        return;
      }

      // Validate splits sum to total amount (with small tolerance for rounding)
      const totalSplits = splits.reduce((sum: number, split: any) => sum + split.amount, 0);
      if (Math.abs(totalSplits - amount) > 0.01) {
        res.status(400).json({ error: 'Splits must sum to total amount' });
        return;
      }

      const expense = new Expense({
        groupId,
        description,
        amount,
        currency: currency.toUpperCase(),
        baseCurrencyAmount,
        category,
        date,
        paidBy,
        photoUrl,
        splits,
        createdBy: req.userId,
      });

      await expense.save();

      const populatedExpense = await Expense.findById(expense._id)
        .populate('paidBy', 'name email')
        .populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Expense created successfully',
        expense: populatedExpense,
      });
    } catch (error: any) {
      console.error('Create expense error:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  }
);

// Get single expense by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email')
      .populate('createdBy', 'name email');

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Verify user is member of group
    const group = await Group.findOne({
      _id: expense.groupId,
      'members.userId': req.userId,
      'members.isActive': true,
    });

    if (!group) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ expense });
  } catch (error: any) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Update expense
router.put(
  '/:id',
  [
    body('description').optional().trim().isLength({ min: 1, max: 200 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('category').optional().isIn([
      'food',
      'transport',
      'entertainment',
      'utilities',
      'shopping',
      'healthcare',
      'education',
      'travel',
      'housing',
      'other',
    ]),
    body('date').optional().isISO8601(),
    body('splits').optional().isArray({ min: 1 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const expense = await Expense.findById(req.params.id);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      // Verify user is member of group
      const group = await Group.findOne({
        _id: expense.groupId,
        'members.userId': req.userId,
        'members.isActive': true,
      });

      if (!group) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Verify user is admin or creator of expense
      const isAdmin = group.adminIds.some((id) => id.toString() === req.userId);
      const isCreator = expense.createdBy.toString() === req.userId;

      if (!isAdmin && !isCreator) {
        res.status(403).json({ error: 'Only admins or expense creator can update' });
        return;
      }

      const { description, amount, currency, category, date, photoUrl, splits } = req.body;

      // If amount or splits are updated, validate
      if (amount && splits) {
        const totalSplits = splits.reduce((sum: number, split: any) => sum + split.amount, 0);
        if (Math.abs(totalSplits - amount) > 0.01) {
          res.status(400).json({ error: 'Splits must sum to total amount' });
          return;
        }
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        {
          ...(description && { description }),
          ...(amount && { amount }),
          ...(currency && { currency: currency.toUpperCase() }),
          ...(category && { category }),
          ...(date && { date }),
          ...(photoUrl !== undefined && { photoUrl }),
          ...(splits && { splits }),
        },
        { new: true, runValidators: true }
      )
        .populate('paidBy', 'name email')
        .populate('createdBy', 'name email');

      res.json({
        message: 'Expense updated successfully',
        expense: updatedExpense,
      });
    } catch (error: any) {
      console.error('Update expense error:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  }
);

// Delete expense
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Verify user is member of group
    const group = await Group.findOne({
      _id: expense.groupId,
      'members.userId': req.userId,
      'members.isActive': true,
    });

    if (!group) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user is admin or creator of expense
    const isAdmin = group.adminIds.some((id) => id.toString() === req.userId);
    const isCreator = expense.createdBy.toString() === req.userId;

    if (!isAdmin && !isCreator) {
      res.status(403).json({ error: 'Only admins or expense creator can delete' });
      return;
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Settlement } from '../models/Settlement';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Calculate balances for a group
router.get('/group/:groupId/balances', async (req: Request, res: Response): Promise<void> => {
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

    // Get all expenses for the group
    const expenses = await Expense.find({ groupId });

    // Calculate balances
    const balances = new Map<string, number>();

    // Initialize all active members with 0 balance
    group.members.forEach((member) => {
      if (member.isActive) {
        balances.set(member.userId.toString(), 0);
      }
    });

    // Calculate net balances
    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();

      // Person who paid gets positive balance
      const currentBalance = balances.get(paidById) || 0;
      balances.set(paidById, currentBalance + expense.baseCurrencyAmount);

      // People in the split get negative balance
      expense.splits.forEach((split) => {
        const splitUserId = split.userId.toString();
        const splitBalance = balances.get(splitUserId) || 0;
        balances.set(splitUserId, splitBalance - split.amount);
      });
    });

    // Convert to array format
    const balanceArray = Array.from(balances.entries()).map(([userId, amount]) => {
      const member = group.members.find((m) => m.userId.toString() === userId);
      return {
        userId,
        userName: member?.name || 'Unknown',
        netAmount: Math.round(amount * 100) / 100, // Round to 2 decimals
        currency: group.baseCurrency,
      };
    });

    res.json({ balances: balanceArray });
  } catch (error: any) {
    console.error('Calculate balances error:', error);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

// Get all settlements for a group
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

    const settlements = await Settlement.find({ groupId })
      .sort({ createdAt: -1 })
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    res.json({ settlements });
  } catch (error: any) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

// Create settlement record
router.post(
  '/',
  [
    body('groupId').notEmpty(),
    body('fromUserId').notEmpty(),
    body('toUserId').notEmpty(),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isLength({ min: 3, max: 3 }),
    body('notes').optional().isLength({ max: 500 }),
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

      const { groupId, fromUserId, toUserId, amount, currency, notes } = req.body;

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

      // Verify both users are members of the group
      const fromMember = group.members.find((m) => m.userId.toString() === fromUserId);
      const toMember = group.members.find((m) => m.userId.toString() === toUserId);

      if (!fromMember || !toMember) {
        res.status(400).json({ error: 'Both users must be members of the group' });
        return;
      }

      const settlement = new Settlement({
        groupId,
        fromUserId,
        toUserId,
        amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        notes,
      });

      await settlement.save();

      const populatedSettlement = await Settlement.findById(settlement._id)
        .populate('fromUserId', 'name email')
        .populate('toUserId', 'name email');

      res.status(201).json({
        message: 'Settlement created successfully',
        settlement: populatedSettlement,
      });
    } catch (error: any) {
      console.error('Create settlement error:', error);
      res.status(500).json({ error: 'Failed to create settlement' });
    }
  }
);

// Mark settlement as paid
router.put('/:id/mark-paid', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      res.status(404).json({ error: 'Settlement not found' });
      return;
    }

    // Verify user is member of group
    const group = await Group.findOne({
      _id: settlement.groupId,
      'members.userId': req.userId,
      'members.isActive': true,
    });

    if (!group) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user is involved in the settlement or is admin
    const isInvolved =
      settlement.fromUserId.toString() === req.userId ||
      settlement.toUserId.toString() === req.userId;
    const isAdmin = group.adminIds.some((id) => id.toString() === req.userId);

    if (!isInvolved && !isAdmin) {
      res.status(403).json({ error: 'Only involved parties or admins can mark as paid' });
      return;
    }

    settlement.status = 'completed';
    settlement.paidAt = new Date();
    await settlement.save();

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    res.json({
      message: 'Settlement marked as paid',
      settlement: populatedSettlement,
    });
  } catch (error: any) {
    console.error('Mark paid error:', error);
    res.status(500).json({ error: 'Failed to mark settlement as paid' });
  }
});

// Delete settlement
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      res.status(404).json({ error: 'Settlement not found' });
      return;
    }

    // Verify user is member of group
    const group = await Group.findOne({
      _id: settlement.groupId,
      'members.userId': req.userId,
      'members.isActive': true,
    });

    if (!group) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Only admins can delete settlements
    const isAdmin = group.adminIds.some((id) => id.toString() === req.userId);
    if (!isAdmin) {
      res.status(403).json({ error: 'Only admins can delete settlements' });
      return;
    }

    await Settlement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Settlement deleted successfully' });
  } catch (error: any) {
    console.error('Delete settlement error:', error);
    res.status(500).json({ error: 'Failed to delete settlement' });
  }
});

export default router;

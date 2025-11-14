import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Group } from '../models/Group';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all groups for current user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const groups = await Group.find({
      'members.userId': req.userId,
      'members.isActive': true,
    }).sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (error: any) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create new group
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
    body('baseCurrency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().isLength({ max: 200 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user || !req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { name, baseCurrency, description } = req.body;

      // Generate unique invite code
      const inviteCode = `invite_${crypto.randomBytes(8).toString('hex')}`;

      const group = new Group({
        name,
        baseCurrency: baseCurrency.toUpperCase(),
        description,
        inviteCode,
        createdBy: req.userId,
        adminIds: [req.userId],
        members: [
          {
            userId: req.userId,
            name: req.user.name,
            email: req.user.email,
            role: 'admin',
            joinedAt: new Date(),
            isActive: true,
          },
        ],
      });

      await group.save();

      res.status(201).json({
        message: 'Group created successfully',
        group,
      });
    } catch (error: any) {
      console.error('Create group error:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }
);

// Get single group by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const group = await Group.findOne({
      _id: req.params.id,
      'members.userId': req.userId,
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    res.json({ group });
  } catch (error: any) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Update group
router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 3, max: 50 }),
    body('baseCurrency').optional().isLength({ min: 3, max: 3 }),
    body('description').optional().isLength({ max: 200 }),
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

      const { name, baseCurrency, description } = req.body;

      // Check if user is admin
      const group = await Group.findOne({
        _id: req.params.id,
        adminIds: req.userId,
      });

      if (!group) {
        res.status(403).json({ error: 'Only admins can update group' });
        return;
      }

      const updatedGroup = await Group.findByIdAndUpdate(
        req.params.id,
        {
          ...(name && { name }),
          ...(baseCurrency && { baseCurrency: baseCurrency.toUpperCase() }),
          ...(description !== undefined && { description }),
        },
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Group updated successfully',
        group: updatedGroup,
      });
    } catch (error: any) {
      console.error('Update group error:', error);
      res.status(500).json({ error: 'Failed to update group' });
    }
  }
);

// Delete group
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const group = await Group.findOne({
      _id: req.params.id,
      createdBy: req.userId, // Only creator can delete
    });

    if (!group) {
      res.status(403).json({ error: 'Only group creator can delete group' });
      return;
    }

    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Join group via invite code
router.post('/join',
  [body('inviteCode').notEmpty().withMessage('Invite code is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user || !req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { inviteCode } = req.body;

      const group = await Group.findOne({ inviteCode });
      if (!group) {
        res.status(404).json({ error: 'Invalid invite code' });
        return;
      }

      // Check if user is already a member
      const isMember = group.members.some(
        (m) => m.userId.toString() === req.userId && m.isActive
      );

      if (isMember) {
        res.status(400).json({ error: 'You are already a member of this group' });
        return;
      }

      // Add user to group
      group.members.push({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: 'member',
        joinedAt: new Date(),
        isActive: true,
      });

      await group.save();

      res.json({
        message: 'Successfully joined group',
        group,
      });
    } catch (error: any) {
      console.error('Join group error:', error);
      res.status(500).json({ error: 'Failed to join group' });
    }
  }
);

// Add member to group
router.post(
  '/:id/members',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
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

      // Check if user is admin
      const group = await Group.findOne({
        _id: req.params.id,
        adminIds: req.userId,
      });

      if (!group) {
        res.status(403).json({ error: 'Only admins can add members' });
        return;
      }

      const { email, name } = req.body;

      // Check if member already exists
      const existingMember = group.members.find(
        (m) => m.email.toLowerCase() === email.toLowerCase() && m.isActive
      );

      if (existingMember) {
        res.status(400).json({ error: 'Member already exists in group' });
        return;
      }

      // For now, create a temporary userId (in real app, user should exist)
      // In production, you'd search for user by email first
      const tempUserId = new (require('mongoose').Types.ObjectId)();

      group.members.push({
        userId: tempUserId,
        name,
        email,
        role: 'member',
        joinedAt: new Date(),
        isActive: true,
      });

      await group.save();

      res.json({
        message: 'Member added successfully',
        group,
      });
    } catch (error: any) {
      console.error('Add member error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

// Remove member from group
router.delete('/:id/members/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const group = await Group.findOne({
      _id: req.params.id,
      adminIds: req.userId,
    });

    if (!group) {
      res.status(403).json({ error: 'Only admins can remove members' });
      return;
    }

    // Can't remove creator
    if (group.createdBy.toString() === req.params.userId) {
      res.status(400).json({ error: 'Cannot remove group creator' });
      return;
    }

    // Mark member as inactive instead of removing
    const member = group.members.find((m) => m.userId.toString() === req.params.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    member.isActive = false;
    await group.save();

    res.json({
      message: 'Member removed successfully',
      group,
    });
  } catch (error: any) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;

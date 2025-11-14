import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { Settlement } from '../models/Settlement';
import { Group } from '../models/Group';
import {
  exportExpensesToCSV,
  exportSettlementsToCSV,
  exportBalancesToCSV,
  generateExpenseReportPDF,
  generateSettlementReportPDF,
} from '../services/export';

const router = express.Router();

/**
 * GET /api/export/expenses/:groupId/csv
 * Export expenses to CSV
 */
router.get(
  '/expenses/:groupId/csv',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      // Verify user is member of group
      const group = await Group.findById(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      const isMember = group.members.some(
        (m) => m.userId.toString() === req.userId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this group' });
        return;
      }

      // Get expenses
      const expenses = await Expense.find({ groupId }).populate(
        'paidBy',
        'name'
      );

      // Generate CSV
      const csv = exportExpensesToCSV(expenses as any, group.name);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${group.name}-expenses.csv"`
      );
      res.send(csv);
    } catch (error) {
      console.error('Export expenses to CSV error:', error);
      res.status(500).json({ error: 'Failed to export expenses' });
    }
  }
);

/**
 * GET /api/export/settlements/:groupId/csv
 * Export settlements to CSV
 */
router.get(
  '/settlements/:groupId/csv',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const group = await Group.findById(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      const isMember = group.members.some(
        (m) => m.userId.toString() === req.userId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this group' });
        return;
      }

      const settlements = await Settlement.find({ groupId })
        .populate('fromUserId', 'name')
        .populate('toUserId', 'name');

      const csv = exportSettlementsToCSV(settlements as any);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${group.name}-settlements.csv"`
      );
      res.send(csv);
    } catch (error) {
      console.error('Export settlements to CSV error:', error);
      res.status(500).json({ error: 'Failed to export settlements' });
    }
  }
);

/**
 * GET /api/export/report/:groupId/pdf
 * Generate PDF report
 */
router.get(
  '/report/:groupId/pdf',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const group = await Group.findById(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      const isMember = group.members.some(
        (m) => m.userId.toString() === req.userId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this group' });
        return;
      }

      // Get expenses
      const expenses = await Expense.find({ groupId }).populate(
        'paidBy',
        'name'
      );

      // Calculate balances (simplified)
      const balances = group.members.map((member) => ({
        userName: member.name,
        netAmount: 0, // Would need to calculate from expenses
        currency: group.baseCurrency,
      }));

      // Generate PDF
      generateExpenseReportPDF(res, group.name, expenses as any, balances);
    } catch (error) {
      console.error('Generate PDF report error:', error);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
);

/**
 * GET /api/export/settlements/:groupId/pdf
 * Generate settlements PDF report
 */
router.get(
  '/settlements/:groupId/pdf',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;

      const group = await Group.findById(groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }

      const isMember = group.members.some(
        (m) => m.userId.toString() === req.userId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this group' });
        return;
      }

      const settlements = await Settlement.find({ groupId })
        .populate('fromUserId', 'name')
        .populate('toUserId', 'name');

      generateSettlementReportPDF(res, group.name, settlements as any);
    } catch (error) {
      console.error('Generate settlements PDF error:', error);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
);

export default router;

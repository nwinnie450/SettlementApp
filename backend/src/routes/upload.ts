import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  uploadPhotoFromBase64,
  isCloudinaryConfigured,
} from '../services/cloudinary';

const router = express.Router();

/**
 * POST /api/upload/photo
 * Upload a photo (base64 encoded)
 */
router.post(
  '/photo',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!isCloudinaryConfigured()) {
        res.status(503).json({
          error: 'Photo upload service is not configured',
        });
        return;
      }

      const { photo, folder } = req.body;

      if (!photo) {
        res.status(400).json({ error: 'Photo data is required' });
        return;
      }

      // Validate base64 format
      if (!photo.startsWith('data:image/')) {
        res.status(400).json({
          error: 'Invalid photo format. Must be a base64 encoded image',
        });
        return;
      }

      // Upload to Cloudinary
      const result = await uploadPhotoFromBase64(photo, folder);

      res.json({
        message: 'Photo uploaded successfully',
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({
        error: 'Failed to upload photo',
      });
    }
  }
);

export default router;

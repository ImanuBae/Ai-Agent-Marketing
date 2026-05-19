import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { excelUpload } from '../middlewares/upload.middleware';
import {
  getOverview,
  uploadSalesReport,
  getSalesReports,
  analyzeCampaignHandler,
  getSampleFile,
} from '../controllers/analytics.controller';

const router = Router();

router.get('/overview', authenticate, getOverview);

// Campaign analysis routes
router.post('/sales-report', authenticate, excelUpload.single('file'), uploadSalesReport);
router.get('/sales-reports', authenticate, getSalesReports);
router.post('/analyze-campaign', authenticate, analyzeCampaignHandler);
router.get('/sample-file', getSampleFile);

export default router;

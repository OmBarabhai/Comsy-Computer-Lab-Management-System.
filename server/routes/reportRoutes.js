import express from 'express';
import { authenticate, checkPermission } from '../middleware/authMiddleware.js';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../controllers/reportController.js';

const router = express.Router();
router.use(authenticate);

router.get('/usage', authenticate, async (req, res) => {
    try {
        const report = await BookingRepository.getUsageReport();
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate daily report (Admin)
router.post('/daily', checkPermission('view_analytics'), async (req, res) => {
  try {
    const report = await generateDailyReport();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate weekly report (Admin)
router.post('/weekly', checkPermission('view_analytics'), async (req, res) => {
  try {
    const report = await generateWeeklyReport();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate monthly report (Admin)
router.post('/monthly', checkPermission('view_analytics'), async (req, res) => {
  try {
    const report = await generateMonthlyReport();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch reports (Admin)
router.get('/', checkPermission('view_analytics'), async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
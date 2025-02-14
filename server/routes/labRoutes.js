import express from 'express';
import Lab from '../models/Lab.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Book a lab (Staff only)
router.post('/', authenticate, authorize(['staff']), async (req, res) => {
    const { labName, startTime, endTime } = req.body;

    try {
        const lab = new Lab({
            name: labName,
            bookedBy: req.user._id,
            startTime,
            endTime,
        });
        await lab.save();

        res.status(201).json({ message: 'Lab booked successfully', lab });
    } catch (error) {
        res.status(500).json({ message: 'Error booking lab', error });
    }
});

// Get all labs (Admin/Staff)
router.get('/', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const labs = await Lab.find().populate('bookedBy', 'username');
        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching labs', error });
    }
});

// Get attendance for a lab session (Staff/Admin)
router.get('/:labId/attendance', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    const { labId } = req.params;

    try {
        const attendance = await Attendance.find({ lab: labId }).populate('user', 'username');
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error });
    }
});

// Export attendance as PDF/Excel (Staff/Admin)
router.get('/:labId/attendance/export', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    const { labId } = req.params;
    const { format } = req.query; // 'pdf' or 'excel'

    try {
        const attendance = await Attendance.find({ lab: labId }).populate('user', 'username');
        
        if (format === 'pdf') {
            // Generate PDF using a library like pdfkit
            const pdf = generatePDF(attendance);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');
            pdf.pipe(res);
            pdf.end();
        } else if (format === 'excel') {
            // Generate Excel using a library like exceljs
            const workbook = generateExcel(attendance);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } else {
            res.status(400).json({ message: 'Invalid export format' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error exporting attendance', error });
    }
});

export default router;
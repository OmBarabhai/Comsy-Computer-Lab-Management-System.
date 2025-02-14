import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Generate PDF
export const generatePDF = (attendance) => {
    const doc = new PDFDocument();
    doc.fontSize(14).text('Attendance Report', { align: 'center' });
    doc.moveDown();

    attendance.forEach((record) => {
        doc.text(`User: ${record.user.username}, Status: ${record.status}`);
    });

    return doc;
};

// Generate Excel
export const generateExcel = async (attendance) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
        { header: 'User', key: 'user', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
    ];

    attendance.forEach((record) => {
        worksheet.addRow({ user: record.user.username, status: record.status });
    });

    return workbook;
};
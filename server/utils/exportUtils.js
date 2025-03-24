import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Generate Excel file
export const generateExcel = async (bookings) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add headers
    worksheet.columns = [
        { header: 'Booking ID', key: '_id', width: 20 },
        { header: 'Computer', key: 'computer', width: 20 },
        { header: 'User', key: 'user', width: 20 },
        { header: 'Start Time', key: 'startTime', width: 20 },
        { header: 'End Time', key: 'endTime', width: 20 },
        { header: 'Purpose', key: 'purpose', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
    ];

    // Add rows
    bookings.forEach(booking => {
        worksheet.addRow({
            _id: booking._id,
            computer: booking.computer?.name || 'N/A',
            user: booking.user?.username || 'Unknown',
            startTime: new Date(booking.startTime).toLocaleString(),
            endTime: new Date(booking.endTime).toLocaleString(),
            purpose: booking.purpose,
            status: booking.status
        });
    });

    // Save the file
    const filePath = path.join(__dirname, '../exports/attendance.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
};

// Generate PDF file
export const generatePDF = async (bookings) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add content
    let y = height - 50;
    page.drawText('Attendance Report', { x: 50, y, size: 24, font, color: rgb(0, 0, 0) });
    y -= 30;

    bookings.forEach(booking => {
        const text = `
            Booking ID: ${booking._id}
            Computer: ${booking.computer?.name || 'N/A'}
            User: ${booking.user?.username || 'Unknown'}
            Start Time: ${new Date(booking.startTime).toLocaleString()}
            End Time: ${new Date(booking.endTime).toLocaleString()}
            Purpose: ${booking.purpose}
            Status: ${booking.status}
        `;
        page.drawText(text, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
        y -= 80;
    });

    // Save the file
    const filePath = path.join(__dirname, '../exports/attendance.pdf');
    fs.writeFileSync(filePath, await pdfDoc.save());

    return filePath;
};
import Report from '../models/Report.js';
import Booking from '../models/Booking.js';
import Issue from '../models/Issue.js';
import Attendance from '../models/Attendance.js';

// Generate daily report
export const generateDailyReport = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalBookings = await Booking.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const totalIssues = await Issue.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const totalAttendance = await Attendance.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const report = new Report({
    type: 'daily',
    date: startOfDay,
    totalBookings,
    totalIssues,
    totalAttendance,
  });

  await report.save();
  return report;
};

// Generate weekly report
export const generateWeeklyReport = async () => {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date();
  endOfWeek.setHours(23, 59, 59, 999);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

  const totalBookings = await Booking.countDocuments({
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const totalIssues = await Issue.countDocuments({
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const totalAttendance = await Attendance.countDocuments({
    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const report = new Report({
    type: 'weekly',
    date: startOfWeek,
    totalBookings,
    totalIssues,
    totalAttendance,
  });

  await report.save();
  return report;
};

// Generate monthly report
export const generateMonthlyReport = async () => {
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);

  const totalBookings = await Booking.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const totalIssues = await Issue.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const totalAttendance = await Attendance.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const report = new Report({
    type: 'monthly',
    date: startOfMonth,
    totalBookings,
    totalIssues,
    totalAttendance,
  });

  await report.save();
  return report;
};
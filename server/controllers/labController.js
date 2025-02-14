import Lab from '../models/Lab.js';
import Attendance from '../models/Attendance.js';

export const trackAttendance = async (labId) => {
    const lab = await Lab.findById(labId).populate('computers');
    const users = lab.computers.map(computer => computer.user);

    users.forEach(async (user) => {
        const attendance = new Attendance({
            user,
            lab: labId,
            status: 'present',
        });
        await attendance.save();
    });
};
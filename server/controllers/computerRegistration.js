import Computer from '../models/Computer.js';
import Specs from '../models/Specs.js';

// Register a new computer via LAN
export const registerComputer = async (req, res) => {
  const { name, cpu, ram, storage, network, devices, ipAddress } = req.body;

  try {
    // Save computer specs
    const specs = new Specs({ cpu, ram, storage, network, devices });
    await specs.save();

    // Save computer details
    const computer = new Computer({ name, specs: specs._id, ipAddress });
    await computer.save();

    res.status(201).json({ message: 'Registration request sent to admin', computer });
  } catch (error) {
    res.status(500).json({ message: 'Error registering computer', error });
  }
};

// Approve computer registration (Admin only)
export const approveComputer = async (req, res) => {
  const { computerId, labName } = req.body;

  try {
    const computer = await Computer.findById(computerId);
    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    computer.lab = labName;
    await computer.save();

    res.status(200).json({ message: 'Computer approved and added to lab', computer });
  } catch (error) {
    res.status(500).json({ message: 'Error approving computer', error });
  }
};
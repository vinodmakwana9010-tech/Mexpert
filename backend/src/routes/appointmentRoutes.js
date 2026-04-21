const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date, and time are required" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
      status: "booked",
    });

    return res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const match =
      req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };

    const appointments = await Appointment.find(match)
      .populate("doctor", "name specialty role")
      .populate("patient", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const canDelete =
      appointment.patient.toString() === req.user.id || appointment.doctor.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: "Not allowed to cancel this appointment" });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

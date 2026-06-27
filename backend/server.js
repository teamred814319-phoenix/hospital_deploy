const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load Environment Variables before importing config modules.
dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const path = require("path");
const createAdmin = require("./utils/createAdmin");
const adminRoutes = require("./routes/adminRoutes");
const doctorDashboardRoutes =require("./routes/doctorDashboardRoutes");
const profileRoutes =require("./routes/profileRoutes");
const otpRoutes =require("./routes/otpRoutes");
const documentRoutes =require("./routes/documentRoutes");
const adminDoctorRoutes =require("./routes/adminDoctorRoutes");
const patientDocumentRoutes = require("./routes/patientDocumentRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://visionary-chaja-262ed3.netlify.app"
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use(
    "/api/doctor",
    doctorDashboardRoutes
);
app.use(
  "/api/admin",
  adminDoctorRoutes
);
app.use(
  "/api/documents",
  documentRoutes
);
app.use(
  "/api/profile",
  profileRoutes
);
app.use(
 "/api/patient-documents",
 patientDocumentRoutes
);
// Test Route
app.get("/", (req, res) => {
    res.send("Hospital Appointment API Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await connectDB();

        await createAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error(error);

    }
};

startServer();
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
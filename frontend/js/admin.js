/* ==========================
   ADMIN LOGIN
========================== */

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;
        const submitBtn = adminLoginForm.querySelector('button[type="submit"]');

        if (!validateEmail(email)) {
            showAlert("Please enter a valid email", "warning");
            return;
        }
        if (!password) {
            showAlert("Please enter password", "warning");
            return;
        }

        setButtonLoading(submitBtn, true, "Logging in...");

        try {
            const data = await apiCall("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            if (data.user.role !== "admin") {
                throw new Error("Only admins can access this portal");
            }

            setAuthData(data.token, data.user);
            showAlert("Login successful!", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            showAlert(error.message || "Login failed", "error");
        } finally {
            setButtonLoading(submitBtn, false, "Login");
        }
    });
}

/* ==========================
   LOAD ADMIN STATS
========================== */

async function loadAdminStats() {
    const totalDoctorsEl = document.getElementById("totalDoctors");
    if (!totalDoctorsEl) return;

    try {
        const data = await apiCall("/admin/stats", { method: "GET" });

        document.getElementById("totalDoctors").innerText = data.totalDoctors || 0;
        document.getElementById("totalPatients").innerText = data.totalPatients || 0;
        document.getElementById("totalAppointments").innerText = data.totalAppointments || 0;
        document.getElementById("pendingDoctors").innerText = data.pendingDoctors || 0;
        document.getElementById("approvedDoctors").innerText = data.approvedDoctors || 0;
    } catch (error) {
        console.error("Failed to load stats:", error);
    }
}

/* ==========================
   LOAD DOCTORS
========================== */

let allDoctors = [];

async function loadDoctorsAdmin() {
    const doctorList = document.getElementById("doctorList");
    if (!doctorList) return;

    try {
        const doctors = await apiCall("/doctors", { method: "GET" });
        allDoctors = doctors;
        renderDoctors(doctors);
    } catch (error) {
        console.error("Failed to load doctors:", error);
        doctorList.innerHTML = "<p style='color: red;'>Error loading doctors</p>";
    }
}

function renderDoctors(doctors) {
    const doctorList = document.getElementById("doctorList");
    if (!doctorList) return;

    doctorList.innerHTML = "";

    if (doctors.length === 0) {
        doctorList.innerHTML = "<p style='text-align: center; color: rgba(255,255,255,0.6);'>No doctors found</p>";
        return;
    }

    doctors.forEach((doctor) => {
        const statusColor = doctor.verificationStatus === "Approved" ? "approved-status" :
                          doctor.verificationStatus === "Rejected" ? "rejected-status" : "pending-status";

        doctorList.innerHTML += `
            <div class="appointment-item">
                <div>
                    <h3>${doctor.doctorName}</h3>
                    <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                    <p><strong>Hospital:</strong> ${doctor.hospitalName}</p>
                    <p><strong class="${statusColor}">Status: ${doctor.verificationStatus}</strong></p>
                    <p><strong>Experience:</strong> ${doctor.experience} years</p>
                    <p><strong>Fee:</strong> ₹${doctor.consultationFee}</p>
                </div>
                <div class="admin-actions">
                    ${doctor.verificationStatus === "Pending" ? `
                        <button type="button" onclick="approveDoctor('${doctor._id}', this)" class="btn doctor-btn">Approve</button>
                        <button type="button" onclick="rejectDoctor('${doctor._id}', this)" class="btn patient-btn">Reject</button>
                    ` : ""}
                    <button type="button" onclick="deleteDoctor('${doctor._id}', this)" class="btn">Delete</button>
                </div>
            </div>
        `;
    });
}

/* ==========================
   DOCTOR SEARCH
========================== */

const doctorSearch = document.getElementById("doctorSearch");

if (doctorSearch) {
    doctorSearch.addEventListener("keyup", () => {
        const value = doctorSearch.value.toLowerCase();
        const filtered = allDoctors.filter(
            (doctor) =>
                doctor.doctorName.toLowerCase().includes(value) ||
                doctor.specialization.toLowerCase().includes(value) ||
                doctor.hospitalName.toLowerCase().includes(value)
        );
        renderDoctors(filtered);
    });
}

/* ==========================
   ADD DOCTOR (ADMIN)
========================== */

const doctorForm = document.getElementById("doctorForm");

if (doctorForm) {
    doctorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const doctorName = document.getElementById("doctorName").value.trim();
        const specialization = document.getElementById("specialization").value.trim();
        const experience = document.getElementById("experience").value;
        const consultationFee = document.getElementById("consultationFee").value;
        const availableTime = document.getElementById("availableTime").value.trim();

        if (!doctorName || !specialization || !experience || !consultationFee || !availableTime) {
            showAlert("Please fill all fields", "warning");
            return;
        }

        const submitBtn = doctorForm.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true, "Adding...");

        try {
            const data = await apiCall("/doctors", {
                method: "POST",
                body: JSON.stringify({
                    doctorName,
                    specialization,
                    experience: parseInt(experience),
                    consultationFee: parseFloat(consultationFee),
                    availableDays: ["Monday", "Wednesday", "Friday"],
                    availableTime,
                    hospitalName: "General Hospital",
                    medicalLicenseNumber: "LIC-" + Date.now(),
                    aadhaarNumber: "123456789012"
                })
            });

            showAlert("Doctor added successfully!", "success");
            doctorForm.reset();
            await loadDoctorsAdmin();
            await loadAdminStats();
        } catch (error) {
            showAlert(error.message || "Failed to add doctor", "error");
        } finally {
            setButtonLoading(submitBtn, false, "Add Doctor");
        }
    });
}

/* ==========================
   APPROVE DOCTOR
========================== */

async function approveDoctor(doctorId, button) {
    if (!confirm("Are you sure you want to approve this doctor?")) return;

    setButtonLoading(button, true, "Approving...");

    try {
        const data = await apiCall(`/admin/approve-doctor/${doctorId}`, {
            method: "PUT"
        });

        showAlert("Doctor approved!", "success");
        await loadDoctorsAdmin();
        await loadAdminStats();
    } catch (error) {
        showAlert(error.message || "Failed to approve doctor", "error");
    } finally {
        setButtonLoading(button, false, "Approve");
    }
}

/* ==========================
   REJECT DOCTOR
========================== */

async function rejectDoctor(doctorId, button) {
    if (!confirm("Are you sure you want to reject this doctor?")) return;

    setButtonLoading(button, true, "Rejecting...");

    try {
        const data = await apiCall(`/admin/reject-doctor/${doctorId}`, {
            method: "PUT"
        });

        showAlert("Doctor rejected!", "success");
        await loadDoctorsAdmin();
        await loadAdminStats();
    } catch (error) {
        showAlert(error.message || "Failed to reject doctor", "error");
    } finally {
        setButtonLoading(button, false, "Reject");
    }
}

/* ==========================
   DELETE DOCTOR
========================== */

async function deleteDoctor(doctorId, button) {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    setButtonLoading(button, true, "Deleting...");

    try {
        const data = await apiCall(`/doctors/${doctorId}`, {
            method: "DELETE"
        });

        showAlert("Doctor deleted!", "success");
        await loadDoctorsAdmin();
        await loadAdminStats();
    } catch (error) {
        showAlert(error.message || "Failed to delete doctor", "error");
    } finally {
        setButtonLoading(button, false, "Delete");
    }
}

/* ==========================
   ADMIN LOGOUT
========================== */

const adminLogoutBtn = document.getElementById("adminLogoutBtn");

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            clearAuthData();
            window.location.href = "../index.html";
        }
    });
}

/* ==========================
   AUTO LOAD
========================== */

if (document.getElementById("totalDoctors")) {
    loadAdminStats();
    loadDoctorsAdmin();

    // Refresh every 60 seconds
    setInterval(() => {
        loadAdminStats();
        loadDoctorsAdmin();
    }, 60000);
}

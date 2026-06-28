/* ==========================
   REGISTER
========================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        // Validation
        if (!name) {
            showAlert("Please enter your name", "warning");
            return;
        }
        if (!validateEmail(email)) {
            showAlert("Please enter a valid email", "warning");
            return;
        }
        if (!validatePassword(password)) {
            showAlert("Password must be at least 6 characters", "warning");
            return;
        }

        setButtonLoading(submitBtn, true, "Registering...");

        try {
            const data = await apiCall("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password, role: "patient" })
            });

            showAlert("Registration successful! Please login.", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (error) {
            showAlert(error.message || "Registration failed. Please try again.", "error");
        } finally {
            setButtonLoading(submitBtn, false, "Register");
        }
    });
}

/* ==========================
   LOGIN
========================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Validation
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

            setAuthData(data.token, data.user);
            showAlert("Login successful!", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            showAlert(error.message || "Login failed. Please try again.", "error");
        } finally {
            setButtonLoading(submitBtn, false, "Login");
        }
    });
}

/* ==================================
   PATIENT DASHBOARD
================================== */

async function loadPatientProfile() {
    const patientNameEl = document.getElementById("patientName");
    if (!patientNameEl) return;

    try {
        const data = await apiCall("/profile/patient", { method: "GET" });

        document.getElementById("patientName").innerText = data.name || "N/A";
        document.getElementById("patientEmail").innerText = data.email || "N/A";
        document.getElementById("totalAppointments").innerText = data.totalAppointments || 0;

        const patientPhotoElement = document.getElementById("patientPhoto");
        if (patientPhotoElement) {
            setImageSrc(patientPhotoElement, data.profilePhoto, DEFAULT_USER_PHOTO);
        }
    } catch (error) {
        console.error("Failed to load profile:", error);
        document.getElementById("patientName").innerText = "Error loading profile";
    }
}

/* ==========================
   LOAD DOCTORS
========================== */

async function loadDoctors() {
    const doctorSelect = document.getElementById("doctorSelect");
    if (!doctorSelect) return;

    try {
        const doctors = await apiCall("/doctors", { method: "GET" });

        doctorSelect.innerHTML = '<option value="">-- Select a Doctor --</option>';

        doctors.forEach((doctor) => {
            if (doctor.verificationStatus === "Approved") {
                doctorSelect.innerHTML += `
                    <option value="${doctor._id}">
                        ${doctor.doctorName} - ${doctor.specialization} (₹${doctor.consultationFee})
                    </option>
                `;
            }
        });
    } catch (error) {
        console.error("Failed to load doctors:", error);
        doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
    }
}

/* ==========================
   LOAD APPOINTMENTS
========================== */

async function loadAppointments() {
    const appointmentsList = document.getElementById("appointmentsList");
    if (!appointmentsList) return;

    try {
        const appointments = await apiCall("/appointments", { method: "GET" });
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

        const filteredAppointments = appointments.filter(
            (appointment) =>
                appointment.patientId?._id === currentUser._id ||
                appointment.patientId === currentUser._id
        );

        appointmentsList.innerHTML = "";

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = "<p style='text-align: center; color: rgba(255,255,255,0.6);'>No appointments booked yet</p>";
            return;
        }

        filteredAppointments.forEach((appointment) => {
            const doctorPhoto = appointment.doctorId?.profilePhoto
                ? getFileUrl(appointment.doctorId.profilePhoto)
                : "../assets/default-doctor.png";

            const statusClass = `status-${appointment.status.toLowerCase()}`;
            const canCancel = appointment.status === "Pending" || appointment.status === "Approved";

            appointmentsList.innerHTML += `
                <div class="appointment-item">
                    <img src="${doctorPhoto}" class="doctor-small-photo" onerror="this.src='../assets/default-doctor.png'">
                    <div style="flex: 1;">
                        <p><strong>Doctor:</strong> ${appointment.doctorId?.doctorName || "Unknown"}</p>
                        <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
                        <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                        <p><strong class="${statusClass}">Status: ${appointment.status}</strong></p>
                    </div>
                    ${canCancel ? `<button type="button" onclick="cancelAppointment('${appointment._id}', this)" class="btn patient-btn" style="margin-top: 10px;">Cancel</button>` : ""}
                </div>
            `;
        });
    } catch (error) {
        console.error("Failed to load appointments:", error);
        appointmentsList.innerHTML = "<p style='color: red;'>Error loading appointments</p>";
    }
}

/* ==========================
   BOOK APPOINTMENT
========================== */

const bookBtn = document.getElementById("bookBtn");

if (bookBtn) {
    bookBtn.addEventListener("click", async () => {
        const doctorSelect = document.getElementById("doctorSelect");
        const appointmentDate = document.getElementById("appointmentDate");
        const appointmentTime = document.getElementById("appointmentTime");

        if (!doctorSelect.value) {
            showAlert("Please select a doctor", "warning");
            return;
        }
        if (!appointmentDate.value) {
            showAlert("Please select appointment date", "warning");
            return;
        }
        if (!appointmentTime.value) {
            showAlert("Please enter appointment time", "warning");
            return;
        }

        setButtonLoading(bookBtn, true, "Booking appointment...");

        try {
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const data = await apiCall("/appointments", {
                method: "POST",
                body: JSON.stringify({
                    patientId: currentUser._id,
                    doctorId: doctorSelect.value,
                    appointmentDate: appointmentDate.value,
                    appointmentTime: appointmentTime.value
                })
            });

            showAlert("Appointment booked successfully!", "success");
            doctorSelect.value = "";
            appointmentDate.value = "";
            appointmentTime.value = "";
            await loadAppointments();
        } catch (error) {
            showAlert(error.message || "Failed to book appointment", "error");
        } finally {
            setButtonLoading(bookBtn, false, "Book Appointment");
        }
    });
}

/* ==========================
   CANCEL APPOINTMENT
========================== */

async function cancelAppointment(appointmentId, button) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setButtonLoading(button, true, "Cancelling...");

    try {
        const data = await apiCall(`/appointments/${appointmentId}`, {
            method: "DELETE"
        });

        showAlert("Appointment cancelled", "success");
        await loadAppointments();
    } catch (error) {
        showAlert(error.message || "Failed to cancel appointment", "error");
    } finally {
        setButtonLoading(button, false, "Cancel");
    }
}

/* ==========================
   UPLOAD DOCUMENTS
========================== */

const uploadDocumentsBtn = document.getElementById("uploadDocumentsBtn");

if (uploadDocumentsBtn) {
    uploadDocumentsBtn.addEventListener("click", async () => {
        const profilePhotoFile = document.getElementById("profilePhotoFile");
        const aadhaarFile = document.getElementById("aadhaarFile");

        const profilePhoto = profilePhotoFile?.files[0];
        const aadhaarDocument = aadhaarFile?.files[0];

        if (!profilePhoto && !aadhaarDocument) {
            showAlert("Please select at least one file to upload", "warning");
            return;
        }

        if (profilePhoto && !validateFileSize(profilePhoto)) {
            showAlert("Profile photo must be less than 5MB", "warning");
            return;
        }

        if (aadhaarDocument && !validateFileSize(aadhaarDocument)) {
            showAlert("Aadhaar document must be less than 5MB", "warning");
            return;
        }

        const formData = new FormData();
        if (profilePhoto) formData.append("profilePhoto", profilePhoto);
        if (aadhaarDocument) formData.append("aadhaarDocument", aadhaarDocument);

        setButtonLoading(uploadDocumentsBtn, true, "Uploading...");

        try {
            const response = await fetch(`${API_BASE}/patient-documents/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            showAlert("Documents uploaded successfully!", "success");
            profilePhotoFile.value = "";
            aadhaarFile.value = "";

            // Preview aadhaar
            const aadhaarPreview = document.getElementById("aadhaarPreview");
            if (aadhaarPreview && aadhaarDocument) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    aadhaarPreview.src = e.target.result;
                    aadhaarPreview.style.display = "block";
                };
                reader.readAsDataURL(aadhaarDocument);
            }

            await loadPatientProfile();
        } catch (error) {
            showAlert(error.message || "Document upload failed", "error");
        } finally {
            setButtonLoading(uploadDocumentsBtn, false, "Upload Documents");
        }
    });
}

/* ==========================
   LOGOUT
========================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            clearAuthData();
            window.location.href = "../index.html";
        }
    });
}

/* ==========================
   AUTO LOAD
========================== */

if (document.getElementById("patientName")) {
    loadPatientProfile();
    loadDoctors();
    loadAppointments();

    // Refresh every 30 seconds
    setInterval(() => {
        loadAppointments();
    }, 30000);
}

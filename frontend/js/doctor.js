/* ==========================
   DOCTOR REGISTER
========================== */

const doctorRegisterForm = document.getElementById("doctorRegisterForm");

if (doctorRegisterForm) {
    doctorRegisterForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const doctorName = document.getElementById("doctorName").value.trim();
        const specialization = document.getElementById("specialization").value.trim();
        const experience = document.getElementById("experience").value;
        const consultationFee = document.getElementById("consultationFee").value;
        const hospitalName = document.getElementById("hospitalName").value.trim();
        const medicalLicenseNumber = document.getElementById("medicalLicenseNumber").value.trim();
        const aadhaarNumber = document.getElementById("aadhaarNumber").value.trim();
        const availableDays = document.getElementById("availableDays").value.trim().split(",");
        const availableTime = document.getElementById("availableTime").value.trim();

        const registerButton = doctorRegisterForm.querySelector('button[type="submit"]');

        // Validation
        if (!name || !email || !password || !doctorName || !specialization) {
            showAlert("Please fill all required fields", "warning");
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
        if (!validateAadhaar(aadhaarNumber)) {
            showAlert("Aadhaar must be 12 digits", "warning");
            return;
        }

        setButtonLoading(registerButton, true, "Registering...");

        try {
            const data = await apiCall("/doctors/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    doctorName,
                    specialization,
                    experience: parseInt(experience),
                    consultationFee: parseFloat(consultationFee),
                    hospitalName,
                    medicalLicenseNumber,
                    aadhaarNumber,
                    availableDays: availableDays.map(d => d.trim()),
                    availableTime
                })
            });

            localStorage.setItem("doctorEmail", email);
            showAlert("Registration successful! Proceeding to document upload.", "success");
            setTimeout(() => {
                window.location.href = "documents.html";
            }, 1500);
        } catch (error) {
            showAlert(error.message || "Registration failed", "error");
        } finally {
            setButtonLoading(registerButton, false, "Register");
        }
    });
}

/* ==========================
   DOCTOR DOCUMENT UPLOAD
========================== */

const uploadDoctorDocumentsBtn = document.getElementById("uploadDoctorDocumentsBtn");

if (uploadDoctorDocumentsBtn) {
    uploadDoctorDocumentsBtn.addEventListener("click", async () => {
        const profilePhoto = document.getElementById("profilePhoto")?.files[0];
        const aadhaarDocument = document.getElementById("aadhaarDocument")?.files[0];
        const licenseDocument = document.getElementById("licenseDocument")?.files[0];
        const degreeDocument = document.getElementById("degreeDocument")?.files[0];

        if (!profilePhoto || !aadhaarDocument || !licenseDocument || !degreeDocument) {
            showAlert("Please upload all required documents", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("profilePhoto", profilePhoto);
        formData.append("aadhaarDocument", aadhaarDocument);
        formData.append("licenseDocument", licenseDocument);
        formData.append("degreeDocument", degreeDocument);

        setButtonLoading(uploadDoctorDocumentsBtn, true, "Uploading documents...");

        try {
            const response = await fetch(`${API_BASE}/documents/upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            showAlert("Documents uploaded! Proceeding to OTP verification.", "success");
            const doctorEmail = localStorage.getItem("doctorEmail");
            localStorage.setItem("doctorEmail", doctorEmail);
            setTimeout(() => {
                window.location.href = "otp.html";
            }, 1500);
        } catch (error) {
            showAlert(error.message || "Document upload failed", "error");
        } finally {
            setButtonLoading(uploadDoctorDocumentsBtn, false, "Upload Documents");
        }
    });
}

/* ==========================
   DOCTOR OTP FLOW
========================== */

const doctorEmailOTP = document.getElementById("doctorEmail");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpInput = document.getElementById("otp");

if (doctorEmailOTP) {
    const doctorEmail = localStorage.getItem("doctorEmail");
    if (doctorEmail) {
        doctorEmailOTP.value = doctorEmail;
    } else {
        doctorEmailOTP.value = "No email stored";
    }
}

if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async () => {
        const email = doctorEmailOTP.value;

        if (!email || email === "No email stored") {
            showAlert("Please enter your email", "warning");
            return;
        }

        setButtonLoading(sendOtpBtn, true, "Sending OTP...");

        try {
            const data = await apiCall("/otp/send", {
                method: "POST",
                body: JSON.stringify({ email })
            });

            showAlert("OTP sent to your email", "success");
        } catch (error) {
            showAlert(error.message || "Failed to send OTP", "error");
        } finally {
            setButtonLoading(sendOtpBtn, false, "Send OTP");
        }
    });
}

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", async () => {
        const email = doctorEmailOTP.value;
        const otp = otpInput.value.trim();

        if (!otp) {
            showAlert("Please enter OTP", "warning");
            return;
        }

        setButtonLoading(verifyOtpBtn, true, "Verifying OTP...");

        try {
            const data = await apiCall("/otp/verify", {
                method: "POST",
                body: JSON.stringify({ email, otp })
            });

            showAlert("Email verified successfully! You can now login.", "success");
            localStorage.removeItem("doctorEmail");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (error) {
            showAlert(error.message || "OTP verification failed", "error");
        } finally {
            setButtonLoading(verifyOtpBtn, false, "Verify OTP");
        }
    });
}

/* ==========================
   DOCTOR LOGIN
========================== */

const doctorLoginForm = document.getElementById("doctorLoginForm");

if (doctorLoginForm) {
    doctorLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("doctorEmail").value.trim();
        const password = document.getElementById("doctorPassword").value;
        const submitBtn = doctorLoginForm.querySelector('button[type="submit"]');

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
            showAlert(error.message || "Login failed", "error");
        } finally {
            setButtonLoading(submitBtn, false, "Login");
        }
    });
}

/* ==========================
   DOCTOR DASHBOARD - LOAD PROFILE
========================== */

async function loadDoctorProfile() {
    const doctorPhotoEl = document.getElementById("doctorPhoto");
    if (!doctorPhotoEl) return;

    try {
        const data = await apiCall("/profile/doctor", { method: "GET" });

        document.getElementById("doctorName").innerText = data.doctorName || "N/A";
        document.getElementById("doctorEmail").innerText = data.userId?.email || "N/A";
        document.getElementById("doctorHospital").innerText = data.hospitalName || "N/A";

        const statusElement = document.getElementById("verificationStatus");
        if (statusElement) {
            statusElement.innerText = data.verificationStatus || "Pending";
            statusElement.className = `${data.verificationStatus?.toLowerCase()}-status`;
        }

        if (data.verificationStatus === "Rejected") {
            showAlert("Your account has been rejected. Please contact admin.", "error");
        }

        setImageSrc(doctorPhotoEl, data.profilePhoto, DEFAULT_DOCTOR_PHOTO);

        // Pre-fill form fields
        document.getElementById("consultationFee").value = data.consultationFee || "";
        document.getElementById("availableDays").value = (data.availableDays || []).join(", ");
        document.getElementById("availableTime").value = data.availableTime || "";
        document.getElementById("hospitalName").value = data.hospitalName || "";
    } catch (error) {
        console.error("Failed to load doctor profile:", error);
        document.getElementById("doctorName").innerText = "Error loading profile";
    }
}

/* ==========================
   LOAD DOCTOR APPOINTMENTS
========================== */

async function loadDoctorAppointments() {
    const doctorAppointments = document.getElementById("doctorAppointments");
    if (!doctorAppointments) return;

    try {
        const data = await apiCall("/doctor/appointments", { method: "GET" });
        const appointments = Array.isArray(data) ? data : data.appointments || [];

        updateStats(appointments);
        doctorAppointments.innerHTML = "";

        if (appointments.length === 0) {
            doctorAppointments.innerHTML = "<p style='text-align: center; color: rgba(255,255,255,0.6);'>No appointments yet</p>";
            return;
        }

        appointments.forEach((appointment) => {
            const patientPhoto = appointment.patientId?.profilePhoto
                ? getFileUrl(appointment.patientId.profilePhoto)
                : "../assets/default-user.png";

            const isActionable = appointment.status === "Pending";

            doctorAppointments.innerHTML += `
                <div class="appointment-item">
                    <img src="${patientPhoto}" class="doctor-small-photo" onerror="this.src='../assets/default-user.png'">
                    <div style="flex: 1;">
                        <p><strong>Patient:</strong> ${appointment.patientId?.name || "Unknown"}</p>
                        <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
                        <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                        <p><strong class="status-${appointment.status.toLowerCase()}">Status: ${appointment.status}</strong></p>
                    </div>
                    ${isActionable ? `
                        <div style="display: flex; gap: 10px;">
                            <button type="button" onclick="updateAppointmentStatus('${appointment._id}', 'Approved', this)" class="btn doctor-btn" style="width: 100px;">Approve</button>
                            <button type="button" onclick="updateAppointmentStatus('${appointment._id}', 'Rejected', this)" class="btn patient-btn" style="width: 100px;">Reject</button>
                        </div>
                    ` : ""}
                </div>
            `;
        });
    } catch (error) {
        console.error("Failed to load appointments:", error);
        const doctorAppointments = document.getElementById("doctorAppointments");
        if (doctorAppointments) {
            doctorAppointments.innerHTML = "<p style='color: red;'>Error loading appointments</p>";
        }
    }
}

function updateStats(appointments) {
    let pending = 0;
    let approved = 0;

    appointments.forEach((appointment) => {
        if (appointment.status === "Pending") pending++;
        if (appointment.status === "Approved") approved++;
    });

    const pendingEl = document.getElementById("pendingCount");
    const approvedEl = document.getElementById("approvedCount");

    if (pendingEl) pendingEl.innerText = pending;
    if (approvedEl) approvedEl.innerText = approved;
}

/* ==========================
   UPDATE APPOINTMENT STATUS
========================== */

async function updateAppointmentStatus(appointmentId, status, button) {
    if (button) setButtonLoading(button, true, `${status}ing...`);

    try {
        const data = await apiCall(`/doctor/appointment/${appointmentId}`, {
            method: "PUT",
            body: JSON.stringify({ status })
        });

        showAlert(`Appointment ${status.toLowerCase()}!`, "success");
        await loadDoctorAppointments();
    } catch (error) {
        showAlert(error.message || "Failed to update appointment", "error");
    } finally {
        if (button) setButtonLoading(button, false, status);
    }
}

/* ==========================
   UPDATE DOCTOR PROFILE
========================== */

const updateProfileBtn = document.getElementById("updateProfileBtn");

if (updateProfileBtn) {
    updateProfileBtn.addEventListener("click", async () => {
        const consultationFee = document.getElementById("consultationFee").value;
        const availableDays = document.getElementById("availableDays").value.split(",").map(d => d.trim());
        const availableTime = document.getElementById("availableTime").value;
        const hospitalName = document.getElementById("hospitalName").value;

        if (!consultationFee || !availableTime || !hospitalName) {
            showAlert("Please fill all fields", "warning");
            return;
        }

        setButtonLoading(updateProfileBtn, true, "Updating...");

        try {
            const data = await apiCall("/profile/doctor", {
                method: "PUT",
                body: JSON.stringify({
                    consultationFee: parseFloat(consultationFee),
                    availableDays,
                    availableTime,
                    hospitalName
                })
            });

            showAlert("Profile updated successfully!", "success");
        } catch (error) {
            showAlert(error.message || "Update failed", "error");
        } finally {
            setButtonLoading(updateProfileBtn, false, "Update Profile");
        }
    });
}

/* ==========================
   DOCTOR LOGOUT
========================== */

const doctorLogoutBtn = document.getElementById("doctorLogoutBtn");

if (doctorLogoutBtn) {
    doctorLogoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            clearAuthData();
            window.location.href = "../index.html";
        }
    });
}

/* ==========================
   AUTO LOAD
========================== */

if (document.getElementById("doctorPhoto")) {
    loadDoctorProfile();
    loadDoctorAppointments();

    // Refresh every 30 seconds
    setInterval(() => {
        loadDoctorAppointments();
    }, 30000);
}
).value.split(","),

availableTime:
document.getElementById(
"availableTime"
).value

})

}

);

const data =
            await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Registration failed."
            );
            return;
        }

        localStorage.setItem(
            "doctorEmail",
            document.getElementById(
                "email"
            ).value
        );

        window.location.href =
            "otp.html";
    } catch (error) {
        alert(
            "Registration failed. Please try again."
        );
    } finally {
        setButtonLoading(
            registerButton,
            false,
            "Register"
        );
    }
}

);

}
/* ==========================
   DOCTOR LOGIN
========================== */

const doctorLoginForm =
    document.getElementById(
        "doctorLoginForm"
    );

if (doctorLoginForm) {

    doctorLoginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById(
                    "doctorEmail"
                ).value;

            const password =
                document.getElementById(
                    "doctorPassword"
                ).value;

            const response =
                await fetch(
                    `${API_BASE}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

            const data =
                await response.json();

            if (response.ok) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

                window.location.href =
                    "dashboard.html";
            }

            else {

                alert(
                    data.message
                );
            }
        }
    );
}

/* ==========================
   DOCTOR PROFILE
========================== */

const doctorName =
    document.getElementById(
        "doctorName"
    );

const doctorEmail =
    document.getElementById(
        "doctorEmail"
    );

async function loadDoctorProfile() {

    if (!document.getElementById("doctorPhoto"))
        return;

    const response =
        await fetch(
            `${API_BASE}/profile/doctor`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const data =
        await response.json();

    document.getElementById(
        "doctorName"
    ).innerText =
        data.doctorName;

    document.getElementById(
        "doctorEmail"
    ).innerText =
        data.userId.email;

    document.getElementById(
        "doctorHospital"
    ).innerText =
        data.hospitalName;

    document.getElementById(
        "verificationStatus"
    ).innerText =
        data.verificationStatus;
        const statusElement =
document.getElementById(
"verificationStatus"
);

if(
data.verificationStatus ===
"Approved"
){

statusElement.className =
"approved-status";

}

if(
data.verificationStatus ===
"Pending"
){

statusElement.className =
"pending-status";

}

if(
data.verificationStatus ===
"Rejected"
){

statusElement.className =
"rejected-status";

}
        const status =
data.verificationStatus;

if(status === "Pending"){

alert(
"Your verification is pending admin approval."
);

}

if(status === "Rejected"){

alert(
"Your verification has been rejected."
);

}

    const doctorPhotoElement = document.getElementById(
        "doctorPhoto"
    );

    if (doctorPhotoElement) {
        setImageSrc(
            doctorPhotoElement,
            data.profilePhoto,
            DEFAULT_DOCTOR_PHOTO
        );
    }

    document.getElementById(
        "consultationFee"
    ).value =
        data.consultationFee;

    document.getElementById(
        "availableDays"
    ).value =
        data.availableDays.join(",");

    document.getElementById(
        "availableTime"
    ).value =
        data.availableTime;

    document.getElementById(
        "hospitalName"
    ).value =
        data.hospitalName;
}
/* ==========================
   LOAD DOCTOR APPOINTMENTS
========================== */

const doctorAppointments =
    document.getElementById(
        "doctorAppointments"
    );

async function loadDoctorAppointments() {

    if (!doctorAppointments) return;

    const response =
        await fetch(
            `${API_BASE}/doctor/appointments`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const dashboardData =
        await response.json();

    const appointments =
        Array.isArray(dashboardData)
            ? dashboardData
            : dashboardData.appointments || [];

    updateStats(
        appointments
    );

    doctorAppointments.innerHTML = "";

    appointments.forEach(
        (appointment) => {

            doctorAppointments.innerHTML +=
                `
                <div class="appointment-item">

                    <p>
                        Patient:
                        ${appointment.patientId?.name || "Unknown Patient"}
                    $
                    appointment.status === "Pending"
                    ?
                    `
                    <button type="button"
                    onclick="updateAppointmentStatus(
                    '${appointment._id}',
                    'Approved'
                    )
                    class="btn doctor-btn">
                    Approve
                    </button>
                    `
                        Time:
                        ${appointment.appointmentTime}
                    </p>

                    <p>
                        Status:
                        ${appointment.status}
                    </p>

                    <br>

                    ${
appointment.status === "Pending"
?
`
<button
onclick="updateAppointmentStatus(
'${appointment._id}',
'Approved'
)"
class="btn doctor-btn">
Approve
</button>
`
:
`
<span class="approved-badge">
Already Approved
</span>
`
}

                </div>
                `;
        }
    );
}
function updateStats(
    appointments
) {

    let pending = 0;

    let approved = 0;

    appointments.forEach(
        (appointment) => {

            if (
                appointment.status ===
                "Pending"
            )
                pending++;

            if (
                appointment.status ===
                "Approved"
            )
                approved++;

        }
    );

    const pendingEl =
        document.getElementById(
            "pendingCount"
        );

    const approvedEl =
        document.getElementById(
            "approvedCount"
        );

    if (pendingEl)
        pendingEl.innerText =
            pending;

    if (approvedEl)
        approvedEl.innerText =
            approved;
}

/* ==========================
   UPDATE STATUS
========================== */

async function updateAppointmentStatus(
    appointmentId,
    status
) {

    const response =
        await fetch(
            `${API_BASE}/doctor/appointment/${appointmentId}`,
            {
                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    status
                })
            }
        );

    const data =
        await response.json();

    alert(data.message);

    loadDoctorAppointments();
}
const updateProfileBtn =
document.getElementById(
"updateProfileBtn"
);

if(updateProfileBtn){

updateProfileBtn.addEventListener(
"click",

async()=>{

const response =
await fetch(

`${API_BASE}/profile/doctor`,

{
method:"PUT",

headers:{

"Content-Type":
"application/json",

Authorization:
`Bearer ${token}`
},

body:JSON.stringify({

consultationFee:
document.getElementById(
"consultationFee"
).value,

availableDays:
document.getElementById(
"availableDays"
).value
.split(","),

availableTime:
document.getElementById(
"availableTime"
).value,

hospitalName:
document.getElementById(
"hospitalName"
).value

})

}

);

const data =
await response.json();

alert(
data.message
);

loadDoctorProfile();

}

);

}
/* ==========================
   SEND OTP
========================== */

const doctorEmailInput =
document.getElementById(
"doctorEmail"
);

if (doctorEmailInput &&
    !doctorEmailInput.value) {
  doctorEmailInput.value =
    localStorage.getItem(
      "doctorEmail"
    ) || "";
}

const sendOtpBtn =
document.getElementById(
"sendOtpBtn"
);

if(sendOtpBtn){

sendOtpBtn.addEventListener(
"click",

async()=>{

const email =
  doctorEmailInput?.value ||
  localStorage.getItem(
    "doctorEmail"
  );

if (!email) {
  alert(
    "Doctor email missing. Please register first."
  );
  return;
}

const originalText =
        sendOtpBtn.innerText;

      setButtonLoading(
        sendOtpBtn,
        true,
        "Sending OTP..."
      );

      try {
        const response =
          await fetch(

            `${API_BASE}/otp/send`,

            {
              method:"POST",

              headers:{
                "Content-Type":
                  "application/json"
              },

              body:JSON.stringify({
                email
              })

            }

          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "OTP send failed."
          );
          return;
        }

        localStorage.setItem(
          "doctorEmail",
          email
        );

        sendOtpBtn.innerText =
          "OTP Sent";
        setTimeout(() => {
          setButtonLoading(
            sendOtpBtn,
            false,
            originalText
          );
        }, 1500);
      } catch (error) {
        alert(
          "Unable to send OTP. Please try again."
        );
      } finally {
        if (
          sendOtpBtn.disabled
        ) {
          setButtonLoading(
            sendOtpBtn,
            false,
            originalText
          );
        }
      }

    }

  );

}
/* ==========================
   VERIFY OTP
========================== */

const verifyOtpBtn =
document.getElementById(
"verifyOtpBtn"
);

if(verifyOtpBtn){

  verifyOtpBtn.addEventListener(
    "click",

    async()=>{

      const email =
        doctorEmailInput?.value ||
        localStorage.getItem(
          "doctorEmail"
        );

      if (!email) {
        alert(
          "Doctor email missing. Please register first."
        );
        return;
      }

            const otpValue =
        document.getElementById(
          "otp"
        ).value.trim();

      if (!otpValue) {
        alert(
          "Please enter the OTP."
        );
        return;
      }

      setButtonLoading(
        verifyOtpBtn,
        true,
        "Verifying..."
      );

      try {
        const response =
          await fetch(

            `${API_BASE}/otp/verify`,

            {
              method:"POST",

              headers:{
                "Content-Type":
                  "application/json"
              },

              body:JSON.stringify({

                email,

                otp: otpValue

              })

            }

          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Invalid OTP."
          );
          return;
        }

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        window.location.href =
          "documents.html";
      } catch (error) {
        alert(
          "OTP verification failed. Please try again."
        );
      } finally {
        setButtonLoading(
          verifyOtpBtn,
          false,
          "Verify OTP"
        );
      }

    }

  );

}
/* ==========================
   DOCTOR DOCUMENT UPLOAD
========================== */

const uploadDoctorDocumentsBtn =
document.getElementById(
"uploadDoctorDocumentsBtn"
);

if(uploadDoctorDocumentsBtn){

uploadDoctorDocumentsBtn.addEventListener(
"click",

async()=>{

const formData =
new FormData();

const profilePhoto =
document.getElementById(
"profilePhoto"
).files[0];

const aadhaarDocument =
document.getElementById(
"aadhaarDocument"
).files[0];

const licenseDocument =
document.getElementById(
"licenseDocument"
).files[0];

const degreeDocument =
document.getElementById(
"degreeDocument"
).files[0];

if(profilePhoto){

formData.append(
"profilePhoto",
profilePhoto
);

}

if(aadhaarDocument){

formData.append(
"aadhaarDocument",
aadhaarDocument
);

}

if(licenseDocument){

formData.append(
"licenseDocument",
licenseDocument
);

}

if(degreeDocument){

formData.append(
"degreeDocument",
degreeDocument
);

}

setButtonLoading(
        uploadDoctorDocumentsBtn,
        true,
        "Uploading..."
      );

      try {
        const response =
          await fetch(

            `${API_BASE}/documents/upload`,

            {
              method:"POST",

              headers:{
                Authorization:
                  `Bearer ${token}`
              },

              body:formData
            }

          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Upload failed."
          );
          return;
        }

        window.location.href =
          "login.html";
      } catch (error) {
        alert(
          "Upload failed. Please try again."
        );
      } finally {
        setButtonLoading(
          uploadDoctorDocumentsBtn,
          false,
          "Upload Documents"
        );
      }

}

);

}
/* ==========================
   DOCTOR LOGOUT
========================== */

const doctorLogoutBtn =
    document.getElementById(
        "doctorLogoutBtn"
    );

if (doctorLogoutBtn) {

    doctorLogoutBtn.addEventListener(
        "click",
        () => {

            localStorage.clear();

            window.location.href =
                "../index.html";
        }
    );
}

loadDoctorProfile();

loadDoctorAppointments();

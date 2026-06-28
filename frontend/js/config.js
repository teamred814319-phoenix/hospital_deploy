const API_BASE = "https://phoenix-backend-t9y4.onrender.com/api";
const token = localStorage.getItem("token");
const API_ORIGIN = API_BASE.replace("/api", "");
const DEFAULT_USER_PHOTO = "../assets/default-user.png";
const DEFAULT_DOCTOR_PHOTO = "../assets/default-doctor.png";
const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
const userRole = user?.role || null;

// ===== AUTH GUARDS =====
function requireAuth() {
    if (!token || !user) {
        alert("Please login first");
        window.location.href = window.location.pathname.includes("/doctor/") 
            ? "../doctor/login.html"
            : window.location.pathname.includes("/admin/")
            ? "../admin/login.html"
            : "../patient/login.html";
        return false;
    }
    return true;
}

function requireRole(role) {
    if (userRole !== role) {
        alert("Unauthorized access");
        window.location.href = "../index.html";
        return false;
    }
    return true;
}

// ===== VALIDATION HELPERS =====
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validatePhoneNumber(phone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.replace(/[^0-9]/g, ""));
}

function validateAadhaar(aadhaar) {
    return /^[0-9]{12}$/.test(aadhaar.replace(/\s/g, ""));
}

// ===== FILE HELPERS =====
function getFileUrl(path) {
    if (!path) return "";
    if (path.startsWith("http")) {
        return path;
    }
    return `${API_ORIGIN}/${path.replace(/\\/g, "/")}`;
}

function setImageSrc(imgEl, path, fallbackUrl) {
    if (!imgEl) return;
    if (path) {
        imgEl.src = getFileUrl(path);
        imgEl.onerror = () => {
            if (fallbackUrl) imgEl.src = fallbackUrl;
        };
        return;
    }
    if (fallbackUrl) {
        imgEl.src = fallbackUrl;
    }
}

function validateFileSize(file, maxMB = 5) {
    return file.size <= maxMB * 1024 * 1024;
}

function validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
}

// ===== UI HELPERS =====
function setButtonLoading(button, isLoading, loadingText) {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.innerText;
        button.innerText = loadingText || "Please wait...";
        button.disabled = true;
        return;
    }
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerText = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

function showAlert(message, type = "info") {
    const alertClass = {
        "success": "alert-success",
        "error": "alert-error",
        "warning": "alert-warning",
        "info": "alert-info"
    }[type] || "alert-info";
    
    const alertEl = document.createElement("div");
    alertEl.className = `alert ${alertClass}`;
    alertEl.innerText = message;
    alertEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background: ${type === "success" ? "#33d17a" : type === "error" ? "#ff4fa3" : "#4d7dff"};
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    document.body.appendChild(alertEl);
    setTimeout(() => alertEl.remove(), 3000);
}

function showLoader() {
    const loader = document.createElement("div");
    loader.id = "global-loader";
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid #4d7dff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 9999;
    `;
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById("global-loader");
    if (loader) loader.remove();
}

// ===== API HELPERS =====
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "API Error");
        }

        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// ===== LOCAL STORAGE HELPERS =====
function setAuthData(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doctorEmail");
}

// ===== PAGE PROTECTION =====
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    if (path.includes("/patient/dashboard.html") || path.includes("/doctor/dashboard.html") || path.includes("/admin/dashboard.html")) {
        if (!requireAuth()) return;
    }

    if (path.includes("/doctor/dashboard.html") || path.includes("/doctor/documents.html")) {
        if (!requireRole("doctor")) return;
    }

    if (path.includes("/admin/dashboard.html")) {
        if (!requireRole("admin")) return;
    }

    if (path.includes("/patient/dashboard.html")) {
        if (!requireRole("patient")) return;
    }
});

const API_BASE =
"https://phoenix-backend-xoxa.onrender.com/api";

const token =
    localStorage.getItem("token");

const API_ORIGIN =
    API_BASE.replace("/api", "");

function getFileUrl(path) {
    if (!path) return "";

    if (path.startsWith("http")) {
        return path;
    }

    return `${API_ORIGIN}/${path.replace(/\\/g, "/")}`;
}

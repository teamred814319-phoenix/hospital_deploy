const fs = require("fs");
const multer = require("multer");
const path = require("path");

const ensureUploadDir = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
};

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (
            file.fieldname === "profilePhoto"
        ) {
            const uploadDir = ensureUploadDir(
                path.join(__dirname, "..", "uploads", "patientProfile")
            );
            cb(null, uploadDir);

        }

        else if (
            file.fieldname === "aadhaarDocument"
        ) {
            const uploadDir = ensureUploadDir(
                path.join(__dirname, "..", "uploads", "patientAadhaar")
            );
            cb(null, uploadDir);

        }

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(
                file.originalname
            )
        );

    }

});

const upload = multer({
    storage
});

module.exports = upload;
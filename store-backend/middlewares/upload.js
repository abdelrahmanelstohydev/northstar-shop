const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'img', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only jpg, png or webp images are allowed'));
        }
    },
});

function uploadImage(req, res, next) {
    upload.single('image')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        next();
    });
}

module.exports = uploadImage;

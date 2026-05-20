const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'general';
    if (file.mimetype.startsWith('video/')) {
      subfolder = 'videos';
    } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document') || file.mimetype.includes('pdf')) {
      subfolder = 'documents';
    } else if (file.mimetype.startsWith('image/')) {
      subfolder = 'images';
    }
    
    const targetDir = path.join(uploadDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max size
  }
});

module.exports = upload;

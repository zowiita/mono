const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');

const profileLines = lines.slice(117, 254);
const imports = \const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });
\;
const routeCode = profileLines.join('\n').replace(/app\.get/g, 'router.get').replace(/app\.post/g, 'router.post');
const finalCode = imports + '\n' + routeCode + '\nmodule.exports = router;';

if (!fs.existsSync('routes')) fs.mkdirSync('routes');
fs.writeFileSync('routes/profileRoutes.js', finalCode);

lines.splice(117, 254 - 117);

const insertIdx = lines.findIndex(l => l.includes(\"app.use('/', authRoutes);\"));
if (insertIdx !== -1) {
    lines.splice(insertIdx + 1, 0, \"const profileRoutes = require('./routes/profileRoutes');\napp.use('/', profileRoutes);\");
}

fs.writeFileSync('server.js', lines.join('\n'));
console.log('Profile routes extracted successfully!');

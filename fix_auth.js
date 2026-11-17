const fs = require('fs');

let authRoutes = fs.readFileSync('routes/authRoutes.js', 'utf8');
if (!authRoutes.includes('/api/auth/mobile/login')) {
    authRoutes += '\nrouter.post(\'/api/auth/mobile/login\', authController.postMobileLogin);\n';
    fs.writeFileSync('routes/authRoutes.js', authRoutes);
}

let authController = fs.readFileSync('controllers/authController.js', 'utf8');
if (!authController.includes('postMobileLogin')) {
    authController += \

exports.postMobileLogin = (req, res) => {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();
    const user = db.prepare('SELECT id, username, email, password_hash, avatar_url FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').get(identifier, identifier);
    
    if (user && bcrypt.compareSync(password, user.password_hash)) {
        req.session.userId = user.id;
        delete user.password_hash;
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
};\;
    fs.writeFileSync('controllers/authController.js', authController);
}
console.log('Fixed mobile auth');

const bcrypt = require('bcrypt');
const db = require('../db');

exports.getLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { error: null });
};

exports.postLogin = (req, res) => {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').get(identifier, identifier);
    
    if (user && bcrypt.compareSync(password, user.password_hash)) {
        req.session.userId = user.id;
        res.redirect('/u/' + user.username);
    } else {
        res.render('login', { error: 'Invalid email/username or password' });
    }
};

exports.getRegister = (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { error: null });
};

exports.postRegister = (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        return res.render('register', { error: 'Passwords do not match' });
    }
    
    try {
        const hash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
        const result = stmt.run(username, email, hash);
        req.session.userId = result.lastInsertRowid;
        res.redirect('/onboarding');
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.render('register', { error: 'Username or Email already taken' });
        } else {
            res.render('register', { error: 'Registration failed' });
        }
    }
};

exports.postLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const crypto = require('crypto');

exports.getForgotPassword = (req, res) => {
    res.render('forgot-password', { error: null, success: null });
};

exports.postForgotPassword = (req, res) => {
    const { email } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
        // To prevent email enumeration, pretend it was successful
        return res.render('forgot-password', { error: null, success: 'If that email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    
    db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?').run(token, expires, user.id);
    
    // In a real app, send an email here using Nodemailer
    console.log(`[DEV MODE] Password reset link for ${email}: http://localhost:3000/reset-password/${token}`);
    
    res.render('forgot-password', { error: null, success: 'If that email exists, a reset link was sent. (Check console in dev mode)' });
};

exports.getResetPassword = (req, res) => {
    const { token } = req.params;
    const user = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?').get(token, new Date().toISOString());
    
    if (!user) {
        return res.render('forgot-password', { error: 'Invalid or expired reset token.', success: null });
    }
    
    res.render('reset-password', { token, error: null });
};

exports.postResetPassword = (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        return res.render('reset-password', { token, error: 'Passwords do not match.' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?').get(token, new Date().toISOString());
    
    if (!user) {
        return res.render('forgot-password', { error: 'Invalid or expired reset token.', success: null });
    }
    
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hash, user.id);
    
    res.redirect('/login');
};

exports.getOnboarding = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const popularAnimes = db.prepare("SELECT * FROM anime WHERE type = 'tv' ORDER BY score DESC LIMIT 24").all();
    res.render('onboarding', { popularAnimes });
};

exports.postOnboardingComplete = (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { animeIds } = req.body;
    
    if (Array.isArray(animeIds)) {
        const stmt = db.prepare('INSERT OR IGNORE INTO user_anime_progress (user_id, anime_id, status) VALUES (?, ?, ?)');
        db.transaction(() => {
            animeIds.forEach(id => stmt.run(req.session.userId, id, 'completed'));
        })();
    }
    
    res.json({ success: true });
};


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
};
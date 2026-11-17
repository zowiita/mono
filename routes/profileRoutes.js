const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

router.get('/u/:username', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) {
        return res.status(404).send('User not found');
    }

    // 1. Get currently watching series with anime info
    const watchingList = db.prepare(`
        SELECT p.current_episode, p.status, a.slug, a.title, a.cover_image, a.episodes_count
        FROM user_anime_progress p
        JOIN anime a ON p.anime_id = a.id
        WHERE p.user_id = ? AND p.status = 'watching'
        ORDER BY p.updated_at DESC
    `).all(profileUser.id);

    // 2. Get user favorite anime (up to 4)
    const favorites = db.prepare(`
        SELECT f.position, a.slug, a.title, a.cover_image
        FROM user_favorites f
        JOIN anime a ON f.anime_id = a.id
        WHERE f.user_id = ?
        ORDER BY f.position ASC
    `).all(profileUser.id);

    // 3. Get user logs / recent reviews
    const recentLogs = db.prepare(`
        SELECT l.*, a.slug, a.title, a.cover_image, a.release_year
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT 10
    `).all(profileUser.id);

    // 4. Detailed Statistics & Social
    const currentUserId = req.session.userId || (req.locals && req.locals.user ? req.locals.user.id : 1);
    const watchedCount = db.prepare("SELECT COUNT(DISTINCT anime_id) as cnt FROM (SELECT anime_id FROM logs WHERE user_id = ? UNION SELECT anime_id FROM user_anime_progress WHERE user_id = ? AND status = 'completed')").get(profileUser.id, profileUser.id).cnt || 0;
    const watchlistCount = db.prepare('SELECT COUNT(*) as cnt FROM watchlist WHERE user_id = ?').get(profileUser.id).cnt || 0;
    const totalEpisodes = db.prepare('SELECT SUM(current_episode) as cnt FROM user_anime_progress WHERE user_id = ?').get(profileUser.id).cnt || 0;
    const hoursWatched = Math.round((totalEpisodes * 24) / 60);
    const avgScoreData = db.prepare('SELECT AVG(rating) as avg FROM logs WHERE user_id = ? AND rating > 0').get(profileUser.id);
    const avgScore = avgScoreData && avgScoreData.avg ? parseFloat(avgScoreData.avg).toFixed(1) : '—';
    
    const followersCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?').get(profileUser.id).cnt || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?').get(profileUser.id).cnt || 0;
    const isFollowing = currentUserId ? !!db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, profileUser.id) : false;

    const topGenres = db.prepare(`
        SELECT g.name, COUNT(*) as count
        FROM anime_genres ag
        JOIN genres g ON ag.genre_id = g.id
        WHERE ag.anime_id IN (
            SELECT anime_id FROM user_anime_progress WHERE user_id = ?
            UNION
            SELECT anime_id FROM logs WHERE user_id = ?
        )
        GROUP BY g.id
        ORDER BY count DESC
        LIMIT 4
    `).all(profileUser.id, profileUser.id);

    res.render('profile', { 
        profileUser,
        watchingList,
        favorites,
        recentLogs,
        stats: { 
            watchedCount, 
            watchlistCount, 
            totalEpisodes, 
            hoursWatched, 
            avgScore,
            followersCount, 
            followingCount, 
            isFollowing,
            topGenres 
        }
    });
});


// SETTINGS
router.get('/settings', (req, res) => {
    const userId = req.session.userId || 1;
    const profileUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!profileUser) return res.redirect('/login');
    const favorites = db.prepare(`
        SELECT f.position, a.slug, a.title, a.cover_image, a.release_year
        FROM user_favorites f
        JOIN anime a ON f.anime_id = a.id
        WHERE f.user_id = ?
        ORDER BY f.position ASC
    `).all(userId);
    res.render('settings', { profileUser, favorites });
});

router.post('/settings', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), (req, res) => {
    const userId = req.session.userId || 1;
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!currentUser) return res.redirect('/login');

    const body = req.body || {};
    const targetUsername = (body.username || currentUser.username || '').trim();
    const targetEmail = (body.email || currentUser.email || '').trim();
    const givenName = (body.given_name || '').trim();
    const familyName = (body.family_name || '').trim();
    const location = (body.location || '').trim();
    const website = (body.website || '').trim();
    const bio = (body.bio || '').trim();
    const pronoun = (body.pronoun || '').trim();
    const files = req.files || {};
    
    let updateQuery = 'UPDATE users SET username = ?, email = ?, given_name = ?, family_name = ?, location = ?, website = ?, bio = ?, pronoun = ?';
    let params = [targetUsername, targetEmail, givenName, familyName, location, website, bio, pronoun];
    
    if (files && files.avatar && files.avatar[0]) {
        updateQuery += ', avatar_url = ?';
        params.push('/uploads/' + files.avatar[0].filename);
    }
    
    if (files && files.banner && files.banner[0]) {
        updateQuery += ', banner_url = ?';
        params.push('/uploads/' + files.banner[0].filename);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    
    try {
        db.prepare(updateQuery).run(...params);
        res.redirect('/u/' + targetUsername);
    } catch (err) {
        console.error('Settings update error:', err);
        res.redirect('/settings');
    }
});

module.exports = router;
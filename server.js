const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'anime_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // In dev use false. Use true with HTTPS
}));

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Global variable for views (so all views know if user is logged in)
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId) : null;
    next();
});


// ROUTES
app.get('/landing', (req, res) => {
    res.render('landing');
});

app.get('/welcome', (req, res) => {
    res.render('landing');
});

app.get('/', (req, res) => {
    // If not logged in and not explicitly requesting home feed, show the landing page
    if (!req.session.userId && req.query.preview !== 'dashboard') {
        return res.render('landing');
    }

    const popularAnime = db.prepare("SELECT * FROM anime WHERE type = 'tv' ORDER BY score DESC, release_year DESC LIMIT 12").all();
    const topMovies = db.prepare("SELECT * FROM anime WHERE type = 'movie' ORDER BY score DESC LIMIT 10").all();
    const seasonalAnime = db.prepare("SELECT * FROM anime ORDER BY release_year DESC, score DESC LIMIT 7").all();
    const recentLoggedGrid = db.prepare("SELECT * FROM anime ORDER BY score DESC, id ASC LIMIT 12").all();
    const recentLogs = db.prepare(`
        SELECT l.*, u.username, u.avatar_url, a.title as anime_title, a.slug as anime_slug, a.cover_image, a.release_year
        FROM logs l
        JOIN users u ON l.user_id = u.id
        JOIN anime a ON l.anime_id = a.id
        ORDER BY l.created_at DESC
        LIMIT 6
    `).all();
    const heroAnime = db.prepare('SELECT * FROM anime ORDER BY score DESC LIMIT 1').get();

    res.render('index', { popularAnime, topMovies, seasonalAnime, recentLoggedGrid, recentLogs, heroAnime });
});

// AUTHENTICATION
app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?').get(identifier, identifier);
    
    if (user && bcrypt.compareSync(password, user.password_hash)) {
        req.session.userId = user.id;
        res.redirect('/u/' + user.username);
    } else {
        res.render('login', { error: 'Invalid email/username or password' });
    }
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        return res.render('register', { error: 'Passwords do not match' });
    }
    
    try {
        const hash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
        const result = stmt.run(username, email, hash);
        req.session.userId = result.lastInsertRowid;
        res.redirect('/');
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.render('register', { error: 'Username or Email already taken' });
        } else {
            res.render('register', { error: 'Registration failed' });
        }
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// PROFILE
app.get('/u/:username', (req, res) => {
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
app.get('/settings', (req, res) => {
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

app.post('/settings', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), (req, res) => {
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

// --- CATALOG & EXPLORATION ROUTES ---

app.get('/landing', (req, res) => res.render('landing'));

app.get('/anime', (req, res) => {
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    let query = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE 1=1
    `;
    const params = [];
    if (req.query.genre) {
        query += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        query += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.season) {
        query += ' AND a.season = ?';
        params.push(req.query.season.toUpperCase());
    }
    if (req.query.q) {
        query += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }
    query += ' GROUP BY a.id';
    if (req.query.sort === 'score') {
        query += ' ORDER BY a.score DESC';
    } else if (req.query.sort === 'recent') {
        query += ' ORDER BY a.release_year DESC';
    } else if (req.query.sort === 'title') {
        query += ' ORDER BY a.title ASC';
    } else {
        query += ' ORDER BY a.score DESC, a.id ASC';
    }
    const items = db.prepare(query).all(...params);
    res.render('anime', { 
        items, 
        genres, 
        activeGenre: req.query.genre || '', 
        activeSeason: req.query.season || '',
        activeSort: req.query.sort || 'popular', 
        activeYear: req.query.year || '', 
        searchQuery: req.query.q || '' 
    });
});

app.get('/series', (req, res) => {
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    let query = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE a.type = 'tv'
    `;
    const params = [];
    if (req.query.genre) {
        query += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        query += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.season) {
        query += ' AND a.season = ?';
        params.push(req.query.season.toUpperCase());
    }
    if (req.query.q) {
        query += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }
    query += ' GROUP BY a.id';
    if (req.query.sort === 'score') {
        query += ' ORDER BY a.score DESC';
    } else if (req.query.sort === 'recent') {
        query += ' ORDER BY a.release_year DESC';
    } else if (req.query.sort === 'title') {
        query += ' ORDER BY a.title ASC';
    } else {
        query += ' ORDER BY a.score DESC, a.id ASC';
    }
    const items = db.prepare(query).all(...params);
    res.render('series', { 
        items, 
        genres, 
        activeGenre: req.query.genre || '', 
        activeSeason: req.query.season || '',
        activeSort: req.query.sort || 'popular', 
        activeYear: req.query.year || '', 
        searchQuery: req.query.q || '' 
    });
});

app.get('/movies', (req, res) => {
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    let query = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE a.type = 'movie'
    `;
    const params = [];
    if (req.query.genre) {
        query += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        query += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.season) {
        query += ' AND a.season = ?';
        params.push(req.query.season.toUpperCase());
    }
    if (req.query.q) {
        query += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }
    query += ' GROUP BY a.id';
    if (req.query.sort === 'score') {
        query += ' ORDER BY a.score DESC';
    } else if (req.query.sort === 'recent') {
        query += ' ORDER BY a.release_year DESC';
    } else if (req.query.sort === 'title') {
        query += ' ORDER BY a.title ASC';
    } else {
        query += ' ORDER BY a.score DESC, a.id ASC';
    }
    const items = db.prepare(query).all(...params);
    res.render('movies', { 
        items, 
        genres, 
        activeGenre: req.query.genre || '', 
        activeSeason: req.query.season || '',
        activeSort: req.query.sort || 'popular', 
        activeYear: req.query.year || '', 
        searchQuery: req.query.q || '' 
    });
});

// TOP 100 ANIME & DEDICATED OFFICIAL TOP 100 MOVIES / SERIES
app.get(['/top100', '/anime/top100', '/top100/movies', '/anime/top100/movies', '/top100-movies', '/top100/series', '/anime/top100/series', '/top100-series'], (req, res) => {
    const isMoviesRoute = req.path.includes('movies');
    const isSeriesRoute = req.path.includes('series');
    
    let activeType = req.query.type || '';
    if (isMoviesRoute) activeType = 'movie';
    if (isSeriesRoute) activeType = 'tv';

    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    
    let sql = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE 1=1
    `;
    const params = [];

    if (activeType === 'movie' || activeType === 'tv') {
        sql += ' AND a.type = ?';
        params.push(activeType);
    }
    if (req.query.genre) {
        sql += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        sql += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.season) {
        sql += ' AND UPPER(a.season) = ?';
        params.push(req.query.season.toUpperCase());
    }
    if (req.query.q) {
        sql += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }

    sql += ' GROUP BY a.id ORDER BY a.score DESC, a.release_year DESC LIMIT 100';

    const items = db.prepare(sql).all(...params);

    let pageTitle = 'Official Top 100 Anime';
    let pageSub = 'The 100 highest rated anime masterworks of all time according to verified community scores.';
    if (activeType === 'movie') {
        pageTitle = 'Official Top 100 Movies';
        pageSub = 'The 100 highest rated anime feature films, theatrical masterworks and cinema releases.';
    } else if (activeType === 'tv') {
        pageTitle = 'Official Top 100 Series';
        pageSub = 'The 100 highest rated anime television series and seasonal sagas.';
    }

    res.render('top100', { 
        items, 
        genres, 
        pageTitle,
        pageSub,
        activeGenre: req.query.genre || '', 
        activeYear: req.query.year || '', 
        activeSeason: req.query.season || '',
        activeType,
        searchQuery: req.query.q || '' 
    });
});

// Top 10 alias (redirect to Top 100)
app.get(['/top10', '/anime/top10'], (req, res) => {
    res.redirect('/top100');
});

// TRENDING ANIME (With Films, Series & Seasonal filter support)
app.get(['/trending', '/anime/trending'], (req, res) => {
    const activeType = req.query.type || '';
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    
    let sql = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE 1=1
    `;
    const params = [];

    if (activeType === 'movie' || activeType === 'tv') {
        sql += ' AND a.type = ?';
        params.push(activeType);
    }
    if (req.query.genre) {
        sql += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        sql += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.season) {
        sql += ' AND UPPER(a.season) = ?';
        params.push(req.query.season.toUpperCase());
    }
    if (req.query.q) {
        sql += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }

    sql += ' GROUP BY a.id ORDER BY a.score DESC, a.release_year DESC';

    const trending = db.prepare(sql).all(...params);

    res.render('trending', { 
        trending, 
        genres, 
        activeGenre: req.query.genre || '', 
        activeYear: req.query.year || '', 
        activeSeason: req.query.season || '',
        activeType,
        searchQuery: req.query.q || '' 
    });
});

// --- SEASONAL ANIME EXPLORER (Season & Year Charts) ---
function getCurrentSeasonInfo() {
    const now = new Date();
    const month = now.getMonth(); // 0 - 11
    const year = now.getFullYear();
    let season = 'SUMMER';
    if (month >= 0 && month <= 2) season = 'WINTER';
    else if (month >= 3 && month <= 5) season = 'SPRING';
    else if (month >= 6 && month <= 8) season = 'SUMMER';
    else season = 'FALL';
    return { season, year };
}

function getSeasonAdjacent(year, season) {
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const idx = seasons.indexOf(season.toUpperCase());
    if (idx === -1) return { prev: { year: year - 1, season: 'FALL' }, next: { year: year + 1, season: 'WINTER' } };

    const prevSeason = idx === 0 ? 'FALL' : seasons[idx - 1];
    const prevYear = idx === 0 ? year - 1 : year;

    const nextSeason = idx === 3 ? 'WINTER' : seasons[idx + 1];
    const nextYear = idx === 3 ? year + 1 : year;

    return {
        prev: { year: prevYear, season: prevSeason },
        next: { year: nextYear, season: nextSeason }
    };
}

app.get(['/season', '/seasonal', '/anime/season'], (req, res) => {
    const current = getCurrentSeasonInfo();
    const targetSeason = (req.query.season || current.season).toLowerCase();
    const targetYear = req.query.year || current.year;
    res.redirect(`/season/${targetYear}/${targetSeason}`);
});

app.get('/season/:year/:season', (req, res) => {
    const year = parseInt(req.params.year, 10) || new Date().getFullYear();
    const season = (req.params.season || 'summer').toUpperCase();
    const activeFormat = req.query.format || 'all';
    const activeGenre = req.query.genre || '';
    const activeSort = req.query.sort || 'popular';
    const searchQuery = req.query.q || '';

    const validSeasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    if (!validSeasons.includes(season)) {
        return res.redirect(`/season/${year}/summer`);
    }

    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    const adjacent = getSeasonAdjacent(year, season);

    // Get all available years in DB for fast year jumping
    const availableYears = db.prepare(`
        SELECT DISTINCT season_year 
        FROM anime 
        WHERE season_year IS NOT NULL 
        ORDER BY season_year DESC
    `).all().map(r => r.season_year);

    if (!availableYears.includes(2026)) availableYears.unshift(2026);
    if (!availableYears.includes(2025)) availableYears.unshift(2025);

    let sql = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE a.season = ? AND a.season_year = ?
    `;
    const params = [season, year];

    if (activeFormat === 'tv' || activeFormat === 'movie' || activeFormat === 'special') {
        sql += ' AND a.type = ?';
        params.push(activeFormat);
    }

    if (activeGenre) {
        sql += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(activeGenre);
    }

    if (searchQuery) {
        sql += ' AND (a.title LIKE ? OR a.native_title LIKE ?)';
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    sql += ' GROUP BY a.id';

    if (activeSort === 'score') {
        sql += ' ORDER BY a.score DESC, a.id ASC';
    } else if (activeSort === 'title') {
        sql += ' ORDER BY a.title ASC';
    } else {
        sql += ' ORDER BY a.score DESC, a.episodes_count DESC';
    }

    const items = db.prepare(sql).all(...params);

    // Group items for clear visual hierarchy
    const tvItems = items.filter(i => i.type === 'tv');
    const movieItems = items.filter(i => i.type === 'movie');
    const otherItems = items.filter(i => i.type !== 'tv' && i.type !== 'movie');

    res.render('season', {
        items,
        tvItems,
        movieItems,
        otherItems,
        year,
        season,
        adjacent,
        genres,
        availableYears,
        activeFormat,
        activeGenre,
        activeSort,
        searchQuery
    });
});

// STUDIO & CREATOR ROUTES (Letterboxd Style)
app.get(['/studio/:name', '/studio/:slug'], (req, res) => {
    const rawName = decodeURIComponent(req.params.name || req.params.slug || '').replace(/-/g, ' ');
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();
    
    // Find matching studio in DB or fallback
    let studioName = rawName;
    const match = db.prepare('SELECT DISTINCT studio FROM anime WHERE studio LIKE ? LIMIT 1').get(`%${rawName}%`);
    if (match && match.studio) {
        studioName = match.studio;
    }

    let query = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE a.studio LIKE ?
    `;
    const params = [`%${studioName}%`];

    if (req.query.genre) {
        query += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        query += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.decade) {
        const decStart = parseInt(req.query.decade, 10);
        query += ' AND a.release_year >= ? AND a.release_year <= ?';
        params.push(decStart, decStart + 9);
    }
    query += ' GROUP BY a.id';

    if (req.query.sort === 'score') {
        query += ' ORDER BY a.score DESC';
    } else if (req.query.sort === 'recent') {
        query += ' ORDER BY a.release_year DESC';
    } else if (req.query.sort === 'title') {
        query += ' ORDER BY a.title ASC';
    } else {
        query += ' ORDER BY a.score DESC, a.release_year DESC';
    }

    let items = db.prepare(query).all(...params);
    if (!items || items.length === 0) {
        // Fallback: show top anime if studio has no specific entries
        items = db.prepare('SELECT * FROM anime ORDER BY score DESC LIMIT 12').all();
    }

    res.render('studio', {
        studioName,
        items,
        genres,
        activeGenre: req.query.genre || '',
        activeDecade: req.query.decade || '',
        activeSort: req.query.sort || 'popular'
    });
});

// PERSON / DIRECTOR / VOICE ACTOR (Letterboxd Style)
app.get(['/person/:name', '/person/:id', '/director/:name', '/actor/:name'], (req, res) => {
    const rawName = decodeURIComponent(req.params.name || req.params.id || '').replace(/-/g, ' ');
    const genres = db.prepare('SELECT * FROM genres ORDER BY name ASC').all();

    // Known creator metadata dictionary for rich profiles
    const creators = {
        'hayao miyazaki': {
            name: 'Hayao Miyazaki',
            nativeName: '宮崎 駿',
            role: 'DIRECTOR & ANIMATOR',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hayao_Miyazaki_cropped_1_Hayao_Miyazaki_201211.jpg/800px-Hayao_Miyazaki_cropped_1_Hayao_Miyazaki_201211.jpg',
            bio: 'Hayao Miyazaki is a Japanese animator, filmmaker, and manga artist. A co-founder of Studio Ghibli, he has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films.',
            birthDate: 'January 5, 1941 (Tokyo, Japan)',
            anilistUrl: 'https://anilist.co/staff/95254/Hayao-Miyazaki'
        },
        'hideaki anno': {
            name: 'Hideaki Anno',
            nativeName: '庵野 秀明',
            role: 'DIRECTOR & WRITER',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Hideaki_Anno_at_the_34th_Tokyo_International_Film_Festival_%2851659918073%29_%28cropped%29.jpg/800px-Hideaki_Anno_at_the_34th_Tokyo_International_Film_Festival_%2851659918073%29_%28cropped%29.jpg',
            bio: 'Hideaki Anno is a Japanese director, animator, screenwriter, and voice actor. He is best known for creating the influential psychological anime franchise Neon Genesis Evangelion.',
            birthDate: 'May 22, 1960 (Ube, Yamaguchi, Japan)',
            anilistUrl: 'https://anilist.co/staff/95604/Hideaki-Anno'
        },
        'makoto shinkai': {
            name: 'Makoto Shinkai',
            nativeName: '新海 誠',
            role: 'DIRECTOR & WRITER',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Makoto_Shinkai_by_Gage_Skidmore.jpg/800px-Makoto_Shinkai_by_Gage_Skidmore.jpg',
            bio: 'Makoto Shinkai is a Japanese animator, filmmaker, and author best known for directing Your Name, Weathering with You, and Suzume, renowned for hyper-detailed lighting and emotional journeys.',
            birthDate: 'February 9, 1973 (Koumi, Nagano, Japan)',
            anilistUrl: 'https://anilist.co/staff/95605/Makoto-Shinkai'
        },
        'satoshi kon': {
            name: 'Satoshi Kon',
            nativeName: '今 敏',
            role: 'DIRECTOR & ANIMATOR',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Satoshi_Kon_20081031.jpg/800px-Satoshi_Kon_20081031.jpg',
            bio: 'Satoshi Kon was a Japanese film director, animator, screenwriter and manga artist. Known for blending fantasy and reality in works like Perfect Blue, Millennium Actress, and Paprika.',
            birthDate: 'October 12, 1963 — August 24, 2010',
            anilistUrl: 'https://anilist.co/staff/95606/Satoshi-Kon'
        },
        'rie takahashi': {
            name: 'Rie Takahashi',
            nativeName: '高橋 李依',
            role: 'VOICE ACTRESS (SEIYUU)',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Rie_Takahashi_at_Anime_Expo_2019_%28cropped%29.jpg/800px-Rie_Takahashi_at_Anime_Expo_2019_%28cropped%29.jpg',
            bio: 'Rie Takahashi is a celebrated Japanese voice actress and singer. She is famous for voicing Megumin (KonoSuba), Emilia (Re:Zero), Ai Hoshino (Oshi no Ko), and Takagi-san.',
            birthDate: 'February 27, 1994 (Saitama, Japan)',
            anilistUrl: 'https://anilist.co/staff/117970/Rie-Takahashi'
        },
        'megumi ogata': {
            name: 'Megumi Ogata',
            nativeName: '緒方 恵美',
            role: 'VOICE ACTRESS & SINGER',
            photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Megumi_Ogata_%281997%29.jpg/800px-Megumi_Ogata_%281997%29.jpg',
            bio: 'Megumi Ogata is an iconic Japanese voice actress and singer, renowned for voicing Shinji Ikari (Neon Genesis Evangelion), Sailor Uranus, and Yugi Mutou.',
            birthDate: 'June 6, 1965 (Tokyo, Japan)',
            anilistUrl: 'https://anilist.co/staff/95006/Megumi-Ogata'
        }
    };

    const key = rawName.toLowerCase();
    const person = creators[key] || {
        name: rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        nativeName: '',
        role: 'STAFF & CREATOR',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        bio: `${rawName} is a prominent contributor and creative artist in the anime industry.`,
        birthDate: 'Japan',
        anilistUrl: 'https://anilist.co'
    };

    // Query anime for person filmography
    let query = `
        SELECT a.*,
            GROUP_CONCAT(g.slug, ',') as genre_slugs,
            GROUP_CONCAT(g.name, ',') as genre_names
        FROM anime a
        LEFT JOIN anime_genres ag ON a.id = ag.anime_id
        LEFT JOIN genres g ON ag.genre_id = g.id
        WHERE 1=1
    `;
    const params = [];

    if (req.query.genre) {
        query += ' AND a.id IN (SELECT anime_id FROM anime_genres ag2 JOIN genres g2 ON ag2.genre_id = g2.id WHERE g2.slug = ?)';
        params.push(req.query.genre);
    }
    if (req.query.year) {
        query += ' AND a.release_year = ?';
        params.push(parseInt(req.query.year, 10));
    }
    if (req.query.decade) {
        const decStart = parseInt(req.query.decade, 10);
        query += ' AND a.release_year >= ? AND a.release_year <= ?';
        params.push(decStart, decStart + 9);
    }
    query += ' GROUP BY a.id';

    if (req.query.sort === 'score') {
        query += ' ORDER BY a.score DESC';
    } else if (req.query.sort === 'recent') {
        query += ' ORDER BY a.release_year DESC';
    } else if (req.query.sort === 'title') {
        query += ' ORDER BY a.title ASC';
    } else {
        query += ' ORDER BY a.score DESC, a.release_year DESC';
    }

    const items = db.prepare(query).all(...params);

    res.render('person', {
        person,
        items,
        genres,
        activeGenre: req.query.genre || '',
        activeDecade: req.query.decade || '',
        activeSort: req.query.sort || 'popular'
    });
});

app.get('/character/:id', (req, res) => res.render('character'));

app.get('/review/:id', (req, res) => {
    const logId = parseInt(req.params.id, 10);
    try {
        const review = db.prepare(`
            SELECT l.*, u.username, u.avatar_url, a.title as anime_title, a.slug as anime_slug, a.cover_image, a.banner_image, a.release_year, a.type
            FROM logs l
            JOIN users u ON l.user_id = u.id
            JOIN anime a ON l.anime_id = a.id
            WHERE l.id = ?
        `).get(logId);
        
        if (!review) return res.status(404).render('search', { query: '', results: [] });

        const likesCount = db.prepare('SELECT COUNT(*) as cnt FROM review_likes WHERE log_id = ?').get(logId).cnt;
        const currentUserId = req.session.userId || 1;
        const isLiked = !!db.prepare('SELECT id FROM review_likes WHERE user_id = ? AND log_id = ?').get(currentUserId, logId);
        
        const comments = db.prepare(`
            SELECT rc.*, u.username, u.avatar_url
            FROM review_comments rc
            JOIN users u ON rc.user_id = u.id
            WHERE rc.log_id = ?
            ORDER BY rc.created_at ASC
        `).all(logId);

        res.render('review', { review, likesCount, isLiked, comments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/edit-profile', (req, res) => res.redirect('/settings'));

app.get('/search', (req, res) => {
    const q = (req.query.q || '').trim();
    let results = [];
    let lists = [];
    if (q) {
        results = db.prepare('SELECT * FROM anime WHERE title LIKE ? OR native_title LIKE ? ORDER BY score DESC').all(`%${q}%`, `%${q}%`);
        lists = db.prepare(`
            SELECT l.*, u.username, u.avatar_url, COUNT(li.id) as item_count
            FROM lists l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN list_items li ON l.id = li.list_id
            WHERE l.is_private = 0 AND (l.title LIKE ? OR l.description LIKE ?)
            GROUP BY l.id
            ORDER BY l.created_at DESC
        `).all(`%${q}%`, `%${q}%`);
    } else {
        results = db.prepare('SELECT * FROM anime ORDER BY score DESC LIMIT 12').all();
        lists = db.prepare(`
            SELECT l.*, u.username, u.avatar_url, COUNT(li.id) as item_count
            FROM lists l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN list_items li ON l.id = li.list_id
            WHERE l.is_private = 0
            GROUP BY l.id
            ORDER BY l.created_at DESC
            LIMIT 6
        `).all();
    }
    res.render('search', { query: q, results, lists });
});

app.get('/anime/:slug', (req, res) => {
    let anime = db.prepare('SELECT * FROM anime WHERE slug = ?').get(req.params.slug);
    if (!anime) {
        anime = db.prepare('SELECT * FROM anime WHERE slug LIKE ? OR title LIKE ?').get(`%${req.params.slug}%`, `%${req.params.slug}%`);
    }
    if (!anime) return res.redirect('/anime');

    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    let userProgress = null;
    let userLog = null;
    let inWatchlist = false;
    let isLiked = false;

    if (userId) {
        userProgress = db.prepare('SELECT * FROM user_anime_progress WHERE user_id = ? AND anime_id = ?').get(userId, anime.id) || null;
        userLog = db.prepare('SELECT * FROM logs WHERE user_id = ? AND anime_id = ? ORDER BY created_at DESC LIMIT 1').get(userId, anime.id) || null;
        inWatchlist = !!db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND anime_id = ?').get(userId, anime.id);
        isLiked = (userLog && userLog.is_liked) || !!db.prepare('SELECT id FROM user_favorites WHERE user_id = ? AND anime_id = ?').get(userId, anime.id);
    }

    const recentReviews = db.prepare(`
        SELECT l.*, u.username, u.avatar_url
        FROM logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.anime_id = ?
        ORDER BY l.created_at DESC
        LIMIT 6
    `).all(anime.id);

    const genres = db.prepare(`
        SELECT g.*
        FROM genres g
        JOIN anime_genres ag ON g.id = ag.genre_id
        WHERE ag.anime_id = ?
    `).all(anime.id);

    const similarAnime = db.prepare('SELECT * FROM anime WHERE id != ? ORDER BY score DESC LIMIT 8').all(anime.id);

    res.render('anime-detail', { 
        anime, 
        genres, 
        recentReviews, 
        similarAnime,
        userProgress,
        userLog,
        inWatchlist,
        isLiked
    });
});

app.get('/anime/:slug/reviews', (req, res) => {
    const anime = db.prepare('SELECT * FROM anime WHERE slug = ?').get(req.params.slug);
    const reviews = anime ? db.prepare(`
        SELECT l.*, u.username, u.avatar_url
        FROM logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.anime_id = ?
        ORDER BY l.created_at DESC
    `).all(anime.id) : [];
    res.render('anime-reviews', { anime, reviews });
});

// Community Lists Directory
app.get('/lists', (req, res) => {
    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : null);
    const activeSort = req.query.sort || 'popular';
    const searchQuery = (req.query.q || '').trim();

    let query = `
        SELECT l.*, u.username, u.avatar_url,
            COUNT(DISTINCT li.id) as item_count,
            (SELECT COUNT(*) FROM list_likes WHERE list_id = l.id) as like_count,
            (SELECT COUNT(*) FROM list_comments WHERE list_id = l.id) as comment_count,
            (SELECT COUNT(*) FROM list_saves WHERE list_id = l.id) as save_count,
            ${currentUserId ? `(SELECT COUNT(*) FROM list_likes WHERE list_id = l.id AND user_id = ${currentUserId})` : '0'} as is_liked,
            ${currentUserId ? `(SELECT COUNT(*) FROM list_saves WHERE list_id = l.id AND user_id = ${currentUserId})` : '0'} as is_saved
        FROM lists l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN list_items li ON l.id = li.list_id
        WHERE l.is_private = 0
    `;
    const params = [];

    if (activeSort === 'saved' && currentUserId) {
        query += ` AND l.id IN (SELECT list_id FROM list_saves WHERE user_id = ?)`;
        params.push(currentUserId);
    }

    if (searchQuery) {
        query += ` AND (l.title LIKE ? OR l.description LIKE ? OR u.username LIKE ?)`;
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }

    query += ` GROUP BY l.id`;

    if (activeSort === 'recent') {
        query += ` ORDER BY l.created_at DESC`;
    } else if (activeSort === 'saved') {
        query += ` ORDER BY l.created_at DESC`;
    } else {
        // Most popular (likes + items)
        query += ` ORDER BY like_count DESC, item_count DESC, l.created_at DESC`;
    }

    const lists = db.prepare(query).all(...params);

    // Attach first 5 anime posters for beautiful preview fan
    const getPosters = db.prepare(`
        SELECT a.cover_image, a.title, a.slug
        FROM list_items li
        JOIN anime a ON li.anime_id = a.id
        WHERE li.list_id = ?
        ORDER BY li.position ASC
        LIMIT 5
    `);
    lists.forEach(l => {
        l.posters = getPosters.all(l.id);
        l.is_liked = !!l.is_liked;
        l.is_saved = !!l.is_saved;
    });

    res.render('lists', { 
        lists, 
        activeSort, 
        searchQuery, 
        currentUserId,
        totalLists: lists.length 
    });
});

app.get('/list/new', (req, res) => {
    res.render('list-new');
});

app.get('/list/:id/reviews', (req, res) => {
    res.redirect('/list/' + req.params.id);
});

// Single Detailed List View with Action Bar & Comments Thread
app.get('/list/:id', (req, res) => {
    const listId = parseInt(req.params.id, 10);
    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);

    const list = db.prepare(`
        SELECT l.*, u.username, u.avatar_url, u.bio as creator_bio,
            (SELECT COUNT(*) FROM list_likes WHERE list_id = l.id) as like_count,
            (SELECT COUNT(*) FROM list_saves WHERE list_id = l.id) as save_count,
            (SELECT COUNT(*) FROM list_comments WHERE list_id = l.id) as comment_count,
            ${currentUserId ? `(SELECT COUNT(*) FROM list_likes WHERE list_id = l.id AND user_id = ${currentUserId})` : '0'} as is_liked,
            ${currentUserId ? `(SELECT COUNT(*) FROM list_saves WHERE list_id = l.id AND user_id = ${currentUserId})` : '0'} as is_saved
        FROM lists l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = ?
    `).get(listId);

    if (!list) return res.status(404).render('search', { query: '', results: [], lists: [] });

    list.is_liked = !!list.is_liked;
    list.is_saved = !!list.is_saved;
    list.is_owner = (currentUserId && currentUserId === list.user_id);

    const items = db.prepare(`
        SELECT li.*, a.slug, a.title, a.cover_image, a.release_year, a.score, a.type, a.studio
        FROM list_items li
        JOIN anime a ON li.anime_id = a.id
        WHERE li.list_id = ?
        ORDER BY li.position ASC
    `).all(list.id);

    list.items = items;

    // Fetch comments
    const comments = db.prepare(`
        SELECT lc.*, u.username, u.avatar_url
        FROM list_comments lc
        JOIN users u ON lc.user_id = u.id
        WHERE lc.list_id = ?
        ORDER BY lc.created_at ASC
    `).all(list.id);

    res.render('list', { 
        list, 
        comments, 
        currentUserId 
    });
});

// --- LIST SOCIAL API ENDPOINTS ---

// 1. Toggle Like on List
app.post('/api/list/:id/like', (req, res) => {
    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const listId = parseInt(req.params.id, 10);

    try {
        const list = db.prepare('SELECT id FROM lists WHERE id = ?').get(listId);
        if (!list) return res.status(404).json({ error: 'List not found' });

        const existing = db.prepare('SELECT id FROM list_likes WHERE user_id = ? AND list_id = ?').get(userId, listId);
        let liked = false;
        if (existing) {
            db.prepare('DELETE FROM list_likes WHERE user_id = ? AND list_id = ?').run(userId, listId);
            liked = false;
        } else {
            db.prepare('INSERT INTO list_likes (user_id, list_id) VALUES (?, ?)').run(userId, listId);
            liked = true;
        }

        const likeCount = db.prepare('SELECT COUNT(*) as count FROM list_likes WHERE list_id = ?').get(listId).count;
        res.json({ success: true, liked, likeCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// 2. Toggle Save / Bookmark List
app.post('/api/list/:id/save', (req, res) => {
    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const listId = parseInt(req.params.id, 10);

    try {
        const list = db.prepare('SELECT id FROM lists WHERE id = ?').get(listId);
        if (!list) return res.status(404).json({ error: 'List not found' });

        const existing = db.prepare('SELECT id FROM list_saves WHERE user_id = ? AND list_id = ?').get(userId, listId);
        let saved = false;
        if (existing) {
            db.prepare('DELETE FROM list_saves WHERE user_id = ? AND list_id = ?').run(userId, listId);
            saved = false;
        } else {
            db.prepare('INSERT INTO list_saves (user_id, list_id) VALUES (?, ?)').run(userId, listId);
            saved = true;
        }

        const saveCount = db.prepare('SELECT COUNT(*) as count FROM list_saves WHERE list_id = ?').get(listId).count;
        res.json({ success: true, saved, saveCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle save' });
    }
});

// 3. Clone List to User's Own Custom Lists
app.post('/api/list/:id/clone', (req, res) => {
    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const sourceListId = parseInt(req.params.id, 10);

    try {
        const sourceList = db.prepare('SELECT * FROM lists WHERE id = ?').get(sourceListId);
        if (!sourceList) return res.status(404).json({ error: 'Source list not found' });

        const newTitle = req.body.title || `${sourceList.title} (Clone)`;
        const newDesc = sourceList.description ? `${sourceList.description}\n\n[Cloned from community list]` : '[Cloned from community list]';

        const createRes = db.prepare(`
            INSERT INTO lists (user_id, title, description, is_ranked, is_private)
            VALUES (?, ?, ?, ?, 0)
        `).run(userId, newTitle, newDesc, sourceList.is_ranked);

        const newListId = createRes.lastInsertRowid;

        // Copy all list items
        const sourceItems = db.prepare('SELECT anime_id, position, notes FROM list_items WHERE list_id = ? ORDER BY position ASC').all(sourceListId);
        const insertItem = db.prepare('INSERT INTO list_items (list_id, anime_id, position, notes) VALUES (?, ?, ?, ?)');

        sourceItems.forEach(item => {
            insertItem.run(newListId, item.anime_id, item.position, item.notes || '');
        });

        res.json({ success: true, newListId, redirectUrl: `/list/${newListId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clone list' });
    }
});

// 4. Add Comment to List
app.post('/api/list/:id/comment', (req, res) => {
    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const listId = parseInt(req.params.id, 10);
    const content = (req.body.content || req.body.comment_text || '').trim();

    if (!content) return res.status(400).json({ error: 'Comment text cannot be empty' });

    try {
        const list = db.prepare('SELECT id FROM lists WHERE id = ?').get(listId);
        if (!list) return res.status(404).json({ error: 'List not found' });

        const commentRes = db.prepare(`
            INSERT INTO list_comments (list_id, user_id, content)
            VALUES (?, ?, ?)
        `).run(listId, userId, content);

        const commentId = commentRes.lastInsertRowid;
        const user = db.prepare('SELECT username, avatar_url FROM users WHERE id = ?').get(userId);

        if (req.xhr || req.headers.accept?.includes('json')) {
            res.json({
                success: true,
                comment: {
                    id: commentId,
                    content,
                    created_at: new Date().toISOString(),
                    username: user ? user.username : 'User',
                    avatar_url: user ? user.avatar_url : ''
                }
            });
        } else {
            res.redirect(`/list/${listId}#comments`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// 5. Delete Comment on List
app.post('/api/list/:id/comment/:commentId/delete', (req, res) => {
    const userId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const commentId = parseInt(req.params.commentId, 10);

    try {
        const comment = db.prepare('SELECT * FROM list_comments WHERE id = ?').get(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        db.prepare('DELETE FROM list_comments WHERE id = ?').run(commentId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// API Get user lists (with optional is_in_list check for an anime slug)
app.get('/api/user/lists', (req, res) => {
    const userId = req.session.userId || 1;
    const animeSlug = req.query.animeSlug;
    let animeId = null;
    if (animeSlug) {
        const anime = db.prepare('SELECT id FROM anime WHERE slug = ?').get(animeSlug);
        if (anime) animeId = anime.id;
    }

    const lists = db.prepare(`
        SELECT l.*, COUNT(li.id) as item_count
        FROM lists l
        LEFT JOIN list_items li ON l.id = li.list_id
        WHERE l.user_id = ?
        GROUP BY l.id
        ORDER BY l.created_at DESC
    `).all(userId);

    const checkItem = animeId ? db.prepare('SELECT 1 FROM list_items WHERE list_id = ? AND anime_id = ?') : null;
    lists.forEach(l => {
        const isInList = checkItem ? !!checkItem.get(l.id, animeId) : false;
        l.inList = isInList;
        l.contains_anime = isInList;
    });

    res.json(lists);
});

// API Toggle Anime in List
app.post('/api/list/:id/toggle-item', (req, res) => {
    const userId = req.session.userId || 1;
    const listId = parseInt(req.params.id, 10);
    const { slug } = req.body;

    try {
        const list = db.prepare('SELECT * FROM lists WHERE id = ? AND user_id = ?').get(listId, userId);
        if (!list) return res.status(403).json({ error: 'Unauthorized or list not found' });

        const anime = db.prepare('SELECT id FROM anime WHERE slug = ?').get(slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });

        const existing = db.prepare('SELECT id FROM list_items WHERE list_id = ? AND anime_id = ?').get(listId, anime.id);
        let inList = false;
        if (existing) {
            db.prepare('DELETE FROM list_items WHERE list_id = ? AND anime_id = ?').run(listId, anime.id);
            inList = false;
        } else {
            const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) as maxPos FROM list_items WHERE list_id = ?').get(listId).maxPos;
            db.prepare('INSERT OR IGNORE INTO list_items (list_id, anime_id, position) VALUES (?, ?, ?)').run(listId, anime.id, maxPos + 1);
            inList = true;
        }

        const totalItems = db.prepare('SELECT COUNT(*) as cnt FROM list_items WHERE list_id = ?').get(listId).cnt;
        res.json({ success: true, inList, added: inList, totalItems, message: inList ? 'Added to list' : 'Removed from list' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle item in list' });
    }
});

// API Delete List
app.delete('/api/list/:id', (req, res) => {
    const userId = req.session.userId || 1;
    const listId = req.params.id;
    try {
        const result = db.prepare('DELETE FROM lists WHERE id = ? AND user_id = ?').run(listId, userId);
        if (result.changes === 0) return res.status(404).json({ error: 'List not found or unauthorized' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

// API Create List
app.post('/api/list/create', (req, res) => {
    const userId = req.session.userId || 1;
    const { title, description, isRanked, isPrivate, animeSlugs } = req.body;

    if (!title) return res.status(400).json({ error: 'Title required' });

    try {
        const listRes = db.prepare(`
            INSERT INTO lists (user_id, title, description, is_ranked, is_private)
            VALUES (?, ?, ?, ?, ?)
        `).run(userId, title, description || '', isRanked ? 1 : 0, isPrivate ? 1 : 0);

        const listId = listRes.lastInsertRowid;

        if (animeSlugs && Array.isArray(animeSlugs)) {
            const insertItem = db.prepare('INSERT OR IGNORE INTO list_items (list_id, anime_id, position) VALUES (?, ?, ?)');
            animeSlugs.forEach((slug, idx) => {
                const anime = db.prepare('SELECT id FROM anime WHERE slug = ?').get(slug);
                if (anime) {
                    insertItem.run(listId, anime.id, idx + 1);
                }
            });
        }

        res.json({ success: true, listId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create list' });
    }
});

app.get('/u/:username/anime', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const fetchByStatus = (statusCondition) => db.prepare(`
        SELECT DISTINCT a.id, a.slug, a.title, a.cover_image, a.episodes_count, a.release_year, a.type, a.studio, a.score as global_score,
               p.current_episode, p.status, p.updated_at,
               (SELECT rating FROM logs WHERE user_id = p.user_id AND anime_id = a.id ORDER BY created_at DESC LIMIT 1) as user_rating
        FROM user_anime_progress p
        JOIN anime a ON p.anime_id = a.id
        WHERE p.user_id = ? AND ${statusCondition}
        ORDER BY p.updated_at DESC
    `).all(profileUser.id);

    const watchingList = fetchByStatus("p.status = 'watching'");
    const completedList = fetchByStatus("p.status = 'completed' OR p.status = 'finished'");
    const pausedList = fetchByStatus("p.status = 'paused' OR p.status = 'on_hold'");
    const droppedList = fetchByStatus("p.status = 'dropped'");
    
    // Plan to Watch includes user_anime_progress (plan_to_watch) + watchlist
    const planToWatchList = db.prepare(`
        SELECT DISTINCT a.id, a.slug, a.title, a.cover_image, a.episodes_count, a.release_year, a.type, a.studio, a.score as global_score,
               COALESCE(p.current_episode, 0) as current_episode, 'plan_to_watch' as status,
               NULL as user_rating
        FROM anime a
        LEFT JOIN user_anime_progress p ON a.id = p.anime_id AND p.user_id = ?
        WHERE (p.user_id = ? AND (p.status = 'plan_to_watch' OR p.status = 'planning'))
           OR a.id IN (SELECT anime_id FROM watchlist WHERE user_id = ?)
        ORDER BY a.title ASC
    `).all(profileUser.id, profileUser.id, profileUser.id);

    const counts = {
        total: watchingList.length + completedList.length + pausedList.length + droppedList.length + planToWatchList.length,
        watching: watchingList.length,
        completed: completedList.length,
        paused: pausedList.length,
        dropped: droppedList.length,
        planToWatch: planToWatchList.length
    };

    res.render('profile-anime', {
        profileUser,
        watchingList,
        completedList,
        pausedList,
        droppedList,
        planToWatchList,
        counts,
        activeFilter: req.query.status || 'all'
    });
});

app.get('/u/:username/watchlist', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const watchlistItems = db.prepare(`
        SELECT a.id, a.slug, a.title, a.cover_image, a.episodes_count, a.release_year, a.type, a.studio, a.score as global_score,
               w.created_at
        FROM watchlist w
        JOIN anime a ON w.anime_id = a.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `).all(profileUser.id);

    res.render('profile-anime', {
        profileUser,
        watchingList: [],
        completedList: [],
        pausedList: [],
        droppedList: [],
        planToWatchList: watchlistItems,
        counts: {
            total: watchlistItems.length,
            watching: 0,
            completed: 0,
            paused: 0,
            dropped: 0,
            planToWatch: watchlistItems.length
        },
        activeFilter: 'plan_to_watch',
        isWatchlistPage: true
    });
});

app.get('/u/:username/lists', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const activeTab = req.query.tab === 'saved' ? 'saved' : 'created';

    const getPosters = db.prepare(`
        SELECT a.cover_image, a.title, a.slug
        FROM list_items li
        JOIN anime a ON li.anime_id = a.id
        WHERE li.list_id = ?
        ORDER BY li.position ASC
        LIMIT 4
    `);

    // 1. Created lists
    const createdLists = db.prepare(`
        SELECT l.*,
            COUNT(DISTINCT li.id) as item_count,
            (SELECT COUNT(*) FROM list_likes WHERE list_id = l.id) as like_count,
            (SELECT COUNT(*) FROM list_comments WHERE list_id = l.id) as comment_count
        FROM lists l
        LEFT JOIN list_items li ON l.id = li.list_id
        WHERE l.user_id = ?
        GROUP BY l.id
        ORDER BY l.created_at DESC
    `).all(profileUser.id);
    createdLists.forEach(l => { l.posters = getPosters.all(l.id); });

    // 2. Saved / Favorited lists
    const savedLists = db.prepare(`
        SELECT l.*, u.username as creator_username, u.avatar_url as creator_avatar,
            COUNT(DISTINCT li.id) as item_count,
            (SELECT COUNT(*) FROM list_likes WHERE list_id = l.id) as like_count,
            (SELECT COUNT(*) FROM list_comments WHERE list_id = l.id) as comment_count
        FROM list_saves ls
        JOIN lists l ON ls.list_id = l.id
        JOIN users u ON l.user_id = u.id
        LEFT JOIN list_items li ON l.id = li.list_id
        WHERE ls.user_id = ?
        GROUP BY l.id
        ORDER BY ls.created_at DESC
    `).all(profileUser.id);
    savedLists.forEach(l => { l.posters = getPosters.all(l.id); });

    res.render('profile-lists', { 
        profileUser, 
        lists: createdLists, 
        createdLists, 
        savedLists, 
        activeTab 
    });
});

app.get('/u/:username/reviews', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const reviews = db.prepare(`
        SELECT l.*, a.slug, a.title, a.cover_image, a.release_year
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
    `).all(profileUser.id);

    res.render('profile-reviews', { profileUser, reviews });
});

// --- USER PROFILE STATISTICS & ANALYTICS HUB ---
app.get('/u/:username/stats', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const isOwner = currentUserId === profileUser.id;
    const isPro = Boolean(profileUser.is_pro);
    const proTier = profileUser.pro_tier || 'free';
    const activeTab = req.query.tab || 'alltime'; // 'alltime', 'wrapped', 'monthly'
    const selectedYear = req.query.year || '2026';

    // 1. Overall Header Metrics
    const watchedCount = db.prepare("SELECT COUNT(DISTINCT anime_id) as cnt FROM (SELECT anime_id FROM logs WHERE user_id = ? UNION SELECT anime_id FROM user_anime_progress WHERE user_id = ? AND status = 'completed')").get(profileUser.id, profileUser.id).cnt || 0;
    const totalEpisodes = db.prepare('SELECT SUM(current_episode) as cnt FROM user_anime_progress WHERE user_id = ?').get(profileUser.id).cnt || 0;
    const hoursWatched = Math.round((totalEpisodes * 24) / 60);
    const daysWatched = (hoursWatched / 24).toFixed(1);
    const avgScoreData = db.prepare('SELECT AVG(rating) as avg FROM logs WHERE user_id = ? AND rating > 0').get(profileUser.id);
    const avgScore = avgScoreData && avgScoreData.avg ? parseFloat(avgScoreData.avg).toFixed(1) : '—';
    const rewatchesCount = db.prepare("SELECT COUNT(*) as cnt FROM logs WHERE user_id = ? AND review_text LIKE '%rewatch%'").get(profileUser.id).cnt || 0;
    
    const followersCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?').get(profileUser.id).cnt || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?').get(profileUser.id).cnt || 0;
    const isFollowing = currentUserId ? Boolean(db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, profileUser.id)) : false;

    // 2. Rating Distribution (0.5 to 5.0 in 10 steps)
    const ratingBuckets = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    const userRatings = db.prepare('SELECT rating, COUNT(*) as count FROM logs WHERE user_id = ? AND rating > 0 GROUP BY rating').all(profileUser.id);
    const ratingMap = {};
    userRatings.forEach(r => { ratingMap[r.rating] = r.count; });
    
    let maxRatingCount = 0;
    const ratingDist = ratingBuckets.map(star => {
        const count = ratingMap[star] || 0;
        if (count > maxRatingCount) maxRatingCount = count;
        return { star, count };
    });
    ratingDist.forEach(item => {
        item.percent = maxRatingCount > 0 ? Math.round((item.count / maxRatingCount) * 100) : 0;
    });

    // 3. Top Genres Breakdown
    const topGenresRaw = db.prepare(`
        SELECT g.name, g.slug, COUNT(DISTINCT a.id) as count
        FROM anime a
        JOIN anime_genres ag ON a.id = ag.anime_id
        JOIN genres g ON ag.genre_id = g.id
        WHERE a.id IN (
            SELECT anime_id FROM logs WHERE user_id = ?
            UNION
            SELECT anime_id FROM user_anime_progress WHERE user_id = ?
        )
        GROUP BY g.id
        ORDER BY count DESC
        LIMIT 8
    `).all(profileUser.id, profileUser.id);

    const totalGenreSum = topGenresRaw.reduce((acc, g) => acc + g.count, 0) || 1;
    const topGenres = topGenresRaw.map(g => ({
        ...g,
        percent: Math.round((g.count / totalGenreSum) * 100)
    }));

    // 4. Format Distribution (TV vs Movie vs OVA/Special)
    const formatStats = db.prepare(`
        SELECT 
            SUM(CASE WHEN LOWER(a.type) = 'tv' THEN 1 ELSE 0 END) as tv_count,
            SUM(CASE WHEN LOWER(a.type) = 'movie' THEN 1 ELSE 0 END) as movie_count,
            SUM(CASE WHEN LOWER(a.type) NOT IN ('tv', 'movie') THEN 1 ELSE 0 END) as special_count
        FROM anime a
        WHERE a.id IN (
            SELECT anime_id FROM logs WHERE user_id = ?
            UNION
            SELECT anime_id FROM user_anime_progress WHERE user_id = ?
        )
    `).get(profileUser.id, profileUser.id);

    const totalFormatCount = (formatStats.tv_count || 0) + (formatStats.movie_count || 0) + (formatStats.special_count || 0) || 1;
    const formats = {
        tv: { count: formatStats.tv_count || 0, percent: Math.round(((formatStats.tv_count || 0) / totalFormatCount) * 100) },
        movie: { count: formatStats.movie_count || 0, percent: Math.round(((formatStats.movie_count || 0) / totalFormatCount) * 100) },
        special: { count: formatStats.special_count || 0, percent: Math.round(((formatStats.special_count || 0) / totalFormatCount) * 100) }
    };

    // 5. Top Studios Breakdown
    const topStudios = db.prepare(`
        SELECT a.studio, COUNT(DISTINCT a.id) as count
        FROM anime a
        WHERE a.studio IS NOT NULL AND a.studio != ''
          AND a.id IN (
              SELECT anime_id FROM logs WHERE user_id = ?
              UNION
              SELECT anime_id FROM user_anime_progress WHERE user_id = ?
          )
        GROUP BY a.studio
        ORDER BY count DESC
        LIMIT 6
    `).all(profileUser.id, profileUser.id);

    // 6. Decades Breakdown
    const decadeCounts = db.prepare(`
        SELECT 
            SUM(CASE WHEN release_year < 1990 THEN 1 ELSE 0 END) as eighties,
            SUM(CASE WHEN release_year >= 1990 AND release_year < 2000 THEN 1 ELSE 0 END) as nineties,
            SUM(CASE WHEN release_year >= 2000 AND release_year < 2010 THEN 1 ELSE 0 END) as thousands,
            SUM(CASE WHEN release_year >= 2010 AND release_year < 2020 THEN 1 ELSE 0 END) as tens,
            SUM(CASE WHEN release_year >= 2020 THEN 1 ELSE 0 END) as twenties
        FROM anime a
        WHERE a.id IN (
            SELECT anime_id FROM logs WHERE user_id = ?
            UNION
            SELECT anime_id FROM user_anime_progress WHERE user_id = ?
        )
    `).get(profileUser.id, profileUser.id);

    const totalDecades = (decadeCounts.eighties || 0) + (decadeCounts.nineties || 0) + (decadeCounts.thousands || 0) + (decadeCounts.tens || 0) + (decadeCounts.twenties || 0) || 1;
    const decades = [
        { label: '80s & Earlier', count: decadeCounts.eighties || 0, percent: Math.round(((decadeCounts.eighties || 0) / totalDecades) * 100) },
        { label: '1990s', count: decadeCounts.nineties || 0, percent: Math.round(((decadeCounts.nineties || 0) / totalDecades) * 100) },
        { label: '2000s', count: decadeCounts.thousands || 0, percent: Math.round(((decadeCounts.thousands || 0) / totalDecades) * 100) },
        { label: '2010s', count: decadeCounts.tens || 0, percent: Math.round(((decadeCounts.tens || 0) / totalDecades) * 100) },
        { label: '2020s', count: decadeCounts.twenties || 0, percent: Math.round(((decadeCounts.twenties || 0) / totalDecades) * 100) }
    ];

    // 7. Year in Review / "Möno Wrapped" Data
    const availableYears = db.prepare(`
        SELECT DISTINCT strftime('%Y', COALESCE(NULLIF(watched_date, ''), date(created_at))) as yr
        FROM logs
        WHERE user_id = ? AND yr IS NOT NULL
        ORDER BY yr DESC
    `).all(profileUser.id).map(r => r.yr).filter(Boolean);
    if (!availableYears.includes('2026')) availableYears.unshift('2026');

    const yearLogs = db.prepare(`
        SELECT l.*, a.id as anime_id, a.slug, a.title, a.cover_image, a.studio, a.type, a.episodes_count, a.release_year,
               COALESCE(NULLIF(l.watched_date, ''), date(l.created_at)) as entry_date
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ? AND strftime('%Y', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?
        ORDER BY l.rating DESC, entry_date DESC
    `).all(profileUser.id, selectedYear);

    const yearAnimeCount = yearLogs.length;
    const yearEpisodesCount = yearLogs.reduce((sum, item) => sum + (item.episodes_count || 12), 0);
    const yearHours = Math.round((yearEpisodesCount * 24) / 60);
    const yearMinutes = yearHours * 60;
    const yearDays = (yearHours / 24).toFixed(1);
    
    let yearAvgRating = '—';
    const ratedYearLogs = yearLogs.filter(l => l.rating > 0);
    if (ratedYearLogs.length > 0) {
        yearAvgRating = (ratedYearLogs.reduce((sum, l) => sum + l.rating, 0) / ratedYearLogs.length).toFixed(1);
    }

    const topAnimeOfYear = yearLogs.slice(0, 5);

    // Archetype determination for Wrapped
    let viewerArchetype = {
        title: 'Eclectic Anime Connoisseur',
        description: 'Your anime palate spans deep psychological narratives, high-octane sakuga, and heartfelt journeys with cultured appreciation.',
        badge: '✨ Master Cinephile'
    };
    if (topGenres.length > 0) {
        const primaryGenre = topGenres[0].name.toLowerCase();
        if (primaryGenre.includes('action')) {
            viewerArchetype = {
                title: 'High-Octane Sakuga Hunter',
                description: 'You live for peak hype, legendary combat choreography, and adrenaline-pumping seasonal powerhouses.',
                badge: '⚡ Sakuga Hunter'
            };
        } else if (primaryGenre.includes('psychological') || primaryGenre.includes('sci-fi')) {
            viewerArchetype = {
                title: 'Existential Mind-Bending Theorist',
                description: 'You crave layered mysteries, philosophical dilemmas, and cerebral deconstructions that keep you thinking for weeks.',
                badge: '🧠 Deep Philosopher'
            };
        } else if (primaryGenre.includes('drama') || primaryGenre.includes('romance') || primaryGenre.includes('slice')) {
            viewerArchetype = {
                title: 'Heartfelt Emotional Connoisseur',
                description: 'You appreciate emotional depth, gorgeous character dynamics, and introspective coming-of-age storytelling.',
                badge: '🌸 Emotional Connoisseur'
            };
        } else if (primaryGenre.includes('fantasy') || primaryGenre.includes('adventure')) {
            viewerArchetype = {
                title: 'Mythical Realm Pioneer',
                description: 'You thrive in rich worldbuilding, sprawling magic systems, and unforgettable journeys across expansive fantasy universes.',
                badge: '🗡️ Grand Explorer'
            };
        }
    }

    // Monthly distribution in selected year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyInYear = monthNames.map((mName, idx) => {
        const mStr = String(idx + 1).padStart(2, '0');
        const count = yearLogs.filter(l => {
            const m = l.entry_date ? l.entry_date.split('-')[1] : null;
            return m === mStr;
        }).length;
        return { month: mName, count };
    });

    // 8. Monthly Deep-Dive (Pro Feature)
    const monthlyDeepDiveRaw = db.prepare(`
        SELECT 
            strftime('%Y-%m', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) as month_key,
            COUNT(DISTINCT l.anime_id) as anime_count,
            SUM(COALESCE(a.episodes_count, 12)) as episodes_count,
            AVG(CASE WHEN l.rating > 0 THEN l.rating ELSE NULL END) as avg_rating
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ?
        GROUP BY month_key
        ORDER BY month_key DESC
    `).all(profileUser.id);

    const monthNameFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let peakMonth = null;
    let maxEpisodesInMonth = 0;

    const monthlyDeepDive = monthlyDeepDiveRaw.map(m => {
        const [yr, mo] = m.month_key.split('-');
        const monthLabel = `${monthNameFull[parseInt(mo, 10) - 1]} ${yr}`;
        const eps = m.episodes_count || 0;
        const hours = Math.round((eps * 24) / 60);

        if (eps > maxEpisodesInMonth) {
            maxEpisodesInMonth = eps;
            peakMonth = { label: monthLabel, episodes: eps, hours };
        }

        // Get top cover for this month
        const topAnimeMonth = db.prepare(`
            SELECT a.cover_image, a.title, a.slug, l.rating
            FROM logs l
            JOIN anime a ON l.anime_id = a.id
            WHERE l.user_id = ? AND strftime('%Y-%m', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?
            ORDER BY l.rating DESC, l.created_at DESC
            LIMIT 1
        `).get(profileUser.id, m.month_key);

        return {
            monthKey: m.month_key,
            monthLabel,
            animeCount: m.anime_count,
            episodesCount: eps,
            hoursCount: hours,
            avgRating: m.avg_rating ? parseFloat(m.avg_rating).toFixed(1) : '—',
            topCover: topAnimeMonth ? topAnimeMonth.cover_image : null,
            topTitle: topAnimeMonth ? topAnimeMonth.title : null,
            topSlug: topAnimeMonth ? topAnimeMonth.slug : null
        };
    });

    const dailyVelocity = (totalEpisodes / Math.max(watchedCount * 2, 1)).toFixed(1);

    res.render('profile-stats', {
        profileUser,
        stats: {
            watchedCount,
            totalEpisodes,
            hoursWatched,
            daysWatched,
            avgScore,
            rewatchesCount,
            followersCount,
            followingCount,
            isFollowing,
            ratingDist,
            topGenres,
            formats,
            topStudios,
            decades,
            // Wrapped / Year
            selectedYear,
            availableYears,
            yearAnimeCount,
            yearEpisodesCount,
            yearHours,
            yearMinutes,
            yearDays,
            yearAvgRating,
            topAnimeOfYear,
            topGenreOfYear: topGenres.length > 0 ? topGenres[0].name : 'Shonen / Action',
            topStudioOfYear: topStudios.length > 0 ? topStudios[0].studio : 'Kyoto Animation',
            viewerArchetype,
            monthlyInYear,
            // Monthly Deep-Dive (Pro)
            monthlyDeepDive,
            peakMonth,
            dailyVelocity
        },
        isOwner,
        isPro,
        proTier,
        activeTab
    });
});

// --- IMMERSIVE SPOTIFY-STYLE MÖNO WRAPPED EXPERIENCE ---
app.get('/u/:username/wrapped/:year', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const year = req.params.year || '2026';
    const yearLogs = db.prepare(`
        SELECT l.*, a.id as anime_id, a.slug, a.title, a.cover_image, a.studio, a.type, a.episodes_count, a.release_year,
               COALESCE(NULLIF(l.watched_date, ''), date(l.created_at)) as entry_date
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ? AND strftime('%Y', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?
        ORDER BY l.rating DESC, entry_date DESC
    `).all(profileUser.id, year);

    const yearAnimeCount = yearLogs.length;
    const yearEpisodesCount = yearLogs.reduce((sum, item) => sum + (item.episodes_count || 12), 0);
    const yearHours = Math.round((yearEpisodesCount * 24) / 60);
    const yearMinutes = yearHours * 60;
    const yearDays = (yearHours / 24).toFixed(1);

    const topAnime = yearLogs.slice(0, 5);

    // Top Genre
    const topGenre = db.prepare(`
        SELECT g.name, COUNT(*) as cnt
        FROM logs l
        JOIN anime_genres ag ON l.anime_id = ag.anime_id
        JOIN genres g ON ag.genre_id = g.id
        WHERE l.user_id = ? AND strftime('%Y', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?
        GROUP BY g.id
        ORDER BY cnt DESC
        LIMIT 1
    `).get(profileUser.id, year) || { name: 'Psychological / Action' };

    // Top Studio
    const topStudio = db.prepare(`
        SELECT a.studio, COUNT(*) as cnt
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        WHERE l.user_id = ? AND a.studio IS NOT NULL AND a.studio != ''
          AND strftime('%Y', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?
        GROUP BY a.studio
        ORDER BY cnt DESC
        LIMIT 1
    `).get(profileUser.id, year) || { studio: 'Madhouse' };

    res.render('wrapped', {
        profileUser,
        year,
        yearAnimeCount,
        yearEpisodesCount,
        yearHours,
        yearMinutes,
        yearDays,
        topAnime,
        topGenre: topGenre.name,
        topStudio: topStudio.studio,
        isPro: Boolean(profileUser.is_pro)
    });
});

// --- DIARY SHORTCUT ---
app.get('/diary', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/u/' + req.session.user.username + '/diary');
    }
    res.redirect('/login');
});

// --- USER VIEWING DIARY (Letterboxd Style) ---
app.get('/u/:username/diary', (req, res) => {
    const profileUser = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
    if (!profileUser) return res.status(404).send('User not found');

    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    
    // User profile statistics for header
    const watchedCount = db.prepare("SELECT COUNT(DISTINCT anime_id) as cnt FROM (SELECT anime_id FROM logs WHERE user_id = ? UNION SELECT anime_id FROM user_anime_progress WHERE user_id = ? AND status = 'completed')").get(profileUser.id, profileUser.id).cnt || 0;
    const watchlistCount = db.prepare('SELECT COUNT(*) as cnt FROM watchlist WHERE user_id = ?').get(profileUser.id).cnt || 0;
    const totalEpisodes = db.prepare('SELECT SUM(current_episode) as cnt FROM user_anime_progress WHERE user_id = ?').get(profileUser.id).cnt || 0;
    const hoursWatched = Math.round((totalEpisodes * 24) / 60);
    const avgScoreData = db.prepare('SELECT AVG(rating) as avg FROM logs WHERE user_id = ? AND rating > 0').get(profileUser.id);
    const avgScore = avgScoreData && avgScoreData.avg ? parseFloat(avgScoreData.avg).toFixed(1) : '—';
    
    const followersCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?').get(profileUser.id).cnt || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?').get(profileUser.id).cnt || 0;
    const isFollowing = currentUserId ? !!db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, profileUser.id) : false;

    // Fetch user logs & progress entries
    let query = `
        SELECT 
            l.id as log_id,
            l.rating,
            l.review_text,
            l.contains_spoilers,
            l.is_liked,
            l.watched_date,
            l.created_at,
            COALESCE(NULLIF(l.watched_date, ''), date(l.created_at)) as entry_date,
            a.id as anime_id,
            a.slug,
            a.title,
            a.cover_image,
            a.release_year,
            a.type,
            a.episodes_count,
            a.score as global_score,
            p.current_episode,
            p.status as progress_status
        FROM logs l
        JOIN anime a ON l.anime_id = a.id
        LEFT JOIN user_anime_progress p ON (p.user_id = l.user_id AND p.anime_id = l.anime_id)
        WHERE l.user_id = ?
    `;
    const params = [profileUser.id];

    if (req.query.year) {
        query += ` AND strftime('%Y', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?`;
        params.push(req.query.year);
    }
    if (req.query.month) {
        const mStr = String(req.query.month).padStart(2, '0');
        query += ` AND strftime('%m', COALESCE(NULLIF(l.watched_date, ''), date(l.created_at))) = ?`;
        params.push(mStr);
    }
    if (req.query.q) {
        query += ` AND (a.title LIKE ? OR a.native_title LIKE ?)`;
        params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }

    if (req.query.sort === 'rating_desc') {
        query += ` ORDER BY l.rating DESC, entry_date DESC`;
    } else if (req.query.sort === 'rating_asc') {
        query += ` ORDER BY l.rating ASC, entry_date DESC`;
    } else if (req.query.sort === 'date_asc') {
        query += ` ORDER BY entry_date ASC, l.created_at ASC`;
    } else {
        query += ` ORDER BY entry_date DESC, l.created_at DESC`;
    }

    const rawEntries = db.prepare(query).all(...params);

    // Get available years for filter buttons
    const allYears = db.prepare(`
        SELECT DISTINCT strftime('%Y', COALESCE(NULLIF(watched_date, ''), date(created_at))) as yr
        FROM logs
        WHERE user_id = ? AND yr IS NOT NULL
        ORDER BY yr DESC
    `).all(profileUser.id).map(r => r.yr).filter(Boolean);

    // Group entries by Month & Year for clean Letterboxd display
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const monthsMap = new Map();
    rawEntries.forEach(entry => {
        const d = new Date(entry.entry_date + 'T12:00:00Z');
        const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
        const monthNum = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
        const monthName = monthNames[monthNum];
        const monthKey = `${monthName} ${year}`;
        const day = isNaN(d.getDate()) ? '01' : String(d.getDate()).padStart(2, '0');

        if (!monthsMap.has(monthKey)) {
            monthsMap.set(monthKey, {
                monthKey,
                monthName,
                year,
                entries: []
            });
        }

        monthsMap.get(monthKey).entries.push({
            ...entry,
            day,
            hasReview: !!(entry.review_text && entry.review_text.trim().length > 0)
        });
    });

    const monthGroups = Array.from(monthsMap.values());

    res.render('profile-diary', {
        profileUser,
        stats: {
            watchedCount,
            watchlistCount,
            totalEpisodes,
            hoursWatched,
            avgScore,
            followersCount,
            followingCount,
            isFollowing
        },
        monthGroups,
        totalEntries: rawEntries.length,
        allYears,
        activeYear: req.query.year || '',
        activeMonth: req.query.month || '',
        activeSort: req.query.sort || 'date_desc',
        searchQuery: req.query.q || ''
    });
});

// --- ACTIVITY FEED (Following & Community Activity) ---
app.get(['/activity', '/feed'], (req, res) => {
    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : null);
    
    // Check if user follows anyone
    let followsCount = 0;
    if (currentUserId) {
        const row = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(currentUserId);
        followsCount = row ? row.c : 0;
    }

    // Default filter: 'following' if user is logged in & has follows, else 'community'
    let activeFilter = req.query.filter;
    if (!activeFilter) {
        activeFilter = (currentUserId && followsCount > 0) ? 'following' : 'community';
    }

    const activeType = req.query.type || 'all'; // 'all', 'reviews', 'logs', 'progress', 'lists'

    // Build Activity Items query
    // 1. Logs & Reviews
    let logQuery = `
        SELECT 
            'log' AS activity_type,
            l.id AS activity_id,
            l.user_id,
            u.username,
            u.avatar_url,
            l.anime_id,
            a.title AS anime_title,
            a.slug AS anime_slug,
            a.cover_image AS anime_cover,
            a.release_year AS anime_year,
            a.type AS anime_type,
            a.episodes_count,
            l.rating,
            l.review_text,
            l.contains_spoilers,
            l.is_liked,
            l.watched_date,
            l.created_at,
            (SELECT COUNT(*) FROM review_likes WHERE log_id = l.id) AS likes_count,
            (SELECT COUNT(*) FROM review_comments WHERE log_id = l.id) AS comments_count,
            (SELECT current_episode FROM user_anime_progress WHERE user_id = l.user_id AND anime_id = l.anime_id) AS current_episode,
            (SELECT status FROM user_anime_progress WHERE user_id = l.user_id AND anime_id = l.anime_id) AS progress_status
        FROM logs l
        JOIN users u ON l.user_id = u.id
        JOIN anime a ON l.anime_id = a.id
        WHERE 1=1
    `;

    if (activeFilter === 'following' && currentUserId) {
        logQuery += ` AND l.user_id IN (SELECT following_id FROM follows WHERE follower_id = ${currentUserId})`;
    }

    if (activeType === 'reviews') {
        logQuery += ` AND l.review_text IS NOT NULL AND length(trim(l.review_text)) > 0`;
    } else if (activeType === 'logs') {
        logQuery += ` AND (l.review_text IS NULL OR length(trim(l.review_text)) = 0) AND l.rating > 0`;
    }

    logQuery += ` ORDER BY l.created_at DESC LIMIT 60`;

    let logActivities = db.prepare(logQuery).all();

    // Map log activities to distinguish between review and rating
    logActivities = logActivities.map(act => {
        const hasReview = act.review_text && act.review_text.trim().length > 0;
        return {
            ...act,
            kind: hasReview ? 'review' : 'log',
            isReview: hasReview
        };
    });

    // 2. Lists activities (when activeType is 'all' or 'lists')
    let listActivities = [];
    if (activeType === 'all' || activeType === 'lists') {
        let listSql = `
            SELECT 
                'list' AS activity_type,
                'list' AS kind,
                l.id AS activity_id,
                l.user_id,
                u.username,
                u.avatar_url,
                NULL AS anime_id,
                l.title AS anime_title,
                NULL AS anime_slug,
                NULL AS anime_cover,
                NULL AS anime_year,
                NULL AS anime_type,
                NULL AS episodes_count,
                0 AS rating,
                l.description AS review_text,
                0 AS contains_spoilers,
                0 AS is_liked,
                NULL AS watched_date,
                l.created_at,
                0 AS likes_count,
                0 AS comments_count,
                0 AS current_episode,
                NULL AS progress_status,
                l.id AS list_id,
                l.title AS list_title,
                l.description AS list_description,
                (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) AS item_count
            FROM lists l
            JOIN users u ON l.user_id = u.id
            WHERE l.is_private = 0
        `;
        if (activeFilter === 'following' && currentUserId) {
            listSql += ` AND l.user_id IN (SELECT following_id FROM follows WHERE follower_id = ${currentUserId})`;
        }
        listSql += ` ORDER BY l.created_at DESC LIMIT 20`;
        listActivities = db.prepare(listSql).all();

        // Attach sample posters for each list
        const getListPosters = db.prepare(`
            SELECT a.cover_image, a.title 
            FROM list_items li 
            JOIN anime a ON li.anime_id = a.id 
            WHERE li.list_id = ? 
            ORDER BY li.position ASC 
            LIMIT 4
        `);
        listActivities.forEach(l => {
            l.posters = getListPosters.all(l.list_id);
        });
    }

    // Combine and sort by date
    let allActivities = [...logActivities, ...listActivities];
    if (activeType === 'lists') {
        allActivities = listActivities;
    } else if (activeType === 'reviews' || activeType === 'logs') {
        allActivities = logActivities;
    }

    allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Check which reviews the current user liked
    if (currentUserId) {
        const likedLogIds = new Set(
            db.prepare('SELECT log_id FROM review_likes WHERE user_id = ?').all(currentUserId).map(r => r.log_id)
        );
        allActivities.forEach(act => {
            if (act.activity_type === 'log') {
                act.userHasLiked = likedLogIds.has(act.activity_id);
            }
        });
    }

    res.render('activity', {
        activities: allActivities,
        activeFilter,
        activeType,
        followsCount,
        currentUserId
    });
});

// --- FOOTER & INFORMATIONAL PAGES ---
app.get('/help', (req, res) => {
    res.render('help');
});

app.get('/terms', (req, res) => {
    res.render('terms');
});

app.get('/legal', (req, res) => {
    res.render('terms');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/api-docs', (req, res) => {
    res.render('api-docs');
});

app.get('/api', (req, res) => {
    res.render('api-docs');
});

// --- PRO MEMBERSHIP & PRICING PAGE ---
app.get('/pro', (req, res) => {
    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
    res.render('pro-pricing', {
        currentUser: currentUser || { is_pro: 0, pro_tier: 'free' }
    });
});

app.get('/pricing', (req, res) => {
    res.redirect('/pro');
});

// Demo toggle for Pro status
app.post('/api/user/toggle-pro', (req, res) => {
    const currentUserId = req.session.userId || (res.locals.user ? res.locals.user.id : 1);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newIsPro = user.is_pro ? 0 : 1;
    const newTier = newIsPro ? (req.body.tier || 'pro') : 'free';

    db.prepare('UPDATE users SET is_pro = ?, pro_tier = ? WHERE id = ?').run(newIsPro, newTier, currentUserId);
    if (req.session && req.session.user) {
        req.session.user.is_pro = newIsPro;
        req.session.user.pro_tier = newTier;
    }

    res.json({
        success: true,
        is_pro: Boolean(newIsPro),
        pro_tier: newTier,
        message: newIsPro ? `¡Möno ${newTier.toUpperCase()} activado exitosamente!` : 'Modo Free activado.'
    });
});

// --- API ROUTES: BACKEND CORE ---

// 1. Update Episode Progress
app.post('/api/progress/update', (req, res) => {
    const userId = req.session.userId || 1; // Fallback to demo user if not logged in
    const { slug, episode } = req.body;
    
    try {
        const anime = db.prepare('SELECT id, episodes_count, airing_status, aired_episodes FROM anime WHERE slug = ?').get(slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });
        
        let newEp = parseInt(episode, 10);
        if (isNaN(newEp) || newEp < 0) newEp = 0;

        const maxAired = (anime.airing_status === 'RELEASING' && anime.aired_episodes != null) ? anime.aired_episodes : (anime.episodes_count || 9999);

        // If trying to set beyond aired episodes in an ongoing show
        if (anime.airing_status === 'RELEASING' && newEp > maxAired) {
            return res.status(400).json({ 
                error: 'Not yet aired',
                isAiring: true,
                message: `Este anime está en emisión. Solo se han emitido ${maxAired} de ${anime.episodes_count || '?'} episodios hasta el momento.`,
                maxAired,
                totalEpisodes: anime.episodes_count
            });
        }

        if (newEp > anime.episodes_count) newEp = anime.episodes_count;
        
        const status = (anime.episodes_count && newEp >= anime.episodes_count && anime.airing_status !== 'RELEASING') ? 'completed' : 'watching';
        
        db.prepare(`
            INSERT INTO user_anime_progress (user_id, anime_id, current_episode, status, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, anime_id) DO UPDATE SET
                current_episode = excluded.current_episode,
                status = excluded.status,
                updated_at = CURRENT_TIMESTAMP
        `).run(userId, anime.id, newEp, status);
        
        res.json({ success: true, current_episode: newEp, status, maxAired });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// 2. Add Episode Review / Micro-Log
app.post('/api/episode/review', (req, res) => {
    const userId = req.session.userId || 1;
    const { slug, episodeNumber, rating, reviewText, containsSpoilers } = req.body;
    const floatRating = parseFloat(rating) || 0;
    
    try {
        const anime = db.prepare('SELECT id, episodes_count FROM anime WHERE slug = ?').get(slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });
        
        const epNum = parseInt(episodeNumber, 10) || 1;
        db.prepare(`
            INSERT INTO episode_reviews (user_id, anime_id, episode_number, rating, review_text, contains_spoilers)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, anime.id, epNum, floatRating, reviewText || '', containsSpoilers ? 1 : 0);

        // Also update/insert into logs so it updates the single activity entry for this anime!
        if (reviewText || floatRating > 0) {
            const reviewMsg = `[Episodio ${epNum}] ${reviewText || ''}`.trim();
            db.prepare(`
                INSERT INTO logs (user_id, anime_id, rating, review_text, contains_spoilers, is_liked, watched_date, created_at)
                VALUES (?, ?, ?, ?, ?, 0, CURRENT_DATE, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, anime_id) DO UPDATE SET
                    rating = CASE WHEN excluded.rating > 0 THEN excluded.rating ELSE logs.rating END,
                    review_text = CASE WHEN excluded.review_text != '' THEN excluded.review_text ELSE logs.review_text END,
                    contains_spoilers = excluded.contains_spoilers,
                    created_at = CURRENT_TIMESTAMP
            `).run(
                userId,
                anime.id,
                floatRating,
                reviewMsg,
                containsSpoilers ? 1 : 0
            );
        }

        // Update progress if current episode is higher
        db.prepare(`
            INSERT INTO user_anime_progress (user_id, anime_id, current_episode, status, updated_at)
            VALUES (?, ?, ?, 'watching', CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, anime_id) DO UPDATE SET
                current_episode = MAX(user_anime_progress.current_episode, excluded.current_episode),
                updated_at = CURRENT_TIMESTAMP
        `).run(userId, anime.id, epNum);
        
        res.json({ success: true, episodeNumber: epNum, rating: floatRating });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save episode review' });
    }
});

// 3. General Anime Log / Full Review & Watching Status
app.post('/api/anime/:slug/log', (req, res) => {
    const userId = req.session.userId || 1;
    const status = req.body.status || 'watching';
    const currentEpisode = req.body.currentEpisode ?? req.body.current_episode ?? 0;
    const rating = parseFloat(req.body.rating) || 0;
    const reviewText = req.body.reviewText ?? req.body.review ?? req.body.review_text ?? '';
    const containsSpoilers = req.body.containsSpoilers ?? req.body.contains_spoilers ?? false;
    const isLiked = req.body.isLiked ?? req.body.is_liked ?? req.body.isFavorite ?? req.body.is_favorite ?? false;
    const watchedDate = req.body.watchedDate ?? req.body.watched_date ?? '';
    
    try {
        const anime = db.prepare('SELECT id, episodes_count, airing_status, aired_episodes FROM anime WHERE slug = ?').get(req.params.slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });

        const maxAired = (anime.airing_status === 'RELEASING' && anime.aired_episodes != null) ? anime.aired_episodes : (anime.episodes_count || 9999);
        const parsedEp = parseInt(currentEpisode, 10) || 0;
        const validEp = Math.min(Math.max(parsedEp, 0), maxAired);
        const currentStatus = (anime.airing_status === 'RELEASING' && status === 'completed') ? 'watching' : (status || (validEp >= anime.episodes_count ? 'completed' : 'watching'));

        // 1. Update or Insert Progress
        if (currentStatus === 'watching' || currentStatus === 'completed' || currentStatus === 'dropped' || currentStatus === 'on_hold') {
            const epToSave = currentStatus === 'completed' ? anime.episodes_count : validEp;
            db.prepare(`
                INSERT INTO user_anime_progress (user_id, anime_id, current_episode, status, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, anime_id) DO UPDATE SET
                    current_episode = excluded.current_episode,
                    status = excluded.status,
                    updated_at = CURRENT_TIMESTAMP
            `).run(userId, anime.id, epToSave, currentStatus);
        } else if (currentStatus === 'plan_to_watch') {
            db.prepare('INSERT OR IGNORE INTO watchlist (user_id, anime_id) VALUES (?, ?)').run(userId, anime.id);
        }

        // 2. Save / Update Log Review (Atomic UPSERT on single entry per anime)
        if (reviewText || rating > 0 || currentStatus === 'completed') {
            db.prepare(`
                INSERT INTO logs (user_id, anime_id, rating, review_text, contains_spoilers, is_liked, watched_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, anime_id) DO UPDATE SET
                    rating = CASE WHEN excluded.rating > 0 THEN excluded.rating ELSE logs.rating END,
                    review_text = CASE WHEN excluded.review_text != '' THEN excluded.review_text ELSE logs.review_text END,
                    contains_spoilers = excluded.contains_spoilers,
                    is_liked = excluded.is_liked,
                    watched_date = CASE WHEN excluded.watched_date != '' THEN excluded.watched_date ELSE logs.watched_date END,
                    created_at = CURRENT_TIMESTAMP
            `).run(
                userId, 
                anime.id, 
                rating, 
                reviewText, 
                containsSpoilers ? 1 : 0, 
                isLiked ? 1 : 0, 
                watchedDate || new Date().toISOString().split('T')[0]
            );
        }

        res.json({ success: true, status: currentStatus, currentEpisode: parsedEp, rating });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to log anime' });
    }
});

// 4. Update Profile Top 5 Favorites
app.post('/api/profile/favorite', (req, res) => {
    const userId = req.session.userId || 1;
    const { position, slug } = req.body;
    const pos = parseInt(position, 10);
    
    if (!pos || pos < 1 || pos > 5) {
        return res.status(400).json({ error: 'Position must be between 1 and 5' });
    }
    
    try {
        const anime = db.prepare('SELECT id, slug, title, cover_image, release_year FROM anime WHERE slug = ?').get(slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });
        
        db.prepare(`
            INSERT INTO user_favorites (user_id, anime_id, position)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, position) DO UPDATE SET
                anime_id = excluded.anime_id,
                created_at = CURRENT_TIMESTAMP
        `).run(userId, anime.id, pos);
        
        res.json({ success: true, position: pos, anime });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to set favorite' });
    }
});

// 4b. Remove Favorite Slot
app.post('/api/profile/favorite/remove', (req, res) => {
    const userId = req.session.userId || 1;
    const { position } = req.body;
    const pos = parseInt(position, 10);
    
    if (!pos || pos < 1 || pos > 5) {
        return res.status(400).json({ error: 'Invalid position' });
    }
    
    try {
        db.prepare('DELETE FROM user_favorites WHERE user_id = ? AND position = ?').run(userId, pos);
        res.json({ success: true, position: pos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

// 5. Follow / Unfollow User Toggle
app.post('/api/user/:username/follow', (req, res) => {
    const currentUserId = req.session.userId || 1;
    
    try {
        const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });
        if (targetUser.id === currentUserId) return res.status(400).json({ error: 'Cannot follow yourself' });
        
        const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, targetUser.id);
        let isFollowing = false;
        
        if (existing) {
            db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
            isFollowing = false;
        } else {
            db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(currentUserId, targetUser.id);
            isFollowing = true;
            // Add notification
            db.prepare('INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, ?)').run(targetUser.id, currentUserId, 'follow');
        }
        
        const followersCount = db.prepare('SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?').get(targetUser.id).cnt;
        res.json({ success: true, isFollowing, followersCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle follow status' });
    }
});

// 6. Review Like Toggle
app.post('/api/review/:id/like', (req, res) => {
    const userId = req.session.userId || 1;
    const logId = parseInt(req.params.id, 10);
    
    try {
        const log = db.prepare('SELECT * FROM logs WHERE id = ?').get(logId);
        const existing = db.prepare('SELECT id FROM review_likes WHERE user_id = ? AND log_id = ?').get(userId, logId);
        let isLiked = false;
        
        if (existing) {
            db.prepare('DELETE FROM review_likes WHERE id = ?').run(existing.id);
            isLiked = false;
        } else {
            db.prepare('INSERT INTO review_likes (user_id, log_id) VALUES (?, ?)').run(userId, logId);
            isLiked = true;
            if (log && log.user_id !== userId) {
                db.prepare('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)').run(log.user_id, userId, 'like', logId);
            }
        }
        
        const likesCount = db.prepare('SELECT COUNT(*) as cnt FROM review_likes WHERE log_id = ?').get(logId).cnt;
        res.json({ success: true, isLiked, likesCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle review like' });
    }
});

// Review Comments APIs
app.get('/api/review/:id/comments', (req, res) => {
    const logId = parseInt(req.params.id, 10);
    try {
        const comments = db.prepare(`
            SELECT rc.*, u.username, u.avatar_url
            FROM review_comments rc
            JOIN users u ON rc.user_id = u.id
            WHERE rc.log_id = ?
            ORDER BY rc.created_at ASC
        `).all(logId);
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/review/:id/comment', (req, res) => {
    const userId = req.session.userId || 1;
    const logId = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content required' });

    try {
        const log = db.prepare('SELECT * FROM logs WHERE id = ?').get(logId);
        if (!log) return res.status(404).json({ error: 'Review not found' });

        const result = db.prepare('INSERT INTO review_comments (log_id, user_id, content) VALUES (?, ?, ?)').run(logId, userId, content.trim());
        
        if (log.user_id !== userId) {
            db.prepare('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)').run(log.user_id, userId, 'comment', logId);
        }

        const user = db.prepare('SELECT username, avatar_url FROM users WHERE id = ?').get(userId);
        res.json({
            success: true,
            comment: {
                id: result.lastInsertRowid,
                user_id: userId,
                content: content.trim(),
                created_at: new Date().toISOString(),
                username: user.username,
                avatar_url: user.avatar_url
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// Edit Comment API
app.post('/api/comment/:id/edit', (req, res) => {
    const userId = req.session.userId || 1;
    const commentId = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content cannot be empty' });

    try {
        const comment = db.prepare('SELECT * FROM review_comments WHERE id = ?').get(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== userId) return res.status(403).json({ error: 'Not authorized to edit this comment' });

        db.prepare('UPDATE review_comments SET content = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?').run(content.trim(), commentId);
        res.json({ success: true, content: content.trim() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to edit comment' });
    }
});

// Delete Comment API
app.post('/api/comment/:id/delete', (req, res) => {
    const userId = req.session.userId || 1;
    const commentId = parseInt(req.params.id, 10);

    try {
        const comment = db.prepare('SELECT * FROM review_comments WHERE id = ?').get(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== userId) return res.status(403).json({ error: 'Not authorized to delete this comment' });

        db.prepare('DELETE FROM review_comments WHERE id = ?').run(commentId);
        res.json({ success: true, id: commentId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// Notifications APIs
app.get('/api/notifications', (req, res) => {
    const userId = req.session.userId || 1;
    try {
        const notifications = db.prepare(`
            SELECT n.*, u.username as actor_username, u.avatar_url as actor_avatar
            FROM notifications n
            JOIN users u ON n.actor_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 25
        `).all(userId);

        const unreadCount = db.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).cnt;
        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

app.post('/api/notifications/mark-read', (req, res) => {
    const userId = req.session.userId || 1;
    try {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark read' });
    }
});

// Global Search API (Command Palette) — Anime only, max 10
app.get('/api/search/global', (req, res) => {
    const q = (req.query.q || '').trim();
    try {
        if (!q) {
            const anime = db.prepare('SELECT id, slug, title, cover_image, release_year as year, score, type, studio FROM anime ORDER BY score DESC LIMIT 10').all();
            return res.json({ anime });
        }

        const anime = db.prepare(`
            SELECT id, slug, title, cover_image, release_year as year, score, type, studio
            FROM anime
            WHERE title LIKE ? OR native_title LIKE ?
            ORDER BY score DESC
            LIMIT 10
        `).all(`%${q}%`, `%${q}%`);

        res.json({ anime });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// 7. Watchlist Toggle
app.post('/api/watchlist/toggle', (req, res) => {
    const userId = req.session.userId || 1;
    const { slug } = req.body;
    
    try {
        const anime = db.prepare('SELECT id FROM anime WHERE slug = ?').get(slug);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });
        
        const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND anime_id = ?').get(userId, anime.id);
        if (existing) {
            db.prepare('DELETE FROM watchlist WHERE id = ?').run(existing.id);
            res.json({ success: true, inWatchlist: false });
        } else {
            db.prepare('INSERT INTO watchlist (user_id, anime_id) VALUES (?, ?)').run(userId, anime.id);
            res.json({ success: true, inWatchlist: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle watchlist' });
    }
});

// 8. Dynamic Anime Search (from SQLite anime table)
app.get('/api/search/anime', (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    
    try {
        const results = db.prepare(`
            SELECT id, slug, title, release_year as year, studio, cover_image
            FROM anime
            WHERE title LIKE ? OR native_title LIKE ?
            LIMIT 8
        `).all(`%${q}%`, `%${q}%`);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Inline Profile Bio / Avatar / Banner
app.post('/api/profile/bio', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { bio } = req.body;
    try {
        db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio, req.session.userId);
        res.json({ success: true, bio });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update bio' });
    }
});

app.post('/api/profile/avatar', upload.single('avatar'), (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const avatarUrl = '/uploads/' + req.file.filename;
    try {
        db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.session.userId);
        res.json({ success: true, avatar_url: avatarUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update avatar' });
    }
});

app.post('/api/profile/banner', upload.single('banner'), (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const bannerUrl = '/uploads/' + req.file.filename;
    try {
        db.prepare('UPDATE users SET banner_url = ? WHERE id = ?').run(bannerUrl, req.session.userId);
        res.json({ success: true, banner_url: bannerUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

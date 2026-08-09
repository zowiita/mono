const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

// Enable Foreign Keys and WAL Mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initDb = () => {
    db.exec(`
        -- USERS
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            given_name TEXT DEFAULT '',
            family_name TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            location TEXT DEFAULT '',
            website TEXT DEFAULT '',
            pronoun TEXT DEFAULT '',
            avatar_url TEXT DEFAULT '',
            banner_url TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ANIME CATALOG
        CREATE TABLE IF NOT EXISTS anime (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            native_title TEXT DEFAULT '',
            type TEXT NOT NULL, -- 'tv', 'movie', 'special'
            episodes_count INTEGER DEFAULT 1,
            duration TEXT DEFAULT '',
            release_year INTEGER NOT NULL,
            studio TEXT DEFAULT '',
            synopsis TEXT DEFAULT '',
            cover_image TEXT NOT NULL,
            banner_image TEXT DEFAULT '',
            score REAL DEFAULT 0.0,
            airing_status TEXT DEFAULT 'FINISHED', -- 'FINISHED', 'RELEASING', 'NOT_YET_RELEASED'
            aired_episodes INTEGER DEFAULT NULL,
            season TEXT DEFAULT 'FALL', -- 'WINTER', 'SPRING', 'SUMMER', 'FALL'
            season_year INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- GENRES
        CREATE TABLE IF NOT EXISTS genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
        );

        -- ANIME <-> GENRES (Many to Many)
        CREATE TABLE IF NOT EXISTS anime_genres (
            anime_id INTEGER NOT NULL,
            genre_id INTEGER NOT NULL,
            PRIMARY KEY (anime_id, genre_id),
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
            FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
        );

        -- USER ANIME PROGRESS (Episode Tracker)
        CREATE TABLE IF NOT EXISTS user_anime_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            current_episode INTEGER DEFAULT 0,
            status TEXT DEFAULT 'watching', -- 'watching', 'completed', 'on_hold', 'dropped'
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, anime_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- EPISODE REVIEWS (Reviews per individual chapter)
        CREATE TABLE IF NOT EXISTS episode_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            episode_number INTEGER NOT NULL,
            rating REAL DEFAULT 0.0,
            review_text TEXT DEFAULT '',
            contains_spoilers INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- GENERAL ANIME LOGS & REVIEWS
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            rating REAL DEFAULT 0.0,
            review_text TEXT DEFAULT '',
            contains_spoilers INTEGER DEFAULT 0,
            is_liked INTEGER DEFAULT 0,
            watched_date TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, anime_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- WATCHLIST
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, anime_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- USER FAVORITES (Up to 4 pinned anime)
        CREATE TABLE IF NOT EXISTS user_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            position INTEGER NOT NULL, -- 1, 2, 3, 4
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, position),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- CUSTOM USER LISTS
        CREATE TABLE IF NOT EXISTS lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            is_private INTEGER DEFAULT 0,
            is_ranked INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- LIST ITEMS (Anime in lists)
        CREATE TABLE IF NOT EXISTS list_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            anime_id INTEGER NOT NULL,
            position INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(list_id, anime_id),
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
            FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
        );

        -- USER FOLLOWS (Social Network)
        CREATE TABLE IF NOT EXISTS follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- REVIEW LIKES
        CREATE TABLE IF NOT EXISTS review_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            log_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, log_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE CASCADE
        );

        -- REVIEW COMMENTS
        CREATE TABLE IF NOT EXISTS review_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- LIST LIKES
        CREATE TABLE IF NOT EXISTS list_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            list_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, list_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
        );

        -- LIST SAVES / FAVORITES (Bookmarked Lists)
        CREATE TABLE IF NOT EXISTS list_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            list_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, list_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
        );

        -- LIST COMMENTS
        CREATE TABLE IF NOT EXISTS list_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- NOTIFICATIONS (Follows, Likes, Comments)
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            actor_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'follow', 'like', 'comment'
            target_id INTEGER,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Seed Genres if empty
    const genreCount = db.prepare('SELECT COUNT(*) as count FROM genres').get();
    if (genreCount.count === 0) {
        const insertGenre = db.prepare('INSERT INTO genres (name, slug) VALUES (?, ?)');
        const genres = [
            ['Psychological', 'psychological'],
            ['Mecha', 'mecha'],
            ['Action', 'action'],
            ['Drama', 'drama'],
            ['Fantasy', 'fantasy'],
            ['Sci-Fi', 'sci-fi'],
            ['Adventure', 'adventure'],
            ['Romance', 'romance'],
            ['Slice of Life', 'slice-of-life']
        ];
        genres.forEach(g => insertGenre.run(g[0], g[1]));

        // Link Anime with Genres
        const insertAnimeGenre = db.prepare('INSERT OR IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)');
        
        // Evangelion (id: 4) -> Psychological (1), Mecha (2), Sci-Fi (6), Drama (4)
        [1, 2, 6, 4].forEach(gid => insertAnimeGenre.run(4, gid));
        // Frieren (id: 1) -> Fantasy (5), Adventure (7), Drama (4)
        [5, 7, 4].forEach(gid => insertAnimeGenre.run(1, gid));
        // Attack on Titan (id: 2) -> Action (3), Drama (4), Fantasy (5)
        [3, 4, 5].forEach(gid => insertAnimeGenre.run(2, gid));
        // Vinland Saga (id: 5) -> Action (3), Adventure (7), Drama (4)
        [3, 7, 4].forEach(gid => insertAnimeGenre.run(5, gid));
        // Violet Evergarden (id: 3) -> Drama (4), Slice of Life (9), Romance (8)
        [4, 9, 8].forEach(gid => insertAnimeGenre.run(3, gid));
    }

    // Seed default sample list if empty
    const listCount = db.prepare('SELECT COUNT(*) as count FROM lists').get();
    if (listCount.count === 0) {
        const listStmt = db.prepare('INSERT INTO lists (id, user_id, title, description, is_private, is_ranked) VALUES (?, ?, ?, ?, ?, ?)');
        listStmt.run(1, 1, 'Top 5 Psychological & Philosophical Masterpieces', 'A curated ranking of deep anime exploring human consciousness, identity, and profound emotions.', 0, 1);
        
        const itemStmt = db.prepare('INSERT OR IGNORE INTO list_items (list_id, anime_id, position) VALUES (?, ?, ?)');
        itemStmt.run(1, 4, 1); // Evangelion
        itemStmt.run(1, 1, 2); // Frieren
        itemStmt.run(1, 2, 3); // Attack on Titan
        itemStmt.run(1, 5, 4); // Vinland Saga
        itemStmt.run(1, 3, 5); // Violet Evergarden
    }
    // Migration: Add season and season_year if they don't exist
    try {
        const tableInfo = db.prepare("PRAGMA table_info(anime)").all();
        const hasSeason = tableInfo.some(c => c.name === 'season');
        if (!hasSeason) {
            db.exec("ALTER TABLE anime ADD COLUMN season TEXT DEFAULT 'FALL'");
        }
        const hasSeasonYear = tableInfo.some(c => c.name === 'season_year');
        if (!hasSeasonYear) {
            db.exec("ALTER TABLE anime ADD COLUMN season_year INTEGER DEFAULT NULL");
        }

        // Users Pro columns migration
        const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
        if (!userTableInfo.some(c => c.name === 'is_pro')) {
            db.exec("ALTER TABLE users ADD COLUMN is_pro INTEGER DEFAULT 0");
        }
        if (!userTableInfo.some(c => c.name === 'pro_tier')) {
            db.exec("ALTER TABLE users ADD COLUMN pro_tier TEXT DEFAULT 'free'");
        }
        if (!userTableInfo.some(c => c.name === 'profile_theme')) {
            db.exec("ALTER TABLE users ADD COLUMN profile_theme TEXT DEFAULT 'default'");
        }
    } catch (e) {
        console.error('Migration error:', e);
    }
};

initDb();

module.exports = db;


const db = require('../db.js');

console.log('Seeding rich viewing history for stats demo...');

// Get anime titles
const allAnime = db.prepare('SELECT id, title, slug, episodes_count, type, studio, release_year FROM anime LIMIT 60').all();

// Seed logs across months for user 1 (zowi) and demo users
const user = db.prepare('SELECT id FROM users WHERE username = ? OR id = 1 LIMIT 1').get('zowi') || { id: 1 };
const userId = user.id;

const sampleEntries = [
    { animeIndex: 0, rating: 5.0, date: '2026-08-04', rewatch: 0 },
    { animeIndex: 1, rating: 4.5, date: '2026-07-28', rewatch: 0 },
    { animeIndex: 2, rating: 4.5, date: '2026-06-20', rewatch: 1 },
    { animeIndex: 3, rating: 5.0, date: '2026-03-14', rewatch: 1 },
    { animeIndex: 4, rating: 5.0, date: '2026-07-15', rewatch: 0 },
    { animeIndex: 5, rating: 4.0, date: '2026-05-10', rewatch: 0 },
    { animeIndex: 6, rating: 4.5, date: '2026-05-22', rewatch: 0 },
    { animeIndex: 7, rating: 4.0, date: '2026-04-18', rewatch: 0 },
    { animeIndex: 8, rating: 5.0, date: '2026-04-02', rewatch: 0 },
    { animeIndex: 9, rating: 3.5, date: '2026-03-25', rewatch: 0 },
    { animeIndex: 10, rating: 4.5, date: '2026-02-14', rewatch: 0 },
    { animeIndex: 11, rating: 5.0, date: '2026-02-01', rewatch: 0 },
    { animeIndex: 12, rating: 4.0, date: '2026-01-20', rewatch: 0 },
    { animeIndex: 13, rating: 4.5, date: '2026-01-08', rewatch: 0 },
    // 2025 logs (Past Year Archive)
    { animeIndex: 14, rating: 5.0, date: '2025-11-15', rewatch: 0 },
    { animeIndex: 15, rating: 4.5, date: '2025-10-20', rewatch: 0 },
    { animeIndex: 16, rating: 4.0, date: '2025-08-12', rewatch: 0 },
    { animeIndex: 17, rating: 5.0, date: '2025-06-05', rewatch: 0 },
    { animeIndex: 18, rating: 4.5, date: '2025-04-18', rewatch: 0 },
    { animeIndex: 19, rating: 4.0, date: '2025-02-22', rewatch: 0 }
];

const insertLog = db.prepare(`
    INSERT INTO logs (user_id, anime_id, rating, review_text, contains_spoilers, is_liked, watched_date, created_at)
    VALUES (?, ?, ?, ?, 0, 1, ?, ? || ' 12:00:00')
    ON CONFLICT(user_id, anime_id) DO UPDATE SET
        rating = excluded.rating,
        watched_date = excluded.watched_date,
        created_at = excluded.created_at
`);

const insertProgress = db.prepare(`
    INSERT INTO user_anime_progress (user_id, anime_id, current_episode, status, updated_at)
    VALUES (?, ?, ?, 'completed', ? || ' 12:00:00')
    ON CONFLICT(user_id, anime_id) DO UPDATE SET
        current_episode = excluded.current_episode,
        status = 'completed'
`);

for (const entry of sampleEntries) {
    const a = allAnime[entry.animeIndex];
    if (a) {
        insertLog.run(userId, a.id, entry.rating, `Logged on ${entry.date}`, entry.date, entry.date);
        insertProgress.run(userId, a.id, a.episodes_count || 12, entry.date);
    }
}

console.log('Seeded logs and viewing history successfully!');

const bcrypt = require('bcrypt');
const db = require('./db');

console.log('Seeding database...');

// 1. Seed Genres
const genres = [
    { name: 'Action', slug: 'action' },
    { name: 'Psychological', slug: 'psychological' },
    { name: 'Mecha', slug: 'mecha' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Sci-Fi', slug: 'sci-fi' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Romance', slug: 'romance' }
];

const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name, slug) VALUES (?, ?)');
genres.forEach(g => insertGenre.run(g.name, g.slug));

// 2. Seed Anime Catalog
const animeList = [
    {
        slug: 'nge',
        title: 'Neon Genesis Evangelion',
        native_title: '新世紀エヴァンゲリオン',
        type: 'tv',
        episodes_count: 26,
        duration: '24m',
        release_year: 1995,
        studio: 'Gainax',
        synopsis: 'Fifteen years after Second Impact, Shinji Ikari is summoned to Tokyo-3 by his estranged father to pilot the giant biomechanical Evangelion Unit-01 against mysterious extraterrestrial beings known as Angels.',
        cover_image: '/images/nge_cover_1785281259269.png',
        banner_image: '/images/promo_banner_1785281243658.png',
        score: 4.72,
        genres: ['psychological', 'mecha', 'sci-fi', 'drama']
    },
    {
        slug: 'aot',
        title: 'Attack on Titan',
        native_title: '進撃の巨人',
        type: 'tv',
        episodes_count: 87,
        duration: '24m',
        release_year: 2013,
        studio: 'Wit Studio / MAPPA',
        synopsis: 'Centuries ago, mankind was slaughtered by monstrous humanoids called Titans. Eren Yeager pledges to rid the world of every last Titan after his hometown is decimated.',
        cover_image: '/images/aot_cover_1785281191397.png',
        banner_image: '',
        score: 4.78,
        genres: ['action', 'drama', 'fantasy', 'mystery']
    },
    {
        slug: 'frieren',
        title: "Frieren: Beyond Journey's End",
        native_title: '葬送のフリーレン',
        type: 'tv',
        episodes_count: 28,
        duration: '24m',
        release_year: 2023,
        studio: 'Madhouse',
        synopsis: 'An elf mage and her companions defeat the Demon King. As the years pass, Frieren reflects on human mortality and embarks on a nostalgic quest across the continent.',
        cover_image: '/images/frieren_cover_1785281175713.png',
        banner_image: '',
        score: 4.85,
        genres: ['adventure', 'drama', 'fantasy']
    },
    {
        slug: 'vinland',
        title: 'Vinland Saga',
        native_title: 'ヴィンランド・サガ',
        type: 'tv',
        episodes_count: 48,
        duration: '24m',
        release_year: 2019,
        studio: 'Wit Studio / MAPPA',
        synopsis: 'Raised by the Vikings who murdered his father, Thorfinn becomes a terrifying warrior, forever seeking to duel and kill the mercenary leader Askeladd.',
        cover_image: '/images/vinland_cover_1785281226165.png',
        banner_image: '',
        score: 4.68,
        genres: ['action', 'adventure', 'drama']
    },
    {
        slug: 'violet',
        title: 'Violet Evergarden',
        native_title: 'ヴァイオレット・エヴァーガーデン',
        type: 'tv',
        episodes_count: 13,
        duration: '24m',
        release_year: 2018,
        studio: 'Kyoto Animation',
        synopsis: 'A former child soldier begins working as an Auto Memory Doll, ghostwriting letters to understand the final words spoken by her Major: "I love you."',
        cover_image: '/images/violet_cover_1785281209933.png',
        banner_image: '',
        score: 4.65,
        genres: ['drama', 'romance']
    }
];

const insertAnime = db.prepare(`
    INSERT OR REPLACE INTO anime (slug, title, native_title, type, episodes_count, duration, release_year, studio, synopsis, cover_image, banner_image, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getGenreId = db.prepare('SELECT id FROM genres WHERE slug = ?');
const insertAnimeGenre = db.prepare('INSERT OR IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)');

animeList.forEach(a => {
    const res = insertAnime.run(a.slug, a.title, a.native_title, a.type, a.episodes_count, a.duration, a.release_year, a.studio, a.synopsis, a.cover_image, a.banner_image, a.score);
    const animeId = res.lastInsertRowid;
    
    a.genres.forEach(gSlug => {
        const genre = getGenreId.get(gSlug);
        if (genre) {
            insertAnimeGenre.run(animeId, genre.id);
        }
    });
});

// 3. Seed Demo User
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
let demoUserId;

if (!existingUser) {
    const hash = bcrypt.hashSync('password123', 10);
    const userRes = db.prepare(`
        INSERT INTO users (username, email, password_hash, given_name, family_name, bio, location, pronoun)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('demo', 'demo@example.com', hash, 'Demo', 'User', 'Anime enthusiast & letterboxd lover. Exploring psychological masterworks and fantasy epics.', 'Tokyo, Japan', 'they/them');
    demoUserId = userRes.lastInsertRowid;
} else {
    demoUserId = existingUser.id;
}

// 4. Seed User Watching Progress
const ngeId = db.prepare('SELECT id FROM anime WHERE slug = ?').get('nge').id;
const frierenId = db.prepare('SELECT id FROM anime WHERE slug = ?').get('frieren').id;

const insertProgress = db.prepare(`
    INSERT OR REPLACE INTO user_anime_progress (user_id, anime_id, current_episode, status)
    VALUES (?, ?, ?, ?)
`);

insertProgress.run(demoUserId, ngeId, 4, 'watching');
insertProgress.run(demoUserId, frierenId, 12, 'watching');

// 5. Seed Initial Reviews / Logs
const insertLog = db.prepare(`
    INSERT OR IGNORE INTO logs (user_id, anime_id, rating, review_text, contains_spoilers, is_liked, watched_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertLog.run(demoUserId, ngeId, 5.0, 'An absolute masterpiece that redefined the mecha genre and anime as a whole. The psychological depth is unmatched.', 0, 1, '2026-07-28');
insertLog.run(demoUserId, frierenId, 5.0, 'A beautiful reflection on time, memory, and the connections we make. Stunning animation and direction by Keiichiro Saito.', 0, 1, '2026-07-29');

console.log('Database seeded successfully!');

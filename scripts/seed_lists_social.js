const db = require('../db.js');

console.log('Seeding rich community lists and social interactions...');

const users = db.prepare('SELECT id, username FROM users').all();
const userMap = {};
users.forEach(u => userMap[u.username] = u.id);

function getUserId(username) {
    if (userMap[username]) return userMap[username];
    const found = db.prepare('SELECT id FROM users WHERE username = ? OR email LIKE ?').get(username, `${username}%`);
    if (found) {
        userMap[username] = found.id;
        return found.id;
    }
    const res = db.prepare(`
        INSERT INTO users (username, email, password_hash, given_name, bio, avatar_url)
        VALUES (?, ?, 'demo_hash', ?, ?, ?)
    `).run(username, `${username}_unique@example.com`, username, 'Anime enthusiast and list curator.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    userMap[username] = res.lastInsertRowid;
    return res.lastInsertRowid;
}

const u1 = getUserId('zowi');
const u2 = getUserId('hikari');
const u3 = getUserId('shinji_fan');
const u4 = getUserId('zeno_reviews');
const u5 = getUserId('spike');
const u6 = getUserId('motoko');

// Get available anime
const animeList = db.prepare('SELECT id, title, slug, cover_image FROM anime ORDER BY score DESC LIMIT 50').all();

// Define curated lists
const curatedLists = [
    {
        user_id: u5,
        title: 'Essential 90s Psychological & Cyberpunk Classics',
        description: 'The golden decade that defined philosophical anime, visceral hand-drawn sakuga, and futuristic atmosphere. A curated journey for enthusiasts.',
        is_ranked: 1,
        slugs: ['neon-genesis-evangelion', 'cowboy-bebop', 'ghost-in-the-shell', 'perfect-blue', 'serial-experiments-lain', 'trigun'],
        likes: [u1, u2, u3, u4, u6],
        saves: [u1, u2, u6],
        comments: [
            { user_id: u6, text: 'Incredible selection. Evangelion and Ghost in the Shell back to back is the ultimate 90s masterclass.' },
            { user_id: u3, text: 'Perfect Blue traumatized me in the best way possible. Satoshi Kon was a visionary.' },
            { user_id: u1, text: 'This list is peak aesthetic. Added Trigun to my watchlist immediately!' }
        ]
    },
    {
        user_id: u6,
        title: 'Modern Shonen Peak: High-Octane Sakuga & Direction',
        description: 'Shows and films from the current era that elevate battle shonen to absolute cinematic fine art through groundbreaking production values.',
        is_ranked: 1,
        slugs: ['jujutsu-kaisen-season-2', 'demon-slayer-kimetsu-no-yaiba-entertainment-district-arc', 'chainsaw-man', 'mob-psycho-100-iii', 'attack-on-titan-season-3-part-2', 'hunter-x-hunter-2011'],
        likes: [u1, u2, u3, u4, u5],
        saves: [u1, u5],
        comments: [
            { user_id: u5, text: 'Episode 16 & 17 of Shibuya Incident set a completely new bar for television anime direction.' },
            { user_id: u1, text: 'Mob Psycho 100 III final arc had me in tears. One of the most complete anime ever produced.' }
        ]
    },
    {
        user_id: u2,
        title: 'Kyoto Animation: Emotional Depth & Visual Splendor',
        description: 'A tribute to the irreplaceable artistry, nuanced character acting, and breathtaking lighting of Kyoto Animation studio.',
        is_ranked: 0,
        slugs: ['violet-evergarden', 'a-silent-voice', 'sound-euphonium', 'clannad-after-story', 'hyouka', 'liz-and-the-blue-bird'],
        likes: [u1, u3, u4, u5, u6],
        saves: [u1, u3, u4],
        comments: [
            { user_id: u1, text: 'Violet Evergarden Episode 10 will never fail to make anyone cry. Masterpiece.' },
            { user_id: u3, text: 'A Silent Voice is genuinely one of the most important animated films ever made.' }
        ]
    },
    {
        user_id: u3,
        title: 'Unforgettable Philosophical & Existential Masterpieces',
        description: 'Stories that challenge morality, question human nature, and linger in your thoughts long after the final credits roll.',
        is_ranked: 1,
        slugs: ['monster', 'vinland-saga-season-2', 'death-note', 'steinsgate', 'frieren-beyond-journeys-end', 'shinsekai-yori'],
        likes: [u1, u2, u4, u5, u6],
        saves: [u1, u2, u5],
        comments: [
            { user_id: u4, text: 'Vinland Saga Season 2 (Farmland Arc) is peak character growth. Thorfinn has no enemies.' },
            { user_id: u1, text: 'Monster and Steins;Gate in one list? Absolute cultured taste.' }
        ]
    },
    {
        user_id: u1,
        title: 'My All-Time Greatest Top 10 Anime Journey',
        description: 'My personal hall of fame. The anime that shaped my taste, left unforgettable memories, and set the standard for storytelling.',
        is_ranked: 1,
        slugs: ['frieren-beyond-journeys-end', 'fullmetal-alchemist-brotherhood', 'steinsgate', 'hunter-x-hunter-2011', 'spirited-away', 'your-name'],
        likes: [u2, u3, u4, u5, u6],
        saves: [u2, u5, u6],
        comments: [
            { user_id: u5, text: 'Impeccable top tier taste! Steins;Gate and Frieren deserve every praise.' },
            { user_id: u2, text: 'Your Name and Spirited Away give this list such warm, timeless cinema magic.' }
        ]
    }
];

const insertList = db.prepare(`
    INSERT INTO lists (user_id, title, description, is_private, is_ranked)
    VALUES (?, ?, ?, 0, ?)
`);

const insertItem = db.prepare(`
    INSERT OR IGNORE INTO list_items (list_id, anime_id, position, notes)
    VALUES (?, ?, ?, ?)
`);

const insertLike = db.prepare(`
    INSERT OR IGNORE INTO list_likes (user_id, list_id)
    VALUES (?, ?)
`);

const insertSave = db.prepare(`
    INSERT OR IGNORE INTO list_saves (user_id, list_id)
    VALUES (?, ?)
`);

const insertComment = db.prepare(`
    INSERT INTO list_comments (list_id, user_id, content)
    VALUES (?, ?, ?)
`);

for (const l of curatedLists) {
    let listId;
    const existing = db.prepare('SELECT id FROM lists WHERE title = ?').get(l.title);
    if (existing) {
        listId = existing.id;
    } else {
        const res = insertList.run(l.user_id, l.title, l.description, l.is_ranked);
        listId = res.lastInsertRowid;
    }

    let pos = 1;
    for (const slug of l.slugs) {
        let anime = db.prepare('SELECT id FROM anime WHERE slug = ? OR title LIKE ? LIMIT 1').get(slug, `%${slug.replace(/-/g, ' ')}%`);
        if (!anime && animeList[pos - 1]) anime = animeList[pos - 1];
        if (anime) {
            insertItem.run(listId, anime.id, pos, `Ranked #${pos} in this curation.`);
            pos++;
        }
    }

    if (l.likes) {
        for (const uid of l.likes) {
            insertLike.run(uid, listId);
        }
    }

    if (l.saves) {
        for (const uid of l.saves) {
            insertSave.run(uid, listId);
        }
    }

    if (l.comments) {
        for (const c of l.comments) {
            const commentExists = db.prepare('SELECT id FROM list_comments WHERE list_id = ? AND user_id = ? AND content = ?').get(listId, c.user_id, c.text);
            if (!commentExists) {
                insertComment.run(listId, c.user_id, c.text);
            }
        }
    }
}

console.log('Seeded community lists, likes, comments, and saves successfully!');

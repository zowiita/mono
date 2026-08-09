const db = require('../db.js');
const bcrypt = require('bcrypt');

const seedActivityData = () => {
    console.log('Seeding community users and social activity...');
    const hash = bcrypt.hashSync('password123', 10);

    // Insert community users if not existing
    const users = [
        { username: 'miwazoe', email: 'miwazoe@example.com', bio: 'Animation critic, Ghibli enthusiast and mecha aficionado.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
        { username: 'hikari', email: 'hikari@example.com', bio: 'Binge-watching 90s classic OVAs & modern psychological thrillers.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200' },
        { username: 'shinji_fan', email: 'shinji@example.com', bio: 'Get in the robot. Anno cinema obsessive.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
        { username: 'zeno_reviews', email: 'zeno@example.com', bio: 'Writing in-depth narrative analyses on modern seasonal masterworks.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }
    ];

    const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (username, email, password_hash, bio, avatar_url)
        VALUES (@username, @email, '${hash}', @bio, @avatar)
    `);

    users.forEach(u => insertUser.run(u));

    // Get all user IDs
    const allUsers = db.prepare('SELECT id, username FROM users').all();
    const userMap = {};
    allUsers.forEach(u => userMap[u.username] = u.id);

    // Get some popular animes
    const animes = db.prepare('SELECT id, slug, title, episodes_count, type FROM anime LIMIT 50').all();
    if (animes.length === 0) return;

    const findAnime = (slugSub) => animes.find(a => a.slug.includes(slugSub)) || animes[0];

    const frieren = findAnime('frieren');
    const evangelion = findAnime('evangelion') || findAnime('nge');
    const aot = findAnime('attack-on-titan') || findAnime('titan');
    const vinland = findAnime('vinland');
    const violet = findAnime('violet');
    const steins = findAnime('steins') || animes[1];
    const deathnote = findAnime('death-note') || animes[2];
    const spirited = findAnime('spirited') || animes[3];
    const yourname = findAnime('your-name') || findAnime('kimi-no-na-wa') || animes[4];
    const cowboy = findAnime('cowboy') || animes[5];

    // Follow relationships
    const insertFollow = db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)');
    // zowi follows miwazoe, shinji_fan, hikari
    if (userMap['zowi'] && userMap['miwazoe']) insertFollow.run(userMap['zowi'], userMap['miwazoe']);
    if (userMap['zowi'] && userMap['shinji_fan']) insertFollow.run(userMap['zowi'], userMap['shinji_fan']);
    if (userMap['zowi'] && userMap['hikari']) insertFollow.run(userMap['zowi'], userMap['hikari']);
    if (userMap['demo'] && userMap['miwazoe']) insertFollow.run(userMap['demo'], userMap['miwazoe']);
    if (userMap['demo'] && userMap['zeno_reviews']) insertFollow.run(userMap['demo'], userMap['zeno_reviews']);
    if (userMap['miwazoe'] && userMap['zowi']) insertFollow.run(userMap['miwazoe'], userMap['zowi']);

    // Insert rich logs & reviews with realistic dates (spanning 2026 and 2025)
    const insertLog = db.prepare(`
        INSERT OR REPLACE INTO logs (user_id, anime_id, rating, review_text, contains_spoilers, is_liked, watched_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Zoe's / Zowi's diary entries
    if (userMap['zowi']) {
        insertLog.run(userMap['zowi'], evangelion.id, 5.0, 'An absolute masterpiece that redefined the psychological mecha genre. The character introspection in episodes 25-26 remains unmatched in modern media.', 0, 1, '2026-08-06', '2026-08-06 18:30:00');
        insertLog.run(userMap['zowi'], frieren.id, 5.0, 'A beautiful reflection on time, mortality, memory, and the connections we make. Stunning direction by Keiichiro Saito and breathtaking animation by Madhouse.', 0, 1, '2026-08-04', '2026-08-04 21:15:00');
        insertLog.run(userMap['zowi'], aot.id, 4.5, 'Incredible world-building and plot twists. The narrative tension is relentless from the very first episode.', 0, 1, '2026-07-28', '2026-07-28 14:00:00');
        insertLog.run(userMap['zowi'], vinland.id, 5.0, 'Season 2 is one of the greatest character redemption arcs ever committed to animation. True warrior ethos.', 0, 1, '2026-07-15', '2026-07-15 20:00:00');
        insertLog.run(userMap['zowi'], violet.id, 4.5, 'Episode 10 tore my heart out. Kyoto Animation at the pinnacle of expressive craft.', 0, 1, '2026-06-20', '2026-06-20 22:30:00');
        insertLog.run(userMap['zowi'], yourname.id, 4.5, 'Spectacular visuals and Radwimps score elevate what could have been a simple body swap into a celestial romance.', 0, 1, '2026-05-12', '2026-05-12 21:00:00');
        insertLog.run(userMap['zowi'], spirited.id, 5.0, 'Miyazaki at his most mythical and atmospheric. Rewatched for the 10th time and still discover new subtleties.', 0, 1, '2026-04-02', '2026-04-02 19:45:00');
        insertLog.run(userMap['zowi'], cowboy.id, 5.0, 'See you space cowboy... The blues, the jazz, the melancholic noir atmosphere.', 0, 1, '2026-03-14', '2026-03-14 23:10:00');
        insertLog.run(userMap['zowi'], steins.id, 4.5, 'El Psy Kongroo. The pacing in the second half is pure adrenaline.', 0, 0, '2026-02-18', '2026-02-18 16:20:00');
        insertLog.run(userMap['zowi'], deathnote.id, 4.0, 'The mental chess matches between Light and L are legendary.', 0, 0, '2026-01-09', '2026-01-09 17:00:00');
    }

    // Miwazoe logs
    if (userMap['miwazoe']) {
        insertLog.run(userMap['miwazoe'], frieren.id, 5.0, 'Rewatched the Mage Exam arc. Denken vs Frieren is top tier tactical magic choreography.', 0, 1, '2026-08-06', '2026-08-06 20:10:00');
        insertLog.run(userMap['miwazoe'], spirited.id, 5.0, 'The train sequence over the flooded tracks remains the single most poetic cinematic sequence in Ghibli history.', 0, 1, '2026-08-05', '2026-08-05 15:40:00');
        insertLog.run(userMap['miwazoe'], violet.id, 5.0, 'Emotional resonance turned to maximum. The parasol jump sequence is iconic.', 0, 1, '2026-08-03', '2026-08-03 12:00:00');
    }

    // Shinji_fan logs
    if (userMap['shinji_fan']) {
        insertLog.run(userMap['shinji_fan'], evangelion.id, 5.0, 'The End of Evangelion is the ultimate cinematic culmination of existential psychoanalysis.', 0, 1, '2026-08-06', '2026-08-06 19:00:00');
        insertLog.run(userMap['shinji_fan'], cowboy.id, 4.5, 'Watanabe and Kanno working in sublime harmony.', 0, 1, '2026-08-02', '2026-08-02 22:00:00');
    }

    // Hikari logs
    if (userMap['hikari']) {
        insertLog.run(userMap['hikari'], steins.id, 5.0, 'The time travel mechanics are so tightly written. Okabe Rintaro is a tragic hero.', 0, 1, '2026-08-06', '2026-08-06 11:20:00');
        insertLog.run(userMap['hikari'], yourname.id, 5.0, 'The twilight meeting scene (Kataware-doki) gives me chills every single time.', 0, 1, '2026-08-05', '2026-08-05 18:30:00');
    }

    // Zeno_reviews logs
    if (userMap['zeno_reviews']) {
        insertLog.run(userMap['zeno_reviews'], vinland.id, 5.0, 'Vinland Saga Season 2 transforms historical fiction into a philosophical treatise on pacifism and redemption.', 0, 1, '2026-08-06', '2026-08-06 14:00:00');
        insertLog.run(userMap['zeno_reviews'], aot.id, 5.0, 'The thematic symmetry between the first and final episode is breathtaking narrative architecture.', 0, 1, '2026-08-01', '2026-08-01 10:15:00');
    }

    // Seed User Anime Progress (Episode Milestones)
    const insertProg = db.prepare(`
        INSERT OR REPLACE INTO user_anime_progress (user_id, anime_id, current_episode, status, updated_at)
        VALUES (?, ?, ?, ?, ?)
    `);

    if (userMap['zowi']) {
        insertProg.run(userMap['zowi'], frieren.id, 28, 'completed', '2026-08-06 18:30:00');
        insertProg.run(userMap['zowi'], evangelion.id, 26, 'completed', '2026-08-06 16:00:00');
        insertProg.run(userMap['zowi'], vinland.id, 24, 'watching', '2026-08-05 23:00:00');
    }
    if (userMap['miwazoe']) {
        insertProg.run(userMap['miwazoe'], frieren.id, 28, 'completed', '2026-08-06 20:10:00');
        insertProg.run(userMap['miwazoe'], aot.id, 16, 'watching', '2026-08-06 17:00:00');
    }
    if (userMap['shinji_fan']) {
        insertProg.run(userMap['shinji_fan'], evangelion.id, 26, 'completed', '2026-08-06 19:00:00');
    }
    if (userMap['hikari']) {
        insertProg.run(userMap['hikari'], steins.id, 24, 'completed', '2026-08-06 11:20:00');
    }

    console.log('Seeding completed successfully!');
};

seedActivityData();

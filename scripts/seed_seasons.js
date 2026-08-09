const db = require('../db.js');

console.log('Seeding and updating seasonal anime metadata...');

// 1. Specific known masterpieces and famous seasonal assignments
const knownSeasonMapping = {
    // 2026 & 2025 Seasons
    'solo-leveling-season-2': { season: 'WINTER', year: 2025, status: 'FINISHED' },
    'frieren-beyond-journeys-end': { season: 'FALL', year: 2023, status: 'FINISHED' },
    'dandadan': { season: 'FALL', year: 2024, status: 'FINISHED' },
    'chainsaw-man': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'jujutsu-kaisen-season-2': { season: 'SUMMER', year: 2023, status: 'FINISHED' },
    'jujutsu-kaisen': { season: 'FALL', year: 2020, status: 'FINISHED' },
    'demon-slayer-kimetsu-no-yaiba-hashira-training-arc': { season: 'SPRING', year: 2024, status: 'FINISHED' },
    'demon-slayer-kimetsu-no-yaiba': { season: 'SPRING', year: 2019, status: 'FINISHED' },
    'demon-slayer-kimetsu-no-yaiba-entertainment-district-arc': { season: 'FALL', year: 2021, status: 'FINISHED' },
    'demon-slayer-kimetsu-no-yaiba-swordsmith-village-arc': { season: 'SPRING', year: 2023, status: 'FINISHED' },
    'oshi-no-ko': { season: 'SPRING', year: 2023, status: 'FINISHED' },
    'oshi-no-ko-season-2': { season: 'SUMMER', year: 2024, status: 'FINISHED' },
    'bleach-thousand-year-blood-war': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'bleach-thousand-year-blood-war-the-conflict': { season: 'FALL', year: 2024, status: 'FINISHED' },
    'bocchi-the-rock': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'cyberpunk-edgerunners': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'the-apothecary-diaries': { season: 'FALL', year: 2023, status: 'FINISHED' },
    'the-apothecary-diaries-season-2': { season: 'WINTER', year: 2025, status: 'FINISHED' },
    'attack-on-titan': { season: 'SPRING', year: 2013, status: 'FINISHED' },
    'attack-on-titan-season-2': { season: 'SPRING', year: 2017, status: 'FINISHED' },
    'attack-on-titan-season-3': { season: 'SUMMER', year: 2018, status: 'FINISHED' },
    'attack-on-titan-the-final-season': { season: 'WINTER', year: 2021, status: 'FINISHED' },
    'attack-on-titan-the-final-season-part-2': { season: 'WINTER', year: 2022, status: 'FINISHED' },
    'vinland-saga': { season: 'SUMMER', year: 2019, status: 'FINISHED' },
    'vinland-saga-season-2': { season: 'WINTER', year: 2023, status: 'FINISHED' },
    'violet-evergarden': { season: 'WINTER', year: 2018, status: 'FINISHED' },
    'neon-genesis-evangelion': { season: 'FALL', year: 1995, status: 'FINISHED' },
    'fullmetal-alchemist-brotherhood': { season: 'SPRING', year: 2009, status: 'FINISHED' },
    'steins-gate': { season: 'SPRING', year: 2011, status: 'FINISHED' },
    'hunter-x-hunter-2011': { season: 'FALL', year: 2011, status: 'FINISHED' },
    'death-note': { season: 'FALL', year: 2006, status: 'FINISHED' },
    'code-geass-lelouch-of-the-rebellion': { season: 'FALL', year: 2006, status: 'FINISHED' },
    'cowboy-bebop': { season: 'SPRING', year: 1998, status: 'FINISHED' },
    'mob-psycho-100': { season: 'SUMMER', year: 2016, status: 'FINISHED' },
    'mob-psycho-100-ii': { season: 'WINTER', year: 2019, status: 'FINISHED' },
    'mob-psycho-100-iii': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'spy-x-family': { season: 'SPRING', year: 2022, status: 'FINISHED' },
    'spy-x-family-season-2': { season: 'FALL', year: 2023, status: 'FINISHED' },
    'kaguya-sama-love-is-war': { season: 'WINTER', year: 2019, status: 'FINISHED' },
    'kaguya-sama-love-is-war-ultra-romantic': { season: 'SPRING', year: 2022, status: 'FINISHED' },
    'haikyuu': { season: 'SPRING', year: 2014, status: 'FINISHED' },
    'spirited-away': { season: 'SUMMER', year: 2001, status: 'FINISHED' },
    'your-name': { season: 'SUMMER', year: 2016, status: 'FINISHED' },
    'a-silent-voice': { season: 'FALL', year: 2016, status: 'FINISHED' },
    'suzume': { season: 'FALL', year: 2022, status: 'FINISHED' },
    'the-boy-and-the-heron': { season: 'SUMMER', year: 2023, status: 'FINISHED' },
    'look-back': { season: 'SUMMER', year: 2024, status: 'FINISHED' }
};

// 2. Fetch all anime
const allAnime = db.prepare('SELECT id, slug, title, release_year, type, airing_status, score FROM anime').all();

const updateStmt = db.prepare('UPDATE anime SET season = ?, season_year = ? WHERE id = ?');

const seasonsPool = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

db.transaction(() => {
    allAnime.forEach((anime, idx) => {
        let season = 'FALL';
        let seasonYear = anime.release_year || 2023;

        if (knownSeasonMapping[anime.slug]) {
            season = knownSeasonMapping[anime.slug].season;
            seasonYear = knownSeasonMapping[anime.slug].year;
        } else {
            // Assign season deterministically based on hash of id
            const sIdx = (anime.id * 7 + (anime.release_year || 2020)) % 4;
            season = seasonsPool[sIdx];
            seasonYear = anime.release_year || 2024;
        }

        updateStmt.run(season, seasonYear, anime.id);
    });
})();

// 3. Ensure 2026 has rich and exciting ongoing & scheduled seasonal anime
const seed2026Anime = [
    {
        slug: 'chainsaw-man-movie-reze-arc',
        title: 'Chainsaw Man: The Movie - Reze Arc',
        native_title: '劇場版 チェンソーマン レゼ篇',
        type: 'movie',
        episodes_count: 1,
        duration: '100m',
        release_year: 2026,
        studio: 'MAPPA',
        synopsis: 'Denji meets Reze, a mysterious girl working at a coffee shop who seems genuinely fond of him. But in the world of devil hunters, nothing is as sweet or simple as it looks.',
        cover_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
        score: 9.2,
        airing_status: 'NOT_YET_RELEASED',
        aired_episodes: 0,
        season: 'SUMMER',
        season_year: 2026
    },
    {
        slug: 'jujutsu-kaisen-culling-game',
        title: 'JUJUTSU KAISEN: Culling Game Arc',
        native_title: '呪術廻戦 死滅回游',
        type: 'tv',
        episodes_count: 24,
        duration: '24m',
        release_year: 2026,
        studio: 'MAPPA',
        synopsis: 'Following the devastating Shibuya Incident, ancient curse user Noritoshi Kamo initiates the lethal ritual known as the Culling Game, trapping thousands in blood sport across Japan.',
        cover_image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        score: 9.1,
        airing_status: 'NOT_YET_RELEASED',
        aired_episodes: 0,
        season: 'FALL',
        season_year: 2026
    },
    {
        slug: 'frieren-season-2',
        title: "Frieren: Beyond Journey's End Season 2",
        native_title: '葬送のフリーレン 第2期',
        type: 'tv',
        episodes_count: 24,
        duration: '24m',
        release_year: 2026,
        studio: 'Madhouse',
        synopsis: 'Frieren, Fern, and Stark continue their peaceful yet nostalgic journey northward to Aureole, the resting place of souls, crossing perilous plateaus and forging new bonds.',
        cover_image: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
        score: 9.4,
        airing_status: 'NOT_YET_RELEASED',
        aired_episodes: 0,
        season: 'FALL',
        season_year: 2026
    },
    {
        slug: 'one-piece-egghead-climax',
        title: 'One Piece: Egghead Island Arc',
        native_title: 'ワンピース エッグヘッド編',
        type: 'tv',
        episodes_count: 50,
        duration: '24m',
        release_year: 2026,
        studio: 'Toei Animation',
        synopsis: 'The Straw Hat Pirates arrive on the island of the future, Egghead, meeting the genius scientist Dr. Vegapunk and confronting the World Government’s ultimate military might.',
        cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        score: 9.0,
        airing_status: 'RELEASING',
        aired_episodes: 28,
        season: 'WINTER',
        season_year: 2026
    },
    {
        slug: 'my-hero-academia-final-season',
        title: 'My Hero Academia: The Final Season',
        native_title: '僕のヒーローアカデミア FINAL SEASON',
        type: 'tv',
        episodes_count: 12,
        duration: '24m',
        release_year: 2026,
        studio: 'Bones',
        synopsis: 'The climactic final clash between the hero society led by Deku and the All For One coalition reaches its ultimate destiny in a ruined world.',
        cover_image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=80',
        score: 8.7,
        airing_status: 'RELEASING',
        aired_episodes: 8,
        season: 'SPRING',
        season_year: 2026
    },
    {
        slug: 'dandadan-season-2',
        title: 'Dandadan Season 2',
        native_title: 'ダンダダン 第2期',
        type: 'tv',
        episodes_count: 12,
        duration: '24m',
        release_year: 2026,
        studio: 'Science SARU',
        synopsis: 'Momo Ayase and Okarun return for more high-octane occult antics, facing bizarre alien syndicates and terrifying urban legends with heart and hilarity.',
        cover_image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
        banner_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        score: 8.9,
        airing_status: 'NOT_YET_RELEASED',
        aired_episodes: 0,
        season: 'SUMMER',
        season_year: 2026
    }
];

const insertAnimeStmt = db.prepare(`
    INSERT INTO anime (slug, title, native_title, type, episodes_count, duration, release_year, studio, synopsis, cover_image, banner_image, score, airing_status, aired_episodes, season, season_year)
    VALUES (@slug, @title, @native_title, @type, @episodes_count, @duration, @release_year, @studio, @synopsis, @cover_image, @banner_image, @score, @airing_status, @aired_episodes, @season, @season_year)
    ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        native_title = excluded.native_title,
        type = excluded.type,
        episodes_count = excluded.episodes_count,
        studio = excluded.studio,
        synopsis = excluded.synopsis,
        cover_image = excluded.cover_image,
        banner_image = excluded.banner_image,
        score = excluded.score,
        airing_status = excluded.airing_status,
        aired_episodes = excluded.aired_episodes,
        season = excluded.season,
        season_year = excluded.season_year
`);

seed2026Anime.forEach(item => {
    insertAnimeStmt.run(item);
});

console.log('Seeding completed successfully!');
console.log('Season distribution summary:');
const seasonSummary = db.prepare(`
    SELECT season_year, season, COUNT(*) as cnt 
    FROM anime 
    WHERE season_year >= 2022 
    GROUP BY season_year, season 
    ORDER BY season_year DESC, season ASC
`).all();
console.table(seasonSummary);

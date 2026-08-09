const https = require('https');
const db = require('../db');

function fetchAniList(query, variables) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query, variables });
        const req = https.request('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'MonoAnimeApp/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.errors) {
                        return reject(new Error(JSON.stringify(parsed.errors)));
                    }
                    resolve(parsed.data);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function cleanDescription(desc) {
    if (!desc) return '';
    return desc
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<i>(.*?)<\/i>/gi, '$1')
        .replace(/<b>(.*?)<\/b>/gi, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();
}

const query = `
query ($page: Int, $perPage: Int, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(type: ANIME, format: $format, sort: SCORE_DESC, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      format
      episodes
      duration
      startDate {
        year
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
      description
      coverImage {
        extraLarge
        large
      }
      bannerImage
      averageScore
      status
      genres
    }
  }
}
`;

async function syncCatalog() {
    console.log('Fetching Top Anime from AniList...');

    const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name, slug) VALUES (?, ?)');
    const getGenre = db.prepare('SELECT id FROM genres WHERE slug = ?');
    const insertAnime = db.prepare(`
        INSERT INTO anime (slug, title, native_title, type, episodes_count, duration, release_year, studio, synopsis, cover_image, banner_image, score, airing_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
            score=excluded.score,
            cover_image=excluded.cover_image,
            banner_image=COALESCE(excluded.banner_image, anime.banner_image),
            synopsis=COALESCE(excluded.synopsis, anime.synopsis),
            studio=COALESCE(excluded.studio, anime.studio)
    `);
    const insertAnimeGenre = db.prepare('INSERT OR IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)');
    const getAnimeId = db.prepare('SELECT id FROM anime WHERE slug = ?');

    // 1. Fetch Top 100 TV series (2 pages of 50)
    for (let page = 1; page <= 2; page++) {
        console.log(`Fetching TV Series page ${page}...`);
        const data = await fetchAniList(query, { page, perPage: 50, format: 'TV' });
        const mediaList = data.Page.media || [];
        for (const item of mediaList) {
            saveItem(item, 'tv', insertGenre, getGenre, insertAnime, insertAnimeGenre, getAnimeId);
        }
    }

    // 2. Fetch Top 100 Movies (2 pages of 50)
    for (let page = 1; page <= 2; page++) {
        console.log(`Fetching Movies page ${page}...`);
        const data = await fetchAniList(query, { page, perPage: 50, format: 'MOVIE' });
        const mediaList = data.Page.media || [];
        for (const item of mediaList) {
            saveItem(item, 'movie', insertGenre, getGenre, insertAnime, insertAnimeGenre, getAnimeId);
        }
    }

    console.log('Finished syncing Top 100 Series and Movies!');
}

function saveItem(item, type, insertGenre, getGenre, insertAnime, insertAnimeGenre, getAnimeId) {
    const title = item.title.english || item.title.romaji || 'Untitled Anime';
    const native_title = item.title.native || '';
    let slug = slugify(title);
    if (!slug) slug = `anime-${item.id}`;

    const release_year = item.startDate?.year || 2023;
    const episodes_count = item.episodes || 1;
    const duration = item.duration ? `${item.duration}m` : (type === 'movie' ? '120m' : '24m');
    const studio = item.studios?.nodes?.[0]?.name || 'Unknown Studio';
    const synopsis = cleanDescription(item.description);
    const cover_image = item.coverImage?.extraLarge || item.coverImage?.large || '';
    const banner_image = item.bannerImage || '';
    // AniList score is 0-100, convert to 5-star scale e.g. 90 -> 4.5
    const score = item.averageScore ? Math.round((item.averageScore / 20) * 10) / 10 : 4.0;
    const airing_status = item.status || 'FINISHED';

    try {
        insertAnime.run(slug, title, native_title, type, episodes_count, duration, release_year, studio, synopsis, cover_image, banner_image, score, airing_status);
        const animeRow = getAnimeId.get(slug);
        if (animeRow && item.genres) {
            for (const gName of item.genres) {
                const gSlug = slugify(gName);
                insertGenre.run(gName, gSlug);
                const gRow = getGenre.get(gSlug);
                if (gRow) {
                    insertAnimeGenre.run(animeRow.id, gRow.id);
                }
            }
        }
    } catch (e) {
        console.error(`Error saving ${title}:`, e.message);
    }
}

syncCatalog().then(() => {
    const count = db.prepare('SELECT count(*) as cnt FROM anime').get();
    console.log('Total anime now in database:', count.cnt);
    process.exit(0);
}).catch(err => {
    console.error('Fatal sync error:', err);
    process.exit(1);
});

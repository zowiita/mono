const https = require('https');
const db = require('./db');

function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ query, variables });
        const req = https.request('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.errors) {
                        return reject(new Error(JSON.stringify(json.errors)));
                    }
                    resolve(json.data);
                } catch (e) {
                    reject(new Error('Invalid JSON: ' + body.substring(0, 200)));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

const query = `
query ($page: Int, $perPage: Int, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, format: $format, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      format
      episodes
      duration
      seasonYear
      startDate {
        year
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
      averageScore
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
      genres
    }
  }
}
`;

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function cleanDescription(desc) {
    if (!desc) return '';
    return desc.replace(/<br\s*\/?>/gi, '\n')
               .replace(/<\/?i>/gi, '')
               .replace(/<\/?b>/gi, '')
               .replace(/<\/?p>/gi, '')
               .replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>');
}

async function run() {
    console.log('Fetching Top 50 Anime Series...');
    const seriesData = await fetchGraphQL(query, { page: 1, perPage: 50, format: 'TV' });
    const seriesList = seriesData.Page.media;
    console.log(`Fetched ${seriesList.length} TV series.`);

    // Delay 1 second to respect rate limits
    await new Promise(r => setTimeout(r, 1000));

    console.log('Fetching Top 50 Anime Movies...');
    const moviesData = await fetchGraphQL(query, { page: 1, perPage: 50, format: 'MOVIE' });
    const moviesList = moviesData.Page.media;
    console.log(`Fetched ${moviesList.length} Movies.`);

    const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name, slug) VALUES (?, ?)');
    const getGenreId = db.prepare('SELECT id FROM genres WHERE slug = ?');
    const insertAnime = db.prepare(`
        INSERT OR REPLACE INTO anime (slug, title, native_title, type, episodes_count, duration, release_year, studio, synopsis, cover_image, banner_image, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAnimeGenre = db.prepare('INSERT OR IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)');

    const allAnime = [
        ...seriesList.map(item => ({ ...item, _type: 'tv' })),
        ...moviesList.map(item => ({ ...item, _type: 'movie' }))
    ];

    const usedSlugs = new Set();

    let count = 0;
    for (const item of allAnime) {
        const title = item.title.english || item.title.romaji || 'Unknown Title';
        const nativeTitle = item.title.native || '';
        let baseSlug = slugify(item.title.english || item.title.romaji || `anime-${item.id}`);
        if (!baseSlug) baseSlug = `anime-${item.id}`;
        
        let finalSlug = baseSlug;
        let suffix = 1;
        while (usedSlugs.has(finalSlug)) {
            finalSlug = `${baseSlug}-${suffix++}`;
        }
        usedSlugs.add(finalSlug);

        const year = item.seasonYear || item.startDate?.year || 2020;
        const studio = item.studios?.nodes?.[0]?.name || 'Studio Unknown';
        const score = item.averageScore ? (item.averageScore / 20).toFixed(2) : 4.50; // Convert 100-scale to 5-scale
        const coverImage = item.coverImage?.extraLarge || item.coverImage?.large || '';
        const bannerImage = item.bannerImage || '';
        const synopsis = cleanDescription(item.description);
        const duration = item.duration ? `${item.duration}m` : (item._type === 'movie' ? '1h 45m' : '24m');
        const episodesCount = item.episodes || (item._type === 'movie' ? 1 : 12);

        const res = insertAnime.run(
            finalSlug,
            title,
            nativeTitle,
            item._type,
            episodesCount,
            duration,
            year,
            studio,
            synopsis,
            coverImage,
            bannerImage,
            parseFloat(score)
        );

        const animeId = res.lastInsertRowid;

        if (item.genres && Array.isArray(item.genres)) {
            for (const g of item.genres) {
                const gSlug = slugify(g);
                insertGenre.run(g, gSlug);
                const genreRecord = getGenreId.get(gSlug);
                if (genreRecord) {
                    insertAnimeGenre.run(animeId, genreRecord.id);
                }
            }
        }

        count++;
    }

    console.log(`Successfully populated database with ${count} official anime entries (50 TV series + 50 Movies) with real official posters and studio metadata!`);
}

run().catch(err => {
    console.error('Error fetching catalog:', err);
    process.exit(1);
});

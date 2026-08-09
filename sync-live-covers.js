const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

const query = `
query ($search: String) {
  Page(page: 1, perPage: 1) {
    media(search: $search, type: ANIME) {
      id
      title {
        romaji
        english
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
    }
  }
}
`;

async function verifyUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function fetchAniListInfo(title) {
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables: { search: title }
      })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.Page?.media?.[0];
  } catch (e) {
    return null;
  }
}

async function fetchJikanFallback(title) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.[0];
    if (item) {
      return {
        coverImage: {
          large: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url
        },
        bannerImage: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url
      };
    }
  } catch (e) {
    return null;
  }
}

async function run() {
  const animes = db.prepare('SELECT id, slug, title FROM anime').all();
  console.log(`Starting enhanced sync for ${animes.length} titles...`);

  const updateStmt = db.prepare('UPDATE anime SET cover_image = ?, banner_image = ? WHERE id = ?');

  for (let i = 0; i < animes.length; i++) {
    const a = animes[i];
    let searchTitle = a.title;
    if (a.slug === 'frieren') searchTitle = 'Sousou no Frieren';
    if (a.slug === 'aot') searchTitle = 'Shingeki no Kyojin';
    if (a.slug === 'nge') searchTitle = 'Shinseiki Evangelion';
    if (a.slug === 'vinland') searchTitle = 'Vinland Saga';
    if (a.slug === 'violet') searchTitle = 'Violet Evergarden';

    let media = await fetchAniListInfo(searchTitle);
    if (!media) {
      // Clean title search: remove subtitles / punctuation
      const cleanTitle = searchTitle.replace(/[:–—\-].*$/, '').trim();
      media = await fetchAniListInfo(cleanTitle);
    }
    if (!media) {
      media = await fetchJikanFallback(searchTitle);
    }

    if (media) {
      let cover = media.coverImage?.extraLarge || media.coverImage?.large;
      let banner = media.bannerImage || cover;

      const isCoverValid = await verifyUrl(cover);
      const isBannerValid = await verifyUrl(banner);

      if (isCoverValid) {
        updateStmt.run(cover, isBannerValid ? banner : cover, a.id);
        console.log(`[${i + 1}/${animes.length}] [OK] ${a.title} -> ${cover}`);
      } else {
        console.log(`[${i + 1}/${animes.length}] [INVALID COVER] ${a.title}`);
      }
    } else {
      console.log(`[${i + 1}/${animes.length}] [NOT FOUND] ${a.title}`);
    }

    await new Promise(r => setTimeout(r, 450));
  }

  console.log('Finished updating all anime with live verified official covers.');
}

run();

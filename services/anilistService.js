const extraQuery = `
query ($search: String) {
  Media (search: $search, type: ANIME) {
    id
    title { romaji english native }
    format
    episodes
    duration
    status
    startDate { year month day }
    endDate { year month day }
    season
    seasonYear
    averageScore
    meanScore
    popularity
    favourites
    source
    hashtag
    genres
    description(asHtml: false)
    coverImage { large }
    bannerImage
    studios {
      edges {
        isMain
        node { id name }
      }
    }
    characters(sort: ROLE, perPage: 12) {
      edges {
        role
        node {
          id
          name { full native }
          image { large }
        }
        voiceActors(language: JAPANESE) {
          id
          name { full native }
          image { large }
        }
      }
    }
    staff(sort: RELEVANCE, perPage: 8) {
      edges {
        role
        node {
          id
          name { full native }
          image { large }
        }
      }
    }
    externalLinks {
      site
      url
      icon
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          title { romaji english }
          format
          type
          coverImage { large }
        }
      }
    }
  }
}
`;

const query = `
query ($search: String) {
  Page (page: 1, perPage: 15) {
    media (search: $search, type: ANIME) {
      id
      title { romaji english native }
      format
      episodes
      duration
      seasonYear
      season
      description(asHtml: false)
      coverImage { large }
      bannerImage
      averageScore
      status
      studios(isMain: true) {
        nodes { name }
      }
    }
  }
}
`;

async function fetchAnimeFromAnilist(searchQuery) {
    try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetchFn('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ query: query, variables: { search: searchQuery } })
        });

        if (!response.ok) return [];

        const json = await response.json();
        if (json.data && json.data.Page && json.data.Page.media) {
            return json.data.Page.media.map(media => {
                let type = 'tv';
                if (media.format === 'MOVIE') type = 'movie';
                else if (['OVA', 'ONA', 'SPECIAL'].includes(media.format)) type = 'special';
                
                return {
                    slug: (media.title.romaji || media.title.english || 'anime-' + media.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
                    title: media.title.english || media.title.romaji,
                    native_title: media.title.native || '',
                    type: type,
                    episodes_count: media.episodes || 1,
                    duration: media.duration ? `${media.duration} mins` : '',
                    release_year: media.seasonYear || new Date().getFullYear(),
                    studio: media.studios && media.studios.nodes.length > 0 ? media.studios.nodes[0].name : '',
                    synopsis: media.description ? media.description.replace(/<[^>]*>?/gm, '') : '',
                    cover_image: media.coverImage.large || '',
                    banner_image: media.bannerImage || '',
                    score: media.averageScore ? (media.averageScore / 10).toFixed(1) : 0,
                    airing_status: media.status === 'RELEASING' ? 'RELEASING' : (media.status === 'NOT_YET_RELEASED' ? 'NOT_YET_RELEASED' : 'FINISHED'),
                    season: media.season || 'FALL',
                    season_year: media.seasonYear || null
                };
            });
        }
        return [];
    } catch (e) {
        console.error('Error fetching from AniList:', e);
        return [];
    }
}

const characterQuery = `
query ($id: Int) {
  Character(id: $id) {
    id
    name { full native }
    image { large }
    description(asHtml: true)
    age
    gender
    bloodType
    dateOfBirth { year month day }
    media(type: ANIME, sort: POPULARITY_DESC, perPage: 6) {
      nodes {
        id
        title { romaji english }
        coverImage { large }
        slug: title { romaji }
      }
    }
  }
}
`;

async function fetchCharacterFromAnilist(id) {
    try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetchFn('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ query: characterQuery, variables: { id: parseInt(id) } })
        });
        if (!response.ok) return null;
        const json = await response.json();
        if (json.data && json.data.Character) {
            const char = json.data.Character;
            char.media.nodes.forEach(n => {
                n.slug = (n.title.english || n.title.romaji || 'anime-' + n.id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
            });
            return char;
        }
        return null;
    } catch (e) {
        console.error('Error fetching character from AniList:', e);
        return null;
    }
}

async function fetchAnimeExtras(searchQuery) {
    try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetchFn('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ query: extraQuery, variables: { search: searchQuery } })
        });
        if (!response.ok) return null;
        
        const json = await response.json();
        if (json.data && json.data.Media) {
            const media = json.data.Media;

            // Map relations
            let relationsList = [];
            if (media.relations && media.relations.edges) {
                relationsList = media.relations.edges.map(e => {
                    const n = e.node;
                    const title = n.title.english || n.title.romaji;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
                    return {
                        relation_type: e.relationType,
                        title: title,
                        slug: slug,
                        format: n.format || 'TV',
                        cover_image: n.coverImage ? n.coverImage.large : ''
                    };
                });
            }
            media.relationsList = relationsList;

            // Map studios and producers
            let mainStudios = [];
            let producers = [];
            if (media.studios && media.studios.edges) {
                media.studios.edges.forEach(e => {
                    if (e.isMain) mainStudios.push(e.node.name);
                    else producers.push(e.node.name);
                });
            }
            media.mainStudios = mainStudios;
            media.producersList = producers;

            // Dates
            const formatDate = (d) => {
                if (!d || !d.year) return null;
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const m = d.month ? months[d.month - 1] : '';
                return `${m} ${d.day || ''}, ${d.year}`.trim();
            };
            media.formattedStartDate = formatDate(media.startDate);
            media.formattedEndDate = formatDate(media.endDate);

            return media;
        }
        return null;
    } catch (e) {
        console.error('Error fetching extras:', e);
        return null;
    }
}

module.exports = {
    fetchAnimeExtras,
    fetchAnimeFromAnilist,
    fetchCharacterFromAnilist
};

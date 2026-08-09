const fs = require('fs');

const titles = [
  'ONE PIECE',
  'Mushoku Tensei: Isekai Ittara Honki Dasu 3rd Season',
  'Koukaku Kidoutai: THE GHOST IN THE SHELL',
  'Kimi ga Shinu Made Koi wo Shitai',
  'Taiari deshita',
  'Munou to Yobareta Retro Saint'
];

const fallbackTitles = [
  'ONE PIECE',
  'Mushoku Tensei',
  'Ghost in the Shell',
  'I Want to Love You Till Your Dying Day',
  'Young Ladies Don\'t Play Fighting Games',
  'Oblivious Saint'
];

async function search(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { romaji english }
        coverImage { extraLarge large medium }
        averageScore
        seasonYear
        studios(isMain: true) { nodes { name } }
      }
    }
  `;
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { search: title } })
  });
  const json = await res.json();
  return json.data ? json.data.Media : null;
}

(async () => {
  const results = [];
  for (let i = 0; i < titles.length; i++) {
    let data = await search(titles[i]);
    if (!data) data = await search(fallbackTitles[i]);
    results.push({
      search: titles[i],
      title: data ? (data.title.english || data.title.romaji) : fallbackTitles[i],
      cover: data ? (data.coverImage.extraLarge || data.coverImage.large) : '',
      score: data && data.averageScore ? (data.averageScore / 20).toFixed(1) : '4.5',
      studio: data && data.studios && data.studios.nodes[0] ? data.studios.nodes[0].name : 'Animation Studio'
    });
  }
  console.log(JSON.stringify(results, null, 2));
})();

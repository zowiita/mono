async function getBulk() {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 50) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          format
          episodes
          seasonYear
          startDate { year }
          averageScore
          studios(isMain: true) {
            nodes { name }
          }
          description
          genres
          coverImage {
            extraLarge
            large
          }
          bannerImage
        }
      }
    }
  `;

  // Wait 10 seconds for rate limit to reset
  console.log('Waiting 8 seconds for AniList 429 cooldown...');
  await new Promise(r => setTimeout(r, 8000));

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { page: 1 } })
    });
    const data = await res.json();
    console.log('Page 1 result:', data.data?.Page?.media?.length);
    if (data.data?.Page?.media?.[0]) {
      console.log('Sample item:', data.data.Page.media[0].title, data.data.Page.media[0].coverImage);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
getBulk();

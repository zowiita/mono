async function test() {
  const query = `
    query ($q: String) {
      Page(page: 1, perPage: 1) {
        media(search: $q, type: ANIME) {
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
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables: { q: 'Spirited Away' } })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();

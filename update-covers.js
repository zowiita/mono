const db = require('./db');

const officialData = [
  {
    slugs: ['nge', 'neon-genesis-evangelion'],
    title: 'Neon Genesis Evangelion',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-9NOxwhXBDoFk.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/30-0m5i2gT0vT12.jpg'
  },
  {
    slugs: ['aot', 'attack-on-titan'],
    title: 'Attack on Titan',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiDY.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmnei.jpg'
  },
  {
    slugs: ['frieren', 'frieren-beyond-journeys-end'],
    title: "Frieren: Beyond Journey's End",
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n2bQEuhioMyq.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-uVnhAflg4mtY.jpg'
  },
  {
    slugs: ['vinland', 'vinland-saga'],
    title: 'Vinland Saga',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-1vAOD226Z2eK.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101348-e8W4bV1B5k2m.jpg'
  },
  {
    slugs: ['violet', 'violet-evergarden'],
    title: 'Violet Evergarden',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-eK01k6X074a3.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-0g7u5l5q8m6s.jpg'
  }
];

const updateStmt = db.prepare('UPDATE anime SET cover_image = ?, banner_image = ? WHERE slug = ? OR title LIKE ?');

for (const item of officialData) {
  for (const s of item.slugs) {
    updateStmt.run(item.cover, item.banner, s, '%' + item.title + '%');
  }
}

// Ensure NO anime in database has a local /images/ path
const allAnime = db.prepare('SELECT id, slug, cover_image FROM anime WHERE cover_image LIKE ?').all('/images/%');
for (const a of allAnime) {
  db.prepare('UPDATE anime SET cover_image = ? WHERE id = ?').run(
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n2bQEuhioMyq.jpg',
    a.id
  );
}

console.log('Updated all covers to official anime posters!');

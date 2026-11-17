const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const oldRoute = \pp.get('/anime/:slug', (req, res) => {\;
const newRoute = \const { fetchAnimeExtras } = require('./services/anilistService');

app.get('/anime/:slug', async (req, res) => {\;

const oldRender = \    res.render('anime-detail', { 
        anime, 
        genres, 
        recentReviews, 
        similarAnime,
        userProgress,
        userLog,
        inWatchlist,
        isLiked
    });\;

const newRender = \    
    const popularLists = db.prepare(\\\\\
        SELECT l.*, u.username, u.avatar_url,
            (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as item_count,
            (SELECT COUNT(*) FROM list_likes WHERE list_id = l.id) as like_count
        FROM lists l
        JOIN users u ON l.user_id = u.id
        JOIN list_items li ON l.id = li.list_id
        WHERE li.anime_id = ? AND l.is_private = 0
        GROUP BY l.id
        ORDER BY like_count DESC, item_count DESC
        LIMIT 3
    \\\\\).all(anime.id);

    const getListPosters = db.prepare(\\\\\
        SELECT a.cover_image
        FROM list_items li 
        JOIN anime a ON li.anime_id = a.id 
        WHERE li.list_id = ? 
        ORDER BY li.position ASC 
        LIMIT 4
    \\\\\);
    popularLists.forEach(l => {
        l.posters = getListPosters.all(l.id);
    });

    const animeExtras = await fetchAnimeExtras(anime.native_title || anime.title);

    res.render('anime-detail', { 
        anime, 
        genres, 
        recentReviews, 
        similarAnime,
        userProgress,
        userLog,
        inWatchlist,
        isLiked,
        popularLists,
        animeExtras
    });\;

code = code.replace(oldRoute, newRoute).replace(oldRender, newRender);
fs.writeFileSync('server.js', code);
console.log('Route updated');

const fs = require('fs');
let code = fs.readFileSync('views/anime-detail.ejs', 'utf8');

// Replace Popular Lists
code = code.replace(
    \<h2 class="section-title">Popular lists</h2>
                    <ul class="list-links">
                        <li><a href="#">The ultimate mecha guide</a></li>
                        <li><a href="#">Best of the 90s</a></li>
                        <li><a href="#">Existential dread</a></li>
                    </ul>\,
    \<h2 class="section-title">Popular Lists</h2>
                    <ul class="list-links">
                        <% if (locals.popularLists && popularLists.length > 0) { %>
                            <% popularLists.forEach(l => { %>
                                <li><a href="/list/<%= l.id %>"><%= l.title %></a></li>
                            <% }); %>
                        <% } else { %>
                            <li style="color:var(--muted); font-size:13px;">No popular lists featuring this anime yet.</li>
                        <% } %>
                    </ul>\
);

// Replace Main Characters
const oldChars = \                    <h2 class="section-title">Main Characters</h2>
                    <div class="char-grid">
                        <div class="char-card">
                            <img src="https://s4.anilist.co/file/anilistcdn/character/large/b89-6uE3e3p9r5fP.png" class="char-img" alt="Main Character" onerror="this.src='<%= locals.anime ? anime.cover_image : '' %>'">
                            <div class="char-details">
                                <span class="char-name">Protagonist</span>
                                <span class="char-role">Main</span>
                            </div>
                        </div>
                        <div class="char-card">
                            <img src="https://s4.anilist.co/file/anilistcdn/character/large/b90-x5h3XzRkKkI5.png" class="char-img" alt="Deuteragonist" onerror="this.src='<%= locals.anime ? anime.cover_image : '' %>'">
                            <div class="char-details">
                                <span class="char-name">Deuteragonist</span>
                                <span class="char-role">Main</span>
                            </div>
                        </div>
                        <div class="char-card">
                            <img src="https://s4.anilist.co/file/anilistcdn/character/large/b86-h7Z4q6fU5p2l.png" class="char-img" alt="Supporting" onerror="this.src='<%= locals.anime ? anime.cover_image : '' %>'">
                            <div class="char-details">
                                <span class="char-name">Key Ally</span>
                                <span class="char-role">Supporting</span>
                            </div>
                        </div>
                        <div class="char-card">
                            <img src="https://s4.anilist.co/file/anilistcdn/character/large/b1258-5d4k1L6g7gK4.png" class="char-img" alt="Supporting" onerror="this.src='<%= locals.anime ? anime.cover_image : '' %>'">
                            <div class="char-details">
                                <span class="char-name">Mentor</span>
                                <span class="char-role">Supporting</span>
                            </div>
                        </div>
                    </div>\;

const newChars = \                    <h2 class="section-title">Main Characters & Cast</h2>
                    <div class="char-grid">
                        <% if (locals.animeExtras && animeExtras.characters && animeExtras.characters.edges.length > 0) { %>
                            <% animeExtras.characters.edges.slice(0,6).forEach(edge => { %>
                                <div class="char-card">
                                    <img src="<%= edge.node.image.large %>" class="char-img" alt="<%= edge.node.name.full %>" onerror="this.src='<%= locals.anime ? anime.cover_image : '' %>'">
                                    <div class="char-details">
                                        <span class="char-name"><%= edge.node.name.full %></span>
                                        <span class="char-role"><%= edge.role %></span>
                                        <% if (edge.voiceActors && edge.voiceActors.length > 0) { %>
                                            <span style="font-size:10px; color:var(--muted); margin-top:2px;"><%= edge.voiceActors[0].name.full %> (VA)</span>
                                        <% } %>
                                    </div>
                                </div>
                            <% }); %>
                        <% } else { %>
                            <span style="color:var(--muted); font-size:13px;">No character data available.</span>
                        <% } %>
                    </div>\;

code = code.replace(oldChars, newChars);

// Where to watch
const oldWatch = \                        <div style="display:flex; align-items:center; gap:8px;">
                            <svg viewBox="0 0 24 24" style="width:24px; height:24px; border-radius:4px; background:#E50914;"><path d="M7 6v12l10-12v12" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="bevel" stroke-linecap="square"/></svg>
                            Streaming on Crunchyroll / Netflix
                        </div>\;

const newWatch = \                        <% if (locals.animeExtras && animeExtras.externalLinks && animeExtras.externalLinks.some(l => l.site === 'Crunchyroll' || l.site === 'Netflix' || l.site === 'Hulu')) { %>
                            <% const streams = animeExtras.externalLinks.filter(l => l.site === 'Crunchyroll' || l.site === 'Netflix' || l.site === 'Hulu'); %>
                            <% streams.forEach(s => { %>
                                <a href="<%= s.url %>" target="_blank" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:#CAD2D9; margin-bottom:6px;">
                                    <span style="width:20px; height:20px; background:#20262D; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:10px; font-weight:700;"><%= s.site.charAt(0) %></span>
                                    Streaming on <%= s.site %>
                                </a>
                            <% }); %>
                        <% } else { %>
                            <span style="color:var(--muted); font-size:12px;">No official streaming data available.</span>
                        <% } %>\;
                        
code = code.replace(oldWatch, newWatch);
fs.writeFileSync('views/anime-detail.ejs', code);
console.log('anime-detail updated!');

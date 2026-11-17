const fs = require('fs');
let code = fs.readFileSync('views/anime-detail.ejs', 'utf8');

const oldSliderRegex = /<h2 class="section-title">Popular Lists<\/h2>\s*<div class="slider-wrapper">[\s\S]*?<div class="list-title">Psychological & Epic Sagas<\/div>[\s\S]*?<\/div>\s*<\/a>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newLists = \<h2 class="section-title">Popular Lists</h2>
                      <div style="display:flex; flex-direction:column; gap:16px;">
                          <% if (locals.popularLists && popularLists.length > 0) { %>
                              <% popularLists.forEach(l => { %>
                                  <a href="/list/<%= l.id %>" style="display:flex; gap:12px; align-items:center; text-decoration:none; background:#181D22; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                                      <div style="display:flex; position:relative; width:60px; height:60px;">
                                          <% l.posters.slice(0,3).forEach((p, i) => { %>
                                              <img src="<%= p.cover_image %>" style="width:40px; height:60px; object-fit:cover; border-radius:4px; position:absolute; left:<%= i*10 %>px; z-index:<%= 3-i %>; border:1px solid #181D22; box-shadow:0 2px 6px rgba(0,0,0,0.4);" onerror="this.src='/images/placeholder.png'">
                                          <% }); %>
                                      </div>
                                      <div style="margin-left:8px;">
                                          <div style="font-size:14px; font-weight:700; color:#fff; margin-bottom:4px;"><%= l.title %></div>
                                          <div style="font-size:12px; color:var(--muted);"><%= l.username %> • <%= l.item_count %> items</div>
                                      </div>
                                  </a>
                              <% }); %>
                          <% } else { %>
                              <div style="color:var(--muted); font-size:13px;">No popular lists featuring this anime yet.</div>
                          <% } %>
                      </div>\;

code = code.replace(oldSliderRegex, newLists);
fs.writeFileSync('views/anime-detail.ejs', code);
console.log('Fixed slider in anime-detail');

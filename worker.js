export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const gv = url.searchParams.get('gv');
    const validate = url.searchParams.get('validate');
    const customName = url.searchParams.get('rename'); // Get custom name

    if (segments.length === 0) {
      return new Response(this.getHtml(), { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === '/api/mc-versions') {
      try {
        const mcRes = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
        return new Response(mcRes.body, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch(e) {
        return new Response(JSON.stringify({versions: []}), { status: 500 });
      }
    }

    const loaderGroups = {
      "paper": ["paper", "spigot", "purpur", "bukkit"],
      "spigot": ["paper", "spigot", "purpur", "bukkit"],
      "purpur": ["paper", "spigot", "purpur", "bukkit"],
      "bukkit": ["paper", "spigot", "purpur", "bukkit"],
      "folia": ["folia"], 
      "sponge": ["sponge"], 
      "fabric": ["fabric", "quilt"], 
      "quilt": ["quilt", "fabric"], 
      "forge": ["forge"], 
      "neoforge": ["neoforge", "forge"],
      "velocity": ["velocity"], 
      "bungeecord": ["bungeecord", "waterfall"], 
      "waterfall": ["waterfall", "bungeecord"], 
      "geyser": ["geyser"],
    };

    let searchLoaders = [], slug = segments[segments.length - 1], requestedLoader = null;

    for (const segment of segments) {
      const lower = segment.toLowerCase();
      if (loaderGroups[lower]) {
        searchLoaders = loaderGroups[lower];
        requestedLoader = segment;
        break;
      }
    }

    let apiUrl = `https://api.modrinth.com/v2/project/${slug}/version?`;
    const params = new URLSearchParams();
    if (searchLoaders.length > 0) params.append('loaders', JSON.stringify(searchLoaders));
    if (gv) params.append('game_versions', JSON.stringify([gv]));
    apiUrl += params.toString();

    try {
      const res = await fetch(apiUrl, { headers: { "User-Agent": "TheGamingCrib/Worker" } });
      const versions = await res.json();

      if (validate === 'true') {
        return new Response(JSON.stringify({ 
          exists: Array.isArray(versions) && versions.length > 0, 
          loader: requestedLoader,
          slug: slug 
        }), { headers: { "Content-Type": "application/json" } });
      }

      if (!Array.isArray(versions) || !versions.length) {
        return this.errorPage(`The project <b>${slug}</b> does not support <b>${requestedLoader || 'this platform'}</b>${gv ? ' on ' + gv : ''}.`);
      }

      const latest = versions[0];
      const primaryFile = latest.files.find(f => f.primary) || latest.files[0];
      
      let finalDownloadUrl = primaryFile.url;
      
      // LOGIC: If a custom name is provided, append it to the Modrinth URL
      if (customName) {
        const downloadUrlObj = new URL(finalDownloadUrl);
        downloadUrlObj.searchParams.set('filename', customName.endsWith('.jar') ? customName : customName + '.jar');
        finalDownloadUrl = downloadUrlObj.toString();
      }

      return Response.redirect(finalDownloadUrl, 302);
    } catch (e) {
      return this.errorPage("API Error: " + e.message);
    }
  },

  errorPage(msg) {
    return new Response(`<!DOCTYPE html><html><head><style>body{background:#0c0c0c;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.card{background:#151515;padding:40px;border-radius:20px;border:1px solid #333;text-align:center;max-width:400px}h1{color:#ff4444}a{color:#00b7ff;text-decoration:none;display:block;margin-top:20px}</style></head><body><div class="card"><h1>Not Supported</h1><p>${msg}</p><a href="/">← Go Back</a></div></body></html>`, { headers: { "Content-Type": "text/html" } });
  },

  getHtml() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Modrinth Link Generator</title>
        <style>
          :root { --primary: #00b7ff; --bg: #0c0c0c; --card: #151515; --border: #2a2a2a; --error: #ff4444; }
          body { font-family: 'Inter', sans-serif; background: var(--bg); color: white; margin: 0; display: flex; justify-content: center; padding: 40px 20px; }
          .card { width: 100%; max-width: 500px; background: var(--card); padding: 30px; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
          h1 { margin: 0 0 25px; font-size: 24px; text-align: center; color: var(--primary); font-weight: 800; }
          
          label { display: block; margin: 20px 0 10px; font-size: 11px; color: #666; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .input-main { width: 100%; padding: 14px; background: #111; border: 1px solid var(--border); border-radius: 10px; color: white; box-sizing: border-box; outline: none; transition: 0.2s; }
          .input-main:focus { border-color: var(--primary); }

          .option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .opt-btn { background: #222; border: 1px solid var(--border); padding: 12px; border-radius: 10px; color: #ccc; cursor: pointer; transition: 0.2s; text-align: center; font-size: 13px; font-weight: 600; }
          .opt-btn:hover { border-color: #555; background: #282828; }
          .opt-btn.active { background: var(--primary); color: black; border-color: var(--primary); }

          .roll-section { max-height: 0; overflow: hidden; transition: all 0.4s ease; opacity: 0; pointer-events: none; }
          .roll-section.open { max-height: 1000px; opacity: 1; margin-top: 10px; pointer-events: auto; }

          .v-container { position: relative; margin-top: 10px; }
          .v-list { 
            position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
            background: #111; border: 1px solid var(--border); border-radius: 10px; 
            max-height: 250px; overflow-y: auto; display: none; margin-top: 5px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8);
          }
          .v-item { padding: 12px 15px; cursor: pointer; font-size: 14px; border-bottom: 1px solid #222; color: #bbb; }
          .v-item:hover { background: #1a1a1a; color: var(--primary); }
          .v-list.show { display: block; }
          
          .v-list::-webkit-scrollbar { width: 8px; }
          .v-list::-webkit-scrollbar-track { background: #111; border-radius: 10px; }
          .v-list::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

          .snapshot-toggle { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #888; margin-bottom: 10px; cursor: pointer; }

          .gen-btn { width: 100%; padding: 16px; background: var(--primary); border: none; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 30px; transition: 0.3s; }
          .gen-btn:disabled { background: #333; color: #666; cursor: wait; }

          #error-msg { color: var(--error); font-size: 13px; margin-top: 15px; text-align: center; display: none; background: rgba(255,68,68,0.1); padding: 10px; border-radius: 8px; border: 1px solid var(--error); }
          .result-box { margin-top: 25px; background: #000; padding: 20px; border-radius: 15px; border: 1px dashed var(--primary); display: none; }
          .result-link { font-family: monospace; color: var(--primary); word-break: break-all; display: block; margin-bottom: 15px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🧩 Link Generator</h1>
          
          <label>Modrinth Link</label>
          <input type="text" id="url" class="input-main" placeholder="Paste link here..." oninput="checkUrl()">

          <div id="sec-type" class="roll-section">
            <label>Project Type</label>
            <div class="option-grid">
              <div class="opt-btn" onclick="setType(this, 'plugin')">Plugin</div>
              <div class="opt-btn" onclick="setType(this, 'mod')">Mod</div>
              <div class="opt-btn" onclick="setType(this, 'proxy')">Proxy</div>
              <div class="opt-btn" onclick="setType(this, 'geyser')">Geyser</div>
            </div>
          </div>

          <div id="sec-plat" class="roll-section">
            <label>Platform</label>
            <div id="plat-grid" class="option-grid"></div>
          </div>

          <div id="sec-version" class="roll-section">
            <label>Game Version (Optional)</label>
            <label class="snapshot-toggle"><input type="checkbox" id="show-snapshots" onchange="renderVersions()"> Show Snapshots</label>
            <div class="v-container">
              <input type="text" id="v-search" class="input-main" placeholder="Search versions..." onfocus="toggleVList(true)" oninput="filterVersions()" autocomplete="off">
              <div id="v-list" class="v-list"></div>
            </div>

            <label>Custom Filename (Optional)</label>
            <input type="text" id="rename" class="input-main" placeholder="e.g. MyPlugin (auto-adds .jar)">
            
            <div id="error-msg"></div>
            <button class="gen-btn" id="main-gen-btn" onclick="validateAndGenerate()">Generate URL</button>
          </div>

          <div class="result-box" id="box">
            <span class="result-link" id="res"></span>
            <button class="opt-btn" style="width:100%; background:var(--primary); color:black;" onclick="copy()">Copy Link</button>
          </div>
        </div>

        <script>
          let state = { type: '', plat: '', gv: '' };
          let allVersions = [];

          function checkUrl() {
            if(document.getElementById('url').value.includes('modrinth')) {
              document.getElementById('sec-type').classList.add('open');
              if(allVersions.length === 0) fetchVersions();
            }
          }

          async function fetchVersions() {
            try {
              const res = await fetch('/api/mc-versions');
              const data = await res.json();
              allVersions = data.versions || [];
              renderVersions();
            } catch(e) { console.error("Failed to load versions"); }
          }

          function renderVersions() {
            const list = document.getElementById('v-list');
            const showSnapshots = document.getElementById('show-snapshots').checked;
            const filter = document.getElementById('v-search').value.toLowerCase();
            list.innerHTML = '';
            allVersions.forEach(v => {
              if(!showSnapshots && v.type !== 'release') return;
              if(!v.id.toLowerCase().includes(filter)) return;
              const item = document.createElement('div');
              item.className = 'v-item';
              item.innerText = v.id + (v.type === 'snapshot' ? ' (snapshot)' : '');
              item.onclick = () => { 
                document.getElementById('v-search').value = v.id; 
                state.gv = v.id; 
                toggleVList(false); 
                hideError(); 
              };
              list.appendChild(item);
            });
          }

          function filterVersions() { renderVersions(); toggleVList(true); hideError(); }
          function toggleVList(show) { 
            const list = document.getElementById('v-list');
            if(show) list.classList.add('show');
            else setTimeout(() => list.classList.remove('show'), 200);
          }
          function hideError() { document.getElementById('error-msg').style.display = 'none'; }

          function setType(el, val) {
            state.type = val; state.plat = ''; hideError();
            setActive('.opt-btn', el);
            const grid = document.getElementById('plat-grid');
            grid.innerHTML = '';
            const platSec = document.getElementById('sec-plat');

            if(val === 'geyser') {
              platSec.classList.remove('open');
              document.getElementById('sec-version').classList.add('open');
            } else {
              platSec.classList.add('open');
              if(val === 'proxy') ['Velocity', 'BungeeCord', 'Waterfall'].forEach(p => addOpt(grid, p, p.toLowerCase()));
              else if(val === 'plugin') ['Paper/Spigot', 'Folia', 'Sponge'].forEach(p => addOpt(grid, p, p === 'Paper/Spigot' ? 'paper' : p.toLowerCase()));
              else if(val === 'mod') ['Fabric', 'Quilt', 'Forge', 'NeoForge'].forEach(p => addOpt(grid, p, p.toLowerCase()));
            }
          }

          function addOpt(parent, label, val) {
            const d = document.createElement('div');
            d.className = 'opt-btn'; d.innerText = label;
            d.onclick = () => { state.plat = val; setActive('#plat-grid .opt-btn', d); document.getElementById('sec-version').classList.add('open'); hideError(); };
            parent.appendChild(d);
          }

          function setActive(sel, el) { document.querySelectorAll(sel).forEach(b => b.classList.remove('active')); el.classList.add('active'); }

          async function validateAndGenerate() {
            const btn = document.getElementById('main-gen-btn');
            const err = document.getElementById('error-msg');
            const box = document.getElementById('box');
            const urlIn = document.getElementById('url').value;
            const renameIn = document.getElementById('rename').value.trim();
            const slug = urlIn.split('/').filter(Boolean).pop();
            const gv = document.getElementById('v-search').value.trim();
            
            btn.disabled = true; btn.innerText = "Checking Compatibility...";
            err.style.display = 'none'; box.style.display = 'none';

            let loader = (state.type === 'geyser') ? 'geyser' : state.plat;
            let checkPath = \`/\${state.type}/\${loader ? loader + '/' : ''}\${slug}?validate=true\`;
            if(gv) checkPath += '&gv=' + gv;

            try {
              const response = await fetch(checkPath);
              const data = await response.json();

              if (!data.exists) {
                err.innerHTML = \`The project <b>\${data.slug}</b> does not support <b>\${data.loader || state.type}</b>\${gv ? ' on ' + gv : ''}.\`;
                err.style.display = 'block';
                btn.disabled = false; btn.innerText = "Generate URL";
              } else {
                let finalUrl = window.location.origin + '/' + state.type + '/';
                if(loader) finalUrl += loader + '/';
                finalUrl += slug;
                
                let queryParams = [];
                if(gv) queryParams.push('gv=' + gv);
                if(renameIn) queryParams.push('rename=' + encodeURIComponent(renameIn));
                
                if(queryParams.length > 0) finalUrl += '?' + queryParams.join('&');
                
                document.getElementById('res').innerText = finalUrl;
                box.style.display = 'block';
                btn.disabled = false; btn.innerText = "Generate URL";
              }
            } catch (e) {
              err.innerText = "Modrinth API unreachable.";
              err.style.display = 'block';
              btn.disabled = false; btn.innerText = "Generate URL";
            }
          }

          function copy() { navigator.clipboard.writeText(document.getElementById('res').innerText); alert("Copied!"); }
          document.addEventListener('click', (e) => { if(!e.target.closest('.v-container')) toggleVList(false); });
        </script>
      </body>
      </html>
    `
  }
}

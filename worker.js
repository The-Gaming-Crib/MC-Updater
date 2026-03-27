addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/+/, "").toLowerCase()

  // 🧱 Your plugins go here
  const plugins = {
    "geyserreversion": "geyserreversion",
    "mcxboxbroadcast": "mcxboxbroadcast",
    "thirdpartycosmetics": "thirdpartycosmetics",
    // add more: "pluginname": "modrinthslug"
  }

  // 🏠 Main page (plugin list)
  if (!path) {
    const listItems = Object.keys(plugins)
      .map(name => `<li><a href="/${name}">${name}</a></li>`)
      .join("")

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>The Gaming Crib Plugins</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; text-align: center; }
          h1 { margin-top: 30px; }
          ul { list-style: none; padding: 0; }
          li { margin: 8px 0; }
          a { color: #00b7ff; text-decoration: none; font-size: 18px; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>🧩 The Gaming Crib Plugins</h1>
        <ul>${listItems}</ul>
        <p style="margin-top:30px; color:#777;">Click a plugin to download the latest version</p>
      </body>
      </html>
    `
    return new Response(html, { headers: { "Content-Type": "text/html" } })
  }

  // ⚙️ Handle plugin download redirect
  if (!plugins[path]) {
    return new Response(`Unknown plugin: ${path}`, { status: 404 })
  }

  const apiUrl = `https://api.modrinth.com/v2/project/${plugins[path]}/version`
  const res = await fetch(apiUrl)

  if (!res.ok) {
    return new Response(`Failed to fetch version info for ${path}`, { status: 500 })
  }

  const versions = await res.json()
  const latest = versions[0]
  const latestURL = latest.files[0].url

  // Redirect to latest file (or use the download variant if you prefer)
  return Response.redirect(latestURL, 302)
}

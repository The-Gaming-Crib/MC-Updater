addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const res = await fetch('https://api.modrinth.com/v2/project/geyserreversion/version')
  const versions = await res.json()
  const latestURL = versions[0].files[0].url
  return Response.redirect(latestURL, 302)
}

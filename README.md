# 🧩 The Gaming Crib Geyser extention updater Redirector

A lightweight serverless script designed to run on **Cloudflare Workers**. This tool provides a simple landing page and direct download redirects for Geyser extensions hosted on **Modrinth**.

## 🚀 How It Works
Instead of manually hunting for direct download links that change with every update, this script fetches the **latest** version of a plugin directly from the Modrinth API and redirects the user (or a script) to the `.jar` file.

* **URL Structure:** `your-worker-url.com/pluginname`
* **Example:** Navigating to `/geyserreversion` will instantly trigger a download of the newest version from Modrinth.

---

## 🛠️ Setup Instructions

1.  **Deploy the Script:**
    * Create a new [Cloudflare Worker](https://workers.cloudflare.com/).
    * Paste the code from `worker.js` into the Worker editor.
    * Save and Deploy.
2.  **Adding More Extensions:**
    * Find the plugin you want on [Modrinth](https://modrinth.com/plugins).
    * Look at the URL to find the **slug** (e.g., `https://modrinth.com/plugin/geyser-vt` → the slug is `geyser-vt`).
    * Add it to the `plugins` object in the code:
    ```javascript
    const plugins = {
      "geyserreversion": "geyserreversion",
      "vt": "geyser-vt", // Custom short name : Modrinth slug
      "skinrestorer": "skinrestorer" 
    }
    ```

---

## 📜 Using with Skript

You can use this Worker to keep your server extensions updated automatically or to allow staff to trigger downloads via in-game commands.

### Example: Download Command
This Skript example uses the `download from` effect (requires an addon like **skript-reflect** or **Skellett** depending on your setup) to pull the latest file from your redirector.

```applescript
command /updateMCXBroadcast:
    aliases: /umcxb
    permission: op
    trigger:
        download file from "https://geyserupdater.letsgame6531.workers.dev/mcxboxbroadcast" to file "plugins/Geyser-Spigot/extensions/MCXboxBroadcastExtension.jar"

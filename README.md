# 🧩 The Gaming Crib Geyser Extension Updater

A lightweight serverless script designed to run on **Cloudflare Workers**. This tool provides a simple landing page and direct download redirects for Geyser extensions hosted on **Modrinth**.

## 🚀 How It Works
Instead of manually hunting for direct download links that change with every update, this script fetches the **latest** version of a plugin directly from the Modrinth API and redirects the user (or a script) to the `.jar` file.

* **URL Structure:** `your-worker-url.com/pluginname`
* **Example:** Navigating to `/geyserreversion` will instantly trigger a download of the newest version from Modrinth.

---

## 🛠️ Setup Instructions

### Step 1: Deploy the Worker
1. Create a new [Cloudflare Worker](https://workers.cloudflare.com/).
2. Copy the code from `worker.js` in this repo and paste it into the Worker editor.
3. Click **Save and Deploy**.

### Step 2: Adding New Extensions to the Worker
To add a new extension to your redirector, you need to update the `plugins` list in the code:
1. Find the extension on [Modrinth](https://modrinth.com/plugins).
2. Look at the URL to find the **slug** (e.g., `https://modrinth.com/project/geyser-vt` → the slug is `geyser-vt`).
3. Add a new line to the `plugins` object:
   ```javascript
   const plugins = {
     "myname": "modrinth-slug", 
     // Example:
     "geyservt": "geyser-vt"
   }

📜 Using with Skript
You can automate your extension updates using the Skript plugin. This requires an addon that supports web downloads (like skript-reflect or Skellett).
How to create an update command for each extension:
When making a new Skript for an extension, you must change three specific parts of the code:
 * The Command Name: Change /updateName to the name of your extension.
 * The Worker URL: Make sure the end of the URL matches the "shortcut name" you set in your Worker's plugins list.
 * The File Path: Ensure the path points to your extensions folder and ends with the correct .jar filename.
Example Template:
```
command /updateMCXBroadcast:
    aliases: /umcxb
    permission: op
    trigger:
        download file from "your-worker-url.com/mcxboxbroadcast" to file "plugins/Geyser-Spigot/extensions/MCXboxBroadcastExtension.jar"
```

🔌 Recommended Geyser Extensions
Add these slugs to your Worker to get started:
| Shortcut Name | Modrinth Slug |
|---|---|---|
| mcxboxbroadcast | mcxboxbroadcast |
| geyserreversion | geyserreversion |
| thirdpartycosmetics | thirdpartycosmetics |


⚖️ License & Open Source
This project is 100% AI-generated and provided for free.
 * No Profit: This tool is intended for community use and remains non-commercial.
 * Open Source: Feel free to fork and adapt for your own server needs!

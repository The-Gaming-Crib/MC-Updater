# 🧩 Modrinth Universal Link Generator
This Cloudflare Worker is a powerful, lightweight redirector designed to automate Minecraft plugin and mod updates. It translates clean, permanent URLs into direct .jar downloads from **Modrinth**, supporting custom filenames and specific game versions.
## 🚀 How It Works
Instead of using Modrinth links that change every time a developer uploads a new version, this Worker provides a **Permanent Link**. When you (or a script) access the link:
 1. The Worker checks the Modrinth API for the **latest** version compatible with your settings.
 2. It intelligently groups platforms (e.g., searching for a "Paper" plugin will also check Spigot and Bukkit).
 3. If a **Custom Filename** is provided, it tells the download server to rename the file.
 4. It redirects you instantly to the .jar file.
## 🛠️ Setup Instructions
### Step 1: Deploy to Cloudflare
 1. Log in to your Cloudflare Dashboard.
 2. Navigate to **Workers & Pages** > **Create application** > **Create Worker**.
 3. Name your worker (e.g., mc-updater) and click **Deploy**.
 4. Click **Edit Code**, paste the entire script in [worker.js](worker.js), and click **Save and Deploy**.
 (if you want to link it to a Github repo fork this one and edit the name section in [wrangler.toml](wrangler.toml))
### Step 2: Use the Web Interface
 1. Visit your Worker's URL (e.g., https://mc-updater.yourname.workers.dev).
 2. Paste a Modrinth project link.
 3. Select the **Project Type** and **Platform**.
 4. (Optional) Select a specific **Game Version** or enter a **Custom Filename**.
 5. Click **Generate URL**.
## 🔗 URL Structure
You can bypass the web interface and build links manually for use in scripts:
https://your-worker.dev/[type]/[platform]/[slug]?gv=[version]&rename=[filename]
| Parameter | Description | Example |
|---|---|---|
| **Type** | plugin, mod, proxy, or geyser | plugin |
| **Platform** | paper, fabric, forge, velocity, etc. | paper |
| **Slug** | The project name from the Modrinth URL | essentialsx |
| **gv** | (Optional) Specific Minecraft version | 1.20.1 |
| **rename** | (Optional) The name the file should be saved as | EssentialsX |
## 📜 Using with Skript
This tool is perfect for Skript-based auto-updaters. It ensures your files are always named correctly so they overwrite the old version instead of creating duplicates.
### Example Skript Template:
To use this, replace your-worker.dev with your actual Worker URL.
```applescript
command /updateplugins:
    permission: op
    trigger:
        send "&aUpdating TerraformGenerator..." to console
        # This link renames the file to 'TerraformGenerator.jar' automatically
        download file from "https://your-worker.dev/plugin/paper/terraform-generator?rename=TerraformGenerator" to file "plugins/TerraformGenerator.jar"
        send "&eUpdate complete. Please restart the server." to console

```
## 💡 Key Features
 * **Smart Platform Grouping:** If you select paper, the script automatically searches for files tagged as paper, spigot, purpur, or bukkit.
 * **Proxy Support:** Dedicated categories for Velocity, BungeeCord, and Waterfall.
 * **Snapshot Support:** Toggle snapshots in the UI to get the absolute latest experimental builds.
 * **Redirect Method:** Unlike proxy methods, this uses a 302 Redirect. This means it supports **unlimited file sizes** because the file data doesn't pass through Cloudflare's memory limits.
## ⚖️ License & Usage
 * **Community Use:** This tool is free to use and open source.
 * **Modrinth API:** This tool respects the Modrinth API and uses a custom User-Agent to ensure smooth traffic flow.

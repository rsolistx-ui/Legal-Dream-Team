# Tools

One click launchers for the Legal Dream Team.

## Files

- `Legal Dream Team.cmd`. Double click to start the local dev server (if not already running) and open the app in your default browser.
- `launch-webapp.ps1`. The PowerShell script the .cmd launcher invokes. Handles first run npm install, port reuse, server boot, and browser open.
- `Legal Dream Team (Online).url`. Direct shortcut to the deployed GitHub Pages site. Needs no local setup at all.

## Pin to desktop or taskbar (one click access)

### Desktop shortcut

1. Right click `Legal Dream Team.cmd` (or the `.url` for the online version).
2. Click **Show more options** if you are on Windows 11.
3. Click **Send to** then **Desktop (create shortcut)**.
4. Right click the new desktop shortcut, click **Properties**, click **Change Icon**, and pick the icon you want (see icon options below).

### Pin to taskbar

The taskbar refuses to pin `.cmd` and `.url` files directly. Workaround:

1. Right click the desktop shortcut you created above.
2. Click **Properties**.
3. In the **Target** field, prepend `cmd.exe /c ` so the line reads:
   `cmd.exe /c "C:\Users\rdsol\OneDrive\Documents\Claude\Projects\Legal Dream Team\tools\Legal Dream Team.cmd"`
4. Click **Apply** then **OK**.
5. Drag the shortcut to the taskbar, or right click it and choose **Pin to taskbar**.

Alternative for the online version: open the deployed site in Chrome, click the three dot menu, choose **Cast, save, and share** then **Install page as app**. This gives you a true app icon you can pin anywhere.

## Custom icon

Windows accepts `.ico` files for shortcuts. To make one that looks great at every size:

1. Generate a PNG with the prompt below (or any image generator).
2. Convert PNG to ICO at convertio.co/png-ico or via ImageMagick: `magick icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`.
3. Save the ICO somewhere durable (this `tools/` folder works).
4. In the shortcut Properties dialog, click **Change Icon** then **Browse** to your ICO.

### Highly detailed icon prompt (paste into Midjourney, DALL-E, or any image AI)

```
A 1024x1024 minimalist iOS app icon for a Texas civil defense legal panel called "Legal Dream Team."
The icon is a single rounded square (24 percent corner radius) with a subtle dark navy gradient
background (slate 950 at top, slate 900 at bottom). Centered: a stylized golden Texas lone star
in matte gold (#c9a45a) emerging from a dark indigo gavel head, with a fine silver scales of
justice motif barely visible in the negative space behind. Three slim parallel horizontal lines
across the lower third (suggesting tier hierarchy and legal documents). A single thin red accent
stroke runs along the right edge of the rounded square (signaling the hard veto authority of the
compliance tier). The overall palette is restrained: dark slate for the field, matte gold for the
star, muted indigo for the gavel, a single touch of red. No type, no text, no flag stripes, no
courthouse columns, no cliched scales clipart. Soft inner shadow on the rounded square edge,
subtle micro grain texture, deep depth without skeuomorphism. Crisp edges legible at 16x16 and
gorgeous at 1024x1024. Apple iOS 18 design language. Output as PNG with transparent corners
inside the rounded square mask.
```

## How the local launcher works

`launch-webapp.ps1` does this in order:

1. Resolves the project root from its own location.
2. If `webapp/node_modules` is missing, runs `npm install` once. Subsequent runs skip this.
3. Tests TCP port 5173. If something is already listening, treats it as an existing dev server and just opens the browser.
4. Otherwise starts `npm run dev` in a minimized terminal window, waits up to 60 seconds for the port to come up, then opens the browser.
5. Exits. The dev server keeps running in its own window. Close that window to stop the server.

To stop the server: close the minimized cmd window the launcher started.

## Quirks

- First run after `npm install` takes longer (Vite cold cache). Subsequent launches open in under three seconds.
- If you change ports in `webapp/vite.config.ts`, also change `$port` in `launch-webapp.ps1` and the URL in `Legal Dream Team (Online).url`.
- Windows OneDrive sometimes flags scripts in synced folders. If SmartScreen blocks the .cmd, click "More info" then "Run anyway" once and it remembers.

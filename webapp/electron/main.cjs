// Electron main process for Legal Dream Team.
// Loads the prebuilt Vite output (../dist/index.html) inside a native window.
// Pure offline shell: no network required after first launch beyond
// optional Anthropic API calls (which the renderer makes directly).

const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged && process.env.ELECTRON_DEV === "1";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "Legal Dream Team",
    backgroundColor: "#020617",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Allow the renderer to call api.anthropic.com directly. Electron
      // honors the same dangerous-direct-browser-access header path the
      // PWA uses; CORS is handled by Anthropic for this header.
      webSecurity: true,
    },
  });

  // Open external links in the default browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  if (isDev) {
    win.loadURL("http://localhost:5173/Legal-Dream-Team/");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

// Strip default menu (File, Edit, View, Help). Keep a minimal app menu
// so Cmd-Q on macOS still works and Ctrl+Shift+I opens DevTools when needed.
const menuTemplate = [
  {
    label: "App",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
];
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

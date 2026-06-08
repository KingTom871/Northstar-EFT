import { app, shell, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import { join } from "path";
import { screen } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

// Keep references globally to prevent GC
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Create the fullscreen overlay window.
function createOverlayWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  const overlayWin = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    transparent: true,
    // alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the renderer content
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    overlayWin.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    overlayWin.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Handle external links - open in default browser instead of overlay
  overlayWin.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Show the window when content is ready
  overlayWin.webContents.on("did-finish-load", () => {
    overlayWin.show();
  });

  return overlayWin;
}

// Create system tray icon and context menu
function createTray(): void {
  const trayIcon = nativeImage.createFromPath(typeof icon === "string" ? icon : app.getAppPath());

  tray = new Tray(trayIcon);

  // Build tray context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open DevTools",
      click: () => {
        if (overlayWindow) {
          overlayWindow.webContents.openDevTools({ mode: "detach" });
        }
      },
    },
    { type: "separator" },
    {
      label: "Exit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Northstar");
}

/**
 * Restore tray icon if Explorer.exe restarts and removes it from system tray.
 * This handles the WM_TASKBARCREATED message on Windows.
 */
function restoreTrayOnExplorerRestart(windowWin: BrowserWindow): void {
  // Only run on Windows
  if (process.platform !== "win32") return;

  // When Explorer restarts, it sends a WM_TASKBARCREATED message to all top-level windows.
  const WM_TASKBARCREATED = 0xc000;

  try {
    windowWin.hookWindowMessage(WM_TASKBARCREATED, () => {
      console.log("Explorer restarted, restoring tray icon...");
      // If the tray was destroyed by Explorer restart, recreate it
      if (!tray || tray.isDestroyed()) {
        createTray();
      }
    });
  } catch (error) {
    console.error("Failed to bind taskbar recreated listener:", error);
  }
}

// Prevent multiple instances of the application.
function preventMultipleInstances(): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on("second-instance", () => {
    // User tried to run a second instance, bring focus to existing window
    if (overlayWindow) {
      overlayWindow.show();
      overlayWindow.focus();
    }
  });
}

// App initialization and event handling
(() => {
  // Prevent multiple instances
  preventMultipleInstances();

  // Handle app ready event
  app.whenReady().then(() => {
    // Set app user model id for Windows
    electronApp.setAppUserModelId("com.northstar.eft");

    // Create the overlay window
    overlayWindow = createOverlayWindow();

    // Create system tray after app starts
    createTray();

    // Restore tray on Explorer restart
    restoreTrayOnExplorerRestart(overlayWindow);

    // Watch for window shortcuts (F12 DevTools toggle)
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
  });

  // Quit application when all windows are closed
  app.on("window-all-closed", () => {
    app.quit();
  });

  // Cleanup tray on exit
  app.on("before-quit", () => {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });

  // On macOS, re-create window when dock icon is clicked
  app.on("activate", () => {
    if (!overlayWindow && process.platform === "darwin") {
      overlayWindow = createOverlayWindow();
    } else if (overlayWindow) {
      overlayWindow.show();
    }
  });
})();

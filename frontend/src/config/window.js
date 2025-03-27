const path = require('path');

const windowConfig = {
  main: {
    width: 1264,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../core/preload.js'),
      webviewTag: true,
      webSecurity: false
    }
  },
  button: {
    width: 500,
    height: 50,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    movable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../core/preload.js')
    }
  },
  service: {
    width: 800,
    height: 600,
    modal: true,
    show: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../core/preload.js')
    }
  },
  settings: {
    width: 600,
    height: 400,
    modal: true,
    show: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../core/preload.js')
    }
  },
  addAccount: {
    width: 400,
    height: 320,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, '../core/preload.js')
    }
  },
  editAccount: {
    width: 400,
    height: 320,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, '../core/preload.js')
    }
  }
};

module.exports = windowConfig; 
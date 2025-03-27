const { app, BrowserWindow } = require('electron');
const { createWindow } = require('./windowCore');

// 设置应用生命周期事件
function setupAppLifecycle() {
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

module.exports = {
  setupAppLifecycle
}; 
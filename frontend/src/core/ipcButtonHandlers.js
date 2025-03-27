const { ipcMain } = require('electron');

// 设置按钮窗口事件处理
function setupButtonWindowEvents(buttonWindow, mainWindow) {
  // 主页按钮点击事件
  ipcMain.on('home-click', () => {
    console.log('收到 home-click 消息');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('navigate-to-home');
    }
  });

  // 刷新按钮点击事件
  ipcMain.on('refresh-click', () => {
    console.log('收到 refresh-click 消息');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('refresh-active-tab');
    }
  });

  // 调试按钮点击事件
  ipcMain.on('debug-click', () => {
    console.log('收到 debug-click 消息');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('toggle-debug-mode');
    }
  });

  // 退出按钮点击事件
  ipcMain.on('show-logout-modal', () => {
    console.log('收到 show-logout-modal 消息');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-logout-modal');
    }
  });

  // 设置按钮点击事件
  ipcMain.on('show-settings-modal', () => {
    console.log('收到 show-settings-modal 消息');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-settings-modal');
    }
  });
}

module.exports = {
  setupButtonWindowEvents
}; 
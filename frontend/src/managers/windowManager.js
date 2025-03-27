const { BrowserWindow } = require('electron');
const path = require('path');
const dataManager = require('./dataManager');

// 工具函数：计算窗口位置使其居中
function centerWindow(parentWindow, width, height) {
  if (!parentWindow || parentWindow.isDestroyed()) {
    return { x: 0, y: 0, width, height };
  }
  const bounds = parentWindow.getBounds();
  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
    width,
    height
  };
}

// 创建添加账号窗口
function createAddAccountWindow(mainWindow, existingWindow) {
  try {
    console.log('创建添加账号窗口');
    if (existingWindow && !existingWindow.isDestroyed()) {
      console.log('关闭现有添加账号窗口');
      existingWindow.close();
    }

    const preloadPath = path.join(__dirname, '../core/preload.js');
    // console.log('预加载脚本路径:', preloadPath);

    const window = new BrowserWindow({
      width: 400,
      height: 320,
      modal: true,
      parent: mainWindow,
      resizable: false,
      minimizable: false,
      maximizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: preloadPath
      }
    });

    const htmlPath = path.join(__dirname, '../views/add-account.html');
    // console.log('HTML 文件路径:', htmlPath);
    window.loadFile(htmlPath);
    
    window.once('ready-to-show', () => {
      console.log('添加账号窗口准备显示');
      const bounds = centerWindow(mainWindow, 400, 320);
      window.setBounds(bounds);
      window.show();
    });

    window.on('closed', () => {
      console.log('添加账号窗口已关闭');
      if (existingWindow === window) {
        existingWindow = null;
      }
    });

    return window;
  } catch (error) {
    console.error('创建添加账号窗口时出错:', error);
    return null;
  }
}

// 创建编辑账号窗口
function createEditAccountWindow(mainWindow, existingWindow, tabData) {
  try {
    console.log('创建编辑账号窗口，数据:', tabData);
    if (existingWindow && !existingWindow.isDestroyed()) {
      console.log('关闭现有编辑账号窗口');
      existingWindow.close();
    }

    const preloadPath = path.join(__dirname, '../core/preload.js');
    // console.log('预加载脚本路径:', preloadPath);

    const window = new BrowserWindow({
      width: 400,
      height: 320,
      modal: true,
      parent: mainWindow,
      resizable: false,
      minimizable: false,
      maximizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: preloadPath
      }
    });

    const htmlPath = path.join(__dirname, '../views/edit-account.html');
    // console.log('HTML 文件路径:', htmlPath);
    window.loadFile(htmlPath);
    
    window.once('ready-to-show', () => {
      console.log('编辑账号窗口准备显示');
      const bounds = centerWindow(mainWindow, 400, 320);
      window.setBounds(bounds);
      window.show();
      
      // 发送数据到编辑窗口
      console.log('发送数据到编辑窗口:', tabData);
      window.webContents.send('edit-account-data', tabData);
    });

    window.on('closed', () => {
      console.log('编辑账号窗口已关闭');
      if (existingWindow === window) {
        existingWindow = null;
      }
    });

    return window;
  } catch (error) {
    console.error('创建编辑账号窗口时出错:', error);
    return null;
  }
}

// 创建客服窗口
function createServiceWindow(mainWindow, existingWindow) {
  try {
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus();
      return existingWindow;
    }

    const window = new BrowserWindow({
      width: 800,
      height: 600,
      parent: mainWindow,
      modal: true,
      show: false,
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../core/preload.js')
      }
    });
    
    window.loadFile(path.join(__dirname, '../views/customer-service.html'));
    
    window.once('ready-to-show', () => {
      const bounds = centerWindow(mainWindow, 800, 600);
      window.setBounds(bounds);
      window.show();
    });
    
    window.on('closed', () => {
      if (existingWindow === window) {
        existingWindow = null;
      }
    });

    return window;
  } catch (error) {
    console.error('创建客服窗口失败:', error);
    return null;
  }
}

// 创建设置窗口
function createSettingsWindow(mainWindow, existingWindow) {
  try {
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus();
      return existingWindow;
    }

    const window = new BrowserWindow({
      width: 600,
      height: 400,
      parent: mainWindow,
      modal: true,
      show: false,
      center: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../core/preload.js')
      }
    });
    
    window.loadFile(path.join(__dirname, '../views/settings.html'));
    
    window.once('ready-to-show', () => {
      const bounds = centerWindow(mainWindow, 600, 400);
      window.setBounds(bounds);
      window.show();
    });
    
    window.on('closed', () => {
      if (existingWindow === window) {
        existingWindow = null;
      }
    });

    return window;
  } catch (error) {
    console.error('创建设置窗口失败:', error);
    return null;
  }
}

module.exports = {
  createAddAccountWindow,
  createEditAccountWindow,
  createServiceWindow,
  createSettingsWindow
}; 
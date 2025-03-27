const { BrowserWindow, app } = require('electron');
const path = require('path');
const windowConfig = require('../config/window');
const { 
  getWindow, 
  setWindow, 
  getWebviewContents, 
  setWebviewContents,
} = require('./appState');
const dataManager = require('../managers/dataManager');
const webviewManager = require('../managers/webviewManager');
const { setupIpcHandlers } = require('./ipcHandlers');
const { setupButtonWindowEvents } = require('./ipcButtonHandlers');

// 获取应用根目录
const APP_PATH = app.getAppPath();

// 创建主窗口
function createMainWindow() {
  const mainWindow = new BrowserWindow(windowConfig.main);
  setWindow('main', mainWindow);

  // 加载主窗口 HTML
  mainWindow.loadFile(path.join(APP_PATH, 'src/views/index.html'));

  // 监听页面加载完成事件
  mainWindow.webContents.on('did-finish-load', async () => {
    const buttonWindow = getWindow('button');
    if (buttonWindow) {
      buttonWindow.moveTop();
    }

    // 检查是否有持久化的标签页数据
    const tabsData = await dataManager.loadTabsData();

    if (!tabsData.tabs || tabsData.tabs.length === 0) {
      const defaultTab = {
        id: `tab-${Date.now()}`,
        remark: '默认标签页'
      };
      tabsData.tabs = [defaultTab];
      await dataManager.saveTabsData(tabsData);
      mainWindow.webContents.send('tab-added', defaultTab);
      // 设置 webview 事件,传入 tabId
      setupWebviewEvents(mainWindow, defaultTab.id);
    } else {
      tabsData.tabs.forEach(tab => {
        mainWindow.webContents.send('tab-added', tab);
        // 为每个 tab 设置 webview 事件,传入对应的 tabId
        setupWebviewEvents(mainWindow, tab.id);
      });
    }
  });

  // 在窗口关闭时清理
  mainWindow.on('closed', () => {
    setWindow('main', null);
  });

  return mainWindow;
}

// 创建按钮窗口
function createButtonWindow(mainWindow) {
  const buttonWindow = new BrowserWindow({
    ...windowConfig.button,
    parent: mainWindow
  });
  setWindow('button', buttonWindow);

  // 加载按钮HTML
  buttonWindow.loadFile(path.join(APP_PATH, 'src/views/buttons.html'));

  // 设置按钮窗口位置
  setupButtonWindowPosition(mainWindow, buttonWindow);

  // 设置按钮窗口事件
  setupButtonWindowEvents(buttonWindow, mainWindow);

  return buttonWindow;
}

// 设置按钮窗口位置
function setupButtonWindowPosition(mainWindow, buttonWindow) {
  const positionButtons = () => {
    const bounds = mainWindow.getBounds();
    buttonWindow.setBounds({
      width: 500,
      height: 50,
      x: bounds.x + (bounds.width - 500) / 2,
      y: bounds.y + bounds.height - 58
    });
  };

  // 监听主窗口移动和调整大小事件
  mainWindow.on('move', positionButtons);
  mainWindow.on('resize', positionButtons);

  // 初始化按钮位置
  positionButtons();

  // 监听主窗口显示/隐藏事件
  mainWindow.on('show', () => buttonWindow.show());
  mainWindow.on('hide', () => buttonWindow.hide());
  mainWindow.on('minimize', () => buttonWindow.hide());
  mainWindow.on('restore', () => {
    buttonWindow.show();
    buttonWindow.moveTop();
  });
  mainWindow.on('focus', () => buttonWindow.moveTop());
}

// 设置 webview 事件
function setupWebviewEvents(mainWindow, tabId) {
  // 获取 webview 的 webContents
  mainWindow.webContents.on('did-attach-webview', (event, contents) => {
    const webviewContents = getWebviewContents();
    webviewContents[tabId] = contents;
    setWebviewContents(webviewContents);

    contents.on('did-finish-load', () => {
      const buttonWindow = getWindow('button');
      if (buttonWindow) {
        buttonWindow.moveTop();
      }
    });

    // 监听导航事件，确保 URL 中包含 tabId
    contents.on('will-navigate', (event, url) => {
      if (!url.includes('tabId=')) {
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}tabId=${tabId}`;
        event.preventDefault();
        contents.loadURL(newUrl);
      }
    });

    // 监听导航完成事件，确保 URL 中包含 tabId
    contents.on('did-navigate', (event, url) => {
      if (!url.includes('tabId=')) {
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}tabId=${tabId}`;
        contents.loadURL(newUrl);
      }
    });
  });

  // 处理所有 webContents 的创建
  app.on('web-contents-created', (e, contents) => {
    if (contents.getType() === 'webview') {
      const webviewContents = getWebviewContents();
      webviewContents[tabId] = contents;
      setWebviewContents(webviewContents);
      // 为新创建的 webview 设置 cookie 监听
    }
    webviewManager.handleWebviewCreated(contents, getWebviewContents(), tabId);
    webviewManager.handleWebviewNavigation(contents, tabId);
  });
}

// 创建所有窗口
function createWindow() {
  const mainWindow = createMainWindow();
  const buttonWindow = createButtonWindow(mainWindow);

  // 设置 IPC 事件处理
  const windowRefs = {
    serviceWindow: getWindow('service'),
    settingsWindow: getWindow('settings'),
    addAccountWindow: getWindow('addAccount'),
    editAccountWindow: getWindow('editAccount'),
    buttonWindow
  };
  setupIpcHandlers(mainWindow, getWebviewContents(), global, windowRefs);

  return { mainWindow, buttonWindow };
}

module.exports = {
  createWindow,
  createMainWindow,
  createButtonWindow
}; 
const { ipcMain, dialog } = require('electron');
const dataManager = require('../managers/dataManager');
const { getWindow, setWindow } = require('./appState');
const { getWebviewContents, setWebviewContents, getActiveTabId, setActiveTabId, getServiceWindow, setServiceWindow, getSettingsWindow, setSettingsWindow, getAboutWindow, setAboutWindow, getAddAccountWindow, setAddAccountWindow, getEditAccountWindow, setEditAccountWindow, getGlobalState, setGlobalState } = require('./appState');
const windowManager = require('../managers/windowManager');
const webviewManager = require('../managers/webviewManager');

// 设置 IPC 事件处理
function setupIpcHandlers(mainWindow, webviewContents, global, windows) {
  // 使用引用对象来管理窗口变量
  const windowRefs = {
    serviceWindow: windows.serviceWindow,
    settingsWindow: windows.settingsWindow,
    addAccountWindow: windows.addAccountWindow,
    editAccountWindow: windows.editAccountWindow,
    buttonWindow: windows.buttonWindow
  };

  // 标签页相关
  ipcMain.handle('load-tabs-data', async () => {
    try {
      const tabsData = await dataManager.loadTabsData();
      // 如果有标签页，设置第一个为活动标签
      if (tabsData.tabs && tabsData.tabs.length > 0) {
        const firstTabId = tabsData.tabs[0].id;
        console.log(`[${new Date().toLocaleTimeString()}] 初始化活动标签页:`, firstTabId);
        setActiveTabId(firstTabId);
      }
      return tabsData;
    } catch (error) {
      console.error('加载标签页数据失败:', error);
      throw error;
    }
  });

  ipcMain.handle('save-tabs-data', async (event, tabsData) => {
    try {
      await dataManager.saveTabsData(tabsData);
    } catch (error) {
      console.error('保存标签页数据失败:', error);
      throw error;
    }
  });

  ipcMain.handle('show-confirm-dialog', async (event, title, message) => {
    const result = await dialog.showMessageBox({
      type: 'question',
      title,
      message,
      buttons: ['确定', '取消'],
      defaultId: 0,
      cancelId: 1
    });
    return result.response === 0;
  });

  // 账号相关
  ipcMain.handle('edit-tab', async (event, tabId) => {
    const tabsData = await dataManager.loadTabsData();
    const tab = tabsData.tabs.find(tab => tab.id === tabId);
    if (tab) {
      windowRefs.editAccountWindow = windowManager.createEditAccountWindow(mainWindow, windowRefs.editAccountWindow, tab);
    }
    return true;
  });

  ipcMain.handle('update-account', async (event, data) => {
    const tabsData = await dataManager.loadTabsData();
    const tabIndex = tabsData.tabs.findIndex(tab => tab.id === data.id);
    if (tabIndex !== -1) {
      tabsData.tabs[tabIndex].remark = data.remark;
      await dataManager.saveTabsData(tabsData);
      mainWindow.webContents.send('tab-updated', tabsData.tabs[tabIndex]);
      if (windowRefs.editAccountWindow) {
        windowRefs.editAccountWindow.close();
      }
    }
    return true;
  });

  ipcMain.handle('close-edit-account', () => {
    if (windowRefs.editAccountWindow) {
      windowRefs.editAccountWindow.close();
    }
    return true;
  });

  // 侧边栏事件
  ipcMain.on('sidebar-action', (event, action) => {
    switch (action) {
      case 'add':
        windowRefs.addAccountWindow = windowManager.createAddAccountWindow(mainWindow, windowRefs.addAccountWindow);
        break;
      case 'service':
        windowRefs.serviceWindow = windowManager.createServiceWindow(mainWindow, windowRefs.serviceWindow);
        break;
      case 'settings':
        windowRefs.settingsWindow = windowManager.createSettingsWindow(mainWindow, windowRefs.settingsWindow);
        break;
      case 'about':
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '关于',
          message: '大不点',
          detail: '版本: 1.0.0\n开发者: 小店助手团队\n\n大不点是一个帮助卖家更高效地管理店铺的工具。',
          buttons: ['确定']
        });
        break;
    }
  });

  // 添加账号事件
  ipcMain.on('add-account', async (event, data) => {
    const uniqueId = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTab = {
      id: `tab-${Date.now()}`,
      remark: data.remark,
      platform: data.platform || 1,  // 默认为快手
      service: null  // 添加 service 字段，默认值为 null
    };

    const tabsData = await dataManager.loadTabsData();
    tabsData.tabs.push(newTab);
    await dataManager.saveTabsData(tabsData);

    mainWindow.webContents.send('tab-added', newTab);

    if (windowRefs.addAccountWindow) {
      windowRefs.addAccountWindow.close();
    }
  });

  // 删除标签页
  ipcMain.on('remove-tab', async (event, tabId) => {
    try {
      const tabsData = await dataManager.loadTabsData();
      if (tabsData.tabs.length <= 1) {
        console.log('无法关闭最后一个标签页');
        return;
      }

      const tabIndex = tabsData.tabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) {
        console.log(`未找到标签页: ${tabId}`);
        return;
      }

      tabsData.tabs.splice(tabIndex, 1);
      await dataManager.saveTabsData(tabsData);
      event.sender.send('tab-removed', tabId);
    } catch (error) {
      console.error('删除标签页出错:', error);
    }
  });

  // 退出登录
  ipcMain.on('show-logout-modal', async () => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: '确认退出',
      message: '是否确认退出？',
      detail: '这将清除所有 cookie。',
      buttons: ['取消', '确认'],
      defaultId: 0,
      cancelId: 0
    });

    if (response === 1) {
      const activeTabId = getActiveTabId();
      if (activeTabId) {
        const contents = webviewContents[activeTabId];
        if (contents) {
          await webviewManager.handleLogout(contents);
        }
      }
    }
  });

  // 窗口返回主页
  ipcMain.on('navigate-back', () => {
    // 关闭各种窗口
    if (windowRefs.serviceWindow && !windowRefs.serviceWindow.isDestroyed()) {
      windowRefs.serviceWindow.close();
    }
    if (windowRefs.settingsWindow && !windowRefs.settingsWindow.isDestroyed()) {
      windowRefs.settingsWindow.close();
    }
  });

  // 客服数据处理
  // 请求客服数据
  ipcMain.on('request-service-data', (event) => {
    if (windowRefs.serviceWindow && !windowRefs.serviceWindow.isDestroyed()) {
      const serviceData = dataManager.loadServiceData();
      windowRefs.serviceWindow.webContents.send('load-service-data', serviceData);
    }
  });

  // 保存客服数据
  ipcMain.on('save-service-data', (event, data) => {
    dataManager.saveServiceData(data);
  });

  // 设置数据处理
  // 请求设置数据
  ipcMain.on('request-settings', (event) => {
    if (windowRefs.settingsWindow && !windowRefs.settingsWindow.isDestroyed()) {
      const settings = dataManager.loadSettings();
      windowRefs.settingsWindow.webContents.send('load-settings', settings);
    }
  });

  // 监听设置保存事件
  ipcMain.on('save-settings', (event, settings) => {
    console.log('收到设置:', settings);

    // 保存设置到本地
    dataManager.saveSettings(settings);
    console.log('设置已保存到本地');

    // 如果是场控设置，应用相应的逻辑
    if (settings.scene) {
      console.log(`应用场控设置: ${settings.scene}`);
      // 这里可以实现场控切换的逻辑
    }

    // 处理自动讲解时长设置
    if (settings.explainDuration) {
      const { min, max } = settings.explainDuration;
      console.log(`应用自动讲解时长设置: ${min}-${max}秒`);
      // 这里可以实现自动讲解时长的逻辑
    }

    // 返回成功消息
    if (event.sender && !event.sender.isDestroyed()) {
      event.reply('settings-saved', { success: true });
    }
  });

  // 获取 webview 内容
  ipcMain.handle('get-webview-contents', () => {
    return webviewContents;
  });

  // 获取全局状态
  ipcMain.handle('get-global-state', () => {
    return global;
  });

  // 获取窗口引用
  ipcMain.handle('get-window-refs', () => {
    return windowRefs;
  });

  // 读取服务数据
  ipcMain.handle('read-service-data', async () => {
    try {
      const serviceData = dataManager.readServiceData();
      return serviceData;
    } catch (error) {
      console.error('读取服务数据失败:', error);
      throw error;
    }
  });

  // 更新标签页数据
  ipcMain.handle('update-tab', async (event, tabData) => {
    try {
      const success = dataManager.updateTab(tabData);
      if (success) {
        mainWindow.webContents.send('tab-updated', tabData);
      }
      return success;
    } catch (error) {
      console.error('更新标签页数据失败:', error);
      throw error;
    }
  });

  // 更新活动的标签页（只在用户点击标签时触发）
  ipcMain.on('update-active-webview', (event, tabId) => {
    setActiveTabId(tabId);
  });
}

module.exports = {
  setupIpcHandlers
}; 
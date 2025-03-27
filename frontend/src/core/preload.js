const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
function exposeAPI() {
    const api = {
        // 标签页相关
        loadTabsData: () => ipcRenderer.invoke('load-tabs-data'),
        onTabAdded: (callback) => ipcRenderer.on('tab-added', (event, tab) => callback(tab)),
        onTabRemoved: (callback) => ipcRenderer.on('tab-removed', (event, tabId) => callback(tabId)),
        onTabUpdated: (callback) => ipcRenderer.on('tab-updated', (event, tab) => callback(tab)),
        removeTab: (tabId) => ipcRenderer.send('remove-tab', tabId),
        editTab: (tabId) => ipcRenderer.invoke('edit-tab', tabId),
        updateAccount: (data) => ipcRenderer.invoke('update-account', data),
        showConfirmDialog: (title, message) => ipcRenderer.invoke('show-confirm-dialog', title, message),
        
        // 侧边栏相关
        sidebarAction: (action) => {
            console.log('发送侧边栏动作:', action);
            ipcRenderer.send('sidebar-action', action);
        },
        
        // 客服相关
        requestServiceData: () => {
            console.log('请求客服数据');
            ipcRenderer.send('request-service-data');
        },
        onLoadServiceData: (callback) => {
            console.log('注册客服数据加载回调');
            ipcRenderer.on('load-service-data', (event, data) => callback(data));
        },
        saveServiceData: (data) => {
            console.log('保存客服数据:', data);
            ipcRenderer.send('save-service-data', data);
        },
        
        // 设置相关
        requestSettings: () => {
            console.log('请求设置数据');
            ipcRenderer.send('request-settings');
        },
        onLoadSettings: (callback) => {
            console.log('注册设置数据加载回调');
            ipcRenderer.on('load-settings', (event, settings) => callback(settings));
        },
        saveSettings: (settings) => {
            console.log('保存设置数据:', settings);
            ipcRenderer.send('save-settings', settings);
        },
        onSettingsSaved: (callback) => {
            console.log('注册设置保存回调');
            ipcRenderer.on('settings-saved', (event, result) => callback(result));
        },
        closeSettingsModal: () => {
            console.log('发送关闭设置模态框消息');
            ipcRenderer.send('close-settings-modal');
        },
        onCloseSettingsModal: (callback) => {
            console.log('注册关闭设置模态框回调');
            ipcRenderer.on('close-settings-modal', () => callback());
        },
        
        // 服务数据相关
        readServiceData: () => {
            console.log('读取服务数据');
            return ipcRenderer.invoke('read-service-data');
        },
        updateTab: (tabData) => {
            console.log('更新标签页数据:', tabData);
            return ipcRenderer.invoke('update-tab', tabData);
        },
        
        // 导航相关
        navigateBack: () => ipcRenderer.send('navigate-back'),
        onNavigateToHome: (callback) => ipcRenderer.on('navigate-to-home', () => callback()),
        onRefreshActiveTab: (callback) => ipcRenderer.on('refresh-active-tab', () => callback()),
        onToggleDebugMode: (callback) => ipcRenderer.on('toggle-debug-mode', () => callback()),
        onShowLogoutModal: (callback) => ipcRenderer.on('show-logout-modal', () => callback()),
        onShowSettingsModal: (callback) => ipcRenderer.on('show-settings-modal', () => callback()),
        
        // Webview 相关
        updateActiveWebview: (webviewId) => ipcRenderer.send('update-active-webview', webviewId),
        
        // 按钮事件
        homeClick: () => {
            console.log('发送 home-click 消息');
            ipcRenderer.send('home-click');
        },
        refreshClick: () => {
            console.log('发送 refresh-click 消息');
            ipcRenderer.send('refresh-click');
        },
        debugClick: () => {
            console.log('发送 debug-click 消息');
            ipcRenderer.send('debug-click');
        },
        showLogoutModal: () => {
            console.log('发送 show-logout-modal 消息');
            ipcRenderer.send('show-logout-modal');
        },
        showSettingsModal: () => {
            console.log('发送 show-settings-modal 消息');
            ipcRenderer.send('show-settings-modal');
        },
        
        // 账号相关
        addAccount: (data) => {
            console.log('发送添加账号数据:', data);
            ipcRenderer.send('add-account', data);
        },
        closeAddAccount: () => {
            console.log('发送关闭添加账号窗口消息');
            ipcRenderer.send('close-add-account');
        },
        closeEditAccount: () => {
            console.log('发送关闭编辑账号窗口消息');
            ipcRenderer.send('close-edit-account');
        },
        onEditAccountData: (callback) => {
            console.log('注册编辑账号数据回调');
            ipcRenderer.removeAllListeners('edit-account-data');
            ipcRenderer.on('edit-account-data', (event, data) => {
                console.log('收到编辑账号数据:', data);
                callback(data);
            });
        }
    };

    contextBridge.exposeInMainWorld('electronAPI', api);

    // 如果当前窗口是 iframe，将 API 也暴露给父窗口
    if (window !== window.top) {
        try {
            window.top.electronAPI = window.electronAPI;
        } catch (error) {
            console.error('无法将 electronAPI 暴露给父窗口:', error);
        }
    }
}

exposeAPI();

// 打印调试信息
console.log('Preload 脚本已加载');
console.log('当前窗口是否为 iframe:', window !== window.top);
console.log('electronAPI 是否可用:', !!window.electronAPI); 
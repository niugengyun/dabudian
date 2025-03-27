// 应用状态管理
const appState = {
  windows: {
    main: null,
    button: null,
    service: null,
    settings: null,
    addAccount: null,
    editAccount: null
  },
  webview: {
    contents: {},
    activeId: null,
    cookieCheckInterval: null,
    cookieValueCache: {}
  },
  global: {
    webviewStates: {}
  }
};

// 获取窗口实例
function getWindow(type) {
  return appState.windows[type];
}

// 设置窗口实例
function setWindow(type, window) {
  appState.windows[type] = window;
}

// 获取 webview 内容
function getWebviewContents() {
  return appState.webview.contents;
}

// 设置 webview 内容
function setWebviewContents(contents) {
  appState.webview.contents = contents;
}

// 获取当前激活的标签页 ID
function getActiveTabId() {
  return appState.webview.activeId;
}

// 设置当前激活的标签页 ID
function setActiveTabId(id) {
  appState.webview.activeId = id;
}

// 获取 cookie 检查定时器
function getCookieCheckInterval() {
  return appState.webview.cookieCheckInterval;
}

// 设置 cookie 检查定时器
function setCookieCheckInterval(interval) {
  appState.webview.cookieCheckInterval = interval;
}

// 获取 cookie 缓存
function getCookieValueCache() {
  return appState.webview.cookieValueCache;
}

// 设置 cookie 缓存
function setCookieValueCache(cache) {
  appState.webview.cookieValueCache = cache;
}

// 获取 webview 状态
function getWebviewState(webviewId) {
  return appState.global.webviewStates[webviewId];
}

// 设置 webview 状态
function setWebviewState(webviewId, state) {
  appState.global.webviewStates[webviewId] = state;
}

// 获取所有 webview 状态
function getAllWebviewStates() {
  return appState.global.webviewStates;
}

// 清除 webview 状态
function clearWebviewState(webviewId) {
  delete appState.global.webviewStates[webviewId];
}

module.exports = {
  appState,
  getWindow,
  setWindow,
  getWebviewContents,
  setWebviewContents,
  getActiveTabId,
  setActiveTabId,
  getCookieCheckInterval,
  setCookieCheckInterval,
  getCookieValueCache,
  setCookieValueCache,
  getWebviewState,
  setWebviewState,
  getAllWebviewStates,
  clearWebviewState
}; 
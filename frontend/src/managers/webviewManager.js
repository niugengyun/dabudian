const { webContents, session } = require('electron');
const dataManager = require('./dataManager');
const API = require('../utils/request');

/**
 * 存储所有 webview 内容的对象
 * key: tabId
 * value: webview contents
 */
let webviewContentsStore = {};

/**
 * 存储每个标签页的服务逻辑执行状态
 * key: tabId
 * value: boolean
 */
let serviceLogicRunning = {};

/**
 * 存储每个标签页的讲解执行状态
 * key: tabId
 * value: boolean
 */
let recordLogicRunning = {};

/**
 * 获取所有 webview 内容
 * @returns {Object} 所有 webview 内容的存储对象
 */
function getWebviewContents() {
  return webviewContentsStore;
}

/**
 * 设置所有 webview 内容
 * @param {Object} contents - 新的 webview 内容对象
 */
function setWebviewContents(contents) {
  webviewContentsStore = contents;
}

/**
 * 获取当前时间，格式：HH:MM:SS
 * @returns {string} 格式化的时间字符串
 */
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/**
 * 获取随机间隔时间（秒）
 * 从设置中读取最小和最大间隔时间，返回一个随机值
 * @returns {number} 随机间隔时间（秒）
 */
function getRandomInterval() {
  const settings = dataManager.loadSettings();
  const minInterval = settings.minInterval || 3;
  const maxInterval = settings.maxInterval || 10;
  return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
}


/**
 * 获取随机讲解间隔时间（秒）
 * 从设置中读取最小和最大间隔时间，返回一个随机值
 * @returns {number} 随机间隔时间（秒）
 */
function getRandomRecordInterval() {
  const settings = dataManager.loadSettings();
  const minDuration = settings.minDuration || 60;
  const maxDuration = settings.maxDuration || 120;
  return Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
}


/**
 * 处理 webview 创建事件
 * @param {Object} contents - webview 内容对象
 * @param {Object} webviewContents - 存储 webview 内容的对象
 * @param {string} tabId - 标签页 ID
 */
function handleWebviewCreated(contents, webviewContents, tabId) {
  if (contents.getType() !== 'webview') {
    return;
  }

  // 存储 webview 内容
  webviewContents[tabId] = contents;
  webviewContentsStore[tabId] = contents;

  // 5秒后执行服务逻辑
  setTimeout(() => {
    handleServiceLogic(tabId);
  }, 5000);

  // 5秒后执行讲解逻辑
  setTimeout(() => {
    handleRecordLogic(tabId);
  }, 5000);
}

/**
 * 处理 webview 导航事件
 * @param {Object} contents - webview 内容对象
 * @param {string} tabId - 标签页 ID
 */
function handleWebviewNavigation(contents, tabId) {
  if (contents.getType() !== 'webview') {
    return;
  }
}

/**
 * 处理退出登录
 * @param {Object} webviewContent - webview 内容对象
 */
async function handleLogout(webviewContent) {
  try {
    const cookies = await webviewContent.session.cookies.get({});
    console.log(`[${getCurrentTime()}] 准备清除 ${cookies.length} 个 cookies`);

    for (const cookie of cookies) {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
      await webviewContent.session.cookies.remove(url, cookie.name);
    }

    webviewContent.loadURL(`https://zs.kwaixiaodian.com/page/helper?from=seller_pc_home_page&tabId=${tabId}`);
    console.log(`[${getCurrentTime()}] 已清除所有 cookies 并返回主页`);
  } catch (error) {
    console.error(`[${getCurrentTime()}] 退出时出错：`, error);
  }
}

/**
 * 处理服务逻辑
 * 根据标签页配置的服务内容，定时发送评论
 * @param {string} tabId - 标签页 ID
 */
async function handleServiceLogic(tabId) {
  if (serviceLogicRunning[tabId]) {
    return;
  }

  serviceLogicRunning[tabId] = true;

  try {
    const tabsData = await dataManager.loadTabsData();
    const serviceData = dataManager.loadServiceData();

    const tab = tabsData.tabs.find(t => t.id === tabId);

    if (!tab || !tab.service) {
      return;
    }

    const serviceId = parseInt(tab.service);
    const service = serviceData.find(s => s.id === serviceId);
    if (!service) {
      return;
    }

    const contentArray = service.content.split('\n').filter(line => line.trim());
    const webviewContent = webviewContentsStore[tabId];

    if (!webviewContent) {
      return;
    }

    // 添加外层循环，实现持续执行
    while (true) {
      for (let i = 0; i < contentArray.length; i++) {
        const content = contentArray[i];
        const sleepTime = getRandomInterval();
        // const cookies = global.webviewStates[tabId]['cookies'];
        // const isLogin = global.webviewStates[tabId]['isLogin'];
        const cookies = await getTabCookies(tabId)

        // 检查是否登录
        if (!cookies) {
          console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 未登录，20秒后继续检查`);
          await new Promise(resolve => setTimeout(resolve, 20 * 1000));
          continue;
        }

        try {
          // 更新 liveStreamId
          const result = await API.dynamicOnsale({ cookies, tabId });
          if (!result || !result.data) {
            console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 账号没开播，20秒后继续尝试场控`);
            await new Promise(resolve => setTimeout(resolve, 20 * 1000));
            continue;
          }

          const liveStreamId = result.data.liveStreamId;
          if (!liveStreamId) {
            console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 未开播，20秒后继续检查`);
            await new Promise(resolve => setTimeout(resolve, 20 * 1000));
            continue;
          }

          // 随机选择1-3个标点符号添加到开头
          const punctuations = [',', '.', '。', '，', '`', '@', '\'', '-', '^'];
          const randomPunctuationCount = Math.floor(Math.random() * 3) + 1;
          let prefix = '';
          for (let i = 0; i < randomPunctuationCount; i++) {
            const randomPunctuation = punctuations[Math.floor(Math.random() * punctuations.length)];
            prefix += randomPunctuation;
          }

          // 随机选择一个emoji添加到结尾
          const emojis = ['😊', '😂', '🤣', '❤️', '👍', '🎉', '🔥', '💯', '🙏', '👏', '😍', '🤔', '😁', '💪', '✨'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

          // 修改评论内容，添加前缀和后缀
          const modifiedContent = prefix + content + randomEmoji;
          console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 准备发送评论: ${modifiedContent} 发送后等待: ${sleepTime}s`);

          // 调用 API 发送评论
          const response = await API.publishComment({
            liveStreamId,
            commentContent: modifiedContent,
            cookies
          });

          // 开播状态，等待随机时间
          console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 评论发送完成，等待 ${sleepTime} 秒`);
          await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
        } catch (error) {
          console.error(`[${getCurrentTime()}] [Tab: ${tabId}] 评论发送出错:`, error);
          // 发生错误时等待随机时间
          await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
        }
      }
    }
  } catch (error) {
    console.error(`[${getCurrentTime()}] [Tab: ${tabId}] 处理服务逻辑时出错:`, error);
  } finally {
    serviceLogicRunning[tabId] = false;
  }
}

/**
 * 定时讲解
 * 根据标签页配置的讲解参数，定时讲解
 * @param {string} tabId - 标签页 ID
 */
async function handleRecordLogic(tabId) {
  if (recordLogicRunning[tabId]) {
    return;
  }

  recordLogicRunning[tabId] = true;

  try {
    const tabsData = await dataManager.loadTabsData();
    const tab = tabsData.tabs.find(t => t.id === tabId);

    if (!tab || !tab.service) {
      return;
    }

    const webviewContent = webviewContentsStore[tabId];

    if (!webviewContent) {
      return;
    }

    // 添加外层循环，实现持续执行
    while (true) {
      const sleepTime = getRandomRecordInterval();

      const cookies = await getTabCookies(tabId)
      // const cookies = global.webviewStates[tabId]['cookies'];
      // const isLogin = global.webviewStates[tabId]['isLogin'];

      // 检查是否登录
      if (!cookies) {
        console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 未登录，20秒后继续检查`);
        await new Promise(resolve => setTimeout(resolve, 20 * 1000));
        continue;
      }

      try {
        // 更新 liveStreamId
        const result = await API.dynamicOnsale({ cookies, tabId });
        if (!result || !result.data) {
          console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 账号没开播，20秒后继续尝试讲解`);
          await new Promise(resolve => setTimeout(resolve, 20 * 1000));
          continue;
        }

        const liveStreamId = result.data.liveStreamId;
        if (!liveStreamId) {
          console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 未开播，20秒后继续检查`);
          await new Promise(resolve => setTimeout(resolve, 20 * 1000));
          continue;
        }

        // 获取挂车中的商品
        const commodityCardList = result.data.commodityCardList;
        // 讲解中的商品
        const recordItemId = inRecordItemId(commodityCardList);

        // 停止讲解
        if (recordItemId) {
          await API.endShopCarRecord({
            liveStreamId,
            itemId: recordItemId,
            cookies
          });
        }

        // 开始讲解
        const itemId = commodityCardList[0]["commodityId"];
        // 开始讲解
        await API.startShopCarRecord({
          liveStreamId,
          itemId,
          cookies
        });
        // 等待随机时间后继续下一次讲解
        console.log(`[${getCurrentTime()}] [Tab: ${tabId}] 讲解中，等待 ${sleepTime} 秒`);
        await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
      } catch (error) {
        console.error(`[${getCurrentTime()}] [Tab: ${tabId}] 讲解出错:`, error);
        // 发生错误时等待随机时间
        await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
      }
    }
  } catch (error) {
    console.error(`[${getCurrentTime()}] [Tab: ${tabId}] 处理服务逻辑时出错:`, error);
  } finally {
    recordLogicRunning[tabId] = false;
  }
}

/**
 * 检查商品是否在讲解中
 * @param {Array} onsale - 商品列表
 * @returns {string|null} 如果第一个商品在讲解中，返回商品ID；否则返回null
 */
function inRecordItemId(onsale) {
  if (!onsale || onsale.length === 0) {
    return null;
  }

  // 判断第一个商品是否在讲解中
  if (onsale[0].recordInfo && onsale[0].recordInfo.recordStatus === 1) {
    return onsale[0].commodityId;
  }

  return null;
}

/**
 * 获取指定标签页的 cookie
 * @param {string} tabId - 标签页 ID
 * @returns {Promise<Object|null>} 包含 cookie 的对象，如果未登录则返回 null
 */
async function getTabCookies(tabId) {
  try {
    // 使用 partition 来获取对应标签页的 session
    const partition = `persist:${tabId}`;
    const tabSession = session.fromPartition(partition);

    const cookies = await tabSession.cookies.get({});

    // 为当前 webview 创建一个 cookies 对象，只存储快手小店域名的cookie
    const webviewCookies = {};

    cookies.forEach(cookie => {
      // 只处理 .kwaixiaodian.com 域名的 cookie
      if (cookie.domain === '.kwaixiaodian.com') {
        webviewCookies[cookie.name] = cookie.value;
      }
    });

    // 只有在有快手小店 cookie 时才继续处理
    if (Object.keys(webviewCookies).length > 0) {
      // 检查是否存在 userId cookie，用于判断登录状态
      const hasUserId = cookies.some(cookie => cookie.name === 'userId');

      // 如果未登录，返回 null
      if (!hasUserId) {
        return null;
      }

      return webviewCookies;
    }

    return null;
  } catch (error) {
    console.error(`[${getCurrentTime()}] 获取标签页 ${tabId} 的 cookies 时出错：`, error);
    return null;
  }
}

module.exports = {
  handleWebviewCreated,
  handleWebviewNavigation,
  handleServiceLogic,
  handleRecordLogic,
  getWebviewContents,
  setWebviewContents,
  handleLogout,
  inRecordItemId,
  getTabCookies
}; 
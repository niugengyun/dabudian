const fetch = require('node-fetch').default;

/**
 * 生成请求头
 * @param {Object} customHeaders - 自定义请求头
 * @returns {Object} - 合并后的请求头
 */
const generateHeaders = (customHeaders = {}) => {
  const defaultHeaders = {
    'accept': 'application/json',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json',
    'kpf': 'PC_WEB',
    'kpn': 'KWAIXIAODIAN',
    'origin': 'https://zs.kwaixiaodian.com',
    'priority': 'u=1, i',
    'referer': 'https://zs.kwaixiaodian.com/page/helper?from=seller_pc_home_page',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
  };

  return { ...defaultHeaders, ...customHeaders };
};

/**
 * 生成 Cookie 字符串
 * @param {Object} cookies - cookie 键值对
 * @returns {string} - cookie 字符串
 */
const generateCookieString = (cookies = {}) => {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

/**
 * 发送请求到快手小店
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求 URL
 * @param {Object} options.data - 请求体数据
 * @param {Object} options.headers - 自定义请求头
 * @param {Object} options.cookies - cookie 键值对
 * @returns {Promise<Object>} - 响应数据
 */
const request = async ({ url, data = {}, headers = {}, cookies = {} }) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...generateHeaders(headers),
        'cookie': generateCookieString(cookies)
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};

/**
 * 快手小店 API 接口
 */
const API = {
  // 直播助手评论发布
  publishComment: async ({ liveStreamId, commentContent, headers = {}, cookies = {} }) => {
    return request({
      url: 'https://zs.kwaixiaodian.com/rest/pc/live/assistant/comment/publish',
      data: { liveStreamId, commentContent },
      headers,
      cookies
    });
  },

  // 购物车记录开始
  startShopCarRecord: async ({ liveStreamId, itemId, headers = {}, cookies = {} }) => {
    return request({
      url: 'https://zs.kwaixiaodian.com/rest/pc/live/assistant/shopCar/record/start',
      data: { liveStreamId, itemId },
      headers,
      cookies
    });
  },

  // 购物车记录结束
  endShopCarRecord: async ({ liveStreamId, itemId, setLatest = true, headers = {}, cookies = {} }) => {
    return request({
      url: 'https://zs.kwaixiaodian.com/rest/pc/live/assistant/shopCar/record/end',
      data: { liveStreamId, itemId, setLatest },
      headers,
      cookies
    });
  },

  // 动态上架
  dynamicOnsale: async ({ headers = {}, cookies = {}, tabId }) => {
    const response = await request({
      url: 'https://zs.kwaixiaodian.com/rest/pc/live/assistant/dynamic/onsale',
      data: { version: 2 },
      headers,
      cookies
    });

    return response;
  },

  // 这里可以添加更多的 API 接口...
};

// 导出 API 对象
module.exports = API; 
const dataManager = require('../managers/dataManager');
const fetch = require('node-fetch').default;

/**
 * 获取当前时间，格式：HH:MM:SS
 * @returns {string} 格式化的时间字符串
 */
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/**
 * 发送企业微信消息
 * @param {string} content - 要发送的消息内容
 * @returns {Promise<Object>} 发送结果
 */
async function sendWechatMessage(content) {
  try {
    // 从 settings.json 读取 webhook 地址
    const settings = dataManager.loadSettings();
    const webhook = settings.webhook;

    if (!webhook) {
      throw new Error('未配置企业微信 webhook 地址');
    }

    // 构建请求数据
    const data = {
      msgtype: 'text',
      text: {
        content: content,
        mentioned_list: [] // 可以在这里添加需要 @ 的用户
      }
    };

    // 发送请求
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.errcode === 0) {
      console.log(`[${getCurrentTime()}] 企业微信消息发送成功`);
      return result;
    } else {
      throw new Error(`发送失败: ${result.errmsg}`);
    }
  } catch (error) {
    console.error(`[${getCurrentTime()}] 发送企业微信消息时出错:`, error);
    throw error;
  }
}

module.exports = {
  sendWechatMessage
}; 
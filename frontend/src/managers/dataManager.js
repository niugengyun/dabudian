const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const os = require('os');

// 获取用户主目录下的配置目录路径
const USER_DATA_DIR = path.join(os.homedir(), process.platform === 'win32' ? 'dabudian' : '.dabudian');

// 数据存储路径配置
const paths = {
  serviceData: path.join(USER_DATA_DIR, 'serviceData.json'),
  settings: path.join(USER_DATA_DIR, 'settings.json'),
  tabsData: path.join(USER_DATA_DIR, 'tabs.json')
};

// 初始化数据目录
function initDataDir() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    // 在Windows系统上设置目录为隐藏
    if (process.platform === 'win32') {
      const { execSync } = require('child_process');
      try {
        execSync(`attrib +h "${USER_DATA_DIR}"`);
      } catch (error) {
        console.error('设置目录隐藏属性失败:', error);
      }
    }
  }
}

// 初始化数据目录
initDataDir();

// 检查文件状态
function checkFileStatus(filePath) {

  try {
    console.log('检查文件状态:', filePath);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('文件存在:', {
        size: stats.size,
        permissions: stats.mode,
        uid: stats.uid,
        gid: stats.gid,
        created: stats.birthtime,
        modified: stats.mtime
      });
      return true;
    } else {
      console.log('文件不存在');
      return false;
    }
  } catch (error) {
    console.error('检查文件状态时出错:', error);
    return false;
  }
}

// 客服数据管理
function loadServiceData() {
  try {
    if (fs.existsSync(paths.serviceData)) {
      return JSON.parse(fs.readFileSync(paths.serviceData, 'utf8'));
    }
  } catch (error) {
    console.error('读取客服数据出错:', error);
  }
  return [
    { id: 1, group: '常见问题', content: '您好，感谢您的咨询。\n请问您遇到了什么问题？\n我们将尽快为您解决。' },
    { id: 2, group: '订单咨询', content: '您好，感谢您的订单。\n您的订单正在处理中。\n如有疑问，请提供订单号，我们会为您查询。' },
    { id: 3, group: '退款处理', content: '您好，关于您的退款申请。\n请提供订单号和退款原因。\n我们将在1-3个工作日内处理您的退款请求。' }
  ];
}

function saveServiceData(data) {
  try {
    fs.writeFileSync(paths.serviceData, JSON.stringify(data, null, 2), 'utf8');
    console.log('客服数据已保存');
  } catch (error) {
    console.error('保存客服数据出错:', error);
  }
}

// 读取服务数据
function readServiceData() {
  try {
    if (fs.existsSync(paths.serviceData)) {
      const data = JSON.parse(fs.readFileSync(paths.serviceData, 'utf8'));
      // 如果数据是数组格式，转换为期望的格式
      if (Array.isArray(data)) {
        return {
          services: data.map(item => ({
            id: item.id,
            group: item.group
          }))
        };
      }
      return data;
    }
  } catch (error) {
    console.error('读取服务数据出错:', error);
  }
  return { services: [] };
}

// 设置数据管理
function loadSettings() {
  try {
    if (fs.existsSync(paths.settings)) {
      return JSON.parse(fs.readFileSync(paths.settings, 'utf8'));
    }
  } catch (error) {
    console.error('读取设置数据出错:', error);
  }
  return {
    minInterval: 3,
    maxInterval: 10,
    minDuration: 30,
    maxDuration: 120,
    webhookUrl: ''
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(paths.settings, JSON.stringify(settings, null, 2), 'utf8');
    console.log('设置数据已保存');
  } catch (error) {
    console.error('保存设置数据出错:', error);
  }
}

// 标签页数据管理
function loadTabsData() {
  try {
    if (!fs.existsSync(paths.tabsData)) {
      // 如果文件不存在，创建默认数据
      const defaultData = {
        tabs: [
          {
            id: 'tab-1',
            remark: '默认账号',
            platform: 1,  // 默认为快手
            service: null  // 默认没有场控
          }
        ]
      };
      fs.writeFileSync(paths.tabsData, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }

    const data = fs.readFileSync(paths.tabsData, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载标签页数据失败:', error);
    throw error;
  }
}

function saveTabsData(data) {
  try {
    fs.writeFileSync(paths.tabsData, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('保存标签页数据出错:', error);
  }
}

// 更新标签页数据
function updateTab(tabData) {
  try {
    let tabsData = loadTabsData();
    const tabIndex = tabsData.tabs.findIndex(tab => tab.id === tabData.id);
    if (tabIndex !== -1) {
      tabsData.tabs[tabIndex] = tabData;
      saveTabsData(tabsData);
      return true;
    }
  } catch (error) {
    console.error('更新标签页数据出错:', error);
  }
  return false;
}

module.exports = {
  loadServiceData,
  saveServiceData,
  loadSettings,
  saveSettings,
  loadTabsData,
  saveTabsData,
  readServiceData,
  updateTab
}; 
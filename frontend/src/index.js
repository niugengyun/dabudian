const { app } = require('electron');
const { setupAppLifecycle } = require('./core/appLifecycle');
const path = require('path');
const os = require('os');
const fs = require('fs');
const dataManager = require('./managers/dataManager');

// 设置应用名称
app.setName('大不点');

// 设置用户数据目录
const USER_DATA_DIR = path.join(os.homedir(), process.platform === 'win32' ? 'dabudian' : '.dabudian');

// 设置session存储路径
app.setPath('userData', USER_DATA_DIR);

// 清理不需要的缓存目录
async function cleanUnusedPartitions() {
  try {
    // 获取所有标签页ID
    const tabsData = await dataManager.loadTabsData();
    const validTabIds = tabsData.tabs.map(tab => tab.id);
    
    // 获取Partitions目录下的所有文件夹
    const partitionsDir = path.join(USER_DATA_DIR, 'Partitions');
    if (fs.existsSync(partitionsDir)) {
      const dirs = fs.readdirSync(partitionsDir);
      
      // 遍历并删除不需要的目录
      for (const dir of dirs) {
        if (!validTabIds.includes(dir)) {
          const dirPath = path.join(partitionsDir, dir);
          if (fs.statSync(dirPath).isDirectory()) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`已删除不需要的缓存目录: ${dir}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('清理缓存目录时出错:', error);
  }
}

// 设置应用生命周期
setupAppLifecycle();

// 在应用启动时清理缓存
app.whenReady().then(async () => {
  await cleanUnusedPartitions();
}); 
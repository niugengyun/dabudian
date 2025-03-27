# 大不点进程守护程序

基于 Python Tkinter 开发的进程守护工具，用于监控和管理大不点直播助手的运行状态。采用 Ant Design 风格设计，提供简洁美观的用户界面。

## 功能特点

- 🔄 **自动监控**
  - 实时监控主程序运行状态
  - 异常退出自动重启（最多重试5次）
  - 智能进程管理

- 📝 **日志管理**
  - 实时显示运行日志
  - 保留最近1000条日志记录
  - 自动滚动和清理

- 🎨 **现代界面**
  - Ant Design 风格设计
  - 圆角卡片布局
  - 优雅的状态展示
  - 响应式按钮

## 技术实现

- 使用 Python Tkinter 构建界面
- 多线程处理进程监控和日志收集
- subprocess 管理子进程
- 自定义 Tkinter 组件实现现代界面效果

## 目录结构

```
app-monitor/
├── main.py          # 主程序
├── main.spec        # PyInstaller 配置文件
├── requirements.txt # 项目依赖
├── README.md        # 说明文档
└── icon/            # 图标目录
    └── app.ico      # Windows 图标
    └── app.png      # MacOS   图标
```

## 环境要求

- Python 3.8 或更高版本
- 依赖包：
  - PyInstaller 6.4.0（用于打包）

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用说明

1. 确保已安装 Python 环境
2. 运行程序：
   ```bash
   python main.py
   ```
3. 程序启动后会自动开始监控
4. 通过界面按钮控制监控状态
5. 实时查看运行日志

## 打包说明

1. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 执行打包命令：
   ```bash
   pyinstaller main.spec
   ```

3. 打包完成后，可执行文件位于 `dist/大不点守护程序.exe`

4. 运行打包后的程序：
   - 双击 `dist/大不点守护程序.exe` 即可运行
   - 或右键选择"以管理员身份运行"（如果需要更高权限）

## 注意事项

- 建议将守护程序和主程序放在同一目录下
- 确保程序有足够的权限访问主程序
- 避免同时运行多个守护进程实例
- 打包前请确保 icon 目录中有 app.ico 图标文件
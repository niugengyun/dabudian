# 大不点直播助手

一个基于 Electron 开发的多平台直播辅助工具，专为直播带货设计。支持多账号管理、定时自动讲解、关键词智能回复、文字场控等功能，让直播更轻松、更智能。

## 项目结构

```
.
├── frontend/           # 前端应用目录
│   ├── src/           # 源代码
│   ├── package.json   # 项目依赖配置
│   └── README.md      # 前端项目说明文档
│
├── app-monitor/       # 进程守护程序
│   ├── main.py       # Python 守护进程主程序
│   ├── icon/         # 应用图标
│   └── README.md     # 守护进程说明文档
│
├── restful-api/      # 后端 API 服务
│   ├── src/         # 源代码
│   ├── dist/        # 编译后的代码
│   ├── package.json # 项目依赖配置
│   └── README.md    # API 服务说明文档
│
└── .gitignore       # Git 忽略配置
```

## 快速开始

### 前端开发

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发环境
```bash
npm start
```

### 后端开发

1. 进入后端目录
```bash
cd restful-api
```

2. 安装依赖
```bash
npm install
```

3. 启动开发环境
```bash
npm run dev
```

### 进程守护程序

1. 进入守护程序目录
```bash
cd app-monitor
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 启动守护程序
```bash
python main.py
```

## 详细文档

- [前端项目文档](https://github.com/niugengyun/dabudian-frontend/blob/main/README.md)
- [进程守护程序文档](https://github.com/niugengyun/dabudian-app-monitor/blob/main/README.md)
- [API 服务文档](https://github.com/niugengyun/dabudian-api/blob/main/README.md)
- [API 接口文档](https://github.com/niugengyun/dabudian-api/blob/main/API.md)

## 许可证

版权所有 © 2024 大不点直播助手

本软件仅供个人学习和个人使用，严禁用于商业目的。详细许可证信息请参考 [前端项目文档](https://github.com/niugengyun/dabudian-frontend/blob/main/README.md#许可证)。 
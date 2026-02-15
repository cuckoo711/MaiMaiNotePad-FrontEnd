# MaiMaiNotePad 前端应用

这是 MaiMaiNotePad/MaiMNP 的前端项目，基于 Vue 3 + Vite + Element Plus 构建，为后端提供的知识库管理、人设卡管理、用户系统等功能提供 Web 界面。

后端项目对应目录为：`../MaiMaiNotePad-BackEnd`，两者配合运行即可完成完整功能体验。

---

## 功能特性

### 用户与认证
- 用户登录、退出
- 记住账号信息（可选）
- 基于 JWT 的前端鉴权
- 自动在请求中附带 `Authorization: Bearer {token}`
- 自动刷新访问令牌（access token），在 token 过期时通过后端 `/api/refresh` 接口获取新 token

### 知识库模块
- 显示公开知识库列表（分页、搜索、筛选）
- 查看知识库详情
- 下载单个知识库文件
- 下载知识库文件压缩包
- 按 Star 状态展示部分交互（后端支持完备，前端部分视图已接入）

### 人设卡模块
- 显示公开人设卡列表（分页、搜索、筛选）
- 查看人设卡详情
- Star/取消 Star 人设卡
- 下载单个文件与整卡压缩包

### 用户中心与个人功能
- 获取当前登录用户信息（`/api/users/me`）
- 查看个人上传/收藏等数据的基础视图（部分功能依赖后端接口逐步接入）

---

## 技术栈

- 框架：Vue 3（`<script setup>`）
- 构建工具：Vite
- UI 组件库：Element Plus
- 路由：Vue Router 4
- HTTP 客户端：Axios

依赖声明见 [package.json](./package.json)。

---

## 目录结构（前端）

```bash
MaiMaiNotePad-FrontEnd/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # 与后端交互的 API 封装
│   │   ├── index.js         # Axios 实例与拦截器（含自动刷新 token）
│   │   ├── user.js          # 用户相关接口
│   │   ├── knowledge.js     # 知识库相关接口
│   │   └── persona.js       # 人设卡相关接口
│   ├── assets/              # 静态资源
│   ├── components/          # 通用组件
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── utils/
│   │   └── api.js           # 通用 API 响应/错误处理工具
│   ├── views/
│   │   ├── Home.vue         # 首页
│   │   ├── Login.vue        # 登录页
│   │   ├── Register.vue     # 注册页
│   │   ├── KnowledgeBase.vue # 知识库列表与详情
│   │   ├── PersonaCard.vue  # 人设卡列表与详情
│   │   └── UserCenter.vue   # 用户中心（基础结构）
│   ├── App.vue              # 根组件
│   ├── main.js              # 应用入口
│   └── style.css            # 全局样式
├── .env.development         # 开发环境配置
├── .env.production          # 生产环境配置
├── api_documentation.md     # 针对后端 API 的前端使用文档
├── vite.config.js           # Vite 配置（含 /api 代理）
└── README.md                # 本文档
```

---

## 环境变量与后端联调

本项目使用 Vite 的环境变量机制：

- 开发环境：`.env.development`
  - `VITE_API_BASE_URL=/api`
  - 通过 Vite 代理，将以 `/api` 开头的请求转发到后端 `http://localhost:9278`
- 生产环境：`.env.production`
  - `VITE_API_BASE_URL=https://your-production-api.com/api`
  - 可根据真实部署地址修改为线上后端域名

Vite 代理配置见 [vite.config.js](./vite.config.js)：

- 将 `/api` 代理到 `http://localhost:9278`
- 同时开启 `server.host = true`，方便局域网其它设备访问前端。

---

## 快速开始

### 1. 安装依赖

```bash
cd MaiMaiNotePad-FrontEnd
npm install
```

### 2. 开发模式启动

确保后端已在 `9278` 端口运行：

```bash
cd ../MaiMaiNotePad-BackEnd
python -m uvicorn main:app --host 0.0.0.0 --port 9278 --reload
```

在前端目录启动开发服务器：

```bash
cd ../MaiMaiNotePad-FrontEnd
npm run dev
```

默认访问地址：

- 本机：`http://localhost:5173/`
- 局域网：根据终端输出的 `Network` 地址，例如 `http://192.168.x.x:5173/`

### 3. 生产构建与预览

打包构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

---

## 鉴权与自动刷新 Token

前端与后端的 JWT 交互约定如下：

- 登录成功后（`POST /api/token`）：
  - 前端从响应中读取 `access_token` 与 `refresh_token`
  - 分别保存到 `localStorage.access_token` 和 `localStorage.refresh_token`
- 后续所有使用 `apiClient` 的请求：
  - 在请求拦截器中，从 `localStorage.access_token` 读取 token 并写入 `Authorization` 头
- 当接口返回 `401 Unauthorized` 时：
  - 如果存在 `refresh_token`，前端自动调用 `POST /api/refresh` 获取新的 `access_token`
  - 刷新成功：
    - 更新本地 `access_token`
    - 自动使用新 token 重新发起原本失败的请求
  - 刷新失败或无 `refresh_token`：
    - 清除本地 token
    - 跳转到登录页 `/login`

具体实现见：

- Axios 实例与拦截器：[src/api/index.js](./src/api/index.js)
- 登录逻辑与 token 持久化：[src/views/Login.vue](./src/views/Login.vue)

---

## 功能完成进度

下面是当前前端功能与后端能力的对齐情况（基于代码与 API 文档的梳理）：

### 认证与用户

- [x] 登录页（用户名/密码）
- [x] 登录成功后保存 `access_token`/`refresh_token`
- [x] 基于 Axios 拦截器自动附带 `Authorization` 头
- [x] 自动刷新访问 token（调用 `/api/refresh`）
- [ ] 注册流程完整打通（验证码获取、注册表单提交的全链路校验与错误提示仍在完善）
- [ ] 修改密码、重置密码前端流程

### 知识库模块

- [x] 显示公开知识库列表（分页、搜索、筛选参数已接入）
- [x] 查看知识库详情
- [x] 下载单个文件
- [x] 下载整库压缩包
- [ ] 个人上传记录视图与管理操作（删除、编辑等）
- [ ] Star/取消 Star 的前端交互与状态同步全面对齐文档

### 人设卡模块

- [x] 显示公开人设卡列表（分页、搜索、筛选）
- [x] 查看人设卡详情
- [x] Star/取消 Star 人设卡
- [x] 下载单个文件
- [x] 下载人设卡压缩包
- [ ] 个人人设卡管理视图（我的上传、人设卡审核状态等）

### 用户中心与管理

- [x] 用户中心基础路由与页面骨架
- [ ] 展示后端统计数据（上传数量、收藏统计等）
- [ ] 管理员视图（用户管理、审核面板等）

---

## 开发说明

- 使用 Vue 3 `<script setup>` 风格组件
- 路由按模块拆分视图（登录、注册、知识库、人设卡、用户中心等）
- 所有与后端交互的请求统一通过 `src/api` 下的封装发起，避免在视图中直接拼接 URL
- 常见 API 响应和错误统一通过 `src/utils/api.js` 中的工具函数处理，确保提示文案一致

后续如果扩展新模块（例如后台管理页），建议：

- 在 `src/views/` 下新增对应页面
- 在 `src/api/` 下增加该模块的 API 包装
- 在 `src/router/index.js` 中补充路由并控制访问权限（如仅 admin 可见）

---

## 常见问题

### 无法登录或提示 401

- 确认后端已在 `9278` 端口正常运行，并可访问 `http://localhost:9278/docs`
- 确认环境变量 `VITE_API_BASE_URL` 配置正确（开发环境建议为 `/api`）
- 如果多次 401 后被跳转回 `/login`，说明刷新 token 也失败了，需要重新登录

### 下载文件失败

- 检查浏览器控制台 Network 面板查看具体接口返回
- 确认登录状态是否有效（过期会触发刷新流程）
- 确认后端对应下载接口已按照文档实现，并且当前用户有权限访问目标资源

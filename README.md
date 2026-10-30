# 职境 AI · 电梯维保岗前能力智训平台（Demo）

## 运行与部署

这是一个纯静态前端 Demo，所有可部署文件均在 `dist/` 目录。将 `dist/` 内的内容上传至任意静态站点根目录即可运行，入口文件为 `index.html`。

- 本地预览：使用任意静态 Web 服务器打开 `dist/`，不要直接双击 HTML 文件。
- 静态部署：GitHub Pages、腾讯云 COS 静态网站、Nginx、对象存储 CDN 均可。
- 浏览器数据：当前练习成绩与最近三次训练历史存储在浏览器 `localStorage`，未接入账号、数据库或服务端同步。

## 当前功能边界

前端已实现：

1. 三个模块的交互训练与本地评分。
2. 岗位工单训练的关卡锁定、重新训练与最近三次成绩记录。
3. 能力档案的三模块成绩汇总和规则型学习建议。
4. 三维现场诊断、视频微课、工具选择、流程排序与工单闭环练习。

当前没有后端 API、用户账号、数据库、真实模型调用或密钥配置。页面内的“本地模拟 AI 点评/复盘”由前端规则生成，仅用于 Demo 展示。

## 真实 AI 接入

请先阅读 [AI_INTEGRATION_SPEC.md](AI_INTEGRATION_SPEC.md)。

推荐在腾讯云 CloudBase 或 SCF 中部署后端接口 `/api/ai-feedback`：

- 模型 API Key 仅存放在后端环境变量或密钥管理中，绝不能放入 `dist/`。
- 后端接收结构化训练结果，调用模型后返回固定 JSON。
- 前端调用失败时保留现有规则型建议，避免训练流程中断。

## 关键代码位置

- `dist/safety-library.js`：安全意识与岗位规范的训练与评分。
- `dist/operation-task.js`：关键操作与标准流程的训练与评分。
- `dist/residential-entrapment-task.js`：住宅小区困人应急处置工单训练。
- `dist/ability-profile.js`：三个模块的成绩汇总与能力档案。

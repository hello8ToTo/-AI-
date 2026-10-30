# AI 接入协议（供后端开发使用）

## 结论

当前项目是静态前端，没有可直接填入模型 Key 的“后台代码”。程序员可以接入任意兼容模型，但需新增受保护的服务端接口；不要让浏览器直接调用模型供应商。

建议架构：

```text
浏览器训练页 -> POST /api/ai-feedback -> 腾讯云 SCF / CloudBase 后端 -> 模型服务
                                         -> 日志、限流、内容校验
```

模型 Key 使用腾讯云环境变量或密钥管理保存，例如 `AI_API_KEY`；前端只访问业务接口。

## 请求格式

接口：`POST /api/ai-feedback`

```json
{
  "schemaVersion": "1.0",
  "learner": { "anonymousId": "浏览器生成的匿名标识" },
  "training": {
    "module": "岗位任务实训舱",
    "scenarioId": "residential-entrapment-v1",
    "scenarioName": "住宅小区乘客被困应急处置",
    "attemptNo": 2,
    "completedAt": "2026-10-30T15:20:00+08:00"
  },
  "performance": {
    "totalScore": 82,
    "dimensions": [
      { "name": "远程沟通", "score": 18, "maxScore": 20, "missedPoints": [], "wrongChoices": [] },
      { "name": "应急协同", "score": 10, "maxScore": 15, "missedPoints": ["现场分工"], "wrongChoices": [] },
      { "name": "到场决策", "score": 31, "maxScore": 40, "missedPoints": [], "wrongChoices": ["跳过安全确认" ] },
      { "name": "工单闭环", "score": 23, "maxScore": 25, "missedPoints": [], "wrongChoices": [] }
    ],
    "recentScores": [72, 78, 82]
  },
  "request": {
    "goal": "生成本次诊断、唯一优先复训项和可执行的下一步练习建议",
    "responseLanguage": "zh-CN"
  }
}
```

模块维度：

| 模块 | 上送维度 |
| --- | --- |
| 安全意识与岗位规范 | 风险识别、处置优先级、依据说明 |
| 关键操作与标准流程 | 选择工具、规范操作顺序、关键部件检查/调整、复核与记录 |
| 岗位任务实训舱 | 远程沟通、应急协同、到场决策、工单闭环 |

仅上送完成训练所需的结构化成绩、错漏项与匿名标识；不应上传 API Key、姓名、手机号、完整自由文本工单或浏览器全部本地存储。

## 响应格式

后端需要验证模型输出后再返回前端，保证字段完整、文字简短、可稳定展示。

```json
{
  "diagnosis": "本次电话信息核实较完整，但现场协同安排仍有遗漏。",
  "priority": "应急协同",
  "reason": "该维度得分为 10/15，且未明确物业与维保人员的现场分工。",
  "nextActions": [
    "复训电话调度中的现场联系人确认",
    "用一句话明确物业隔离与维保检查的分工",
    "完成一次同场景复测"
  ],
  "encouragement": "保持先确认安全边界、再推进处置的习惯。"
}
```

建议后端对 `diagnosis`、`reason` 限制为 120 字以内，`nextActions` 固定为 3 条，拒绝模型返回 HTML、脚本或 Markdown 链接。

## 前端改造点

1. 每个模块完成最终评分后，组装上述请求并调用 `/api/ai-feedback`。
2. 成功时展示返回结果，替换当前“本地模拟 AI”文本。
3. 超时、限流或返回格式不合法时，继续展示现有规则型建议并提示“AI 建议暂不可用，不影响本次评分”。
4. 能力档案页面调用同一接口的 `overall` 诊断模式：上送三个模块最新成绩、最低维度及最近三次变化，返回综合优化建议。

## 必要的后端防护

- Key 只配置在服务端环境变量；禁止写入 Git、COS 文件或浏览器。
- 校验分数范围、模块枚举、数组长度和请求体大小。
- 限流、请求日志与异常告警；日志不要记录敏感原文。
- 限制 CORS 到实际训练站点域名，生产环境要求 HTTPS。
- 模型输出按 JSON Schema 校验，失败时走规则型兜底建议。

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#abilityProfile');
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (error) { return null; } };
  const number = value => Number(value) || 0;
  const formatDate = value => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? '历史记录' : date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }); };
  const latestOf = module => module.history.at(-1);

  const safetyHistory = (Array.isArray(read('ability-history:safety')) ? read('ability-history:safety') : []).slice(-3).map(item => ({ attemptNo: number(item.attemptNo) || 1, completedAt: item.completedAt || '', total: number(item.total), scores: Array.isArray(item.stageScores) ? item.stageScores.map(number) : [0, 0, 0] }));
  const operationRaw = read('elevator-training-result:door-lock');
  let operationHistory = Array.isArray(operationRaw?.attemptHistory) ? operationRaw.attemptHistory.slice(-3) : [];
  if (!operationHistory.length && operationRaw?.completed) operationHistory = [{ attemptNo: 1, completedAt: operationRaw.completedAt || '', total: Object.values(operationRaw.stageScores || {}).reduce((sum, value) => sum + number(value), 0), stageScores: operationRaw.stageScores || {} }];
  operationHistory = operationHistory.map(item => ({ attemptNo: number(item.attemptNo) || 1, completedAt: item.completedAt || '', total: number(item.total), scores: [1, 2, 3, 4].map(index => number(item.stageScores?.[index])) }));
  const workorderRaw = read('workorder-entrapment-v3');
  let workorderHistory = Array.isArray(workorderRaw?.attemptHistory) ? workorderRaw.attemptHistory.slice(-3) : [];
  if (!workorderHistory.length && workorderRaw?.completed && Array.isArray(workorderRaw.scores)) workorderHistory = [{ attemptNo: 1, completedAt: workorderRaw.completedAt || '', total: workorderRaw.scores.reduce((sum, value) => sum + number(value), 0), scores: workorderRaw.scores }];
  workorderHistory = workorderHistory.map(item => ({ attemptNo: number(item.attemptNo) || 1, completedAt: item.completedAt || '', total: number(item.total), scores: Array.isArray(item.scores) ? item.scores.map(number) : [0, 0, 0, 0, 0] }));

  const modules = [
    { id: 'safety', number: '模块 01', title: '安全意识与岗位规范', href: 'safety.html', history: safetyHistory, dimensions: [{ name: '风险识别', max: 33, get: item => item.scores[0] || 0 }, { name: '处置优先级', max: 33, get: item => item.scores[1] || 0 }, { name: '依据说明', max: 34, get: item => item.scores[2] || 0 }] },
    { id: 'operation', number: '模块 02', title: '关键操作与标准流程', href: 'operation.html', history: operationHistory, dimensions: [{ name: '选择工具', max: 25, get: item => item.scores[0] || 0 }, { name: '规范操作顺序', max: 30, get: item => item.scores[1] || 0 }, { name: '关键部件检查/调整', max: 25, get: item => item.scores[2] || 0 }, { name: '复核与记录', max: 20, get: item => item.scores[3] || 0 }] },
    { id: 'workorder', number: '模块 03', title: '岗位任务实训舱', href: 'tasks.html', history: workorderHistory, dimensions: [{ name: '远程沟通', max: 20, get: item => item.scores[0] || 0 }, { name: '应急协同', max: 15, get: item => item.scores[2] || 0 }, { name: '到场决策', max: 40, get: item => (item.scores[1] || 0) + (item.scores[3] || 0) }, { name: '工单闭环', max: 25, get: item => item.scores[4] || 0 }] }
  ];
  const tips = {
    '风险识别': '回到案例现场，按“设备状态—人员防护—作业条件”逐项核查，避免仅依据单一现象作判断。', '处置优先级': '先完成安全确认和风险隔离，再进入具体处理动作；复训时重点比较不同处置顺序的后果。', '依据说明': '记录应覆盖关键状态、采取措施及沟通要点，让后续复核可以追溯判断依据。', '选择工具': '结合故障现象区分测量、调整和无关工具；携带工具前先明确检查对象。', '规范操作顺序': '按“确认—检查—调整—复核”的闭环重新演练，避免跳过测量或提前复位。', '关键部件检查/调整': '聚焦锁钩啮合、安全触点和门刀滚轮等关键部件，依据标准逐项核查和调整。', '复核与记录': '在恢复运行前完成复测，并把异常现象、处理动作和复位结果写入记录。', '远程沟通': '电话中优先确认被困人员状态、轿厢位置和现场联系人，让信息能够支撑后续调度。', '应急协同': '明确现场物业与维保人员的分工和安全边界，把沟通落实为可执行的协同动作。', '到场决策': '到场后先围绕故障线索完成安全确认、现场检查和处置排序，再实施调整。', '工单闭环': '补足处置结果、复位确认与交接记录，确保这次应急处置形成完整闭环。'
  };
  const adviceFor = module => {
    const latest = latestOf(module);
    if (!latest) return `完成一次“${module.title}”训练后，电梯维保教练将依据各项得分生成针对性复训建议。`;
    const weak = module.dimensions.map(dimension => ({ ...dimension, score: dimension.get(latest) })).reduce((lowest, item) => item.score / item.max < lowest.score / lowest.max ? item : lowest);
    return `优先复训“${weak.name}”（当前 ${weak.score}/${weak.max}）。${tips[weak.name] || '结合本次错项回看相应微课后再进行训练。'}`;
  };
  const moduleTable = module => {
    const latest = latestOf(module);
    const rows = module.history.length ? module.history.map(item => `<tr><td>第 ${item.attemptNo} 次</td><td>${formatDate(item.completedAt)}</td><td><strong>${item.total} 分</strong></td>${module.dimensions.map(dimension => `<td>${dimension.get(item)}/${dimension.max}</td>`).join('')}</tr>`).join('') : `<tr class="empty-row"><td colspan="${3 + module.dimensions.length}">暂无训练成绩，完成本模块一次测试后将保留最近三次记录。</td></tr>`;
    return `<section class="module-card" id="${module.id}"><div class="module-head"><div><span class="module-kicker">${module.number}</span><h2>${module.title}</h2><p>最近三次训练成绩会自动保留；完成第 4 次后，最早的记录会被替换。</p></div><a class="module-link" href="${module.href}">${latest ? '继续复训' : '开始训练'} →</a></div><div class="history-wrap"><table class="history-table"><thead><tr><th>训练次数</th><th>练习时间</th><th>总分</th>${module.dimensions.map(dimension => `<th>${dimension.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="ai-advice"><span>AI 学习建议</span><p>${adviceFor(module)}</p></div></section>`;
  };
  const completedModules = modules.filter(module => latestOf(module));
  const average = completedModules.length === modules.length ? Math.round(completedModules.reduce((sum, module) => sum + latestOf(module).total, 0) / modules.length) : null;
  const overallAdvice = () => {
    if (completedModules.length < modules.length) return `目前已纳入 ${completedModules.length}/3 个模块的最新成绩。建议先完成其余模块的首次训练，系统才会生成完整的三模块总平均分与综合优化方向。`;
    const lowest = completedModules.map(module => ({ module, score: latestOf(module).total })).reduce((result, item) => item.score < result.score ? item : result);
    const direction = average >= 90 ? '整体表现稳定，可通过复训巩固薄弱维度，并尝试在更复杂案例中保持同样的闭环质量。' : average >= 75 ? `优先提升“${lowest.module.title}”的得分，再回看该模块的 AI 学习建议，形成一次有针对性的复训。` : `建议先集中复训“${lowest.module.title}”，以该模块的最低能力项为切入点，再逐步回测三个模块。`;
    return `总平均 ${average} 分。${direction}`;
  };
  root.innerHTML = `<section class="overall-card"><div><span class="overall-kicker">三个模块综合能力</span><h2>总平均得分</h2><p>按三个模块最近一次完整训练成绩计算，不以历史最佳分替代当前表现。</p></div><div class="overall-score"><strong>${average === null ? '—' : average}</strong><span>分</span><small>${completedModules.length}/3 个模块已纳入</small></div><div class="overall-ai"><span>电梯维保教练 · AI 综合建议</span><p>${overallAdvice()}</p></div></section>${modules.map(moduleTable).join('')}`;
});

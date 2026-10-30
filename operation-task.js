document.addEventListener('DOMContentLoaded',()=>{
  const taskId=new URLSearchParams(location.search).get('task');
  const data={
    'door-lock':{
      number:'任务 01',title:'门锁回路与触点状态检查',
      description:'面对轿门未关好、门锁回路异常等现象，完成门锁触点、机械联锁与回路状态判断。',
      context:'接到“电梯无法正常启动”的报修后，现场发现轿门已闭合，但控制系统仍提示门锁回路未接通。请依据现象完成后续判断。',
      image:'safety-scene-isolation.png',
      microcourse:{video:'door-lock-microcourse.mp4',title:'层门系统的专项保养',note:'先了解层门门锁、锁钩啮合和安全触点的检查要点与调整示范；本步骤可观看，也可跳过后直接练习。'},
      tools:['万用表','绝缘螺丝刀','塞尺','扳手','管钳','电焊钳'],
      sequenceSteps:[
        '确认轿门与层门均已关闭，检查锁钩与锁钩板间距是否为 2–3 mm，并确认门锁啮合深度大于 7 mm。',
        '根据测量结果调整锁钩与锁钩板，使间距和啮合深度达到要求。',
        '调整门刀与层门锁滚轮，使两者中心重合。',
        '移动轿厢并逐层测量，复核门刀、门锁滚轮及轿门、层门地坎之间的间距关系。',
        '门系统完全关闭后，调整并复核安全触点：插座插脚对中，接触点位于铜面中部，动静触点中心偏差符合要求。'
      ],
      keyParts:['确认锁钩与锁钩板的啮合深度','检查安全触点插入是否对中','检查动、静触点接触位置与可靠性','确认门刀与层门锁滚轮的对中关系'],
      keyPartOptions:['检查门机皮带张力','确认门刀与层门锁滚轮的对中关系','检查安全触点插入是否对中','检查轿厢照明回路','确认锁钩与锁钩板的啮合深度','检查动、静触点接触位置与可靠性']
    },
    'door-protection':{
      number:'任务 02',title:'门机与门区保护异常排查',
      description:'面对开关门受阻、门区信号异常等现象，检查门机运行、门区保护与相关部件，并作出调整判断。',
      available:false,
      context:'收到“开关门受阻、轿厢无法正常运行”的反馈后，观察门机运行与门区保护状态，判断需要检查的部件和操作顺序。',
      image:'safety-scene-check.png',microcourse:null,
      tools:['万用表','绝缘螺丝刀','塞尺','扳手'],
      keyParts:['检查门机运行及传动状态','确认门区保护信号与安装位置','检查安全保护装置的动作可靠性','复核开关门过程是否平稳']
    }
  };
  const taskKey=data[taskId]?taskId:'door-lock';
  const task=data[taskKey];
  if(task.available===false){
    window.location.replace('operation.html');
    return;
  }
  const stage=document.getElementById('taskStage');
  const flow=[...document.querySelectorAll('#taskFlow li')];
  const resultStorageKey=`elevator-training-result:${taskKey}`;
  let savedResult=null;
  try{savedResult=JSON.parse(localStorage.getItem(resultStorageKey)||'null');}catch(error){savedResult=null;}
  let trainingComplete=savedResult?.completed===true;
  let current=trainingComplete?flow.length-1:0;
  const selectedTools=new Set(savedResult?.selectedTools||[]);
  const selectedSequence=[...(savedResult?.selectedSequence||[])];
  const selectedKeyParts=new Set(savedResult?.selectedKeyParts||[]);
  const submittedStages=new Set(trainingComplete?[1,2,3,4]:[]);
  const stageScores={1:Number(savedResult?.stageScores?.[1])||0,2:Number(savedResult?.stageScores?.[2])||0,3:Number(savedResult?.stageScores?.[3])||0,4:Number(savedResult?.stageScores?.[4])||0};
  let attemptHistory=Array.isArray(savedResult?.attemptHistory)?savedResult.attemptHistory.slice(-3):[];
  if(!attemptHistory.length&&savedResult?.completed){attemptHistory=[{attemptNo:1,completedAt:savedResult.completedAt||Date.now(),total:Object.values(stageScores).reduce((sum,score)=>sum+score,0),stageScores:{...stageScores}}];}
  let recordText=savedResult?.recordText||'';
  const stageWeights={1:25,2:30,3:25,4:20};
  const correctTools=new Set(['万用表','绝缘螺丝刀','塞尺']);
  const sequenceSteps=task.sequenceSteps||[
    '确认作业条件与门系统状态。',
    '检查相关部件的安装与运行状态。',
    '依据检查结果完成必要调整。',
    '复核调整结果并记录。'
  ];
  const sequenceOptionOrder=sequenceSteps.length===5?[2,4,0,3,1]:sequenceSteps.map((_,index)=>index).reverse();
  const keyPartOptions=task.keyPartOptions||task.keyParts;
  document.title=`${task.title}｜职境AI`;
  document.getElementById('taskNumber').textContent=task.number;
  document.getElementById('taskTitle').textContent=task.title;
  document.getElementById('taskDescription').textContent=task.description;
  const persistCompletedTraining=()=>{
    const completedAt=Date.now();
    const attemptNo=(Number(attemptHistory.at(-1)?.attemptNo)||0)+1;
    attemptHistory=[...attemptHistory,{attemptNo,completedAt,total:Object.values(stageScores).reduce((sum,score)=>sum+score,0),stageScores:{...stageScores}}].slice(-3);
    localStorage.setItem(resultStorageKey,JSON.stringify({completed:true,selectedTools:[...selectedTools],selectedSequence:[...selectedSequence],selectedKeyParts:[...selectedKeyParts],stageScores,recordText,attemptHistory,completedAt}));
  };
  const restartTraining=()=>{
    localStorage.setItem(resultStorageKey,JSON.stringify({attemptHistory}));
    selectedTools.clear();
    selectedSequence.length=0;
    selectedKeyParts.clear();
    submittedStages.clear();
    Object.keys(stageScores).forEach(key=>{stageScores[key]=0;});
    recordText='';
    trainingComplete=false;
    current=0;
    render();
  };
  const canEnter=index=>{
    if(trainingComplete) return true;
    if(index<=current) return true;
    for(let gate=1;gate<index;gate+=1){if(!submittedStages.has(gate)) return false;}
    return true;
  };
  const go=index=>{
    if(!canEnter(index)){
      window.alert('请先完成并提交当前关卡答案，才能进入下一关。');
      return;
    }
    current=index;
    render();
    const heading=document.querySelector('.task-page-heading');
    const target=heading.getBoundingClientRect().top+window.scrollY-12;
    window.scrollTo({top:Math.max(0,target),behavior:'smooth'});
  };
  const next=()=>go(Math.min(current+1,flow.length-1));
  const previous=()=>go(Math.max(current-1,0));
  flow.forEach((item,index)=>{
    item.tabIndex=0;
    item.setAttribute('role','button');
    item.setAttribute('aria-label',`进入${item.textContent.trim()}关卡`);
    item.addEventListener('click',()=>go(index));
    item.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();go(index)};
    });
  });
  const controls=(primary,gate,secondary='')=>trainingComplete&&gate!==undefined
    ? `<div class="workspace-actions"><span class="stage-locked-note">本关答案已锁定，仅供查看</span></div>`
    : gate===undefined
    ? `<div class="workspace-actions"><button type="button" class="btn" data-next>${primary}</button></div>`
    : `<div class="workspace-actions"><p class="stage-validation" role="alert"></p>${secondary}<button type="button" class="btn" data-submit-stage="${gate}">${submittedStages.has(gate)?'重新提交并':''}${primary}</button></div>`;
  const choices=items=>items.map(item=>`<label class="training-choice"><input type="checkbox" value="${item}"><span>${item}</span></label>`).join('');
  const keyPartChoices=items=>items.map(item=>`<label class="training-choice"><input type="checkbox" value="${item}"${selectedKeyParts.has(item)?' checked':''}${trainingComplete?' disabled':''}><span>${item}</span></label>`).join('');
  const toolImages={
    '万用表':'tool-multimeter-v5.png',
    '绝缘螺丝刀':'tool-insulated-screwdriver-v3.png',
    '塞尺':'tool-feeler-gauge-v5.png',
    '扳手':'tool-wrench-v2.png',
    '管钳':'tool-pipe-wrench-v2.png',
    '电焊钳':'tool-welding-clamp-v2.png'
  };
  const toolChoices=items=>items.map(item=>`<label class="training-choice tool-choice"><input type="checkbox" value="${item}"${selectedTools.has(item)?' checked':''}${trainingComplete?' disabled':''}><img src="${toolImages[item]}" alt="${item}"><span>${item}</span></label>`).join('');
  const sequenceChoices=()=>sequenceOptionOrder.map((stepIndex,optionIndex)=>{
    const chosenPosition=selectedSequence.indexOf(stepIndex);
    const label=String.fromCharCode(65+optionIndex);
    return `<button type="button" class="sequence-choice${chosenPosition>-1?' selected':''}" data-sequence-step="${stepIndex}"${chosenPosition>-1?' aria-pressed="true"':' aria-pressed="false"'}${trainingComplete?' disabled':''}><b>${chosenPosition>-1?`第 ${chosenPosition+1} 位`:`操作项 ${label}`}</b><span>${sequenceSteps[stepIndex]}</span></button>`;
  }).join('');
  const invalidateFrom=gate=>{
    for(let index=gate;index<=4;index+=1){submittedStages.delete(index);stageScores[index]=0;}
  };
  const calculateScore=gate=>{
    if(gate===1){
      const matches=task.tools.filter(item=>selectedTools.has(item)===correctTools.has(item)).length;
      return Math.round(stageWeights[gate]*matches/task.tools.length);
    }
    if(gate===2){
      const matches=sequenceSteps.filter((_,index)=>selectedSequence[index]===index).length;
      return Math.round(stageWeights[gate]*matches/sequenceSteps.length);
    }
    if(gate===3){
      const matches=keyPartOptions.filter(item=>selectedKeyParts.has(item)===task.keyParts.includes(item)).length;
      return Math.round(stageWeights[gate]*matches/keyPartOptions.length);
    }
    const length=recordText.trim().length;
    return length>=30?stageWeights[gate]:length>=12?Math.round(stageWeights[gate]*.7):Math.round(stageWeights[gate]*.4);
  };
  const validateStage=gate=>{
    if(gate===1) return selectedTools.size>0?'':'请至少选择一项工具后再提交。';
    if(gate===2) return selectedSequence.length===sequenceSteps.length?'':'请为全部操作项完成排序后再提交。';
    if(gate===3) return selectedKeyParts.size>0?'':'请至少勾选一项关键部件后再提交。';
    return recordText.trim()?'':'请填写复核与记录后再提交。';
  };
  const totalScore=()=>Object.values(stageScores).reduce((sum,score)=>sum+score,0);
  const coachPortrait=()=>{
    const passing=totalScore()>=60;
    return {
      src:passing?'elevator-maintenance-coach-v1.png':'elevator-maintenance-coach-scratch-head-v1.png',
      alt:passing?'竖起大拇指的 AI 电梯维保教练':'挠头、略显尴尬的 AI 电梯维保教练'
    };
  };
  const scoreResult=()=>{
    const total=totalScore();
    return `<strong>${total} 分</strong><span>工具选择 ${stageScores[1]}/${stageWeights[1]} · 操作顺序 ${stageScores[2]}/${stageWeights[2]} · 关键部件 ${stageScores[3]}/${stageWeights[3]} · 复核记录 ${stageScores[4]}/${stageWeights[4]}</span>`;
  };
  const coachFeedback=()=>{
    const total=totalScore();
    const level=total>=85?'本次训练完成度较高，基础判断较为扎实。':total>=60?'已完成完整训练流程，建议针对失分环节继续巩固。':'本次训练存在较多可提升点，建议回看微课后再次练习。';
    const suggestions=[];
    if(stageScores[1]<18) suggestions.push('工具选择：结合“门锁回路未接通”的现象，优先区分测量、调整与无关工具。');
    if(stageScores[2]<22) suggestions.push('操作顺序：建议重新梳理“测量—调整—复核”的先后关系，再完成门锁调整。');
    if(stageScores[3]<18) suggestions.push('关键部件：重点关注锁钩啮合、安全触点与门刀、门锁滚轮的对中关系。');
    if(stageScores[4]<14) suggestions.push('复核记录：补充异常现象、处理动作与复位确认结果，使记录形成完整闭环。');
    if(!suggestions.length) suggestions.push('四个关卡均表现良好，可进一步结合现场案例提升诊断速度与记录质量。');
    return `<section class="local-ai-feedback"><span>本地模拟 AI 点评</span><h4>${level}</h4><p>本点评依据当前原型中的答题结果自动生成；后续接入真实 AI 后，将在此呈现针对性解析、追问与练习引导。</p><ul>${suggestions.map(item=>`<li>${item}</li>`).join('')}</ul></section>`;
  };
  const questionPanel=()=>`<aside class="task-question-panel"><div class="task-question-copy"><h3>请根据现场现象作出判断</h3><p>${task.context}</p></div><div class="task-question-image-wrap"><img class="question-fault-visual" src="door-lock-circuit-fault-v2.png" alt="层门关闭与门锁回路未接通的诊断示意图"></div><button type="button" class="text-btn task-question-prev" data-prev>← 上一关卡</button></aside>`;
  const workspace=activity=>`<article class="task-workspace">${questionPanel()}<section class="task-activity-panel">${activity}</section></article>`;
  const render=()=>{
    flow.forEach((item,index)=>{
      item.classList.toggle('active',index===current);
      item.classList.toggle('locked',!canEnter(index));
      item.setAttribute('aria-disabled',String(!canEnter(index)));
    });
    let content='';
    if(current===0){
      content=task.microcourse
        ? `<article class="learning-stage microcourse-stage"><div class="microcourse-meta"><span>第一步　观看技能微课</span><h3>${task.microcourse.title}</h3><p>${task.microcourse.note}</p></div><div class="microcourse-video-wrap"><video controls preload="metadata" poster="${task.image}"><source src="${task.microcourse.video}" type="video/mp4">当前浏览器不支持视频播放。</video></div><div class="microcourse-actions"><button type="button" class="text-btn" data-next>跳过技能微课，直接开始练习</button><button type="button" class="btn" data-next>下一步</button></div></article>`
        : `<article class="learning-stage no-video-stage"><div class="stage-copy"><span>第 1 步 · 可选技能微课</span><h3>该任务微课正在配置</h3><p>你可以直接进入故障情境练习；后续可补充与本任务对应的门机和门区保护微课。</p>${controls('直接开始练习')}</div></article>`;
    } else if(current===1){
      content=workspace(`<div class="activity-copy tool-activity-copy"><span>第二步　选择工具</span><h3>选择本次检查所需工具</h3><p>根据左侧题目，选择需要使用的检查工具。</p></div><div class="training-choice-list tool-choice-list">${toolChoices(task.tools)}</div>${controls('进入操作顺序',1)}`);
    } else if(current===2){
      content=workspace(`<div class="activity-copy sequence-activity-copy"><span>第三步　规范操作顺序</span><h3>请按微课中的门锁调整流程排序</h3><p>请根据左侧题目，依次点击下方操作项；已选操作项会按你的点击顺序排列。</p></div><div class="sequence-choice-list">${sequenceChoices()}</div>${controls('进入关键部件检查',2,'<button type="button" class="sequence-header-reset" data-reset-sequence>重新排序</button>')}`);
    } else if(current===3){
      content=workspace(`<div class="activity-copy compact-activity-copy"><span>第四步　关键部件检查 / 调整</span><h3>确认需要检查和调整的关键点</h3><p>依据左侧题目，勾选本次应完成的检查与调整项。</p></div><div class="training-choice-list">${keyPartChoices(keyPartOptions)}</div>${controls('进入复核与记录',3)}`);
    } else if(current===4){
      content=workspace(`<div class="activity-copy compact-activity-copy"><span>第五步　复核与记录</span><h3>完成复位确认与任务记录</h3><p>请记录本次发现的异常、处理情况和复核结论。</p></div><textarea class="training-record" placeholder="例如：已检查门锁触点，调整后复位确认，电梯运行状态正常。"${trainingComplete?' readonly':''}></textarea>${controls('进入 AI 智能教练点评',4)}`);
    } else {
      const portrait=coachPortrait();
      content=workspace(`<div class="activity-copy compact-activity-copy"><span>第六步　AI智能教练点评</span><h3>任务已完成</h3><p>电梯维保教练已根据四个答题关卡的提交结果生成本次训练点评。</p></div><div class="ai-coach-result"><figure class="ai-coach-portrait"><img src="${portrait.src}" alt="${portrait.alt}"></figure><div class="score-placeholder" id="scorePlaceholder"><div class="score-summary">${scoreResult()}</div>${coachFeedback()}</div></div><div class="workspace-actions ai-coach-actions"><button type="button" class="text-btn" data-retrain>重新训练</button></div>`);
    }
    stage.innerHTML=content;
    stage.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',next));
    stage.querySelectorAll('[data-prev]').forEach(button=>button.addEventListener('click',previous));
    stage.querySelectorAll('.tool-choice input').forEach(input=>input.addEventListener('change',()=>{
      if(input.checked) selectedTools.add(input.value);
      else selectedTools.delete(input.value);
      invalidateFrom(1);
    }));
    stage.querySelectorAll('[data-sequence-step]').forEach(button=>button.addEventListener('click',()=>{
      const stepIndex=Number(button.dataset.sequenceStep);
      const chosenPosition=selectedSequence.indexOf(stepIndex);
      if(chosenPosition>-1) selectedSequence.splice(chosenPosition,1);
      else selectedSequence.push(stepIndex);
      invalidateFrom(2);
      render();
    }));
    stage.querySelector('[data-reset-sequence]')?.addEventListener('click',()=>{
      selectedSequence.length=0;
      invalidateFrom(2);
      render();
    });
    stage.querySelectorAll('.training-choice:not(.tool-choice) input').forEach(input=>input.addEventListener('change',()=>{
      if(input.checked) selectedKeyParts.add(input.value);
      else selectedKeyParts.delete(input.value);
      invalidateFrom(3);
    }));
    const record=stage.querySelector('.training-record');
    if(record){
      record.value=recordText;
      record.addEventListener('input',()=>{recordText=record.value;invalidateFrom(4);});
    }
    stage.querySelectorAll('[data-submit-stage]').forEach(button=>button.addEventListener('click',()=>{
      const gate=Number(button.dataset.submitStage);
      const error=validateStage(gate);
      if(error){const feedback=stage.querySelector('.stage-validation');if(feedback) feedback.textContent=error;return;}
      stageScores[gate]=calculateScore(gate);
      submittedStages.add(gate);
      if(gate===4){trainingComplete=true;persistCompletedTraining();}
      go(gate+1);
    }));
    stage.querySelector('[data-retrain]')?.addEventListener('click',restartTraining);
  };
  render();
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  if (nav && !nav.querySelector('a[href="ability-profile.html"]')) {
    nav.insertAdjacentHTML('beforeend', '<hr><a href="ability-profile.html"><span class="num">◎</span>我的能力档案</a>');
  }
});

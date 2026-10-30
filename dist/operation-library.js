document.addEventListener('DOMContentLoaded',()=>{
  const skills={
    door:{type:'高频维保技能',title:'门系统检修与调整',tasks:[
      {id:'door-lock',title:'门锁回路与触点状态检查',desc:'面对轿门未关好、门锁回路异常等现象，完成门锁触点、机械联锁与回路状态判断。'},
      {id:'door-protection',title:'门机与门区保护异常排查',desc:'面对开关门受阻、门区信号异常等现象，检查门机运行、门区保护与相关部件，并作出调整判断。',available:false}
    ]},
    control:{type:'电气检修技能',title:'控制柜与电气回路检修',tasks:[['控制柜断电、验电与挂牌','面对控制柜检修任务，完成能源隔离、验电和挂牌的标准操作。'],['安全回路异常初步检查','依据故障现象，选择检测工具并排序安全回路检查步骤。']]},
    traction:{type:'机械检修技能',title:'曳引与制动系统检查',tasks:[['制动器动作状态检查','针对制动器动作异常，完成检查准备、关键部位观察与调整判断。'],['曳引钢丝绳状态检查','围绕钢丝绳状态，练习检查顺序、测量要点与复核方法。']]},
    mechanical:{type:'部件检修技能',title:'轿顶、底坑与机械部件检修',tasks:[['轿顶检修装置检查','进入轿顶作业后，完成检修装置、通信与关键部件检查。'],['底坑缓冲器与张紧装置检查','围绕底坑机械部件，练习检查路径、部件状态判断与记录。']]},
    escalator:{type:'专项维保技能',title:'自动扶梯维护与调整',tasks:[['梳齿板与梯级安全装置检查','面对乘客区域维护任务，完成相关部件的检查与调整步骤。'],['扶手带运行状态检查','根据扶手带运行异常，选择工具并完成检查、调整与复核。']]}
  };
  const selection=document.getElementById('skillSelection');
  const tasks=document.getElementById('taskSelection');
  const library=document.getElementById('taskLibrary');
  const title=document.getElementById('selectedSkillTitle');
  const type=document.getElementById('selectedSkillType');
  const comingSoon=document.createElement('dialog');
  comingSoon.className='coming-soon-dialog';
  comingSoon.innerHTML='<div class="coming-soon-icon">⌛</div><h2>模块开发中</h2><p>该核心技能训练正在完善，敬请期待。</p><button type="button">知道了</button>';
  document.body.append(comingSoon);
  comingSoon.querySelector('button').addEventListener('click',()=>comingSoon.close());
  comingSoon.addEventListener('click',event=>{if(event.target===comingSoon)comingSoon.close()});
  const openSkill=id=>{
    if(id==='door'){selectSkill(id);return}
    comingSoon.showModal();
  };
  const selectSkill=id=>{
    const skill=skills[id];
    type.textContent=skill.type;
    title.textContent=skill.title;
    library.innerHTML=skill.tasks.map((task,index)=>{
      const taskId=task.id||`${id}-${index}`;
      const taskTitle=task.title||task[0];
      const taskDesc=task.desc||task[1];
      const unavailable=task.available===false;
      const taskAttributes=unavailable
        ? ` aria-disabled="true" aria-label="暂不开放：${taskTitle}"`
        : ` role="button" tabindex="0" aria-label="进入任务：${taskTitle}"`;
      return `<article class="operation-task-card${unavailable?' is-unavailable':''}" data-task="${taskId}"${taskAttributes}><span>任务 ${String(index+1).padStart(2,'0')}</span><h3>${taskTitle}</h3><p>${taskDesc}</p><div class="task-enter">${unavailable?'暂不开放':'进入任务训练'}${unavailable?'':' <b>→</b>'}</div></article>`;
    }).join('');
    library.querySelectorAll('.operation-task-card:not(.is-unavailable)').forEach(card=>{
      const enterTask=()=>{window.location.href=`operation-task.html?task=${encodeURIComponent(card.dataset.task)}`};
      card.addEventListener('click',enterTask);
      card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();enterTask()}});
    });
    selection.hidden=true;
    tasks.hidden=false;
    window.scrollTo({top:0,behavior:'smooth'});
  };
  document.querySelectorAll('.skill-card').forEach(card=>{
    if(card.dataset.skill!=='door'){
      card.classList.add('coming-soon');
      card.setAttribute('aria-label',`${card.getAttribute('aria-label')}，模块开发中`);
    }
    card.addEventListener('click',()=>openSkill(card.dataset.skill));
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openSkill(card.dataset.skill)}});
  });
  document.getElementById('returnCore').addEventListener('click',event=>{
    tasks.hidden=true;
    selection.hidden=false;
    window.scrollTo({top:0,behavior:'smooth'});
  });
  const requestedSkill=new URLSearchParams(location.search).get('skill');
  if(requestedSkill&&skills[requestedSkill]) selectSkill(requestedSkill);
});

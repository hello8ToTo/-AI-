document.addEventListener('DOMContentLoaded',()=>{
const VALUE_TAGS={
  pit:['生命至上','规范履职'],
  machine:['生命至上','规范履职','精益求精'],
  cartop:['生命至上','协同担当','规范履职'],
  escalator:['公共安全','服务意识','协同担当'],
  rescue:['生命至上','服务意识','协同担当']
};
const D=[
['pit','案例 01','底坑进入前安全确认','底坑作业','safety-scene-isolation.png','进入底坑前，核对隔离、设备状态与安全进入条件。',['检查梯子或永久性进入装置可靠','验证底坑停止装置有效','确认轿厢安全位置及层门装置'],['围挡已设置即可直接进入','入口光线充足，无需检查底坑照明'],'先确认设备与进入条件，再实施故障检查','先进入底坑观察，再补做外围确认','记录故障现象、轿厢状态','记录已完成/未完成项目及防护措施','记录沟通重点与后续建议'],
['machine','案例 02','机房检修前断电与挂牌','机房作业','safety-scene-machine-room.png','面对控制柜检修任务，确认断电、验电、挂牌与相邻带电风险。',['落实断电、验电、挂牌程序','辨识相邻带电部件并明确隔离范围','检查绝缘防护用品和工具状态'],['合上柜门即可，无需确认电源','为赶时间可直接紧固端子'],'先确认能源隔离，再按规程开展检查','直接处理端子，缩短停梯时间','记录断电验电和恢复供电信息','记录检查部位、处理内容及复核结果','完成与同组人员或使用单位的恢复交接'],
['cartop','案例 03','轿顶作业前安全确认','轿顶作业','safety-scene-car-top.png','在顶层层门处完成轿顶进入、协同通信与防坠落风险判断。',['确认轿顶停止装置和检修状态','确认层门开启、轿厢位置及安全进入条件','明确两人分工、通信方式和紧急联络'],['可跨越未确认间隙进入轿顶','层门开启就代表可开始作业'],'暂缓进入，先在安全位置确认检修状态和停止装置','先踏上轿顶，再观察开关位置','记录检修状态、停止装置和轿厢位置','记录作业人员、协同方式及通信约定','记录发现风险及防护或暂缓措施'],
['escalator','案例 04','自动扶梯维护区域防护','自动扶梯','safety-scene-escalator.png','面对商场开放区域维护任务，控制乘客误入与设备误启动风险。',['设置连续有效的围挡、警示和通行引导','确认停梯、急停及防误启动措施','与商场人员沟通人流控制和替代路线'],['只摆一个警示锥即可作业','客流高峰可降低围挡要求'],'暂停操作，完善隔离和通行引导后再继续','加快拆检速度，尽快恢复运行','记录设备位置、停梯状态和客流情况','记录围挡、警示、引导等防护措施','记录商场协同及恢复运行前复核'],
['rescue','案例 05','困人应急到场初判','应急响应','safety-scene-entrapment.png','面对困人报修，先完成现场初判、信息沟通与救援前安全准备。',['确认轿厢停靠位置和乘客状态','核实供电、控制柜状态及异常运动风险','与乘客、使用单位保持有效沟通'],['可先强行开启层门观察','让乘客自行按开门按钮等待'],'保持沟通，确认设备状态后按应急程序组织处置','反复启动电梯试图就近平层','记录接警、到场、解困等关键时间','记录轿厢位置、乘客状态和设备初判','记录采取措施、结果及后续复检建议']
].map(x=>({id:x[0],code:x[1],title:x[2],tag:x[3],image:x[4],desc:x[5],checks:x[6],bad:x[7],safe:x[8],unsafe:x[9],records:x.slice(10)})).map(c=>({...c,values:VALUE_TAGS[c.id]}));
window.safetyCaseValues=Object.fromEntries(D.map(c=>[c.title,c.values]));
const $=id=>document.getElementById(id),ui={hub:$('safetyHub'),work:$('safetyWorkspace'),list:$('caseLibrary'),std:$('standardMode'),rnd:$('randomMode'),si:$('standardIntro'),ri:$('randomIntro'),label:$('safetyCaseLabel'),title:$('safetyCaseTitle'),prompt:$('safetyCasePrompt'),img:$('safetySceneImage'),scene:$('safetySceneTitle'),sceneText:$('safetySceneText'),tabs:$('caseTabs'),ops:$('safetyOptions'),submit:$('safetySubmit'),next:$('nextRandom'),result:$('safetyResult'),score:$('aiTotalScore'),scoreLabel:$('scoreLabel'),unit:$('scoreUnit'),coach:$('aiCoachTitle'),coachText:$('aiCoachPrompt'),diag:$('aiDiagnosticList')};
let type='standard',item,index=0,answers=[],done=false,queue=[],qi=0,right=0,answered=false;
const safetyHistoryKey='ability-history:safety';
const appendSafetyHistory=(total,stageScores)=>{let history=[];try{history=JSON.parse(localStorage.getItem(safetyHistoryKey)||'[]');}catch(error){}if(!Array.isArray(history))history=[];const attemptNo=(Number(history.at(-1)?.attemptNo)||0)+1;history=[...history,{attemptNo,completedAt:new Date().toISOString(),total,stageScores}].slice(-3);localStorage.setItem(safetyHistoryKey,JSON.stringify(history));};
const stages=c=>[
{name:'风险识别',prompt:`【多选】${c.desc}哪些安全确认项目不能省略？`,kind:'checkbox',opts:[...c.checks,...c.bad],ok:c.checks,cap:'现场快照：风险识别'},
{name:'处置优先级',prompt:'【单选】现场信息尚未核实完整时，以下哪一处置顺序最符合岗位安全要求？',kind:'radio',opts:[c.safe,c.unsafe,'先凭经验处理，后补充确认'],ok:[c.safe],cap:'现场快照：处置优先级'},
{name:'依据说明',prompt:'【多选】为形成可追溯的安全判断依据，哪些内容应写入工单或现场记录？',kind:'checkbox',opts:[...c.records,['仅记录“已检查，无异常”','无需记录与相关人员的沟通'][0]],ok:c.records,cap:'现场快照：依据说明'}];
const showHub=t=>{type=t;ui.std.classList.toggle('active',t==='standard');ui.rnd.classList.toggle('active',t==='random');ui.si.hidden=t!=='standard';ui.list.hidden=t!=='standard';ui.ri.hidden=t!=='random'};
const valueTagHtml=c=>`<div class="value-tags" aria-label="本案例职业素养标签">${c.values.map(v=>`<span>${v}</span>`).join('')}</div>`;
const cards=()=>{ui.list.innerHTML=D.map(c=>`<article class="case-card"><img src="${c.image}" alt="${c.title}现场图"><div><span>${c.code} · ${c.tag}</span><h3>${c.title}</h3><p>${c.desc}</p>${valueTagHtml(c)}<button class="case-start" data-id="${c.id}">进入案例测试 →</button></div></article>`).join('');ui.list.querySelectorAll('button').forEach(b=>b.onclick=()=>start(D.find(c=>c.id===b.dataset.id)))};
const reset=()=>{ui.score.textContent='--';ui.scoreLabel.textContent='本案例总得分';ui.unit.textContent='分';ui.coach.textContent='完成全部作答后生成诊断';ui.coachText.textContent='AI将结合你的选择，按岗位安全规则定位需要复盘的判断点。';ui.diag.hidden=true;ui.diag.innerHTML=''};
const opts=(q,vals=[],lock=false,mark=false)=>ui.ops.innerHTML=q.opts.map(v=>{let sel=vals.includes(v),good=mark&&q.ok.includes(v),bad=mark&&sel&&!q.ok.includes(v);return `<label class="option${sel?' selected':''}${lock?' readonly':''}${good?' correct-option':''}${bad?' wrong-option':''}"><input type="${q.kind}" ${q.kind==='radio'?'name="q"':''} value="${v}" ${sel?'checked':''} ${lock?'disabled':''}><span>${v}</span></label>`}).join('');
const vals=()=>[...ui.ops.querySelectorAll('input:checked')].map(x=>x.value);
const render=()=>{let q=stages(item)[index],saved=answers[index];ui.label.textContent=`${item.code} · 第${index+1}阶段`;ui.title.textContent=`${item.title}｜${q.name}`;ui.prompt.textContent=q.prompt;ui.img.src=item.image;ui.scene.textContent=q.cap;ui.sceneText.textContent=item.desc;ui.tabs.innerHTML=stages(item).map((s,i)=>`<button class="tab ${i===index?'active':''} ${answers[i]?'done':''}" data-i="${i}" ${(!answers[i]&&i!==index)?'disabled':''}>${s.name}</button>`).join('');ui.tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>{let i=+b.dataset.i;if(answers[i]||i===index){index=i;render()}});opts(q,saved?.v||[],!!saved,done);ui.submit.hidden=!!saved||done;ui.submit.textContent=index===2?'最终提交并生成AI诊断':'提交本阶段并进入下一关';ui.next.hidden=true;ui.result.className=saved?'result show good':'result';ui.result.textContent=saved?(done?'本阶段已评分。绿色为正确答案，红色为你的误选。':'本阶段已作答，完成全部阶段后统一评分。'):''};
const start=c=>{item=c;index=0;answers=[];done=false;type='standard';ui.hub.hidden=true;ui.work.hidden=false;ui.mode;reset();render();scrollTo(0,0)};
const finish=()=>{let notes=[],score=0,stageScores=[];stages(item).forEach((q,i)=>{let v=answers[i].v,h=q.ok.filter(x=>v.includes(x)).length,w=v.filter(x=>!q.ok.includes(x)),stageMax=i===2?34:33,stageScore=Math.max(0,Math.round(h/q.ok.length*stageMax)-w.length*7);stageScores.push(stageScore);score+=stageScore;w.forEach(x=>notes.push(`【${q.name}】误选“${x}”。正确做法是依据现场风险逐项确认。`));q.ok.filter(x=>!v.includes(x)).forEach(x=>notes.push(`【${q.name}】遗漏“${x}”，这属于本场景必须完成的安全确认。`))});score=Math.min(100,score);appendSafetyHistory(score,stageScores);done=true;ui.score.textContent=score;ui.coach.textContent=notes.length?'诊断完成：请复盘以下判断点':'诊断完成：安全判断基础扎实';ui.coachText.textContent=notes.length?'以下内容对应你的误选或遗漏，并给出正确的岗位处理方向。':'本案例三个阶段均作答正确，可继续挑战其他场景。';ui.diag.hidden=false;ui.diag.innerHTML=(notes.length?notes:['本次作答未出现错项。']).map(x=>`<li>${x}</li>`).join('');render()};
const random=()=>{queue=D.flatMap(c=>stages(c).map(q=>({c,q}))).sort(()=>Math.random()-.5).slice(0,8);qi=0;right=0;type='random';ui.hub.hidden=true;ui.work.hidden=false;reset();ui.scoreLabel.textContent='当前正确题数';ui.unit.textContent='题';ui.score.textContent='0';drawRandom();scrollTo(0,0)};
const drawRandom=()=>{answered=false;let e=queue[qi];ui.label.textContent=`随机案例 · 第 ${qi+1}/${queue.length} 题`;ui.title.textContent=`${e.c.title}｜${e.q.name}`;ui.prompt.textContent=e.q.prompt;ui.img.src=e.c.image;ui.scene.textContent=e.q.cap;ui.sceneText.textContent=e.c.desc;ui.tabs.innerHTML='';opts(e.q);ui.submit.hidden=false;ui.submit.textContent='提交本题';ui.next.hidden=true;ui.result.className='result';ui.coach.textContent='随机练习：完成一题，再进入下一题';ui.coachText.textContent='本模式每题即时反馈，帮助你巩固岗位安全判断。'};
ui.submit.onclick=()=>{let v=vals();if(!v.length)return;if(type==='random'){if(answered)return;let q=queue[qi].q,ok=v.length===q.ok.length&&q.ok.every(x=>v.includes(x));answered=true;if(ok)right++;ui.score.textContent=right;opts(q,v,true,true);ui.submit.hidden=true;ui.next.hidden=false;ui.result.className=`result show ${ok?'good':'warn'}`;ui.result.textContent=ok?'本题判断正确，可以进入下一题。':'绿色为正确答案，红色为你的误选。请复盘后进入下一题。';return}answers[index]={v};if(index<2){index++;render()}else finish()};
ui.next.onclick=()=>{if(++qi<queue.length)drawRandom();else{ui.next.hidden=true;ui.result.className='result show good';ui.result.textContent=`随机练习完成：答对 ${right}/${queue.length} 题。`;ui.coach.textContent='随机练习已完成'}};$('backLibrary').onclick=()=>{ui.work.hidden=true;ui.hub.hidden=false;showHub('choice')};ui.std.onclick=()=>showHub('standard');ui.rnd.onclick=()=>showHub('random');$('startRandom').onclick=random;cards();
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  if (nav && !nav.querySelector('a[href="ability-profile.html"]')) {
    nav.insertAdjacentHTML('beforeend', '<hr><a href="ability-profile.html"><span class="num">◎</span>我的能力档案</a>');
  }
});
document.addEventListener('DOMContentLoaded',()=>{
  const submit=document.getElementById('safetySubmit'),label=document.getElementById('safetyCaseLabel'),coach=document.getElementById('aiCoachTitle'),coachText=document.getElementById('aiCoachPrompt'),diagnosis=document.getElementById('aiDiagnosticList');
  submit.addEventListener('click',()=>setTimeout(()=>{
    if(!label.textContent.startsWith('随机案例'))return;
    const wrong=[...document.querySelectorAll('#safetyOptions .wrong-option span')].map(node=>node.textContent);
    if(!wrong.length)return;
    const correct=[...document.querySelectorAll('#safetyOptions .correct-option span')].map(node=>node.textContent);
    coach.textContent='AI智能安全督导：本题错误解析';
    coachText.textContent='以下为 AI 错误解析展示位；后续将由 AI 根据学习者的具体选择、案例情境和课程规则自动生成。';
    diagnosis.hidden=false;
    diagnosis.innerHTML=`<li><b>你的误选：</b>${wrong.join('；')}</li><li><b>判断问题：</b>该选择跳过了进入或处置前的必要安全确认，不能仅凭经验、速度或单一现场条件作出决定。</li><li><b>正确方向：</b>${correct.join('；')}</li>`;
  },0));
});
document.addEventListener('DOMContentLoaded',()=>{
  const backFromTest=document.getElementById('backLibrary'),hub=document.getElementById('safetyHub'),workspace=document.getElementById('safetyWorkspace'),chooser=hub.querySelector('.mode-switch'),returnMode=hub.querySelector('.return-mode'),intro=document.getElementById('standardIntro'),list=document.getElementById('caseLibrary'),randomIntro=document.getElementById('randomIntro');
  backFromTest.onclick=()=>{
    workspace.hidden=true;
    hub.hidden=false;
    chooser.hidden=true;
    returnMode.hidden=false;
    intro.hidden=false;
    list.hidden=false;
    randomIntro.hidden=true;
    window.scrollTo({top:0,behavior:'smooth'});
  };
});
document.addEventListener('DOMContentLoaded',()=>{
  const back=document.getElementById('backLibrary'),hub=document.getElementById('safetyHub'),workspace=document.getElementById('safetyWorkspace'),chooser=hub.querySelector('.mode-switch'),returnMode=hub.querySelector('.return-mode'),intro=document.getElementById('standardIntro'),list=document.getElementById('caseLibrary'),randomIntro=document.getElementById('randomIntro'),label=document.getElementById('safetyCaseLabel');
  back.addEventListener('click',()=>setTimeout(()=>{
    workspace.hidden=true;hub.hidden=false;
    if(label.textContent.startsWith('随机案例')){
      chooser.hidden=false;returnMode.hidden=true;intro.hidden=true;list.hidden=true;randomIntro.hidden=true;
    }else{
      chooser.hidden=true;returnMode.hidden=false;intro.hidden=false;list.hidden=false;randomIntro.hidden=true;
    }
    window.scrollTo({top:0,behavior:'smooth'});
  },0));
});
document.addEventListener('DOMContentLoaded',()=>{
  const hub=document.getElementById('safetyHub'), chooser=hub.querySelector('.mode-switch'), standard=document.getElementById('standardMode'), random=document.getElementById('randomMode'), intro=document.getElementById('standardIntro'), list=document.getElementById('caseLibrary'), randomIntro=document.getElementById('randomIntro'), startRandom=document.getElementById('startRandom');
  const back=document.createElement('button'); back.type='button'; back.className='return-mode'; back.textContent='← 返回训练方式'; hub.insertBefore(back, intro);
  const reset=()=>{chooser.hidden=false;back.hidden=true;intro.hidden=true;list.hidden=true;randomIntro.hidden=true;};
  standard.onclick=()=>{chooser.hidden=true;back.hidden=false;intro.hidden=false;list.hidden=false;randomIntro.hidden=true;};
  random.onclick=()=>startRandom.click();
  back.onclick=reset; reset();
});
document.addEventListener('DOMContentLoaded',()=>{
  const back=document.getElementById('backLibrary'),hub=document.getElementById('safetyHub'),workspace=document.getElementById('safetyWorkspace'),chooser=hub.querySelector('.mode-switch'),modeBack=hub.querySelector('.return-mode'),intro=document.getElementById('standardIntro'),list=document.getElementById('caseLibrary'),randomIntro=document.getElementById('randomIntro'),label=document.getElementById('safetyCaseLabel');
  back.addEventListener('click',()=>setTimeout(()=>{
    workspace.hidden=true;hub.hidden=false;
    const fromRandom=label.textContent.includes('随机案例');
    chooser.hidden=!fromRandom;
    modeBack.hidden=fromRandom;
    intro.hidden=fromRandom;
    list.hidden=fromRandom;
    randomIntro.hidden=true;
  },1));
});

document.addEventListener('DOMContentLoaded',()=>{
  const title=document.getElementById('safetyCaseTitle'),prompt=document.getElementById('safetyCasePrompt'),coach=document.getElementById('aiCoachPrompt'),diagnosis=document.getElementById('aiDiagnosticList');
  const currentValues=()=>Object.entries(window.safetyCaseValues||{}).find(([name])=>title.textContent.includes(name))?.[1]||[];
  const renderValues=()=>{
    const values=currentValues();
    let holder=document.getElementById('safetyValueTags');
    if(!holder){holder=document.createElement('div');holder.id='safetyValueTags';holder.className='value-tags task-value-tags';prompt.insertAdjacentElement('afterend',holder)}
    holder.hidden=!values.length;
    holder.innerHTML=values.length?`<b>职业素养</b>${values.map(value=>`<span>${value}</span>`).join('')}`:'';
  };
  new MutationObserver(renderValues).observe(title,{childList:true,subtree:true,characterData:true});
  renderValues();
  document.getElementById('safetySubmit').addEventListener('click',()=>setTimeout(()=>{
    if(!diagnosis || diagnosis.hidden || !diagnosis.querySelector('li'))return;
    const values=currentValues();
    if(!values.length || diagnosis.querySelector('.value-review'))return;
    const item=document.createElement('li');item.className='value-review';
    item.innerHTML=`<b>职业素养复盘：</b>本题关联${values.join('、')}。请把安全判断落实为尊重生命、规范履职、主动协同的岗位行动。`;
    diagnosis.prepend(item);
    if(coach && !coach.textContent.includes('职业素养'))coach.textContent=`本案例关联职业素养：${values.join('、')}。${coach.textContent}`;
  },10));
});

document.addEventListener('DOMContentLoaded',()=>{
  const actions=document.querySelector('.practice-actions'),title=document.getElementById('safetyCaseTitle'),score=document.getElementById('aiTotalScore'),scoreLabel=document.getElementById('scoreLabel');
  const nextCase=document.createElement('button');
  nextCase.type='button';nextCase.className='btn next-case';nextCase.hidden=true;nextCase.textContent='进入下一个案例 →';
  actions.append(nextCase);
  const getCases=()=>[...document.querySelectorAll('.case-card')].map(card=>({title:card.querySelector('h3').textContent,button:card.querySelector('.case-start')}));
  const updateNextCase=()=>{
    const cases=getCases(),currentIndex=cases.findIndex(item=>title.textContent.startsWith(item.title));
    const completedStandard=scoreLabel.textContent==='本案例总得分'&&score.textContent!=='--';
    const hasNext=completedStandard&&currentIndex>=0&&currentIndex<cases.length-1;
    nextCase.hidden=!hasNext;
    if(hasNext)nextCase.dataset.nextIndex=String(currentIndex+1);
  };
  nextCase.addEventListener('click',()=>{
    const target=getCases()[Number(nextCase.dataset.nextIndex)]?.button;
    if(target)target.click();
  });
  new MutationObserver(updateNextCase).observe(title,{childList:true,subtree:true,characterData:true});
  new MutationObserver(updateNextCase).observe(score,{childList:true,subtree:true,characterData:true});
  new MutationObserver(updateNextCase).observe(scoreLabel,{childList:true,subtree:true,characterData:true});
  updateNextCase();
});

document.addEventListener('DOMContentLoaded',()=>{
  const label=document.getElementById('safetyCaseLabel'),submit=document.getElementById('safetySubmit'),score=document.getElementById('aiTotalScore'),scoreLabel=document.getElementById('scoreLabel'),result=document.getElementById('safetyResult');
  const syncActionText=()=>{
    const standardStage=label.textContent.match(/第(\d+)阶段/),standard=Boolean(standardStage);
    if(standard&&!submit.hidden)submit.textContent=standardStage[1]==='3'?'提交本关测试':'下一步';
    const finishedStandard=scoreLabel.textContent==='本案例总得分'&&score.textContent!=='--';
    if(finishedStandard){result.className='result';result.textContent=''};
  };
  new MutationObserver(syncActionText).observe(label,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncActionText).observe(score,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncActionText).observe(scoreLabel,{childList:true,subtree:true,characterData:true});
  syncActionText();
});

document.addEventListener('DOMContentLoaded',()=>{
  const descriptions={
    standard:'按指定典型场景完成连续判断，训练风险识别、处置优先级与规范记录。',
    random:'随机抽取维保场景安全题，快速巩固风险识别与规范处置能力。'
  };
  [['standardMode','standard'],['randomMode','random']].forEach(([id,type])=>{
    const card=document.getElementById(id);
    const description=document.createElement('span');
    description.className='mode-description';
    description.textContent=descriptions[type];
    card.append(description);
  });
});

document.addEventListener('DOMContentLoaded',()=>{
  const slides=[...document.querySelectorAll('.carousel-slide')],dots=[...document.querySelectorAll('.carousel-dots button')];
  if(slides.length){let current=0,timer;const show=n=>{current=(n+slides.length)%slides.length;slides.forEach((slide,i)=>slide.classList.toggle('active',i===current));dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));};const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),3000)};document.querySelector('.carousel-prev').addEventListener('click',()=>{show(current-1);restart()});document.querySelector('.carousel-next').addEventListener('click',()=>{show(current+1);restart()});dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);restart()}));restart();}
  const safetySubmit = document.querySelector('#safetySubmit');
  if (safetySubmit) {
    const stages = [
      {
        label: '案例 02 · 第一阶段',
        title: '底坑进入前的风险识别',
        prompt: '【多选】现场图仅能确认入口围挡和警示已设置。拟进入底坑前，哪些项目仍必须完成验证？',
        image: 'safety-scene-isolation.png',
        alt: '电梯底坑入口隔离与警示现场图',
        sceneTitle: '现场快照：隔离与警示',
        sceneText: '底坑入口已设置围挡和警示。请结合现场画面，判断作业区域隔离是否满足进入前条件。',
        coachTitle: '先确认现场是否具备进入条件',
        coachPrompt: 'AI提醒：围挡只是现场防护的一部分。还需基于轿厢位置、底坑停止装置、照明和梯子等可验证条件作出进入判断。',
        options: [
          ['barrier-only', '入口已设置围挡和警示，因此可直接视为具备进入底坑的全部条件'],
          ['ladder', '检查进入底坑的梯子或永久性进入装置是否可靠、便于安全进出'],
          ['pit-stop', '验证底坑停止装置有效；如作业不需移动轿厢，应按课程规程保持其停止状态'],
          ['position', '确认轿厢停在适合安全进入底坑的位置，并核对相关层门安全装置状态'],
          ['light-ignore', '入口光线充足即可，无需检查底坑照明及其有效性']
        ],
        correct: ['ladder', 'pit-stop', 'position'],
        diagnostic: {
          'barrier-only': '将“围挡和警示”误当成了全部进入条件。正确做法：围挡只用于隔离与警示，仍须逐项确认轿厢安全位置、停止装置、梯子或进入装置及照明。',
          'ladder': '遗漏了进入装置的可靠性确认。正确做法：进入前检查梯子或永久性进入装置是否可靠、便于安全进出。',
          'pit-stop': '遗漏了底坑停止装置的有效性确认。正确做法：进入前验证停止装置有效；作业不需移动轿厢时，应按课程规程保持其停止状态。',
          'position': '遗漏了轿厢安全位置与相关层门安全装置的核对。正确做法：确认轿厢停在适合安全进入的位置，并核对相关安全装置状态。',
          'light-ignore': '忽略了底坑照明的有效性。正确做法：入口光线不能替代底坑照明检查，进入前仍应确认底坑照明满足作业需要。'
        },
        inputType: 'checkbox'
      },
      {
        label: '案例 02 · 第二阶段',
        title: '底坑进入前的处置优先级',
        prompt: '【单选】工单提示“门锁回路偶发异常”，入口围挡已设置但尚未完成进入前确认。以下哪一处理顺序最符合岗位安全要求？',
        image: 'safety-scene-teamwork.png',
        alt: '电梯维保人员协同确认现场图',
        sceneTitle: '现场快照：人员协同确认',
        sceneText: '两名维保人员在入口外沟通分工、核对清单。请判断哪些确认动作应排在进入底坑之前。',
        coachTitle: '安全处置的顺序比速度更重要',
        coachPrompt: 'AI提醒：工单指向门锁回路，并不等于可以跳过底坑进入确认。先验证设备与进入条件，再实施故障检查。',
        options: [
          ['rush-first', '由一人先进入底坑观察门锁回路情况，另一人随后补做外围确认'],
          ['safe-sequence', '确认轿厢安全位置和相关层门安全装置，验证底坑停止装置，检查梯子及照明有效性，明确沟通方式后再进入'],
          ['barrier-only', '围挡已设置即可进入底坑；停止装置和照明可在进入后再检查'],
          ['emergency-run', '先让搭档将轿厢点动运行数次复现故障，再决定是否进入底坑']
        ],
        correct: ['safe-sequence'],
        diagnostic: {
          'rush-first': '把故障观察排在了进入前确认之前。正确做法：未完成进入条件确认时，不应先进入底坑，应先完成设备状态、防护和协同确认。',
          'safe-sequence': '遗漏了符合岗位安全要求的处置顺序。正确做法：先确认轿厢安全位置和相关装置，再验证底坑停止装置、梯子和照明，明确沟通方式后进入。',
          'barrier-only': '把围挡视为充分条件。正确做法：围挡不能替代停止装置、照明、进入装置和设备状态等进入前确认。',
          'emergency-run': '在未完成安全确认时安排点动复现故障，存在风险。正确做法：应先完成进入前安全确认，再按教师审核的流程开展诊断。'
        },
        inputType: 'radio'
      },
      {
        label: '案例 02 · 第三阶段',
        title: '底坑进入前的依据说明',
        prompt: '【多选】如因底坑停止装置或照明有效性尚未确认而决定“暂缓进入”，哪些内容应写入工单或现场记录，形成可追溯依据？',
        image: 'safety-scene-check.png',
        alt: '电梯底坑进入前检查现场图',
        sceneTitle: '现场快照：进入前检查',
        sceneText: '维保人员正在核对断电、验电和挂牌状态。请依据现场信息和岗位规程，形成可追溯的判断依据。',
        coachTitle: '让每一次安全判断都有依据',
        coachPrompt: 'AI提醒：岗位判断不能只凭经验。记录应反映现场状态、已采取的防护、未满足的进入条件以及后续处置安排。',
        options: [
          ['state', '记录故障现象、到场时间以及轿厢当前运行或停靠状态'],
          ['vague', '仅记录“已检查，无异常”，不必说明未满足的进入条件'],
          ['measures', '记录已完成和未完成的确认项目，以及已采取的隔离、警示等现场保护措施'],
          ['replace', '以“门区异常”替代具体现场状态，避免影响工单填写速度'],
          ['handover', '记录与同组人员、使用单位沟通的重点及下一步处置建议']
        ],
        correct: ['state', 'measures', 'handover'],
        diagnostic: {
          'state': '遗漏了故障现象、到场时间和轿厢运行或停靠状态。正确做法：记录可核查的现场状态，为后续处置和追溯提供依据。',
          'vague': '使用“已检查，无异常”这类笼统表述，无法说明暂缓进入的理由。正确做法：如实写明未满足的进入条件及其现场依据。',
          'measures': '遗漏了已完成、未完成的确认项目及现场保护措施。正确做法：记录隔离、警示等已采取措施，以及尚待确认的项目。',
          'replace': '用笼统的“门区异常”替代具体现场状态，降低了工单可追溯性。正确做法：应保留具体故障、设备状态和确认结果。',
          'handover': '遗漏了与同组人员、使用单位的沟通重点和下一步处置建议。正确做法：记录协同信息与后续安排，形成闭环。'
        },
        inputType: 'checkbox'
      }
    ];
    const label = document.querySelector('#safetyCaseLabel');
    const title = document.querySelector('#safetyCaseTitle');
    const prompt = document.querySelector('#safetyCasePrompt');
    const sceneImage = document.querySelector('#safetySceneImage');
    const sceneTitle = document.querySelector('#safetySceneTitle');
    const sceneText = document.querySelector('#safetySceneText');
    const optionList = document.querySelector('#safetyOptions');
    const result = document.querySelector('#safetyResult');
    const coachTitle = document.querySelector('#aiCoachTitle');
    const coachPrompt = document.querySelector('#aiCoachPrompt');
    const diagnosticList = document.querySelector('#aiDiagnosticList');
    const tabs = [...document.querySelectorAll('.case-tabs [data-stage]')];
    const taskRows = ['#safetyTask1', '#safetyTask2', '#safetyTask3'].map((selector) => document.querySelector(selector));
    const totalScore = document.querySelector('#aiTotalScore');
    const maxScores = [34, 33, 33];
    let stageIndex = 0;
    let viewingStage = 0;
    let isFinished = false;
    const answers = Array(stages.length).fill(null);
    let stageScores = Array(stages.length).fill(0);

    const updateTrainingProgress = () => {
      taskRows.forEach((row, index) => {
        if (!row) return;
        const description = row.querySelector('p');
        const status = row.querySelector('.status');
        if (isFinished) {
          if (description) description.textContent = '已评分';
          if (status) {
            status.textContent = `${stageScores[index]}分`;
            status.classList.add('blue');
          }
        } else if (answers[index]) {
          if (description) description.textContent = '已作答';
          if (status) {
            status.textContent = '待评分';
            status.classList.remove('blue');
          }
        } else if (index === stageIndex) {
          if (description) description.textContent = '进行中';
          if (status) {
            status.textContent = '当前';
            status.classList.remove('blue');
          }
        } else {
          if (description) description.textContent = '待开启';
          if (status) {
            status.textContent = '锁定';
            status.classList.remove('blue');
          }
        }
      });
    };

    const renderStage = (index, notice = '') => {
      const stage = stages[index];
      const savedAnswer = answers[index];
      const isReview = Boolean(savedAnswer);
      viewingStage = index;
      if (label) label.textContent = stage.label;
      if (title) title.textContent = stage.title;
      if (prompt) prompt.textContent = stage.prompt;
      if (sceneImage) {
        sceneImage.src = stage.image;
        sceneImage.alt = stage.alt;
      }
      if (sceneTitle) sceneTitle.textContent = stage.sceneTitle;
      if (sceneText) sceneText.textContent = stage.sceneText;
      if (!isFinished) {
        if (coachTitle) coachTitle.textContent = stage.coachTitle;
        if (coachPrompt) coachPrompt.textContent = stage.coachPrompt;
        if (diagnosticList) {
          diagnosticList.hidden = true;
          diagnosticList.innerHTML = '';
        }
      }
      if (optionList) optionList.innerHTML = stage.options.map(([value, text]) => {
        const checked = savedAnswer && savedAnswer.values.includes(value) ? ' checked' : '';
        const disabled = isReview ? ' disabled' : '';
        const inputType = stage.inputType || 'checkbox';
        const name = inputType === 'radio' ? ` name="safety-stage-${index}"` : '';
        const correctClass = isFinished && stage.correct.includes(value) ? ' correct-option' : '';
        const wrongClass = isFinished && savedAnswer && savedAnswer.values.includes(value) && !stage.correct.includes(value) ? ' wrong-option' : '';
        return `<label class="option${checked ? ' selected' : ''}${isReview ? ' readonly' : ''}${correctClass}${wrongClass}"><input type="${inputType}" value="${value}"${name}${checked}${disabled}><span>${text}</span></label>`;
      }).join('');
      tabs.forEach((tab, tabIndex) => {
        tab.classList.toggle('active', tabIndex === index);
        tab.classList.toggle('done', Boolean(answers[tabIndex]));
        tab.disabled = !(Boolean(answers[tabIndex]) || tabIndex === stageIndex) || (isFinished && !answers[tabIndex]);
      });
      safetySubmit.hidden = isReview || isFinished;
      safetySubmit.textContent = index === stages.length - 1 ? '最终提交并生成AI诊断' : '提交本阶段并进入下一关';
      updateTrainingProgress();
      if (result) {
        const reviewNotice = isReview ? (isFinished ? `本阶段已评分：${stageScores[index]} 分。以下为你的答题记录，答案已锁定。` : '本阶段已作答。以下为你的答题记录，待全部阶段完成后由 AI 统一评分。') : '';
        const message = notice || reviewNotice;
        result.className = message ? 'result show good' : 'result';
        result.textContent = message;
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        if (answers[index] || index === stageIndex) renderStage(index);
      });
    });

    safetySubmit.addEventListener('click', () => {
      if (viewingStage !== stageIndex || answers[stageIndex]) return;
      const values = [...document.querySelectorAll('#safetyOptions input:checked')].map((input) => input.value);
      if (!result) return;
      if (stageIndex < stages.length - 1) {
        answers[stageIndex] = { values };
        const nextName = stages[stageIndex + 1].title.replace('底坑进入前的', '');
        stageIndex += 1;
        renderStage(stageIndex, `本阶段答题已保存，已进入下一阶段“${nextName}”。完成全部三个阶段后，AI智能安全督导将统一评分并生成诊断。`);
      } else {
        answers[stageIndex] = { values };
        stageScores = answers.map((answer, index) => {
          const stage = stages[index];
          const correctCount = stage.correct.filter((value) => answer.values.includes(value)).length;
          const wrongCount = answer.values.filter((value) => !stage.correct.includes(value)).length;
          const rawScore = Math.round((correctCount / stage.correct.length) * maxScores[index]) - wrongCount * 7;
          return Math.max(0, rawScore);
        });
        const finalScore = stageScores.reduce((sum, score) => sum + score, 0);
        const weakStages = stages.filter((stage, index) => stageScores[index] < Math.ceil(maxScores[index] * 0.7)).map((stage) => stage.title.replace('底坑进入前的', ''));
        const diagnosticNotes = [];
        answers.forEach((answer, index) => {
          const stage = stages[index];
          const wrongChoices = answer.values.filter((value) => !stage.correct.includes(value));
          const missedCorrectChoices = stage.correct.filter((value) => !answer.values.includes(value));
          wrongChoices.forEach((value) => diagnosticNotes.push(`【${stage.title}】${stage.diagnostic[value]}`));
          missedCorrectChoices.forEach((value) => diagnosticNotes.push(`【${stage.title}】${stage.diagnostic[value]}`));
        });
        isFinished = true;
        if (totalScore) totalScore.textContent = finalScore;
        if (coachTitle) coachTitle.textContent = finalScore >= 90 ? '诊断完成：安全判断基础扎实' : finalScore >= 70 ? '诊断完成：已具备基础安全意识' : '诊断完成：需重点复盘安全判断';
        if (coachPrompt) coachPrompt.textContent = diagnosticNotes.length === 0
          ? 'AI建议：三个阶段的判断均符合本案例规则。下一步可在岗位任务实训中练习将判断转化为规范工单记录。'
          : `AI已定位到 ${diagnosticNotes.length} 个需要复盘的判断点。${weakStages.length ? `建议优先复盘${weakStages.join('、')}。` : ''}以下为对应的错误分析与正确做法：`;
        if (diagnosticList) {
          diagnosticList.hidden = false;
          diagnosticList.innerHTML = (diagnosticNotes.length ? diagnosticNotes : ['本次作答未出现错项，已完整覆盖本案例的风险识别、处置顺序与依据记录要求。']).map((note) => `<li>${note}</li>`).join('');
        }
        updateTrainingProgress();
        renderStage(stageIndex, `AI智能安全督导已完成诊断：本案例总得分 ${finalScore} 分。请查看右侧总分与针对性建议，并可回看各阶段答题记录。`);
      }
    });

    renderStage(0);
  }
  const sequence=document.querySelector('#sequence');
  if(sequence){let picks=[];sequence.querySelectorAll('.step').forEach(b=>b.addEventListener('click',()=>{if(!b.classList.contains('done')){b.classList.add('done');picks.push(b.dataset.step);document.querySelector('#seqText').textContent=picks.map((x,i)=>`${i+1}→${['确认安全状态','核对工具','进入检查位置','直接拆开组件'][x-1]}`).join('　');}}));document.querySelectorAll('#tools .tool').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('chosen')));document.querySelector('#operationSubmit').addEventListener('click',()=>{const r=document.querySelector('#operationResult'),chosen=[...document.querySelectorAll('#tools .tool.chosen')].map(x=>x.textContent);const ok=picks.join(',')==='1,2,3'&&!picks.includes('4')&&chosen.includes('绝缘防护用品')&&chosen.includes('万用表')&&chosen.includes('课程规定的维护工具')&&!chosen.includes('个人娱乐设备');r.className='result show '+(ok?'good':'warn');r.textContent=ok?'智能操作教练：流程判断符合“准备—工具核对—进入检查位置”的训练逻辑。你已完成门系统能力包的第一个节点。':'智能操作教练：请回看流程。重点不是尽快拆检，而是先完成安全状态确认、工具核对和规范进入。';});}
  const evidence=document.querySelector('#evidence');
  if(evidence){evidence.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('selected')));const send=document.querySelector('#chatSend'),input=document.querySelector('#chatText'),chat=document.querySelector('#chat');const reply=()=>{const q=input.value.trim();if(!q)return;chat.insertAdjacentHTML('beforeend',`<div class="bubble user">${q.replace(/[<>]/g,'')}</div>`);input.value='';setTimeout(()=>chat.insertAdjacentHTML('beforeend','<div class="bubble ai">已记录你的追问。建议将报修描述、历史记录与现场证据交叉核对，并在作出判断前完成必要的安全确认。</div>'),180)};send.addEventListener('click',reply);input.addEventListener('keydown',e=>{if(e.key==='Enter')reply()});document.querySelector('#taskSubmit').addEventListener('click',()=>{const n=evidence.querySelectorAll('.selected').length,report=document.querySelector('#taskReport'),score=document.querySelector('#taskScore'),feedback=document.querySelector('#taskFeedback'),bar=document.querySelector('#scoreBar');report.classList.add('show');const s=n>=3?86:n===2?72:58;score.textContent=s;bar.style.width=s+'%';feedback.textContent=n>=3?'你的检查路径覆盖了报警摘要、历史记录和现场线索。评价建议：下一步请依据教师审核的安全流程完成处置准备，并形成可追溯的工单记录。':'评价提示：当前证据不足以支持完整判断。请补充查看与本次门区异常最相关的报警、历史或现场资料，再形成诊断建议。';});}
});

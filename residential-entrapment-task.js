document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('#entrapmentStage');
  const flow = [...document.querySelectorAll('#entrapmentFlow li')];
  const key = 'workorder-entrapment-v3';
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}

  let completed = !!saved?.completed;
  let current = completed ? 5 : 0;
  const submitted = new Set(completed ? [0, 1, 2, 3, 4] : []);
  let answers = saved?.answers || [[], null, [], [], ''];
  let scores = saved?.scores || [0, 0, 0, 0, 0];
  let closureChecks = saved?.closureChecks || [];
  let attemptHistory = Array.isArray(saved?.attemptHistory) ? saved.attemptHistory.slice(-3) : [];
  if (!attemptHistory.length && saved?.completed && Array.isArray(saved?.scores)) {
    attemptHistory = [{ attemptNo: 1, completedAt: saved.completedAt || '', total: saved.scores.reduce((sum, score) => sum + score, 0), scores: [...saved.scores] }];
  }
  const weights = [20, 20, 15, 20, 25];
  const optionSets = [
    ['被困人数、身体情况、轿厢位置', '物业现场联系人和安抚情况', '要求物业自行扒开层门', '报修时间与已知异常', '先根据历史故障类型判断救援方式', '未核实轿厢位置前安排物业组织开门救援'],
    ['万用表', '绝缘螺丝刀', '塞尺', '开门三角钥匙', '钳形电流表', '张力计']
  ];
  const correct = [[0, 1, 3], [0, 1, 2]];
  const closureOptions = ['确认门锁回路与安全触点的复核结果', '记录锁钩与锁钩板的调整结果', '记录现场安全确认和物业交接对象', '未复核故障原因即解除停梯状态', '以乘客口头反馈替代运行复核'];
  const closureCorrect = [0, 1, 2];
  const titles = ['工单受理与电话调度', '三维现场诊断', '工具准备', '处置顺序', '核心检查与工单闭环', 'AI 智能教练复盘'];
  const total = () => scores.reduce((sum, score) => sum + score, 0);
  const can = i => completed || i <= current || [...Array(i).keys()].every(index => submitted.has(index));

  function contextPanel() {
    return `<aside class="entrapment-context">
      <h3>当前工单</h3>
      <p>夜间 21:40，住宅小区 2 栋 1 号梯报修：一名乘客被困轿厢，物业已在现场联系乘客。请完成后续的应急处置训练。</p>
      <video class="entrapment-case-video" controls playsinline preload="auto"><source src="residential-entrapment-training.mp4" type="video/mp4">当前浏览器不支持视频播放。</video>
      <div class="context-tip"><b>微课帮助</b><button class="text-btn" data-help>查看关联微课</button><br>微课只作为随时帮助，不占用工单主流程。</div>
    </aside>`;
  }

  const top = (number, title, description) => `<div class="entrapment-activity-head"><span>环节 ${number}</span><h3>${title}</h3><p>${description}</p></div>`;
  const choices = (items, answerId) => `<div class="entrapment-choice-list">${items.map((item, index) => `<label class="entrapment-choice"><input type="checkbox" value="${index}" ${answers[answerId].includes(index) ? 'checked' : ''} ${completed ? 'disabled' : ''}><span>${item}</span></label>`).join('')}</div>`;
  const action = (label, id) => completed
    ? `<div class="entrapment-actions"><span class="locked-note">本环节已归档，仅供查看</span></div>`
    : `<div class="entrapment-actions"><p class="stage-validation"></p><button class="btn" data-submit="${id}">${label}</button></div>`;
  const shell = content => `<section class="entrapment-stage">${contextPanel()}<article class="entrapment-activity">${content}</article></section>`;

  function model() {
    return `<div class="real-model-shell"><button class="model-fullscreen" data-fullscreen aria-label="全屏浏览模型" title="全屏浏览模型"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5M20 15v5h-5M9 20H4v-5"/></svg></button><details class="model-help-drawer"><summary>诊断帮助</summary><p>若仍无法判断，可切换正常状态，比较锁钩啮合与安全触点的位置。</p><div><button class="model-state" data-model-state="normal">查看正常状态对照</button><button class="model-state" data-model-state="fault">返回本案故障状态</button></div></details><div class="real-model-canvas" id="doorLockCanvas" aria-label="门联锁机构三维诊断模型"></div><svg class="model-leader-lines" aria-hidden="true"><path data-leader="hook"/><path data-leader="contact"/></svg><button class="model-hotspot" data-hotspot="hook" data-clue="门锁钩啮合不足：锁钩未进入可靠锁紧位置，无法稳定形成门锁回路。">锁钩啮合</button><button class="model-hotspot" data-hotspot="contact" data-clue="安全触点位置偏移：触点接触不可靠，门锁回路未稳定接通。">安全触点</button></div>
      <div class="clue-panel" id="cluePanel" hidden></div>
      <details class="model-video-help"><summary>查看门联锁电路工作原理动画</summary><video controls playsinline preload="auto"><source src="door-interlock-circuit-principle-web.mp4" type="video/mp4">当前浏览器不支持视频播放。</video></details>
      <div class="diagnosis-choice"><b>根据线索判断本次病因：</b><label><input type="radio" name="cause" value="wrong" ${answers[1] === 'wrong' ? 'checked' : ''} ${completed ? 'disabled' : ''}>轿厢照明故障</label><label><input type="radio" name="cause" value="right" ${answers[1] === 'right' ? 'checked' : ''} ${completed ? 'disabled' : ''}>门锁回路异常导致保护停梯</label><label><input type="radio" name="cause" value="wrong2" ${answers[1] === 'wrong2' ? 'checked' : ''} ${completed ? 'disabled' : ''}>曳引机制动器未松闸</label><label><input type="radio" name="cause" value="wrong3" ${answers[1] === 'wrong3' ? 'checked' : ''} ${completed ? 'disabled' : ''}>轿厢通信线路故障</label></div>`;
  }

  function initDoorLockModel() {
    const host = stage.querySelector('#doorLockCanvas');
    if (!host || !window.THREE) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf6ff);
    const camera = new THREE.PerspectiveCamera(35, host.clientWidth / host.clientHeight, .1, 100);
    const focus = new THREE.Vector3(0, 2.25, 0);
    let zoom = 1;
    const updateCamera = () => {
      camera.position.set(0, 4.1, 12.8 / zoom);
      camera.lookAt(focus);
    };
    updateCamera();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x4e6f92, 2.3));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(7, 9, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x58b4ff, 1.1);
    fillLight.position.set(-6, 3, 2);
    scene.add(fillLight);

    const assembly = new THREE.Group();
    assembly.rotation.set(0, 0, 0);
    scene.add(assembly);
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8c2cb, metalness: .82, roughness: .22 });
    const brushedMetal = new THREE.MeshStandardMaterial({ color: 0x8394a1, metalness: .75, roughness: .34 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1d2b38, metalness: .72, roughness: .25 });
    const doorMetal = new THREE.MeshStandardMaterial({ color: 0xd8e0e5, metalness: .88, roughness: .2 });
    const inspectionMaterial = new THREE.MeshStandardMaterial({ color: 0x76b8dd, transparent: true, opacity: .26, metalness: .25, roughness: .16 });
    const faultMaterial = new THREE.MeshStandardMaterial({ color: 0xef4d54, emissive: 0x6b1015, emissiveIntensity: .35, metalness: .35, roughness: .3 });
    const normalMaterial = new THREE.MeshStandardMaterial({ color: 0x20a36b, emissive: 0x07351f, emissiveIntensity: .2, metalness: .35, roughness: .3 });
    const addBox = (width, height, depth, x, y, z, material, group = assembly) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };
    const addCylinder = (radius, depth, x, y, z, material, group = assembly) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 20), material);
      mesh.position.set(x, y, z);
      mesh.rotation.x = Math.PI / 2;
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    // 通用中分式层门：门框、门扇、门头导轨和地坎
    addBox(8.6, .22, .55, 0, .28, 0, darkMetal);
    addBox(8.4, .16, .5, 0, 4.82, 0, darkMetal);
    addBox(.2, 4.72, .48, -4.1, 2.5, 0, darkMetal);
    addBox(.2, 4.72, .48, 4.1, 2.5, 0, darkMetal);
    addBox(7.96, .18, .35, 0, 4.35, .08, brushedMetal);
    addBox(3.86, 3.9, .18, -1.98, 2.38, 0, doorMetal);
    addBox(3.86, 3.9, .18, 1.98, 2.38, 0, doorMetal);
    addBox(3.5, 3.48, .035, -1.98, 2.38, .12, brushedMetal);
    addBox(3.5, 3.48, .035, 1.98, 2.38, .12, brushedMetal);
    addBox(.09, 3.88, .3, 0, 2.38, .1, darkMetal);
    addBox(.12, 4.16, .38, -3.98, 2.38, .04, metal);
    addBox(.12, 4.16, .38, 3.98, 2.38, .04, metal);
    addCylinder(.15, .55, -2.2, 4.12, .18, darkMetal);
    addCylinder(.15, .55, 2.2, 4.12, .18, darkMetal);
    addBox(2.12, 1.7, .025, 1.88, 2.62, .155, inspectionMaterial);

    const lockGroup = new THREE.Group();
    lockGroup.position.set(.48, 2.55, .38);
    assembly.add(lockGroup);
    addBox(1.46, 1.16, .52, 0, 0, 0, darkMetal, lockGroup);
    addBox(1.18, .86, .04, 0, 0, .29, brushedMetal, lockGroup);
    addBox(.44, .22, .28, -1.06, .03, .2, metal, lockGroup);
    const hookArm = new THREE.Group();
    hookArm.position.set(-.45, .14, .36);
    lockGroup.add(hookArm);
    const hook = addBox(.9, .24, .26, -.18, 0, 0, faultMaterial, hookArm);
    addBox(.22, .58, .26, .28, -.18, 0, faultMaterial, hookArm);
    addBox(.42, .18, .26, .47, -.4, 0, faultMaterial, hookArm);
    const contactGroup = new THREE.Group();
    contactGroup.position.set(.42, .04, .36);
    lockGroup.add(contactGroup);
    const safetyContact = addBox(.24, .58, .18, 0, 0, 0, faultMaterial, contactGroup);
    addBox(.26, .58, .18, .44, 0, 0, metal, contactGroup);
    addBox(.55, .12, .16, .22, .42, 0, darkMetal, contactGroup);
    const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.65, .34, .32), new THREE.Vector3(1.25, .58, .32), new THREE.Vector3(1.78, .06, .32)]), new THREE.LineBasicMaterial({ color: 0xe7be37 }));
    lockGroup.add(cable);
    const grid = new THREE.GridHelper(12, 12, 0xa2bdd2, 0xd7e8f5);
    grid.position.y = .02;
    scene.add(grid);

    let fault = true;
    const applyState = () => {
      hookArm.rotation.z = fault ? -.13 : 0;
      hookArm.position.x = fault ? -.16 : 0;
      contactGroup.position.x = fault ? .52 : .28;
      hookArm.children.forEach(part => part.material = fault ? faultMaterial : normalMaterial);
      safetyContact.material = fault ? faultMaterial : normalMaterial;
      const cluePanel = stage.querySelector('#cluePanel');
      cluePanel.textContent = fault ? '本案故障状态：锁钩啮合不足，且安全触点位置偏移，回路未可靠接通。' : '正常状态：锁钩可靠啮合，安全触点稳定接通，门锁回路具备正常工作条件。';
    };
    const hotspotTargets = { hook, contact: safetyContact };
    const hotspotElements = {
      hook: stage.querySelector('[data-hotspot="hook"]'),
      contact: stage.querySelector('[data-hotspot="contact"]')
    };
    const projectHotspots = () => {
      scene.updateMatrixWorld(true);
      Object.entries(hotspotTargets).forEach(([name, target]) => {
        const marker = hotspotElements[name];
        if (!marker) return;
        const point = target.getWorldPosition(new THREE.Vector3()).project(camera);
        const sourceX = (point.x * .5 + .5) * host.clientWidth;
        const sourceY = (-point.y * .5 + .5) * host.clientHeight;
        const onLeft = name === 'hook';
        const labelWidth = marker.offsetWidth || 80;
        const labelX = Math.max(24, Math.min(host.clientWidth - labelWidth - 24, sourceX + (onLeft ? -labelWidth - 130 : 130)));
        const labelY = Math.max(58, Math.min(host.clientHeight - 58, sourceY - 42));
        marker.style.left = `${labelX}px`;
        marker.style.top = `${labelY}px`;
        const line = stage.querySelector(`[data-leader="${name}"]`);
        if (line) {
          const endX = onLeft ? labelX + labelWidth : labelX;
          const elbowX = sourceX + (onLeft ? -54 : 54);
          line.setAttribute('d', `M ${sourceX} ${sourceY} L ${elbowX} ${sourceY} L ${elbowX} ${labelY} L ${endX} ${labelY}`);
        }
      });
    };
    stage.querySelectorAll('[data-model-state]').forEach(button => button.onclick = () => {
      fault = button.dataset.modelState === 'fault';
      stage.querySelectorAll('[data-model-state]').forEach(item => item.classList.toggle('active', item === button));
      applyState();
    });
    applyState();

    let dragging = false, lastX = 0, lastY = 0;
    renderer.domElement.addEventListener('pointerdown', event => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    });
    renderer.domElement.addEventListener('pointermove', event => {
      if (!dragging) return;
      assembly.rotation.y += (event.clientX - lastX) * .012;
      assembly.rotation.x = Math.max(-.72, Math.min(.25, assembly.rotation.x + (event.clientY - lastY) * .009));
      lastX = event.clientX;
      lastY = event.clientY;
    });
    renderer.domElement.addEventListener('pointerup', () => dragging = false);
    renderer.domElement.addEventListener('wheel', event => {
      event.preventDefault();
      zoom = Math.max(.7, Math.min(4.2, zoom - event.deltaY * .003));
      updateCamera();
    }, { passive: false });
    const resize = () => {
      if (!host.isConnected) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const animate = () => {
      if (!host.isConnected) {
        resizeObserver.disconnect();
        renderer.dispose();
        return;
      }
      projectHotspots();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  function render() {
    flow.forEach((item, index) => {
      item.classList.toggle('active', index === current);
      item.classList.toggle('locked', !can(index));
    });
    let content = '';
    if (current === 0) {
      content = top(1, titles[0], '一次完成信息核实、乘客安抚和物业协同安排。') + '<h4>电话中需要优先安排什么？</h4>' + choices(optionSets[0], 0) + action('提交调度安排，进入现场诊断', 0);
    } else if (current === 1) {
      content = top(2, titles[1], '通过可旋转、缩放的设备模型查看故障线索，再判断本次困人病因。') + model() + action('提交病因判断，进入工具准备', 1);
    } else if (current === 2) {
      content = top(3, titles[2], '根据已发现的门锁回路病因，选择检查与调整工具。') + '<h4>本次诊断应准备哪些工具？</h4>' + choices(optionSets[1], 2) + action('提交工具准备，进入处置顺序', 2);
    } else if (current === 3) {
      const operations = ['确认轿厢位置和现场安全边界', '检查锁钩啮合与安全触点状态', '依据检查结果完成必要调整', '复核回路与运行状态并记录', '未完成安全确认前直接短接门锁回路试运行', '先恢复电梯运行，再根据乘客反馈排查'];
      content = top(4, titles[3], '围绕门锁回路异常，按“安全确认—检查—调整—复核”完成排序。') + '<h4>请依次点击正确的处置步骤（共 4 项）。</h4><div class="sequence-choice-list">' + operations.map((item, index) => `<button class="entrapment-sequence-choice${answers[3].includes(index) ? ' selected' : ''}" data-order="${index}" aria-pressed="${answers[3].includes(index)}" ${completed ? 'disabled' : ''}><b>${answers[3].includes(index) ? '第 ' + (answers[3].indexOf(index) + 1) + ' 位' : '操作项 ' + String.fromCharCode(65 + index)}</b><span>${item}</span></button>`).join('') + '</div>' + action('提交操作顺序，进入检查闭环', 3);
    } else if (current === 4) {
      content = top(5, titles[4], '围绕已诊断的病因，确认关键检查点并完成工单交接摘要。') + '<h4>工单闭环前需要确认和记录哪些内容？</h4><div class="entrapment-choice-list">' + closureOptions.map((item, index) => `<label class="entrapment-choice"><input type="checkbox" data-close-check value="${index}" ${closureChecks.includes(index) ? 'checked' : ''} ${completed ? 'disabled' : ''}><span>${item}</span></label>`).join('') + '</div><textarea class="training-record entrapment-record" placeholder="记录病因、检查与调整结果、复核结论和交接对象。" ' + (completed ? 'readonly' : '') + '></textarea>' + action('提交工单闭环，生成复盘', 4);
    } else {
      const score = total();
      content = top(6, titles[5], '从受理、诊断、工具、处置与闭环记录综合生成评分。') + `<div class="entrapment-coach-result"><figure class="entrapment-coach-portrait"><img src="${score >= 60 ? 'elevator-maintenance-coach-v1.png' : 'elevator-maintenance-coach-scratch-head-v1.png'}"></figure><div class="entrapment-score-panel"><div class="entrapment-score-total"><strong>${score} 分</strong><span>电话调度 ${scores[0]}/20 · 三维诊断 ${scores[1]}/20 · 工具准备 ${scores[2]}/15 · 处置顺序 ${scores[3]}/20 · 工单闭环 ${scores[4]}/25</span></div><section class="entrapment-feedback"><span>本地模拟 AI 复盘</span><h4>${score >= 60 ? '已完成本次工单诊断与处置闭环。' : '建议重点复盘病因判断与处置顺序。'}</h4></section></div></div><div class="entrapment-actions"><button class="text-btn" data-restart>重新训练</button></div>`;
    }
    stage.innerHTML = shell(content);
    bind();
  }

  function bind() {
    stage.querySelectorAll('[data-help]').forEach(button => button.onclick = () => alert('后续会在此打开对应的微课视频帮助。'));
    stage.querySelectorAll('video[controls]').forEach(video => {
      if (video.closest('.native-video-frame')) return;
      video.controls = true;
      video.preload = 'auto';
      const frame = document.createElement('div');
      frame.className = 'native-video-frame';
      const seekSurface = document.createElement('div');
      seekSurface.className = 'native-video-seek-surface';
      seekSurface.setAttribute('role', 'slider');
      seekSurface.setAttribute('aria-label', '拖动播放器时间轴跳转播放位置');
      seekSurface.tabIndex = 0;
      video.parentNode.insertBefore(frame, video);
      frame.appendChild(video);
      frame.appendChild(seekSurface);

      const seekAt = event => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const rect = seekSurface.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        video.currentTime = video.duration * ratio;
        seekSurface.setAttribute('aria-valuenow', String(Math.round(video.currentTime)));
      };
      let dragging = false;
      seekSurface.addEventListener('pointerdown', event => {
        dragging = true;
        seekSurface.setPointerCapture(event.pointerId);
        seekAt(event);
        event.preventDefault();
      });
      seekSurface.addEventListener('pointermove', event => { if (dragging) seekAt(event); });
      seekSurface.addEventListener('pointerup', event => {
        dragging = false;
        if (seekSurface.hasPointerCapture(event.pointerId)) seekSurface.releasePointerCapture(event.pointerId);
      });
      seekSurface.addEventListener('keydown', event => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const step = event.key === 'ArrowRight' ? 5 : event.key === 'ArrowLeft' ? -5 : 0;
        if (!step) return;
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + step));
        event.preventDefault();
      });
    });
    stage.querySelectorAll('.entrapment-choice input:not([data-close-check])').forEach(input => input.onchange = () => {
      if (completed) return;
      const value = +input.value;
      if (input.checked && !answers[current].includes(value)) answers[current].push(value);
      if (!input.checked) answers[current] = answers[current].filter(item => item !== value);
      submitted.delete(current);
    });
    stage.querySelectorAll('[data-close-check]').forEach(input => input.onchange = () => {
      if (completed) return;
      const value = +input.value;
      if (input.checked && !closureChecks.includes(value)) closureChecks.push(value);
      if (!input.checked) closureChecks = closureChecks.filter(item => item !== value);
      submitted.delete(4);
    });
    stage.querySelectorAll('[data-order]').forEach(button => button.onclick = () => {
      if (completed) return;
      const value = +button.dataset.order;
      const position = answers[3].indexOf(value);
      position < 0 ? answers[3].push(value) : answers[3].splice(position, 1);
      render();
    });

    if (stage.querySelector('#doorLockCanvas')) initDoorLockModel();
    stage.querySelectorAll('[data-clue]').forEach(button => button.onclick = () => {
      const cluePanel = stage.querySelector('#cluePanel');
      cluePanel.textContent = button.dataset.clue;
      cluePanel.hidden = false;
    });
    stage.querySelector('[data-fullscreen]')?.addEventListener('click', () => {
      const modelShell = stage.querySelector('.real-model-shell');
      if (!document.fullscreenElement) modelShell?.requestFullscreen?.();
    });
    stage.querySelectorAll('input[name=cause]').forEach(input => input.onchange = () => {
      if (!completed) answers[1] = input.value;
    });

    const record = stage.querySelector('textarea');
    if (record) {
      record.value = answers[4] || '';
      record.oninput = () => { if (!completed) answers[4] = record.value; };
    }
    stage.querySelectorAll('[data-submit]').forEach(button => button.onclick = () => {
      const id = +button.dataset.submit;
      const validation = stage.querySelector('.stage-validation');
      const incomplete = id === 1 ? !answers[1] : id === 4 ? !answers[4].trim() || !closureChecks.length : id === 3 ? answers[3].length < 4 : !answers[id].length;
      if (incomplete) {
        validation.textContent = '请完成本环节后再提交。';
        return;
      }
      let passed;
      if (id === 1) passed = answers[1] === 'right';
      else if (id === 3) passed = answers[3].length === 4 && answers[3].every((value, index) => value === index);
      else if (id === 4) passed = answers[4].trim().length >= 30 && closureOptions.every((_, index) => closureChecks.includes(index) === closureCorrect.includes(index));
      else {
        const setIndex = id === 2 ? 1 : 0;
        passed = optionSets[setIndex].every((_, index) => answers[id].includes(index) === correct[setIndex].includes(index));
      }
      scores[id] = passed ? weights[id] : Math.round(weights[id] * .45);
      submitted.add(id);
      if (id === 4) {
        completed = true;
        const attemptNo = (attemptHistory.at(-1)?.attemptNo || 0) + 1;
        attemptHistory = [...attemptHistory, { attemptNo, completedAt: new Date().toISOString(), total: total(), scores: [...scores] }].slice(-3);
        localStorage.setItem(key, JSON.stringify({ completed, answers, scores, closureChecks, attemptHistory, completedAt: new Date().toISOString() }));
      }
      current = id + 1;
      render();
    });
    stage.querySelector('[data-restart]')?.addEventListener('click', () => {
      completed = false;
      current = 0;
      submitted.clear();
      answers = [[], null, [], [], ''];
      scores = [0, 0, 0, 0, 0];
      closureChecks = [];
      localStorage.setItem(key, JSON.stringify({ attemptHistory }));
      render();
    });
  }

  flow.forEach((item, index) => item.onclick = () => {
    if (can(index)) {
      current = index;
      render();
    }
  });
  render();
});

const statLabels = {
  paper: "论文",
  grant: "基金",
  teaching: "教学",
  health: "健康",
  reputation: "声望",
  time: "时间"
};

const profiles = {
  balanced: { paper: 50, grant: 45, teaching: 50, health: 70, reputation: 45, time: 55 },
  paper: { paper: 66, grant: 35, teaching: 42, health: 58, reputation: 48, time: 50 },
  grant: { paper: 42, grant: 68, teaching: 40, health: 55, reputation: 50, time: 48 },
  teaching: { paper: 40, grant: 38, teaching: 70, health: 62, reputation: 55, time: 50 }
};

const events = [
  {
    title: "审稿意见来了",
    text: "Reviewer #2 认为你的论文“很有潜力”，但需要补一个不可能在本周完成的实验。",
    choices: [
      { text: "硬补实验，先把睡眠抵押出去", delta: { paper: 14, health: -13, time: -10, reputation: 4 }, log: "你补上了实验，也学会了站着睡觉。" },
      { text: "写一封非常礼貌但很硬的 rebuttal", delta: { paper: 7, reputation: 6, health: -4, time: -4 }, log: "你赢得了语气上的胜利，结果未知。" },
      { text: "转投另一个会议", delta: { paper: -4, health: 5, time: -2 }, log: "你把 PDF 文件名改成 final_final_v9_really.pdf。" }
    ]
  },
  {
    title: "学院要求提交年度总结",
    text: "模板有 17 个表，且每个表都要求填写“代表性成果”。",
    choices: [
      { text: "认真填完所有表格", delta: { time: -12, health: -6, reputation: 4 }, log: "行政老师说你材料很规范。" },
      { text: "复制去年的格式，祈祷没人细看", delta: { time: -3, reputation: -3, health: 2 }, log: "你获得了半天自由，以及一点风险。" },
      { text: "把它变成一个自动化脚本", delta: { time: -8, paper: -2, reputation: 8 }, log: "隔壁课题组开始向你求脚本。" }
    ]
  },
  {
    title: "学生问：老师这个会考吗",
    text: "你刚刚讲完一段你认为足以改变人生的内容。",
    choices: [
      { text: "耐心解释知识体系", delta: { teaching: 9, health: -5, time: -4 }, log: "学生点头，但你不确定他们点头的含义。" },
      { text: "说：重要的是思维方式", delta: { teaching: -2, health: 2, reputation: -1 }, log: "教室里出现短暂而礼貌的沉默。" },
      { text: "把它加入考试范围", delta: { teaching: 5, reputation: -4, time: -2 }, log: "课堂注意力显著提升，评教分数隐约下降。" }
    ]
  },
  {
    title: "基金截止前 48 小时",
    text: "你突然发现预算表、合作单位盖章和摘要英文版都还没有完全对齐。",
    choices: [
      { text: "通宵整合所有材料", delta: { grant: 16, health: -18, time: -12 }, log: "系统在 23:58 接收了你的申请。" },
      { text: "砍掉最复杂的研究目标", delta: { grant: 7, paper: -3, health: -5 }, log: "项目变得可写了，也变得朴素了。" },
      { text: "找前辈要一份成功模板", delta: { grant: 10, reputation: 2, time: -5 }, log: "你打开模板，发现里面也有别人的模板痕迹。" }
    ]
  },
  {
    title: "突然多了一个委员会",
    text: "邮件标题写着“轻量级服务工作”，正文里出现了“长期机制”。",
    choices: [
      { text: "接受，积累学院存在感", delta: { reputation: 8, time: -12, health: -4 }, log: "你获得了会议纪要撰写权。" },
      { text: "委婉拒绝", delta: { reputation: -5, time: 5, health: 3 }, log: "你的措辞很漂亮，对方已读未回。" },
      { text: "推荐一位更合适的同事", delta: { reputation: 1, time: 3 }, log: "你感到一种微妙的战略胜利。" }
    ]
  },
  {
    title: "合作作者消失了",
    text: "距离投稿还有三天，共同一作头像灰了。",
    choices: [
      { text: "自己补完整个实验段", delta: { paper: 12, health: -12, time: -9 }, log: "你完成了实验，也完成了一次人格重塑。" },
      { text: "降低论文野心", delta: { paper: 4, health: 3, reputation: -2 }, log: "论文短了，人生长了。" },
      { text: "发一封温和但带附件的催稿信", delta: { paper: 7, reputation: -1, time: -3 }, log: "对方回复：不好意思刚看到。" }
    ]
  }
];

const maxSemester = 6;
let state = null;

const els = {
  profile: document.querySelector("#profile"),
  startBtn: document.querySelector("#startBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  semester: document.querySelector("#semester"),
  status: document.querySelector("#status"),
  stats: document.querySelector("#stats"),
  eventTitle: document.querySelector("#eventTitle"),
  eventText: document.querySelector("#eventText"),
  choices: document.querySelector("#choices"),
  log: document.querySelector("#log"),
  resultBox: document.querySelector("#resultBox"),
  endingTitle: document.querySelector("#endingTitle"),
  endingText: document.querySelector("#endingText"),
  shareText: document.querySelector("#shareText"),
  copyBtn: document.querySelector("#copyBtn")
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function startGame() {
  state = {
    semester: 1,
    stats: { ...profiles[els.profile.value] },
    used: [],
    log: ["你拿到了办公室钥匙。门牌上的名字还没贴正。"]
  };
  els.resultBox.hidden = true;
  render();
  drawEvent();
}

function pickEvent() {
  if (state.used.length === events.length) state.used = [];
  const available = events.map((_, index) => index).filter(index => !state.used.includes(index));
  const index = available[Math.floor(Math.random() * available.length)];
  state.used.push(index);
  return events[index];
}

function drawEvent() {
  if (!state) return;
  if (state.semester > maxSemester || state.stats.health <= 0 || state.stats.time <= 0) {
    finishGame();
    return;
  }
  const event = pickEvent();
  state.current = event;
  els.eventTitle.textContent = event.title;
  els.eventText.textContent = event.text;
  els.choices.innerHTML = "";
  event.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.addEventListener("click", () => applyChoice(index));
    els.choices.appendChild(button);
  });
  render();
}

function applyChoice(index) {
  const choice = state.current.choices[index];
  Object.entries(choice.delta).forEach(([key, value]) => {
    state.stats[key] = clamp(state.stats[key] + value);
  });
  state.log.unshift(`第 ${state.semester} 学期：${choice.log}`);
  state.semester += 1;
  drawEvent();
}

function finishGame() {
  els.choices.innerHTML = "";
  els.eventTitle.textContent = "本轮结束";
  els.eventText.textContent = "你坐在办公室里，看着日程表，决定给自己倒一杯水。";
  const total = state.stats.paper + state.stats.grant + state.stats.teaching + state.stats.reputation + state.stats.health + state.stats.time;
  let title = "稳定存活型青椒";
  let text = "你没有成为传奇，但你保住了研究、教学和一点点生活。";
  if (state.stats.health < 20) {
    title = "燃尽型卷王";
    text = "成果还在增长，但你开始怀疑自己是不是也应该进入仪器共享平台预约维护。";
  } else if (state.stats.paper > 75 && state.stats.grant > 65) {
    title = "高压上岸型 PI";
    text = "论文和基金都站住了，代价是你现在听到 deadline 会自动握拳。";
  } else if (state.stats.teaching > 75) {
    title = "学生口碑型老师";
    text = "你可能暂时没有最亮的指标，但学生真的记得你讲过什么。";
  } else if (total < 240) {
    title = "系统维护中";
    text = "这不是失败，只是你的学术操作系统需要重启。";
  }
  const share = `我在《青椒轮盘》里获得结局：${title}。论文${state.stats.paper}/基金${state.stats.grant}/教学${state.stats.teaching}/健康${state.stats.health}。`;
  els.endingTitle.textContent = title;
  els.endingText.textContent = text;
  els.shareText.value = share;
  els.resultBox.hidden = false;
  els.status.textContent = "结局生成";
}

function render() {
  if (!state) {
    els.semester.textContent = "-";
    els.status.textContent = "等待开局";
    els.stats.innerHTML = "";
    return;
  }
  els.semester.textContent = `${Math.min(state.semester, maxSemester)} / ${maxSemester}`;
  els.status.textContent = state.stats.health <= 20 ? "需要休整" : "勉强运转";
  els.stats.innerHTML = Object.entries(state.stats).map(([key, value]) => `
    <div class="stat">
      <div class="stat-top"><span>${statLabels[key]}</span><strong>${value}</strong></div>
      <div class="bar"><i style="--value:${value}%"></i></div>
    </div>
  `).join("");
  els.log.textContent = ["faculty-survival.log", ...state.log.slice(0, 8)].join("\n");
}

els.startBtn.addEventListener("click", startGame);
els.restartBtn.addEventListener("click", startGame);
els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.shareText.value);
    els.copyBtn.textContent = "已复制";
    setTimeout(() => { els.copyBtn.textContent = "复制结局文本"; }, 1200);
  } catch {
    els.shareText.select();
  }
});

render();

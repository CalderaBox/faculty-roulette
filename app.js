const statLabels = {
  paper: "论文",
  grant: "基金",
  teaching: "教学",
  service: "服务",
  health: "健康",
  luck: "运气"
};

const statColors = {
  paper: "#7ab8ff",
  grant: "#f2c15d",
  teaching: "#69d98f",
  service: "#b89bff",
  health: "#71d7db",
  luck: "#ff7474"
};

const profileNotes = {
  balanced: "你相信系统性努力，也相信周五下午不该开会。各项指标都不极端，适合第一次体验。",
  paper: "你把日历按投稿 deadline 来理解。论文起步高，但教学和健康会向你投来安静的目光。",
  grant: "你熟悉预算表的颜色，也会在梦里听到系统截止提醒。基金强，时间和健康偏脆。",
  teaching: "你真的在乎课堂，但系统未必在乎。教学口碑高，论文和基金需要努力追赶。",
  stealth: "你擅长不出现在不该出现的会议里。健康和运气较好，但声望成长更慢。"
};

const actionBudget = {
  standard: 3,
  publish: 2,
  humane: 4
};

const economyBudget = {
  standard: { budget: 6, energy: 6 },
  publish: { budget: 5, energy: 5 },
  humane: { budget: 7, energy: 7 }
};

const profiles = {
  balanced: { paper: 50, grant: 46, teaching: 52, service: 42, health: 72, luck: 50 },
  paper: { paper: 68, grant: 36, teaching: 42, service: 35, health: 58, luck: 48 },
  grant: { paper: 43, grant: 70, teaching: 40, service: 45, health: 55, luck: 46 },
  teaching: { paper: 40, grant: 38, teaching: 72, service: 46, health: 64, luck: 50 },
  stealth: { paper: 44, grant: 40, teaching: 48, service: 30, health: 78, luck: 62 }
};

const modeSettings = {
  standard: {
    label: "标准学术天气",
    semesters: 6,
    multiplier: 1,
    bonus: {},
    rule: "普通难度。系统不友善，但还没有完全拟人化。"
  },
  publish: {
    label: "非升即走模式",
    semesters: 7,
    multiplier: 1.18,
    bonus: { paper: 4, grant: 4, health: -10, luck: -4 },
    rule: "高压难度。正收益更甜，负收益更疼，结局更戏剧化。"
  },
  humane: {
    label: "理想学院模式",
    semesters: 5,
    multiplier: .82,
    bonus: { health: 10, luck: 6, service: -3 },
    rule: "温柔难度。仍有荒诞，但至少有人记得你是人。"
  }
};

const moods = [
  { name: "论文季风", spin: 25, bonus: { paper: 2 }, memo: "今天的空气里有返修味。" },
  { name: "基金低压槽", spin: 85, bonus: { grant: 2 }, memo: "预算表会膨胀，人的意志会收缩。" },
  { name: "课堂晴转多云", spin: 145, bonus: { teaching: 2 }, memo: "学生的沉默有很多种含义。" },
  { name: "服务性降雨", spin: 205, bonus: { service: 2 }, memo: "轻量级任务通常不会轻量结束。" },
  { name: "健康预警", spin: 265, bonus: { health: -2, luck: 2 }, memo: "咖啡不是一种睡眠。" },
  { name: "审稿人二号回流", spin: 325, bonus: { luck: -2, paper: 2 }, memo: "有些意见看起来像意见，其实是天气。" }
];

const absurdRules = [
  {
    name: "所有邮件默认紧急",
    text: "本学期服务类损耗加深，但服务收益也更容易被看见。",
    modify: (delta) => ({ ...delta, service: (delta.service || 0) + 2, health: (delta.health || 0) - 2 })
  },
  {
    name: "审稿意见会繁殖",
    text: "论文收益更高，但每次推进论文都会额外消耗健康。",
    modify: (delta) => ({ ...delta, paper: delta.paper ? delta.paper + 3 : delta.paper, health: delta.paper ? (delta.health || 0) - 2 : delta.health })
  },
  {
    name: "预算表具有主观能动性",
    text: "基金相关选择波动变大，运气会轻微参与评审。",
    modify: (delta) => ({ ...delta, grant: delta.grant ? delta.grant + 4 : delta.grant, luck: (delta.luck || 0) - 1 })
  },
  {
    name: "评教在暗处凝视",
    text: "教学收益放大，但服务和健康会被课堂余波牵连。",
    modify: (delta) => ({ ...delta, teaching: delta.teaching ? delta.teaching + 3 : delta.teaching, service: (delta.service || 0) + 1, health: (delta.health || 0) - 1 })
  },
  {
    name: "今天学院像个人",
    text: "负面影响减轻。请珍惜这条罕见时间线。",
    modify: (delta) => Object.fromEntries(Object.entries(delta).map(([key, value]) => [key, value < 0 ? Math.ceil(value / 2) : value]))
  },
  {
    name: "咖啡因通货膨胀",
    text: "所有高收益选择都会更伤身体，但本轮更容易产出戏剧性结局。",
    modify: (delta) => {
      const positive = Object.values(delta).some((value) => value >= 8);
      return positive ? { ...delta, health: (delta.health || 0) - 4, luck: (delta.luck || 0) + 2 } : delta;
    }
  }
];

const bestiary = [
  { id: "reviewer-hydra", name: "审稿九头蛇", hint: "连续论文波动后现身", test: (s) => s.history.filter((item) => item.tag === "Reviewer #2" || item.delta.paper > 8).length >= 2 },
  { id: "budget-wraith", name: "预算表幽灵", hint: "基金值冲高后现身", test: (s) => s.stats.grant >= 78 },
  { id: "meeting-vine", name: "会议藤蔓", hint: "服务值过高后现身", test: (s) => s.stats.service >= 70 },
  { id: "coffee-oracle", name: "咖啡占卜师", hint: "健康跌破红线后现身", test: (s) => s.stats.health <= 28 },
  { id: "silent-class", name: "沉默教室", hint: "教学口碑很高后现身", test: (s) => s.stats.teaching >= 80 },
  { id: "deadline-comet", name: "截止彗星", hint: "高波动事件后现身", test: (s) => s.history.some((item) => item.swing >= 24) },
  { id: "lucky-stamp", name: "幸运盖章机", hint: "运气很高后现身", test: (s) => s.stats.luck >= 78 },
  { id: "normal-human", name: "正常人目击报告", hint: "健康结局后现身", test: (s) => s.finished && s.stats.health >= 70 }
];

const projectTemplates = [
  {
    id: "paper",
    name: "代表作手稿",
    desc: "把散落的想法压缩成一篇能投稿的东西。",
    target: 9,
    perAction: 3,
    budgetCost: 1,
    energyCost: 2,
    risk: 2,
    delta: { paper: 5, health: -2 },
    complete: { paper: 16, luck: 4 },
    completeText: "代表作形成了清晰轮廓，审稿人暂时还没有发现你。"
  },
  {
    id: "grant",
    name: "基金叙事线",
    desc: "让一个尚未稳定的想法看起来像五年规划。",
    target: 8,
    perAction: 2,
    budgetCost: 2,
    energyCost: 1,
    risk: 3,
    delta: { grant: 5, service: 1, health: -1 },
    complete: { grant: 18, service: 4 },
    completeText: "你的基金故事终于从“想做”变成了“似乎必须做”。"
  },
  {
    id: "teaching",
    name: "课程重构",
    desc: "把祖传 PPT 改造成学生能听懂的版本。",
    target: 7,
    perAction: 2,
    budgetCost: 1,
    energyCost: 1,
    risk: 1,
    delta: { teaching: 6, paper: -1 },
    complete: { teaching: 15, luck: 3 },
    completeText: "学生第一次主动问了一个不是考试范围的问题。"
  },
  {
    id: "boundary",
    name: "边界防火墙",
    desc: "训练自己识别“轻量级任务”的真实体积。",
    target: 6,
    perAction: 2,
    budgetCost: 0,
    energyCost: 1,
    risk: 0,
    delta: { health: 4, service: -2 },
    complete: { health: 14, service: -8, luck: 4 },
    completeText: "你学会了在不燃烧自己的情况下保持礼貌。"
  }
];

const events = [
  {
    tag: "Reviewer #2",
    risk: "high",
    title: "审稿意见来了",
    text: "Reviewer #2 认为你的论文“很有潜力”，但需要补一个不可能在本周完成的实验。",
    choices: [
      { text: "硬补实验，先把睡眠抵押出去", delta: { paper: 15, health: -13, luck: -3 }, log: "你补上了实验，也学会了站着睡觉。", memo: "论文推进了，身体在后台发出轻微警报。" },
      { text: "写一封礼貌但很硬的 rebuttal", delta: { paper: 8, luck: 4, service: -2 }, log: "你赢得了语气上的胜利，结果未知。", memo: "有时最有力的实验是句法。" },
      { text: "转投另一个 venue", delta: { paper: -3, health: 5, luck: 3 }, log: "你把文件名改成 final_final_v9_really.pdf。", memo: "放弃也是一种项目管理。" }
    ]
  },
  {
    tag: "Admin",
    risk: "medium",
    title: "学院要求提交年度总结",
    text: "模板有 17 个表，每个表都要求填写“代表性成果”，且所有单元格都喜欢合并。",
    choices: [
      { text: "认真填完所有表格", delta: { service: 8, health: -6, grant: -2 }, log: "行政老师说你的材料很规范。", memo: "规范是一种美德，也是一种体力劳动。" },
      { text: "复制去年的格式，祈祷没人细看", delta: { service: -3, health: 3, luck: -2 }, log: "你获得了半天自由，以及一点风险。", memo: "你赌的是组织记忆的空白。" },
      { text: "把它做成自动化小工具", delta: { service: 5, paper: -2, luck: 5 }, log: "隔壁课题组开始向你求脚本。", memo: "技术债变成了人情债。" }
    ]
  },
  {
    tag: "Classroom",
    risk: "medium",
    title: "学生问：老师，这个会考吗",
    text: "你刚刚讲完一段你认为足以改变人生的内容。教室里空气安静得很具体。",
    choices: [
      { text: "耐心解释知识体系", delta: { teaching: 10, health: -4, luck: 1 }, log: "学生点头，但你不确定他们点头的含义。", memo: "口碑是慢变量。" },
      { text: "说：重要的是思维方式", delta: { teaching: -2, health: 2, service: -1 }, log: "教室里出现短暂而礼貌的沉默。", memo: "这句话非常正确，也非常危险。" },
      { text: "把它加入考试范围", delta: { teaching: 5, service: 2, luck: -4 }, log: "课堂注意力显著提升，评教分数隐约下降。", memo: "恐惧确实是一种激励机制。" }
    ]
  },
  {
    tag: "Grant",
    risk: "high",
    title: "基金截止前 48 小时",
    text: "你突然发现预算表、合作单位盖章和摘要英文版都还没有完全对齐。",
    choices: [
      { text: "通宵整合所有材料", delta: { grant: 17, health: -17, luck: -2 }, log: "系统在 23:58 接收了你的申请。", memo: "系统接收了材料，也接收了你的灵魂碎片。" },
      { text: "砍掉最复杂的研究目标", delta: { grant: 8, paper: -3, health: -4 }, log: "项目变得可写了，也变得朴素了。", memo: "可执行性有时候来自克制。" },
      { text: "找前辈要一份成功模板", delta: { grant: 11, service: 2, luck: -1 }, log: "你打开模板，发现里面也有别人的模板痕迹。", memo: "学术传承以 docx 的形式发生。" }
    ]
  },
  {
    tag: "Service",
    risk: "medium",
    title: "突然多了一个委员会",
    text: "邮件标题写着“轻量级服务工作”，正文里出现了“长期机制”。",
    choices: [
      { text: "接受，积累学院存在感", delta: { service: 12, health: -5, paper: -4 }, log: "你获得了会议纪要撰写权。", memo: "存在感增加，存在时间减少。" },
      { text: "委婉拒绝", delta: { service: -6, health: 5, luck: -2 }, log: "你的措辞很漂亮，对方已读未回。", memo: "拒绝也是一种学术写作。" },
      { text: "推荐一位更合适的同事", delta: { service: 2, luck: 4, teaching: -1 }, log: "你感到一种微妙的战略胜利。", memo: "推荐信之外，还有推荐人。" }
    ]
  },
  {
    tag: "Coauthor",
    risk: "high",
    title: "合作作者消失了",
    text: "距离投稿还有三天，共同一作头像灰了。群聊里只剩下你的撤回消息。",
    choices: [
      { text: "自己补完整个实验段", delta: { paper: 13, health: -12, luck: -3 }, log: "你完成了实验，也完成了一次人格重塑。", memo: "单人协作是一种极限运动。" },
      { text: "降低论文野心", delta: { paper: 5, health: 4, grant: -2 }, log: "论文短了，人生长了。", memo: "并非所有故事都需要顶会结尾。" },
      { text: "发一封温和但带附件的催稿信", delta: { paper: 7, service: 2, luck: 1 }, log: "对方回复：不好意思刚看到。", memo: "附件是一种文明的压力。" }
    ]
  },
  {
    tag: "Lab",
    risk: "medium",
    title: "仪器预约系统崩了",
    text: "你终于排到的机时消失在维护公告里，公告发布时间是昨天凌晨 1:13。",
    choices: [
      { text: "现场蹲守，等有人取消", delta: { paper: 8, health: -7, luck: 4 }, log: "你在走廊里认识了三个同样失眠的人。", memo: "走廊社交也是科研基础设施。" },
      { text: "改用公开数据做替代实验", delta: { paper: 4, grant: 2, luck: -1 }, log: "你开始相信 supplementary 的力量。", memo: "可复现性偶尔会拯救你。" },
      { text: "把失败写进方法局限", delta: { paper: -2, health: 4, teaching: 2 }, log: "你获得了诚实，以及一个更短的结果部分。", memo: "局限性写得好，也像一种结果。" }
    ]
  },
  {
    tag: "Opportunity",
    risk: "low",
    title: "有人邀请你做播客嘉宾",
    text: "主题是“年轻学者如何保持创造力”。你看了一眼日程表，笑得很安静。",
    choices: [
      { text: "去，顺便讲讲真实处境", delta: { luck: 8, service: 5, paper: -2 }, log: "节目播出后，有人说你讲出了大家的心声。", memo: "公共表达也是一种作品。" },
      { text: "婉拒，把时间还给论文", delta: { paper: 6, health: 2, luck: -2 }, log: "你的日程表短暂恢复了人形。", memo: "不是每个机会都要被抓住。" },
      { text: "推荐学生参加", delta: { teaching: 7, luck: 3, service: -1 }, log: "学生第一次感到自己的研究有人听。", memo: "让位置也是一种指导。" }
    ]
  },
  {
    tag: "Email",
    risk: "medium",
    title: "凌晨收到“急”字邮件",
    text: "邮件只有三行，但每一行都可以展开成一个工作包。",
    choices: [
      { text: "立刻处理", delta: { service: 8, health: -8, luck: -2 }, log: "对方第二天下午回复：辛苦，收到。", memo: "即时响应会训练别人继续即时请求。" },
      { text: "早上再回", delta: { health: 5, service: -2, luck: 2 }, log: "世界没有崩塌，你有点意外。", memo: "延迟并不总是失职。" },
      { text: "拆成三个明确问题回复", delta: { service: 3, teaching: 2, health: -2 }, log: "任务变清楚了，麻烦也变清楚了。", memo: "边界清晰有时比效率更重要。" }
    ]
  },
  {
    tag: "Student",
    risk: "low",
    title: "学生拿来一个很野的想法",
    text: "它不太像你的方向，但里面有一点危险的光。",
    choices: [
      { text: "给它两周探索窗口", delta: { teaching: 8, luck: 7, paper: -2 }, log: "两周后，你们有了一个奇怪但可爱的原型。", memo: "好奇心需要预算，也需要边界。" },
      { text: "拉回主线任务", delta: { paper: 6, teaching: -2, luck: -1 }, log: "进度稳定了，空气平了。", memo: "稳定有成本，发散也有。" },
      { text: "把它变成组会讨论题", delta: { teaching: 5, service: 3, health: -2 }, log: "组会第一次没有人低头看电脑。", memo: "好的问题会暂时解除疲惫。" }
    ]
  }
];

const achievementRules = [
  { id: "deadline", label: "23:58 提交", test: (s) => s.stats.grant >= 76 },
  { id: "teacher", label: "有人真的听懂了", test: (s) => s.stats.teaching >= 78 },
  { id: "paper", label: "返修免疫", test: (s) => s.stats.paper >= 80 },
  { id: "boundaries", label: "边界感练习生", test: (s) => s.stats.service <= 32 && s.stats.health >= 55 },
  { id: "burnout", label: "咖啡不是睡眠", test: (s) => s.stats.health <= 28 },
  { id: "lucky", label: "宇宙偏心", test: (s) => s.stats.luck >= 78 },
  { id: "balanced", label: "六边形小而稳", test: (s) => Math.min(...Object.values(s.stats)) >= 48 },
  { id: "chaos", label: "系统边缘漫游", test: (s) => s.history.some((item) => item.swing >= 22) },
  { id: "bestiary", label: "传说目击者", test: (s) => s.myths.size >= 3 },
  { id: "builder", label: "长期主义者", test: (s) => s.projects.filter((item) => item.completeDone).length >= 2 },
  { id: "firewall", label: "拒绝轻量级", test: (s) => s.projects.some((item) => item.id === "boundary" && item.completeDone) },
  { id: "lean", label: "精益存活", test: (s) => s.finished && s.budget >= 3 && s.energy >= 2 }
];

const defaultMaxSemester = 6;
let state = null;
let seed = Date.now() % 100000;

const els = {
  profile: document.querySelector("#profile"),
  mode: document.querySelector("#mode"),
  profileNote: document.querySelector("#profileNote"),
  startBtn: document.querySelector("#startBtn"),
  startHeroBtn: document.querySelector("#startHeroBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  dailySeedBtn: document.querySelector("#dailySeedBtn"),
  seedBtn: document.querySelector("#seedBtn"),
  seedLabel: document.querySelector("#seedLabel"),
  rank: document.querySelector("#rank"),
  crisis: document.querySelector("#crisis"),
  semester: document.querySelector("#semester"),
  status: document.querySelector("#status"),
  mood: document.querySelector("#mood"),
  combo: document.querySelector("#combo"),
  actionsLeft: document.querySelector("#actionsLeft"),
  economy: document.querySelector("#economy"),
  stats: document.querySelector("#stats"),
  projectBoard: document.querySelector("#projectBoard"),
  wheel: document.querySelector("#wheel"),
  eventTag: document.querySelector("#eventTag"),
  eventRisk: document.querySelector("#eventRisk"),
  eventTitle: document.querySelector("#eventTitle"),
  eventText: document.querySelector("#eventText"),
  activeRule: document.querySelector("#activeRule"),
  choices: document.querySelector("#choices"),
  memoText: document.querySelector("#memoText"),
  trajectory: document.querySelector("#trajectory"),
  achievements: document.querySelector("#achievements"),
  timeline: document.querySelector("#timeline"),
  bestiary: document.querySelector("#bestiary"),
  log: document.querySelector("#log"),
  resultBox: document.querySelector("#resultBox"),
  endingTitle: document.querySelector("#endingTitle"),
  endingText: document.querySelector("#endingText"),
  diagnosisCard: document.querySelector("#diagnosisCard"),
  shareText: document.querySelector("#shareText"),
  copyBtn: document.querySelector("#copyBtn")
};

function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function reseed() {
  seed = Math.floor(Math.random() * 99999) + 1;
  updateSeedLabel();
  if (!state) {
    els.log.textContent = `faculty-survival.log\nuniverse reseeded\nseed FR-${String(seed).padStart(5, "0")}`;
  }
}

function useDailySeed() {
  const today = new Date();
  const stamp = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  seed = stamp % 99999;
  updateSeedLabel();
  els.log.textContent = `faculty-survival.log\ndaily universe loaded\nseed FR-${String(seed).padStart(5, "0")}`;
}

function updateSeedLabel() {
  els.seedLabel.textContent = `FR-${String(seed).padStart(5, "0")}`;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatDelta(delta) {
  return Object.entries(delta)
    .map(([key, value]) => `${statLabels[key]}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
}

function addDelta(target, delta) {
  Object.entries(delta).forEach(([key, value]) => {
    target[key] = clamp(target[key] + value);
  });
}

function getMaxSemester() {
  return state?.mode.semesters || defaultMaxSemester;
}

function scaleDelta(delta) {
  const multiplier = state?.mode.multiplier || 1;
  const scaled = Object.fromEntries(Object.entries(delta).map(([key, value]) => {
    if (value === 0) return [key, 0];
    const scaled = value < 0 ? value * multiplier : value * (2 - multiplier);
    return [key, Math.trunc(scaled)];
  }));
  return state?.rule ? cleanDelta(state.rule.modify(scaled)) : scaled;
}

function cleanDelta(delta) {
  return Object.fromEntries(Object.entries(delta).filter(([, value]) => typeof value === "number" && value !== 0));
}

function getCrisisScore() {
  if (!state) return 0;
  const lowStats = Object.values(state.stats).filter((value) => value < 35).length * 12;
  const healthRisk = Math.max(0, 45 - state.stats.health);
  const luckRisk = Math.max(0, 35 - state.stats.luck) / 2;
  return clamp(lowStats + healthRisk + luckRisk);
}

function profileName() {
  return els.profile.options[els.profile.selectedIndex].textContent;
}

function updateProfileNote() {
  const mode = modeSettings[els.mode.value];
  els.profileNote.textContent = `${profileNotes[els.profile.value]} ${mode.rule}`;
}

function startGame() {
  const mood = moods[Math.floor(seededRandom() * moods.length)];
  const mode = modeSettings[els.mode.value];
  const stats = { ...profiles[els.profile.value] };
  addDelta(stats, mood.bonus);
  addDelta(stats, mode.bonus);
  state = {
    semester: 1,
    stats,
    used: [],
    history: [],
    achievements: new Set(),
    myths: new Set(),
    projects: projectTemplates.map((project) => ({ ...project, progress: 0, completeDone: false })),
    actionsLeft: actionBudget[els.mode.value],
    budget: economyBudget[els.mode.value].budget,
    energy: economyBudget[els.mode.value].energy,
    mode,
    mood,
    rule: null,
    spin: mood.spin,
    log: [
      `你以“${profileName()}”身份入职，宇宙强度：${mode.label}。`,
      `本轮宇宙天气：${mood.name}。`
    ]
  };
  els.resultBox.hidden = true;
  els.copyBtn.textContent = "复制结局文本";
  render();
  drawEvent();
}

function pickEvent() {
  if (state.used.length === events.length) state.used = [];
  const available = events.map((_, index) => index).filter(index => !state.used.includes(index));
  const index = available[Math.floor(seededRandom() * available.length)];
  state.used.push(index);
  return events[index];
}

function drawEvent() {
  if (!state) return;
  if (state.semester > getMaxSemester() || state.stats.health <= 0) {
    finishGame();
    return;
  }

  state.actionsLeft = actionBudget[els.mode.value];
  state.budget = economyBudget[els.mode.value].budget;
  state.energy = economyBudget[els.mode.value].energy;
  const event = pickEvent();
  state.rule = absurdRules[(state.semester + Math.floor(seededRandom() * absurdRules.length)) % absurdRules.length];
  state.current = event;
  state.spin += 360 + Math.floor(seededRandom() * 120);
  els.wheel.style.setProperty("--spin", `${state.spin}deg`);
  els.eventTag.textContent = event.tag;
  els.eventRisk.textContent = `risk: ${event.risk}`;
  els.eventTitle.textContent = event.title;
  els.eventText.textContent = event.text;
  els.activeRule.textContent = `本学期特殊规则：${state.rule.name}。${state.rule.text}`;
  els.choices.innerHTML = "";
  event.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const delta = document.createElement("small");
    label.textContent = choice.text;
    delta.textContent = formatDelta(scaleDelta(choice.delta));
    button.append(label, delta);
    button.addEventListener("click", () => applyChoice(index));
    els.choices.appendChild(button);
  });
  render();
}

function applyChoice(index) {
  const choice = state.current.choices[index];
  const delta = scaleDelta(choice.delta);
  const before = { ...state.stats };
  addDelta(state.stats, delta);
  const swing = Object.keys(delta).reduce((sum, key) => sum + Math.abs(state.stats[key] - before[key]), 0);
  state.history.push({
    semester: state.semester,
    tag: state.current.tag,
    choice: choice.text,
    swing,
    delta
  });
  updateAchievements();
  state.log.unshift(`S${state.semester} ${state.current.tag}: ${choice.log}`);
  els.memoText.textContent = choice.memo;
  state.semester += 1;
  drawEvent();
}

function investProject(projectId) {
  if (!state || state.finished || state.actionsLeft <= 0) return;
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || project.completeDone) return;
  if (state.budget < project.budgetCost || state.energy < project.energyCost) return;

  state.actionsLeft -= 1;
  state.budget -= project.budgetCost;
  state.energy -= project.energyCost;
  project.progress = Math.min(project.target, project.progress + project.perAction);
  addDelta(state.stats, project.delta);
  state.log.unshift(`S${state.semester} 项目投入：${project.name}。`);

  if (project.risk > 0 && seededRandom() < project.risk * 0.04) {
    state.log.unshift(`项目波动：${project.name} 突然返工。`);
    project.progress = Math.max(0, project.progress - 1);
    addDelta(state.stats, { health: -2, luck: -1 });
  }

  if (project.progress >= project.target && !project.completeDone) {
    project.completeDone = true;
    addDelta(state.stats, project.complete);
    state.log.unshift(`项目完成：${project.completeText}`);
  }

  updateAchievements();
  render();
}

function updateAchievements() {
  bestiary.forEach((myth) => {
    if (myth.test(state)) state.myths.add(myth.id);
  });
  achievementRules.forEach((achievement) => {
    if (achievement.test(state)) state.achievements.add(achievement.id);
  });
}

function getCombo() {
  if (!state || state.history.length < 2) return "尚未形成";
  const recent = state.history.slice(-2);
  if (recent.every((item) => item.tag === "Grant" || item.delta.grant > 0)) return "基金冲刺";
  if (recent.every((item) => item.delta.paper > 0)) return "论文连击";
  if (recent.every((item) => item.delta.health > 0)) return "健康回补";
  if (recent.every((item) => item.swing >= 16)) return "高波动人生";
  return `${recent.at(-1).tag} 余波`;
}

function getTotal() {
  const s = state.stats;
  return s.paper + s.grant + s.teaching + s.service + s.health + s.luck;
}

function getRank() {
  if (!state) return "未入职";
  const total = getTotal();
  if (state.stats.health < 20) return "濒危 PI";
  if (state.stats.paper > 78 && state.stats.grant > 68) return "高压上岸型 PI";
  if (state.stats.teaching > 78 && state.stats.health > 45) return "口碑型老师";
  if (state.stats.luck > 76) return "宇宙偏爱型青椒";
  if (state.projects.filter((item) => item.completeDone).length >= 3 && state.stats.health > 35) return "项目管理型幸存者";
  if (state.mode === modeSettings.publish && total > 390) return "高压驯兽师";
  if (state.mode === modeSettings.humane && state.stats.health > 70) return "罕见正常人";
  if (total > 410) return "稀有稳定型青椒";
  if (total < 275) return "系统维护中";
  return "勉强优雅型青椒";
}

function finishGame() {
  state.finished = true;
  els.choices.innerHTML = "";
  els.eventTag.textContent = "Final";
  els.eventRisk.textContent = "risk: archived";
  els.eventTitle.textContent = "本轮结束";
  els.eventText.textContent = "你坐在办公室里，看着日程表，决定给自己倒一杯水。";

  const rank = getRank();
  const total = getTotal();
  let text = "你没有成为传说，但你保住了研究、教学和一点点生活。";
  if (state.stats.health < 20) {
    text = "成果还在增长，但你开始怀疑自己是不是也应该进入仪器共享平台预约维护。";
  } else if (state.stats.paper > 78 && state.stats.grant > 68) {
    text = "论文和基金都站住了，代价是你现在听到 deadline 会自动握拳。";
  } else if (state.stats.teaching > 78) {
    text = "你可能暂时没有最亮的指标，但学生真的记得你讲过什么。";
  } else if (state.stats.luck > 76) {
    text = "你在多个不该过关的地方过关了。请谨慎使用这份好运。";
  } else if (state.mode === modeSettings.publish && total > 390) {
    text = "你没有让高压系统变温柔，但你学会了在它露出牙齿时保持站立。";
  } else if (state.mode === modeSettings.humane && state.stats.health > 70) {
    text = "传说中存在一种学院：事情仍然很多，但人不会被当成可替换耗材。你短暂抵达过那里。";
  } else if (total < 275) {
    text = "这不是失败，只是你的学术操作系统需要重启。";
  }

  updateAchievements();
  const unlocked = achievementRules.filter((item) => state.achievements.has(item.id)).map((item) => item.label);
  const completedProjects = state.projects.filter((item) => item.completeDone).map((item) => item.name);
  const share = `我在《青椒轮盘 Faculty Roulette》里获得结局：${rank}。\n论文${state.stats.paper} / 基金${state.stats.grant} / 教学${state.stats.teaching} / 服务${state.stats.service} / 健康${state.stats.health} / 运气${state.stats.luck}\n宇宙：${state.mood.name} / ${state.mode.label}\n成就：${unlocked.length ? unlocked.join("、") : "暂无，但仍然活着"}`;
  els.endingTitle.textContent = rank;
  els.endingText.textContent = text;
  const unlockedMyths = bestiary.filter((item) => state.myths.has(item.id)).map((item) => item.name);
  els.diagnosisCard.innerHTML = `
    <h3>学术荒诞诊断书</h3>
    <dl>
      <dt>病例编号</dt><dd>${els.seedLabel.textContent}</dd>
      <dt>诊断结果</dt><dd>${rank}</dd>
      <dt>主要症状</dt><dd>${state.mood.name}，${state.mode.label}</dd>
      <dt>目击传说</dt><dd>${unlockedMyths.length ? unlockedMyths.join("、") : "暂未目击，但墙里有声音"}</dd>
      <dt>完成项目</dt><dd>${completedProjects.length ? completedProjects.join("、") : "没有完成项目，但积累了很多解释"}</dd>
      <dt>建议处方</dt><dd>${state.stats.health < 35 ? "先睡觉，再讨论宏大问题" : "保留边界，谨慎答应“轻量级”任务"}</dd>
    </dl>
  `;
  els.shareText.value = share;
  els.resultBox.hidden = false;
  els.rank.textContent = rank;
  render();
}

function renderStats() {
  if (!state) {
    els.stats.innerHTML = "";
    return;
  }
  els.stats.innerHTML = Object.entries(state.stats).map(([key, value]) => `
    <div class="stat">
      <div class="stat-top"><span>${statLabels[key]}</span><strong>${value}</strong></div>
      <div class="bar"><i style="--value:${value}%; --bar-color:${statColors[key]}"></i></div>
    </div>
  `).join("");
}

function renderProjects() {
  if (!state) {
    els.projectBoard.innerHTML = projectTemplates.map((project) => `
      <div class="project-card">
        <h3>${project.name}</h3>
        <p>${project.desc}</p>
        <div class="progress"><i style="--value:0%"></i></div>
        <button disabled>等待开局</button>
      </div>
    `).join("");
    return;
  }

  els.projectBoard.innerHTML = state.projects.map((project) => {
    const percent = Math.round((project.progress / project.target) * 100);
    const disabled = state.actionsLeft <= 0 || project.completeDone || state.finished || state.budget < project.budgetCost || state.energy < project.energyCost;
    return `
      <div class="project-card ${project.completeDone ? "complete" : ""}">
        <h3>${project.name}</h3>
        <p>${project.completeDone ? project.completeText : project.desc}</p>
        <div class="project-meta"><span>预算 ${project.budgetCost}</span><span>精力 ${project.energyCost}</span><span>风险 ${project.risk}</span></div>
        <div class="progress"><i style="--value:${percent}%"></i></div>
        <button data-project="${project.id}" ${disabled ? "disabled" : ""}>${project.completeDone ? "已完成" : `投入 1 AP · ${project.progress}/${project.target}`}</button>
      </div>
    `;
  }).join("");

  els.projectBoard.querySelectorAll("button[data-project]").forEach((button) => {
    button.addEventListener("click", () => investProject(button.dataset.project));
  });
}

function renderTrajectory() {
  const current = state ? state.semester : 0;
  const maxSemester = getMaxSemester();
  els.trajectory.innerHTML = Array.from({ length: maxSemester }, (_, index) => {
    const step = index + 1;
    const done = state && step < current;
    const isCurrent = state && step === current && current <= maxSemester;
    const cls = done ? "done" : isCurrent ? "current" : "";
    return `<div class="dot ${cls}">S${step}</div>`;
  }).join("");
}

function renderAchievements() {
  if (!state) {
    els.achievements.innerHTML = achievementRules.slice(0, 4).map((item) => `<span class="chip">${item.label}</span>`).join("");
    return;
  }
  els.achievements.innerHTML = achievementRules.map((item) => {
    const unlocked = state.achievements.has(item.id);
    return `<span class="chip ${unlocked ? "unlocked" : ""}">${unlocked ? "✓ " : ""}${item.label}</span>`;
  }).join("");
}

function renderTimeline() {
  if (!state || state.history.length === 0) {
    els.timeline.innerHTML = "<li>等待第一张事件卡落地。</li>";
    return;
  }
  els.timeline.innerHTML = state.history.map((item) => `<li>S${item.semester} · ${item.tag} · ${item.choice}</li>`).join("");
}

function renderBestiary() {
  if (!state) {
    els.bestiary.innerHTML = bestiary.slice(0, 4).map((item) => `
      <div class="myth">
        <strong>？？？</strong>
        <span>${item.hint}</span>
      </div>
    `).join("");
    return;
  }
  els.bestiary.innerHTML = bestiary.map((item) => {
    const unlocked = state.myths.has(item.id);
    return `
      <div class="myth ${unlocked ? "unlocked" : ""}">
        <strong>${unlocked ? item.name : "？？？"}</strong>
        <span>${unlocked ? "已收录进本局荒诞档案。" : item.hint}</span>
      </div>
    `;
  }).join("");
}

function render() {
  updateSeedLabel();
  if (!state) {
    els.semester.textContent = "-";
    els.status.textContent = "等待开局";
    els.mood.textContent = "尚未抽取";
    els.combo.textContent = "尚未形成";
    els.actionsLeft.textContent = "-";
    els.economy.textContent = "-";
    els.rank.textContent = "未入职";
    els.crisis.textContent = "--";
    renderStats();
    renderProjects();
    renderTrajectory();
    renderAchievements();
    renderTimeline();
    renderBestiary();
    return;
  }
  const maxSemester = getMaxSemester();
  const crisis = getCrisisScore();
  els.semester.textContent = `${Math.min(state.semester, maxSemester)} / ${maxSemester}`;
  els.status.textContent = state.finished ? "结局生成" : state.stats.health <= 25 ? "健康预警" : state.stats.luck <= 25 ? "运气偏冷" : "勉强运转";
  els.mood.textContent = state.mood.name;
  els.combo.textContent = getCombo();
  els.actionsLeft.textContent = `${state.actionsLeft} AP`;
  els.economy.textContent = `${state.budget} / ${state.energy}`;
  els.rank.textContent = getRank();
  els.crisis.textContent = crisis >= 70 ? "红色" : crisis >= 40 ? "橙色" : "绿色";
  renderStats();
  renderProjects();
  renderTrajectory();
  renderAchievements();
  renderTimeline();
  renderBestiary();
  els.log.textContent = ["faculty-survival.log", state.mood.memo, ...state.log.slice(0, 8)].join("\n");
}

els.profile.addEventListener("change", updateProfileNote);
els.mode.addEventListener("change", updateProfileNote);
els.startBtn.addEventListener("click", startGame);
els.startHeroBtn.addEventListener("click", startGame);
els.restartBtn.addEventListener("click", startGame);
els.seedBtn.addEventListener("click", reseed);
els.dailySeedBtn.addEventListener("click", useDailySeed);
els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.shareText.value);
    els.copyBtn.textContent = "已复制";
    setTimeout(() => { els.copyBtn.textContent = "复制结局文本"; }, 1200);
  } catch {
    els.shareText.select();
  }
});

updateProfileNote();
updateSeedLabel();
renderTrajectory();
render();

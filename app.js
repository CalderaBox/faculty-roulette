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
    semesters: 12,
    multiplier: 1,
    bonus: {},
    rule: "普通难度。系统不友善，但还没有完全拟人化。"
  },
  publish: {
    label: "非升即走模式",
    semesters: 14,
    multiplier: 1.18,
    bonus: { paper: 4, grant: 4, health: -10, luck: -4 },
    rule: "高压难度。正收益更甜，负收益更疼，结局更戏剧化。"
  },
  humane: {
    label: "理想学院模式",
    semesters: 12,
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

const chainEvents = [
  {
    id: "paper-preprint",
    tag: "Paper Arc",
    risk: "high",
    unlock: (s) => s.projects.some((item) => item.id === "paper" && item.completeDone),
    title: "你的预印本开始在圈内乱窜",
    text: "有人在群里转发了你的预印本。赞美和误解一起涌来，你突然意识到自己真的把东西发出去了。",
    choices: [
      { text: "立刻补一版说明文档", delta: { paper: 8, health: -3, luck: 2 }, flag: "paper_clarity", log: "你用一夜换来了少一点误读。", memo: "被看见并不总是纯收益。" },
      { text: "保持沉默，观察它自行传播", delta: { luck: 7, service: -2, paper: 3 }, flag: "paper_wave", log: "讨论开始自行繁殖，方向也开始失控。", memo: "传播和理解从来不是同一件事。" },
      { text: "干脆顺势做一个公开演讲", delta: { teaching: 6, paper: 5, health: -4 }, flag: "paper_stage", log: "你发现自己也许不仅在写论文，也在塑造一个位置。", memo: "台前的你和文稿里的你并不完全相同。" }
    ]
  },
  {
    id: "grant-program-officer",
    tag: "Grant Arc",
    risk: "high",
    unlock: (s) => s.projects.some((item) => item.id === "grant" && item.completeDone),
    title: "项目官在会后叫住了你",
    text: "她说你的方向有趣，但问了一个你最怕被问到的问题：如果只给你一半资源，你还做什么？",
    choices: [
      { text: "砍掉野心，保住主轴", delta: { grant: 10, paper: -2, luck: 1 }, flag: "grant_core", log: "你第一次觉得克制也可以很锋利。", memo: "不是所有放弃都算妥协。" },
      { text: "赌一把完整蓝图", delta: { grant: 12, health: -5, luck: -2 }, flag: "grant_gamble", log: "你在逻辑上站住了，但心跳没有。", memo: "宏图的代价往往由肉身支付。" },
      { text: "把学生培养写成核心价值", delta: { teaching: 5, grant: 7, service: 2 }, flag: "grant_people", log: "她点头的那一下比任何模板都重要。", memo: "有时候人本身就是项目的理由。" }
    ]
  },
  {
    id: "teaching-course-fork",
    tag: "Teaching Arc",
    risk: "medium",
    unlock: (s) => s.projects.some((item) => item.id === "teaching" && item.completeDone),
    title: "学生把你的课程二创了",
    text: "有人把你讲过的一套框架做成了可视化小工具，还在学院群里火了。你要决定这算不算你的成果。",
    choices: [
      { text: "公开夸学生，把 spotlight 给出去", delta: { teaching: 9, luck: 4, paper: -1 }, flag: "teaching_generous", log: "学生第一次真切地感到自己被看见。", memo: "位置让出去，有时会换回更大的位置。" },
      { text: "把它纳入你的课程品牌", delta: { teaching: 7, service: 3, luck: -2 }, flag: "teaching_brand", log: "你的课程开始像一个可识别的名字。", memo: "品牌感和控制欲常常共生。" },
      { text: "顺势写成教学论文", delta: { teaching: 4, paper: 8, health: -2 }, flag: "teaching_publish", log: "你把课堂里的火花压成了可引用格式。", memo: "好教学有时也能变成研究对象。" }
    ]
  },
  {
    id: "boundary-lightweight",
    tag: "Boundary Arc",
    risk: "medium",
    unlock: (s) => s.projects.some((item) => item.id === "boundary" && item.completeDone),
    title: "那封“轻量级任务”邮件又来了",
    text: "这次你比上次更早看穿了它，但拒绝的代价也更真实。你知道自己正在测试新的边界系统。",
    choices: [
      { text: "明确列出可接受范围", delta: { health: 8, service: -4, luck: 2 }, flag: "boundary_clean", log: "你第一次在不内疚的情况下说了不。", memo: "清晰不是攻击，清晰只是清晰。" },
      { text: "接受，但要求交换资源", delta: { service: 5, budget: 0, luck: 4 }, flag: "boundary_trade", log: "你把任务谈成了一笔交易，而不是献祭。", memo: "边界不是墙，也可以是价格表。" },
      { text: "转化成制度建议", delta: { service: 7, health: -2, teaching: 2 }, flag: "boundary_system", log: "问题没有消失，但它第一次被写进了系统。", memo: "把个体问题转成制度语言，是另一种抵抗。" }
    ]
  }
];

const hauntingEvents = [
  {
    id: "haunt-folder",
    tag: "Archive",
    risk: "haunting",
    stage: 1,
    title: "档案室里多出了一份你的材料",
    text: "深夜去档案室找旧表格时，你在最下层抽屉里看到一份写着你名字的材料。封面日期是明年，里面夹着还没发生过的审稿意见。",
    choices: [
      { text: "把材料整份带走", delta: { luck: 5, health: -3, paper: 4 }, ghost: "future_file", log: "你把未来塞进了背包，回程路上一直觉得它在变重。", memo: "有些信息不是给现在的你准备的。" },
      { text: "只抄下最关键的一页", delta: { paper: 6, health: -1, service: -1 }, ghost: "copied_margin", log: "你带走了一页复印件，原件却像从未存在过。", memo: "怪谈也会做版本控制。" },
      { text: "关上抽屉，当作没看见", delta: { health: 3, luck: -4 }, ghost: "closed_drawer", log: "你关上抽屉时听到里面有纸张自行翻页。", memo: "拒绝知道，不等于事情会停下。" }
    ]
  },
  {
    id: "haunt-dataset",
    tag: "Instrument",
    risk: "haunting",
    stage: 2,
    title: "仪器吐出了一份没人做过的数据",
    text: "凌晨的仪器在无人操作时自动导出了一组极其漂亮的数据。文件作者署名是一个三年前离开的学生，而你确信她从没做过这个实验。",
    choices: [
      { text: "把它接进当前论文", delta: { paper: 10, luck: 3, health: -5 }, ghost: "borrowed_data", log: "数据完美得过分，你开始害怕它真的成立。", memo: "最顺手的结果往往最不干净。" },
      { text: "沿着作者名去查旧硬盘", delta: { paper: 4, grant: 3, luck: 5 }, ghost: "old_disk", log: "你找到了一块旧硬盘，里面日期全部比系统时间早一天。", memo: "硬盘不会说话，但时间戳会。" },
      { text: "立刻删掉并重装系统", delta: { health: 2, luck: -5, service: 2 }, ghost: "purge_run", log: "你删掉了文件，第二天它出现在共享盘里。", memo: "技术性的删除，对怪谈不总是有效。" }
    ]
  },
  {
    id: "haunt-mail",
    tag: "Mailbox",
    risk: "haunting",
    stage: 3,
    title: "你收到了自己明天发出的邮件",
    text: "凌晨 3:14，一封来自你自己的邮件出现在收件箱。发送时间是明天，正文只有一句话：不要让第七层亮灯。",
    choices: [
      { text: "回复这封邮件", delta: { service: 1, luck: 7, health: -2 }, ghost: "replied_future", log: "你收到自动回执：谢谢，你已经回复过了。", memo: "通信一旦闭环，时间就会开始打结。" },
      { text: "转发给最信任的同事", delta: { teaching: 2, health: 1, luck: -3 }, ghost: "shared_mail", log: "同事说她没看到正文，只有一个空白附件。", memo: "不是所有证据都愿意被第二个人看见。" },
      { text: "带着它上七楼看看", delta: { health: -6, luck: 4, paper: 2 }, ghost: "visited_floor", log: "七楼整层都黑着，只有尽头那盏灯像在等你。", memo: "有些楼层平时存在，深夜才真正开放。" }
    ]
  },
  {
    id: "haunt-minutes",
    tag: "Minutes",
    risk: "haunting",
    stage: 4,
    title: "会议纪要记录了你没参加过的发言",
    text: "学院发来的会议纪要里，详细记录了你那天根本不在场时说过的话。更糟的是，那些发言比你平时更锋利，也更像你真正想说的。",
    choices: [
      { text: "承认那就是你会说的话", delta: { service: 5, health: -3, luck: 4 }, ghost: "owned_minutes", log: "你开始怀疑，平时开会的那个你是不是才是影子。", memo: "怪谈有时不是制造另一个你，而是替你更诚实。" },
      { text: "要求学院更正纪要", delta: { service: -3, health: 2, luck: -2 }, ghost: "corrected_minutes", log: "秘书回信说：已按你当时原意修正。", memo: "当系统非常确定你出现过时，辩解会显得很薄。" },
      { text: "把纪要里的观点写进真实提案", delta: { grant: 8, paper: 3, health: -2 }, ghost: "used_minutes", log: "提案忽然完整了，像那份纪要一直在替你打草稿。", memo: "偷用幽灵版本的自己，后果通常不会立刻出现。" }
    ]
  },
  {
    id: "haunt-basement",
    tag: "Basement",
    risk: "haunting",
    stage: 5,
    title: "地下层办公室里坐着一个已经上岸的你",
    text: "学期末，你顺着匿名打印出的平面图走到地下层尽头。那间不存在于楼层示意里的办公室里，坐着一个明显更成功、也更安静的你。他把一份署好名的 offer 推到桌上，说只要你承认哪一份经历才是真的。",
    choices: [
      { text: "签字，换取那份平稳人生", delta: { luck: 10, health: 6, teaching: -6 }, ghost: "signed_offer", log: "你签完字后，对方笑了一下，像把某种职责还给了你。", memo: "每一种稳定都在别处留下了欠条。" },
      { text: "拒绝签字，带着现有一切离开", delta: { health: -4, paper: 5, grant: 5 }, ghost: "walked_out", log: "你离开时身后有人轻轻说：那就继续活成未完成稿。", memo: "拒绝答案，往往意味着接受开放结局。" },
      { text: "把桌上的 offer 折成纸船带走", delta: { luck: 6, paper: 4, service: -3 }, ghost: "folded_offer", log: "纸船在洗手池里自己漂了很久，没有沉。", memo: "怪谈最怕的，也许是被你改写成别的用途。" }
    ]
  },
  {
    id: "haunt-citation",
    tag: "Citation",
    risk: "haunting",
    stage: 6,
    title: "你被一篇还没写出的论文引用了",
    text: "数据库里突然出现一条引用记录，引用的是你尚未完成的文章，而且精准批评了你下一版才会犯的错误。",
    choices: [
      { text: "照着批评提前修正", delta: { paper: 8, luck: 4, health: -2 }, ghost: "future_citation", log: "你第一次在错误发生前就改掉了它。", memo: "当批评来自未来时，谦逊会变得很奇怪。" },
      { text: "追查这篇不存在的论文", delta: { grant: 4, luck: 6, service: -2 }, ghost: "citation_hunt", log: "索引页尽头有一个空白作者栏，只写着你的工号。", memo: "有些引用不是在文献里生成的。" },
      { text: "把它打印出来贴在桌前", delta: { teaching: 3, health: -1, paper: 5 }, ghost: "citation_altar", log: "纸张边缘每天都会多一行批注。", memo: "把异常变成工作流，是一种危险的适应。" }
    ]
  },
  {
    id: "haunt-student",
    tag: "Student Dream",
    risk: "haunting",
    stage: 7,
    title: "学生讲述了你没有做过的组会",
    text: "学生说昨晚的组会很有收获，还复述了你根本没讲过的话。更糟的是，那段话和你最近反复做的梦一字不差。",
    choices: [
      { text: "顺着她的话继续追问", delta: { teaching: 7, luck: 4, health: -3 }, ghost: "dream_meeting", log: "她画出的白板结构，和你梦里的一模一样。", memo: "梦一旦被第二个人证实，就不再只是梦。" },
      { text: "让她把记忆写下来", delta: { paper: 4, teaching: 4, service: 1 }, ghost: "written_dream", log: "她交来的记录最后一页，是你从未见过的签名。", memo: "书面材料会让怪谈显得更像证据。" },
      { text: "严肃纠正：昨晚没有组会", delta: { health: 2, luck: -4, teaching: -2 }, ghost: "denied_meeting", log: "她沉默了几秒，问你是不是最近太累。", memo: "当只有你记得现实版本时，现实会变得很孤单。" }
    ]
  },
  {
    id: "haunt-printer",
    tag: "Printer",
    risk: "haunting",
    stage: 8,
    title: "打印机吐出了一份你的讣告",
    text: "你只是想打项目预算，打印机却连着吐出三页排版很正式的讣告。上面的研究方向、论文数量和追悼会流程都精准得令人不适。",
    choices: [
      { text: "把它锁进抽屉继续工作", delta: { grant: 6, health: -4, luck: 2 }, ghost: "locked_obit", log: "抽屉从里面传来纸张缓慢折叠的声音。", memo: "有些文件被归档后才开始活动。" },
      { text: "逐段核对其中的履历", delta: { paper: 6, service: 2, health: -2 }, ghost: "read_obit", log: "你发现里面有两篇论文连标题都还没想好。", memo: "最令人害怕的不是死亡，而是文风。" },
      { text: "把它改成自己的个人陈述", delta: { luck: 5, paper: 5, service: -2 }, ghost: "rewrote_obit", log: "你改得越认真，那份文本就越像真的在等你。", memo: "把讣告改成自述，也许是最过分的一种反抗。" }
    ]
  },
  {
    id: "haunt-map",
    tag: "Map",
    risk: "haunting",
    stage: 9,
    title: "校园地图每晚都会少一层楼",
    text: "教学楼平面图开始在深夜更新。先是少了一层，再是多出一段走廊，最后你的办公室被标在了“暂不开放区域”。",
    choices: [
      { text: "照着新地图去走一遍", delta: { health: -5, luck: 6, teaching: 2 }, ghost: "walked_map", log: "你走到尽头时，看见了写着自己名字的临时门牌。", memo: "地图不是用来描述空间的，它也可以分配空间。" },
      { text: "把地图发到群里求证", delta: { service: 4, luck: -3, teaching: 1 }, ghost: "shared_map", log: "别人看到的版本和你的完全不同。", memo: "共享并不总意味着共识。" },
      { text: "偷偷保存每天的变化", delta: { paper: 4, grant: 2, luck: 4 }, ghost: "saved_map", log: "第九天后，地图开始主动给文件命名。", memo: "记录异常，本身也会被异常记录。" }
    ]
  },
  {
    id: "haunt-voice",
    tag: "Voice",
    risk: "haunting",
    stage: 10,
    title: "答辩录像里出现了不属于任何人的声音",
    text: "你回看学生答辩录像，发现提问环节里混进了一道声音。它既不像你，也不像任何老师，却提前说出了答辩人下一页的标题。",
    choices: [
      { text: "把整段音轨拆出来分析", delta: { paper: 5, luck: 5, health: -3 }, ghost: "isolated_voice", log: "频谱图里有一列峰值刚好拼出你的姓名首字母。", memo: "声音在被看见之后会变得更具体。" },
      { text: "问学生是否也听见了", delta: { teaching: 6, health: -1, luck: 2 }, ghost: "shared_voice", log: "学生说她以为那是你给的提示。", memo: "怪谈有时通过教学完成传播。" },
      { text: "直接删掉那一分钟录像", delta: { health: 2, luck: -5, service: 1 }, ghost: "deleted_voice", log: "第二天备份盘里多出了三份同名文件。", memo: "删除对声音的效果，比对纸张更差。" }
    ]
  },
  {
    id: "haunt-review",
    tag: "Review",
    risk: "haunting",
    stage: 11,
    title: "审稿系统把你列成了自己的审稿人",
    text: "投稿系统自动给你发来审稿邀请，稿件作者是你，审稿人也是你。附件里的匿名意见充满了你从未承认过、但全都属实的批评。",
    choices: [
      { text: "认真审这篇‘自己的稿子’", delta: { paper: 9, health: -4, luck: 3 }, ghost: "self_review", log: "你写出了最诚实的一份审稿意见，也最像遗书。", memo: "匿名之后，人会比平时更像自己。" },
      { text: "接受意见，但拒绝继续投稿", delta: { health: 5, paper: -2, luck: 1 }, ghost: "withheld_paper", log: "你第一次觉得不发表也是一种结局。", memo: "撤回有时不是退缩，而是止血。" },
      { text: "把审稿意见发给未来的自己", delta: { luck: 6, service: -1, paper: 4 }, ghost: "mailed_review", log: "发送成功后，收件箱里少了一封旧邮件。", memo: "当时间开始收发自己时，顺序就不再稳定。" }
    ]
  },
  {
    id: "haunt-finalroom",
    tag: "Threshold",
    risk: "haunting",
    stage: 12,
    title: "你终于看见了第七层真正亮灯的房间",
    text: "学年最后一夜，你顺着所有异常留下的坐标来到第七层尽头。那间房里摆着你的工位、你的杯子、你的未改完稿件，只是灰尘说明它已经被使用很多年了。",
    choices: [
      { text: "坐下，把未改完的稿继续改完", delta: { paper: 10, luck: 4, health: -4 }, ghost: "sat_down", log: "你坐下那一刻，整栋楼像终于校准到了某个版本。", memo: "完成稿件不一定意味着完成你自己。" },
      { text: "带走杯子和草稿，转身离开", delta: { health: 4, luck: 5, service: -2 }, ghost: "carried_back", log: "你走出房间时，门牌上的名字慢慢淡掉了。", memo: "带走证物，有时就是拒绝被收录。" },
      { text: "关灯，把门反锁", delta: { health: 2, grant: 4, luck: 6 }, ghost: "locked_room", log: "灯灭之后，楼里每一扇窗都映出了你的背影。", memo: "结束一个入口，不代表你关掉了整栋楼。" }
    ]
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
  { id: "lean", label: "精益存活", test: (s) => s.finished && s.budget >= 3 && s.energy >= 2 },
  { id: "story", label: "剧情穿透者", test: (s) => s.storyFlags.size >= 3 }
];

const defaultMaxSemester = 12;
let state = null;
let seed = Date.now() % 100000;

const storyProgressions = [
  "你第一次注意到学院夜里会比白天多出一条走廊。",
  "共享盘里出现了一个以你命名、但你从未创建过的文件夹。",
  "打印机开始优先输出与你有关、却尚未发生的材料。",
  "有人在会议上引用了你没讲过的话，而所有人都觉得那很正常。",
  "第七层的灯第一次在你离开后才亮起。",
  "你开始分不清哪些数据是结果，哪些数据是在等你成为结果。",
  "学生、同事和系统逐渐各自记住了不同版本的你。",
  "你发现最可怕的不是异常本身，而是异常越来越高效。",
  "所有证据都开始互相印证，只有现实版本显得越来越单薄。",
  "你已经能提前猜到下一次怪事会从哪个介质里钻出来。",
  "学院像一台会自我修补的机器，而你正在它的修补日志里。",
  "到最后，你意识到自己经历的不是事故，而是一套完整且正在运行的叙事。"
];

const stageAftermaths = [
  [
    "你把材料带回办公室后，它自己从骑缝章里长出第二页，内容是三个月后财务处会退回一笔你还没申请到的经费。第二天财务老师路过，顺手问你那份盖好章的版本能不能也抄送她一份。",
    "复印件在凌晨两点悄悄把页脚改成了“内部流转件”，连订书钉位置都比你常用的更熟练。次日系秘书看了一眼，说你终于学会按学院格式做人了。",
    "你关上抽屉以后，抽屉自己从里面锁死了。保卫处来了三个人研究半天，最后给出的解释是“老楼有记忆”，然后把这句写进了维修单。"
  ],
  [
    "你把数据接进论文后，图表漂亮得像提前做过宣传。第二天合作者夸你终于学会讲故事，而你开始怀疑故事是不是先于实验出生。",
    "旧硬盘里除了数据，还有一份被删到只剩标题的组会纪要，标题写着“请未来的你别再重跑这一组”。机器没声音，但讽刺意味已经很完整。",
    "你重装完系统，桌面干净得像刚入职那天。唯一没被删掉的是回收站里的进度条，它一直显示“正在恢复学院默认配置”。"
  ],
  [
    "回信发出去三分钟，发件箱里多了一封你写给下个月自己的提醒：七楼的灯不是用来照明，是用来点名。系统很贴心，已经帮你加了星标。",
    "同事说她只收到一个空附件，但附件大小显示 14MB。她随口开玩笑问你是不是把 tenure 的原件发来了，办公室里刚好停电了一次。",
    "你走到七楼尽头，发现那盏灯照着一排空工位，每个工位上都摆着一杯已经凉透的咖啡。门牌写着“青年人才支持区”，但门锁只认凌晨三点之后的脚步声。"
  ],
  [
    "你承认那段发言像你之后，学院开始更爱请你参会，因为“你终于愿意稳定输出观点”。只是你越来越分不清，是你在开会，还是纪要先替你发过言。",
    "你要求修正纪要，秘书很快回了最新版。新版删掉了那段发言，却顺手补上了你没参加过的鼓掌环节，逻辑上甚至更自洽了一点。",
    "你把纪要里的句子写进提案后，评审意见罕见地只提了一条：建议申请人保持这种成熟口吻。你第一次意识到，最会写提案的也许不是你，而是那个替你发言的记录员。"
  ],
  [
    "你签完字，桌上的钢笔自动滚回了原位，像一场流程闭环。离开地下层时，电梯镜子里那个更成功的你还在整理你的领带，手法比你本人老练得多。",
    "你拒绝签字走出去，次日邮箱里出现一封未署名 congratulation，祝贺你继续保留了不稳定版本的职业生涯。附件是一张体检预约单，时间已经替你选好。",
    "你把 offer 折成纸船带走后，它在洗手池里绕着下水口转了半小时没沉。午后院长突然问你要不要考虑承担一个“更适合长期发展的额外角色”，语气像在发第二份录取通知。"
  ],
  [
    "你照着未来批评提前修稿，果然躲过了那个错误，却顺手犯了一个更高级的新错。审稿系统像很满意，第二轮意见只回了四个字：继续成长。",
    "你追查那篇不存在的论文，最后在数据库死角里发现一页作者说明：通讯作者待系统生成。你笑了一下，因为这比很多真实论文还诚实。",
    "你把那条引文贴在桌前之后，它每天都多一条边注，像有人在远程带教。最离谱的是边注里开始提醒你少喝咖啡，口吻像一位终于看不下去的审稿人。"
  ],
  [
    "你顺着学生的话继续追问，她把白板结构一笔不差地画了出来，连你梦里没记住的箭头都画对了。组里没人觉得奇怪，只夸这次组会终于有效率了。",
    "学生交来的记录最后一页写着“本纪要经两位导师确认”，另一位导师栏里是你的名字，但笔迹明显比你休息得更充分。你开始怀疑睡眠是不是一种共同作者机制。",
    "你纠正说昨晚没有组会，学生愣了两秒，反过来问你是不是最近太累。她语气非常礼貌，像在给一位记忆衰退的 PI 留最后体面。"
  ],
  [
    "你把讣告锁进抽屉继续工作，当晚抽屉里传来纸张自行翻页的细响。第二天它被打印成了学院主页样式，只差发布日期和鲜花图片。",
    "你逐段核对讣告履历，发现其中两篇代表作还没写，但摘要已经比你常用的风格克制许多。你不得不承认，那份文风像一个更会过同行评审的你。",
    "你把讣告改成个人陈述后，文本居然更通顺了。招聘系统那天晚上自动给你推送了三个职位，像是认为你终于学会了正确介绍自己的消失方式。"
  ],
  [
    "你照着新地图走了一圈，走回来的时候楼层数和出发时不一样。保洁阿姨却很自然地告诉你，老楼一直有弹性，尤其到年底评估季。",
    "你把地图发群里求证，群里每个人看到的版本都不一样。最先回复的人说这很正常，学院本来就按经费等级分配现实。",
    "你开始保存每天的地图变化，第九天后文件自己学会命名，把今天的版本标成“可申报空间”。你第一次见到建筑学和行政学在深夜如此团结。"
  ],
  [
    "你反复听那段答辩录音，发现那道陌生声音专挑最尴尬的问题先说出来，像提前帮整个房间节省了时间。第二天学院通知你担任新的答辩秘书，说你最近很懂流程。",
    "你把录音做成文本，文本在转写完成后多出一列“系统建议提问”。列名非常体面，内容却像一个读过所有隐性规则的幽灵顾问。",
    "你删掉那段声音后重新导出视频，画面里每个人都慢了半拍，只有空白椅子正好同步。你忽然理解了什么叫会议质量控制。"
  ],
  [
    "系统把你分配成自己论文的审稿人，你认真写了第一条意见，提交时页面提示：感谢你继续维护本刊学术标准。你从没想过自省还能按件收费。",
    "你试图申诉冲突回避，编辑部回信极快：经核查，审稿人与你观点高度一致，风险可控。文字温柔得像一把已经写好模板的刀。",
    "你披着匿名身份给自己放行，接收邮件却写着“感谢作者兼评审兼后续争议处理联系人”。三合一的效率让你第一次真切感到现代学术工业的流畅。"
  ],
  [
    "你走进七楼那间亮着灯的房间，看到桌上放着一套已经积灰的工牌，姓名是你，照片也是你，只是眼神比你更习惯流程。门后的日历停在你尚未经历的某个聘期节点。",
    "你把那张积灰工牌翻过来，背面写着“本岗位负责替系统解释系统”。回身时楼道里传来掌声，但整层楼的门牌都还是空白的。",
    "你没有进去，只把门缝拍了张照。第二天照片自动进了学院宣传素材库，分类名称叫“青年教师风采候选”，构图比你亲自拍的更像正式结局。"
  ]
];

const endingFamilies = [
  {
    name: "档案返修处",
    title: "被修订的履历",
    setup: "后来你发现学院真正稳定运作的不是制度，而是档案。每份简历、纪要和推荐表都会在夜里互相校对，直到把人修成适合归档的版本。",
    mapping: "白天大家称之为流程完善，夜里它更像一门文书炼金术：先删去犹豫，再补上成果，最后盖章说你一直如此。"
  },
  {
    name: "预审雨棚",
    title: "永远在门口",
    setup: "你被留在一座巨大的预审雨棚下面，所有申请都能往前走半步，却始终不正式进门。每扇门后都有人探头说只差一个附件。",
    mapping: "学院很爱这种气候，因为人在等待时最配合，像一封永远写在“待完善”状态里的邮件。"
  },
  {
    name: "共享盘地下河",
    title: "文件自己会游泳",
    setup: "你逐渐明白，共享盘不是存储空间，而是一条地下河。课题、提案、截图和传闻都会顺流漂移，最后在某个最合适的领导讲话里靠岸。",
    mapping: "谁先创建文件并不重要，重要的是谁在涨水那天刚好站在汇报室里。"
  },
  {
    name: "指标标本室",
    title: "活体考核样本",
    setup: "学院把所有人都做成指标标本，钉在透明柜里，柜门上写着可量化、可比较、可复现。你偶尔怀疑自己是不是也有编号，只是平时看不见。",
    mapping: "好处是每个人看起来都非常客观，坏处是客观到后来连呼吸都像一条可以横向对比的数据。"
  },
  {
    name: "会议回声井",
    title: "发言先于本人",
    setup: "你坠入一口专门回收会议用语的深井，任何观点只要掉进去两次，就会以更稳妥、更可引用的形式弹回来，顺便挂上你的名字。",
    mapping: "这口井最擅长做的不是讨论，而是把所有活人训练成纪要风格。"
  },
  {
    name: "预算折叠层",
    title: "经费的几何学",
    setup: "你闯进预算折叠层之后，钱不再按金额存在，而按表格结构存在。一个数字只要放进正确单元格，就能比现实先获得合理性。",
    mapping: "财务从不说这叫怪谈，他们更喜欢说这是口径统一。"
  },
  {
    name: "仪器养殖场",
    title: "数据反向饲养人",
    setup: "你看见仪器像一排静静进食的动物，吃进去的是样品，吐出来的是职业命运。偶尔它们也吐出人没做过、但制度很需要的数据。",
    mapping: "实验室于是有了新的默契：结果不一定来自实验，但一定要来自机器。"
  },
  {
    name: "引用香火台",
    title: "被供奉的脚注",
    setup: "你把论文和引文摆上香火台之后，才知道引用不只是学术关系，也是一种供奉秩序。被引用得越多，越像被很多看不见的手合力塑形。",
    mapping: "最灵验的往往不是最好的文章，而是最先学会自己给自己烧香的那类。"
  },
  {
    name: "伦理镜像库",
    title: "合规的影子",
    setup: "伦理镜像库里保存着每个项目更合规、更得体、也更不像人的版本。你有时会进去借一点口径，再假装那一直是你的原话。",
    mapping: "这地方让一切都显得合法，代价只是现实要往旁边稍微挪一挪。"
  },
  {
    name: "招聘回廊",
    title: "岗位会认人",
    setup: "在招聘回廊里，职位并不是空着等人，而是先挑中一种性格，再慢慢长出对应的人。你走过时，墙上很多门牌都会轻轻亮一下。",
    mapping: "所以大家总说岗位匹配，其实更像门锁先学会了谁的脚步声。"
  },
  {
    name: "署名迁徙带",
    title: "名字有自己的路线",
    setup: "你来到署名迁徙带后才知道，名字并不总跟着人走。它们会顺着课题、项目、群聊和会议嘉宾名单迁徙，落在最需要体面的地方。",
    mapping: "署名秩序因此像一种候鸟学，只是每年都有人突然发现自己没飞到该去的表格里。"
  },
  {
    name: "绩效天象馆",
    title: "天气就是考核",
    setup: "绩效天象馆把学院所有天气都解释成考核。晴天叫窗口期，阴天叫爬坡期，闪电则是新的专项通知。",
    mapping: "人在这种气候里待久了，会误以为自己真的只是某张年度图表上的一片云。"
  }
];

const endingFates = [
  {
    name: "借壳批复",
    turn: "最后系统给了你一份极为体面的批复，但批复同意的不是你本人，而是你在流程里留下的那个更听话的壳。你继续上班、开会、带学生，直到有一天门禁识别你的速度快得像已经认识你很多年。"
  },
  {
    name: "空白返修",
    turn: "你拿到的结局是一张空白返修单，学院什么都没说，只在每个栏位预先打了勾。你于是学会一边补材料，一边猜测自己究竟是在完善项目，还是在完善可被项目使用的人形。"
  },
  {
    name: "自动挂名",
    turn: "后来很多成果上都会自动出现你的名字，像系统终于决定替你节约社交能耗。麻烦在于，你也开始在自己没做过的工作里看见熟悉的文风，仿佛名字比本人更早学会了合作。"
  },
  {
    name: "走廊 tenure",
    turn: "你没有拿到正式房间，却在一条长期不过期的走廊里安顿下来。每次有人路过都会向你点头，像默认你就是某种制度缓冲层的常驻讲解员。"
  },
  {
    name: "指标超生",
    turn: "你的指标后来开始自己繁殖，一个项目生出三个附件，一条成果拆成五项贡献，一份汇报长出七个版本。大家都夸你产能稳定，只有你知道那更像一场数据多胞胎现象。"
  },
  {
    name: "预算转世",
    turn: "那些没批下来的经费并没有真的消失，它们只是转世成别的口径重新回来。你逐渐学会从差旅、设备和劳务的缝里辨认同一笔钱的前世今生。"
  },
  {
    name: "教学显灵",
    turn: "有一学期课堂突然变得异常灵验，你随口讲的例子都会在期末变成学生报告、社团项目和学院新闻。直到某次你半开玩笑说别让七楼亮灯，整栋楼真的安静了一周。"
  },
  {
    name: "审稿回魂",
    turn: "你最终变成了一位极受欢迎的匿名评审，因为所有意见都准确、克制、还带一点人情味。奇怪的是，你后来读到其中几条时，总能想起自己曾在哪个深夜被它们提前使用过。"
  },
  {
    name: "系统续命",
    turn: "最离奇的结局是，学院靠你续了一口命。不是靠你的论文、基金或教学，而是靠你在异常发生时总能第一时间配合解释，于是整套系统比去年更健康地活了下来。"
  }
];

const ghostEchoes = {
  future_file: "那份来自未来的材料后来总在你需要签字前先到一步，像一位懂流程的快递员。",
  copied_margin: "你抄走的那一页边角不断增生批注，最后长成一套完整的内部口径。",
  closed_drawer: "那只抽屉再也没完全打开过，但每逢考核周都会从里面传出翻页声。",
  borrowed_data: "那组无人做过的数据时不时冒出来提醒你：漂亮结果也有自来水。",
  old_disk: "旧硬盘上的时间戳始终早一天，像提前替学院试跑了一遍命运。",
  purge_run: "被你删掉的文件学会了迁移，所以每次清理都更像一次搬家。",
  replied_future: "来自明天的回执越来越礼貌，像未来版本的你终于学会了行政语言。",
  shared_mail: "那封转发失败的邮件后来总以附件形式绕回来，仿佛证据只是不想走正门。",
  visited_floor: "七楼尽头那盏灯始终记得你的脚步频率，比门禁系统还念旧。",
  owned_minutes: "会议纪要替你保存了一种更锋利的发言人格，必要时会自动代班。",
  corrected_minutes: "被修正的纪要没消失，只是搬进了更高权限的文件夹。",
  used_minutes: "你借来的那几句成熟口吻后来在不同提案里自行循环引用。",
  signed_offer: "地下层那份 offer 没有过期，它只是改学会了在人事系统里换皮出现。",
  walked_out: "你离开地下层时带走了一阵不稳定气流，此后很多门都只开半扇。",
  folded_offer: "那只纸船偶尔会出现在洗手池边，像在催你继续把答案折小一点。",
  future_citation: "未来引文还在更新，说明未来对你仍有修改意见。",
  citation_hunt: "那条不存在的引文后来被越来越多人认真讨论，像空气突然拥有 DOI。",
  citation_altar: "桌前那张引文越贴越旧，内容却越来越新，十分符合学界传统。",
  dream_meeting: "学生口中的组会继续发生，只是参会人员名单总比现实完整一些。",
  written_dream: "那份梦境纪要被传抄了几轮后，大家都默认它属于正常科研材料。",
  denied_meeting: "你坚持现实版本的那天之后，很多人开始对你投来温柔但专业的担忧。",
  locked_obit: "抽屉里的讣告继续偷偷排版，像等一场更正式的发布会。",
  read_obit: "那份履历式讣告证明你连消失都可能被要求写得更像成果总结。",
  rewrote_obit: "你改写后的讣告太像求职陈述，以至于系统无法决定该把它投给谁。",
  walked_map: "新地图总愿意给你留一条路，只是路的尽头不一定在现实楼层。",
  shared_map: "群里看到的不同地图让你第一次相信制度确实按人分配现实。",
  saved_map: "被你保存的地图后来开始反过来保存你，把工位和去向一起归档。",
  heard_voice: "录音里的陌生声音总比全场更懂该在什么时候提哪种问题。",
  transcribed_voice: "那列系统建议提问后来长成了一套很会自我复制的话术。",
  muted_voice: "你删掉声音之后，空白椅子反而在录像里坐得越来越稳。",
  self_review: "你写给自己的审稿意见后来被证明是全流程里最诚恳的环节。",
  appealed_review: "编辑部那封温柔的拒绝申诉信，让你彻底理解了什么叫风险可控。",
  cleared_review: "你放行自己的那一刻，学术工业终于完成了一次完整闭环。",
  entered_finalroom: "第七层亮着灯的房间没有欢迎词，只有一套已经为你积灰的工牌。",
  turned_badge: "工牌背面的岗位说明短短一行，却足够解释整栋楼的沉默。",
  left_door: "那张门缝照片后来在宣传库里被裁得非常励志，几乎看不出原始用途。"
};

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
    storyFlags: new Set(),
    choiceTrace: [],
    chainSeen: new Set(),
    hauntSeen: new Set(),
    ghostFlags: [],
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
  const hauntEvent = hauntingEvents.find((event) => event.stage === state.semester && !state.hauntSeen.has(event.id));
  if (hauntEvent) {
    state.hauntSeen.add(hauntEvent.id);
    return hauntEvent;
  }
  const unlockedChains = chainEvents.filter((event) => event.unlock(state) && !state.chainSeen.has(event.id));
  if (unlockedChains.length > 0) {
    const chainEvent = unlockedChains[Math.floor(seededRandom() * unlockedChains.length)];
    state.chainSeen.add(chainEvent.id);
    return chainEvent;
  }
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
  if (choice.flag) state.storyFlags.add(choice.flag);
  if (choice.ghost) state.ghostFlags.push(choice.ghost);
  state.choiceTrace.push(index);
  const swing = Object.keys(delta).reduce((sum, key) => sum + Math.abs(state.stats[key] - before[key]), 0);
  const after = stageAftermaths[state.semester - 1]?.[index] || choice.memo;
  state.history.push({
    semester: state.semester,
    tag: state.current.tag,
    choice: choice.text,
    swing,
    delta,
    beat: storyProgressions[Math.min(state.semester - 1, storyProgressions.length - 1)],
    after
  });
  updateAchievements();
  state.log.unshift(`S${state.semester} ${state.current.tag}: ${choice.log}`);
  els.memoText.textContent = after;
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

function getEndingProfile() {
  const trace = state.choiceTrace.concat(Array(6).fill(0)).slice(0, 6);
  const familyIndex = ((((trace[0] * 3 + trace[1]) * 3 + trace[2]) * 3 + trace[3]) % endingFamilies.length);
  const fateIndex = trace[4] * 3 + trace[5];
  const archiveNumber = familyIndex * endingFates.length + fateIndex + 1;
  return {
    family: endingFamilies[familyIndex],
    fate: endingFates[fateIndex],
    familyIndex,
    fateIndex,
    archiveNumber
  };
}

function buildGhostEcho() {
  const seen = [...new Set(state.ghostFlags.slice(-3))];
  if (seen.length === 0) return "真正麻烦的是，学院后来把这一切统称为“情况已掌握”，仿佛命运只是一类可以归档的问题。";
  return seen.map((flag) => ghostEchoes[flag] || "异常继续沿着制度缝隙缓慢发酵。").join("");
}

function buildRouteDigest() {
  return state.history.slice(0, 6).map((item) => item.tag).join(" -> ");
}

function buildHauntingEnding() {
  const profile = getEndingProfile();
  const title = `第${String(profile.archiveNumber).padStart(3, "0")}号怪谈：${profile.family.name}·${profile.fate.name}`;
  const text = `${profile.family.setup}${profile.family.mapping}${profile.fate.turn}${buildGhostEcho()}`;
  return {
    ...profile,
    title,
    text
  };
}

function getRank() {
  if (!state) return "未入职";
  const total = getTotal();
  if (state.storyFlags.has("paper_stage") && state.storyFlags.has("grant_people") && state.storyFlags.has("boundary_clean")) {
    return "学院传说型青椒";
  }
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
  const ending = buildHauntingEnding();
  let text = ending.text;
  if (state.storyFlags.has("paper_stage") && state.storyFlags.has("grant_people") && state.storyFlags.has("boundary_clean")) {
    text = `${text} 与此同时，你没有顺从系统，也没有单纯逃离它。你把研究、学生和边界织成了一条自己的路，于是人们开始用你的名字描述某种罕见姿态。`;
  } else if (state.stats.health < 20) {
    text = `${text} 只是到了最后，你已经分不清自己更需要的是休息，还是维护。`;
  } else if (state.stats.paper > 78 && state.stats.grant > 68) {
    text = `${text} 论文和基金都站住了，代价是你现在听到 deadline 会自动握拳。`;
  } else if (state.stats.teaching > 78) {
    text = `${text} 但学生确实记得你讲过什么，也记得你某次说过“不要让第七层亮灯”。`;
  } else if (state.stats.luck > 76) {
    text = `${text} 你在多个不该过关的地方过关了。请谨慎使用这份好运。`;
  } else if (state.mode === modeSettings.publish && total > 390) {
    text = `${text} 你没有让高压系统变温柔，但你学会了在它露出牙齿时保持站立。`;
  } else if (state.mode === modeSettings.humane && state.stats.health > 70) {
    text = `${text} 传说中存在一种学院：事情仍然很多，但人不会被当成可替换耗材。你短暂抵达过那里。`;
  } else if (total < 275) {
    text = `${text} 这不是失败，只是你的学术操作系统需要重启。`;
  }

  updateAchievements();
  const unlocked = achievementRules.filter((item) => state.achievements.has(item.id)).map((item) => item.label);
  const completedProjects = state.projects.filter((item) => item.completeDone).map((item) => item.name);
  const route = [...state.storyFlags].slice(0, 4).join("、");
  const routeDigest = buildRouteDigest();
  const share = `我在《青椒轮盘 Faculty Roulette》里抽到了${ending.title}。\n头衔：${rank}\n论文${state.stats.paper} / 基金${state.stats.grant} / 教学${state.stats.teaching} / 服务${state.stats.service} / 健康${state.stats.health} / 运气${state.stats.luck}\n宇宙：${state.mood.name} / ${state.mode.label}\n前六步：${routeDigest}\n成就：${unlocked.length ? unlocked.join("、") : "暂无，但系统已经记住我"}`;
  els.endingTitle.textContent = ending.title;
  els.endingText.textContent = text;
  const unlockedMyths = bestiary.filter((item) => state.myths.has(item.id)).map((item) => item.name);
  els.diagnosisCard.innerHTML = `
    <h3>学术荒诞诊断书</h3>
    <dl>
      <dt>病例编号</dt><dd>${els.seedLabel.textContent}</dd>
      <dt>怪谈档案</dt><dd>${ending.title}</dd>
      <dt>诊断结果</dt><dd>${rank}</dd>
      <dt>主要症状</dt><dd>${state.mood.name}，${state.mode.label}</dd>
      <dt>目击传说</dt><dd>${unlockedMyths.length ? unlockedMyths.join("、") : "暂未目击，但墙里有声音"}</dd>
      <dt>完成项目</dt><dd>${completedProjects.length ? completedProjects.join("、") : "没有完成项目，但积累了很多解释"}</dd>
      <dt>剧情路径</dt><dd>${route || "普通幸存路线"}</dd>
      <dt>前六步轨迹</dt><dd>${routeDigest}</dd>
      <dt>108档位</dt><dd>${ending.archiveNumber} / 108</dd>
      <dt>怪谈阶段</dt><dd>${state.ghostFlags.length} / ${hauntingEvents.length}</dd>
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
  els.timeline.innerHTML = state.history.map((item) => `<li>S${item.semester} · ${item.tag} · ${item.choice}<br>${item.beat}<br>${item.after}</li>`).join("");
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

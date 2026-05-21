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

const profileLabels = {
  balanced: "均衡型青椒",
  paper: "论文冲刺型",
  grant: "基金焦虑型",
  teaching: "教学口碑型",
  stealth: "低调潜行型"
};

const introSceneByProfile = {
  balanced: "balanced_intro",
  paper: "paper_intro",
  grant: "grant_intro",
  teaching: "teaching_intro",
  stealth: "stealth_intro"
};

const profiles = {
  balanced: { paper: 52, grant: 48, teaching: 50, service: 42, health: 70, luck: 52 },
  paper: { paper: 68, grant: 40, teaching: 40, service: 34, health: 58, luck: 48 },
  grant: { paper: 42, grant: 70, teaching: 40, service: 46, health: 56, luck: 46 },
  teaching: { paper: 40, grant: 40, teaching: 72, service: 46, health: 64, luck: 50 },
  stealth: { paper: 44, grant: 42, teaching: 48, service: 30, health: 78, luck: 60 }
};

const profileNotes = {
  balanced: "你习惯把所有事情整理进可解释的表格里，所以学院格外喜欢把不可解释的东西送到你这里归档。",
  paper: "你看见走廊都像投稿系统的快捷入口，因此很多怪谈也会顺着引用链来拜访你。",
  grant: "你能从预算表里闻出焦味。问题是，预算表有时也会先闻到你。",
  teaching: "你在意课堂是不是真的发生过，因此课堂之外那些不该发生的东西会显得格外清楚。",
  stealth: "你擅长不出现在不该出现的名单里，但学院偶尔会因此怀疑你是不是已经存在于别的地方。"
};

const modeSettings = {
  standard: {
    label: "标准学术天气",
    turns: 14,
    multiplier: 1,
    bonus: {},
    rule: "系统仍然假装自己只是流程，但流程已经学会挑人了。"
  },
  publish: {
    label: "非升即走模式",
    turns: 15,
    multiplier: 1.15,
    bonus: { paper: 4, grant: 4, health: -8, luck: -2 },
    rule: "收益更甜，副作用更尖。怪谈尤其喜欢在这一档成熟。"
  },
  humane: {
    label: "理想学院模式",
    turns: 13,
    multiplier: 0.88,
    bonus: { health: 10, luck: 6, service: -2 },
    rule: "仍然荒诞，但至少没人会把二十件事说成轻量级支持。"
  }
};

const moods = [
  { name: "论文季风", spin: 25, bonus: { paper: 1 } },
  { name: "基金低压槽", spin: 86, bonus: { grant: 1 } },
  { name: "课堂晴转多云", spin: 148, bonus: { teaching: 1 } },
  { name: "服务性降雪", spin: 209, bonus: { service: 1 } },
  { name: "健康预警", spin: 270, bonus: { health: -1, luck: 1 } },
  { name: "走廊回声", spin: 331, bonus: { luck: 1 } }
];

const absurdRules = [
  {
    id: "reply-all",
    label: "本学期特殊规则：凡是看起来像“确认一下”的事情，都会额外抄送给未来的你。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "official") || hasTone(choice, "service")) {
        addDelta(delta, { service: 1, health: -1 });
      }
      return delta;
    }
  },
  {
    id: "deadline-fog",
    label: "本学期特殊规则：所有截止日期都往前走半步，只有疲劳留在原地。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "paper")) {
        addDelta(delta, { paper: 1, health: -1 });
      }
      if (hasTone(choice, "grant")) {
        addDelta(delta, { grant: 1, health: -1 });
      }
      return delta;
    }
  },
  {
    id: "quiet-hall",
    label: "本学期特殊规则：走廊里说得越少，系统越容易误判你已经同意。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "hide")) {
        addDelta(delta, { luck: 1 });
      }
      if (hasTone(choice, "question")) {
        addDelta(delta, { service: -1, luck: 1 });
      }
      return delta;
    }
  },
  {
    id: "kindness-tax",
    label: "本学期特殊规则：所有善意都会被算作额外工时，但学院依旧称之为自然发生。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "care") || hasTone(choice, "service")) {
        addDelta(delta, { health: -1, teaching: 1 });
      }
      return delta;
    }
  },
  {
    id: "budget-tide",
    label: "本学期特殊规则：预算像潮水一样涨落，只有表格知道退潮时谁还站在岸上。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "grant") || hasTone(choice, "official")) {
        addDelta(delta, { grant: 1 });
      }
      return delta;
    }
  },
  {
    id: "class-echo",
    label: "本学期特殊规则：课堂会替你记住说过的话，哪怕那堂课后来并不承认自己存在。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "teaching") || hasTone(choice, "care")) {
        addDelta(delta, { teaching: 1, luck: 1 });
      }
      return delta;
    }
  },
  {
    id: "mirror-hour",
    label: "本学期特殊规则：晚上九点后做出的决定，会先在玻璃里完成一次。",
    apply(choice) {
      const delta = {};
      if (hasTone(choice, "follow") || hasTone(choice, "hide")) {
        addDelta(delta, { luck: 1 });
      }
      return delta;
    }
  },
  {
    id: "small-task",
    label: "本学期特殊规则：凡被称作“小事”的请求，默认会拿走一格健康。",
    apply() {
      return { health: -1 };
    }
  }
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
    name: "镜面评审走廊",
    text: "你的经历最后被整理成一条会自我审稿的走廊。门一扇扇开过去，每扇门里都坐着一个提前读过你人生摘要的评审。"
  },
  {
    name: "预算水族馆",
    text: "财务办公室把你归入玻璃缸档案，所有经费流向都以鱼群的方式解释。你每改一次预算，水面上就浮出另一份口头意见。"
  },
  {
    name: "引用飞蛾季",
    text: "学院记得你是那个让引用飞蛾吃饱的人。后来飞蛾不再碰文献，只盯着所有还没来得及写出的段落。"
  },
  {
    name: "课程替身系",
    text: "你留下的不是课程，而是一套会自行开课的替身系统。投影仪先于教师到场，学生后来逐渐接受了这件事。"
  },
  {
    name: "服务菌丝网络",
    text: "每一项顺手帮忙最后都长出细丝，互相勾连，形成一张覆盖院系的温柔而耗电的网络。你只是其中最常被点亮的节点。"
  },
  {
    name: "伦理电梯井",
    text: "所有问题最终都掉进同一口井里，井壁贴满表单。电梯偶尔上来一次，带回来的永远是另一个版本的你刚刚勾选过的答案。"
  },
  {
    name: "夜班导师档案",
    text: "深夜之后，学院把你写进一份只在保安交接班时阅读的导师手册。里面所有建议都诚恳，但收件人总比现实晚半学期。"
  },
  {
    name: "未来会议纪要",
    text: "你的结局被印在会议纪要的第三页。那页从来不发给参会人，只在下次会议开始前静静躺在桌上，像某种提前完成的回声。"
  },
  {
    name: "地下层观察站",
    text: "B4 的门再也没有从地图上消失。后来大家都知道，那是专门用来观测学术天气和人员命运交叉干扰的观测站。"
  },
  {
    name: "门牌交换委员会",
    text: "门牌、头衔、职位和责任在这一档案里持续交换位置。唯一稳定的是，最后总有人发现自己坐到了原本属于你的位置。"
  },
  {
    name: "反向退休宴",
    text: "你的故事被保存成一场总在举办但从不彻底结束的退休宴。每次蛋糕切开，里面都会露出另一份仍在进行的工作安排。"
  },
  {
    name: "提前结项宇宙",
    text: "学院最终把你归类到提前结项宇宙：所有事情都像已经完成过一次，于是每个人都理直气壮地要求你再来一遍。"
  }
];

const endingFates = [
  {
    name: "被正式留档",
    text: "你没有离开系统，系统把你留在了页边。此后所有新老师都会在脚注里先读到你。"
  },
  {
    name: "看似上岸",
    text: "表面上，一切都像一次普通上岸。只是办公室窗玻璃会在傍晚把那套更早版本的经历反复放给你看。"
  },
  {
    name: "仍在返工",
    text: "你的结局并未结束，只是被标注成返工。于是时间线礼貌地后退半步，让你继续在同一页上修改。"
  },
  {
    name: "被学院复制",
    text: "你后来不再以单数出现。学院把你的方法、语气和疲惫复制成一种可流通模板。"
  },
  {
    name: "成为内部传说",
    text: "后来没有人能说清楚你到底属于哪个系，但每个系都举过你的例子，而且版本都略有不同。"
  },
  {
    name: "以沉默续聘",
    text: "没有正式通知，没有仪式，只是某一天你的门牌没有再被摘下来，连怪谈也默许这算一种续聘。"
  },
  {
    name: "被未来引用",
    text: "你最完整的成果并不是论文，而是未来的人已经开始用你没来得及提交的版本互相说服。"
  },
  {
    name: "转入夜班叙事",
    text: "白天的你完成了流程，晚上的你负责维持故事。两边都认为对方只是偶尔加班。"
  },
  {
    name: "成功逃出一半",
    text: "你确实走出去了一部分，但另一部分继续留在系统里按时开会、改稿、回邮件，并且做得很专业。"
  }
];

const deepEndingFamilies = [
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

const deepEndingFates = [
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

const routeEchoes = {
  future_mail: "那些来自未来的邮件后来总在你需要表态前先到一步，像一位很懂流程、也很懂催促的快递员。",
  paper_push: "论文线没有结束，只是学会了把自己拆成返修、引用、署名和沉默的多个副本，分别在不同系统里等你。",
  grant_chase: "经费并没有真的批下或消失，它只是换成更合适的口径，继续从预算表边缘向你招手。",
  service_more: "被你顺手接下的事务长出细小根系，把会议、纪要和人情连接成一张看起来很温柔的网。",
  teaching_mask: "课堂后来保存了另一个版本的你：更会解释、更少犹豫，也更容易被排进下一轮课表。",
  student_care: "学生记住的你和系统记住的你并不完全一致，这差异后来成了最难归档、也最像人的部分。",
  follow_echo: "你追过的每一道回声都没有消失，它们只是学会在你转身后用更正式的格式继续发言。",
  question_system: "你问过的问题没有获得答案，却逐渐变成新的表单项，供后来的人勾选“已知悉”。",
  hide: "你试过低调绕开异常，但学院显然也把低调当成一种可识别风格，并且识别得很准。",
  official: "所有礼貌都被系统稳稳接住，转手折成一张更便于流转的纸。",
  burnout: "疲惫没有被浪费，它被记录成一种稳定投入，甚至在总结材料里显得颇有韧性。",
  health_patch: "你争取到的休息最终没有写进成果，却让某几个尚未坍塌的上午继续保持原形。",
  duplicate_you: "另一个版本的你仍在楼里活动，负责完成那些你以为已经拒绝、但系统认为只是延期的事情。",
  budget_tuned: "那些被你对齐的小数点从此像一排安静的门牌，指向经费真正愿意承认的现实。",
  void_pages: "空白页并不空，只是把内容延迟到更适合归档的时间出现。"
};

const scenePool = [
  {
    id: "balanced_intro",
    kind: "intro",
    profiles: ["balanced"],
    tag: "入职周",
    risk: "低",
    title: "透明手册",
    text: "院长把一本透明的新教师手册递给你。你一翻开，脚注里已经写好了你明天会同意的三件事。",
    choices: [
      {
        text: "把手册按页码重新排序，再看它还能不能预言",
        delta: { paper: 1, service: 1, luck: 1 },
        flags: ["catalogue"],
        tones: ["official", "follow"],
        next: ["archive_manual", "basement_minutes"],
        aftermaths: [
          "你把页码理顺后，脚注立刻把顺序改成了新的，像是在夸你配合。",
          "整理完的那一刻，手册比刚才厚了一页，上面只有一句：谢谢协助归档。"
        ],
        logs: [
          "log: handbook acknowledged your formatting preferences",
          "log: archival system prefers tidy people"
        ]
      },
      {
        text: "给全系发一封礼貌确认邮件，问这是不是统一版本",
        delta: { service: 2, grant: 1, luck: -1 },
        flags: ["polite_broadcast"],
        tones: ["official", "service"],
        next: ["committee_pearl", "copied_minutes"],
        aftermaths: [
          "五分钟后你收到二十七封“谢谢提醒”，其中九封来自明天。",
          "没有人回答是不是统一版本，但从此每个会议通知都会多抄送你一层。"
        ],
        logs: [
          "log: reply-all storm registered",
          "log: your name has entered three mailing lists at once"
        ]
      },
      {
        text: "先把自己办公室门牌拧正，假装今天只发生了物理问题",
        delta: { health: 2, luck: 1 },
        flags: ["door_focus", "hide"],
        tones: ["hide", "health"],
        next: ["corridor_nameplate", "office_404"],
        aftermaths: [
          "门牌刚拧正，走廊另一头就有两块牌子同时歪了回去。",
          "你成功把问题缩小成一块螺丝，但那颗螺丝后来开始出现在别人的桌上。"
        ],
        logs: [
          "log: local reality adjusted through hardware maintenance",
          "log: corridor accepted temporary explanation"
        ]
      }
    ]
  },
  {
    id: "paper_intro",
    kind: "intro",
    profiles: ["paper"],
    tag: "投稿口",
    risk: "中",
    title: "来自明天的审稿邀请",
    text: "你刚入职就收到一封审稿邀请。附件里是你半年后才会投稿的那篇论文，审稿意见已经写到第三轮。",
    choices: [
      {
        text: "先接下这份审稿，看看未来到底嫌弃你哪一段",
        delta: { paper: 3, health: -1, luck: 1 },
        flags: ["paper_push", "future_mail"],
        tones: ["paper", "follow"],
        next: ["reviewer_from_tomorrow", "citation_moths"],
        aftermaths: [
          "你读到第三条意见时，突然发现它已经被你今天下午的版本提前修掉了。",
          "文档边栏有个很客气的批注：请继续保持这种能提前配合返修的态度。"
        ],
        logs: [
          "log: future reviewer granted provisional access",
          "log: citation timeline folded inward"
        ]
      },
      {
        text: "回邮件追问编辑是谁把时间线泄露给了你",
        delta: { paper: 1, service: -1, luck: 2 },
        flags: ["question_system", "paper_push"],
        tones: ["paper", "question"],
        next: ["ethics_desk", "forgotten_dataset"],
        aftermaths: [
          "编辑没有回信，但系统自动补发了一份伦理说明，标题写着“关于提前知道结果的边界”。",
          "你没问到答案，却收到一封系统通知：查询已被记录为研究行为。"
        ],
        logs: [
          "log: editorial office redirected to ethics layer",
          "log: curiosity scored as procedural activity"
        ]
      },
      {
        text: "假装没看见，再多投一篇，让未来自己忙一点",
        delta: { paper: 2, health: -2, luck: -1 },
        flags: ["paper_push", "burnout"],
        tones: ["paper", "hide"],
        next: ["midnight_revision", "metrics_fever"],
        aftermaths: [
          "你关掉邮件后又开了一个文档，标题栏自己补完成“final_v7_really”。",
          "未来那边似乎立刻知道你选择了加码，因为下一封拒稿信已经排好版了。"
        ],
        logs: [
          "log: productivity surge detected under denial protocol",
          "log: manuscript queue now self-replicates"
        ]
      }
    ]
  },
  {
    id: "grant_intro",
    kind: "intro",
    profiles: ["grant"],
    tag: "申报季",
    risk: "中",
    title: "会哼歌的预算表",
    text: "财务老师给你发来去年的模板。你打开后发现每个单元格都在用极轻的声音哼你的名字，像在提醒你谁才是主笔。",
    choices: [
      {
        text: "先把所有小数点对齐，看看它会不会因此安静",
        delta: { grant: 3, service: 1, health: -1 },
        flags: ["grant_chase", "budget_tuned"],
        tones: ["grant", "official"],
        next: ["funding_oracle", "budget_aquarium"],
        aftermaths: [
          "你对齐完最后一列后，预算表不哼歌了，改成轻轻给你打拍子。",
          "所有小数点像校准过一样站好队，顺便把你下周的时间也对齐到了申报口。"
        ],
        logs: [
          "log: decimal harmony achieved",
          "log: template accepted your caret position"
        ]
      },
      {
        text: "去问财务有没有更早一版模板，最好是还没开始闹鬼的那种",
        delta: { grant: 2, service: 1, luck: 1 },
        flags: ["official", "grant_chase"],
        tones: ["grant", "official", "question"],
        next: ["donor_dinner", "travel_reimbursement"],
        aftermaths: [
          "财务说模板只有去年版和“更去年版”，你拿到的是后者，它多了一列梦境支出。",
          "老师递给你一个更旧的压缩包，解压后里面先跳出一张晚宴座次表。"
        ],
        logs: [
          "log: legacy budget package recovered",
          "log: archival finance branch now watching"
        ]
      },
      {
        text: "把预算表打印出来锁进抽屉，今晚先别让它看见你",
        delta: { grant: 1, health: 1, luck: 1 },
        flags: ["hide", "grant_chase"],
        tones: ["grant", "hide", "health"],
        next: ["office_404", "funding_oracle"],
        aftermaths: [
          "抽屉是锁上了，但你半夜经过办公室时听见里面还在轻声改数。",
          "你成功争取到一晚上安静，代价是第二天打印纸自己出现在工位中央。"
        ],
        logs: [
          "log: budget form moved to off-screen processing",
          "log: temporary concealment approved"
        ]
      }
    ]
  },
  {
    id: "teaching_intro",
    kind: "intro",
    profiles: ["teaching"],
    tag: "第一堂课",
    risk: "中",
    title: "多出来的学生",
    text: "点名名单上有一个从未注册的名字。更麻烦的是，这位学生已经在教学平台里提交了下周才会出现的作业。",
    choices: [
      {
        text: "当场点出这个名字，看看会不会有人应声",
        delta: { teaching: 3, health: -1, luck: 1 },
        flags: ["student_care", "follow_echo"],
        tones: ["teaching", "care", "follow"],
        next: ["silent_lecture", "student_feedback"],
        aftermaths: [
          "教室最后一排的椅子轻轻响了一下，投影仪自动跳到了下一页。",
          "没有人举手，但签到系统自己把那格打成了出席。"
        ],
        logs: [
          "log: attendance anomaly acknowledged aloud",
          "log: classroom echo escalated"
        ]
      },
      {
        text: "先悄悄把名单修正，别让整节课都围着一个名字转",
        delta: { teaching: 2, service: 1, luck: -1 },
        flags: ["official", "teaching_mask"],
        tones: ["teaching", "official", "hide"],
        next: ["student_feedback", "copied_minutes"],
        aftermaths: [
          "你删掉名字的那一刻，课程群里多出一条感谢老师保护隐私的留言。",
          "名单恢复正常，但讲台上的粉笔自己写下了那个名字的首字母。"
        ],
        logs: [
          "log: roster edited under low-visibility protocol",
          "log: unidentified student retained passive access"
        ]
      },
      {
        text: "把问题抛给全班：如果一个名字先于本人到达课堂，该怎么算出勤",
        delta: { teaching: 2, paper: 1, luck: 2 },
        flags: ["question_system", "teaching_mask"],
        tones: ["teaching", "question"],
        next: ["ethics_desk", "silent_lecture"],
        aftermaths: [
          "学生们讨论得很热烈，像早就排练过这道题，只有那张空椅子始终最专注。",
          "你原想活跃气氛，结果收获了一份很像研究设计的黑板板书。"
        ],
        logs: [
          "log: pedagogical anomaly reframed as seminar prompt",
          "log: classroom opened ethics-adjacent branch"
        ]
      }
    ]
  },
  {
    id: "stealth_intro",
    kind: "intro",
    profiles: ["stealth"],
    tag: "走廊末端",
    risk: "低",
    title: "B4 的钥匙卡",
    text: "你随手刷了一下门禁，卡竟然打开了地图上不存在的 B4 办公室。门里坐着一把很像你工位的椅子，已经转向了门口。",
    choices: [
      {
        text: "先进去坐一下，看看这张椅子认不认人",
        delta: { luck: 2, health: 1 },
        flags: ["hide", "follow_echo"],
        tones: ["hide", "follow", "health"],
        next: ["office_404", "blank_id_card"],
        aftermaths: [
          "椅子高度和你办公室那把完全一致，只有扶手上多了一行还没发生的日程。",
          "你刚坐下，桌面灯就自动亮了，像这间屋子一直在等某个体温。"
        ],
        logs: [
          "log: unauthorized room accepted current user",
          "log: basement office synced posture profile"
        ]
      },
      {
        text: "把门禁异常上报，尽量让问题留在工单系统里",
        delta: { service: 1, luck: 1 },
        flags: ["official", "question_system"],
        tones: ["official", "question"],
        next: ["corridor_nameplate", "copied_minutes"],
        aftermaths: [
          "工单两分钟就结单了，备注是“该房间已恢复为概念状态”。",
          "你收到了一个工单编号，后来发现它和自己员工编号只差一位。"
        ],
        logs: [
          "log: infrastructure anomaly filed and quietly closed",
          "log: facilities branch mirrored your identifier"
        ]
      },
      {
        text: "借这间办公室午睡一会儿，反正目前看起来没人投诉",
        delta: { health: 3, luck: 1 },
        flags: ["health_patch", "hide"],
        tones: ["health", "hide"],
        next: ["blank_id_card", "ghost_postdoc"],
        aftermaths: [
          "你睡了二十分钟，醒来时桌上多了一张写着“欢迎回来”的空白工牌。",
          "这觉补得很值，唯一的问题是你梦里那套日程第二天开始逐条兑现。"
        ],
        logs: [
          "log: basement rest sequence completed",
          "log: recovery event linked to unregistered office"
        ]
      }
    ]
  },
  {
    id: "archive_manual",
    minTurn: 2,
    requiredAnyFlags: ["catalogue", "question_system"],
    tag: "档案室",
    risk: "中",
    title: "脚注比正文更了解你",
    text: "档案室里那本手册又出现了，这次脚注已经更新到你下学期会拒绝的第一个邀请。",
    choices: [
      {
        text: "沿着脚注补注释，看看它准备把你写成什么样",
        delta: { paper: 2, service: 1, luck: 1 },
        flags: ["follow_echo", "paper_push"],
        tones: ["paper", "follow"],
        next: ["forgotten_dataset", "reviewer_from_tomorrow"],
        aftermaths: [
          "你每补一条注释，脚注就对你更熟一点，直到开始提前使用你的语气。",
          "原本只是边栏的东西，写着写着开始侵占正文，像在接手叙述权。"
        ],
        logs: [
          "log: marginalia promoted to co-author status",
          "log: archive text now predicts tone as well as action"
        ]
      },
      {
        text: "把手册封进信封，只保留封面编号",
        delta: { service: 1, health: 1 },
        flags: ["official", "hide"],
        tones: ["official", "hide", "health"],
        next: ["committee_pearl", "corridor_nameplate"],
        aftermaths: [
          "你封好之后，信封背面很客气地长出了一页补充材料。",
          "编号被你保住了，内容却开始在别的纸面上以目录形式出现。"
        ],
        logs: [
          "log: containment attempt triggered distributed copies",
          "log: archive object now travels by metadata"
        ]
      },
      {
        text: "只拍那些空白页，看看学院究竟把什么留给了沉默",
        delta: { luck: 2, paper: 1 },
        flags: ["question_system", "void_pages"],
        tones: ["question", "follow"],
        next: ["sealed_seminar", "duplicate_you"],
        aftermaths: [
          "照片放大后并不空白，上面全是你还没做出的否认。",
          "看似什么都没拍到，但相册自动把这组照片放进了“重要人物”分类。"
        ],
        logs: [
          "log: blank pages contained deferred content",
          "log: silence indexed as evidence"
        ]
      }
    ]
  },
  {
    id: "committee_pearl",
    minTurn: 2,
    requiredAnyFlags: ["polite_broadcast", "official", "service_more"],
    tag: "委员会",
    risk: "中",
    title: "会生长的议程",
    text: "委员会议程每过一分钟就多出一条待办，像珍珠一样圆润、沉默，而且越来越多。",
    choices: [
      {
        text: "主动接手纪要，至少可以决定句号落在哪",
        delta: { service: 3, health: -1, luck: 1 },
        flags: ["service_more", "official"],
        tones: ["service", "official"],
        next: ["copied_minutes", "dean_smile"],
        aftermaths: [
          "你刚接下纪要，议程就安静下来，像终于找到合适的寄主。",
          "句号确实归你了，但每个句号后面都悄悄长出新的下一项。"
        ],
        logs: [
          "log: minute-taking rights granted with hidden appendices",
          "log: committee load now bonded to user"
        ]
      },
      {
        text: "把所有人名缩写成首字母，看看责任会不会也跟着缩小",
        delta: { service: 1, luck: 2 },
        flags: ["hide", "service_more"],
        tones: ["hide", "service"],
        next: ["blank_id_card", "corridor_nameplate"],
        aftermaths: [
          "责任没有缩小，只是开始以首字母的形式更快地找到你。",
          "缩写版议程传播得很广，后来连保洁阿姨都知道某个字母最近很忙。"
        ],
        logs: [
          "log: accountability compressed but not reduced",
          "log: initials now circulate independently"
        ]
      },
      {
        text: "问一句：为什么议程里会提前出现我的追悼词",
        delta: { service: -1, luck: 3, paper: 1 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["basement_minutes", "duplicate_you"],
        aftermaths: [
          "会议室短暂沉默，随后所有人默契地翻到下一页，像这本来就是常规流程。",
          "没有人回答，只有投影仪把你的名字从黑体切成了宋体。"
        ],
        logs: [
          "log: agenda anomaly verbally acknowledged",
          "log: committee redirected question to lower floor"
        ]
      }
    ]
  },
  {
    id: "reviewer_from_tomorrow",
    minTurn: 2,
    requiredAnyFlags: ["paper_push", "future_mail"],
    tag: "审稿口",
    risk: "高",
    title: "尚未完成的返修",
    text: "那份来自明天的审稿意见更新了。评审现在批评的是你今天晚上才准备写进论文的新实验。",
    choices: [
      {
        text: "照着预言返修，抢在未来自己之前把锅背完",
        delta: { paper: 4, health: -2, luck: 1 },
        flags: ["paper_push", "burnout"],
        tones: ["paper", "follow"],
        next: ["midnight_revision", "phantom_lab"],
        aftermaths: [
          "你成功追上了未来，但未来显然不喜欢被追上，于是又多给了一轮意见。",
          "返修提交瞬间，系统跳出提示：感谢提前完成历史记录。"
        ],
        logs: [
          "log: manuscript edited to match future criticism",
          "log: review loop expanded by one speculative cycle"
        ]
      },
      {
        text: "顺着元数据往回查，看看谁在替时间线写审稿系统",
        delta: { paper: 2, luck: 2, service: -1 },
        flags: ["question_system", "paper_push"],
        tones: ["paper", "question"],
        next: ["forgotten_dataset", "ethics_desk"],
        aftermaths: [
          "元数据里只有一串很熟悉的缩写，缩写展开后刚好是你的未来办公室门牌。",
          "你没追到编辑，倒是追到了一份比投稿早三个月生成的接受函。"
        ],
        logs: [
          "log: metadata pointed toward local timeline contamination",
          "log: editorial authority unresolved"
        ]
      },
      {
        text: "给匿名评审回一封感谢信，直接写上他还没公开的名字",
        delta: { service: 1, luck: 3 },
        flags: ["official", "follow_echo"],
        tones: ["official", "follow"],
        next: ["dean_smile", "sealed_seminar"],
        aftermaths: [
          "邮箱并没有退信，只是第二天校内系统多了一个“过于熟悉匿名流程”的标签。",
          "你很有礼貌地吓到了对方，因为之后所有通知都开始省略称呼。"
        ],
        logs: [
          "log: anonymity barrier punctured politely",
          "log: reviewer channel rerouted to institutional layer"
        ]
      }
    ]
  },
  {
    id: "citation_moths",
    minTurn: 2,
    requiredAnyFlags: ["paper_push"],
    tag: "文献库",
    risk: "中",
    title: "吃引文的飞蛾",
    text: "办公室夜灯一亮，飞蛾开始绕着文稿转，只啃那些没有被充分引用的段落，效率惊人且口味保守。",
    choices: [
      {
        text: "拿一篇会议摘要去喂它们，让正文先活下来",
        delta: { paper: 2, luck: 2, health: -1 },
        flags: ["paper_push"],
        tones: ["paper", "follow"],
        next: ["midnight_revision", "travel_reimbursement"],
        aftermaths: [
          "飞蛾很满意，甚至把你摘要里最弱的一句也顺手啃干净了。",
          "它们吃完后在稿子边缘留下细碎粉末，排成了下一篇文章的题目。"
        ],
        logs: [
          "log: citation moths accepted substitute feed",
          "log: abstract converted into survival tax"
        ]
      },
      {
        text: "让它们继续吃，看看最后剩下的是不是更像核心观点",
        delta: { paper: 1, luck: 3 },
        flags: ["hide", "question_system"],
        tones: ["question", "hide"],
        next: ["duplicate_you", "phantom_lab"],
        aftermaths: [
          "最后剩下的确实更像核心观点，只是它提前引用了你还没见过的文献。",
          "你赌了一把极简主义，飞蛾则礼貌地替你删掉了所有犹豫。"
        ],
        logs: [
          "log: unsolicited minimalist editing completed",
          "log: remaining paragraphs cite future sources"
        ]
      },
      {
        text: "把飞蛾视频发给合作者，请他判断这是生态问题还是投稿问题",
        delta: { paper: 1, service: 2, luck: 1 },
        flags: ["service_more", "paper_push"],
        tones: ["paper", "service"],
        next: ["coauthor_shadow", "metrics_fever"],
        aftermaths: [
          "合作者回得很快，附件里是另一版论文，作者名单比你记得的长一个人。",
          "视频刚发出去，飞蛾就排成了合作者名字的首字母，态度相当合作。"
        ],
        logs: [
          "log: coauthor notified of insect-mediated peer review",
          "log: authorship branch opened"
        ]
      }
    ]
  },
  {
    id: "funding_oracle",
    minTurn: 2,
    requiredAnyFlags: ["grant_chase"],
    tag: "茶水间",
    risk: "中",
    title: "会点评申请书的咖啡机",
    text: "茶水间的咖啡机吐出一张纸条：创新性不错，技术路线略保守。你还没把申请书打印出来。",
    choices: [
      {
        text: "把去年的摘要喂进去，看看它要不要展开说说",
        delta: { grant: 3, health: -1, luck: 1 },
        flags: ["grant_chase", "official"],
        tones: ["grant", "official"],
        next: ["donor_dinner", "budget_aquarium"],
        aftermaths: [
          "咖啡机咕噜了一阵，吐出三条建议和一张晚宴座位图，像是把自己当成了评审秘书。",
          "你收获了一杯过甜的美式，以及一份比你本人更有信心的项目摘要。"
        ],
        logs: [
          "log: beverage dispenser entered panel simulation mode",
          "log: grant narrative improved under steam pressure"
        ]
      },
      {
        text: "只问成功率，不问理由，先保护一下脆弱的早晨",
        delta: { grant: 2, health: 1 },
        flags: ["hide", "grant_chase"],
        tones: ["grant", "hide", "health"],
        next: ["travel_reimbursement", "ghost_postdoc"],
        aftermaths: [
          "咖啡机沉默了三秒，只吐出一个百分比和一句“别问细节”。",
          "你保住了心情，但机器在杯壁上用泡沫画了一只会摇头的鱼。"
        ],
        logs: [
          "log: applicant requested blunt probability only",
          "log: oracle withheld commentary but not symbolism"
        ]
      },
      {
        text: "拔掉电源，改靠自己写，不给机器立 KPI",
        delta: { health: 1, luck: 2, grant: 1 },
        flags: ["question_system", "health_patch"],
        tones: ["question", "health"],
        next: ["forgotten_dataset", "ethics_desk"],
        aftermaths: [
          "咖啡机黑屏前仍努力闪出一句：你会想念我的。",
          "你赢回了一个安静上午，代价是下午开始所有热水壶都对你异常热情。"
        ],
        logs: [
          "log: oracle power cut by user",
          "log: appliance network marked new dissenter"
        ]
      }
    ]
  },
  {
    id: "donor_dinner",
    minTurn: 2,
    requiredAnyFlags: ["grant_chase", "official"],
    tag: "晚宴厅",
    risk: "中",
    title: "梦见过你的捐赠人",
    text: "晚宴上，一位捐赠人精准说出了你项目的标题，并补充说昨晚梦里已经看见了经费执行表。",
    choices: [
      {
        text: "礼貌点头，把梦也当成前期调研的一部分",
        delta: { grant: 2, service: 2, luck: 1 },
        flags: ["grant_chase", "service_more"],
        tones: ["grant", "service", "official"],
        next: ["dean_smile", "budget_aquarium"],
        aftermaths: [
          "对方很欣慰，还把梦里没说完的部分装进了一个基金会信封。",
          "你顺利把离奇情节纳入社交流程，结果梦境从此也开始走正式渠道。"
        ],
        logs: [
          "log: donor dream accepted as soft evidence",
          "log: networking event merged with grant forecast"
        ]
      },
      {
        text: "请他详细描述梦境，尤其是经费超支发生在哪一页",
        delta: { paper: 1, grant: 2, luck: 2 },
        flags: ["follow_echo", "question_system"],
        tones: ["grant", "question", "follow"],
        next: ["sealed_seminar", "duplicate_you"],
        aftermaths: [
          "他描述得极其流利，像已经在你项目组里担任过一轮顾问。",
          "你越问越像在收集口供，而他越讲越像在复盘一场早已发生的答辩。"
        ],
        logs: [
          "log: donor dream cross-referenced with future timeline",
          "log: banquet converted into witness interview"
        ]
      },
      {
        text: "借口去洗手间，从侧门悄悄撤离晚宴现场",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["corridor_nameplate", "office_404"],
        aftermaths: [
          "你成功离席，但回到办公室时桌上已经摆好了晚宴后续任务。",
          "洗手间镜子很贴心地复述了一遍你刚才没听完的致辞。"
        ],
        logs: [
          "log: donor event exited through secondary route",
          "log: social obligations followed user home"
        ]
      }
    ]
  },
  {
    id: "silent_lecture",
    minTurn: 2,
    requiredAnyFlags: ["student_care", "teaching_mask"],
    tag: "教室",
    risk: "中",
    title: "抢先播放的讲义",
    text: "投影仪提前播放起一套你还没做完的讲义。更不妙的是，学生们点头的节奏说明他们并不觉得这件事奇怪。",
    choices: [
      {
        text: "顺着这套讲义往下讲，假装自己只是被备课感动了",
        delta: { teaching: 3, health: -1, luck: 1 },
        flags: ["teaching_mask", "burnout"],
        tones: ["teaching", "official"],
        next: ["student_feedback", "copied_minutes"],
        aftermaths: [
          "你讲得居然很顺，唯一的问题是那套讲义把下学期的例题也讲完了。",
          "课堂效果出奇地好，教务系统于是默默给你排了更多课。"
        ],
        logs: [
          "log: prewritten lecture accepted as live teaching",
          "log: class performance improved but schedule inflated"
        ]
      },
      {
        text: "直接问学生，是谁把这套幻灯片提前上传到了教室",
        delta: { teaching: 2, luck: 2, service: -1 },
        flags: ["question_system", "student_care"],
        tones: ["teaching", "care", "question"],
        next: ["ethics_desk", "ghost_postdoc"],
        aftermaths: [
          "前排有位同学说不是上传，是“它自己习惯这个时间出现”。",
          "你获得了几个很认真、也很不适合写进教学总结的回答。"
        ],
        logs: [
          "log: classroom ownership disputed by students and equipment",
          "log: teaching anomaly escalated"
        ]
      },
      {
        text: "关灯，只靠黑板和声音把整节课拖过去",
        delta: { teaching: 2, health: 1, luck: 2 },
        flags: ["follow_echo", "hide"],
        tones: ["teaching", "follow", "hide"],
        next: ["sealed_seminar", "office_404"],
        aftermaths: [
          "黑暗很配合，投影仪反而像受了冷落，整节课都在背后轻轻换页。",
          "学生们说这样更有沉浸感，只有最后那张空椅子一直在发光。"
        ],
        logs: [
          "log: low-light teaching mode stabilized",
          "log: projector continued autonomous operation"
        ]
      }
    ]
  },
  {
    id: "student_feedback",
    minTurn: 2,
    requiredAnyFlags: ["student_care", "teaching_mask"],
    tag: "教学平台",
    risk: "低",
    title: "提前送达的评教",
    text: "教学平台弹出一份学期末评教，学生感谢你“在事故发生后仍坚持完成课程”。你并不知道事故指什么。",
    choices: [
      {
        text: "把整份评教打印出来，留给未来核对事故细节",
        delta: { teaching: 2, service: 1, health: -1 },
        flags: ["teaching_mask", "service_more"],
        tones: ["teaching", "service"],
        next: ["copied_minutes", "retirement_party"],
        aftermaths: [
          "打印机吐纸时很体贴地多出一页空白事故说明，像等你补全。",
          "评教措辞十分诚恳，诚恳到像悼词的前半页。"
        ],
        logs: [
          "log: evaluation archived before incident timestamp",
          "log: printer attached optional aftermath page"
        ]
      },
      {
        text: "回复那位不明学生，问他到底在感谢哪一次幸存",
        delta: { teaching: 1, luck: 3 },
        flags: ["student_care", "follow_echo"],
        tones: ["care", "follow"],
        next: ["ghost_postdoc", "duplicate_you"],
        aftermaths: [
          "对方秒回，说邮件最好别写太具体，因为教室墙壁也能看到。",
          "你终于等到具体解释，可解释里夹着一张你从未开过的补课通知。"
        ],
        logs: [
          "log: anonymous student replied from unresolved thread",
          "log: survivor narrative branch opened"
        ]
      },
      {
        text: "删掉整份文件，只记住其中一句夸你的话",
        delta: { health: 2, luck: 1 },
        flags: ["hide"],
        tones: ["hide", "health"],
        next: ["dean_smile", "corridor_nameplate"],
        aftermaths: [
          "文件删掉了，那句夸奖却出现在你第二天的院办简报里。",
          "你只想留下一点好心情，系统却把这句话扩散成了新的指标。"
        ],
        logs: [
          "log: feedback removed, praise persisted in circulation",
          "log: morale artifact now public"
        ]
      }
    ]
  },
  {
    id: "office_404",
    minTurn: 2,
    requiredAnyFlags: ["hide", "health_patch"],
    tag: "B4",
    risk: "中",
    title: "额外星期四",
    text: "B4 办公室白板上写着你的本周安排，其中多出一个现实日历没有的星期四，而且会议名称都很熟悉。",
    choices: [
      {
        text: "去过这个额外星期四，至少别让它空着",
        delta: { luck: 3, health: -1, paper: 1 },
        flags: ["follow_echo", "hide"],
        tones: ["follow", "hide"],
        next: ["blank_id_card", "sealed_seminar"],
        aftermaths: [
          "你一脚踏进去，手机日历自动补出了一整天的安排，像怕你迟到。",
          "额外星期四没有太阳，但邮件收发速度比任何工作日都快。"
        ],
        logs: [
          "log: extra weekday accessed",
          "log: basement calendar synchronized with device"
        ]
      },
      {
        text: "把白板上的自己名字擦掉，测试一下这间屋子记不记仇",
        delta: { luck: 2, service: -1, health: 1 },
        flags: ["hide", "question_system"],
        tones: ["hide", "question", "health"],
        next: ["corridor_nameplate", "duplicate_you"],
        aftermaths: [
          "名字擦掉后，白板只留下一个职位，像在提醒你可替换的是谁。",
          "房间没有记仇，但第二天人事系统问你是否主动放弃所属关系。"
        ],
        logs: [
          "log: office attempted depersonalized recognition",
          "log: HR metadata briefly destabilized"
        ]
      },
      {
        text: "给这间屋子的原主人留点零食，礼数总不会错得太离谱",
        delta: { health: 1, service: 2, luck: 1 },
        flags: ["service_more", "health_patch"],
        tones: ["service", "health"],
        next: ["ghost_postdoc", "basement_minutes"],
        aftermaths: [
          "第二天零食不见了，取而代之的是一张批注过你课程提纲的便签。",
          "礼数果然没错，只是对方回礼的速度说明它一直都在附近。"
        ],
        logs: [
          "log: basement hospitality reciprocated",
          "log: unknown occupant entered advisory mode"
        ]
      }
    ]
  },
  {
    id: "blank_id_card",
    minTurn: 2,
    requiredAnyFlags: ["hide"],
    tag: "门禁处",
    risk: "低",
    title: "空白工牌",
    text: "打印机吐出一张空白工牌，名字、照片、部门全空，但门禁系统对它表现出近乎尊敬的反应。",
    choices: [
      {
        text: "先戴着它走一圈，看看系统会把你算成什么",
        delta: { luck: 3, service: 1 },
        flags: ["hide", "official"],
        tones: ["hide", "official"],
        next: ["corridor_nameplate", "dean_smile"],
        aftermaths: [
          "一路都很顺，所有门都开得特别快，像不想让你停下来观察自己。",
          "你被不同楼层识别成不同身份，体验感异常流畅。"
        ],
        logs: [
          "log: blank badge granted polymorphic access",
          "log: identity left intentionally unresolved"
        ]
      },
      {
        text: "自己手写一个部门名，给混乱一个礼貌答案",
        delta: { service: 1, paper: 1, luck: 1 },
        flags: ["question_system", "paper_push"],
        tones: ["official", "question", "paper"],
        next: ["archive_manual", "copied_minutes"],
        aftermaths: [
          "你写上去的部门当天下午就出现在校内通讯录测试页里。",
          "系统明显接受了这份自我命名，并开始向你推送该部门的会议通知。"
        ],
        logs: [
          "log: handwritten department recognized as provisional reality",
          "log: directory index expanded by one speculative unit"
        ]
      },
      {
        text: "和夜班保安换一晚，看看他愿不愿意换这个权限",
        delta: { luck: 2, health: 1, service: 1 },
        flags: ["follow_echo"],
        tones: ["follow", "health", "service"],
        next: ["basement_minutes", "sealed_seminar"],
        aftermaths: [
          "保安只看了一眼就同意了，并提醒你午夜后别去四层以上。",
          "你换来的不只是工牌，还有一份用手电筒画出来的校园地图。"
        ],
        logs: [
          "log: after-hours badge exchange completed",
          "log: security branch shared restricted heuristics"
        ]
      }
    ]
  },
  {
    id: "basement_minutes",
    minTurn: 3,
    requiredAnyFlags: ["follow_echo", "official", "service_more"],
    tag: "地下会议室",
    risk: "高",
    title: "先于会议的纪要",
    text: "地下层会议室里，纪要已经打印好。纸面明确记载了与会者将如何在十分钟后分歧、让步、附议并表示感谢。",
    choices: [
      {
        text: "先改两处措辞，至少让未来的自己看起来更像人话",
        delta: { service: 2, paper: 1, health: -1 },
        flags: ["service_more", "official"],
        tones: ["service", "official"],
        next: ["copied_minutes", "dean_smile"],
        aftermaths: [
          "十分钟后会议真的照着你改过的语气展开，甚至有人替你补了笑声。",
          "你获得了一点叙述权，同时失去了一点对现场的惊讶。"
        ],
        logs: [
          "log: future minutes edited in advance",
          "log: meeting script complied with revisions"
        ]
      },
      {
        text: "把空椅子都拍下来，留证据给明天还正常的自己",
        delta: { paper: 1, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["duplicate_you", "sealed_seminar"],
        aftermaths: [
          "照片洗出来时，每张空椅子上都浮着不同人的工牌影子。",
          "你原本只是拍证据，结果拍到了一整套座次制度。"
        ],
        logs: [
          "log: empty-seat documentation captured hidden attendees",
          "log: basement quorum exceeds visible bodies"
        ]
      },
      {
        text: "坐到写着你名字的位置，看看这套流程到底想让你成为什么",
        delta: { health: -1, luck: 2, grant: 1 },
        flags: ["burnout", "hide"],
        tones: ["follow", "hide"],
        next: ["retirement_party", "phantom_lab"],
        aftermaths: [
          "椅子比你预计得更合身，像早就按你的背部曲线训练过。",
          "坐下后会议还没开始，但你已经先体会到了散会后的疲惫。"
        ],
        logs: [
          "log: seat ownership synced with user posture",
          "log: procedural fatigue arrived ahead of event"
        ]
      }
    ]
  },
  {
    id: "phantom_lab",
    minTurn: 3,
    requiredAnyFlags: ["follow_echo", "paper_push", "hide"],
    tag: "实验台",
    risk: "高",
    title: "无人做过的实验",
    text: "实验设备吐出一串异常漂亮的数据。问题是，系统日志显示这项实验从未预约、从未启动，也从未结束。",
    choices: [
      {
        text: "先把数据接进论文，之后再想办法追实验",
        delta: { paper: 4, health: -2 },
        flags: ["paper_push", "burnout"],
        tones: ["paper", "follow"],
        next: ["midnight_revision", "metrics_fever"],
        aftermaths: [
          "数据和你的假设配合得过分默契，像它比你更急着发表。",
          "你决定先用再说，设备则用蜂鸣声礼貌承认了这份共谋。"
        ],
        logs: [
          "log: orphan dataset attached to manuscript draft",
          "log: lab timeline remains unresolved"
        ]
      },
      {
        text: "顺着样本编号查，看看到底是谁提前替你干完了",
        delta: { paper: 1, luck: 2, service: -1 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["forgotten_dataset", "ghost_postdoc"],
        aftermaths: [
          "编号一路追到一张已经过期的门禁记录，刷卡人和你同名同工号。",
          "系统没有告诉你是谁做的，只提醒你该在使用前注明来源。"
        ],
        logs: [
          "log: sample trace looped back to internal identity",
          "log: provenance request unresolved"
        ]
      },
      {
        text: "断电，把热敏纸留着，先别让它继续吐出更多未来",
        delta: { health: 1, luck: 2 },
        flags: ["hide", "official"],
        tones: ["hide", "official", "health"],
        next: ["ethics_desk", "dean_smile"],
        aftermaths: [
          "设备停了，纸条却在你口袋里继续变热，像还有半页没打印完。",
          "你保住了一个晚上安静，但整栋楼都开始对你表现出过度配合。"
        ],
        logs: [
          "log: instrument power interrupted by user",
          "log: residual output migrated off-machine"
        ]
      }
    ]
  },
  {
    id: "coauthor_shadow",
    minTurn: 3,
    requiredAnyFlags: ["paper_push", "service_more"],
    tag: "合作者邮件",
    risk: "中",
    title: "作者名单里多出来的人",
    text: "合作者发回修订稿，作者名单里比你记得的多了一位。更离奇的是，这位新作者在致谢里感谢了你未来的帮助。",
    choices: [
      {
        text: "先接受修订，看看多出来的那位究竟会写什么",
        delta: { paper: 3, service: 1, luck: 1 },
        flags: ["paper_push", "official"],
        tones: ["paper", "official"],
        next: ["midnight_revision", "duplicate_you"],
        aftermaths: [
          "你点了接受，那位作者立刻在第二页加了一段比你更懂你的讨论。",
          "名单变长之后，论文忽然更像一份口供，而不是研究报告。"
        ],
        logs: [
          "log: extra author merged into tracked changes",
          "log: manuscript voice count increased"
        ]
      },
      {
        text: "回信追问：这位新作者到底是人、岗位，还是一种流程",
        delta: { paper: 1, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["ghost_postdoc", "sealed_seminar"],
        aftermaths: [
          "合作者只回复了一个附件，里面是本学期所有会议里那位“未出镜老师”的发言摘录。",
          "你没问清对方身份，却问出了一个更宽的职业类别。"
        ],
        logs: [
          "log: authorship query escalated beyond personhood",
          "log: collaborator returned archival fragments"
        ]
      },
      {
        text: "干脆删掉所有人名，只留一行：本研究由事态推动完成",
        delta: { luck: 2, health: -1, paper: 1 },
        flags: ["hide", "burnout"],
        tones: ["hide", "paper"],
        next: ["ethics_desk", "retirement_party"],
        aftermaths: [
          "稿子立刻变得干净而危险，像一封没人愿意签名的告密信。",
          "你短暂体验到匿名带来的轻盈，随后系统提醒你必须补全责任作者。"
        ],
        logs: [
          "log: authorship field cleared and rejected by reality",
          "log: responsibility sought new host"
        ]
      }
    ]
  },
  {
    id: "metrics_fever",
    minTurn: 3,
    requiredAnyFlags: ["paper_push", "grant_chase", "question_system"],
    tag: "仪表盘",
    risk: "中",
    title: "会倒着涨的指标",
    text: "学院仪表盘今天很奇怪：所有人忙的时候，它往下掉；所有人离线的时候，它蹭蹭往上升。",
    choices: [
      {
        text: "反复刷新，逼它承认自己到底在统计什么",
        delta: { grant: 2, health: -1, luck: 2 },
        flags: ["grant_chase", "burnout"],
        tones: ["grant", "question"],
        next: ["budget_aquarium", "dean_smile"],
        aftermaths: [
          "你终于看出规律：它统计的不是产出，是配合度，而且很欣赏困惑中的坚持。",
          "刷到第九次时，页面弹出一句感谢：你已帮助系统完成自校准。"
        ],
        logs: [
          "log: dashboard revealed inverse labor metric",
          "log: repeated refresh improved anomaly confidence"
        ]
      },
      {
        text: "截屏发给同事，看看是不是只有你这台电脑在发热",
        delta: { service: 2, luck: 1 },
        flags: ["official", "service_more"],
        tones: ["service", "official"],
        next: ["copied_minutes", "committee_pearl"],
        aftermaths: [
          "截图发出去后三个人回了“我这边也是”，另有一个人回了“别在工作时看见它”。",
          "同事们很团结地确认了异常，同时一致建议你别再追问。"
        ],
        logs: [
          "log: dashboard anomaly distributed across peer network",
          "log: collective validation increased administrative visibility"
        ]
      },
      {
        text: "拔掉显示器，盯着黑屏里的自己看一会儿",
        delta: { health: 1, luck: 3 },
        flags: ["follow_echo", "hide"],
        tones: ["hide", "follow", "health"],
        next: ["duplicate_you", "corridor_nameplate"],
        aftermaths: [
          "黑屏里的你先眨眼，随后很自然地把视线移向你背后的门。",
          "你没再看到指标，但看到了它统计你的方式。"
        ],
        logs: [
          "log: display disabled, reflective interface activated",
          "log: self-observation replaced analytics view"
        ]
      }
    ]
  },
  {
    id: "copied_minutes",
    minTurn: 3,
    requiredAnyFlags: ["service_more", "official", "teaching_mask"],
    tag: "会议后",
    risk: "中",
    title: "预先替你发言的纪要",
    text: "会后纪要流转到你邮箱，里面出现了几句你根本没说过的话。它们不算离谱，只是比你本人更圆滑一点。",
    choices: [
      {
        text: "照着纪要练一遍，省得下次现场再现编",
        delta: { service: 2, teaching: 1, health: -1 },
        flags: ["official", "service_more"],
        tones: ["service", "official"],
        next: ["dean_smile", "travel_reimbursement"],
        aftermaths: [
          "你练得越顺，越怀疑这份纪要是不是在帮你制造一个更适配环境的版本。",
          "第二天开会时你真的说出了差不多的话，唯一惊讶的人只有你。"
        ],
        logs: [
          "log: anticipated speech matched later performance",
          "log: minutes now functioning as rehearsal device"
        ]
      },
      {
        text: "下次故意说相反的话，看纪要还是不是照抄现实",
        delta: { luck: 3, paper: 1 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["ethics_desk", "duplicate_you"],
        aftermaths: [
          "你成功把现场带偏了，但会后纪要坚定地保留了更得体的那个你。",
          "事实和记录分了家，学院显然觉得记录更值得继续培养。"
        ],
        logs: [
          "log: spoken content diverged from official narrative",
          "log: documentation favored alternate persona"
        ]
      },
      {
        text: "干脆缺席下一场会，让纪要独立完成它的人设塑造",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["office_404", "retirement_party"],
        aftermaths: [
          "你没去，纪要照样写得很完整，甚至比平时更了解你的顾虑。",
          "这招暂时保住了精力，也让你意识到出席本身并不总是必要条件。"
        ],
        logs: [
          "log: meeting narrative self-completed without user presence",
          "log: absence recorded as compatible behavior"
        ]
      }
    ]
  },
  {
    id: "ethics_desk",
    minTurn: 3,
    requiredAnyFlags: ["question_system", "student_care"],
    tag: "伦理办",
    risk: "中",
    title: "未来自己算不算受试者",
    text: "伦理申请表新增一项：若研究涉及未来版本的自己，请说明是否获得对方知情同意。",
    choices: [
      {
        text: "先勾“不适用”，让表格自己承担一点勇气",
        delta: { service: 1, luck: 1, health: 1 },
        flags: ["official", "hide"],
        tones: ["official", "hide", "health"],
        next: ["dean_smile", "travel_reimbursement"],
        aftermaths: [
          "系统短暂停顿后接受了这个答案，只在页脚加了一句“暂按单时区处理”。",
          "你顺利通过了一关形式审查，同时被悄悄放进了待观察名单。"
        ],
        logs: [
          "log: ethics form accepted temporal simplification",
          "log: case retained for quiet monitoring"
        ]
      },
      {
        text: "附上一页解释，认真描述为什么这个问题本身就已经是结果",
        delta: { paper: 2, service: -1, luck: 2 },
        flags: ["paper_push", "question_system"],
        tones: ["paper", "question"],
        next: ["forgotten_dataset", "midnight_revision"],
        aftermaths: [
          "你越解释越像在写论文引言，伦理办则越看越像在给你做同行评议。",
          "附页写到第二段时，表格自动给你加了一个“理论贡献”附件槽。"
        ],
        logs: [
          "log: ethics explanation upgraded into concept note",
          "log: paperwork now cites user argument"
        ]
      },
      {
        text: "直接问工作人员：如果未来的我先签了字，当前这份还算不算缺件",
        delta: { luck: 3, service: 1 },
        flags: ["follow_echo", "service_more"],
        tones: ["question", "follow", "service"],
        next: ["sealed_seminar", "basement_minutes"],
        aftermaths: [
          "工作人员没有抬头，只把一张地下层会议室通行条推到了你手边。",
          "你没得到口头回答，却得到了一条默认非常具体的路线指引。"
        ],
        logs: [
          "log: ethics staff redirected inquiry to basement process",
          "log: temporal consent remains unresolved"
        ]
      }
    ]
  },
  {
    id: "corridor_nameplate",
    minTurn: 3,
    requiredAnyFlags: ["hide", "official", "question_system"],
    tag: "走廊",
    risk: "低",
    title: "会交换门牌的楼层",
    text: "晚上七点一过，这层楼的门牌开始互换位置。教授、助理、访问学者、会议室和储藏间轮流尝试解释彼此。",
    choices: [
      {
        text: "顺着自己的名字一直走，看它今晚想停在哪扇门上",
        delta: { luck: 3, health: -1 },
        flags: ["hide", "follow_echo"],
        tones: ["hide", "follow"],
        next: ["office_404", "duplicate_you"],
        aftermaths: [
          "你的名字转了三次弯，最后停在一扇从白天起就没有存在过的门上。",
          "一路跟下来后，你发现名字比本人更熟悉校园夜路。"
        ],
        logs: [
          "log: personal nameplate entered autonomous routing mode",
          "log: corridor destination unstable but deliberate"
        ]
      },
      {
        text: "按字母顺序一块块摆回去，先帮楼层恢复体面",
        delta: { service: 2, luck: 1 },
        flags: ["official", "service_more"],
        tones: ["official", "service"],
        next: ["committee_pearl", "dean_smile"],
        aftermaths: [
          "楼层很给面子地安静了十分钟，随后把“储藏间”放到了院长办公室门上。",
          "你成功恢复了秩序的外观，秩序则顺手把你列入了维护名单。"
        ],
        logs: [
          "log: hallway ordering attempted by user",
          "log: institution grateful for cosmetic stability"
        ]
      },
      {
        text: "把自己的门牌改成“访问中”，看看是不是能借此松一口气",
        delta: { health: 2, luck: 2 },
        flags: ["question_system"],
        tones: ["question", "health", "hide"],
        next: ["travel_reimbursement", "blank_id_card"],
        aftermaths: [
          "门牌改好后，第二天真的有人给你发来访问手续表。",
          "你原想给自己请半天隐身假，系统却理解成跨单位流动意向。"
        ],
        logs: [
          "log: role label changed to visiting state",
          "log: mobility paperwork awakened"
        ]
      }
    ]
  },
  {
    id: "travel_reimbursement",
    minTurn: 4,
    requiredAnyFlags: ["grant_chase", "official", "luck"],
    tag: "财务室",
    risk: "中",
    title: "还没出发的报销单",
    text: "财务系统发来提醒，催你补交一场尚未参加会议的出租车发票。备注里很贴心地写了你回程堵车的具体时间。",
    choices: [
      {
        text: "照会议手册反向编一条行程，先把表单喂饱",
        delta: { grant: 2, service: 1, health: -1 },
        flags: ["official", "grant_chase"],
        tones: ["official", "grant"],
        next: ["donor_dinner", "midnight_revision"],
        aftermaths: [
          "你编出的行程流畅到连自己都愿意相信那趟会已经圆满结束。",
          "报销系统满意通过，甚至替你补上了一张不存在的地铁票。"
        ],
        logs: [
          "log: reimbursement narrative fabricated successfully",
          "log: travel record now precedes travel itself"
        ]
      },
      {
        text: "老实写明这趟会只发生在梦里，看看系统肯不肯走灵魂通道",
        delta: { luck: 3, paper: 1 },
        flags: ["follow_echo", "question_system"],
        tones: ["question", "follow"],
        next: ["budget_aquarium", "sealed_seminar"],
        aftermaths: [
          "系统没有驳回，只把报销类别改成了“跨叙事交流”。",
          "你本来在开玩笑，财务却以一种有经验的态度接住了它。"
        ],
        logs: [
          "log: dream travel filed under nonstandard category",
          "log: finance office displayed concerning familiarity"
        ]
      },
      {
        text: "直接放弃这笔报销，拿健康换一点现实感",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["retirement_party", "ghost_postdoc"],
        aftermaths: [
          "你放弃得很干脆，系统则把你的克制记成了某种值得复用的模板。",
          "没报销确实更省事，只是晚上梦里那趟车还是按时开回来了。"
        ],
        logs: [
          "log: reimbursement abandoned in pursuit of stability",
          "log: dream itinerary continued without budget support"
        ]
      }
    ]
  },
  {
    id: "ghost_postdoc",
    minTurn: 4,
    requiredAnyFlags: ["student_care", "follow_echo", "grant_chase", "health_patch"],
    tag: "镜面",
    risk: "中",
    title: "镜子里的前博后",
    text: "茶水间镜面里站着一位前博后，只在你视线边缘出现。他想知道自己的合同到底是结束了，还是被写进了别的项目。",
    choices: [
      {
        text: "给他留个工位和一杯咖啡，先把人当人处理",
        delta: { service: 2, teaching: 1, health: -1 },
        flags: ["service_more", "student_care"],
        tones: ["service", "care"],
        next: ["dean_smile", "retirement_party"],
        aftermaths: [
          "第二天你的空工位上真的多了一份整理好的文献清单，字迹像雾气压出来的。",
          "这份善意很快得到了回报，只是回报以夜班协助的形式发生。"
        ],
        logs: [
          "log: spectral postdoc assigned informal desk access",
          "log: mirror labor now partially cooperative"
        ]
      },
      {
        text: "先问清他究竟被哪个项目卡住，顺便记下项目编号",
        delta: { paper: 1, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["forgotten_dataset", "duplicate_you"],
        aftermaths: [
          "他说出的编号恰好对应你还没申请到的经费条目。",
          "你本想帮他找出口，结果先找到了一条能把你卷进去的立项痕迹。"
        ],
        logs: [
          "log: mirror entity disclosed project identifier",
          "log: funding timeline intersects with personnel shadow"
        ]
      },
      {
        text: "这周尽量避开镜子，让双方都冷静一下",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["office_404", "corridor_nameplate"],
        aftermaths: [
          "你确实少见到了他，但所有不锈钢表面都开始反射得格外认真。",
          "躲避策略暂时有效，只是系统把它理解成了新的巡回路线。"
        ],
        logs: [
          "log: reflective surfaces placed on partial avoidance",
          "log: spectral contact reduced, not removed"
        ]
      }
    ]
  },
  {
    id: "dean_smile",
    minTurn: 4,
    requiredAnyFlags: ["official", "service_more", "grant_chase"],
    tag: "院长室",
    risk: "高",
    title: "听过你私下笔记的院长",
    text: "院长今天夸你很灵活，夸奖里精确引用了你只写在私人便笺上的一句抱怨，连标点都没改。",
    choices: [
      {
        text: "顺势再多答应一点，看看体制究竟吃不吃礼貌这一套",
        delta: { service: 3, grant: 1, health: -2 },
        flags: ["service_more", "official"],
        tones: ["service", "official"],
        next: ["committee_pearl", "retirement_party"],
        aftermaths: [
          "院长的笑容更真诚了，真诚到像系统在确认扩容成功。",
          "你用礼貌换来短期平静，同时把自己写进了更多默认名单。"
        ],
        logs: [
          "log: institutional flexibility request accepted",
          "log: workload reservoir expanded"
        ]
      },
      {
        text: "礼貌追问：那张便笺到底是谁交给了您",
        delta: { luck: 3, paper: 1 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["copied_minutes", "sealed_seminar"],
        aftermaths: [
          "院长没有回答，只把会议日程翻到一页你尚未参加的会后纪要。",
          "你得到的不是来源，而是一条通往来源的整齐楼梯。"
        ],
        logs: [
          "log: dean declined direct provenance disclosure",
          "log: user redirected to documentation layer"
        ]
      },
      {
        text: "什么都不说，只把笑容维持到能完整退出办公室为止",
        delta: { health: -1, luck: 2, paper: 1 },
        flags: ["hide", "burnout"],
        tones: ["hide", "official"],
        next: ["duplicate_you", "budget_aquarium"],
        aftermaths: [
          "你成功平稳退场，门关上后才发现自己把那句抱怨背得更熟了。",
          "这是一种非常职业的逃生方式，职业到连走廊镜子都点头。"
        ],
        logs: [
          "log: office exit completed under facial compliance",
          "log: unspoken notes remain in circulation"
        ]
      }
    ]
  },
  {
    id: "forgotten_dataset",
    minTurn: 4,
    requiredAnyFlags: ["question_system", "paper_push", "follow_echo"],
    tag: "旧硬盘",
    risk: "高",
    title: "写着下学期日期的数据文件夹",
    text: "抽屉深处那块旧硬盘里有个文件夹，命名日期来自下学期。里面不仅有整理好的数据，还夹着一张你尚未打印的补充材料清单。",
    choices: [
      {
        text: "先打开最新文件，接受“之后再解释”这套顺序",
        delta: { paper: 3, luck: 2, health: -1 },
        flags: ["follow_echo", "paper_push"],
        tones: ["paper", "follow"],
        next: ["duplicate_you", "midnight_revision"],
        aftermaths: [
          "文件结构清晰得不像意外，更像有人知道你终究会来找它。",
          "你打开越多，越像在阅读一份自己未来的整理习惯说明书。"
        ],
        logs: [
          "log: forward-dated dataset opened",
          "log: user behavior increasingly preempted"
        ]
      },
      {
        text: "把时间戳和门禁记录对照，试着给现实留下一个交叉验证",
        delta: { paper: 1, service: 1, luck: 2 },
        flags: ["question_system", "official"],
        tones: ["question", "official"],
        next: ["ethics_desk", "committee_pearl"],
        aftermaths: [
          "门禁记录里确实有人半夜进过你办公室，工号和你一模一样。",
          "现实被你按住了一角，但另一角开始向人事系统卷过去。"
        ],
        logs: [
          "log: timestamp audit intersected with access logs",
          "log: duplicate identity now formally suspect"
        ]
      },
      {
        text: "把硬盘寄给未来的自己，再把已发送邮箱清空",
        delta: { health: -1, luck: 3 },
        flags: ["hide", "burnout"],
        tones: ["hide", "follow"],
        next: ["phantom_lab", "retirement_party"],
        aftermaths: [
          "邮件确实发出去了，收件箱立刻多了一封“谢谢收到”的自动回复。",
          "你本想把问题转交出去，结果时间线礼貌地回了个已读。"
        ],
        logs: [
          "log: dataset forwarded across temporal mailbox",
          "log: response received from unresolved recipient"
        ]
      }
    ]
  },
  {
    id: "midnight_revision",
    minTurn: 4,
    requiredAnyFlags: ["paper_push", "grant_chase", "burnout"],
    tag: "00:47",
    risk: "高",
    title: "只在午夜接受修改的稿件",
    text: "文稿白天怎么改都不保存，只有凌晨 00:47 到 01:12 之间会认真接受你的任何句子，哪怕那句子明显不该出现在这里。",
    choices: [
      {
        text: "熬着，把脚注、致谢、标点都修到发亮为止",
        delta: { paper: 4, health: -3, luck: 1 },
        flags: ["paper_push", "burnout"],
        tones: ["paper", "follow"],
        next: ["phantom_lab", "retirement_party"],
        aftermaths: [
          "你修得非常漂亮，漂亮到第二天根本不记得自己为什么同意其中几句。",
          "凌晨窗口确实高效，只是它似乎也在同时修改你本人。"
        ],
        logs: [
          "log: midnight edit window fully utilized",
          "log: manuscript polish correlated with user depletion"
        ]
      },
      {
        text: "趁窗口打开先提交，粗糙一点也比继续耗着强",
        delta: { paper: 2, health: 1, luck: 2 },
        flags: ["hide"],
        tones: ["paper", "hide", "health"],
        next: ["donor_dinner", "travel_reimbursement"],
        aftermaths: [
          "你提交得很果断，系统甚至没有给你反悔的时间。",
          "稿子飞出去那一刻像卸下一块石头，落地时却在远处敲出新的回声。"
        ],
        logs: [
          "log: manuscript launched during narrow acceptance interval",
          "log: roughness tolerated by the hour"
        ]
      },
      {
        text: "把致谢改成警示牌，至少提醒后来人别走太深",
        delta: { paper: 2, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["paper", "question", "follow"],
        next: ["sealed_seminar", "duplicate_you"],
        aftermaths: [
          "致谢区突然成了全文最真诚的部分，真诚得像地下留言板。",
          "你写下的提醒也许没人会删，因为系统显然很喜欢收集前车之鉴。"
        ],
        logs: [
          "log: acknowledgments converted to warning channel",
          "log: manuscript now contains live hazard signage"
        ]
      }
    ]
  },
  {
    id: "sealed_seminar",
    minTurn: 5,
    requiredAnyFlags: ["follow_echo", "question_system", "hide"],
    tag: "邀请函",
    risk: "高",
    title: "写着“你已经来过”的研讨会",
    text: "一封没有寄件人的研讨会邀请函躺在桌上，地点写的是“你已经来过的那个房间”。时间栏则耐心标注：再次参加。",
    choices: [
      {
        text: "按时去，带本子，把所有第二次发生的事都记下来",
        delta: { paper: 2, luck: 2, health: -1 },
        flags: ["paper_push", "follow_echo"],
        tones: ["paper", "follow"],
        next: ["duplicate_you", "budget_aquarium"],
        aftermaths: [
          "会场里每个人都像认识你，只是都默认你已经听过开场白。",
          "你记下的内容很有价值，唯一问题是纸上墨迹总比主持人的嘴快半句。"
        ],
        logs: [
          "log: repeat seminar attended with written trace",
          "log: note-taking lagged behind prewritten content"
        ]
      },
      {
        text: "转发给一个你信得过的同事，看看他会不会也收到“再次参加”",
        delta: { service: 2, luck: 1 },
        flags: ["official", "service_more"],
        tones: ["service", "official"],
        next: ["coauthor_shadow", "dean_smile"],
        aftermaths: [
          "同事回复说他也收到了，只不过抬头写的是“欢迎回来”。",
          "你终于得到旁证，同时把对方也礼貌地拖进了这层叙事。"
        ],
        logs: [
          "log: seminar invitation propagated to peer",
          "log: loop verified by independent recipient"
        ]
      },
      {
        text: "撕掉邀请函，只留下信封和邮戳做纪念",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["office_404", "ghost_postdoc"],
        aftermaths: [
          "纸是撕掉了，邮戳却第二天完整出现在你的会议记录页眉里。",
          "你避免了当晚出席，但并没能阻止邀请函在别的载体上继续上班。"
        ],
        logs: [
          "log: invite destroyed, postage persisted",
          "log: attendance obligation deferred, not canceled"
        ]
      }
    ]
  },
  {
    id: "budget_aquarium",
    minTurn: 5,
    requiredAnyFlags: ["grant_chase", "follow_echo"],
    tag: "财务玻璃缸",
    risk: "高",
    title: "会吐评语的鱼",
    text: "财务室角落的鱼缸今天很忙。每条鱼张口时，泡泡里都会冒出一小段评审意见，语气比人类评审更平静也更残忍。",
    choices: [
      {
        text: "往缸里投一点预算删减，看看它们偏爱哪种节约方式",
        delta: { grant: 3, service: 1, health: -1 },
        flags: ["grant_chase", "official"],
        tones: ["grant", "official"],
        next: ["donor_dinner", "dean_smile"],
        aftermaths: [
          "鱼群很满意，围着你转了一圈，顺便吐出一句“建议聚焦主线”。",
          "你摸到了一点它们的口味，代价是自己也开始按鱼的方式理解项目。"
        ],
        logs: [
          "log: budget fish responded to austerity bait",
          "log: panel language emitted through bubbles"
        ]
      },
      {
        text: "把泡泡轨迹记下来，尝试从中推算评审排序",
        delta: { paper: 2, grant: 1, luck: 2 },
        flags: ["question_system", "paper_push"],
        tones: ["grant", "paper", "question"],
        next: ["metrics_fever", "forgotten_dataset"],
        aftermaths: [
          "你画出的图比想象中稳定，像一套早就有人用过的水下排序法。",
          "推算结果很有用，只是最后一条线直接连到了你办公室门口。"
        ],
        logs: [
          "log: bubble paths converted into ranking heuristic",
          "log: finance aquarium linked to local office"
        ]
      },
      {
        text: "盯着玻璃看到第二间房间出现，再决定要不要继续申报",
        delta: { luck: 3, health: -1 },
        flags: ["hide", "burnout"],
        tones: ["hide", "follow"],
        next: ["duplicate_you", "retirement_party"],
        aftermaths: [
          "第二间房间里也有一个你，正在很熟练地删预算中的最后一项人力成本。",
          "你一时忘了自己是在看鱼还是在看未来，于是两边都冲你摆尾。"
        ],
        logs: [
          "log: aquarium reflection revealed secondary office",
          "log: user observed alternate self under budget stress"
        ]
      }
    ]
  },
  {
    id: "duplicate_you",
    minTurn: 6,
    requiredAnyFlags: ["follow_echo", "hide", "question_system"],
    tag: "会面",
    risk: "极高",
    title: "已经上岸又已经离开的你",
    text: "你终于遇到了那个版本的自己：他像已经上岸，又像早就离开；胸牌上写着你的名字，背面却是另一个部门的章。",
    choices: [
      {
        text: "和他交换日历，看看哪一份更像真正的本周",
        delta: { luck: 3, service: 1, health: -1 },
        flags: ["official", "follow_echo"],
        tones: ["official", "follow"],
        next: ["retirement_party", "dean_smile"],
        aftermaths: [
          "你们的日历只有周三重叠，其余时间像被两套院系借走了。",
          "交换之后，你手机里立刻多了一场从未报名的答辩。"
        ],
        logs: [
          "log: calendar exchange executed between versions",
          "log: weekly schedule now partially dual-authored"
        ]
      },
      {
        text: "直接问他：哪一扇门绝对不要再打开第二次",
        delta: { paper: 1, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["office_404", "phantom_lab"],
        aftermaths: [
          "他没回答门牌号，只在你手心写了一个楼层，然后像熟悉流程一样先行离场。",
          "你得到的不是禁令，而是一种非常具体的犹豫。"
        ],
        logs: [
          "log: alternate self supplied restricted location clue",
          "log: warning delivered without overt refusal"
        ]
      },
      {
        text: "假装不认识，看看系统会不会因此把你们分成两个人",
        delta: { health: 1, luck: 2, paper: 1 },
        flags: ["hide", "burnout"],
        tones: ["hide", "health"],
        next: ["corridor_nameplate", "retirement_party"],
        aftermaths: [
          "系统表面上接受了你的装傻，转头就在门禁日志里把你们排成上下两行。",
          "你暂时避免了正面对话，但那张熟悉的脸开始在更多玻璃里值班。"
        ],
        logs: [
          "log: identity split attempt only partially successful",
          "log: duplicate presence now distributed through reflections"
        ]
      }
    ]
  },
  {
    id: "retirement_party",
    minTurn: 6,
    requiredAnyFlags: ["burnout", "health_patch", "service_more", "hide"],
    tag: "茶歇区",
    risk: "极高",
    title: "为错误版本举办的退休宴",
    text: "楼里忽然给一位和你履历几乎一致的人办退休茶歇。蛋糕上名字没错，照片却像你在另一个院系里熬出来的脸。",
    choices: [
      {
        text: "先上去致辞，看看在别人的退休宴上道谢会不会更轻松",
        delta: { service: 2, luck: 2, health: -1 },
        flags: ["official", "service_more"],
        tones: ["service", "official"],
        next: ["dean_smile", "committee_pearl"],
        aftermaths: [
          "大家都听得很认真，像你终于说出了他们一直等的那段告别词。",
          "你致辞完才发现台下有几个人正核对你和照片的皱纹走势。"
        ],
        logs: [
          "log: retirement speech delivered by non-retired matching entity",
          "log: audience accepted overlap with minimal friction"
        ]
      },
      {
        text: "顺走一块蛋糕，从服务电梯悄悄撤离现场",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["office_404", "blank_id_card"],
        aftermaths: [
          "蛋糕很好吃，奶油里却夹着一张你下周的院务安排。",
          "你撤得很干净，只在电梯镜面里留下了一句“辛苦了”。"
        ],
        logs: [
          "log: retreat executed with ceremonial dessert",
          "log: cake contained future administrative insert"
        ]
      },
      {
        text: "当场问一句：今天退休的究竟是哪一个我",
        delta: { paper: 1, luck: 3 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["duplicate_you", "sealed_seminar"],
        aftermaths: [
          "空气安静得像刚被消音，随后有人给你递来了一张补办工牌申请。",
          "没有人回答，但每个人都表现得像终于等到你问这句。"
        ],
        logs: [
          "log: retirement identity ambiguity raised publicly",
          "log: event transitioned into archive-tier anomaly"
        ]
      }
    ]
  },
  {
    id: "hallway_kettle",
    minTurn: 2,
    weight: 0.8,
    tag: "公共区",
    risk: "低",
    title: "会记住拒稿温度的热水壶",
    text: "茶水间的热水壶总能精准烧到你上一封拒稿信到达时的温度。今天它比平时更快一些。",
    choices: [
      {
        text: "顺手给所有人都倒一杯，看看共饮能不能把气氛拉回人间",
        delta: { service: 2, health: 1 },
        flags: ["service_more", "health_patch"],
        tones: ["service", "health"],
        next: ["committee_pearl", "basement_minutes"],
        aftermaths: [
          "大家都很感谢，只有热水壶在你转身时自己轻轻补了一壶。",
          "这一举动确实让房间柔和了一点，也让你在壶的记忆里变得很重要。"
        ],
        logs: [
          "log: communal kettle entered host-recognition mode",
          "log: morale bump achieved through hydration"
        ]
      },
      {
        text: "看着蒸汽发散，尝试把它当成对接下来一周的天气预报",
        delta: { luck: 2, paper: 1 },
        flags: ["follow_echo"],
        tones: ["follow", "question"],
        next: ["funding_oracle", "reviewer_from_tomorrow"],
        aftermaths: [
          "蒸汽在窗上画出一个会场平面图，你看懂了一半，另一半像故意留到夜里。",
          "你本来只是发呆，结果蒸汽极有服务意识地给了你两个楼号。"
        ],
        logs: [
          "log: vapor patterns interpreted as route guidance",
          "log: kettle joined advisory ecosystem"
        ]
      },
      {
        text: "把壶抱回办公室，今晚只允许它对着你一个人沸腾",
        delta: { health: 1, luck: 1 },
        flags: ["hide"],
        tones: ["hide", "health"],
        next: ["office_404", "corridor_nameplate"],
        aftermaths: [
          "壶很配合，直到半夜自己发出第二次开水提示音。",
          "你把它带离公共区后，走廊突然显得像少了一个会说话的人。"
        ],
        logs: [
          "log: kettle relocated to private office",
          "log: background anomaly density shifted with appliance"
        ]
      }
    ]
  },
  {
    id: "campus_map",
    minTurn: 3,
    weight: 0.8,
    tag: "导航",
    risk: "低",
    title: "新增建筑的校园地图",
    text: "手机地图忽然多出一栋从未见过的楼，楼名恰好是本周学院最爱说的那个指标词。",
    choices: [
      {
        text: "顺着最短路线走过去，看看指标到底想住在哪",
        delta: { grant: 1, luck: 2 },
        flags: ["official", "grant_chase"],
        tones: ["official", "grant"],
        next: ["donor_dinner", "travel_reimbursement"],
        aftermaths: [
          "路线把你带进一条平时从不开放的连廊，尽头挂着一张新楼落成合影。",
          "你没找到楼，却找到了一套把人送进楼里的交通逻辑。"
        ],
        logs: [
          "log: campus map suggested unverified construction",
          "log: route intersected with ceremonial infrastructure"
        ]
      },
      {
        text: "先截屏，再比对昨晚和今早的版本差了什么",
        delta: { paper: 1, luck: 2, service: 1 },
        flags: ["question_system", "paper_push"],
        tones: ["question", "paper"],
        next: ["forgotten_dataset", "metrics_fever"],
        aftermaths: [
          "你比对出多出来的不只是楼，还有一条专门通往你办公室的步行建议。",
          "截图看似普通，发到电脑上却自动归入“人事变动”文件夹。"
        ],
        logs: [
          "log: navigation diff exposed institutional drift",
          "log: map screenshots reclassified on desktop"
        ]
      },
      {
        text: "关掉地图，按旧习惯走，给脚一点自主权",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["silent_lecture", "ghost_postdoc"],
        aftermaths: [
          "脚很争气，还是把你带到了那栋并不存在的楼旁边。",
          "你坚持老路，校园则耐心地把新东西长在老路两侧。"
        ],
        logs: [
          "log: manual navigation failed to avoid anomaly zone",
          "log: habit trail remains contaminated"
        ]
      }
    ]
  },
  {
    id: "printer_queue",
    minTurn: 4,
    weight: 0.7,
    tag: "打印室",
    risk: "中",
    title: "辞职信预览",
    text: "公共打印队列里排着一个文件：your-resignation-final-final.pdf。提交者显示为你，但时间是下周一清晨。",
    choices: [
      {
        text: "打开预览，至少看看未来自己的排版习惯有没有进步",
        delta: { luck: 3, paper: 1 },
        flags: ["question_system", "follow_echo"],
        tones: ["question", "follow"],
        next: ["duplicate_you", "corridor_nameplate"],
        aftermaths: [
          "辞职信写得非常克制，克制到像一篇已经过审的短通讯。",
          "你没看完全，因为第二页顶部突然出现了今天的日期。"
        ],
        logs: [
          "log: resignation draft preview opened",
          "log: print queue contains forward-authored document"
        ]
      },
      {
        text: "用课程大纲覆盖这条打印任务，让教学先把它压下去",
        delta: { teaching: 2, service: 1 },
        flags: ["teaching_mask", "official"],
        tones: ["teaching", "official"],
        next: ["student_feedback", "copied_minutes"],
        aftermaths: [
          "大纲确实盖住了它，但打印机在边角留下一行极细的“稍后继续”。",
          "你暂时赢了一手操作顺序，输给了打印室那种慢悠悠的记性。"
        ],
        logs: [
          "log: resignation file pushed down by syllabus print job",
          "log: printer retained deferred output marker"
        ]
      },
      {
        text: "取消任务并拔掉打印机，今晚谁都别说重话",
        delta: { health: 2, luck: 1 },
        flags: ["hide", "health_patch"],
        tones: ["hide", "health"],
        next: ["office_404", "retirement_party"],
        aftermaths: [
          "打印机安静了，但出纸口里还卡着一句“敬请理解”。",
          "你救回了这个晚上，却把那份文件留在了系统的明天。"
        ],
        logs: [
          "log: print queue interrupted by power loss",
          "log: unresolved document persisted in spool memory"
        ]
      }
    ]
  }
];

const root = typeof window !== "undefined" ? window : globalThis;

function byId(id) {
  return document.querySelector(`#${id}`);
}

const elements = {
  profile: byId("profile"),
  mode: byId("mode"),
  profileNote: byId("profileNote"),
  startBtn: byId("startBtn"),
  startHeroBtn: byId("startHeroBtn"),
  restartBtn: byId("restartBtn"),
  dailySeedBtn: byId("dailySeedBtn"),
  seedBtn: byId("seedBtn"),
  seedLabel: byId("seedLabel"),
  rank: byId("rank"),
  crisis: byId("crisis"),
  semester: byId("semester"),
  status: byId("status"),
  mood: byId("mood"),
  combo: byId("combo"),
  stats: byId("stats"),
  wheel: byId("wheel"),
  eventTag: byId("eventTag"),
  eventRisk: byId("eventRisk"),
  eventTitle: byId("eventTitle"),
  eventText: byId("eventText"),
  activeRule: byId("activeRule"),
  choices: byId("choices"),
  timeline: byId("timeline"),
  resultBox: byId("resultBox"),
  endingTitle: byId("endingTitle"),
  endingText: byId("endingText"),
  diagnosisCard: byId("diagnosisCard"),
  shareText: byId("shareText"),
  copyBtn: byId("copyBtn")
};

let seed = 246810;

const state = {
  profile: "balanced",
  mode: "standard",
  turn: 1,
  maxTurns: modeSettings.standard.turns,
  stats: cloneStats(profiles.balanced),
  mood: moods[0],
  rule: absurdRules[0],
  current: null,
  currentChoices: [],
  storyFlags: new Set(),
  ghostFlags: new Set(),
  seenScenes: new Set(),
  queue: [],
  history: [],
  routeWeights: {},
  routeSignature: [],
  latestMemo: "同样的选择，不一定会把你送往同样的地方。",
  awaitingContinue: false,
  pendingFinish: false,
  ending: null,
  started: false,
  finished: false
};

function cloneStats(stats) {
  return JSON.parse(JSON.stringify(stats));
}

function seededRandom() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function reseed(nextSeed) {
  seed = (Number(nextSeed) >>> 0) || 1;
  updateSeedLabel();
}

function randomSeed() {
  reseed(Math.floor(Math.random() * 0xffffffff));
}

function useDailySeed() {
  const now = new Date();
  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  reseed(hashString(dayKey));
}

function formatSeed() {
  return `FR-${String(seed % 1000000).padStart(6, "0")}`;
}

function updateSeedLabel() {
  if (elements.seedLabel) {
    elements.seedLabel.textContent = formatSeed();
  }
}

function pick(list) {
  return list[Math.floor(seededRandom() * list.length)];
}

function addDelta(target, delta) {
  for (const [key, value] of Object.entries(delta)) {
    target[key] = (target[key] || 0) + value;
  }
}

function mergeDeltas(...parts) {
  const merged = {};
  for (const part of parts) {
    addDelta(merged, part || {});
  }
  return merged;
}

function scaleDelta(delta) {
  const multiplier = modeSettings[state.mode].multiplier;
  const scaled = {};
  for (const [key, value] of Object.entries(delta || {})) {
    const scaledValue = value > 0
      ? Math.max(1, Math.round(value * multiplier))
      : Math.min(-1, Math.round(value * multiplier));
    scaled[key] = scaledValue;
  }
  return scaled;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hasTone(choice, tone) {
  return Array.isArray(choice.tones) && choice.tones.includes(tone);
}

function applyRule(choice) {
  return state.rule ? state.rule.apply(choice, state) || {} : {};
}

function moodDelta() {
  return state.mood ? state.mood.bonus || {} : {};
}

function applyStats(delta) {
  for (const [key, value] of Object.entries(delta)) {
    state.stats[key] = clamp((state.stats[key] || 0) + value);
  }
}

function cleanDelta(delta) {
  const cleaned = {};
  for (const [key, value] of Object.entries(delta)) {
    if (value) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function formatDelta(delta) {
  return Object.entries(delta)
    .map(([key, value]) => `${statLabels[key]}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
}

function formatChoicePreview(choice) {
  const scaled = scaleDelta(choice.delta || {});
  const summary = cleanDelta(scaled);
  return Object.keys(summary).length ? formatDelta(summary) : "剧情推进";
}

function routeWeight(tone) {
  return state.routeWeights[tone] || 0;
}

function noteRoute(choice) {
  for (const tone of choice.tones || []) {
    state.routeWeights[tone] = (state.routeWeights[tone] || 0) + 1;
  }
}

function addFlags(flags) {
  for (const flag of flags || []) {
    state.storyFlags.add(flag);
    if (
      flag.startsWith("ghost.") ||
      flag.startsWith("echo.") ||
      flag.startsWith("void_") ||
      flag.includes("echo") ||
      flag.includes("future") ||
      flag.includes("void") ||
      flag.includes("ghost") ||
      flag.includes("duplicate")
    ) {
      state.ghostFlags.add(flag);
    }
  }
}

function topRouteTones() {
  return Object.entries(state.routeWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tone]) => tone);
}

function getComboLabel() {
  const leaders = topRouteTones();
  if (!leaders.length) {
    return "尚未形成";
  }
  const labels = {
    paper: "论文偏航",
    grant: "基金过载",
    teaching: "课堂回声",
    service: "事务菌丝",
    health: "求生补丁",
    luck: "侥幸导航",
    hide: "低调潜行",
    follow: "追踪回声",
    official: "礼貌流程",
    question: "逆向盘问",
    care: "善意续命"
  };
  return leaders.map((tone) => labels[tone] || tone).join(" / ");
}

function getCrisisScore() {
  let risk = 0;
  for (const value of Object.values(state.stats)) {
    if (value < 45) risk += 1;
    if (value < 30) risk += 1;
  }
  risk += Math.floor(state.ghostFlags.size / 2);
  if (state.storyFlags.has("burnout")) {
    risk += 2;
  }
  return risk;
}

function crisisLabel() {
  const risk = getCrisisScore();
  if (risk >= 8) return "红区";
  if (risk >= 5) return "橙区";
  if (risk >= 3) return "黄区";
  return "绿区";
}

function totalScore() {
  return Object.values(state.stats).reduce((sum, value) => sum + value, 0);
}

function getRankLabel() {
  const total = totalScore();
  const ghost = state.ghostFlags.size;
  if (!state.started) {
    return "未入档";
  }
  if (state.finished && ghost >= 5) {
    return "院系传说本人";
  }
  if (total >= 350 && ghost <= 2) {
    return "表面上岸";
  }
  if (total >= 310) {
    return "仍在编制内";
  }
  if (getCrisisScore() >= 8) {
    return "被系统反向引用";
  }
  return "在编怪谈";
}

function statusLabel() {
  if (!state.started) {
    return "等待开局";
  }
  if (state.finished) {
    return "档案已封存";
  }
  if (state.ghostFlags.size >= 4) {
    return "学院正在改写你";
  }
  if (getCrisisScore() >= 6) {
    return "风险升高";
  }
  return "故事持续推进";
}

function sceneEligible(scene) {
  if (state.seenScenes.has(scene.id)) return false;
  if (scene.kind === "intro") return false;
  if (scene.profiles && !scene.profiles.includes(state.profile)) return false;
  if (scene.minTurn && state.turn < scene.minTurn) return false;
  if (scene.maxTurn && state.turn > scene.maxTurn) return false;
  if (scene.requiredFlags && !scene.requiredFlags.every((flag) => state.storyFlags.has(flag))) {
    return false;
  }
  if (scene.requiredAnyFlags && !scene.requiredAnyFlags.some((flag) => state.storyFlags.has(flag))) {
    return false;
  }
  if (scene.blockedFlags && scene.blockedFlags.some((flag) => state.storyFlags.has(flag))) {
    return false;
  }
  return true;
}

function sceneWeight(scene) {
  let weight = scene.weight || 1;
  for (const flag of scene.requiredAnyFlags || []) {
    if (state.storyFlags.has(flag)) {
      weight += 0.7;
    }
  }
  if (scene.tag.includes("教学") && state.profile === "teaching") weight += 0.8;
  if (scene.tag.includes("申报") && state.profile === "grant") weight += 0.8;
  if (scene.tag.includes("投稿") && state.profile === "paper") weight += 0.8;
  if (scene.tag.includes("B4") && state.profile === "stealth") weight += 0.8;
  if (scene.tag.includes("档案") && state.profile === "balanced") weight += 0.8;
  return weight;
}

function weightedPick(list) {
  const total = list.reduce((sum, scene) => sum + sceneWeight(scene), 0);
  let roll = seededRandom() * total;
  for (const scene of list) {
    roll -= sceneWeight(scene);
    if (roll <= 0) {
      return scene;
    }
  }
  return list[list.length - 1];
}

function queueScene(choice) {
  if (!choice.next || !choice.next.length) return;
  const nextSceneId = pick(choice.next);
  state.queue.unshift(nextSceneId);
}

function pullQueuedScene() {
  while (state.queue.length) {
    const nextId = state.queue.shift();
    const scene = scenePool.find((item) => item.id === nextId);
    if (!scene || state.seenScenes.has(scene.id)) {
      continue;
    }
    if (scene.kind === "intro") {
      if (!scene.profiles || scene.profiles.includes(state.profile)) {
        return scene;
      }
      continue;
    }
    if (sceneEligible(scene)) {
      return scene;
    }
  }
  return null;
}

function pickScene() {
  const queued = pullQueuedScene();
  if (queued) return queued;

  const eligible = scenePool.filter(sceneEligible);
  if (eligible.length) {
    return weightedPick(eligible);
  }

  const fallback = scenePool.filter((scene) => !state.seenScenes.has(scene.id) && scene.kind !== "intro");
  return fallback.length ? weightedPick(fallback) : null;
}

function nextRule() {
  const pool = absurdRules.filter((rule) => rule.id !== state.rule?.id);
  state.rule = pick(pool.length ? pool : absurdRules);
}

function nextMood() {
  const pool = moods.filter((item) => item.name !== state.mood?.name);
  state.mood = pick(pool.length ? pool : moods);
  if (elements.wheel) {
    elements.wheel.style.setProperty("--spin", `${state.mood.spin}deg`);
  }
}

function startGame(profileOverride, modeOverride) {
  state.profile = profileOverride || elements.profile?.value || "balanced";
  state.mode = modeOverride || elements.mode?.value || "standard";
  state.turn = 1;
  state.maxTurns = modeSettings[state.mode].turns;
  state.stats = cloneStats(profiles[state.profile]);
  addDelta(state.stats, modeSettings[state.mode].bonus || {});
  for (const [key, value] of Object.entries(state.stats)) {
    state.stats[key] = clamp(value);
  }
  state.storyFlags = new Set();
  state.ghostFlags = new Set();
  state.seenScenes = new Set();
  state.queue = [];
  state.history = [];
  state.routeWeights = {};
  state.routeSignature = [];
  state.latestMemo = "同样的选择，不一定会把你送往同样的地方。";
  state.awaitingContinue = false;
  state.pendingFinish = false;
  state.ending = null;
  state.started = true;
  state.finished = false;
  state.current = null;
  state.currentChoices = [];

  state.queue.push(introSceneByProfile[state.profile]);
  nextMood();
  nextRule();
  drawEvent();
}

function drawEvent() {
  if (state.finished) {
    render();
    return;
  }

  state.awaitingContinue = false;
  state.pendingFinish = false;

  if (state.turn > state.maxTurns) {
    finishGame();
    return;
  }

  const scene = pickScene();
  if (!scene) {
    finishGame();
    return;
  }

  state.current = scene;
  state.currentChoices = scene.choices || [];
  state.seenScenes.add(scene.id);
  render();
}

function pickAftermath(choice) {
  return pick(choice.aftermaths || ["这一选项很快长出了一层你没要求的后果。"]);
}

function buildDeepAftermath(choice, index, baseAftermath) {
  const stage = stageAftermaths[(state.turn - 1) % stageAftermaths.length] || [];
  const stageText = stage[index % stage.length] || pick(stage.flat());
  if (!baseAftermath || baseAftermath === stageText) {
    return stageText;
  }
  return `${baseAftermath}${stageText}`;
}

function applyChoice(index) {
  if (!state.current || state.finished || state.awaitingContinue) return;
  const choice = state.currentChoices[index];
  if (!choice) return;

  const scaledDelta = scaleDelta(choice.delta || {});
  const ruleDelta = cleanDelta(applyRule(choice));
  const weatherDelta = cleanDelta(moodDelta());
  const finalDelta = cleanDelta(mergeDeltas(scaledDelta, ruleDelta, weatherDelta));
  const baseAftermath = pickAftermath(choice);
  const aftermath = buildDeepAftermath(choice, index, baseAftermath);

  applyStats(finalDelta);
  noteRoute(choice);
  addFlags(choice.flags);
  queueScene(choice);

  const historyEntry = {
    turn: state.turn,
    sceneId: state.current.id,
    title: state.current.title,
    tag: state.current.tag,
    risk: state.current.risk,
    sceneText: state.current.text,
    choiceText: choice.text,
    aftermath,
    mood: state.mood.name,
    ruleLabel: state.rule.label,
    deltaText: Object.keys(finalDelta).length ? formatDelta(finalDelta) : "无直接数值变化"
  };

  state.history.push(historyEntry);
  state.latestMemo = aftermath;
  state.awaitingContinue = true;
  state.pendingFinish = state.history.length >= state.maxTurns;

  render();
}

function continueStory() {
  if (!state.awaitingContinue || state.finished) return;

  state.awaitingContinue = false;

  if (state.pendingFinish) {
    state.pendingFinish = false;
    finishGame();
    return;
  }

  state.turn += 1;
  nextMood();
  nextRule();
  drawEvent();
}

function routeDigest() {
  const leaders = topRouteTones();
  if (!leaders.length) {
    return ["official", "hide"];
  }
  return leaders;
}

function buildEndingProfile() {
  const digest = routeDigest();
  const ghost = state.ghostFlags.size;
  const familyIndex = (
    hashString(
      `${state.profile}|${digest.join("-")}|${state.history[0]?.sceneId || ""}|${ghost}`
    ) % deepEndingFamilies.length
  );
  const fateIndex = (
    hashString(
      `${totalScore()}|${getCrisisScore()}|${state.history.length}|${digest.join("-")}`
    ) % deepEndingFates.length
  );
  const archiveNumber = familyIndex * deepEndingFates.length + fateIndex + 1;
  return {
    family: deepEndingFamilies[familyIndex],
    fate: deepEndingFates[fateIndex],
    archiveNumber
  };
}

function buildRouteEcho() {
  const flags = [...state.storyFlags].slice(-5);
  const echoes = flags
    .map((flag) => routeEchoes[flag])
    .filter(Boolean)
    .slice(-3);

  if (!echoes.length) {
    return "真正麻烦的是，学院后来把这一切统称为“情况已掌握”，仿佛命运只是一类可以归档的问题。";
  }

  return echoes.join("");
}

function buildEndingNarrative() {
  const profile = buildEndingProfile();
  const crisis = crisisLabel();
  const routeText = buildRouteEcho();
  const archive = String(profile.archiveNumber).padStart(3, "0");
  const title = `第${archive}号怪谈：${profile.family.name}·${profile.fate.name}`;
  const text = `${profile.family.setup}${profile.family.mapping}${profile.fate.turn}${routeText}`;

  const diagnosis = [
    `<div class="diag-pill">档案号 ${archive} / 108</div>`,
    `<div class="diag-pill">开局 ${profileLabels[state.profile]}</div>`,
    `<div class="diag-pill">宇宙 ${modeSettings[state.mode].label}</div>`,
    `<div class="diag-pill">主路线 ${getComboLabel()}</div>`,
    `<div class="diag-pill">怪谈痕迹 ${state.ghostFlags.size}</div>`,
    `<div class="diag-pill">风险 ${crisis}</div>`
  ].join("");

  return {
    title,
    text,
    diagnosis,
    archiveNumber: profile.archiveNumber
  };
}

function finishGame() {
  state.finished = true;
  state.current = null;
  state.currentChoices = [];
  state.ending = buildEndingNarrative();
  render();
}

function cleanSentence(text) {
  return String(text || "").trim().replace(/[。！？.!?]+$/, "");
}

function buildStoryTurn(entry) {
  const sceneText = cleanSentence(entry.sceneText);
  const action = cleanSentence(entry.choiceText);
  const aftermath = cleanSentence(entry.aftermath);
  const actionSentence = action
    ? `随后，${action.startsWith("你") ? action : `你${action}`}。`
    : "";
  return `${sceneText}。${actionSentence}${aftermath}。`;
}

function renderStats() {
  if (!elements.stats) return;
  elements.stats.innerHTML = Object.entries(state.stats)
    .map(([key, value]) => `
      <div class="stat" style="--stat-color:${statColors[key]}">
        <span>${statLabels[key]}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");
}

function renderTimeline() {
  if (!elements.timeline) return;

  if (!state.history.length) {
    elements.timeline.innerHTML = `
      <li class="story-thread idle">
        <p class="story-paragraph">选择一种开局风格。不同的开局会把你带进不同的场景链里，而学院会在你做完第一件小事之后，才慢慢显出它真正的叙事习惯。</p>
      </li>
    `;
    return;
  }

  const paragraphs = state.history.map((entry) => `
    <p class="story-paragraph">
      <span class="story-marker">S${entry.turn} · ${entry.title}</span>
      ${buildStoryTurn(entry)}
    </p>
  `);

  if (state.finished && state.ending) {
    paragraphs.push(`
      <p class="story-paragraph finale">
        <span class="story-marker">归档 · ${state.ending.title}</span>
        ${state.ending.text}
      </p>
    `);
  }

  elements.timeline.innerHTML = `<li class="story-thread">${paragraphs.join("")}</li>`;
}

function buildShareText() {
  if (!state.ending) return "";
  return [
    `我在 Faculty Roulette 里走到了档案 ${String(state.ending.archiveNumber).padStart(3, "0")} / 108：${state.ending.title}`,
    `开局：${profileLabels[state.profile]}`,
    `宇宙：${modeSettings[state.mode].label}`,
    `主路线：${getComboLabel()}`,
    `最后一句：${state.latestMemo}`
  ].join("\n");
}

function renderChoices() {
  if (!elements.choices) return;
  elements.choices.innerHTML = "";

  if (state.awaitingContinue) {
    const entry = state.history[state.history.length - 1];
    if (!entry) return;

    const button = document.createElement("button");
    button.className = "aftermath-card";
    button.innerHTML = `
      <span class="aftermath-kicker">这一页继续往下写</span>
      <p>${entry.aftermath}</p>
      <small>${state.pendingFinish ? "点这里封存这一轮" : "点这里翻到下一幕"}</small>
    `;
    button.addEventListener("click", continueStory);
    elements.choices.appendChild(button);
    return;
  }

  if (!state.current || state.finished) {
    return;
  }

  for (const [index, choice] of state.currentChoices.entries()) {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.innerHTML = `
      <strong>${choice.text}</strong>
      <small>${formatChoicePreview(choice)}</small>
    `;
    button.addEventListener("click", () => applyChoice(index));
    elements.choices.appendChild(button);
  }
}

function renderEvent() {
  if (state.current && !state.finished) {
    elements.eventTag.textContent = state.current.tag;
    elements.eventRisk.textContent = `risk: ${state.current.risk}`;
    elements.eventTitle.textContent = state.current.title;
    elements.eventText.textContent = state.current.text;
    elements.activeRule.textContent = state.awaitingContinue
      ? "纸面暂时安静下来，下一页还没有翻开。"
      : state.rule.label;
    return;
  }

  elements.eventTag.textContent = state.finished ? "档案封存" : "事件卡";
  elements.eventRisk.textContent = state.finished ? "risk: archived" : "risk: --";
  elements.eventTitle.textContent = state.finished ? state.ending.title : "尚未抽卡";
  elements.eventText.textContent = state.finished
    ? "这一轮的完整经历已经封存到下方档案里。"
    : "选择开局风格，然后开始你的学术怪谈历程。";
  elements.activeRule.textContent = state.started
    ? modeSettings[state.mode].rule
    : "本学期特殊规则：尚未生成。";
}

function renderHeader() {
  elements.rank.textContent = getRankLabel();
  elements.crisis.textContent = crisisLabel();
  if (elements.semester) {
    elements.semester.textContent = state.started ? `S${state.turn}/${state.maxTurns}` : "-";
  }
  if (elements.status) {
    elements.status.textContent = statusLabel();
  }
  if (elements.mood) {
    elements.mood.textContent = state.started ? state.mood.name : "尚未抽取";
  }
  if (elements.combo) {
    elements.combo.textContent = getComboLabel();
  }
}

function renderResult() {
  if (!elements.resultBox) return;

  if (!state.finished || !state.ending) {
    elements.resultBox.hidden = true;
    elements.shareText.value = "";
    return;
  }

  elements.resultBox.hidden = false;
  elements.endingTitle.textContent = state.ending.title;
  elements.endingText.textContent = state.ending.text;
  elements.diagnosisCard.innerHTML = state.ending.diagnosis;
  elements.shareText.value = buildShareText();
}

function render() {
  renderHeader();
  renderStats();
  renderTimeline();
  renderEvent();
  renderChoices();
  renderResult();
}

function updateProfileNote() {
  if (!elements.profileNote) return;
  const profile = elements.profile?.value || "balanced";
  elements.profileNote.textContent = profileNotes[profile];
}

async function copyShareText() {
  if (!elements.shareText?.value) return;
  try {
    await navigator.clipboard.writeText(elements.shareText.value);
    state.latestMemo = "结局文本已复制。它现在可以去别人的聊天窗口里继续上班。";
    renderEvent();
  } catch {
    state.latestMemo = "复制失败，但文本还在下面。今天可能是剪贴板在闹怪谈。";
    renderEvent();
  }
}

function snapshot() {
  return {
    profile: state.profile,
    mode: state.mode,
    turn: state.turn,
    maxTurns: state.maxTurns,
    started: state.started,
    finished: state.finished,
    currentSceneId: state.current?.id || null,
    currentTitle: state.current?.title || null,
    currentChoices: state.currentChoices.map((choice) => choice.text),
    memo: state.latestMemo,
    awaitingContinue: state.awaitingContinue,
    pendingFinish: state.pendingFinish,
    historyLength: state.history.length,
    historyTitles: state.history.map((entry) => entry.title),
    history: state.history.map((entry) => ({
      turn: entry.turn,
      sceneId: entry.sceneId,
      title: entry.title,
      choiceText: entry.choiceText,
      aftermath: entry.aftermath
    })),
    queue: [...state.queue],
    flags: [...state.storyFlags],
    ghostFlags: [...state.ghostFlags],
    endingTitle: elements.endingTitle?.textContent || "",
    diagnosisHtml: elements.diagnosisCard?.innerHTML || "",
    timelineHtml: elements.timeline?.innerHTML || "",
    shareText: elements.shareText?.value || ""
  };
}

if (elements.profile) {
  elements.profile.addEventListener("change", updateProfileNote);
}
elements.startBtn?.addEventListener("click", () => startGame());
elements.startHeroBtn?.addEventListener("click", () => startGame());
elements.restartBtn?.addEventListener("click", () => startGame());
elements.seedBtn?.addEventListener("click", () => {
  randomSeed();
  if (state.started) {
    startGame(elements.profile?.value, elements.mode?.value);
  }
});
elements.dailySeedBtn?.addEventListener("click", () => {
  useDailySeed();
  startGame(elements.profile?.value, elements.mode?.value);
});
elements.copyBtn?.addEventListener("click", copyShareText);

updateProfileNote();
updateSeedLabel();
render();

root.__facultyRouletteDebug = {
  setSeed(nextSeed) {
    reseed(nextSeed);
    return formatSeed();
  },
  start(profile = "balanced", mode = "standard", nextSeed) {
    if (elements.profile) elements.profile.value = profile;
    if (elements.mode) elements.mode.value = mode;
    updateProfileNote();
    if (typeof nextSeed === "number") {
      reseed(nextSeed);
    }
    startGame(profile, mode);
    return snapshot();
  },
  choose(index = 0) {
    applyChoice(index);
    return snapshot();
  },
  continue() {
    continueStory();
    return snapshot();
  },
  getState() {
    return snapshot();
  }
};

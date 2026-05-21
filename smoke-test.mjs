import fs from "node:fs";
import vm from "node:vm";

class FakeElement {
  constructor(id) {
    this.id = id;
    this.children = [];
    this.hidden = false;
    this.listeners = {};
    this.style = {
      setProperty: (key, value) => {
        this.style[key] = value;
      }
    };
    this.className = "";
    this.value = "";
    this.attributes = {};
    this._innerHTML = "";
    this._textContent = "";
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    if (value === "") {
      this.children = [];
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set textContent(value) {
    this._textContent = String(value);
  }

  get textContent() {
    return this._textContent;
  }

  addEventListener(type, fn) {
    this.listeners[type] = fn;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  querySelectorAll() {
    return [];
  }
}

const ids = [
  "profile",
  "mode",
  "profileNote",
  "startBtn",
  "startHeroBtn",
  "restartBtn",
  "dailySeedBtn",
  "seedBtn",
  "seedLabel",
  "rank",
  "crisis",
  "wheel",
  "eventTag",
  "eventRisk",
  "eventTitle",
  "eventText",
  "activeRule",
  "choices",
  "timeline",
  "resultBox",
  "endingTitle",
  "endingText",
  "diagnosisCard",
  "shareText",
  "copyBtn"
];

const elements = new Map(ids.map((id) => [id, new FakeElement(id)]));
elements.get("profile").value = "balanced";
elements.get("mode").value = "standard";

const root = new URL("./", import.meta.url);
const html = fs.readFileSync(new URL("index.html", root), "utf8");
const app = fs.readFileSync(new URL("app.js", root), "utf8");

if (!html.includes("Faculty Roulette")) throw new Error("HTML title copy is missing.");
if (!html.includes("完整历程")) throw new Error("Story dossier section is missing.");
if (html.includes("ending-story-wrap")) throw new Error("Separate full story archive section should be removed.");
if (html.includes("校园传说图鉴")) throw new Error("Bestiary section should be removed from the page.");
if (html.includes("本局成就")) throw new Error("Achievements section should be removed from the page.");
if (html.includes("长期项目槽")) throw new Error("Project slot section should be removed from the page.");
if (html.includes("board-head")) throw new Error("Large status header should be removed from the story board.");
if (html.includes('id="stats"')) throw new Error("Large stat grid should be removed from the story board.");
if (html.includes("剧情余波")) throw new Error("The explicit aftermath label should be removed.");
if (html.includes('id="memoText"')) throw new Error("Separate aftermath memo panel should be removed.");
if (html.includes("terminal") || html.includes('id="log"')) throw new Error("Visible system log should be removed.");
if (/buildDeepAftermath|const stage = stageAftermaths/.test(app)) {
  throw new Error("Choice aftermaths should not be stitched to unrelated stage-level snippets.");
}

const context = {
  Date,
  Math,
  console,
  navigator: {
    clipboard: {
      writeText: async () => true
    }
  },
  document: {
    createElement(tag) {
      return new FakeElement(tag);
    },
    querySelector(selector) {
      return elements.get(selector.replace("#", ""));
    }
  },
  setTimeout,
  clearTimeout
};

vm.runInNewContext(app, context, { filename: "app.js" });

const debug = context.__facultyRouletteDebug;
if (!debug) throw new Error("Debug helper was not exposed.");

let snapshot = debug.start("paper", "standard", 1111);
if (snapshot.currentSceneId !== "paper_intro") throw new Error("Paper profile should start from its own intro scene.");

snapshot = debug.start("teaching", "standard", 1111);
if (snapshot.currentSceneId !== "teaching_intro") throw new Error("Teaching profile should start from its own intro scene.");

const firstBranch = debug.start("paper", "standard", 1200);
if (firstBranch.currentChoices.length < 2) throw new Error("Paper intro should expose multiple choices.");
let afterChoice = debug.choose(0);
if (!afterChoice.awaitingContinue) throw new Error("Choice should first render an aftermath continuation state.");
if (!/aftermath-card/.test(elements.get("choices").children[0]?.className || "")) {
  throw new Error("Aftermath should replace the original choice area.");
}
const aftermathCardHtml = elements.get("choices").children[0]?._innerHTML || "";
if (/你第一次注意到学院夜里|共享盘里出现|打印机开始优先输出/.test(aftermathCardHtml)) {
  throw new Error("Aftermath card should not show generic transition beats as extra story prompts.");
}
if (/aftermath-kicker|点这里/.test(aftermathCardHtml)) {
  throw new Error("Aftermath card should expose only one clear continuation affordance.");
}
if (!/aftermath-cta/.test(aftermathCardHtml)) {
  throw new Error("Aftermath card should render a single continuation CTA.");
}
const branchA = debug.continue().currentSceneId;
debug.start("paper", "standard", 1200);
debug.choose(1);
const branchB = debug.continue().currentSceneId;
if (branchA === branchB) throw new Error("Different first choices should lead to different next scenes.");

const memoVariants = new Set();
for (const nextSeed of [2001, 2002, 2003, 2004]) {
  debug.start("grant", "standard", nextSeed);
  memoVariants.add(debug.choose(0).memo);
}
if (memoVariants.size < 2) throw new Error("The same choice should be able to produce different creepy aftermaths.");

snapshot = debug.start("balanced", "publish", 3003);
let safety = 40;
while (!snapshot.finished && safety > 0) {
  snapshot = debug.choose(0);
  if (!snapshot.awaitingContinue) throw new Error("Every selected scene should pause on aftermath.");
  if (!snapshot.finished) {
    snapshot = debug.continue();
  }
  safety -= 1;
}

if (!snapshot.finished) throw new Error("Game did not reach ending state.");
if (snapshot.historyLength < 12) throw new Error("A full run should contain a longer branching story.");
if (!/story-thread/.test(snapshot.timelineHtml)) throw new Error("Story thread did not render.");
if (!/story-paragraph/.test(snapshot.timelineHtml)) throw new Error("Continuous story paragraphs did not render.");
if (/你的选择|你当时/.test(snapshot.timelineHtml)) throw new Error("Story should not use explicit choice labels.");
if (/你第一次注意到学院夜里|共享盘里出现|打印机开始优先输出/.test(snapshot.timelineHtml)) {
  throw new Error("Timeline should not append generic transition beats to each story paragraph.");
}
if (!/第\d{3}号怪谈/.test(snapshot.endingTitle)) throw new Error("Deep dossier-style ending title did not render.");
if (!/档案返修处|预审雨棚|共享盘地下河|指标标本室|会议回声井|预算折叠层|仪器养殖场|引用香火台|伦理镜像库|招聘回廊|署名迁徙带|绩效天象馆/.test(snapshot.timelineHtml)) {
  throw new Error("Final story should include a deep archive family ending.");
}
if (!/108/.test(snapshot.diagnosisHtml)) throw new Error("108-ending archive marker did not render.");
if (!snapshot.shareText.includes("Faculty Roulette")) throw new Error("Share text is incomplete.");

console.log("Faculty Roulette smoke test passed.");

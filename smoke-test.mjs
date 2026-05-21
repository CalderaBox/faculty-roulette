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
  "semester",
  "status",
  "mood",
  "combo",
  "stats",
  "wheel",
  "eventTag",
  "eventRisk",
  "eventTitle",
  "eventText",
  "activeRule",
  "choices",
  "memoText",
  "trajectory",
  "timeline",
  "log",
  "resultBox",
  "endingTitle",
  "endingText",
  "diagnosisCard",
  "endingStory",
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
if (!html.includes("完整历程")) throw new Error("Full story archive section is missing.");
if (html.includes("校园传说图鉴")) throw new Error("Bestiary section should be removed from the page.");
if (html.includes("本局成就")) throw new Error("Achievements section should be removed from the page.");
if (html.includes("长期项目槽")) throw new Error("Project slot section should be removed from the page.");

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
const branchA = debug.choose(0).currentSceneId;
const branchB = debug.start("paper", "standard", 1200) && debug.choose(1).currentSceneId;
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
  safety -= 1;
}

if (!snapshot.finished) throw new Error("Game did not reach ending state.");
if (snapshot.historyLength < 12) throw new Error("A full run should contain a longer branching story.");
if (!/timeline-step/.test(snapshot.timelineHtml)) throw new Error("Timeline did not render story steps.");
if (!/ending-scene/.test(snapshot.endingStoryHtml)) throw new Error("Ending dossier did not render the full story archive.");
if (!/你当时/.test(snapshot.endingStoryHtml)) throw new Error("Ending story archive is missing choice narration.");
if (!/108/.test(snapshot.diagnosisHtml)) throw new Error("108-ending archive marker did not render.");
if (!snapshot.shareText.includes("Faculty Roulette")) throw new Error("Share text is incomplete.");

console.log("Faculty Roulette smoke test passed.");

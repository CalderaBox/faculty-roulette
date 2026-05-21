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

function textOnly(value) {
  return String(value || "").replace(/<[^>]+>/g, "");
}

function storySentences(value) {
  return textOnly(value)
    .split(/[。！？!?]+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 18);
}

function duplicateSentences(value) {
  const counts = new Map();
  for (const sentence of storySentences(value)) {
    counts.set(sentence, (counts.get(sentence) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1);
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
  "choices",
  "timeline",
  "endingTitle"
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
if (html.includes('id="resultBox"') || html.includes('id="diagnosisCard"') || html.includes('id="shareText"') || html.includes("复制结局文本")) {
  throw new Error("Diagnostic/share result panel should be removed from the page.");
}
if (html.includes("rule-strip") || html.includes('id="activeRule"') || html.includes("本学期特殊规则")) {
  throw new Error("Visible special-rule strip should be removed from the story surface.");
}
if (/const absurdRules|function applyRule|function nextRule/.test(app)) {
  throw new Error("Special-rule system should not add hidden, unexplained outcome changes.");
}
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

const contentReport = debug.getContentReport();
if (contentReport.sceneCount < 44) throw new Error("Scene pool should include the expanded weird-tale set.");
if (contentReport.choiceCount < 132) throw new Error("Expanded scene pool should expose more choice variety.");
if (contentReport.uniqueSceneIds !== contentReport.sceneCount) throw new Error("Scene IDs should be unique.");
if (contentReport.runLengthRange?.min !== 8 || contentReport.runLengthRange?.max !== 12) {
  throw new Error("A run should randomly contain 8-12 scene questions.");
}
if (!contentReport.randomProfileEnabled) throw new Error("Random profile default should be available.");

const aftermathReport = debug.getAftermathPoolReport();
if (aftermathReport.totalChoices < 100) throw new Error("Aftermath pool report is missing choices.");
if (aftermathReport.min < 5) throw new Error("Every choice should expose several bound aftermath variants.");
if (aftermathReport.underFour.length) throw new Error("Some choices have too few bound aftermath variants.");
if (aftermathReport.minChars < 30) throw new Error("Every aftermath variant should still read as a story beat.");
if (aftermathReport.avgChars > 150) throw new Error("Aftermath variants should stay shorter than the previous long-form version.");
if (aftermathReport.shortAftermaths.length) throw new Error("Some choices still have too-short aftermath variants.");

const endingDossierReport = debug.getEndingDossierReport();
if (endingDossierReport.total !== 108) throw new Error("Ending dossier table should contain exactly 108 results.");
if (endingDossierReport.uniqueTitles !== 108) throw new Error("Every ending dossier should have a unique weird-tale title.");
if (endingDossierReport.uniqueTexts !== 108) throw new Error("Every ending dossier should have unique story text.");
if (endingDossierReport.uniqueTitleOpenings < 100) throw new Error("Ending dossier titles should not feel like one repeated naming template.");
if (endingDossierReport.uniqueTextOpenings < 100) throw new Error("Ending dossier prose should start with varied images and situations.");
if (endingDossierReport.missingCases.length) throw new Error("Some ending dossier cases are missing bespoke text.");
if (endingDossierReport.duplicateSentences.length) throw new Error("Ending dossiers should not repeat full sentences.");
if (endingDossierReport.minTextLength < 35) throw new Error("Ending dossier text should still contain a specific story beat.");

const randomA = debug.start("random", "standard", 6101);
const randomB = debug.start("random", "standard", 6102);
if (randomA.profile === "random" || randomB.profile === "random") {
  throw new Error("Random profile should resolve to a concrete profile.");
}
if (randomA.profile === randomB.profile) {
  throw new Error("Consecutive random profile starts should avoid repeating the same concrete profile.");
}

const sampledRunLengths = new Set();
for (const nextSeed of [7101, 7102, 7103, 7104, 7105, 7106, 7107, 7108]) {
  const run = debug.start("balanced", "standard", nextSeed);
  if (run.maxTurns < 8 || run.maxTurns > 12) {
    throw new Error(`Random run length should stay within 8-12 scenes, got ${run.maxTurns}.`);
  }
  sampledRunLengths.add(run.maxTurns);
}
if (sampledRunLengths.size < 2) throw new Error("Run length should vary across seeds.");

let snapshot = debug.start("paper", "standard", 1111);
if (snapshot.currentSceneId !== "paper_intro") throw new Error("Paper profile should start from its own intro scene.");

snapshot = debug.start("teaching", "standard", 1111);
if (snapshot.currentSceneId !== "teaching_intro") throw new Error("Teaching profile should start from its own intro scene.");

const firstBranch = debug.start("paper", "standard", 1200);
if (firstBranch.currentChoices.length < 2) throw new Error("Paper intro should expose multiple choices.");
if (/<small>|[+-]\d/.test(firstBranch.choicesHtml)) {
  throw new Error("Choice buttons should not show stat preview annotations.");
}
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
  if (!snapshot.finished && !snapshot.awaitingContinue) throw new Error("Every non-final selected scene should pause on aftermath.");
  if (!snapshot.finished) {
    snapshot = debug.continue();
  }
  safety -= 1;
}

if (!snapshot.finished) throw new Error("Game did not reach ending state.");
if (snapshot.historyLength !== snapshot.maxTurns) throw new Error("A full run should stop exactly at its sampled scene count.");
if (snapshot.historyLength < 8 || snapshot.historyLength > 12) throw new Error("A full run should contain 8-12 scene questions.");
if (!/story-thread/.test(snapshot.timelineHtml)) throw new Error("Story thread did not render.");
if (!/story-paragraph/.test(snapshot.timelineHtml)) throw new Error("Continuous story paragraphs did not render.");
if (!/finale-card/.test(snapshot.choicesHtml)) throw new Error("Final result should render in the original choice area.");
if (!snapshot.choicesHtml.includes(snapshot.endingTitle)) throw new Error("Final choice-area result should include the ending title.");
if (/story-paragraph finale/.test(snapshot.timelineHtml) || snapshot.timelineHtml.includes(snapshot.endingTitle)) {
  throw new Error("Final result should not be appended to the bottom of the timeline.");
}
if (/你的选择|你当时/.test(snapshot.timelineHtml)) throw new Error("Story should not use explicit choice labels.");
if (/你第一次注意到学院夜里|共享盘里出现|打印机开始优先输出/.test(snapshot.timelineHtml)) {
  throw new Error("Timeline should not append generic transition beats to each story paragraph.");
}
if (!/第\d{3}号怪谈/.test(snapshot.endingTitle)) throw new Error("Deep dossier-style ending title did not render.");
if (!snapshot.endingText || snapshot.endingText.length < 65) throw new Error("Final dossier should include concise route-aware story text.");
if (snapshot.endingText.length > 150) throw new Error("Final dossier should be roughly half the previous long-form length.");
if (/diag-pill|diagnosis-card|textarea|Faculty Roulette 里走到了档案/.test(snapshot.timelineHtml + snapshot.choicesHtml)) {
  throw new Error("Final story should not render diagnostic chips or share text.");
}
const fullStoryText = [
  ...snapshot.history.map((entry) => `${entry.sceneText}${entry.aftermath}`),
  snapshot.endingTitle,
  snapshot.endingText
].join("");
const repeatedStorySentences = duplicateSentences(fullStoryText);
if (repeatedStorySentences.length) {
  throw new Error(`A single run should not repeat full story sentences: ${repeatedStorySentences[0][0]}`);
}

for (const [profile, mode, nextSeed] of [
  ["balanced", "publish", 4100],
  ["paper", "standard", 4101],
  ["grant", "publish", 4102],
  ["teaching", "standard", 4103],
  ["stealth", "publish", 4104]
]) {
  let trial = debug.start(profile, mode, nextSeed);
  let trialSafety = 50;
  while (!trial.finished && trialSafety > 0) {
    trial = debug.choose(trialSafety % Math.max(1, trial.currentChoices.length));
    if (!trial.finished) trial = debug.continue();
    trialSafety -= 1;
  }
  if (!trial.finished) throw new Error(`Sample ${profile} run did not finish.`);
  const trialText = [
    ...trial.history.map((entry) => `${entry.sceneText}${entry.aftermath}`),
    trial.endingTitle,
    trial.endingText
  ].join("");
  const trialRepeats = duplicateSentences(trialText);
  if (trialRepeats.length) {
    throw new Error(`Sample ${profile} run repeated a full story sentence: ${trialRepeats[0][0]}`);
  }
}

console.log("Faculty Roulette smoke test passed.");

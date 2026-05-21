import fs from "node:fs";
import vm from "node:vm";

class FakeElement {
  constructor(id) {
    this.id = id;
    this.children = [];
    this.hidden = false;
    this.innerHTML = "";
    this.listeners = {};
    this.options = [{ textContent: "均衡型青椒" }];
    this.selectedIndex = 0;
    this.style = {
      setProperty: (key, value) => {
        this.style[key] = value;
      }
    };
    this.textContent = "";
    this.value = "";
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

  select() {
    this.selected = true;
  }
}

const ids = [
  "profile",
  "profileNote",
  "startBtn",
  "startHeroBtn",
  "restartBtn",
  "seedBtn",
  "seedLabel",
  "rank",
  "semester",
  "status",
  "mood",
  "stats",
  "wheel",
  "eventTag",
  "eventRisk",
  "eventTitle",
  "eventText",
  "choices",
  "memoText",
  "trajectory",
  "log",
  "resultBox",
  "endingTitle",
  "endingText",
  "shareText",
  "copyBtn"
];

const elements = new Map(ids.map((id) => [id, new FakeElement(id)]));
elements.get("profile").value = "balanced";
const root = new URL("./", import.meta.url);

const context = {
  Date,
  Math,
  console,
  document: {
    createElement(tag) {
      return new FakeElement(tag);
    },
    querySelector(selector) {
      return elements.get(selector.replace("#", ""));
    }
  },
  navigator: {
    clipboard: {
      writeText: async () => true
    }
  },
  setTimeout
};

const html = fs.readFileSync(new URL("index.html", root), "utf8");
const app = fs.readFileSync(new URL("app.js", root), "utf8");

if (!html.includes("青椒轮盘")) throw new Error("HTML title copy is missing.");
if (/闈|涓|鎴|鍩|瀛|绋|�/.test(html + app)) throw new Error("Detected mojibake in public files.");

vm.runInNewContext(app, context);
elements.get("startBtn").listeners.click();

for (let i = 0; i < 6; i += 1) {
  const choice = elements.get("choices").children[0];
  if (!choice || !choice.listeners.click) throw new Error(`Missing choice button at semester ${i + 1}.`);
  choice.listeners.click();
}

if (elements.get("status").textContent !== "结局生成") throw new Error("Game did not reach ending state.");
if (!elements.get("shareText").value.includes("青椒轮盘")) throw new Error("Share text is incomplete.");
if (!/stat/.test(elements.get("stats").innerHTML)) throw new Error("Stats did not render.");
if (!/S6/.test(elements.get("trajectory").innerHTML)) throw new Error("Trajectory did not render.");

console.log("Faculty Roulette smoke test passed.");

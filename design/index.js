// ===== 締切設定（JST = UTC+9）=====
// もともと Python (timer.py / app.py) がやっていた計算をブラウザだけで完結させる。
const DEADLINES = {
  bachelor: "2026-02-10T12:00:00+09:00", // 卒論
  master: "2026-02-02T15:00:00+09:00", // 修論
};
const WARN_HOURS = 168.0; // 7日
const DANGER_HOURS = 72.0; // 3日

// ===== 状態 =====
let status = "safe";
let overdue = false;
let running = true; // START / STOP
let displaymode = "remain"; // "remain" | "absolute"
let timemode = "master"; // "master" | "bachelor"

// 締切までの残り秒数と状態を計算（timer.py の移植）
function computeState(mode) {
  const deadline = new Date(DEADLINES[mode]);
  const remainSeconds = (deadline.getTime() - Date.now()) / 1000;
  const isOverdue = remainSeconds < 0;

  let st;
  if (isOverdue) {
    st = "danger";
  } else {
    const hours = remainSeconds / 3600;
    if (hours < DANGER_HOURS) st = "danger";
    else if (hours < WARN_HOURS) st = "warn";
    else st = "safe";
  }

  return { remainSeconds, overdue: isOverdue, status: st };
}

// 1秒ごとに状態（safe/warn/danger・overdue）を更新
function syncState() {
  const s = computeState(timemode);
  overdue = s.overdue;
  status = s.status;

  document.body.classList.remove("safe", "warn", "danger");
  document.body.classList.add(overdue ? "danger" : status);
}

// ===== UI control handlers =====
const displayButtons = ["remain-button", "abs-button"];
const runButtons = ["start-button", "stop-button"];

const unit = document.querySelector(".hour-area span:last-child");

function setActiveInGroup(buttonIds, activeId) {
  buttonIds.forEach((id) => {
    document.getElementById(id).classList.remove("active-control");
  });
  document.getElementById(activeId).classList.add("active-control");
}

function setEnergyMode(mode) {
  const bachelor = document.getElementById("bachelor-button");
  const master = document.getElementById("master-button");

  if (mode === "bachelor") {
    bachelor.classList.remove("disabled");
    master.classList.add("disabled");
  } else {
    master.classList.remove("disabled");
    bachelor.classList.add("disabled");
  }

  timemode = mode;
  syncState();
}

// button event handlers
document.getElementById("remain-button").onclick = () => {
  displaymode = "remain";
  unit.textContent = displaymode === "absolute" ? "y" : "h";
  setActiveInGroup(displayButtons, "remain-button");
};
document.getElementById("abs-button").onclick = () => {
  displaymode = "absolute";
  unit.textContent = displaymode === "absolute" ? "y" : "h";
  setActiveInGroup(displayButtons, "abs-button");
};
document.getElementById("start-button").onclick = () => {
  running = true;
  setActiveInGroup(runButtons, "start-button");
};
document.getElementById("stop-button").onclick = () => {
  running = false;
  setActiveInGroup(runButtons, "stop-button");
};
document.getElementById("bachelor-button").onclick = () => {
  if (timemode !== "bachelor") {
    setEnergyMode("bachelor");
  }
};
document.getElementById("master-button").onclick = () => {
  if (timemode !== "master") {
    setEnergyMode("master");
  }
};

// ===== display update loop =====
function updateDisplay() {
  if (!running) return;

  if (displaymode === "remain") {
    renderRemain();
  } else {
    renderAbsolute();
  }
}

function renderRemain() {
  const remain = Math.max(0, computeState(timemode).remainSeconds);

  const totalCs = Math.floor(remain * 100);

  const hours = Math.floor(totalCs / 360000);
  const minutes = Math.floor((totalCs % 360000) / 6000);
  const seconds = Math.floor((totalCs % 6000) / 100);
  const centisec = totalCs % 100;

  document.getElementById("hour").textContent = String(hours).padStart(4, "0");
  document.getElementById("minute").textContent = String(minutes).padStart(2, "0");
  document.getElementById("second").textContent = String(seconds).padStart(2, "0");
  document.getElementById("millisecond").textContent = String(centisec).padStart(2, "0");
}

function renderAbsolute() {
  // 締切時刻を JST で表示（閲覧者のタイムゾーンに依存しない）
  const d = new Date(DEADLINES[timemode]);
  const jst = new Date(d.getTime() + 9 * 3600 * 1000);

  document.getElementById("hour").textContent = String(jst.getUTCFullYear()).padStart(4, "0");
  document.getElementById("minute").textContent = String(jst.getUTCMonth() + 1).padStart(2, "0");
  document.getElementById("second").textContent = String(jst.getUTCDate()).padStart(2, "0");
  document.getElementById("millisecond").textContent = String(jst.getUTCHours()).padStart(2, "0");
}

// Escape / クリックで全画面の出入り（ブラウザ版はアプリ終了の代わり）
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.fullscreenElement) {
    document.exitFullscreen?.();
  } else if (e.key === "Enter" && !document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  }
});

// activate sync and update loops
syncState();
setInterval(syncState, 1000);
setInterval(updateDisplay, 10);

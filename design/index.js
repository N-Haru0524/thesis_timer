let baseSeconds = 0;
let baseTime = 0;      // UNIX時刻（秒）
let status = "safe";
let overdue = false;
let running = true;        // START / STOP
let displaymode = "remain";      // "remain" | "absolute"
let timemode = "master";         // "master" | "bachelor"
let deadlineISO = null;   // ABSOLUTE 表示用

// sync data from Python backend
async function syncFromPython() {
  try {
    const data = await window.pywebview.api.get_base_status(timemode);

    if (data.overdue) {
      overdue = true;
      document.body.classList.add("danger");
      return;
    }

    overdue = false;
    baseSeconds = data.base_seconds;
    baseTime = data.base_time;
    status = data.status;
    deadlineISO = data.deadline;

    document.body.classList.remove("safe", "warn", "danger");
    document.body.classList.add(status);

  } catch (e) {
    console.error("sync error:", e);
  }
}

// UI control handlers
const displayButtons = ["remain-button", "abs-button"];
const runButtons = ["start-button", "stop-button"];
const timeModeButtons = ["bachelor-button", "master-button"];

const unit = document.querySelector(".hour-area span:last-child");

function setActiveInGroup(buttonIds, activeId) {
  buttonIds.forEach(id => {
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
  syncFromPython();
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

// display update loop
function updateDisplay() {
  if (!running || overdue) return;

  if (displaymode === "remain") {
    renderRemain();
  } else {
    renderAbsolute();
  }
}
function renderRemain() {
  const now = Date.now() / 1000;
  const elapsed = now - baseTime;
  const remain = Math.max(0, baseSeconds - elapsed);

  const totalCs = Math.floor(remain * 100);

  const hours = Math.floor(totalCs / 360000);
  const minutes = Math.floor((totalCs % 360000) / 6000);
  const seconds = Math.floor((totalCs % 6000) / 100);
  const centisec = totalCs % 100;

  document.getElementById("hour").textContent =
    String(hours).padStart(4, "0");
  document.getElementById("minute").textContent =
    String(minutes).padStart(2, "0");
  document.getElementById("second").textContent =
    String(seconds).padStart(2, "0");
  document.getElementById("millisecond").textContent =
    String(centisec).padStart(2, "0");
}
function renderAbsolute() {
  if (!deadlineISO) return;

  const d = new Date(deadlineISO);

  document.getElementById("hour").textContent =
    String(d.getFullYear()).padStart(4, "0");

  document.getElementById("minute").textContent =
    String(d.getMonth() + 1).padStart(2, "0");

  document.getElementById("second").textContent =
    String(d.getDate()).padStart(2, "0");

  document.getElementById("millisecond").textContent =
    String(d.getHours()).padStart(2, "0");
}

// Escape key to exit app
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (window.pywebview?.api?.exit_app) {
        window.pywebview.api.exit_app();
      } else {
        console.warn("pywebview api not ready");
      }
    }
  });

});

// activate sync and update loops
syncFromPython();
setInterval(syncFromPython, 1000);
setInterval(updateDisplay, 10);
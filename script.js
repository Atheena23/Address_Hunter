(() => {
"use strict";

/* =========================================================
   ADDRESS HUNTER — THE MEMORY CASE
   ========================================================= */

const state = {
  screen: "home",
  caseIndex: 0,
  solved: [],
  score: 0,
  energy: 5,
  sound: true,
  hints: 0,
  selectedAddress: null,
  modeChoice: null,
  pathStep: 0,
  unlocked: 1,
  lastSoundPage: ""
};


/* =========================================================
   CASE DATA
   ========================================================= */

const cases = [
  {
    id: 1,
    title: "The Missing Note",
    mode: "Direct",
    instruction: "LOAD R1, 400",

    registers: {
      R1: "—",
      R2: "120"
    },

    memory: [
      [350, "21"],
      [400, "73"],
      [450, "18"],
      [500, "91"],
      [550, "44"]
    ],

    target: 400,
    answer: "73",

    clue:
      "The instruction points straight at a memory address. No detour is needed.",

    story:
      "A dusty note says the missing value is hiding at the address written inside the instruction.",

    choices: [
      "Direct",
      "Indirect",
      "Register",
      "Indexed"
    ]
  },

  {
    id: 2,
    title: "The Two-Step Trail",
    mode: "Indirect",
    instruction: "LOAD R1, [400]",

    registers: {
      R1: "—",
      R2: "250"
    },

    memory: [
      [200, "11"],
      [250, "96"],
      [400, "250"],
      [450, "37"],
      [500, "18"]
    ],

    target: 250,
    answer: "96",

    clue:
      "The address in the instruction is only a signpost. Read that location to discover the real address.",

    story:
      "Someone left a false address on the screen. Follow it one step further.",

    choices: [
      "Direct",
      "Indirect",
      "Register",
      "Immediate"
    ]
  },

  {
    id: 3,
    title: "The Register Shortcut",
    mode: "Register",
    instruction: "MOV R1, R2",

    registers: {
      R1: "—",
      R2: "88",
      R3: "41"
    },

    memory: [
      [100, "14"],
      [200, "55"],
      [300, "73"],
      [400, "12"],
      [500, "61"]
    ],

    target: null,
    answer: "88",

    clue:
      "The data is already waiting inside a register. No memory address is needed.",

    story:
      "The detective discovers a shortcut: the CPU can take data directly from another register.",

    choices: [
      "Direct",
      "Indirect",
      "Register",
      "Indexed"
    ]
  },

  {
    id: 4,
    title: "The Offset Door",
    mode: "Indexed",
    instruction: "LOAD R1, 50[R2]",

    registers: {
      R1: "—",
      R2: "400"
    },

    memory: [
      [350, "31"],
      [400, "52"],
      [450, "77"],
      [500, "19"],
      [550, "63"]
    ],

    target: 450,
    answer: "77",

    clue:
      "Start with the register value, then add the offset.",

    story:
      "A locked drawer says: I am 50 steps beyond the address stored in R2.",

    choices: [
      "Direct",
      "Indirect",
      "Register",
      "Indexed"
    ]
  },

  {
    id: 5,
    title: "The Final Message",
    mode: "Immediate",
    instruction: "MOV R1, #42",

    registers: {
      R1: "—",
      R2: "300"
    },

    memory: [
      [100, "18"],
      [200, "55"],
      [300, "73"],
      [400, "91"],
      [500, "27"]
    ],

    target: null,
    answer: "42",

    clue:
      "The value is written directly inside the instruction. No memory address needs to be found.",

    story:
      "A tiny message is hidden in plain sight. The number after the # is the data itself.",

    choices: [
      "Direct",
      "Indirect",
      "Register",
      "Immediate"
    ]
  }
];


/* =========================================================
   ELEMENTS
   ========================================================= */

const $ = selector =>
  document.querySelector(selector);

const screen = $("#screen");
const toast = $("#toast");
const modal = $("#modal");
const modalCard = $("#modalCard");
const modalBackdrop = $("#modalBackdrop");


/* =========================================================
   SELECTED BUTTON STYLE
   ========================================================= */

function installOptionStyle() {

  if (
    document.getElementById(
      "addressHunterOptionFix"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "addressHunterOptionFix";

  style.textContent = `

    .option.selected-mode {
      background:#426347 !important;
      border-color:#9fd29f !important;
      color:#fff1c9 !important;

      box-shadow:
        0 5px 0 rgba(0,0,0,.35),
        inset 0 0 0 2px rgba(159,210,159,.18) !important;

      transform:translateY(-2px);
    }

    .option.selected-mode::after {
      content:" ✓";
      font-weight:900;
    }

    .memory-cell.selected-address {
      background:#426347 !important;
      border-color:#9fd29f !important;
      color:#fff1c9 !important;
    }

    .map-node:hover:not(:disabled) {
      transform:translateY(-4px);
      box-shadow:
        0 10px 0 rgba(0,0,0,.35);
    }

  `;

  document.head.appendChild(style);
}

installOptionStyle();


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function save() {

  try {

    localStorage.setItem(
      "addressHunterSave",

      JSON.stringify({
        caseIndex: state.caseIndex,
        solved: state.solved,
        score: state.score,
        energy: state.energy,
        sound: state.sound,
        hints: state.hints,
        unlocked: state.unlocked
      })
    );

  } catch (error) {

    console.log("Save failed.");

  }
}


function load() {

  try {

    const raw =
      localStorage.getItem(
        "addressHunterSave"
      );

    if (!raw) return;

    const saved =
      JSON.parse(raw);

    if (Array.isArray(saved.solved)) {
      state.solved = saved.solved;
    }

    if (typeof saved.score === "number") {
      state.score = saved.score;
    }

    if (typeof saved.energy === "number") {
      state.energy = saved.energy;
    }

    if (typeof saved.sound === "boolean") {
      state.sound = saved.sound;
    }

    if (typeof saved.hints === "number") {
      state.hints = saved.hints;
    }

    if (typeof saved.unlocked === "number") {
      state.unlocked =
        Math.min(
          5,
          Math.max(1, saved.unlocked)
        );
    }

    if (typeof saved.caseIndex === "number") {
      state.caseIndex =
        Math.min(
          4,
          Math.max(0, saved.caseIndex)
        );
    }

  } catch (error) {

    console.log(
      "Could not load saved game."
    );

  }
}


/* =========================================================
   BACKGROUNDS
   ========================================================= */

function roomBackground(index) {
  return `assets/backgrounds/room${index + 1}.svg`;
}

function homeBackground() {
  return "assets/backgrounds/workshop.svg";
}

function mapBackground() {
  return "assets/backgrounds/map.svg";
}

function vaultBackground() {
  return "assets/backgrounds/vault.svg";
}


/* =========================================================
   SOUND
   ========================================================= */

let audioCtx = null;


function getAudioContext() {

  if (!state.sound) {
    return null;
  }

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    return audioCtx;

  } catch {
    return null;
  }
}


function beep(
  frequency = 440,
  duration = 0.08,
  type = "triangle",
  volume = 0.03,
  delay = 0
) {

  const ctx =
    getAudioContext();

  if (!ctx) return;

  const start =
    ctx.currentTime + delay;

  const oscillator =
    ctx.createOscillator();

  const gain =
    ctx.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    frequency,
    start
  );

  gain.gain.setValueAtTime(
    0.0001,
    start
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.01
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);

  oscillator.stop(
    start + duration + 0.02
  );
}


function playTone(success) {

  if (!state.sound) return;

  if (success) {

    beep(660,0.08,"triangle",0.035);
    beep(880,0.12,"triangle",0.03,0.08);

  } else {

    beep(180,0.11,"sawtooth",0.025);
    beep(130,0.13,"sawtooth",0.02,0.08);

  }
}


function playPageSound(page) {

  if (
    !state.sound ||
    state.lastSoundPage === page
  ) {
    return;
  }

  state.lastSoundPage = page;

  if (page === "home") {

    beep(392,0.12,"triangle",0.025);
    beep(523,0.16,"triangle",0.022,0.12);

  } else if (page === "room") {

    beep(294,0.10,"sine",0.022);
    beep(392,0.13,"sine",0.018,0.11);

  } else if (page === "case") {

    beep(220,0.07,"square",0.018);
    beep(330,0.07,"square",0.018,0.09);
    beep(440,0.12,"square",0.018,0.18);

  } else if (page === "map") {

    beep(330,0.08,"square",0.018);
    beep(440,0.08,"square",0.018,0.10);
    beep(554,0.12,"square",0.016,0.20);

  } else if (page === "reward") {

    beep(523,0.09,"triangle",0.025);
    beep(659,0.09,"triangle",0.025,0.10);
    beep(784,0.16,"triangle",0.03,0.20);

  } else if (page === "vault") {

    beep(196,0.10,"sine",0.02);
    beep(262,0.10,"sine",0.02,0.12);
    beep(392,0.16,"sine",0.025,0.24);
    beep(523,0.22,"triangle",0.03,0.38);

  }
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

  state.screen = "home";
  state.lastSoundPage = "";

  playPageSound("home");

  const nextIndex =
    getNextCase();

  const nextCase =
    cases[nextIndex];

  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:url('${homeBackground()}');
      "
    >

      <div class="scene-content hero">

        <div>

          <div class="kicker">
            C.O.A. // DETECTIVE UNIT
          </div>

          <h1>
            THE MEMORY
            <span>CASE</span>
          </h1>

          <p>
            Five clues. Five addressing modes.
            One missing memory trail.
          </p>

          <div class="game-actions">

            <button
              class="game-btn primary"
              id="playBtn"
              type="button"
            >
              ${
                state.solved.length
                  ? "CONTINUE INVESTIGATION"
                  : "START INVESTIGATION"
              }
            </button>

            <button
              class="game-btn"
              id="mapBtn"
              type="button"
            >
              CASE MAP
            </button>

          </div>

        </div>


        <div class="hero-note">

          <div class="scene-label">
            CURRENT FILE
          </div>

          <h3>
            CASE ${nextCase.id}
          </h3>

          <p>
            ${nextCase.title}
          </p>

          <p>
            Addressing Mode:
            <strong>
              ${nextCase.mode}
            </strong>
          </p>

          <div class="small-muted">
            ${state.solved.length}/5 cases solved
          </div>

        </div>

      </div>

    </section>
  `;


  $("#playBtn").addEventListener(
    "click",
    () => {
      beep(450,0.08);
      renderRoom(nextIndex);
    }
  );


  $("#mapBtn").addEventListener(
    "click",
    () => {
      beep(400,0.08);
      renderMap();
    }
  );
}


function getNextCase() {

  for (
    let i = 0;
    i < cases.length;
    i++
  ) {

    if (
      !state.solved.includes(
        cases[i].id
      )
    ) {
      return i;
    }

  }

  return 4;
}


/* =========================================================
   ROOM
   ========================================================= */

function renderRoom(index) {

  state.screen = "room";
  state.caseIndex = index;
  state.selectedAddress = null;
  state.modeChoice = null;
  state.pathStep = 0;
  state.lastSoundPage = "";

  playPageSound("room");

  const c = cases[index];

  const solved =
    state.solved.includes(c.id);

  const progress =
    (state.solved.length / 5) * 100;


  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:url('${roomBackground(index)}');
      "
    >

      <div class="scene-content">

        <div class="room-title">

          <div>

            <div class="scene-label">
              INVESTIGATION OFFICE
            </div>

            <h2>
              CASE ${c.id}:
              ${c.title}
            </h2>

          </div>

          <div class="badge">
            ${c.mode}
          </div>

        </div>


        <div class="room-grid">

          <div class="object-board">

            <div class="room-board-title">

              <span>
                INVESTIGATION DESK
              </span>

              <small>
                CASE ${c.id}
              </small>

            </div>


            <button
              class="object-btn obj-computer"
              id="computerObj"
              type="button"
            >
              <span class="emoji">🖥️</span>
              <small>COMPUTER</small>
            </button>


            <button
              class="object-btn obj-note"
              id="noteObj"
              type="button"
            >
              <span class="emoji">📜</span>
              <small>OLD NOTE</small>
            </button>


            <button
              class="object-btn obj-box"
              id="boxObj"
              type="button"
            >
              <span class="emoji">🔐</span>
              <small>MEMORY BOX</small>
            </button>


            <button
              class="object-btn obj-map"
              id="mapObj"
              type="button"
            >
              <span class="emoji">🗺️</span>
              <small>CASE MAP</small>
            </button>


            <div class="room-center-card">

              <div class="room-center-label">
                CURRENT CASE
              </div>

              <strong>
                CASE ${c.id}:
                ${c.title}
              </strong>

              <p>
                ${
                  solved
                    ? "Case solved. You can revisit the evidence."
                    : "Use the computer to investigate this case."
                }
              </p>

              <div class="room-center-tags">

                <span>
                  ${c.mode}
                </span>

                <span>
                  ${solved ? "SOLVED" : "ACTIVE"}
                </span>

              </div>

            </div>

          </div>


          <aside class="hud">

            <div class="hud-card">

              <div class="scene-label">
                WHAT TO DO
              </div>

              <h3>
                Investigate
              </h3>

              <p class="small-muted">
                Explore the room.
                Use the computer to open
                the COA case.
                Check the old note if you
                need a clue.
              </p>

            </div>


            <div class="hud-card">

              <div class="scene-label">
                PROGRESS
              </div>

              <div class="progress">

                <span
                  style="width:${progress}%"
                ></span>

              </div>

              <p class="small-muted">
                ${state.solved.length}/5 cases solved
              </p>

            </div>


            <div class="hud-card">

              <div class="scene-label">
                CASE FILES
              </div>

              <div class="inventory">

                ${cases.map(c => `

                  <div
                    class="
                      slot
                      ${
                        state.solved.includes(c.id)
                          ? "filled"
                          : ""
                      }
                    "
                  >

                    ${
                      state.solved.includes(c.id)
                        ? "✓"
                        : c.id <= state.unlocked
                          ? c.id
                          : "?"
                    }

                  </div>

                `).join("")}

              </div>

            </div>

          </aside>

        </div>

      </div>

    </section>
  `;


  $("#computerObj").addEventListener(
    "click",
    () => {
      beep(500,0.08);
      renderCase(index);
    }
  );


  $("#noteObj").addEventListener(
    "click",
    () => {
      beep(620,0.08);
      showHint(c);
    }
  );


  $("#boxObj").addEventListener(
    "click",
    () => {

      if (state.solved.length === 5) {
        renderFinal();
      } else {
        showBox(c,solved);
      }

    }
  );


  $("#mapObj").addEventListener(
    "click",
    () => {
      beep(330,0.08);
      renderMap();
    }
  );
}


/* =========================================================
   CASE SCREEN
   ========================================================= */

function renderCase(index) {

  const c = cases[index];

  state.screen = "case";
  state.caseIndex = index;
  state.selectedAddress = null;
  state.modeChoice = null;
  state.pathStep = 0;
  state.lastSoundPage = "";

  playPageSound("case");


  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:url('${roomBackground(index)}');
      "
    >

      <div class="scene-content">

        <div class="case-card">

          <div class="case-head">

            <div>

              <div class="scene-label">
                CASE ${c.id}
                // ${c.mode}
              </div>

              <h2>
                ${c.title}
              </h2>

            </div>

            <div class="badge">
              ACTIVE
            </div>

          </div>


          <div class="hint-paper">

            <strong>
              CASE FILE:
            </strong>

            ${c.story}

          </div>


          <div class="instruction">

            <div class="scene-label">
              CPU INSTRUCTION
            </div>

            <div class="code">
              ${c.instruction}
            </div>

            <div class="registers">

              ${Object.entries(c.registers)
                .map(
                  ([name,value]) => `
                    <div class="reg">
                      ${name} =
                      <strong>${value}</strong>
                    </div>
                  `
                )
                .join("")}

            </div>

          </div>


          <div class="puzzle-stage">

            <div class="scene-label">
              STEP 1
            </div>

            <h3>
              IDENTIFY THE ADDRESSING MODE
            </h3>

            <p class="small-muted">
              Choose the addressing mode
              used by this instruction.
            </p>

            <div class="options">

              ${c.choices.map(choice => `

                <button
                  class="option"
                  data-mode="${choice}"
                  type="button"
                >
                  ${choice}
                </button>

              `).join("")}

            </div>

          </div>


          <div id="stepTwo"></div>

          <div id="traceArea"></div>


          <div class="case-footer">

            <div
              class="status"
              id="status"
            >
              Select the correct
              addressing mode.
            </div>

            <div class="game-actions">

              <button
                class="game-btn small"
                id="roomBtn"
                type="button"
              >
                ← BACK TO ROOM
              </button>

              <button
                class="game-btn gold small"
                id="hintCaseBtn"
                type="button"
              >
                📜 FREE HINT
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  `;


  bindModeButtons(index);


  $("#roomBtn").addEventListener(
    "click",
    () => renderRoom(index)
  );


  $("#hintCaseBtn").addEventListener(
    "click",
    () => showHint(c)
  );
}


/* =========================================================
   ADDRESSING MODE BUTTONS
   ========================================================= */

function bindModeButtons(index) {

  const c = cases[index];

  document
    .querySelectorAll("[data-mode]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const selected =
            button.dataset.mode;


          if (selected !== c.mode) {

            state.energy =
              Math.max(
                1,
                state.energy - 1
              );

            playTone(false);

            $("#status").textContent =
              "Wrong addressing mode. Check the clue and try again.";

            showToast(
              "WRONG ADDRESSING MODE — TRY AGAIN."
            );

            save();

            return;
          }


          state.modeChoice =
            selected;


          document
            .querySelectorAll("[data-mode]")
            .forEach(btn => {
              btn.classList.remove(
                "selected-mode"
              );
            });


          button.classList.add(
            "selected-mode"
          );


          playTone(true);


          $("#status").textContent =
            `${c.mode} addressing confirmed. Continue to the next step.`;


          showToast(
            `${c.mode.toUpperCase()} — CORRECT!`
          );


          save();


          setTimeout(
            () => renderCaseStepTwo(index),
            350
          );

        }
      );

    });
}


/* =========================================================
   STEP 2
   ========================================================= */

function renderCaseStepTwo(index) {

  const c = cases[index];

  const area =
    $("#stepTwo");

  if (!area) return;


  if (c.mode === "Register") {

    area.innerHTML = `

      <div class="puzzle-stage">

        <div class="scene-label">
          STEP 2
        </div>

        <h3>
          FIND THE DATA
        </h3>

        <p class="small-muted">
          The value is already stored inside R2.
        </p>

        <div class="options">

          ${["88","17","73","91"]
            .map(value => `
              <button
                class="option"
                data-value="${value}"
                type="button"
              >
                ${value}
              </button>
            `)
            .join("")}

        </div>

      </div>
    `;

    bindValueButtons(index);
    return;
  }


  if (c.mode === "Immediate") {

    area.innerHTML = `

      <div class="puzzle-stage">

        <div class="scene-label">
          STEP 2
        </div>

        <h3>
          FIND THE DATA
        </h3>

        <p class="small-muted">
          The value is written directly
          inside the instruction.
        </p>

        <div class="options">

          ${["42","17","73","91"]
            .map(value => `
              <button
                class="option"
                data-value="${value}"
                type="button"
              >
                ${value}
              </button>
            `)
            .join("")}

        </div>

      </div>
    `;

    bindValueButtons(index);
    return;
  }


  area.innerHTML = `

    <div class="puzzle-stage">

      <div class="scene-label">
        STEP 2
      </div>

      <h3>
        FIND THE MEMORY ADDRESS
      </h3>

      <p class="small-muted">
        Select the memory location
        required by the addressing mode.
      </p>

      <div class="memory-grid">

        ${c.memory
          .map(
            ([address,value]) => `

              <button
                class="memory-cell"
                data-address="${address}"
                type="button"
              >

                <strong>
                  ${address}
                </strong>

                <span>
                  DATA ${value}
                </span>

              </button>

            `
          )
          .join("")}

      </div>

    </div>
  `;


  bindAddressButtons(index);
}


/* =========================================================
   VALUE BUTTONS
   ========================================================= */

function bindValueButtons(index) {

  const c = cases[index];

  document
    .querySelectorAll("[data-value]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const value =
            button.dataset.value;


          if (value !== c.answer) {

            state.energy =
              Math.max(
                1,
                state.energy - 1
              );

            playTone(false);

            showToast(
              "THAT IS NOT THE DATA."
            );

            save();

            return;
          }


          document
            .querySelectorAll("[data-value]")
            .forEach(btn => {
              btn.classList.remove(
                "selected-mode"
              );
            });


          button.classList.add(
            "selected-mode"
          );


          state.pathStep = 0;

          playTone(true);

          showToast(
            "CORRECT DATA!"
          );


          setTimeout(
            () => renderTrace(index),
            350
          );

        }
      );

    });
}


/* =========================================================
   MEMORY ADDRESS BUTTONS
   ========================================================= */

function bindAddressButtons(index) {

  const c = cases[index];

  document
    .querySelectorAll("[data-address]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const address =
            Number(
              button.dataset.address
            );


          if (address !== c.target) {

            state.energy =
              Math.max(
                1,
                state.energy - 1
              );

            playTone(false);

            showToast(
              "WRONG MEMORY ADDRESS."
            );

            save();

            return;
          }


          document
            .querySelectorAll("[data-address]")
            .forEach(btn => {
              btn.classList.remove(
                "selected-address"
              );
            });


          button.classList.add(
            "selected-address"
          );


          state.selectedAddress =
            address;

          state.pathStep = 0;

          playTone(true);

          showToast(
            `ADDRESS ${address} — CORRECT!`
          );


          setTimeout(
            () => renderTrace(index),
            350
          );

        }
      );

    });
}


/* =========================================================
   TRACE
   ========================================================= */

function renderTrace(index) {

  const c = cases[index];

  const area =
    $("#traceArea");

  if (!area) return;


  let steps = [];


  if (c.mode === "Direct") {

    steps = [
      "LOAD",
      "ADDRESS 400",
      "MEMORY[400]",
      "DATA = 73"
    ];

  } else if (c.mode === "Indirect") {

    steps = [
      "LOAD",
      "[400]",
      "MEMORY[400] = 250",
      "MEMORY[250]",
      "DATA = 96"
    ];

  } else if (c.mode === "Register") {

    steps = [
      "MOV",
      "R2",
      "DATA = 88",
      "R1 = 88"
    ];

  } else if (c.mode === "Indexed") {

    steps = [
      "R2 = 400",
      "+ 50",
      "ADDRESS = 450",
      "MEMORY[450]",
      "DATA = 77"
    ];

  } else {

    steps = [
      "MOV",
      "#42",
      "DATA = 42",
      "R1 = 42"
    ];

  }


  area.innerHTML = `

    <div class="puzzle-stage">

      <div class="scene-label">
        STEP 3
      </div>

      <h3>
        TRACE THE DATA
      </h3>

      <div class="path">

        ${steps
          .map(
            (step,i) => `

              <span
                class="
                  path-node
                  ${
                    i <= state.pathStep
                      ? "active"
                      : ""
                  }
                "
              >
                ${
                  i <= state.pathStep
                    ? step
                    : "?"
                }
              </span>

              ${
                i < steps.length - 1
                  ? `<span class="arrow">→</span>`
                  : ""
              }

            `
          )
          .join("")}

      </div>


      ${
        state.pathStep <
        steps.length - 1

          ? `

            <div class="game-actions">

              <button
                class="game-btn gold"
                id="traceNext"
                type="button"
              >
                TRACE NEXT →
              </button>

            </div>

          `

          : `

            <div class="game-actions">

              <button
                class="game-btn primary"
                id="recoverBtn"
                type="button"
              >
                RECOVER DATA
              </button>

            </div>

          `
      }

    </div>
  `;


  const next =
    $("#traceNext");


  if (next) {

    next.addEventListener(
      "click",
      () => {

        state.pathStep++;

        beep(550,0.07);

        renderTrace(index);

      }
    );

  }


  const recover =
    $("#recoverBtn");


  if (recover) {

    recover.addEventListener(
      "click",
      () => solveCase(index)
    );

  }
}


/* =========================================================
   SOLVE CASE
   ========================================================= */

function solveCase(index) {

  const c = cases[index];


  if (
    state.solved.includes(c.id)
  ) {
    return;
  }


  state.solved.push(c.id);


  state.score +=
    100 +
    Math.max(
      0,
      state.energy
    ) * 10;


  state.unlocked =
    Math.min(
      cases.length,
      Math.max(
        state.unlocked,
        index + 2
      )
    );


  save();

  playTone(true);


  /* CASE 1 → 2 → 3 → 4 → 5 */

  if (index < cases.length - 1) {

    showToast(
      `CASE ${c.id} SOLVED! CASE ${
        index + 2
      } UNLOCKED.`
    );


    setTimeout(
      () => {

        state.caseIndex =
          index + 1;

        state.selectedAddress =
          null;

        state.modeChoice =
          null;

        state.pathStep =
          0;

        renderCase(index + 1);

      },
      1000
    );


    return;
  }


  /* CASE 5 COMPLETE */

  setTimeout(
    renderReward,
    700
  );
}


/* =========================================================
   CASE 5 SOLVED
   ========================================================= */

function renderReward() {

  state.screen = "reward";
  state.lastSoundPage = "";

  playPageSound("reward");


  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:
          url('${vaultBackground()}');
      "
    >

      <div class="scene-content collect-screen">

        <div class="scene-label">
          INVESTIGATION COMPLETE
        </div>


        <div class="trophy">
          🏆
        </div>


        <h1>
          CASE
          <span>
            5 SOLVED!
          </span>
        </h1>


        <div class="reward-card">

          <h3>
            THE FINAL MESSAGE
          </h3>


          <p>
            The final memory value has
            been successfully recovered.
          </p>


          <div class="hint-paper">

            <strong>
              RECOVERED DATA
            </strong>

            <br><br>

            MOV R1, #42

            <br><br>

            DATA =
            <strong>
              42
            </strong>

          </div>


          <p>
            All five addressing modes
            have been solved.
          </p>


          <p>
            FINAL SCORE:
            <strong>
              ${state.score} XP
            </strong>
          </p>

        </div>


        <div
          class="game-actions"
          style="justify-content:center"
        >

          <button
            class="game-btn gold"
            id="vaultBtn"
            type="button"
          >
            OPEN MEMORY VAULT
          </button>

        </div>

      </div>

    </section>
  `;


  $("#vaultBtn").addEventListener(
    "click",
    () => {

      beep(700,0.08);

      setTimeout(
        renderFinal,
        200
      );

    }
  );
}


/* =========================================================
   MEMORY VAULT
   ========================================================= */

function renderFinal() {

  state.screen = "vault";
  state.lastSoundPage = "";

  playPageSound("vault");


  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:
          url('${vaultBackground()}');
      "
    >

      <div class="scene-content collect-screen">

        <div class="scene-label">
          ACCESS GRANTED
        </div>


        <div class="trophy">
          🔐
        </div>


        <h1>
          MEMORY
          <span>
            VAULT
          </span>
        </h1>


        <div class="reward-card">

          <h3>
            CASE CLOSED
          </h3>


          <p>
            The complete memory trail
            has been recovered.
          </p>


          <div
            class="hint-paper"
            style="text-align:left"
          >

            <strong>
              ADDRESSING MODES RECOVERED
            </strong>

            <br><br>

            ✓ Direct
            — The Missing Note

            <br><br>

            ✓ Indirect
            — The Two-Step Trail

            <br><br>

            ✓ Register
            — The Register Shortcut

            <br><br>

            ✓ Indexed
            — The Offset Door

            <br><br>

            ✓ Immediate
            — The Final Message

          </div>


          <p>
            FINAL SCORE:
            <strong>
              ${state.score} XP
            </strong>
          </p>

        </div>


        <div
          class="game-actions"
          style="justify-content:center"
        >

          <button
            class="game-btn primary"
            id="playAgainBtn"
            type="button"
          >
            PLAY AGAIN
          </button>


          <button
            class="game-btn"
            id="vaultMapBtn"
            type="button"
          >
            VIEW CASE MAP
          </button>

        </div>

      </div>

    </section>
  `;


  $("#playAgainBtn").addEventListener(
    "click",
    () => {

      resetGame();
      renderHome();

    }
  );


  $("#vaultMapBtn").addEventListener(
    "click",
    renderMap
  );
}


/* =========================================================
   LARGE CASE MAP
   ========================================================= */

function renderMap() {

  state.screen = "map";
  state.lastSoundPage = "";

  playPageSound("map");


  screen.innerHTML = `

    <section
      class="scene"
      style="
        background-image:
          url('${mapBackground()}');
      "
    >

      <div class="scene-content">

        <div class="scene-label">
          INVESTIGATION MAP
        </div>

        <h2>
          THE MEMORY TRAIL
        </h2>


        <div
          class="map-wrap"
          style="
            width:100%;
            max-width:1500px;
            margin:0 auto;

            display:grid;

            grid-template-columns:
              minmax(0,1fr) 350px;

            gap:24px;

            align-items:start;
          "
        >


          <!-- BIGGER MAP -->

          <div
            class="map-card"
            style="
              width:100%;

              min-height:680px;

              box-sizing:border-box;

              padding:22px;

              border:4px solid #8b5b34;

              border-radius:14px;

              background:
                rgba(35,19,13,.82);

              box-shadow:
                8px 9px 0 rgba(0,0,0,.35),
                inset 0 0 25px
                rgba(255,214,113,.035);

              overflow:hidden;
            "
          >


            <div
              style="
                position:relative;

                width:100%;

                height:630px;

                box-sizing:border-box;

                padding:55px;

                display:grid;

                grid-template-columns:
                  repeat(6,minmax(80px,1fr));

                grid-template-rows:
                  1fr 1fr;

                column-gap:45px;

                row-gap:45px;

                align-items:center;
              "
            >


              <!-- MEMORY TRAIL -->

              <div
                style="
                  position:absolute;

                  left:7%;
                  right:7%;

                  top:50%;

                  height:4px;

                  transform:
                    translateY(-50%);

                  background:#8b5b34;

                  z-index:0;
                "
              ></div>


              <!-- CASE 1 -->

              ${createMapNode(
                0,
                "1 / 3",
                "1",
                "The Missing Note"
              )}


              <!-- CASE 2 -->

              ${createMapNode(
                1,
                "3 / 5",
                "1",
                "The Two-Step Trail"
              )}


              <!-- CASE 3 -->

              ${createMapNode(
                2,
                "5 / 7",
                "1",
                "The Register Shortcut"
              )}


              <!-- CASE 4 -->

              ${createMapNode(
                3,
                "2 / 4",
                "2",
                "The Offset Door"
              )}


              <!-- CASE 5 -->

              ${createMapNode(
                4,
                "5 / 7",
                "2",
                "The Final Message"
              )}

            </div>

          </div>


          <!-- RIGHT PANEL -->

          <div
            class="map-side"
            style="width:100%"
          >

            <div class="panel">

              <div class="scene-label">
                CASE PROGRESS
              </div>

              <h3>
                ${state.solved.length}/5 SOLVED
              </h3>

              <div class="progress">

                <span
                  style="
                    width:${
                      (state.solved.length / 5) *
                      100
                    }%;
                  "
                ></span>

              </div>

            </div>


            <div class="panel">

              <div class="scene-label">
                CASE FILES
              </div>


              <div class="menu-list">

                ${cases.map(
                  (c,index) => {

                    const unlocked =
                      c.id <=
                      state.unlocked;

                    const solved =
                      state.solved.includes(
                        c.id
                      );

                    return `

                      <button
                        class="game-btn small"
                        data-case-index="${index}"
                        type="button"
                        ${
                          unlocked
                            ? ""
                            : "disabled"
                        }
                      >

                        ${
                          solved
                            ? "✓"
                            : unlocked
                              ? "🔎"
                              : "🔒"
                        }

                        CASE ${c.id}
                        —
                        ${
                          unlocked
                            ? c.mode
                            : "LOCKED"
                        }

                      </button>

                    `;

                  }
                ).join("")}

              </div>

            </div>


            <button
              class="game-btn"
              id="mapHomeBtn"
              type="button"
            >
              ← TITLE SCREEN
            </button>

          </div>

        </div>

      </div>

    </section>
  `;


  document
    .querySelectorAll(
      "[data-map-index]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          if (button.disabled) {

            showToast(
              "THIS CASE IS STILL LOCKED."
            );

            return;
          }


          const index =
            Number(
              button.dataset.mapIndex
            );


          beep(500,0.07);

          renderRoom(index);

        }
      );

    });


  document
    .querySelectorAll(
      "[data-case-index]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          if (button.disabled) {

            showToast(
              "THIS CASE IS STILL LOCKED."
            );

            return;
          }


          const index =
            Number(
              button.dataset.caseIndex
            );


          beep(500,0.07);

          renderRoom(index);

        }
      );

    });


  $("#mapHomeBtn").addEventListener(
    "click",
    renderHome
  );
}


/* =========================================================
   MAP NODE
   ========================================================= */

function createMapNode(
  index,
  column,
  row,
  title
) {

  const c =
    cases[index];

  const unlocked =
    c.id <= state.unlocked;

  const solved =
    state.solved.includes(c.id);


  return `

    <button
      class="map-node"
      data-map-index="${index}"
      type="button"

      ${
        unlocked
          ? ""
          : "disabled"
      }

      style="
        grid-column:${column};

        grid-row:${row};

        position:relative;

        z-index:2;

        width:100%;

        max-width:240px;

        min-height:135px;

        justify-self:center;

        padding:18px 16px;

        box-sizing:border-box;

        border:
          3px solid
          ${
            solved
              ? "#9fd29f"
              : "#84502e"
          };

        border-radius:10px;

        background:
          ${
            solved
              ? "#426347"
              : "#3b2418"
          };

        color:#fff1c9;

        cursor:
          ${
            unlocked
              ? "pointer"
              : "not-allowed"
          };

        opacity:
          ${
            unlocked
              ? "1"
              : ".45"
          };

        box-shadow:
          0 6px 0
          rgba(0,0,0,.35);

        font-family:inherit;

        font-size:15px;

        line-height:1.45;

        transition:
          transform .15s ease,
          box-shadow .15s ease;
      "
    >

      <strong
        style="
          display:block;

          font-size:18px;

          margin-bottom:7px;
        "
      >

        ${
          solved
            ? "✓"
            : unlocked
              ? "CASE " + c.id
              : "🔒 LOCKED"
        }

      </strong>


      <span
        style="
          display:block;
          font-size:14px;
        "
      >

        ${
          unlocked
            ? title
            : "Classified"
        }

      </span>


      ${
        unlocked
          ? `
            <small
              style="
                display:block;

                margin-top:7px;

                opacity:.9;

                font-size:12px;
              "
            >
              ${c.mode}
            </small>
          `
          : ""
      }

    </button>
  `;
}


/* =========================================================
   HINT
   ========================================================= */

function showHint(c) {

  state.hints++;


  openModal(`

    <button
      class="close-modal"
      id="closeHint"
      type="button"
    >
      ×
    </button>


    <div class="scene-label">
      OLD NOTE
    </div>


    <h2>
      CASE CLUE
    </h2>


    <p>
      ${c.clue}
    </p>


    <div class="hint-paper">

      <strong>
        ADDRESSING MODE:
      </strong>

      ${c.mode}

    </div>


    <div
      style="
        text-align:center;
        margin-top:20px;
      "
    >

      <button
        class="game-btn gold"
        id="closeHintBtn"
        type="button"
      >
        GOT IT
      </button>

    </div>
  `);


  $("#closeHint").addEventListener(
    "click",
    closeModal
  );


  $("#closeHintBtn").addEventListener(
    "click",
    closeModal
  );
}


/* =========================================================
   MEMORY BOX
   ========================================================= */

function showBox(c,solved) {

  openModal(`

    <button
      class="close-modal"
      id="closeBox"
      type="button"
    >
      ×
    </button>


    <div class="scene-label">
      MEMORY BOX
    </div>


    <h2>
      ${
        solved
          ? "CASE MEMORY"
          : "LOCKED"
      }
    </h2>


    <p>
      ${
        solved
          ? "The recovered evidence from this case is safely stored here."
          : "Solve this case first and the memory box will unlock."
      }
    </p>


    ${
      solved
        ? `
          <div class="hint-paper">

            <strong>
              RECOVERED DATA
            </strong>

            <br><br>

            ${c.answer}

          </div>
        `
        : ""
    }


    <div
      style="
        text-align:center;
        margin-top:20px;
      "
    >

      <button
        class="game-btn gold"
        id="closeBoxBtn"
        type="button"
      >
        CLOSE
      </button>

    </div>
  `);


  $("#closeBox").addEventListener(
    "click",
    closeModal
  );


  $("#closeBoxBtn").addEventListener(
    "click",
    closeModal
  );
}


/* =========================================================
   HOW TO PLAY
   ========================================================= */

function showHow() {

  openModal(`

    <button
      class="close-modal"
      id="closeHow"
      type="button"
    >
      ×
    </button>


    <div class="scene-label">
      FIELD GUIDE
    </div>


    <h2>
      HOW TO PLAY
    </h2>


    <p>
      Explore the room and use the
      computer to investigate each case.
    </p>


    <p>
      Select the correct addressing mode,
      follow the memory trail, and recover
      the data.
    </p>


    <div class="hint-paper">

      <strong>
        FIVE ADDRESSING MODES
      </strong>

      <br><br>

      <b>Direct</b>
      — address directly identifies the data.

      <br><br>

      <b>Indirect</b>
      — address points to another address.

      <br><br>

      <b>Register</b>
      — data is already in a register.

      <br><br>

      <b>Indexed</b>
      — register value + offset.

      <br><br>

      <b>Immediate</b>
      — data is contained directly
      in the instruction.

    </div>


    <div
      style="
        text-align:center;
        margin-top:20px;
      "
    >

      <button
        class="game-btn gold"
        id="closeHow"
        type="button"
      >
        GOT IT
      </button>

    </div>
  `);


  $("#closeHow").addEventListener(
    "click",
    closeModal
  );
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(html) {

  if (!modal || !modalCard) {
    return;
  }

  modalCard.innerHTML = html;

  modal.classList.remove(
    "hidden"
  );
}


function closeModal() {

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  if (modalCard) {
    modalCard.innerHTML = "";
  }
}


if (modalBackdrop) {

  modalBackdrop.addEventListener(
    "click",
    closeModal
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );
}


/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

  state.screen = "home";
  state.caseIndex = 0;
  state.solved = [];
  state.score = 0;
  state.energy = 5;
  state.hints = 0;
  state.selectedAddress = null;
  state.modeChoice = null;
  state.pathStep = 0;
  state.unlocked = 1;
  state.lastSoundPage = "";

  localStorage.removeItem(
    "addressHunterSave"
  );
}


/* =========================================================
   HEADER BUTTONS
   ========================================================= */

const soundBtn =
  $("#soundBtn");


if (soundBtn) {

  soundBtn.addEventListener(
    "click",
    () => {

      state.sound =
        !state.sound;

      soundBtn.textContent =
        state.sound
          ? "🔊"
          : "🔇";

      save();

      if (state.sound) {
        beep(660,0.08);
      }

    }
  );

}


const helpBtn =
  $("#helpBtn");


if (helpBtn) {

  helpBtn.addEventListener(
    "click",
    () => {

      beep(520,0.08);

      showHow();

    }
  );

}


const menuBtn =
  $("#menuBtn");


if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      openModal(`

        <button
          class="close-modal"
          id="closeMenu"
          type="button"
        >
          ×
        </button>


        <div class="scene-label">
          FIELD MENU
        </div>


        <h2>
          GAME MENU
        </h2>


        <div class="menu-list">

          <button
            class="game-btn"
            id="menuMap"
            type="button"
          >
            CASE MAP
          </button>


          <button
            class="game-btn"
            id="menuHow"
            type="button"
          >
            HOW TO PLAY
          </button>


          <button
            class="game-btn"
            id="menuReset"
            type="button"
          >
            RESET GAME
          </button>

        </div>
      `);


      $("#closeMenu").addEventListener(
        "click",
        closeModal
      );


      $("#menuMap").addEventListener(
        "click",
        () => {

          closeModal();

          renderMap();

        }
      );


      $("#menuHow").addEventListener(
        "click",
        () => {

          closeModal();

          showHow();

        }
      );


      $("#menuReset").addEventListener(
        "click",
        () => {

          resetGame();

          closeModal();

          renderHome();

          showToast(
            "NEW INVESTIGATION STARTED."
          );

        }
      );

    }
  );

}

/* =========================================================
   ADDRESS HUNTER LOGO → MAIN PAGE
   ========================================================= */

const homeBtn = document.getElementById("homeBtn");

if (homeBtn) {

  homeBtn.addEventListener(
    "click",
    () => {

      beep(440, 0.08);

      closeModal();

      renderHome();

    }
  );

}


/* =========================================================
   START GAME
   ========================================================= */

load();

renderHome();

})();
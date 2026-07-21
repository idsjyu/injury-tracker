import { APP_CONFIG } from "./config.js";
import { SEED_DATA } from "./seed-data.js";

const STORAGE_KEY = "injury-tracker-data-v1";
const GATE_KEY = "injury-tracker-gate";
const VERIFIED_KEY = "injury-tracker-verified-members";

if (new URLSearchParams(location.search).get("resetLocal") === "1") {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(GATE_KEY);
  sessionStorage.removeItem(VERIFIED_KEY);
  history.replaceState(null, "", `${location.pathname}${location.hash || ""}`);
}

const STATE_LABELS = {
  active: "Active",
  supposed_to_be_resting: "Should Rest",
  resting: "Resting"
};

const INJURY_LABELS = {
  climbable: "Climbable",
  risky: "Risky",
  no_climbing: "No Climbing"
};

const BODY_ZONES = [
  ["head", "Head", 43, 28, 5.4],
  ["neck", "Neck", 45, 40, 4.4],
  ["chest", "Chest", 50, 52, 5.2],
  ["abdomen", "Abdomen", 51, 65, 5.2],
  ["hip_left", "Left Hip", 45, 75, 4.8],
  ["hip_right", "Right Hip", 59, 72, 4.8],
  ["left_shoulder", "Left Shoulder", 36, 47, 4.5],
  ["left_upper_arm", "Left Upper Arm", 29, 51, 4.4],
  ["left_elbow", "Left Elbow", 22, 55, 4.3],
  ["left_forearm", "Left Forearm", 17, 51, 4.3],
  ["left_wrist", "Left Wrist", 12, 47, 4],
  ["left_hand", "Left Hand", 10, 45, 3.2],
  ["left_thumb", "Left Thumb", 16, 40, 2.6],
  ["left_ring", "Left Ring Finger", 4, 47, 2.4],
  ["left_middle", "Left Middle Finger", 4, 40, 2.4],
  ["right_shoulder", "Right Shoulder", 61, 42, 4.5],
  ["right_upper_arm", "Right Upper Arm", 68, 31, 4.4],
  ["right_elbow", "Right Elbow", 72, 24, 4.3],
  ["right_forearm", "Right Forearm", 73, 15, 4.3],
  ["right_wrist", "Right Wrist", 74, 9, 4],
  ["right_hand", "Right Hand", 76, 7.5, 3.2],
  ["right_thumb", "Right Thumb", 82, 8.5, 2.6],
  ["right_ring", "Right Ring Finger", 76, 0.7, 2.4],
  ["right_middle", "Right Middle Finger", 72, 0.5, 2.4],
  ["right_pinky", "Right Pinky Finger", 80, 0.8, 2.4],
  ["left_thigh", "Left Thigh", 43, 84, 4.7],
  ["left_knee", "Left Knee", 37, 98, 4.4],
  ["left_shin", "Left Shin", 31, 111, 4.4],
  ["left_calf", "Left Calf", 35, 111, 4.4],
  ["left_ankle", "Left Ankle", 24, 122, 4],
  ["left_foot", "Left Foot", 17, 125, 4.5],
  ["right_thigh", "Right Thigh", 69, 77, 4.7],
  ["right_knee", "Right Knee", 84, 80, 4.4],
  ["right_shin", "Right Shin", 89, 95, 4.4],
  ["right_calf", "Right Calf", 94, 96, 4.4],
  ["right_ankle", "Right Ankle", 90, 111, 4],
  ["right_foot", "Right Foot", 96, 117, 4.5]
].map(([key, label, x, y, radius]) => ({ key, label, x, y, radius }));

const BODY_ZONE_BY_KEY = Object.fromEntries(
  BODY_ZONES.map((zone) => [zone.key, zone])
);

const DEFAULT_AVATAR_OUTFIT = {
  skinLight: "#ffd4af",
  skinMid: "#e8a578",
  skinDark: "#b96f4d",
  shirtLight: "#ff8d45",
  shirtDark: "#ec5d23",
  shortsLight: "#48555f",
  shortsDark: "#242b33",
  hairLight: "#c77a28",
  hairDark: "#7f451f",
  shoe: "#22a9c8",
  harness: "#2b3844"
};

const POSE_VARIANTS = [
  {
    id: "back-high-step",
    name: "High Step",
    outfit: {
      shirtLight: "#ff8e47",
      shirtDark: "#f15d22",
      shortsLight: "#4a5661",
      shortsDark: "#25303a",
      hairLight: "#c9872f",
      hairDark: "#80451c",
      shoe: "#1eb2d0"
    },
    headAngle: -5,
    points: {
      head: [51, 27], neck: [52, 40],
      leftShoulder: [41, 44], leftElbow: [31, 29], leftWrist: [28, 15], leftHand: [27, 9],
      rightShoulder: [64, 43], rightElbow: [75, 31], rightWrist: [81, 18], rightHand: [83, 12],
      leftHip: [46, 77], leftKnee: [32, 87], leftAnkle: [23, 75], leftFoot: [16, 72],
      rightHip: [62, 76], rightKnee: [65, 101], rightAnkle: [64, 123], rightFoot: [72, 126]
    }
  },
  {
    id: "back-frog-sit",
    name: "Frog Sit",
    outfit: {
      shirtLight: "#ff9387",
      shirtDark: "#f0665d",
      shortsLight: "#5a85dd",
      shortsDark: "#315bb6",
      hairLight: "#ad6038",
      hairDark: "#74361f",
      shoe: "#ff706e"
    },
    headAngle: 0,
    points: {
      head: [54, 29], neck: [54, 42],
      leftShoulder: [42, 46], leftElbow: [31, 30], leftWrist: [28, 16], leftHand: [28, 10],
      rightShoulder: [66, 46], rightElbow: [77, 30], rightWrist: [80, 16], rightHand: [80, 10],
      leftHip: [45, 77], leftKnee: [27, 89], leftAnkle: [18, 108], leftFoot: [10, 111],
      rightHip: [63, 77], rightKnee: [82, 89], rightAnkle: [91, 108], rightFoot: [99, 111]
    }
  },
  {
    id: "back-straight-hang",
    name: "Straight Hang",
    outfit: {
      shirtLight: "#62b6f3",
      shirtDark: "#358bd6",
      shortsLight: "#3d4248",
      shortsDark: "#25272b",
      hairLight: "#5a4b45",
      hairDark: "#312724",
      shoe: "#262a2f"
    },
    headAngle: 2,
    points: {
      head: [54, 31], neck: [54, 44],
      leftShoulder: [42, 47], leftElbow: [35, 31], leftWrist: [33, 16], leftHand: [33, 10],
      rightShoulder: [66, 47], rightElbow: [73, 31], rightWrist: [75, 16], rightHand: [75, 10],
      leftHip: [46, 79], leftKnee: [44, 102], leftAnkle: [43, 123], leftFoot: [36, 127],
      rightHip: [62, 79], rightKnee: [64, 102], rightAnkle: [66, 123], rightFoot: [73, 127]
    }
  },
  {
    id: "back-side-reach",
    name: "Side Reach",
    outfit: {
      shirtLight: "#24b3bd",
      shirtDark: "#147b8b",
      shortsLight: "#4e5561",
      shortsDark: "#303541",
      hairLight: "#b65a39",
      hairDark: "#71301f",
      shoe: "#51545e"
    },
    headAngle: 8,
    points: {
      head: [56, 34], neck: [56, 47],
      leftShoulder: [44, 49], leftElbow: [29, 49], leftWrist: [16, 53], leftHand: [10, 55],
      rightShoulder: [68, 48], rightElbow: [78, 35], rightWrist: [84, 21], rightHand: [86, 15],
      leftHip: [49, 80], leftKnee: [35, 91], leftAnkle: [24, 80], leftFoot: [16, 77],
      rightHip: [66, 79], rightKnee: [83, 88], rightAnkle: [98, 98], rightFoot: [106, 97]
    }
  },
  {
    id: "back-high-flag",
    name: "High Flag",
    outfit: {
      shirtLight: "#5b5658",
      shirtDark: "#343234",
      shortsLight: "#444247",
      shortsDark: "#242327",
      hairLight: "#51443f",
      hairDark: "#27211f",
      shoe: "#252329"
    },
    headAngle: -3,
    points: {
      head: [51, 31], neck: [51, 44],
      leftShoulder: [39, 47], leftElbow: [31, 31], leftWrist: [29, 16], leftHand: [29, 10],
      rightShoulder: [63, 46], rightElbow: [79, 48], rightWrist: [94, 45], rightHand: [101, 42],
      leftHip: [44, 78], leftKnee: [38, 101], leftAnkle: [30, 123], leftFoot: [23, 128],
      rightHip: [61, 77], rightKnee: [74, 68], rightAnkle: [79, 46], rightFoot: [82, 36]
    }
  }
];

let bodyMapRenderId = 0;

const state = {
  route: parseRoute(),
  gatePassed: localStorage.getItem(GATE_KEY) === "ok",
  gateError: "",
  loading: true,
  error: "",
  store: null,
  storeLabel: "Loading",
  data: clone(SEED_DATA),
  search: "",
  bodySearch: "",
  verifiedMembers: loadJson(VERIFIED_KEY, {}),
  drafts: {}
};

const app = document.querySelector("#app");

window.addEventListener("hashchange", () => {
  state.route = parseRoute();
  state.bodySearch = "";
  render();
});

document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);

boot();

async function boot() {
  render();
  state.store = await createStore();
  state.storeLabel = state.store.label;
  await refreshData();
  state.loading = false;
  render();

  state.store.subscribe(async () => {
    await refreshData({ silent: true });
    render();
  });
}

async function createStore() {
  if (APP_CONFIG.supabaseUrl && APP_CONFIG.supabaseAnonKey) {
    try {
      return await createSupabaseStore(APP_CONFIG);
    } catch (error) {
      console.warn("Supabase unavailable, falling back to local store.", error);
      state.error =
        "Supabase connection failed. Using this browser's local demo data.";
    }
  }

  return createLocalStore();
}

async function refreshData({ silent = false } = {}) {
  try {
    state.data = await state.store.load();
    if (!silent) state.error = state.error || "";
  } catch (error) {
    state.error = readableError(error);
  }
}

function render() {
  if (!state.gatePassed) {
    app.innerHTML = renderGate();
    return;
  }

  if (state.loading) {
    app.innerHTML = renderLoading();
    return;
  }

  const content = renderRoute();
  app.innerHTML = renderShell(content);
}

function renderRoute() {
  if (state.route.name === "timeline") return renderTimeline();
  if (state.route.name === "member") return renderMember(state.route.memberId);
  if (state.route.name === "addMember") return renderAddMember();
  if (state.route.name === "addInjury") {
    return renderInjuryForm(state.route.memberId);
  }
  if (state.route.name === "editInjury") {
    return renderInjuryForm(state.route.memberId, state.route.injuryId);
  }
  return renderPeople();
}

function renderGate() {
  return `
    <main class="gate">
      <section class="gate-panel">
        <div class="mark">NCS</div>
        <h1>Injury Tracker</h1>
        <p class="muted">A shared climbing status board for the crew.</p>
        <form data-form="gate" class="stack">
          <label for="gate-answer">${escapeHtml(APP_CONFIG.gateQuestion)}</label>
          <input
            id="gate-answer"
            name="answer"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            placeholder="answer"
            required
          />
          ${state.gateError ? `<p class="error">${escapeHtml(state.gateError)}</p>` : ""}
          <button class="primary-button" type="submit">Enter</button>
        </form>
      </section>
    </main>
  `;
}

function renderLoading() {
  return `
    <main class="app-frame">
      <section class="empty-state">
        <div class="loader"></div>
        <p>Loading injury board...</p>
      </section>
    </main>
  `;
}

function renderShell(content) {
  const active = state.route.name === "timeline" ? "timeline" : "people";
  return `
    <div class="app-frame">
      ${state.error ? `<div class="notice">${escapeHtml(state.error)}</div>` : ""}
      ${content}
      <nav class="bottom-nav" aria-label="Primary navigation">
        <a class="${active === "people" ? "active" : ""}" href="#/">
          <span class="nav-icon people-icon"></span>
          <span>People</span>
        </a>
        <a class="${active === "timeline" ? "active" : ""}" href="#/timeline">
          <span class="nav-icon timeline-icon"></span>
          <span>Timeline</span>
        </a>
      </nav>
    </div>
  `;
}

function renderPeople() {
  const members = enrichedMembers();
  const query = state.search.trim().toLowerCase();
  const filtered = members.filter((member) => {
    const text = [
      member.name,
      member.effectiveState,
      ...member.currentInjuries.map((injury) => injury.injuryTitle)
    ]
      .join(" ")
      .toLowerCase();
    return text.includes(query);
  });

  const notClimbing = filtered
    .filter((member) => member.effectiveState === "resting")
    .sort(sortBySeverity);
  const climbing = filtered
    .filter((member) => member.effectiveState !== "resting")
    .sort(sortBySeverity);

  return `
    <main class="screen">
      <header class="topbar">
        <div>
          <div class="eyebrow">NCS</div>
          <h1>People</h1>
        </div>
        <a class="icon-text-button" href="#/add-member">
          <span class="plus-icon"></span>
          <span>New</span>
        </a>
      </header>

      <label class="search-field">
        <span class="search-icon"></span>
        <input
          id="people-search"
          value="${escapeAttr(state.search)}"
          placeholder="Search members..."
          autocomplete="off"
        />
      </label>

      ${renderStats(members)}
      ${renderMemberSection("Not Climbing", notClimbing)}
      ${renderMemberSection("Climbing", climbing)}
    </main>
  `;
}

function renderStats(members) {
  const counts = members.reduce(
    (acc, member) => {
      acc[member.effectiveState] += 1;
      return acc;
    },
    { active: 0, supposed_to_be_resting: 0, resting: 0 }
  );

  return `
    <section class="status-grid" aria-label="Group status">
      ${renderStat("Active", counts.active, "active")}
      ${renderStat("Should Rest", counts.supposed_to_be_resting, "supposed_to_be_resting")}
      ${renderStat("Resting", counts.resting, "resting")}
    </section>
  `;
}

function renderStat(label, value, tone) {
  return `
    <div class="stat ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderMemberSection(title, members) {
  return `
    <section class="member-section">
      <h2>${escapeHtml(title)} <span>(${members.length})</span></h2>
      ${
        members.length
          ? members.map(renderMemberCard).join("")
          : `<div class="empty-line">No members here.</div>`
      }
    </section>
  `;
}

function renderMemberCard(member) {
  const injurySummary = member.currentInjuries
    .map((injury) => injury.injuryTitle)
    .filter(Boolean);
  const primary = injurySummary[0] || "No current injuries";
  const extra = injurySummary.length > 1 ? `+${injurySummary.length - 1} more` : "";
  const markers = getMarkersForInjuries(member.currentInjuries);

  return `
    <a class="member-card" href="#/member/${escapeAttr(member.id)}">
      <div class="mini-map">
        ${renderBodyMap({ markers, compact: true, poseVariant: poseValueForMember(member) })}
      </div>
      <div class="card-main">
        <div class="card-title-row">
          <h3>${escapeHtml(member.name)}</h3>
          <span class="chevron"></span>
        </div>
        ${renderStateBadge(member.effectiveState)}
        <p>${escapeHtml(primary)}</p>
        ${extra ? `<p class="subtle">${escapeHtml(extra)}</p>` : ""}
      </div>
    </a>
  `;
}

function renderTimeline() {
  const members = enrichedMembers()
    .filter((member) => member.effectiveState !== "active")
    .map((member) => ({
      ...member,
      timelineDate: member.expectedReturnDate || earliestReturnDate(member.currentInjuries)
    }))
    .sort((a, b) => compareTimelineDates(a.timelineDate, b.timelineDate));

  const dated = members.filter((member) => member.timelineDate);
  const noDate = members.filter((member) => !member.timelineDate);

  return `
    <main class="screen">
      <header class="topbar">
        <div>
          <div class="eyebrow">Expected recovery dates</div>
          <h1>Return Timeline</h1>
        </div>
      </header>

      <section class="timeline-list">
        ${dated.map(renderTimelineItem).join("")}
        ${noDate.length ? renderTimelineGroup("No Date Set", noDate) : ""}
        ${members.length ? "" : `<div class="empty-state"><p>No one is off the wall right now.</p></div>`}
      </section>
    </main>
  `;
}

function renderTimelineGroup(title, members) {
  return `
    <div class="timeline-group">
      <div class="timeline-group-title">
        <span>${escapeHtml(title)}</span>
        <strong>${members.length}</strong>
      </div>
      ${members.map(renderTimelineItem).join("")}
    </div>
  `;
}

function renderTimelineItem(member) {
  const injuries = member.currentInjuries.map((injury) => injury.injuryTitle).join(", ");
  const dateLabel = member.timelineDate
    ? `${formatDate(member.timelineDate)}${isPast(member.timelineDate) ? " overdue" : ""}`
    : "No return date set";

  return `
    <a class="timeline-card" href="#/member/${escapeAttr(member.id)}">
      <div>
        <h3>${escapeHtml(member.name)}</h3>
        ${renderStateBadge(member.effectiveState)}
        <p>${escapeHtml(injuries || "No current injuries")}</p>
      </div>
      <time>${escapeHtml(dateLabel)}</time>
    </a>
  `;
}

function renderMember(memberId) {
  const member = enrichedMembers().find((item) => item.id === memberId);
  if (!member) return renderMissing("Member not found.");

  const unlocked = Boolean(state.verifiedMembers[member.id]);
  const current = member.currentInjuries;
  const past = member.injuries.filter((injury) => !injury.isCurrent);
  const markers = getMarkersForInjuries(current.length ? current : member.injuries);

  return `
    <main class="screen detail-screen">
      <header class="detail-header">
        <button class="ghost-button" type="button" data-action="back">
          <span class="back-icon"></span>
          <span>Back</span>
        </button>
        <a class="icon-text-button" href="#/add-injury/${escapeAttr(member.id)}">
          <span class="plus-icon"></span>
          <span>Injury</span>
        </a>
      </header>

      <section class="profile-panel">
        <div class="profile-map">
          ${renderBodyMap({ markers, poseVariant: poseValueForMember(member) })}
        </div>
        <div class="profile-copy">
          <h1>${escapeHtml(member.name)}</h1>
          ${renderStateBadge(member.effectiveState)}
          <p class="muted">Last updated ${formatDateTime(member.updatedAt)}</p>
          ${
            member.activityStateOverride
              ? `<p class="override-note">Manual override is active.</p>`
              : `<p class="override-note">Status is calculated from current injuries.</p>`
          }
        </div>
      </section>

      ${unlocked ? renderMemberEditor(member) : renderPinPanel(member)}

      <section class="detail-section">
        <div class="section-title-row">
          <h2>Current Injuries <span>(${current.length})</span></h2>
        </div>
        ${
          current.length
            ? current.map((injury) => renderInjuryCard(member, injury, unlocked)).join("")
            : `<div class="empty-line">No current injuries.</div>`
        }
      </section>

      <section class="detail-section">
        <h2>Past Injuries <span>(${past.length})</span></h2>
        ${
          past.length
            ? past.map((injury) => renderInjuryCard(member, injury, unlocked)).join("")
            : `<div class="empty-line">No past injuries yet.</div>`
        }
      </section>
    </main>
  `;
}

function renderMemberEditor(member) {
  return `
    <section class="edit-panel">
      <form data-form="member" data-member-id="${escapeAttr(member.id)}" class="stack">
        <div class="two-column">
          <label>
            Name
            <input name="name" value="${escapeAttr(member.name)}" required />
          </label>
          <label>
            Return date
            <input name="expectedReturnDate" type="date" value="${escapeAttr(member.expectedReturnDate || "")}" />
          </label>
        </div>
        <label>
          Override status
          <select name="activityStateOverride">
            <option value="" ${member.activityStateOverride ? "" : "selected"}>Auto calculated</option>
            ${renderOption("active", "Active", member.activityStateOverride)}
            ${renderOption("supposed_to_be_resting", "Should Rest", member.activityStateOverride)}
            ${renderOption("resting", "Resting", member.activityStateOverride)}
          </select>
        </label>
        <button class="primary-button" type="submit">Save member</button>
      </form>

      <form data-form="pin-change" data-member-id="${escapeAttr(member.id)}" class="pin-change">
        <label>
          Change PIN
          <input name="newPin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="4 digits" />
        </label>
        <button class="secondary-button" type="submit">Update PIN</button>
      </form>
    </section>
  `;
}

function renderPinPanel(member) {
  return `
    <section class="pin-panel">
      <form data-form="pin" data-member-id="${escapeAttr(member.id)}" class="pin-row">
        <label>
          Unlock your edits
          <input
            name="pin"
            inputmode="numeric"
            maxlength="4"
            pattern="[0-9]{4}"
            placeholder="0000"
            autocomplete="off"
          />
        </label>
        <button class="secondary-button" type="submit">Unlock</button>
      </form>
      <p class="muted">Members without a custom PIN use 0000.</p>
    </section>
  `;
}

function renderInjuryCard(member, injury, unlocked) {
  const markers = getMarkersForInjuries([injury]);
  return `
    <article class="injury-card">
      <div class="injury-map">${renderBodyMap({ markers, compact: true, poseVariant: poseValueForMember(member) })}</div>
      <div class="injury-body">
        <div class="card-title-row">
          <h3>${escapeHtml(injury.injuryTitle)}</h3>
          ${renderInjuryBadge(injury.injuryStatus)}
        </div>
        <p>${escapeHtml(injury.notes || "No notes")}</p>
        <dl class="meta-list">
          <div><dt>Started</dt><dd>${escapeHtml(formatDate(injury.startDate))}</dd></div>
          <div><dt>Return</dt><dd>${escapeHtml(formatDate(injury.expectedReturnDate))}</dd></div>
        </dl>
        ${
          unlocked
            ? `<div class="action-row">
                <a class="secondary-button slim" href="#/edit-injury/${escapeAttr(member.id)}/${escapeAttr(injury.id)}">Edit</a>
                ${
                  injury.isCurrent
                    ? `<button class="ghost-danger slim" type="button" data-action="resolve-injury" data-member-id="${escapeAttr(member.id)}" data-injury-id="${escapeAttr(injury.id)}">Resolve</button>`
                    : ""
                }
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderAddMember() {
  return `
    <main class="screen">
      <header class="detail-header">
        <button class="ghost-button" type="button" data-action="back">
          <span class="back-icon"></span>
          <span>Back</span>
        </button>
      </header>
      <section class="form-panel">
        <h1>Add Member</h1>
        <form data-form="add-member" class="stack">
          <label>
            Name
            <input name="name" placeholder="Enter name..." required autofocus />
          </label>
          <p class="muted">New members start with PIN 0000.</p>
          <button class="primary-button" type="submit">Add Member</button>
        </form>
      </section>
    </main>
  `;
}

function renderInjuryForm(memberId, injuryId = "") {
  const member = enrichedMembers().find((item) => item.id === memberId);
  if (!member) return renderMissing("Member not found.");

  const existing = injuryId
    ? member.injuries.find((injury) => injury.id === injuryId)
    : null;
  if (injuryId && !existing) return renderMissing("Injury not found.");

  const draft = getInjuryDraft(member, existing);
  const selectedZones = draft.selectedZones
    .map((key) => BODY_ZONE_BY_KEY[key]?.label || titleize(key))
    .join(", ");
  const filteredZones = BODY_ZONES.filter((zone) =>
    zone.label.toLowerCase().includes(state.bodySearch.toLowerCase())
  );
  const locked = !state.verifiedMembers[member.id];

  return `
    <main class="screen">
      <header class="detail-header">
        <button class="ghost-button" type="button" data-action="back">
          <span class="back-icon"></span>
          <span>${existing ? "Cancel" : "Back"}</span>
        </button>
      </header>

      <section class="form-panel">
        <h1>${existing ? "Edit Injury" : "Log Injury"}</h1>
        <form data-form="injury" data-member-id="${escapeAttr(member.id)}" data-injury-id="${escapeAttr(existing?.id || "")}" class="stack">
          <div class="body-picker">
            <div class="picker-title">Where? <span>(tap body, up to 3)</span></div>
            ${renderBodyMap({
              selectedKeys: draft.selectedZones,
              interactive: true,
              poseVariant: poseValueForMember(member)
            })}
            <label class="search-field compact-search">
              <span class="search-icon"></span>
              <input
                id="body-search"
                value="${escapeAttr(state.bodySearch)}"
                placeholder="Search body part..."
                autocomplete="off"
              />
            </label>
            <div class="zone-chips">
              ${filteredZones.slice(0, 8).map((zone) => renderZoneChip(zone, draft.selectedZones)).join("")}
            </div>
            <p class="muted">${selectedZones ? `Selected: ${escapeHtml(selectedZones)}` : "No body part selected yet."}</p>
          </div>

          <label>
            Injury description
            <input name="description" value="${escapeAttr(draft.description)}" placeholder="e.g. Finger pulley strain" />
          </label>

          <fieldset class="segmented">
            <legend>Can you still climb?</legend>
            ${renderStatusOption("climbable", "Yes", draft.injuryStatus)}
            ${renderStatusOption("risky", "Risky", draft.injuryStatus)}
            ${renderStatusOption("no_climbing", "No", draft.injuryStatus)}
          </fieldset>

          <div class="two-column">
            <label>
              Date injured
              <input name="startDate" type="date" value="${escapeAttr(draft.startDate)}" />
            </label>
            <label>
              Return date
              <input name="expectedReturnDate" type="date" value="${escapeAttr(draft.expectedReturnDate || "")}" />
            </label>
          </div>

          <div class="two-column">
            <label>
              Recovery time
              <input name="recoveryAmount" type="number" min="0" step="1" value="${escapeAttr(draft.recoveryAmount)}" placeholder="-" />
            </label>
            <label>
              Unit
              <select name="recoveryUnit">
                <option value="days" ${draft.recoveryUnit === "days" ? "selected" : ""}>Days</option>
                <option value="weeks" ${draft.recoveryUnit === "weeks" ? "selected" : ""}>Weeks</option>
                <option value="months" ${draft.recoveryUnit === "months" ? "selected" : ""}>Months</option>
              </select>
            </label>
          </div>

          <label>
            Notes
            <textarea name="notes" rows="4" placeholder="Any details...">${escapeHtml(draft.notes)}</textarea>
          </label>

          ${
            locked
              ? `<label>
                  Your 4-digit PIN
                  <input name="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="0000" />
                </label>`
              : ""
          }

          <button class="primary-button" type="submit">${existing ? "Save Injury" : "Save"}</button>
        </form>
      </section>
    </main>
  `;
}

function renderZoneChip(zone, selectedZones) {
  const selected = selectedZones.includes(zone.key);
  return `
    <button
      class="zone-chip ${selected ? "selected" : ""}"
      type="button"
      data-action="toggle-zone"
      data-zone-key="${escapeAttr(zone.key)}"
    >${escapeHtml(zone.label)}</button>
  `;
}

function renderStatusOption(value, label, selected) {
  return `
    <label class="segment ${selected === value ? "selected" : ""}">
      <input type="radio" name="injuryStatus" value="${escapeAttr(value)}" ${selected === value ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderMissing(message) {
  return `
    <main class="screen">
      <section class="empty-state">
        <h1>${escapeHtml(message)}</h1>
        <a class="secondary-button" href="#/">Back to people</a>
      </section>
    </main>
  `;
}

function renderAvatar(pose, outfit, mapId) {
  const points = getPosePoints(pose);
  const leftSleeveEnd = interpolatePoint(points.leftShoulder, points.leftElbow, 0.3);
  const rightSleeveEnd = interpolatePoint(points.rightShoulder, points.rightElbow, 0.3);
  const leftShortEnd = interpolatePoint(points.leftHip, points.leftKnee, 0.24);
  const rightShortEnd = interpolatePoint(points.rightHip, points.rightKnee, 0.24);
  const leftWaist = interpolatePoint(points.leftShoulder, points.leftHip, 0.7);
  const rightWaist = interpolatePoint(points.rightShoulder, points.rightHip, 0.7);
  const hipCenter = midpoint(points.leftHip, points.rightHip);
  const shoulderCenter = midpoint(points.leftShoulder, points.rightShoulder);
  const head = points.head;
  const headAngle = pose.headAngle || 0;

  return `
    <g class="wall-holds">
      ${renderClimbingHold(points.leftHand, points.leftWrist, mapId, 5.1)}
      ${renderClimbingHold(points.rightHand, points.rightWrist, mapId, 5.1)}
      ${renderClimbingHold(points.leftFoot, points.leftAnkle, mapId, 5.5)}
      ${renderClimbingHold(points.rightFoot, points.rightAnkle, mapId, 5.5)}
    </g>
    <g class="body-base" filter="url(#${mapId}-soft-shadow)">
      <path class="climber-leg" stroke="url(#${mapId}-skin)" d="${jointPath(points.leftHip, points.leftKnee, points.leftAnkle)}"></path>
      <path class="climber-leg" stroke="url(#${mapId}-skin)" d="${jointPath(points.rightHip, points.rightKnee, points.rightAnkle)}"></path>
      <path class="climber-shorts-leg" stroke="url(#${mapId}-shorts)" d="${linePath(points.leftHip, leftShortEnd)}"></path>
      <path class="climber-shorts-leg" stroke="url(#${mapId}-shorts)" d="${linePath(points.rightHip, rightShortEnd)}"></path>
      ${renderClimbingShoe(points.leftAnkle, points.leftFoot, outfit.shoe, "left")}
      ${renderClimbingShoe(points.rightAnkle, points.rightFoot, outfit.shoe, "right")}

      <path class="climber-arm" stroke="url(#${mapId}-skin)" d="${jointPath(points.leftShoulder, points.leftElbow, points.leftWrist)}"></path>
      <path class="climber-arm" stroke="url(#${mapId}-skin)" d="${jointPath(points.rightShoulder, points.rightElbow, points.rightWrist)}"></path>
      <path class="climber-sleeve" stroke="url(#${mapId}-shirt)" d="${linePath(points.leftShoulder, leftSleeveEnd)}"></path>
      <path class="climber-sleeve" stroke="url(#${mapId}-shirt)" d="${linePath(points.rightShoulder, rightSleeveEnd)}"></path>

      <path class="climber-neck" stroke="url(#${mapId}-skin)" d="${linePath(points.neck, { x: head.x, y: head.y + 8 })}"></path>
      <path
        class="climber-shirt"
        fill="url(#${mapId}-shirt)"
        d="M ${svgPoint(points.leftShoulder)} Q ${svgPoint(points.neck)} ${svgPoint(points.rightShoulder)} C ${svgPoint(interpolatePoint(points.rightShoulder, points.rightHip, 0.45))} ${svgPoint(rightWaist)} ${svgPoint(points.rightHip)} Q ${svgPoint({ x: hipCenter.x, y: hipCenter.y + 4 })} ${svgPoint(points.leftHip)} C ${svgPoint(leftWaist)} ${svgPoint(interpolatePoint(points.leftShoulder, points.leftHip, 0.45))} ${svgPoint(points.leftShoulder)} Z"
      ></path>
      <path
        class="shirt-back-shadow"
        d="M ${svgPoint(points.leftShoulder)} Q ${svgPoint(shoulderCenter)} ${svgPoint(points.neck)} L ${svgPoint(hipCenter)} Q ${svgPoint(points.leftHip)} ${svgPoint(leftWaist)} Z"
      ></path>
      <path
        class="climber-shorts"
        fill="url(#${mapId}-shorts)"
        d="M ${svgPoint(leftWaist)} Q ${svgPoint(hipCenter)} ${svgPoint(rightWaist)} L ${svgPoint(points.rightHip)} Q ${svgPoint({ x: hipCenter.x, y: hipCenter.y + 4 })} ${svgPoint(points.leftHip)} Z"
      ></path>
      <path class="harness-strap" stroke="${outfit.harness}" d="M ${svgPoint(points.leftShoulder)} L ${svgPoint(points.rightHip)} M ${svgPoint(points.rightShoulder)} L ${svgPoint(points.leftHip)}"></path>
      <path class="harness-belt" stroke="${outfit.harness}" d="M ${svgPoint(leftWaist)} Q ${svgPoint({ x: hipCenter.x, y: hipCenter.y - 2 })} ${svgPoint(rightWaist)}"></path>
      <ellipse class="chalk-bag" cx="${formatNumber(hipCenter.x + 5)}" cy="${formatNumber(hipCenter.y)}" rx="5.1" ry="6" fill="#526273" transform="rotate(8 ${formatNumber(hipCenter.x + 5)} ${formatNumber(hipCenter.y)})"></ellipse>

      <ellipse class="climber-head" cx="${formatNumber(head.x)}" cy="${formatNumber(head.y)}" rx="10.8" ry="12" fill="url(#${mapId}-skin)" transform="rotate(${headAngle} ${formatNumber(head.x)} ${formatNumber(head.y)})"></ellipse>
      <path
        class="climber-hair"
        fill="url(#${mapId}-hair)"
        d="M ${formatNumber(head.x - 10.5)} ${formatNumber(head.y - 2)} C ${formatNumber(head.x - 9)} ${formatNumber(head.y - 11)} ${formatNumber(head.x - 1)} ${formatNumber(head.y - 15)} ${formatNumber(head.x + 7)} ${formatNumber(head.y - 10)} C ${formatNumber(head.x + 13)} ${formatNumber(head.y - 5)} ${formatNumber(head.x + 10)} ${formatNumber(head.y + 5)} ${formatNumber(head.x + 5)} ${formatNumber(head.y + 9)} C ${formatNumber(head.x + 1)} ${formatNumber(head.y + 3)} ${formatNumber(head.x - 6)} ${formatNumber(head.y + 5)} ${formatNumber(head.x - 10)} ${formatNumber(head.y + 2)} Z"
        transform="rotate(${headAngle} ${formatNumber(head.x)} ${formatNumber(head.y)})"
      ></path>
      <path class="hair-sweep" d="M ${formatNumber(head.x - 7)} ${formatNumber(head.y - 7)} Q ${formatNumber(head.x)} ${formatNumber(head.y - 12)} ${formatNumber(head.x + 7)} ${formatNumber(head.y - 5)} M ${formatNumber(head.x - 8)} ${formatNumber(head.y - 2)} Q ${formatNumber(head.x)} ${formatNumber(head.y - 7)} ${formatNumber(head.x + 6)} ${formatNumber(head.y)}"></path>

      ${renderClimberHand(points.leftWrist, points.leftHand, mapId, "left")}
      ${renderClimberHand(points.rightWrist, points.rightHand, mapId, "right")}
    </g>
  `;
}

function renderClimberHand(wrist, hand, mapId, side) {
  const direction = unitVector(wrist, hand);
  const normal = { x: -direction.y, y: direction.x };
  const angle = angleBetween(wrist, hand) + 90;
  const fingerStarts = [-2.4, 0, 2.4].map((offset) => addPoints(hand, scalePoint(normal, offset)));
  const fingerEnds = fingerStarts.map((point, index) =>
    addPoints(point, scalePoint(direction, index === 1 ? 4.6 : 3.8))
  );

  return `
    <path class="climber-palm-link" stroke="url(#${mapId}-skin)" d="${linePath(wrist, hand)}"></path>
    <ellipse class="climber-hand" data-body-part="${side}-hand" cx="${formatNumber(hand.x)}" cy="${formatNumber(hand.y)}" rx="4.2" ry="5.3" fill="url(#${mapId}-skin)" transform="rotate(${formatNumber(angle)} ${formatNumber(hand.x)} ${formatNumber(hand.y)})"></ellipse>
    <path class="climber-fingers" stroke="url(#${mapId}-skin)" d="${fingerStarts.map((point, index) => `${linePath(point, fingerEnds[index])}`).join(" ")}"></path>
  `;
}

function renderClimbingShoe(ankle, foot, color, side) {
  const direction = unitVector(ankle, foot);
  let normal = { x: -direction.y, y: direction.x };
  if (normal.y < 0) normal = scalePoint(normal, -1);
  const soleStart = addPoints(interpolatePoint(ankle, foot, 0.35), scalePoint(normal, 3));
  const soleEnd = addPoints(addPoints(foot, scalePoint(direction, 2.2)), scalePoint(normal, 3));

  return `
    <path class="climber-shoe-shape" data-body-part="${side}-foot" stroke="${color}" d="${linePath(ankle, foot)}"></path>
    <path class="climber-shoe-sole" d="${linePath(soleStart, soleEnd)}"></path>
  `;
}

function renderClimbingHold(point, joint, mapId, radius) {
  const angle = angleBetween(joint, point);
  return `<ellipse cx="${formatNumber(point.x)}" cy="${formatNumber(point.y + 1.4)}" rx="${radius}" ry="2.2" fill="url(#${mapId}-hold)" transform="rotate(${formatNumber(angle)} ${formatNumber(point.x)} ${formatNumber(point.y + 1.4)})"></ellipse>`;
}

function renderBodyMap({
  markers = [],
  selectedKeys = [],
  interactive = false,
  compact = false,
  poseVariant = "",
  poseSeed = ""
} = {}) {
  const mapId = `body-map-${bodyMapRenderId++}`;
  const pose = getPoseVariant(poseVariant || poseSeed);
  const outfit = { ...DEFAULT_AVATAR_OUTFIT, ...(pose.outfit || {}) };
  const poseZones = BODY_ZONES.map((zone) => getZoneForPose(zone.key, pose));
  const selectedMarkers = selectedKeys
    .map((key) => getZoneForPose(key, pose))
    .filter(Boolean)
    .map((zone) => ({
      bodyZoneKey: zone.key,
      xPosition: zone.x,
      yPosition: zone.y
    }));
  const allMarkers = [...markers, ...selectedMarkers].map((marker) => {
    const zone = getZoneForPose(marker.bodyZoneKey, pose);
    return {
      ...marker,
      xPosition: zone?.x ?? marker.xPosition,
      yPosition: zone?.y ?? marker.yPosition
    };
  });
  return `
    <svg
      class="body-map ${compact ? "compact" : ""} ${interactive ? "interactive" : ""}"
      data-pose-id="${escapeAttr(pose.id)}"
      viewBox="-16 -14 142 156"
      role="img"
      aria-label="Body injury map"
    >
      <defs>
        <radialGradient id="${mapId}-skin" cx="32%" cy="18%" r="82%">
          <stop offset="0%" stop-color="${outfit.skinLight}"></stop>
          <stop offset="55%" stop-color="${outfit.skinMid}"></stop>
          <stop offset="100%" stop-color="${outfit.skinDark}"></stop>
        </radialGradient>
        <linearGradient id="${mapId}-shirt" x1="26%" y1="8%" x2="90%" y2="100%">
          <stop offset="0%" stop-color="${outfit.shirtLight}"></stop>
          <stop offset="100%" stop-color="${outfit.shirtDark}"></stop>
        </linearGradient>
        <linearGradient id="${mapId}-shorts" x1="10%" y1="10%" x2="92%" y2="100%">
          <stop offset="0%" stop-color="${outfit.shortsLight}"></stop>
          <stop offset="100%" stop-color="${outfit.shortsDark}"></stop>
        </linearGradient>
        <linearGradient id="${mapId}-hair" x1="15%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stop-color="${outfit.hairLight}"></stop>
          <stop offset="100%" stop-color="${outfit.hairDark}"></stop>
        </linearGradient>
        <linearGradient id="${mapId}-hold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e4dbd1"></stop>
          <stop offset="100%" stop-color="#b7a99a"></stop>
        </linearGradient>
        <filter id="${mapId}-soft-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="1.4" dy="2.8" stdDeviation="2.4" flood-color="#34281d" flood-opacity="0.23"></feDropShadow>
        </filter>
      </defs>
      ${renderAvatar(pose, outfit, mapId)}
      ${
        interactive
          ? poseZones.map((zone) => {
              const selected = selectedKeys.includes(zone.key);
              const radius = compact ? 3 : zone.radius;
              return `
                <circle
                  class="zone-hit ${selected ? "selected" : ""}"
                  cx="${zone.x}"
                  cy="${zone.y}"
                  r="${radius}"
                  data-action="toggle-zone"
                  data-zone-key="${escapeAttr(zone.key)}"
                >
                  <title>${escapeHtml(zone.label)}</title>
                </circle>
              `;
            }).join("")
          : ""
      }
      ${allMarkers
        .map(
          (marker) => `
            <circle
              class="injury-dot"
              cx="${Number(marker.xPosition).toFixed(2)}"
              cy="${Number(marker.yPosition).toFixed(2)}"
              r="${compact ? 2.2 : 3}"
            >
              <title>${escapeHtml(bodyZoneLabel(marker.bodyZoneKey))}</title>
            </circle>
          `
        )
        .join("")}
    </svg>
  `;
}

function renderStateBadge(value) {
  return `<span class="state-badge ${escapeAttr(value)}">${escapeHtml(STATE_LABELS[value] || value)}</span>`;
}

function renderInjuryBadge(value) {
  return `<span class="injury-badge ${escapeAttr(value)}">${escapeHtml(INJURY_LABELS[value] || value)}</span>`;
}

function renderOption(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();

  const formType = form.dataset.form;
  const data = new FormData(form);

  try {
    if (formType === "gate") {
      const answer = normalizeAnswer(data.get("answer"));
      if (answer === normalizeAnswer(APP_CONFIG.gateAnswer)) {
        localStorage.setItem(GATE_KEY, "ok");
        state.gatePassed = true;
        state.gateError = "";
      } else {
        state.gateError = "That is not the game night.";
      }
      render();
      return;
    }

    if (formType === "add-member") {
      const memberId = await state.store.addMember(String(data.get("name") || ""));
      await refreshData();
      location.hash = `#/member/${memberId}`;
      return;
    }

    if (formType === "pin") {
      const memberId = form.dataset.memberId;
      const pin = String(data.get("pin") || "0000");
      await unlockMember(memberId, pin);
      return;
    }

    if (formType === "member") {
      const memberId = form.dataset.memberId;
      const pin = state.verifiedMembers[memberId];
      await state.store.saveMember(memberId, pin, {
        name: String(data.get("name") || ""),
        activityStateOverride: nullableString(data.get("activityStateOverride")),
        expectedReturnDate: nullableString(data.get("expectedReturnDate"))
      });
      await refreshData();
      render();
      return;
    }

    if (formType === "pin-change") {
      const memberId = form.dataset.memberId;
      const pin = state.verifiedMembers[memberId];
      const newPin = String(data.get("newPin") || "");
      if (!/^[0-9]{4}$/.test(newPin)) throw new Error("New PIN must be four digits.");
      await state.store.setMemberPin(memberId, pin, newPin);
      state.verifiedMembers[memberId] = newPin;
      saveVerifiedMembers();
      await refreshData();
      render();
      return;
    }

    if (formType === "injury") {
      await submitInjuryForm(form, data);
      return;
    }
  } catch (error) {
    state.error = readableError(error);
    render();
  }
}

async function submitInjuryForm(form, data) {
  const memberId = form.dataset.memberId;
  const injuryId = form.dataset.injuryId || "";
  const member = enrichedMembers().find((item) => item.id === memberId);
  const existing = injuryId
    ? member?.injuries.find((injury) => injury.id === injuryId)
    : null;
  const draft = getInjuryDraft(member, existing);
  const pin = state.verifiedMembers[memberId] || String(data.get("pin") || "0000");

  if (!draft.selectedZones.length) {
    throw new Error("Choose at least one body part.");
  }

  await unlockMember(memberId, pin, { renderAfter: false });

  const pose = getPoseVariant(poseValueForMember(member));
  const zones = draft.selectedZones
    .map((key) => getZoneForPose(key, pose))
    .filter(Boolean);
  const description = String(data.get("description") || "").trim();
  const notes = String(data.get("notes") || "").trim();
  const injuryTitle = zones.map((zone) => zone.label).join(", ") || description || "Injury";
  const combinedNotes = [description, notes].filter(Boolean).join("\n\n");
  const markers = zones.map((zone) => ({
    bodyZoneKey: zone.key,
    xPosition: zone.x,
    yPosition: zone.y
  }));

  await state.store.saveInjury(memberId, pin, injuryId, {
    injuryStatus: draft.injuryStatus,
    notes: combinedNotes,
    expectedReturnDate: nullableString(data.get("expectedReturnDate")),
    bodyPartKey: zones[0]?.key || "unknown",
    injuryTitle,
    isCurrent: existing ? existing.isCurrent : true,
    startDate: nullableString(data.get("startDate")),
    markers
  });

  delete state.drafts[draft.key];
  await refreshData();
  location.hash = `#/member/${memberId}`;
}

async function unlockMember(memberId, pin, { renderAfter = true } = {}) {
  const normalizedPin = pin || "0000";
  if (!/^[0-9]{4}$/.test(normalizedPin)) {
    throw new Error("PIN must be four digits.");
  }

  const ok = await state.store.verifyMemberPin(memberId, normalizedPin);
  if (!ok) throw new Error("Invalid PIN.");

  state.verifiedMembers[memberId] = normalizedPin;
  saveVerifiedMembers();
  if (renderAfter) render();
}

async function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;

  if (action === "back") {
    event.preventDefault();
    history.length > 1 ? history.back() : (location.hash = "#/");
    return;
  }

  if (action === "toggle-zone") {
    event.preventDefault();
    const zoneKey = target.dataset.zoneKey;
    toggleDraftZone(zoneKey);
    render();
    return;
  }

  if (action === "resolve-injury") {
    event.preventDefault();
    const memberId = target.dataset.memberId;
    const pin = state.verifiedMembers[memberId];
    const injuryId = target.dataset.injuryId;
    try {
      await state.store.resolveInjury(memberId, pin, injuryId);
      await refreshData();
      render();
    } catch (error) {
      state.error = readableError(error);
      render();
    }
  }
}

function handleInput(event) {
  const input = event.target;

  if (input.id === "people-search") {
    state.search = input.value;
    render();
    return;
  }

  if (input.id === "body-search") {
    state.bodySearch = input.value;
    render();
    return;
  }

  const form = input.closest('form[data-form="injury"]');
  if (!form) return;
  const draft = getActiveDraft();
  if (!draft) return;

  if (input.name === "description") draft.description = input.value;
  if (input.name === "notes") draft.notes = input.value;
  if (input.name === "startDate") draft.startDate = input.value;
  if (input.name === "expectedReturnDate") draft.expectedReturnDate = input.value;
  if (input.name === "recoveryAmount") {
    draft.recoveryAmount = input.value;
    draft.expectedReturnDate = calculateReturnDate(draft);
    render();
  }
}

function handleChange(event) {
  const input = event.target;
  const form = input.closest('form[data-form="injury"]');
  if (!form) return;
  const draft = getActiveDraft();
  if (!draft) return;

  if (input.name === "injuryStatus") {
    draft.injuryStatus = input.value;
    render();
  }

  if (input.name === "recoveryUnit") {
    draft.recoveryUnit = input.value;
    draft.expectedReturnDate = calculateReturnDate(draft);
    render();
  }
}

function toggleDraftZone(zoneKey) {
  const draft = getActiveDraft();
  if (!draft || !BODY_ZONE_BY_KEY[zoneKey]) return;
  const current = new Set(draft.selectedZones);
  if (current.has(zoneKey)) {
    current.delete(zoneKey);
  } else if (current.size < 3) {
    current.add(zoneKey);
  }
  draft.selectedZones = [...current];
}

function getActiveDraft() {
  const route = state.route;
  if (route.name !== "addInjury" && route.name !== "editInjury") return null;
  const member = enrichedMembers().find((item) => item.id === route.memberId);
  const existing =
    route.name === "editInjury"
      ? member?.injuries.find((injury) => injury.id === route.injuryId)
      : null;
  return getInjuryDraft(member, existing);
}

function getInjuryDraft(member, injury) {
  const key = `${member?.id || "missing"}:${injury?.id || "new"}`;
  if (!state.drafts[key]) {
    const markers = injury ? getMarkersForInjuries([injury]) : [];
    state.drafts[key] = {
      key,
      selectedZones: markers.map((marker) => marker.bodyZoneKey).slice(0, 3),
      description: "",
      injuryStatus: injury?.injuryStatus || "risky",
      notes: injury?.notes || "",
      startDate: injury?.startDate || todayString(),
      expectedReturnDate: injury?.expectedReturnDate || "",
      recoveryAmount: "",
      recoveryUnit: "weeks"
    };
  }
  return state.drafts[key];
}

function calculateReturnDate(draft) {
  const amount = Number(draft.recoveryAmount);
  if (!draft.startDate || !Number.isFinite(amount) || amount <= 0) {
    return draft.expectedReturnDate || "";
  }
  const date = new Date(`${draft.startDate}T00:00:00`);
  if (draft.recoveryUnit === "days") date.setDate(date.getDate() + amount);
  if (draft.recoveryUnit === "weeks") date.setDate(date.getDate() + amount * 7);
  if (draft.recoveryUnit === "months") date.setMonth(date.getMonth() + amount);
  return toDateInputValue(date);
}

function enrichedMembers() {
  const injuriesByMember = groupBy(state.data.injuries, "memberId");
  return state.data.members.map((member) => {
    const injuries = injuriesByMember[member.id] || [];
    const currentInjuries = injuries.filter((injury) => injury.isCurrent);
    const automaticState = calculateAutomaticState(currentInjuries);
    const effectiveState = member.activityStateOverride || automaticState;
    const poseVariant = getPoseVariant(member.poseVariant || member.id).id;
    return {
      ...member,
      poseVariant,
      injuries: injuries.sort(compareInjuries),
      currentInjuries: currentInjuries.sort(compareInjuries),
      automaticState,
      effectiveState
    };
  });
}

function calculateAutomaticState(injuries) {
  const statuses = new Set(injuries.map((injury) => injury.injuryStatus));
  if (statuses.has("no_climbing")) return "resting";
  if (statuses.has("risky")) return "supposed_to_be_resting";
  return "active";
}

function getMarkersForInjuries(injuries) {
  const ids = new Set(injuries.map((injury) => injury.id));
  return state.data.markers.filter((marker) => ids.has(marker.injuryId));
}

function earliestReturnDate(injuries) {
  return injuries
    .map((injury) => injury.expectedReturnDate)
    .filter(Boolean)
    .sort()[0];
}

function sortBySeverity(a, b) {
  const rank = { resting: 0, supposed_to_be_resting: 1, active: 2 };
  return rank[a.effectiveState] - rank[b.effectiveState] || a.name.localeCompare(b.name);
}

function compareInjuries(a, b) {
  if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
  return String(b.startDate || "").localeCompare(String(a.startDate || ""));
}

function compareTimelineDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) return { name: "people" };
  if (parts[0] === "timeline") return { name: "timeline" };
  if (parts[0] === "member" && parts[1]) return { name: "member", memberId: parts[1] };
  if (parts[0] === "add-member") return { name: "addMember" };
  if (parts[0] === "add-injury" && parts[1]) {
    return { name: "addInjury", memberId: parts[1] };
  }
  if (parts[0] === "edit-injury" && parts[1] && parts[2]) {
    return { name: "editInjury", memberId: parts[1], injuryId: parts[2] };
  }
  return { name: "people" };
}

function createLocalStore() {
  const initial = loadJson(STORAGE_KEY, null) || clone(SEED_DATA);
  let data = initial;
  const listeners = new Set();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    listeners.forEach((listener) => listener());
  }

  function memberPin(memberId) {
    return data.members.find((member) => member.id === memberId)?.pin || "0000";
  }

  function assertPin(memberId, pin) {
    if (memberPin(memberId) !== pin) throw new Error("Invalid PIN.");
  }

  return {
    label: "Local demo",
    async load() {
      return clone(data);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async verifyMemberPin(memberId, pin) {
      return memberPin(memberId) === pin;
    },
    async addMember(name) {
      const member = {
        id: `member_${Date.now().toString(36)}`,
        name: name.trim(),
        poseVariant: randomPoseVariantId(),
        activityStateOverride: null,
        expectedReturnDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pin: "0000"
      };
      if (!member.name) throw new Error("Name is required.");
      data.members.push(member);
      persist();
      return member.id;
    },
    async saveMember(memberId, pin, patch) {
      assertPin(memberId, pin);
      const member = data.members.find((item) => item.id === memberId);
      if (!member) throw new Error("Member not found.");
      member.name = patch.name.trim() || member.name;
      member.activityStateOverride = patch.activityStateOverride || null;
      member.expectedReturnDate = patch.expectedReturnDate || null;
      member.updatedAt = new Date().toISOString();
      persist();
    },
    async setMemberPin(memberId, pin, newPin) {
      assertPin(memberId, pin);
      const member = data.members.find((item) => item.id === memberId);
      member.pin = newPin;
      member.updatedAt = new Date().toISOString();
      persist();
    },
    async saveInjury(memberId, pin, injuryId, payload) {
      assertPin(memberId, pin);
      const now = new Date().toISOString();
      const { markers, ...injuryPayload } = payload;
      let id = injuryId;
      if (id) {
        const injury = data.injuries.find(
          (item) => item.id === id && item.memberId === memberId
        );
        if (!injury) throw new Error("Injury not found.");
        Object.assign(injury, injuryPayload, { updatedAt: now });
        data.markers = data.markers.filter((marker) => marker.injuryId !== id);
      } else {
        id = `injury_${Date.now().toString(36)}`;
        data.injuries.push({
          id,
          memberId,
          ...injuryPayload,
          createdAt: now,
          updatedAt: now
        });
      }
      markers.forEach((marker, index) => {
        data.markers.push({
          id: `marker_${Date.now().toString(36)}_${index}`,
          injuryId: id,
          ...marker
        });
      });
      persist();
      return id;
    },
    async resolveInjury(memberId, pin, injuryId) {
      assertPin(memberId, pin);
      const injury = data.injuries.find(
        (item) => item.id === injuryId && item.memberId === memberId
      );
      if (!injury) throw new Error("Injury not found.");
      injury.isCurrent = false;
      injury.updatedAt = new Date().toISOString();
      persist();
    }
  };
}

async function createSupabaseStore(config) {
  const { createClient } = await import(config.supabaseModuleUrl);
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

  async function load() {
    const [membersResult, injuriesResult, markersResult] = await Promise.all([
      supabase.from("members").select("*").order("name"),
      supabase.from("injuries").select("*").order("start_date", { ascending: false }),
      supabase.from("injury_markers").select("*")
    ]);

    [membersResult, injuriesResult, markersResult].forEach((result) => {
      if (result.error) throw result.error;
    });

    return {
      members: membersResult.data.map(fromDbMember),
      injuries: injuriesResult.data.map(fromDbInjury),
      markers: markersResult.data.map(fromDbMarker)
    };
  }

  return {
    label: "Supabase",
    load,
    subscribe(listener) {
      const channel = supabase
        .channel("injury-tracker-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "members" }, listener)
        .on("postgres_changes", { event: "*", schema: "public", table: "injuries" }, listener)
        .on("postgres_changes", { event: "*", schema: "public", table: "injury_markers" }, listener)
        .subscribe();
      const interval = setInterval(listener, 15000);
      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    },
    async verifyMemberPin(memberId, pin) {
      const result = await supabase.rpc("verify_member_pin", {
        p_member_id: memberId,
        p_pin: pin
      });
      if (result.error) throw result.error;
      return Boolean(result.data);
    },
    async addMember(name) {
      const result = await supabase.rpc("create_member", { p_name: name });
      if (result.error) throw result.error;
      return result.data;
    },
    async saveMember(memberId, pin, patch) {
      const result = await supabase.rpc("save_member", {
        p_member_id: memberId,
        p_pin: pin,
        p_name: patch.name,
        p_activity_state_override: patch.activityStateOverride,
        p_expected_return_date: patch.expectedReturnDate
      });
      if (result.error) throw result.error;
    },
    async setMemberPin(memberId, pin, newPin) {
      const result = await supabase.rpc("set_member_pin", {
        p_member_id: memberId,
        p_pin: pin,
        p_new_pin: newPin
      });
      if (result.error) throw result.error;
    },
    async saveInjury(memberId, pin, injuryId, payload) {
      const result = await supabase.rpc("save_injury", {
        p_member_id: memberId,
        p_pin: pin,
        p_injury_id: injuryId || "",
        p_injury_status: payload.injuryStatus,
        p_notes: payload.notes,
        p_expected_return_date: payload.expectedReturnDate,
        p_body_part_key: payload.bodyPartKey,
        p_injury_title: payload.injuryTitle,
        p_is_current: payload.isCurrent,
        p_start_date: payload.startDate,
        p_markers: payload.markers
      });
      if (result.error) throw result.error;
      return result.data;
    },
    async resolveInjury(memberId, pin, injuryId) {
      const result = await supabase.rpc("resolve_injury", {
        p_member_id: memberId,
        p_pin: pin,
        p_injury_id: injuryId
      });
      if (result.error) throw result.error;
    }
  };
}

function fromDbMember(row) {
  return {
    id: row.id,
    name: row.name,
    poseVariant: row.pose_variant,
    activityStateOverride: row.activity_state_override,
    expectedReturnDate: row.expected_return_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fromDbInjury(row) {
  return {
    id: row.id,
    memberId: row.member_id,
    injuryStatus: row.injury_status,
    notes: row.notes || "",
    expectedReturnDate: row.expected_return_date,
    bodyPartKey: row.body_part_key,
    injuryTitle: row.injury_title,
    isCurrent: row.is_current,
    startDate: row.start_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fromDbMarker(row) {
  return {
    id: row.id,
    injuryId: row.injury_id,
    bodyZoneKey: row.body_zone_key,
    xPosition: Number(row.x_position),
    yPosition: Number(row.y_position)
  };
}

function saveVerifiedMembers() {
  sessionStorage.setItem(VERIFIED_KEY, JSON.stringify(state.verifiedMembers));
}

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

function nullableString(value) {
  const string = String(value || "").trim();
  return string || null;
}

function todayString() {
  return toDateInputValue(new Date());
}

function toDateInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(value) {
  if (!value) return "No date set";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function isPast(value) {
  if (!value) return false;
  return value < todayString();
}

function titleize(value) {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function bodyZoneLabel(value) {
  return BODY_ZONE_BY_KEY[value]?.label || titleize(value);
}

function poseValueForMember(member) {
  return member?.poseVariant || member?.id || "";
}

function getPoseVariant(value) {
  const variant = POSE_VARIANTS.find((pose) => pose.id === value);
  if (variant) return variant;

  const index = hashString(String(value || "default")) % POSE_VARIANTS.length;
  return POSE_VARIANTS[index];
}

function randomPoseVariantId() {
  return POSE_VARIANTS[Math.floor(Math.random() * POSE_VARIANTS.length)].id;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getZoneForPose(key, pose) {
  const zone = BODY_ZONE_BY_KEY[key];
  if (!zone) return null;

  const points = getPosePoints(pose);
  const shoulderCenter = midpoint(points.leftShoulder, points.rightShoulder);
  const hipCenter = midpoint(points.leftHip, points.rightHip);
  const leftLowerLeg = midpoint(points.leftKnee, points.leftAnkle);
  const rightLowerLeg = midpoint(points.rightKnee, points.rightAnkle);
  const leftCalfNormal = scalePoint(perpendicularUnit(points.leftKnee, points.leftAnkle), 2.2);
  const rightCalfNormal = scalePoint(perpendicularUnit(points.rightKnee, points.rightAnkle), -2.2);
  const zonePoints = {
    head: points.head,
    neck: points.neck,
    chest: interpolatePoint(shoulderCenter, hipCenter, 0.3),
    abdomen: interpolatePoint(shoulderCenter, hipCenter, 0.66),
    hip_left: points.leftHip,
    hip_right: points.rightHip,
    left_shoulder: points.leftShoulder,
    left_upper_arm: midpoint(points.leftShoulder, points.leftElbow),
    left_elbow: points.leftElbow,
    left_forearm: midpoint(points.leftElbow, points.leftWrist),
    left_wrist: points.leftWrist,
    left_hand: points.leftHand,
    left_thumb: fingerZonePoint(points.leftWrist, points.leftHand, 2, 3),
    left_ring: fingerZonePoint(points.leftWrist, points.leftHand, 3.4, -1.8),
    left_middle: fingerZonePoint(points.leftWrist, points.leftHand, 4.2, 0),
    right_shoulder: points.rightShoulder,
    right_upper_arm: midpoint(points.rightShoulder, points.rightElbow),
    right_elbow: points.rightElbow,
    right_forearm: midpoint(points.rightElbow, points.rightWrist),
    right_wrist: points.rightWrist,
    right_hand: points.rightHand,
    right_thumb: fingerZonePoint(points.rightWrist, points.rightHand, 2, -3),
    right_ring: fingerZonePoint(points.rightWrist, points.rightHand, 3.4, 1.5),
    right_middle: fingerZonePoint(points.rightWrist, points.rightHand, 4.2, 0),
    right_pinky: fingerZonePoint(points.rightWrist, points.rightHand, 3.1, 3),
    left_thigh: midpoint(points.leftHip, points.leftKnee),
    left_knee: points.leftKnee,
    left_shin: leftLowerLeg,
    left_calf: addPoints(leftLowerLeg, leftCalfNormal),
    left_ankle: points.leftAnkle,
    left_foot: points.leftFoot,
    right_thigh: midpoint(points.rightHip, points.rightKnee),
    right_knee: points.rightKnee,
    right_shin: rightLowerLeg,
    right_calf: addPoints(rightLowerLeg, rightCalfNormal),
    right_ankle: points.rightAnkle,
    right_foot: points.rightFoot
  };
  const point = zonePoints[key] || zone;

  return {
    ...zone,
    x: point.x,
    y: point.y
  };
}

function getPosePoints(pose) {
  return Object.fromEntries(
    Object.entries(pose.points || {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? { x: value[0], y: value[1] } : value
    ])
  );
}

function fingerZonePoint(wrist, hand, forward, lateral) {
  const direction = unitVector(wrist, hand);
  const normal = { x: -direction.y, y: direction.x };
  return addPoints(hand, addPoints(scalePoint(direction, forward), scalePoint(normal, lateral)));
}

function midpoint(start, end) {
  return interpolatePoint(start, end, 0.5);
}

function interpolatePoint(start, end, amount) {
  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount
  };
}

function addPoints(first, second) {
  return { x: first.x + second.x, y: first.y + second.y };
}

function scalePoint(point, amount) {
  return { x: point.x * amount, y: point.y * amount };
}

function unitVector(start, end) {
  const x = end.x - start.x;
  const y = end.y - start.y;
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function perpendicularUnit(start, end) {
  const direction = unitVector(start, end);
  return { x: -direction.y, y: direction.x };
}

function angleBetween(start, end) {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
}

function svgPoint(point) {
  return `${formatNumber(point.x)} ${formatNumber(point.y)}`;
}

function linePath(start, end) {
  return `M ${svgPoint(start)} L ${svgPoint(end)}`;
}

function jointPath(start, joint, end) {
  const approach = interpolatePoint(start, joint, 0.78);
  const departure = interpolatePoint(joint, end, 0.22);
  return `M ${svgPoint(start)} L ${svgPoint(approach)} Q ${svgPoint(joint)} ${svgPoint(departure)} L ${svgPoint(end)}`;
}

function formatNumber(value) {
  return Number(value.toFixed(4));
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJson(key, fallback) {
  try {
    const raw = key.startsWith("injury-tracker")
      ? localStorage.getItem(key) || sessionStorage.getItem(key)
      : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readableError(error) {
  return error?.message || String(error || "Something went wrong.");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

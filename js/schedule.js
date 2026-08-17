/* Renders schedule.html from the live Google Sheet (see js/sheet-data.js). */

const CATEGORIES = [
  { key: "hh", label: "Đôi Hỗn Hợp", sheetName: "Đôi Hỗn Hợp", standingsKey: "Đôi Hỗn Hợp" },
  { key: "na", label: "Đôi Nam Open", sheetName: "Đôi Nam Open", standingsKey: "Đôi Nam" },
];

const STAGE_ORDER = ["Vòng loại", "Bán kết", "Tranh hạng Ba", "Chung kết"];

function statusAttr(status) {
  if (status === "Hoàn thành") return "completed";
  if (status === "Chưa thi đấu") return "scheduled";
  return "pending";
}

function teamBadge(code) {
  return code || "?";
}

function teamNameLine(code, nameMap) {
  return code ? (nameMap[code] || "") : "Chờ xác định";
}

const STATUS_BADGE_LABEL = {
  completed: "Hoàn thành",
  scheduled: "Chưa thi đấu",
  pending: "Chờ xác định",
};

function matchRowHtml(code, nameMap, score, isWinner) {
  const scoreHtml = score !== null
    ? `<span class="score-box">${score}</span>`
    : `<span class="score-box score-box--dash">–</span>`;
  return `
    <div class="match-row${isWinner ? " match-row--winner" : ""}">
      <span class="match-row__badge">${teamBadge(code)}</span>
      <div class="match-row__name">
        <div class="match-row__code">${code || "Chờ xác định"}</div>
        <div class="match-row__players">${teamNameLine(code, nameMap)}</div>
      </div>
      <div class="match-row__score">${scoreHtml}</div>
    </div>`;
}

function matchCardHtml(m, nameMap) {
  const status = statusAttr(m.status);
  const hasScore = m.status === "Hoàn thành";
  const scoreA = hasScore ? Number(m.scoreA) : null;
  const scoreB = hasScore ? Number(m.scoreB) : null;
  const aWins = hasScore && scoreA > scoreB;
  const bWins = hasScore && scoreB > scoreA;
  const timeLabel = m.start ? `${m.start}${m.court ? ` · Sân ${m.court}` : ""}` : "";

  const searchText = [m.teamA, teamNameLine(m.teamA, nameMap), m.teamB, teamNameLine(m.teamB, nameMap)]
    .join(" ").toLowerCase();

  return `
    <div class="match-card" data-status="${status}" data-search="${searchText.replace(/"/g, "&quot;")}">
      <div class="match-card__head">
        <span class="match-card__badge match-card__badge--${status}">${STATUS_BADGE_LABEL[status]}</span>
      </div>
      ${matchRowHtml(m.teamA, nameMap, hasScore ? m.scoreA : null, aWins)}
      ${matchRowHtml(m.teamB, nameMap, hasScore ? m.scoreB : null, bWins)}
      ${timeLabel ? `<div class="match-card__foot">🕒 ${timeLabel}</div>` : ""}
    </div>`;
}

function stageLabel(stage, round) {
  if (stage === "Vòng loại") return `Vòng ${round}`;
  return stage;
}

function renderCategoryPanel(cat, matches, nameMap) {
  const catMatches = matches.filter((m) => m.category === cat.sheetName);

  // group by stage, preserving STAGE_ORDER, and within "Vòng loại" by round number
  const groups = [];
  for (const stage of STAGE_ORDER) {
    const inStage = catMatches.filter((m) => m.stage === stage);
    if (!inStage.length) continue;
    if (stage === "Vòng loại") {
      const rounds = [...new Set(inStage.map((m) => m.round))].sort((a, b) => Number(a) - Number(b));
      for (const round of rounds) {
        groups.push({ label: stageLabel(stage, round), items: inStage.filter((m) => m.round === round) });
      }
    } else {
      groups.push({ label: stage, items: inStage });
    }
  }

  const groupsHtml = groups.map((g) => `
    <div class="round-group">
      <div class="round-group__label">${g.label}</div>
      <div class="match-list">
        ${g.items.map((m) => matchCardHtml(m, nameMap)).join("")}
      </div>
    </div>`).join("");

  return `
    <section class="category-panel" data-cat="${cat.key}">
      <div class="stage">
        <div class="stage__head">
          <h2 class="stage__title">Lịch thi đấu — ${cat.label}</h2>
        </div>
        ${groupsHtml}
        <div class="match-empty" hidden>
          <div class="match-empty__title">Không tìm thấy trận đấu hoặc vận động viên phù hợp.</div>
          <div class="match-empty__sub">Kiểm tra lại chính tả, hoặc liên hệ BTC để được hỗ trợ.</div>
        </div>
      </div>
    </section>`;
}

function applySearch(q) {
  document.querySelectorAll(".category-panel").forEach((panel) => {
    let panelVisible = 0;
    panel.querySelectorAll(".round-group").forEach((group) => {
      let anyVisible = false;
      group.querySelectorAll(".match-card").forEach((card) => {
        const match = !q || card.dataset.search.includes(q);
        card.hidden = !match;
        if (match) anyVisible = true;
      });
      group.hidden = !anyVisible;
      if (anyVisible) panelVisible++;
    });
    const empty = panel.querySelector(".match-empty");
    if (empty) empty.hidden = !q || panelVisible > 0;
  });
}

function initSearch() {
  const input = document.getElementById("schedule-search-input");
  if (!input) return;
  input.addEventListener("input", () => applySearch(input.value.trim().toLowerCase()));
}

function initTabs() {
  const btns = document.querySelectorAll(".tabbar__btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      const cat = btn.dataset.cat;
      document.querySelectorAll(".category-panel").forEach((p) => {
        p.setAttribute("data-active", String(p.dataset.cat === cat));
      });
    });
  });
}

async function main() {
  const root = document.getElementById("schedule-root");
  try {
    const [matches, standings] = await Promise.all([loadMatches(), loadStandings()]);
    const nameMap = buildTeamNameMap(standings);
    root.innerHTML = CATEGORIES
      .map((cat) => renderCategoryPanel(cat, matches, nameMap))
      .join("");
    document.querySelector('.category-panel[data-cat="hh"]').setAttribute("data-active", "true");
    initTabs();
    initSearch();
    document.getElementById("schedule-status").textContent =
      `Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN")} · dữ liệu trực tiếp từ Google Sheet`;
  } catch (err) {
    root.innerHTML = `<div class="section"><p class="section-lede">Không tải được dữ liệu từ Google Sheet. Vui lòng tải lại trang.</p></div>`;
    document.getElementById("schedule-status").textContent = "Lỗi tải dữ liệu.";
    console.error(err);
  }
}

main();

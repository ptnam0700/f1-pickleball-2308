/* Renders schedule.html from the live Google Sheet (see js/sheet-data.js). */

const CATEGORIES = [
  { key: "hh", label: "Đôi Hỗn Hợp", sheetName: "Đôi Hỗn Hợp", standingsKey: "Đôi Hỗn Hợp" },
  { key: "na", label: "Đôi Nam Open", sheetName: "Đôi Nam Open", standingsKey: "Đôi Nam" },
];

const STAGE_ORDER = ["Chung kết", "Bán kết", "Vòng loại"];

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

function renderCategoryPanel(cat, matches, standingsRows, nameMap) {
  const catMatches = matches.filter((m) => m.category === cat.sheetName);

  // group by stage, preserving STAGE_ORDER (final first, then semis, then group stage
  // rounds in order); "Tranh hạng Ba" is intentionally dropped — no 3rd-place match.
  // Each stage gets a big heading; "Vòng loại" additionally nests smaller per-round labels.
  const stageBlocksHtml = STAGE_ORDER.map((stage) => {
    const inStage = catMatches.filter((m) => m.stage === stage);
    if (!inStage.length) return "";

    let body;
    if (stage === "Vòng loại") {
      const rounds = [...new Set(inStage.map((m) => m.round))].sort((a, b) => Number(a) - Number(b));
      body = rounds.map((round) => `
        <div class="round-group">
          <div class="round-group__label">${stageLabel(stage, round)}</div>
          <div class="match-list">
            ${inStage.filter((m) => m.round === round).map((m) => matchCardHtml(m, nameMap)).join("")}
          </div>
        </div>`).join("");
    } else {
      body = `
        <div class="round-group">
          <div class="match-list">
            ${inStage.map((m) => matchCardHtml(m, nameMap)).join("")}
          </div>
        </div>`;
    }

    return `
      <div class="stage-block">
        <div class="stage-block__title">${stage}</div>
        ${body}
      </div>`;
  }).join("");

  const rankRows = standingsRows.map((r) => {
    const top4 = Number(r.rank) <= 4;
    return `
      <tr data-top4="${top4}">
        <td><span class="rank-badge">${r.rank}</span></td>
        <td>${r.code}</td>
        <td>${r.players}</td>
        <td>${r.played}</td>
        <td>${r.wins}</td>
        <td>${r.losses}</td>
        <td>${r.points}</td>
        <td>${r.diff}</td>
        <td>${r.note ? `<span class="tie-flag">⚠ ${r.note}</span>` : ""}</td>
      </tr>`;
  }).join("");

  return `
    <section class="category-panel" data-cat="${cat.key}">
      <div class="stage">
        <div class="stage__head">
          <h2 class="stage__title">Lịch thi đấu — ${cat.label}</h2>
        </div>
        ${stageBlocksHtml}
        <div class="match-empty" hidden>
          <div class="match-empty__title">Không tìm thấy trận đấu hoặc vận động viên phù hợp.</div>
          <div class="match-empty__sub">Kiểm tra lại chính tả, hoặc liên hệ BTC để được hỗ trợ.</div>
        </div>
      </div>
      <div class="stage">
        <div class="stage__head"><h2 class="stage__title">Bảng xếp hạng vòng loại</h2></div>
        <div class="table-scroll">
          <table class="ranking-table">
            <thead><tr>
              <th>Hạng</th><th>Mã</th><th>VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th>
              <th>Điểm</th><th>Hiệu số</th><th>Ghi chú</th>
            </tr></thead>
            <tbody>${rankRows}</tbody>
          </table>
        </div>
        <p class="rr-hint">Top 4 (đánh dấu lime) vào Bán kết. ⚠ = cần bốc thăm phân định nếu vẫn bằng nhau sau đối đầu.</p>
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
      .map((cat) => renderCategoryPanel(cat, matches, standings[cat.standingsKey] || [], nameMap))
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

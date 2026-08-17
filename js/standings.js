/* Renders standings.html from the live Google Sheet (see js/sheet-data.js). */

const CATEGORIES = [
  { key: "hh", label: "Đôi Hỗn Hợp", standingsKey: "Đôi Hỗn Hợp" },
  { key: "na", label: "Đôi Nam Open", standingsKey: "Đôi Nam" },
];

function rankingTableHtml(cat, rows) {
  const rankRows = rows.map((r) => {
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
        <td>${r.headToHead}${r.note ? `<span class="tie-flag">⚠ tie</span>` : ""}</td>
      </tr>`;
  }).join("");

  return `
    <section class="category-panel" data-cat="${cat.key}">
      <div class="stage">
        <div class="stage__head"><h2 class="stage__title">Bảng xếp hạng — ${cat.label}</h2></div>
        <div class="table-scroll">
          <table class="ranking-table">
            <thead><tr>
              <th>Hạng</th><th>Mã</th><th>VĐV</th><th>Trận</th><th>Thắng</th><th>Thua</th>
              <th>Điểm</th><th>Hiệu số</th><th>Đối đầu</th>
            </tr></thead>
            <tbody>${rankRows}</tbody>
          </table>
        </div>
        <p class="rr-hint">Top 4 (đánh dấu lime) vào Bán kết. ⚠ = cần bốc thăm phân định nếu vẫn bằng nhau sau đối đầu.</p>
      </div>
    </section>`;
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
  const root = document.getElementById("standings-root");
  try {
    const standings = await loadStandings();
    root.innerHTML = CATEGORIES
      .map((cat) => rankingTableHtml(cat, standings[cat.standingsKey] || []))
      .join("");
    document.querySelector('.category-panel[data-cat="hh"]').setAttribute("data-active", "true");
    initTabs();
    document.getElementById("standings-status").textContent =
      `Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN")} · dữ liệu trực tiếp từ Google Sheet`;
  } catch (err) {
    root.innerHTML = `<div class="section"><p class="section-lede">Không tải được dữ liệu từ Google Sheet. Vui lòng tải lại trang.</p></div>`;
    document.getElementById("standings-status").textContent = "Lỗi tải dữ liệu.";
    console.error(err);
  }
}

main();

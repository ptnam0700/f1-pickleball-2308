/* Shows a champions banner on the homepage once both/either final is completed. */

const FINALS = [
  { matchId: "MIXED-F", label: "Đôi Hỗn Hợp" },
  { matchId: "MEN-F", label: "Đôi Nam Open" },
];

async function main() {
  const root = document.getElementById("champion-banner-root");
  if (!root) return;
  try {
    const [matches, standings] = await Promise.all([loadMatches(), loadStandings()]);
    const nameMap = buildTeamNameMap(standings);

    const champions = [];
    for (const f of FINALS) {
      const m = matches.find((x) => x.matchId === f.matchId);
      if (!m || m.status !== "Hoàn thành") continue;
      const scoreA = Number(m.scoreA);
      const scoreB = Number(m.scoreB);
      const code = scoreA > scoreB ? m.teamA : m.teamB;
      champions.push({ label: f.label, code, players: nameMap[code] || "" });
    }

    if (!champions.length) return;

    root.innerHTML = `
      <section class="champion-banner court-texture">
        <div class="champion-banner__inner">
          <div class="champion-banner__title">🏆 Chúc mừng nhà vô địch!</div>
          <div class="champion-banner__list">
            ${champions.map((c) => `
              <div class="champion-banner__item">
                <span class="champion-banner__cat">${c.label}</span>
                <span class="champion-banner__team">${c.code} — ${c.players}</span>
              </div>`).join("")}
          </div>
        </div>
      </section>`;
  } catch (err) {
    console.error(err);
  }
}

main();

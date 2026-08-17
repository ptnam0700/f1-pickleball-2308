/*
  Live data source: the club's Google Sheet, read-only via the gviz CSV endpoint.
  Admin edits scores directly in the Sheet; visitors get the update on next page load.
  No API key / Apps Script needed — the Sheet is shared "Anyone with the link can view".
*/
const SHEET_ID = "19RxCD21GQUcgIFvx61RM5hL0GvIcS9oKEf9H6lnnyNA";
const GID_MATCHES = "2001005";      // tab "Phân bổ sân" — the resolved 58-match table
const GID_STANDINGS = "1628836208"; // tab "Dashboard" — auto-computed rankings

function gvizCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

// Minimal RFC4180 CSV parser: handles quoted fields, embedded commas/newlines, "" escapes.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = "";
    } else if (c === '\r') {
      // skip; \n handles the line break
    } else if (c === '\n') {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchSheetRows(gid) {
  const res = await fetch(gvizCsvUrl(gid), { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status})`);
  const text = await res.text();
  return parseCsv(text);
}

const MATCH_COLS = {
  stt: 0, matchId: 1, category: 2, stage: 3, round: 4, slot: 5,
  start: 6, end: 7, court: 8, teamA: 9, teamB: 10,
  scoreA: 11, scoreB: 12, status: 13, warning: 14,
};

const STANDING_COLS = {
  code: 0, players: 1, played: 2, wins: 3, losses: 4, points: 5,
  pointsFor: 6, pointsAgainst: 7, diff: 8, headToHead: 9, rank: 10, note: 11,
};

async function loadMatches() {
  const rows = await fetchSheetRows(GID_MATCHES);
  const headerIdx = rows.findIndex((r) => r[MATCH_COLS.matchId] === "Match ID");
  if (headerIdx === -1) throw new Error("Match table header not found in Sheet");
  const matches = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const matchId = (r[MATCH_COLS.matchId] || "").trim();
    if (!matchId) continue;
    matches.push({
      matchId,
      category: (r[MATCH_COLS.category] || "").trim(),
      stage: (r[MATCH_COLS.stage] || "").trim(),
      round: (r[MATCH_COLS.round] || "").trim(),
      slot: (r[MATCH_COLS.slot] || "").trim(),
      start: (r[MATCH_COLS.start] || "").trim(),
      end: (r[MATCH_COLS.end] || "").trim(),
      court: (r[MATCH_COLS.court] || "").trim(),
      teamA: (r[MATCH_COLS.teamA] || "").trim(),
      teamB: (r[MATCH_COLS.teamB] || "").trim(),
      scoreA: (r[MATCH_COLS.scoreA] || "").trim(),
      scoreB: (r[MATCH_COLS.scoreB] || "").trim(),
      status: (r[MATCH_COLS.status] || "").trim(),
      warning: (r[MATCH_COLS.warning] || "").trim(),
    });
  }
  return matches;
}

async function loadStandings() {
  const rows = await fetchSheetRows(GID_STANDINGS);
  const sections = { "Đôi Hỗn Hợp": [], "Đôi Nam": [] };
  let current = null;
  for (let i = 0; i < rows.length; i++) {
    const first = (rows[i][0] || "").trim();
    if (first.startsWith("BẢNG XẾP HẠNG")) {
      current = first.includes("HỖN HỢP") ? "Đôi Hỗn Hợp" : "Đôi Nam";
      i++; // skip the "Mã, VĐV, ..." header row right after
      continue;
    }
    if (!current) continue;
    const code = (rows[i][STANDING_COLS.code] || "").trim();
    if (!code || code === "Mã") continue;
    sections[current].push({
      code,
      players: (rows[i][STANDING_COLS.players] || "").trim(),
      played: (rows[i][STANDING_COLS.played] || "").trim(),
      wins: (rows[i][STANDING_COLS.wins] || "").trim(),
      losses: (rows[i][STANDING_COLS.losses] || "").trim(),
      points: (rows[i][STANDING_COLS.points] || "").trim(),
      pointsFor: (rows[i][STANDING_COLS.pointsFor] || "").trim(),
      pointsAgainst: (rows[i][STANDING_COLS.pointsAgainst] || "").trim(),
      diff: (rows[i][STANDING_COLS.diff] || "").trim(),
      headToHead: (rows[i][STANDING_COLS.headToHead] || "").trim(),
      rank: (rows[i][STANDING_COLS.rank] || "").trim(),
      note: (rows[i][STANDING_COLS.note] || "").trim(),
    });
  }
  return sections;
}

// Team code -> "Player1 / Player2", built from the standings sheet (covers every team).
function buildTeamNameMap(standingsSections) {
  const map = {};
  for (const key of Object.keys(standingsSections)) {
    for (const row of standingsSections[key]) {
      map[row.code] = row.players;
    }
  }
  return map;
}

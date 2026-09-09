import { a as shortFor, n as getTeam, o as slugForTsdbTeam, r as leagueFor, s as sportFor } from "./map-DIqTEjwJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/thesportsdb.server-GCRC2n65.js
var BASE = "https://www.thesportsdb.com/api/v1/json/123";
var TTL_MS = 2e4;
var FETCH_MS = 8e3;
var TEAM_IDS = /* @__PURE__ */ new Set(["137847", "144622"]);
var MAX_AGE_MS = 19008e6;
var cache = null;
var inflight = null;
async function tsdb(path, params = {}) {
	const url = new URL(`${BASE}/${path}`);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			"User-Agent": "MelillaDirecto/1.0"
		},
		signal: AbortSignal.timeout(FETCH_MS)
	});
	if (!res.ok) throw new Error(`TheSportsDB ${path} ${res.status}`);
	return await res.json();
}
function num(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}
function kickoffIso(ev) {
	const ts = ev.strTimestamp?.trim();
	if (ts) {
		if (ts.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(ts)) return ts;
		return `${ts}Z`;
	}
	return `${ev.dateEvent ?? "1970-01-01"}T${(ev.strTime || ev.strEventTime || "12:00:00").padEnd(8, ":00").slice(0, 8)}Z`;
}
var LIVE_STATUS = /* @__PURE__ */ new Set([
	"1H",
	"2H",
	"HT",
	"ET",
	"P",
	"PEN",
	"LIVE",
	"Q1",
	"Q2",
	"Q3",
	"Q4",
	"OT",
	"BT",
	"INT"
]);
var DONE_STATUS = /* @__PURE__ */ new Set([
	"FT",
	"AET",
	"AWARDED",
	"WO",
	"ABD"
]);
function statusOf(ev) {
	const s = (ev.strStatus ?? "").toUpperCase();
	if (DONE_STATUS.has(s)) return "finished";
	if (LIVE_STATUS.has(s)) return "live";
	const progress = String(ev.strProgress ?? "").trim();
	if (progress && progress !== "0" && s !== "NS") return "live";
	return "scheduled";
}
function clockOf(sport, ev, status) {
	const s = (ev.strStatus ?? "").toUpperCase();
	const progress = String(ev.strProgress ?? "").trim();
	if (status === "finished") return {
		minute: 90,
		displayClock: "Fin",
		period: "Finalizado"
	};
	if (status === "scheduled") return {
		minute: 0,
		displayClock: "",
		period: "Previsto"
	};
	if (s === "HT" || progress === "HT") return {
		minute: 45,
		displayClock: "DT",
		period: "Descanso"
	};
	if (s === "1H") {
		const minute = num(progress) || 1;
		return {
			minute,
			displayClock: `${minute}'`,
			period: "1ª parte"
		};
	}
	if (s === "2H") {
		const minute = num(progress.replace("90+", "")) || 46;
		return {
			minute,
			displayClock: progress.includes("+") ? `${progress}'` : `${minute}'`,
			period: "2ª parte"
		};
	}
	if (/^Q[1-4]$/i.test(s) || /^Q[1-4]$/i.test(progress)) {
		const q = (progress || s).toUpperCase();
		return {
			minute: num(q.slice(1)) * 10,
			displayClock: q,
			period: q
		};
	}
	if (progress) return {
		minute: num(progress),
		displayClock: /[a-z]/i.test(progress) ? progress : `${progress}'`,
		period: sport === "baloncesto" ? progress : `${progress}'`
	};
	return {
		minute: 1,
		displayClock: "En juego",
		period: "En juego"
	};
}
function mapEvent(ev) {
	const externalId = ev.idEvent;
	if (!externalId) return null;
	const homeName = ev.strHomeTeam?.trim();
	const awayName = ev.strAwayTeam?.trim();
	if (!homeName || !awayName) return null;
	const homeId = slugForTsdbTeam(ev.idHomeTeam, homeName);
	const awayId = slugForTsdbTeam(ev.idAwayTeam, awayName);
	const sport = sportFor(ev.strSport);
	const league = leagueFor(ev.strLeague);
	const status = statusOf(ev);
	const kickoff = kickoffIso(ev);
	const age = Date.now() - Date.parse(kickoff);
	if (Number.isFinite(age) && age > MAX_AGE_MS && status === "finished") return null;
	const { minute, displayClock, period } = clockOf(sport, ev, status);
	const round = num(ev.intRound);
	const home = homeId ? getTeam(homeId) : void 0;
	const away = awayId ? getTeam(awayId) : void 0;
	return {
		externalId,
		sport,
		leagueId: league.id,
		leagueName: ev.strLeague || league.id,
		isCup: Boolean(league.cup),
		venue: ev.strVenue?.trim() || home?.venue || "",
		jornada: league.cup ? 0 : round,
		homeId,
		homeName: home?.name ?? homeName,
		homeShort: home?.short ?? shortFor(homeName, homeId),
		homeBadge: ev.strHomeTeamBadge || void 0,
		awayId,
		awayName: away?.name ?? awayName,
		awayShort: away?.short ?? shortFor(awayName, awayId),
		awayBadge: ev.strAwayTeamBadge || void 0,
		kickoff,
		status,
		minute,
		homeScore: num(ev.intHomeScore),
		awayScore: num(ev.intAwayScore),
		displayClock,
		period,
		events: [],
		duration: sport === "baloncesto" ? 48 : 95
	};
}
function isTracked(ev) {
	if (ev.idHomeTeam && TEAM_IDS.has(ev.idHomeTeam)) return true;
	if (ev.idAwayTeam && TEAM_IDS.has(ev.idAwayTeam)) return true;
	return /melilla/i.test(`${ev.strHomeTeam ?? ""} ${ev.strAwayTeam ?? ""}`);
}
function formFrom(raw) {
	if (!raw) return [];
	return [...raw.toUpperCase()].filter((c) => c === "W" || c === "D" || c === "L").slice(-5);
}
function mapTable(rows) {
	return rows.map((row, i) => {
		const name = row.strTeam?.trim() || "—";
		const slug = slugForTsdbTeam(row.idTeam, name);
		const team = slug ? getTeam(slug) : void 0;
		return {
			pos: num(row.intRank) || i + 1,
			teamId: slug,
			name: team?.name ?? name,
			short: team?.short ?? shortFor(name, slug),
			pj: num(row.intPlayed),
			g: num(row.intWin),
			e: num(row.intDraw),
			p: num(row.intLoss),
			gf: num(row.intGoalsFor),
			gc: num(row.intGoalsAgainst),
			pts: num(row.intPoints),
			form: formFrom(row.strForm)
		};
	}).sort((a, b) => a.pos - b.pos);
}
async function pullSnapshot() {
	const settled = await Promise.allSettled([
		tsdb("eventslast.php", { id: "137847" }),
		tsdb("eventsnext.php", { id: "137847" }),
		tsdb("eventslast.php", { id: "144622" }),
		tsdb("eventsnext.php", { id: "144622" }),
		tsdb("livescore.php", { s: "Soccer" }),
		tsdb("livescore.php", { s: "Basketball" }),
		tsdb("lookuptable.php", {
			l: "5546",
			s: "2026-2027"
		})
	]);
	const take = (i) => settled[i]?.status === "fulfilled" ? settled[i].value : void 0;
	const raw = [
		...take(0)?.results ?? [],
		...take(1)?.events ?? [],
		...take(2)?.results ?? [],
		...take(3)?.events ?? [],
		...(take(4)?.livescore ?? []).filter(isTracked),
		...(take(5)?.livescore ?? []).filter(isTracked)
	];
	const byId = /* @__PURE__ */ new Map();
	for (const ev of cache?.data.events ?? []) byId.set(ev.externalId, ev);
	for (const ev of raw) {
		if (!isTracked(ev) && ev.idHomeTeam && ev.idAwayTeam) continue;
		const mapped = mapEvent(ev);
		if (!mapped) continue;
		const prev = byId.get(mapped.externalId);
		if (!prev || mapped.status === "live" || mapped.status === "finished" && prev.status !== "live") byId.set(mapped.externalId, mapped);
	}
	const ok = settled.some((s) => s.status === "fulfilled");
	const firstErr = settled.find((s) => s.status === "rejected");
	const tableRows = take(6)?.table ?? [];
	return {
		fetchedAt: Date.now(),
		ok,
		error: ok ? void 0 : String(firstErr?.reason ?? "API no disponible"),
		events: [...byId.values()],
		tables: tableRows.length ? { "tercera-g9": mapTable(tableRows) } : {}
	};
}
async function fetchLiveSnapshot() {
	if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
	if (inflight) return inflight;
	inflight = pullSnapshot().then((data) => {
		cache = {
			at: Date.now(),
			data
		};
		return data;
	}).catch((err) => {
		return {
			fetchedAt: Date.now(),
			ok: false,
			error: err instanceof Error ? err.message : "API no disponible",
			events: cache?.data.events ?? [],
			tables: cache?.data.tables ?? {}
		};
	}).finally(() => {
		inflight = null;
	});
	return inflight;
}
//#endregion
export { fetchLiveSnapshot };

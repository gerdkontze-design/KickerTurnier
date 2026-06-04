import React, { useState } from 'react'
import GameRules from './GameRules'

function parseNames(text) {
  return text
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function Setup({ onStart }) {
  const [tables, setTables] = useState(2)
  const [names, setNames] = useState('')
  const [gameMinutes, setGameMinutes] = useState(7)
  const [totalMinutes, setTotalMinutes] = useState(180)
  const [schedulingMode, setSchedulingMode] = useState('time')
  const [rules, setRules] = useState({
    winsAt: 6,
    maxDiff: 4,
    allowDraws: true,
    pointsWinClear: 4,
    pointsWinMid: 3,
    pointsWinClose: 2,
    pointsLoseClose: 1,
    pointsDraw: 1
  })

  // very small SA-based optimizer used only for moderate sizes
  function generateOptimized(players, tables, rounds) {
    const teamKey = (a, b) => [a, b].slice().sort().join(' & ')
    function init() {
      const out = []
      for (let r = 0; r < rounds; r++) {
        const pool = [...players].sort(() => Math.random() - 0.5)
        const teams = []
        while (pool.length >= 2) teams.push([pool.shift(), pool.shift()])
        for (let t = 0; t < Math.min(Math.floor(teams.length / 2), tables); t++) {
          const a = teams[t * 2]
          const b = teams[t * 2 + 1] || ['BYE']
          out.push({ id: `r${r}-t${t}`, round: r + 1, table: t + 1, teamA: a, teamB: b })
        }
      }
      return out
    }

    function score(matches) {
      const play = {}
      const teams = {}
      const encounters = {}
      const sides = {}
      for (const p of players) { play[p] = 0; sides[p] = 0 }
      let pen = 0
      for (const m of matches) {
        if (!m.teamB || m.teamB[0] === 'BYE') continue
        const a = m.teamA, b = m.teamB
        play[a[0]]++; play[a[1]]++; play[b[0]]++; play[b[1]]++
        const ak = teamKey(a[0], a[1]); const bk = teamKey(b[0], b[1])
        teams[ak] = (teams[ak] || 0) + 1; teams[bk] = (teams[bk] || 0) + 1
        const enc = [ak, bk].slice().sort().join(' | ')
        encounters[enc] = (encounters[enc] || 0) + 1
        sides[a[0]]++; sides[a[1]]++
      }
      for (const k in teams) if (teams[k] > 1) pen += (teams[k] - 1) * 50
      for (const k in encounters) if (encounters[k] > 1) pen += (encounters[k] - 1) * 80
      const vals = Object.values(play); const mean = vals.reduce((s, v) => s + v, 0) / Math.max(1, vals.length)
      const varr = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, vals.length)
      pen += varr * 10
      const sideVals = Object.values(sides)
      if (sideVals.length) pen += (Math.max(...sideVals) - Math.min(...sideVals)) * 5
      return pen
    }

    let current = init()
    let best = current.slice()
    let bestScore = score(best)
    let T = 1.0
    const TMIN = 1e-3; const ALPHA = 0.995
    const ITER = Math.max(200, Math.min(2000, players.length * 150))
    for (let it = 0; it < ITER; it++) {
      if (current.length < 2) break
      const i = Math.floor(Math.random() * current.length)
      const j = Math.floor(Math.random() * current.length)
      if (i === j) continue
      const cand = current.map((m) => JSON.parse(JSON.stringify(m)))
      if (!cand[i].teamB || !cand[j].teamB) continue
      const si = Math.random() < 0.5 ? 0 : 1; const sj = Math.random() < 0.5 ? 0 : 1
      const tmp = cand[i].teamA[si]; cand[i].teamA[si] = cand[j].teamA[sj]; cand[j].teamA[sj] = tmp
      const sc = score(cand)
      const delta = sc - bestScore
      if (sc < bestScore || Math.exp(-delta / T) > Math.random()) { current = cand; if (sc < bestScore) { best = cand.slice(); bestScore = sc } }
      T = Math.max(TMIN, T * ALPHA)
    }
    for (let k = 0; k < best.length; k++) { best[k].id = `opt-${k}`; best[k].table = (k % tables) + 1 }
    return best
  }

  function generateRoundRobin(players, tables, gameMinutes, totalMinutes) {
    const rounds = Math.max(1, Math.floor(totalMinutes / Math.max(1, gameMinutes)))
    const teams = []
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) teams.push([players[i], players[j]])
    const all = []
    for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) {
      const a = teams[i], b = teams[j]
      if (a.includes(b[0]) || a.includes(b[1])) continue
      all.push({ teamA: a.slice(), teamB: b.slice() })
    }
    const scheduled = []
    if (!all.length) return scheduled
    let remaining = all.slice().sort(() => Math.random() - 0.5)
    const playerLast = {}; const playerPlays = {}; const sideCounts = {}
    players.forEach((p) => { playerLast[p] = -1000; playerPlays[p] = 0; sideCounts[p] = 0 })
    const roundsNeeded = Math.max(1, Math.ceil(remaining.length / tables))
    for (let r = 0; r < roundsNeeded && remaining.length > 0; r++) {
      const used = new Set(); const pick = []
      remaining.sort((m1, m2) => {
        const s1 = [m1.teamA[0], m1.teamA[1], m1.teamB[0], m1.teamB[1]].reduce((s, p) => s + playerPlays[p], 0)
        const s2 = [m2.teamA[0], m2.teamA[1], m2.teamB[0], m2.teamB[1]].reduce((s, p) => s + playerPlays[p], 0)
        return s1 - s2
      })
      for (let i = 0; i < remaining.length && pick.length < tables; i++) {
        const m = remaining[i]; const a = m.teamA; const b = m.teamB
        if (used.has(a[0]) || used.has(a[1]) || used.has(b[0]) || used.has(b[1])) continue
        if (r > 0 && ([a[0], a[1], b[0], b[1]].some((p) => playerLast[p] === r - 1))) continue
        pick.push(m); used.add(a[0]); used.add(a[1]); used.add(b[0]); used.add(b[1])
      }
      for (let t = 0; t < pick.length; t++) {
        const m = pick[t]; let left = m.teamA; let right = m.teamB
        const as = sideCounts[left[0]] + sideCounts[left[1]]; const bs = sideCounts[right[0]] + sideCounts[right[1]]
        if (as - bs > 0) { left = m.teamB; right = m.teamA }
        scheduled.push({ id: `rr${r}-t${t}`, round: r + 1, table: t + 1, teamA: left, teamB: right, scoreA: 0, scoreB: 0, played: false })
        playerPlays[left[0]]++; playerPlays[left[1]]++; playerPlays[right[0]]++; playerPlays[right[1]]++
        playerLast[left[0]] = r; playerLast[left[1]] = r; playerLast[right[0]] = r; playerLast[right[1]] = r
        sideCounts[left[0]] = (sideCounts[left[0]] || 0) + 1; sideCounts[left[1]] = (sideCounts[left[1]] || 0) + 1
      }
      const pickedSet = new Set(pick.map((m) => m.teamA.join('|') + '::' + m.teamB.join('|')))
      remaining = remaining.filter((m) => !pickedSet.has(m.teamA.join('|') + '::' + m.teamB.join('|')))
    }
    for (const m of remaining) scheduled.push({ id: `rr-ext`, round: scheduled.length ? scheduled[scheduled.length - 1].round + 1 : 1, table: (scheduled.length % tables) + 1, teamA: m.teamA, teamB: m.teamB, scoreA: 0, scoreB: 0, played: false })
    return scheduled
  }

  function generateRounds(players, tables, gameMinutes, totalMinutes, mode = 'time') {
    if (mode === 'roundrobin') return generateRoundRobin(players, tables, gameMinutes, totalMinutes)
    if (mode === 'optimized') {
      const rounds = Math.max(1, Math.floor(totalMinutes / Math.max(1, gameMinutes)))
      return generateOptimized(players, tables, rounds)
    }
    const rounds = Math.max(1, Math.floor(totalMinutes / Math.max(1, gameMinutes)))
    const matches = []
    const playCount = {}; const teammateCounts = {}; const teamEncounter = {}; const lastPlayed = {}; const sideCounts = {}
    players.forEach((p) => { playCount[p] = 0; lastPlayed[p] = -1000; sideCounts[p] = 0 })
    function teamKey(a, b) { return [a, b].slice().sort().join(' & ') }
    function incTeammate(a, b) { const k = teamKey(a, b); teammateCounts[k] = (teammateCounts[k] || 0) + 1 }
    function incTeamEncounter(t1, t2) { const k = [t1, t2].slice().sort().join(' | '); teamEncounter[k] = (teamEncounter[k] || 0) + 1 }

    for (let r = 0; r < rounds; r++) {
      const remaining = [...players].sort((a, b) => { if (playCount[a] !== playCount[b]) return playCount[a] - playCount[b]; if (lastPlayed[a] !== lastPlayed[b]) return lastPlayed[a] - lastPlayed[b]; return Math.random() - 0.5 })
      const teams = []
      const maxTeamsThisRound = Math.min(Math.floor(players.length / 2), tables * 2)
      while (teams.length < maxTeamsThisRound && remaining.length >= 2) {
        const a = remaining.shift(); let bestIdx = 0; let bestScore = Infinity
        for (let i = 0; i < remaining.length; i++) {
          const b = remaining[i]; const recentPenalty = (r - lastPlayed[b]) < 2 ? 500 : 0
          const score = (teammateCounts[teamKey(a, b)] || 0) * 100 + playCount[b] * 2 + recentPenalty + Math.random() * 5
          if (score < bestScore) { bestScore = score; bestIdx = i }
        }
        const partner = remaining.splice(bestIdx, 1)[0]
        teams.push([a, partner]); incTeammate(a, partner); playCount[a]++; playCount[partner]++; lastPlayed[a] = r; lastPlayed[partner] = r
      }
      const used = new Array(teams.length).fill(false); let tableIdx = 0
      for (let i = 0; i < teams.length && tableIdx < tables; i++) {
        if (used[i]) continue
        let bestJ = -1; let bestScore = Infinity
        for (let j = i + 1; j < teams.length; j++) {
          if (used[j]) continue
          const t1 = teamKey(teams[i][0], teams[i][1]); const t2 = teamKey(teams[j][0], teams[j][1])
          const pairKey = [t1, t2].slice().sort().join(' | ')
          let score = (teamEncounter[pairKey] || 0) * 100
          const fourKey = [teams[i][0], teams[i][1], teams[j][0], teams[j][1]].slice().sort().join(' | ')
          if (score < bestScore) { bestScore = score; bestJ = j }
        }
        if (bestJ === -1) continue
        used[i] = used[bestJ] = true
        let teamA = teams[i]; let teamB = teams[bestJ]
        const aSideScore = sideCounts[teamA[0]] + sideCounts[teamA[1]]; const bSideScore = sideCounts[teamB[0]] + sideCounts[teamB[1]]
        if (aSideScore - bSideScore > 0 || (Math.random() < 0.15 && aSideScore === bSideScore)) { const tmp = teamA; teamA = teamB; teamB = tmp }
        const id = `r${r}-t${tableIdx}`
        matches.push({ id, round: r + 1, table: tableIdx + 1, teamA, teamB, scoreA: 0, scoreB: 0, played: false })
        incTeamEncounter(teamKey(teamA[0], teamA[1]), teamKey(teamB[0], teamB[1])); sideCounts[teamA[0]] = (sideCounts[teamA[0]] || 0) + 1; sideCounts[teamA[1]] = (sideCounts[teamA[1]] || 0) + 1; tableIdx++
      }
    }
    return matches
  }

  function estimateMatches(playersCount, tables, gameMinutes, totalMinutes, mode) {
    const rounds = Math.max(1, Math.floor(totalMinutes / Math.max(1, gameMinutes)))
    const teamsPerRound = Math.floor(playersCount / 2)
    const matchesPerRound = Math.min(tables, Math.floor(teamsPerRound / 2))
    const totalMatches = rounds * matchesPerRound
    let uniquePairs = 0
    if (playersCount >= 4) uniquePairs = Math.floor((playersCount * (playersCount - 1) * (playersCount - 2) * (playersCount - 3)) / 8)
    const estimated = Math.min(totalMatches, Math.max(1, uniquePairs))
    const avgMatchesPerPlayer = Math.round((estimated * 4) / Math.max(1, playersCount))
    return { estimatedMatches: estimated, avgMatchesPerPlayer }
  }

  function handleStart() {
    const players = parseNames(names)
    if (players.length < 4) return alert('Mindestens 4 Spieler erforderlich')
    const tournament = { tables: Math.max(1, Number(tables) || 1), gameMinutes: Number(gameMinutes) || 7, totalMinutes: Number(totalMinutes) || 180, players, rules, mode: 'team', matches: [], standings: {}, createdAt: Date.now() }
    try { tournament.matches = generateRounds(players, tournament.tables, tournament.gameMinutes, tournament.totalMinutes, schedulingMode); onStart(tournament) } catch (err) { console.error('Error generating rounds', err); alert('Fehler beim Erzeugen des Turniers: ' + (err && err.message ? err.message : String(err))) }
  }

  return (
    <div className="card">
      <h2>Turnier einrichten</h2>
      <label>
        Anzahl Tische
        <input type="number" min="1" value={tables} onChange={(e) => setTables(e.target.value)} />
      </label>
      <label>
        Spiel-Minuten (ca.)
        <input type="number" min="1" value={gameMinutes} onChange={(e) => setGameMinutes(e.target.value)} />
      </label>
      <label>
        Gesamtdauer (Minuten)
        <input type="number" min="10" value={totalMinutes} onChange={(e) => setTotalMinutes(e.target.value)} />
      </label>
      <label>
        Planungs-Modus
        <select value={schedulingMode} onChange={(e) => setSchedulingMode(e.target.value)}>
          <option value="time">Zeitbasiert</option>
          <option value="roundrobin">Round-Robin (faire Verteilung)</option>
          <option value="optimized">Optimiert (Simulated Annealing)</option>
        </select>
      </label>
      <label>
        Spielernamen (eine pro Zeile oder mit Komma getrennt)
        <textarea value={names} onChange={(e) => setNames(e.target.value)} rows={8} />
      </label>
      <div className="estimates">
        {(() => {
          const p = parseNames(names).length
          if (p >= 4) {
            const est = estimateMatches(p, tables, gameMinutes, totalMinutes, schedulingMode)
            return <div>Geschätzte Begegnungen: {est.estimatedMatches} · Geschätzte Spiele pro Spieler: {est.avgMatchesPerPlayer}</div>
          }
          return <div>Mindestens 4 Spieler für Schätzung erforderlich</div>
        })()}
      </div>
      <GameRules rules={rules} onChange={setRules} />
      <div className="actions">
        <button onClick={handleStart}>Turnier starten</button>
      </div>
    </div>
  )
}

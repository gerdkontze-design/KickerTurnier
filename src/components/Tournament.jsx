import React, { useRef, useEffect } from 'react'
import MatchCard from './MatchCard'
import Standings from './Standings'

function calcStandings(matches, mode = 'team', rules = {}) {
  const r = {
    winsAt: rules.winsAt || 6,
    maxDiff: rules.maxDiff || 4,
    allowDraws: rules.allowDraws !== false,
    pointsWinClear: rules.pointsWinClear || 4,
    pointsWinMid: rules.pointsWinMid || 3,
    pointsWinClose: rules.pointsWinClose || 2,
    pointsLoseClose: rules.pointsLoseClose || 1,
    pointsDraw: rules.pointsDraw || 1
  }

  const table = {}

  function addEntry(name) {
    if (!table[name]) table[name] = { name, played: 0, points: 0, gf: 0, ga: 0 }
    return table[name]
  }

  matches.forEach((m) => {
    if (!m.played) return
    const a = m.scoreA
    const b = m.scoreB
    const diff = Math.abs(a - b)

    if (mode === 'team') {
      const kA = [...m.teamA].sort().join(' & ')
      const kB = [...m.teamB].sort().join(' & ')
      const A = addEntry(kA)
      const B = addEntry(kB)
      A.played += 1
      B.played += 1
      A.gf += a
      A.ga += b
      B.gf += b
      B.ga += a

      if (a === b) {
        if (r.allowDraws) {
          A.points += r.pointsDraw
          B.points += r.pointsDraw
        }
      } else {
        const winner = a > b ? A : B
        const loser = a > b ? B : A
        if (diff >= r.maxDiff) {
          winner.points += r.pointsWinClear
        } else if (diff >= 2) {
          winner.points += r.pointsWinMid
        } else if (diff === 1) {
          winner.points += r.pointsWinClose
          loser.points += r.pointsLoseClose
        }
      }
    } else {
      const playersA = m.teamA
      const playersB = m.teamB
      playersA.forEach((p) => addEntry(p))
      playersB.forEach((p) => addEntry(p))

      playersA.forEach((p) => {
        const E = addEntry(p)
        E.played += 1
        E.gf += a
        E.ga += b
      })
      playersB.forEach((p) => {
        const E = addEntry(p)
        E.played += 1
        E.gf += b
        E.ga += a
      })

      if (a === b) {
        if (r.allowDraws) {
          playersA.forEach((p) => (table[p].points += r.pointsDraw))
          playersB.forEach((p) => (table[p].points += r.pointsDraw))
        }
      } else {
        const winnerPlayers = a > b ? playersA : playersB
        const loserPlayers = a > b ? playersB : playersA

        if (diff >= r.maxDiff) {
          winnerPlayers.forEach((p) => (table[p].points += r.pointsWinClear))
        } else if (diff >= 2) {
          winnerPlayers.forEach((p) => (table[p].points += r.pointsWinMid))
        } else if (diff === 1) {
          winnerPlayers.forEach((p) => (table[p].points += r.pointsWinClose))
          loserPlayers.forEach((p) => (table[p].points += r.pointsLoseClose))
        }
      }
    }
  })

  return Object.values(table).sort((a, b) => b.points - a.points || b.gf - a.gf)
}

export default function Tournament({ tournament, onUpdate, onReset }) {
  const matches = tournament.matches || []
  const mode = tournament.mode || 'team'

  function updateMatch(updated) {
    const next = { ...tournament, matches: matches.map((m) => (m.id === updated.id ? updated : m)) }
    onUpdate(next)
  }

  function moveMatch(id, dir) {
    const idx = matches.findIndex((m) => m.id === id)
    if (idx === -1) return
    const to = idx + dir
    if (to < 0 || to >= matches.length) return
    const nextMatches = matches.slice()
    const tmp = nextMatches[to]
    nextMatches[to] = nextMatches[idx]
    nextMatches[idx] = tmp
    onUpdate({ ...tournament, matches: nextMatches })
  }

  function setMode(m) {
    onUpdate({ ...tournament, mode: m })
  }

  function reset() {
    if (confirm('Turnier wirklich zurücksetzen?')) onReset()
  }

  const standings = calcStandings(matches, mode, tournament.rules)

  const firstUnplayed = matches.find((m) => !m.played)
  const currentRound = firstUnplayed ? firstUnplayed.round : null

  const listRef = useRef(null)

  useEffect(() => {
    // auto-scroll to current match inside the matches list (first match of the current round)
    const root = listRef.current
    if (!root) return
    const el = root.querySelector('.match.current')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentRound])

  function scrollToCurrent() {
    const root = listRef.current
    if (!root) return
    const el = root.querySelector('.match.current')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className={`tournament-layout ${currentRound !== null ? 'highlight-current' : ''}`}>
      <div className="left">
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Begegnungen</h3>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div className="mode-toggle">
                <button className={mode==='team' ? 'active' : ''} onClick={() => setMode('team')}>Team</button>
                <button className={mode==='individual' ? 'active' : ''} onClick={() => setMode('individual')}>Einzel</button>
              </div>
              <button onClick={scrollToCurrent} style={{marginLeft:8}}>Zum aktuellen Spiel</button>
            </div>
          </div>
          <div className="matches-list" ref={listRef}>
            {matches.map((m, i) => (
              <div key={m.id} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{flex:1}}>
                  <MatchCard match={m} onSave={updateMatch} isCurrent={!m.played && currentRound !== null && m.round === currentRound} />
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <button onClick={() => moveMatch(m.id, -1)} aria-label="move-up">↑</button>
                  <button onClick={() => moveMatch(m.id, 1)} aria-label="move-down">↓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="right">
        <Standings rows={standings} matches={matches} players={tournament.players} mode={mode} />
        <div className="card">
          <h3>Turnier</h3>
          <p>Tische: {tournament.tables} · Spieler: {tournament.players.length}</p>
          <div className="actions">
            <button onClick={reset}>Turnier beenden</button>
          </div>
        </div>
      </div>
    </div>
  )
}

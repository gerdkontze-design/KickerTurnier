import React, { useState, useEffect } from 'react'

export default function MatchCard({ match, onSave, isCurrent }) {
  const [scoreA, setScoreA] = useState(match.scoreA)
  const [scoreB, setScoreB] = useState(match.scoreB)
  const [saved, setSaved] = useState(Boolean(match.played))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    // reflect external updates
    setScoreA(match.scoreA)
    setScoreB(match.scoreB)
    setSaved(Boolean(match.played))
  }, [match.scoreA, match.scoreB, match.played])

  function openEditor() {
    setEditing(true)
    setSaved(false)
  }

  function cancel() {
    setScoreA(match.scoreA)
    setScoreB(match.scoreB)
    setEditing(false)
  }

  function save() {
    const next = { ...match, scoreA: Number(scoreA), scoreB: Number(scoreB), played: true }
    onSave(next)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const quickScores = [
    { a: 4, b: 0 },
    { a: 4, b: 1 },
    { a: 4, b: 2 },
    { a: 4, b: 3 },
    { a: 6, b: 0 },
  ]

  const winner = match.played ? (match.scoreA > match.scoreB ? 'A' : match.scoreA < match.scoreB ? 'B' : 'D') : null

  return (
    <div className={`match ${isCurrent ? 'current' : ''}`}>
      {isCurrent && <div className="current-badge">Aktuelles Spiel</div>}
      <div className="match-header">Tisch {match.table} · Runde {match.round}</div>

      {!editing ? (
        <>
          <div className="teams">
            <div className={`team ${winner === 'A' ? 'winner' : ''}`}>
              <div className="players">{match.teamA.join(' / ')}</div>
            </div>

            <div className={`vs ${match.played ? 'played' : ''}`}>
              {match.played ? (
                <div className="score-stack">
                  <div className="score-a">{match.scoreA}</div>
                  <div className="colon">:</div>
                  <div className="score-b">{match.scoreB}</div>
                </div>
              ) : (
                'vs'
              )}
            </div>

            <div className={`team ${winner === 'B' ? 'winner' : ''}`}>
              <div className="players">{match.teamB.join(' / ')}</div>
            </div>
          </div>

          <div className="match-actions">
            <button onClick={openEditor}>{match.played ? 'Ergebnis ändern' : 'Ergebnis eintragen'}</button>
            {saved && <span className="saved-badge">Gespeichert ✓</span>}
          </div>
        </>
      ) : (
        <>
          <div className="teams">
            <div className="team">
              <div className="players">{match.teamA.join(' / ')}</div>
              <input type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} />
            </div>

            <div className="vs">vs</div>

            <div className="team">
              <div className="players">{match.teamB.join(' / ')}</div>
              <input type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} />
            </div>
          </div>

          <div className="quick-buttons">
            <div className="qb-col">
              <div className="qb-label">Schnellwahl {match.teamA.join(' / ')}</div>
              {quickScores.map((s) => (
                <button
                  key={`A-${s.a}-${s.b}`}
                  className="quick-btn"
                  onClick={() => {
                    setScoreA(s.a)
                    setScoreB(s.b)
                  }}
                >
                  {s.a}:{s.b}
                </button>
              ))}
            </div>

            <div className="qb-col">
              <div className="qb-label">Schnellwahl {match.teamB.join(' / ')}</div>
              {quickScores.map((s) => (
                <button
                  key={`B-${s.a}-${s.b}`}
                  className="quick-btn"
                  onClick={() => {
                    setScoreA(s.b)
                    setScoreB(s.a)
                  }}
                >
                  {s.b}:{s.a}
                </button>
              ))}
            </div>
          </div>

          <div className="match-actions">
            <button onClick={save}>Speichern</button>
            <button onClick={cancel} style={{background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.06)'}}>Abbrechen</button>
          </div>
        </>
      )}
    </div>
  )
}

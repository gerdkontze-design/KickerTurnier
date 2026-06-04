import React from 'react'

export default function Standings({ rows = [], matches = [], players = [], mode = 'team' }) {
  let display = rows

  if ((!rows || rows.length === 0) && matches && matches.length > 0) {
    if (mode === 'team') {
      const teams = {}
      matches.forEach((m) => {
        const kA = [...m.teamA].slice().sort().join(' & ')
        const kB = [...m.teamB].slice().sort().join(' & ')
        if (!teams[kA]) teams[kA] = { name: kA, played: 0, points: 0, gf: 0, ga: 0 }
        if (!teams[kB]) teams[kB] = { name: kB, played: 0, points: 0, gf: 0, ga: 0 }
      })
      display = Object.values(teams)
    } else {
      // individual mode: list players
      display = players.map((p) => ({ name: p, played: 0, points: 0, gf: 0, ga: 0 }))
    }
  } else if ((!rows || rows.length === 0) && (!matches || matches.length === 0)) {
    // no matches scheduled yet: show players or empty message
    if (mode === 'team') {
      display = players.length >= 2 ? [{ name: 'Keine Begegnungen geplant', played: 0, points: 0, gf: 0, ga: 0 }] : []
    } else {
      display = players.map((p) => ({ name: p, played: 0, points: 0, gf: 0, ga: 0 }))
    }
  }

  return (
    <div className="card">
      <h3>Live Tabelle</h3>
      <table className="standings">
        <thead>
          <tr>
            <th>#</th>
            <th>{mode === 'team' ? 'Team' : 'Spieler'}</th>
            <th>Sp</th>
            <th>GF</th>
            <th>GA</th>
            <th>Pkt</th>
          </tr>
        </thead>
        <tbody>
          {display.map((r, i) => (
            <tr key={r.name}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.played}</td>
              <td>{r.gf}</td>
              <td>{r.ga}</td>
              <td>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import React from 'react'

export default function GameRules({ rules, onChange }) {
  const r = rules || {}

  function updateRule(key, value) {
    onChange({ ...r, [key]: value })
  }

  return (
    <div className="card">
      <h3>Spielregeln</h3>
      
      <label>
        Tore zum Sieg
        <input 
          type="number" 
          min="3" 
          max="20" 
          value={r.winsAt || 6} 
          onChange={(e) => updateRule('winsAt', Number(e.target.value))}
        />
      </label>

      <label>
        Torunterschied für automatischen Sieg
        <input 
          type="number" 
          min="1" 
          max="10" 
          value={r.maxDiff || 4} 
          onChange={(e) => updateRule('maxDiff', Number(e.target.value))}
        />
        <small>Wenn Unterschied ≥ diesen Wert: Spiel endet</small>
      </label>

      <label>
        <input 
          type="checkbox" 
          checked={r.allowDraws !== false} 
          onChange={(e) => updateRule('allowDraws', e.target.checked)}
        />
        Unentschieden erlaubt?
      </label>

      <fieldset>
        <legend>Punkte für...</legend>
        
        <label>
          Klarer Sieg (Unterschied ≥ {r.maxDiff || 4})
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={r.pointsWinClear || 4} 
            onChange={(e) => updateRule('pointsWinClear', Number(e.target.value))}
          />
        </label>

        <label>
          Mittlerer Sieg (Unterschied 2-3)
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={r.pointsWinMid || 3} 
            onChange={(e) => updateRule('pointsWinMid', Number(e.target.value))}
          />
        </label>

        <label>
          Knapper Sieg (Unterschied = 1)
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={r.pointsWinClose || 2} 
            onChange={(e) => updateRule('pointsWinClose', Number(e.target.value))}
          />
        </label>

        <label>
          Knapper Sieg - Verlierer
          <input 
            type="number" 
            min="0" 
            max="10" 
            value={r.pointsLoseClose || 1} 
            onChange={(e) => updateRule('pointsLoseClose', Number(e.target.value))}
          />
        </label>

        <label>
          Unentschieden (pro Team)
          <input 
            type="number" 
            min="0" 
            max="10" 
            value={r.pointsDraw || 1} 
            onChange={(e) => updateRule('pointsDraw', Number(e.target.value))}
          />
        </label>
      </fieldset>
    </div>
  )
}

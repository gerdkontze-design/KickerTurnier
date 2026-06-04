import React, { useEffect, useState } from 'react'
import Setup from './components/Setup'
import Tournament from './components/Tournament'

const STORAGE_KEY = 'kicker:state:v1'

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : { tournament: null }
    } catch (e) {
      return { tournament: null }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <div className="app-root">
      <header className="app-header">Kicker Turnier</header>
      <main className="app-main">
        {!state.tournament ? (
          <Setup onStart={(t) => setState({ ...state, tournament: t })} />
        ) : (
          <Tournament
            tournament={state.tournament}
            onUpdate={(t) => setState({ ...state, tournament: t })}
            onReset={() => setState({ tournament: null })}
          />
        )}
      </main>
      <footer className="app-footer">Offline · gespeichter Stand in localStorage</footer>
    </div>
  )
}

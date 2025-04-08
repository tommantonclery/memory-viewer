import React, { useEffect, useState } from 'react'
import init, { parse_bytes } from './pkg/core'

type MemoryRow = {
  offset: string
  hex: string[]
  ascii: string[]
}

type Match = { row: number; col: number }

function App() {
  const [memory, setMemory] = useState<MemoryRow[]>([])
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [searchMode, setSearchMode] = useState<'hex' | 'ascii'>('hex')
  const [selectionStart, setSelectionStart] = useState<Match | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Match | null>(null)
  const [hovering, setHovering] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectionEnd || memory.length === 0) return

      const toIndex = ({ row, col }: Match) => row * 16 + col
      const fromIndex = toIndex(selectionEnd)
      let newIndex = fromIndex

      if (e.key === 'ArrowRight') newIndex += 1
      else if (e.key === 'ArrowLeft') newIndex -= 1
      else if (e.key === 'ArrowUp') newIndex -= 16
      else if (e.key === 'ArrowDown') newIndex += 16
      else return

      const maxIndex = memory.length * 16 - 1
      newIndex = Math.max(0, Math.min(maxIndex, newIndex))
      const newMatch = { row: Math.floor(newIndex / 16), col: newIndex % 16 }

      if (e.shiftKey && selectionStart) {
        setSelectionEnd(newMatch)
      } else {
        setSelectionStart(newMatch)
        setSelectionEnd(newMatch)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectionEnd, memory, selectionStart])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    await init()
    const result = parse_bytes(bytes)
    const parsed: MemoryRow[] = result as any
    setMemory(parsed)
    setMatches([])
    setSelectionStart(null)
    setSelectionEnd(null)
    setCurrentMatchIndex(null)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setQuery(input)

    let queryBytes: number[] = []

    if (searchMode === 'hex') {
      queryBytes = input
        .toUpperCase()
        .split(' ')
        .map((h) => h.trim())
        .filter(Boolean)
        .map((h) => parseInt(h, 16))
        .filter((b) => !isNaN(b))
    } else {
      queryBytes = input.split('').map((c) => c.charCodeAt(0))
    }

    if (queryBytes.length === 0 || memory.length === 0) {
      setMatches([])
      return
    }

    const flatBytes = memory.flatMap((row) => row.hex.map((h) => parseInt(h, 16)))
    const newMatches: Match[] = []

    for (let i = 0; i <= flatBytes.length - queryBytes.length; i++) {
      let found = true
      for (let j = 0; j < queryBytes.length; j++) {
        if (flatBytes[i + j] !== queryBytes[j]) {
          found = false
          break
        }
      }

      if (found) {
        for (let j = 0; j < queryBytes.length; j++) {
          const index = i + j
          const row = Math.floor(index / 16)
          const col = index % 16
          newMatches.push({ row, col })
        }
      }
    }

    setMatches(newMatches)
    setCurrentMatchIndex(null)
  }

  const goToMatch = (index: number) => {
    const match = matches[index]
    if (match) {
      setSelectionStart(match)
      setSelectionEnd(match)
      setCurrentMatchIndex(index)

      const cell = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`)
      cell?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const goNextMatch = () => {
    if (matches.length === 0) return
    const next = currentMatchIndex === null ? 0 : (currentMatchIndex + 1) % matches.length
    goToMatch(next)
  }

  const goPrevMatch = () => {
    if (matches.length === 0) return
    const prev =
      currentMatchIndex === null
        ? matches.length - 1
        : (currentMatchIndex - 1 + matches.length) % matches.length
    goToMatch(prev)
  }

  const isHighlighted = (row: number, col: number) =>
    matches.some((m) => m.row === row && m.col === col)

  const isSelected = (row: number, col: number) => {
    if (!selectionStart || !selectionEnd) return false

    const toIndex = ({ row, col }: Match) => row * 16 + col
    const start = Math.min(toIndex(selectionStart), toIndex(selectionEnd))
    const end = Math.max(toIndex(selectionStart), toIndex(selectionEnd))
    const current = toIndex({ row, col })

    return current >= start && current <= end
  }

  const toggleByte = (row: number, col: number) => {
    if (selectionStart && selectionEnd && isSelected(row, col)) {
      setSelectionStart(null)
      setSelectionEnd(null)
    } else {
      const match = { row, col }
      setSelectionStart(match)
      setSelectionEnd(match)
    }
  }

  const getSelectedBytes = () => {
    if (!selectionStart || !selectionEnd) return []

    const flat: { hex: string; ascii: string }[] = memory.flatMap((row, rowIdx) =>
      row.hex.map((hex, colIdx) => ({
        hex,
        ascii: row.ascii[colIdx],
        row: rowIdx,
        col: colIdx,
      }))
    )

    const toIndex = (m: Match) => m.row * 16 + m.col
    const start = Math.min(toIndex(selectionStart), toIndex(selectionEnd))
    const end = Math.max(toIndex(selectionStart), toIndex(selectionEnd))

    return flat.slice(start, end + 1)
  }

  const selectionActive = selectionStart && selectionEnd && getSelectedBytes().length > 0

  const buttonStyle = (enabled: boolean) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors
     bg-zinc-${enabled ? '800' : '700'}
     text-white
     ${enabled ? 'hover:bg-zinc-700' : 'cursor-not-allowed'}`

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-white font-mono p-6">
      <div className="w-full h-full">
        <h1 className="text-4xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
          <span>🧠</span> Memory Viewer
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
          <input
            type="file"
            onChange={handleFile}
            className="bg-zinc-800 border border-zinc-600 px-4 py-2 rounded w-full sm:w-auto"
          />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder={searchMode === 'hex' ? 'Search bytes (e.g. 48 65 6C)' : 'Search ASCII (e.g. Hello)'}
            className="bg-zinc-800 border border-zinc-600 px-4 py-2 rounded w-full sm:w-80"
          />
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as 'hex' | 'ascii')}
            className="bg-zinc-800 border border-zinc-600 px-4 py-2 rounded w-full sm:w-auto text-white"
          >
            <option value="hex">Hex</option>
            <option value="ascii">ASCII</option>
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={goPrevMatch} disabled={matches.length === 0} className={buttonStyle(matches.length > 0)}>
            ◀ Prev
          </button>
          <button onClick={goNextMatch} disabled={matches.length === 0} className={buttonStyle(matches.length > 0)}>
            Next ▶
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
          <span className="text-zinc-400">
            {selectionActive ? `Selected ${getSelectedBytes().length} bytes` : 'No selection'}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(getSelectedBytes().map((b) => b.hex).join(' '))}
            disabled={!selectionActive}
            className={buttonStyle(!!selectionActive)}
          >
            Copy Hex
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(getSelectedBytes().map((b) => b.ascii).join(''))}
            disabled={!selectionActive}
            className={buttonStyle(!!selectionActive)}
          >
            Copy ASCII
          </button>
          <button
            onClick={() => {
              const hex = getSelectedBytes().map((b) => parseInt(b.hex, 16))
              const blob = new Blob([new Uint8Array(hex)], {
                type: 'application/octet-stream',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'selection.bin'
              a.click()
            }}
            disabled={!selectionActive}
            className={buttonStyle(!!selectionActive)}
          >
            Export Raw
          </button>
          <button
            onClick={() => {
              setSelectionStart(null)
              setSelectionEnd(null)
            }}
            disabled={!selectionActive}
            className={buttonStyle(!!selectionActive)}
          >
            Clear
          </button>
        </div>

        <div className="overflow-auto rounded border border-zinc-700 bg-zinc-900 shadow-md">
          <table className="table-auto w-full text-sm select-none">
            <thead className="bg-zinc-800 sticky top-0 z-10">
              <tr className="text-zinc-400 text-left">
                <th className="px-4 py-2">Offset</th>
                <th className="px-4 py-2">Hex</th>
                <th className="px-4 py-2">ASCII</th>
              </tr>
            </thead>
            <tbody>
              {memory.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
                  <td className="px-4 py-1 text-zinc-500">{row.offset}</td>
                  <td className="px-4 py-1">
                    {row.hex.map((h, colIndex) => (
                      <span
                        key={colIndex}
                        onMouseDown={() => toggleByte(rowIndex, colIndex)}
                        onMouseEnter={(e) => {
                          if (e.buttons === 1 && hovering) {
                            setSelectionEnd({ row: rowIndex, col: colIndex })
                          }
                        }}
                        onMouseUp={() => setHovering(false)}
                        onMouseLeave={() => setHovering(false)}
                        className={`inline-block w-8 text-center rounded cursor-pointer select-none ${
                          isSelected(rowIndex, colIndex)
                            ? 'bg-blue-400 text-black ring-2 ring-blue-300'
                            : isHighlighted(rowIndex, colIndex)
                            ? 'bg-yellow-400 text-black'
                            : ''
                        }`}
                        onMouseOver={() => setHovering(true)}
                      >
                        {h}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-1">
                    {row.ascii.map((c, colIndex) => (
                      <span
                        key={colIndex}
                        onMouseDown={() => toggleByte(rowIndex, colIndex)}
                        onMouseEnter={(e) => {
                          if (e.buttons === 1 && hovering) {
                            setSelectionEnd({ row: rowIndex, col: colIndex })
                          }
                        }}
                        onMouseUp={() => setHovering(false)}
                        onMouseLeave={() => setHovering(false)}
                        className={`inline-block w-4 text-center rounded cursor-pointer select-none ${
                          isSelected(rowIndex, colIndex)
                            ? 'bg-blue-400 text-black ring-2 ring-blue-300'
                            : isHighlighted(rowIndex, colIndex)
                            ? 'bg-yellow-400 text-black'
                            : ''
                        }`}
                        onMouseOver={() => setHovering(true)}
                      >
                        {c}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
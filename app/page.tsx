'use client'

import { useState, useCallback, useEffect } from 'react'

type Tab = 'credit' | 'debit' | 'online' | 'tally'
type Entry = { id: string; payee: string; date: string; type: Tab; amount: number; denominations: Record<number, number>; note?: string }

const DENOMS = [500, 200, 100, 50, 20, 10,]
const DC: Record<number, string> = { 500: '#7b4f2e', 200: '#6b3fa0', 100: '#2563a8', 50: '#1a7a4a', 20: '#c17f24', 10: '#8b6914', }
const DB: Record<number, string> = { 500: '#fef3ea', 200: '#f3edfb', 100: '#e8f0fb', 50: '#e6f7ef', 20: '#fdf3e0', 10: '#fdf8e8' }

function toWords(n: number): string {
  if (n === 0) return 'Zero Rupees'
  const o = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function w(num: number): string {
    if (num < 20) return o[num]
    if (num < 100) return t[Math.floor(num / 10)] + (num % 10 ? ' ' + o[num % 10] : '')
    if (num < 1000) return o[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + w(num % 100) : '')
    if (num < 100000) return w(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + w(num % 1000) : '')
    if (num < 10000000) return w(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + w(num % 100000) : '')
    return w(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + w(num % 10000000) : '')
  }
  return w(n) + ' Rupees'
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)
const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).slice(2)}` }

function DenomRow({ d, c, onChange, i }: { d: number; c: number; onChange: (v: number) => void; i: number }) {
  return (
    <div className="denom-row flex items-center gap-2 py-2.5 px-3 rounded-xl border border-gray-100 bg-white active:bg-gray-50 sm:gap-3 sm:px-4 sm:py-3 sm:rounded-2xl" style={{ animationDelay: `${i * 30}ms`, borderLeft: `3px solid ${DC[d]}` }}>
      <img
        src={`/images/${d}.jpeg`}
        alt={`₹${d} note`}
        className="flex-shrink-0 w-14 h-9 rounded-lg object-cover shadow-sm sm:w-[72px] sm:h-11 sm:rounded-xl"
        style={{ border: `2px solid ${DC[d]}30` }}
      />
      <span className="hidden sm:inline w-14 text-right font-mono font-semibold text-gray-700 text-sm">{fmt(d)}</span>
      <span className="text-gray-300 font-light text-base sm:text-lg">×</span>
      <input type="number" min="0" inputMode="numeric" pattern="[0-9]*" value={c === 0 ? '' : c} placeholder="0" onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-14 h-11 text-center font-mono font-semibold text-sm border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white sm:w-20 sm:text-base" style={{ color: DC[d] }} />
      <span className="text-gray-300 font-light text-base sm:text-lg">=</span>
      <div className="flex-1 text-right font-mono font-semibold text-xs sm:text-sm text-gray-700">
        {d * c > 0 ? <span className="text-green-700">{fmt(d * c)}</span> : <span className="text-gray-300">—</span>}
      </div>
    </div>
  )
}

function HistoryItem({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sm:rounded-2xl">
      <div className="flex items-center gap-2 p-3 active:bg-gray-50 sm:gap-3 sm:p-4">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="text-[10px] text-gray-400 mt-0.5 sm:text-xs">{entry.date}</div>
        </div>
        <div className={`font-mono font-bold text-sm sm:text-base ${entry.type === 'debit' ? 'text-red-600' : 'text-green-700'}`}>
          {entry.type === 'debit' ? '−' : '+'}₹{fmt(entry.amount)}
        </div>
        <span className="text-gray-400 text-[10px] sm:text-xs cursor-pointer" onClick={() => setOpen(o => !o)}>{open ? '▲' : '▼'}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 active:text-red-600 active:bg-red-50 transition-colors"
          title="Delete entry">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-1.5 sm:px-4 sm:pb-4 sm:pt-3 sm:space-y-2">
          {Object.entries(entry.denominations).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs text-gray-600 sm:text-sm">
              <span>₹{k} × {v}</span>
              <span className="font-mono">₹{fmt(Number(k) * v)}</span>
            </div>
          ))}
          {entry.note && <p className="text-[10px] text-gray-400 italic mt-1.5 sm:text-xs sm:mt-2">{entry.note}</p>}
        </div>
      )}
    </div>
  )
}

export default function CashCounter() {
  const [tab, setTab] = useState<'counter' | 'history' | 'calculator'>('counter')
  const [activeType, setActiveType] = useState<Tab>('credit')
  const [payee, setPayee] = useState('')
  const [date, setDate] = useState(today())
  const [counts, setCounts] = useState<Record<number, number>>(Object.fromEntries(DENOMS.map(d => [d, 0])))
  const [onlineAmt, setOnlineAmt] = useState('')
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<Entry[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cashcount-history')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cashcount-history', JSON.stringify(history))
  }, [history])
  const [saved, setSaved] = useState(false)
  const [calcDisp, setCalcDisp] = useState('0')
  const [calcPrev, setCalcPrev] = useState<number | null>(null)
  const [calcOp, setCalcOp] = useState<string | null>(null)
  const [calcNew, setCalcNew] = useState(true)

  const cashTotal = DENOMS.reduce((s, d) => s + d * (counts[d] || 0), 0)
  const total = activeType === 'online' ? (parseFloat(onlineAmt) || 0) : cashTotal
  const noteCount = DENOMS.reduce((s, d) => s + (counts[d] || 0), 0)
  const netBal = history.reduce((s, e) => e.type === 'credit' ? s + e.amount : e.type === 'debit' ? s - e.amount : s, 0)

  const handleCount = useCallback((denom: number, val: number) => setCounts(p => ({ ...p, [denom]: val })), [])
  const handleClear = () => { setCounts(Object.fromEntries(DENOMS.map(d => [d, 0]))); setPayee(''); setNote(''); setOnlineAmt(''); setSaved(false) }
  const handleSave = () => {
    setHistory(p => [{ id: Date.now().toString(), payee: payee || 'Unnamed', date, type: activeType, amount: total, denominations: { ...counts }, note }, ...p])
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const calcInput = (v: string) => { if (calcNew) { setCalcDisp(v); setCalcNew(false) } else setCalcDisp(d => d === '0' ? v : d + v) }
  const calcOperator = (op: string) => { setCalcPrev(parseFloat(calcDisp)); setCalcOp(op); setCalcNew(true) }
  const calcEquals = () => {
    if (calcPrev === null || !calcOp) return
    const c = parseFloat(calcDisp); let r = 0
    if (calcOp === '+') r = calcPrev + c; else if (calcOp === '−') r = calcPrev - c
    else if (calcOp === '×') r = calcPrev * c; else if (calcOp === '÷') r = calcPrev / c
    setCalcDisp(String(parseFloat(r.toFixed(10)))); setCalcPrev(null); setCalcOp(null); setCalcNew(true)
  }

  const calcBtns = [['AC', '+/−', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '.', '=']]

  const handleWhatsApp = () => {
    const denomLines = DENOMS.filter(d => (counts[d] || 0) > 0)
      .map(d => `${fmt(d)} × ${counts[d]} = ${fmt(d * counts[d])}`)
      .join('\n')
    const msg = [
      `*CashCount Summary*`,
      `*Date*: ${date}`,
      `
      
      `,
      denomLines || '(No denominations)',
      `
      
      `,
      `━━━━━━━━━━━━━━━`,
      `*Total*: ₹${fmt(total)}`,
      `*In words*: ${toWords(total)}`,
    ].join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 flex flex-col pb-16 sm:pb-0">
      {/* ── Header ── */}
      <header style={{ background: 'var(--navy)' }} className="sticky top-0 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:w-8 sm:h-8 sm:rounded-xl sm:text-sm" style={{ background: 'var(--green)' }}>₹</div>
              <span className="text-white font-semibold text-base tracking-tight sm:text-lg">CashCount</span>
            </div>
            <input value={date} onChange={e => setDate(e.target.value)} placeholder="DD-MM-YY"
              className="w-24 border-2 border-gray-200 rounded-xl px-2 py-2.5 text-xs font-mono text-center bg-white sm:w-32 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm" />
          </div>
          {/* Desktop nav - hidden on mobile */}
          <div className="hidden sm:flex gap-1 bg-white/10 rounded-full p-1">
            {(['counter', 'history', 'calculator'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-full capitalize transition-all ${tab === t ? 'bg-white font-semibold' : 'text-blue-200 hover:text-white'}`}
                style={tab === t ? { color: 'var(--navy)' } : {}}>
                {t === 'counter' ? '💵 Counter' : t === 'history' ? '📋 History' : '🧮 Calc'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 py-4 space-y-3 sm:px-4 sm:py-5 sm:space-y-4">

        {/* COUNTER TAB */}
        {tab === 'counter' && (
          <div className="tab-content space-y-3 sm:space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl p-2.5 text-center sm:rounded-2xl sm:p-3" style={{ background: 'var(--amber-pale)', border: '1px solid #f0c96030' }}>
                <p className="text-[10px] text-amber-700 font-medium mb-0.5 sm:text-xs sm:mb-1">Notes</p>
                <p className="font-mono font-bold text-xl text-amber-800 sm:text-2xl">{noteCount}</p>
              </div>
              <div className="rounded-xl p-2.5 text-center sm:rounded-2xl sm:p-3" style={{ background: 'var(--green-pale)', border: '1px solid #38a05030' }}>
                <p className="text-[10px] text-green-700 font-medium mb-0.5 sm:text-xs sm:mb-1">Cash Total</p>
                <p className="font-mono font-bold text-sm text-green-800 sm:text-lg">₹{fmt(cashTotal)}</p>
              </div>
              <div className="rounded-xl p-2.5 text-center sm:rounded-2xl sm:p-3" style={{ background: 'var(--blue-pale)', border: '1px solid #2563a830' }}>
                <p className="text-[10px] text-blue-700 font-medium mb-0.5 sm:text-xs sm:mb-1">Total</p>
                <p className="font-mono font-bold text-sm text-blue-800 sm:text-lg">₹{fmt(total)}</p>
              </div>
            </div>


            {/* Online amount */}
            {activeType === 'online' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-3 py-2.5 flex items-center gap-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:gap-3">
                <span className="text-blue-400 text-lg font-bold sm:text-xl">₹</span>
                <input value={onlineAmt} onChange={e => setOnlineAmt(e.target.value)} placeholder="Enter amount" type="number" inputMode="decimal"
                  className="flex-1 bg-transparent text-blue-800 font-mono font-semibold text-base focus:outline-none placeholder:text-blue-300 sm:text-lg" />
              </div>
            )}

            {/* Denomination count */}
            {activeType !== 'online' && (
              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5 sm:text-xs sm:gap-2">
                  <span>💰</span> Denomination Count
                </h2>
                <div className="space-y-1.5 sm:space-y-2">
                  {DENOMS.map((d, i) => <DenomRow key={d} d={d} c={counts[d] || 0} onChange={v => handleCount(d, v)} i={i} />)}
                </div>
              </div>
            )}

            {/* Words */}
            <div className="bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-center sm:rounded-2xl sm:px-5 sm:py-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 font-medium sm:text-xs sm:mb-1">Amount in Words</p>
              <p className="font-semibold text-gray-700 text-xs leading-relaxed sm:text-sm">{toWords(total)}</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <button onClick={handleClear} className="py-3 rounded-xl text-xs font-semibold bg-white border-2 border-gray-200 text-gray-500 active:bg-gray-50 transition-all sm:py-3.5 sm:rounded-2xl sm:text-sm">
                🗑 Clear
              </button>
              <button onClick={handleSave} disabled={total === 0}
                className={`col-span-2 py-3 rounded-xl text-xs font-semibold transition-all shadow-md sm:py-3.5 sm:rounded-2xl sm:text-sm ${saved ? 'bg-green-500 text-white save-success' : 'text-white active:opacity-90'}`}
                style={!saved ? { background: 'var(--navy)' } : {}}>
                {saved ? '✅ Saved!' : '💾 Save Entry'}
              </button>
              <button onClick={handleWhatsApp} disabled={total === 0}
                className="py-3 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:opacity-90 disabled:opacity-40 sm:py-3.5 sm:rounded-2xl sm:text-sm"
                style={{ background: '#25D366' }}>
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Share
                </span>
              </button>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div className="tab-content space-y-3 sm:space-y-4">
            <div className="rounded-xl p-4 text-center text-white shadow-lg sm:rounded-2xl sm:p-5" style={{ background: netBal >= 0 ? 'var(--green)' : 'var(--red)' }}>
              <p className="text-green-100 text-xs font-medium mb-0.5 sm:text-sm sm:mb-1">Net Balance</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl">{netBal < 0 ? '−' : '+'}₹{fmt(Math.abs(netBal))}</p>
              <p className="text-green-100 text-[10px] mt-0.5 sm:text-xs sm:mt-1">{history.length} transaction{history.length !== 1 ? 's' : ''}</p>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-300 sm:py-20">
                <p className="text-4xl mb-3 sm:text-5xl sm:mb-4">💸</p>
                <p className="font-medium text-gray-400 text-sm sm:text-base">No transactions yet</p>
                <p className="text-xs text-gray-300 mt-1 sm:text-sm">Start counting cash in the Counter tab</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {history.map(e => <HistoryItem key={e.id} entry={e} onDelete={() => setHistory(p => p.filter(x => x.id !== e.id))} />)}
              </div>
            )}
          </div>
        )}

        {/* CALCULATOR TAB */}
        {tab === 'calculator' && (
          <div className="tab-content bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-sm mx-auto sm:rounded-3xl">
            <div style={{ background: 'var(--navy)' }} className="px-4 py-6 text-right sm:px-6 sm:py-8">
              <p className="text-blue-300 text-xs h-4 sm:text-sm sm:h-5">{calcPrev !== null ? `${calcPrev} ${calcOp}` : ''}</p>
              <p className="text-white font-mono font-light text-4xl mt-1.5 truncate sm:text-5xl sm:mt-2">{calcDisp}</p>
            </div>
            <div className="p-3 space-y-2 sm:p-4 sm:space-y-3" style={{ background: '#f8f9fb' }}>
              {calcBtns.map((row, ri) => (
                <div key={ri} className="grid gap-2 grid-cols-4 sm:gap-3">
                  {row.map(btn => {
                    const isOp = '÷×−+='.includes(btn); const isFn = ['AC', '+/−', '%'].includes(btn); const isZero = btn === '0'
                    return (
                      <button key={btn} onClick={() => {
                        if (btn === 'AC') { setCalcDisp('0'); setCalcPrev(null); setCalcOp(null); setCalcNew(true) }
                        else if (btn === '+/−') setCalcDisp(d => String(-parseFloat(d)))
                        else if (btn === '%') setCalcDisp(d => String(parseFloat(d) / 100))
                        else if (btn === '=') calcEquals()
                        else if (isOp) calcOperator(btn)
                        else if (btn === '.') { if (!calcDisp.includes('.')) { setCalcDisp(d => calcNew ? '0.' : d + '.'); setCalcNew(false) } }
                        else calcInput(btn)
                      }}
                        className={`${isZero ? 'col-span-2' : ''} h-12 rounded-xl font-semibold text-base transition-all active:scale-95 shadow-sm sm:h-14 sm:rounded-2xl sm:text-lg ${isOp ? 'text-white' : isFn ? 'bg-gray-200 text-gray-700 active:bg-gray-300' : 'bg-white text-gray-800 active:bg-gray-50 border border-gray-100'}`}
                        style={isOp ? { background: btn === '=' ? 'var(--green)' : 'var(--navy)' } : {}}>
                        {btn}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-2xl mx-auto w-full px-4 pb-20 pt-6 sm:pb-8 space-y-3">
        <div className="border-t border-gray-200 pt-4">
          <p className="text-[10px] leading-relaxed text-gray-400 text-center sm:text-xs">
            All Indian Rupee currency images used on this site are for illustrative cash-counting purposes only. The copyright and intellectual property rights for the banknote designs belong entirely to the Reserve Bank of India (RBI).
          </p>
        </div>
        <p className="text-[10px] text-gray-400 text-center font-medium sm:text-xs">
          © 2026 Mhd Gouse. All rights reserved.
        </p>
      </footer>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] sm:hidden bottom-nav">
        <div className="flex items-stretch">
          {(['counter', 'history', 'calculator'] as const).map(t => {
            const icons = { counter: '💵', history: '📋', calculator: '🧮' }
            const labels = { counter: 'Counter', history: 'History', calculator: 'Calc' }
            const active = tab === t
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${active ? 'text-[var(--navy)]' : 'text-gray-400'}`}>
                <span className="text-lg">{icons[t]}</span>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{labels[t]}</span>
                {active && <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ background: 'var(--navy)' }} />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

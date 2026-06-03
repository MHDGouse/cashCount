'use client'

import { useState, useCallback, useEffect } from 'react'

type Tab = 'counter' | 'history' | 'calculator'
type EntryType = 'credit' | 'debit' | 'online' | 'tally'
type Entry = { id: string; payee: string; date: string; type: EntryType; amount: number; denominations: Record<number, number>; note?: string }
type Theme = 'dark' | 'light'

const DENOMS = [500, 200, 100, 50, 20, 10]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtDate(): string {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

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
  const [pulse, setPulse] = useState(false)
  const prevC = c

  useEffect(() => {
    if (c !== prevC && c > 0) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 500)
      return () => clearTimeout(t)
    }
  }, [c, prevC])

  const inc = () => onChange(c + 1)
  const dec = () => onChange(Math.max(0, c - 1))

  return (
    <div className={`row-card flex items-center justify-between h-12 animate-slide-up ${pulse ? 'pulse-update' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
      <div className="flex items-center gap-4">
        <img
          src={`/images/${d}.jpeg`}
          alt={`₹${d} note`}
          className="flex-shrink-0 w-[56px] h-[36px] rounded-[10px] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        />
        <span className="currency-label w-14">₹{d}</span>
      </div>

      <div className="flex items-center">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          pattern="[0-9]*"
          value={c === 0 ? '' : c}
          placeholder="0"
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-12 h-11 text-center font-bold text-[18px] bg-transparent border-none focus:outline-none rounded-xl"
          style={{ color: 'var(--input-text)' }}
        />
      </div>
      {/* <div className="flex items-center gap-1.5">
          <button onClick={dec} className="stepper-btn" aria-label="Decrease">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>

        

          <button onClick={inc} className="stepper-btn" aria-label="Increase">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div> */}

      <div className="w-[120px] overflow-hidden">
        {d * c > 0 ? (
          <span className="row-total block text-right whitespace-nowrap overflow-x-auto scrollbar-hide" style={{ direction: 'rtl' }}>₹{fmt(d * c)}</span>
        ) : (
          <span className="row-total block text-right" style={{ opacity: 0.2 }}>₹0</span>
        )}
      </div>

    </div>
  )
}

function HistoryItem({ entry, onDelete, onLoad }: { entry: Entry; onDelete: () => void; onLoad: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div>
          <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.date}</div>
          <div className="text-[13px] font-medium mt-0.5 capitalize" style={{ color: 'var(--text-secondary)' }}>{entry.type}{entry.payee && entry.payee !== 'Unnamed' ? ` · ${entry.payee}` : ''}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`font-mono font-bold text-lg sm:text-xl ${entry.type === 'debit' ? 'text-red-400' : 'text-[#4ADE80]'}`}>
            {entry.type === 'debit' ? '−' : '+'}₹{fmt(entry.amount)}
          </div>
          <svg className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {open && (
        <div className="history-expand px-5 pb-5 pt-2 space-y-2.5">
          {Object.entries(entry.denominations).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} className="flex justify-between text-[15px] text-slate-300 font-medium">
              <span>₹{k} <span className="opacity-50">×</span> {v}</span>
              <span className="font-mono text-white">₹{fmt(Number(k) * v)}</span>
            </div>
          ))}
          {entry.note && (
            <div className="text-[13px] text-slate-400 italic bg-black/30 p-3 rounded-xl border border-white/5 mt-3">
              Note: {entry.note}
            </div>
          )}
          {/* Action buttons */}
          <div className="flex gap-3 pt-3 mt-1 border-t border-white/5">
            <button
              onClick={(e) => { e.stopPropagation(); onLoad() }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-[14px] transition-all duration-200 active:scale-95"
              style={{ background: 'var(--accent-gradient, linear-gradient(135deg, #6366F1, #8B5CF6))', color: '#fff', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Load to Counter
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[14px] bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CashCounter() {
  const [tab, setTab] = useState<Tab>('counter')
  const [activeType, setActiveType] = useState<EntryType>('credit')
  const [payee, setPayee] = useState('')
  const [date, setDate] = useState(today())
  const [displayDate] = useState(fmtDate())
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

  useEffect(() => {
    localStorage.setItem('cashcount-history', JSON.stringify(history))
  }, [history])

  const [saved, setSaved] = useState(false)

  // Theme state
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => {
    const stored = localStorage.getItem('cashcount-theme') as Theme | null
    if (stored === 'light' || stored === 'dark') setTheme(stored)
  }, [])
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('cashcount-theme', next)
  }

  // Load shared data from URL on mount
  // URL format: ?c=500.3-200.5-100.2&t=credit&p=John&n=note&dt=03-06-26&a=1500
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const denomStr = params.get('c')
    if (denomStr) {
      try {
        // Parse compact denomination format: "500.3-200.5-100.2"
        const newCounts: Record<number, number> = Object.fromEntries(DENOMS.map(d => [d, 0]))
        denomStr.split('-').forEach(pair => {
          const [denom, count] = pair.split('.')
          const d = parseInt(denom), cnt = parseInt(count)
          if (!isNaN(d) && !isNaN(cnt)) newCounts[d] = cnt
        })
        setCounts(newCounts)

        const t = params.get('t') as EntryType | null
        if (t) setActiveType(t)
        const p = params.get('p')
        if (p && p !== 'Unnamed') setPayee(decodeURIComponent(p))
        const n = params.get('n')
        if (n) setNote(decodeURIComponent(n))
        const dt = params.get('dt')
        if (dt) setDate(dt)
        const a = params.get('a')
        if (t === 'online' && a) setOnlineAmt(a)

        setTab('counter')
        // Clean up the URL without reload
        window.history.replaceState({}, '', window.location.pathname)
      } catch (err) {
        console.error('Failed to load shared data:', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculator state
  const [calcDisp, setCalcDisp] = useState('0')
  const [calcPrev, setCalcPrev] = useState<number | null>(null)
  const [calcOp, setCalcOp] = useState<string | null>(null)
  const [calcNew, setCalcNew] = useState(true)

  const cashTotal = DENOMS.reduce((s, d) => s + d * (counts[d] || 0), 0)
  const total = activeType === 'online' ? (parseFloat(onlineAmt) || 0) : cashTotal
  const noteCount = DENOMS.reduce((s, d) => s + (counts[d] || 0), 0)
  const netBal = history.reduce((s, e) => e.type === 'credit' ? s + e.amount : e.type === 'debit' ? s - e.amount : s, 0)

  const handleCount = useCallback((denom: number, val: number) => setCounts(p => ({ ...p, [denom]: val })), [])

  const handleClear = () => {
    setCounts(Object.fromEntries(DENOMS.map(d => [d, 0])))
    setPayee('')
    setNote('')
    setOnlineAmt('')
    setSaved(false)
  }

  const handleSave = () => {
    setHistory(p => [{ id: Date.now().toString(), payee: payee || 'Unnamed', date, type: activeType, amount: total, denominations: { ...counts }, note }, ...p])
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      handleClear()
    }, 2000)
  }

  const loadEntry = (entry: Entry) => {
    // Populate counter with the history entry's data
    setCounts({ ...Object.fromEntries(DENOMS.map(d => [d, 0])), ...entry.denominations })
    setActiveType(entry.type)
    setPayee(entry.payee === 'Unnamed' ? '' : entry.payee)
    setNote(entry.note || '')
    if (entry.type === 'online') setOnlineAmt(String(entry.amount))
    setDate(entry.date)
    setTab('counter')
    // Brief visual feedback: scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

    // Build compact URL: ?c=500.3-200.5&t=credit&p=John&dt=03-06-26
    const denomParts = DENOMS.filter(d => (counts[d] || 0) > 0)
      .map(d => `${d}.${counts[d]}`)
      .join('-')
    const urlParams = new URLSearchParams()
    if (denomParts) urlParams.set('c', denomParts)
    urlParams.set('t', activeType)
    if (payee) urlParams.set('p', payee)
    if (note) urlParams.set('n', note)
    urlParams.set('dt', date)
    if (activeType === 'online') urlParams.set('a', String(total))
    const editUrl = `https://cash-count.vercel.app/?${urlParams.toString()}`

    const msg = [
      `*CashCount Summary*`,
      `*Date*: ${date}`,
      '',
      denomLines || '(No denominations)',
      '',
      `━━━━━━━━━━━━━━━`,
      `*Total*: ₹${fmt(total)}`,
      `*In words*: ${toWords(total)}`,
      '',
      `✏️ Edit → ${editUrl}`,
      '',
      `_Shared from CashCount_`,
      '',
      `App link → https://cash-count.vercel.app/`,
      ' ',
    ].join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="relative min-h-screen pb-24 font-sans overflow-x-hidden text-white">
      {/* ── Background Effects ── */}
      <div className="gradient-blob blob-1"></div>
      <div className="gradient-blob blob-2"></div>

      {/* ── Floating Header ── */}
      <div className="sticky top-0 z-40 px-4 py-3 max-w-[800px] mx-auto">
        <header className="header-glass px-5 py-3 flex items-center justify-between">
          <h1 className="heading">CashCount</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>
            <div className="date-badge">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{displayDate}</span>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-[800px] mx-auto w-full px-4 sm:px-6 space-y-6">

        {/* ── Segmented Navigation ── */}
        <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/5 h-[58px]">
          {(['counter', 'history', 'calculator'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full font-semibold text-[15px] capitalize transition-all duration-300 ${tab === t ? 'nav-segment-active' : 'nav-segment-inactive hover:opacity-100 hover:bg-white/5'}`}
            >
              {t === 'counter' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              {t === 'history' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {t === 'calculator' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
              <span className="text-[13px]">{t}</span>
            </button>
          ))}
        </div>

        {/* ── COUNTER TAB ── */}
        {tab === 'counter' && (
          <div className="animate-slide-up space-y-6">

            {/* Summary Glass Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 flex flex-col justify-between h-[100px] ">
                <div className="flex items-center gap-2">
                  <div className="icon-badge icon-badge-notes">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="card-label">Notes</span>
                </div>
                <p className="display-number break-all leading-tight text-[18px] sm:text-[24px]">{noteCount}</p>
              </div>

              {/* <div className="glass-card p-4 flex flex-col justify-between h-[100px]">
                <div className="flex items-center gap-2">
                  <div className="icon-badge icon-badge-cash">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="card-label">Cash Total</span>
                </div>
                <p className="display-number break-all leading-tight text-[16px] sm:text-[24px]">₹{fmt(cashTotal)}</p>
              </div> */}

              <div className="glass-card p-4 flex flex-col justify-between h-[100px]">
                <div className="flex items-center gap-2">
                  <div className="icon-badge icon-badge-total">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <span className="card-label">Total</span>
                </div>
                <p className="display-number break-all leading-tight text-[16px] sm:text-[24px]" style={{ color: 'var(--accent-total)' }}>₹{fmt(total)}</p>
              </div>
            </div>

            {/* List Headers */}
            <div className="flex px-4 pt-2">
              <span className="w-1/3 column-header">Denomination</span>
              <span className="w-1/3 column-header text-center">Count</span>
              <span className="w-1/3 column-header text-right">Amount</span>
            </div>

            {/* Denomination Independent Rows */}
            <div className="space-y-2">
              {DENOMS.map((d, i) => (
                <DenomRow key={d} d={d} c={counts[d] || 0} onChange={v => handleCount(d, v)} i={i} />
              ))}
            </div>

            {/* Amount in Words */}
            <div className="words-card px-5 py-6 border border-[var(--glass-border)] shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="icon-badge" style={{ background: 'var(--words-icon-bg)', color: 'var(--words-icon-color)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="card-label">Amount in Words</p>
                  <p className="font-bold text-[20px] leading-tight tracking-tight" style={{ color: 'var(--words-text)' }}>{toWords(total)}</p>
                </div>
              </div>
            </div>

            {/* Premium Bottom Action Bar */}
            <div className="grid grid-cols-4 gap-4 pt-4">
              <button
                onClick={handleClear}
                className="btn-ghost py-4 flex items-center justify-center gap-2 text-[18px] font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="hidden sm:inline">Clear</span>
              </button>

              <button
                onClick={handleSave}
                disabled={total === 0}
                className={`col-span-2 btn-primary py-4 cta-button flex items-center justify-center gap-2 ${saved ? 'bg-green-500 from-[#22C55E] to-[#16A34A] shadow-[0_12px_40px_rgba(34,197,94,0.45)]' : 'disabled:opacity-40 disabled:scale-100 disabled:shadow-none'}`}
              >
                {saved ? (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save Entry
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsApp}
                disabled={total === 0}
                className="btn-share py-4 flex items-center justify-center gap-2 text-[18px] font-semibold disabled:opacity-40 disabled:scale-100"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div className="animate-slide-up space-y-5">
            <div className="glass-card p-6 text-center border-t-2" style={{ borderTopColor: netBal >= 0 ? 'var(--history-border-positive)' : 'var(--history-border-negative)' }}>
              <p className="card-label mb-2 text-white/50">Net Balance</p>
              <p className="font-bold text-[48px] leading-tight tracking-tight">₹{fmt(Math.abs(netBal))}</p>
              <p className="meta-text mt-2">{history.length} transaction{history.length !== 1 ? 's' : ''}</p>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-24 glass-card border-dashed">
                <p className="text-5xl mb-4 opacity-50">📋</p>
                <p className="font-semibold text-xl text-slate-300">No transactions yet</p>
                <p className="text-slate-500 mt-2">Start counting cash in the Counter tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(e => <HistoryItem key={e.id} entry={e} onDelete={() => setHistory(p => p.filter(x => x.id !== e.id))} onLoad={() => loadEntry(e)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── CALCULATOR TAB ── */}
        {tab === 'calculator' && (
          <div className="animate-slide-up glass-card overflow-hidden max-w-[400px] mx-auto">
            <div className="calc-display px-6 py-10 text-right">
              <p className="text-lg h-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{calcPrev !== null ? `${calcPrev} ${calcOp}` : ''}</p>
              <p className="font-bold text-[56px] mt-2 truncate tracking-tight" style={{ color: 'var(--text-primary)' }}>{calcDisp}</p>
            </div>
            <div className="p-5 space-y-4">
              {calcBtns.map((row, ri) => (
                <div key={ri} className="grid gap-4 grid-cols-4">
                  {row.map(btn => {
                    const isOp = '÷×−+='.includes(btn); const isFn = ['AC', '+/−', '%'].includes(btn); const isZero = btn === '0'
                    let btnStyle = 'calc-btn-num'
                    if (isOp) btnStyle = btn === '=' ? 'btn-primary' : 'calc-btn-op'
                    if (isFn) btnStyle = 'calc-btn-fn'

                    return (
                      <button
                        key={btn}
                        onClick={() => {
                          if (btn === 'AC') { setCalcDisp('0'); setCalcPrev(null); setCalcOp(null); setCalcNew(true) }
                          else if (btn === '+/−') setCalcDisp(d => String(-parseFloat(d)))
                          else if (btn === '%') setCalcDisp(d => String(parseFloat(d) / 100))
                          else if (btn === '=') calcEquals()
                          else if (isOp) calcOperator(btn)
                          else if (btn === '.') { if (!calcDisp.includes('.')) { setCalcDisp(d => calcNew ? '0.' : d + '.'); setCalcNew(false) } }
                          else calcInput(btn)
                        }}
                        className={`${isZero ? 'col-span-2' : ''} h-[60px] rounded-[20px] font-semibold text-[24px] transition-all duration-200 shadow-sm flex items-center justify-center ${btnStyle}`}
                      >
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
      <footer className="max-w-[800px] mx-auto w-full px-6 pt-12">
        <div className="footer-section pt-6">
          <p className="text-[11px] leading-relaxed text-center">
            All Indian Rupee currency images used on this site are for illustrative cash-counting purposes only. The copyright and intellectual property rights for the banknote designs belong entirely to the Reserve Bank of India (RBI).
          </p>
        </div>
        <p className="text-[11px] text-center font-medium mt-4" style={{ color: 'var(--footer-text)' }}>
          © 2026 Mhd Gouse. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

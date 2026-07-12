'use client'

import { useState, useCallback } from 'react'

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  createdAt: string
  clicks: number
}

export default function UrlShortenerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<ShortenedUrl[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [latestShort, setLatestShort] = useState<ShortenedUrl | null>(null)

  const isValidUrl = (str: string) => {
    try {
      const u = new URL(str)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  const shortenUrl = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setLoading(true)
    setError('')
    setLatestShort(null)

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to shorten URL')
      }

      const data: ShortenedUrl = await res.json()
      setLatestShort(data)
      setHistory(prev => [data, ...prev])
      setUrl('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [url])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') shortenUrl()
  }

  return (
    <div className="shortener-page">
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="shortener-container">
        {/* Header */}
        <div className="shortener-header">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1>URL Shortener</h1>
          <p className="subtitle">Transform long URLs into short, shareable links</p>
        </div>

        {/* Input Area */}
        <div className="input-card">
          <div className="input-group">
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <input
                id="url-input"
                type="url"
                placeholder="Paste your long URL here..."
                value={url}
                onChange={e => { setUrl(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                className={error ? 'input-error' : ''}
                autoComplete="off"
              />
            </div>
            <button
              id="shorten-btn"
              onClick={shortenUrl}
              disabled={loading}
              className="shorten-btn"
            >
              {loading ? (
                <span className="btn-loader" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                  Shorten
                </>
              )}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {/* Result Card */}
        {latestShort && (
          <div className="result-card animate-in">
            <div className="result-label">Your shortened URL</div>
            <div className="result-url-row">
              <a
                href={latestShort.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="result-link"
              >
                {latestShort.shortUrl}
              </a>
              <button
                className={`copy-btn ${copiedId === latestShort.id ? 'copied' : ''}`}
                onClick={() => copyToClipboard(latestShort.shortUrl, latestShort.id)}
              >
                {copiedId === latestShort.id ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="result-original">
              <span className="result-original-label">Original:</span>
              <span className="result-original-url">{latestShort.originalUrl}</span>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="history-section">
            <h2 className="history-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Recent Links
            </h2>
            <div className="history-list">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className="history-item"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="history-item-top">
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="history-short"
                    >
                      {item.shortUrl}
                    </a>
                    <button
                      className={`copy-btn-sm ${copiedId === item.id + '-h' ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(item.shortUrl, item.id + '-h')}
                      title="Copy"
                    >
                      {copiedId === item.id + '-h' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="history-original">{item.originalUrl}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="footer-note">
          Links are stored in memory and will reset on server restart.
        </p>
      </div>

      <style jsx>{`
        /* ======= PAGE ======= */
        .shortener-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          background: #06090f;
          font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
        }

        /* Animated background orbs */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6366f1, transparent 70%);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #06b6d4, transparent 70%);
          bottom: -100px; right: -80px;
          animation-delay: -7s;
        }
        .bg-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #a855f7, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        /* ======= CONTAINER ======= */
        .shortener-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
        }

        /* ======= HEADER ======= */
        .shortener-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px; height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%);
          color: #fff;
          margin-bottom: 16px;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
        }
        .shortener-header h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 40%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
        }

        /* ======= INPUT CARD ======= */
        .input-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 4px 40px rgba(0,0,0,0.3);
        }
        .input-group {
          display: flex;
          gap: 12px;
        }
        .input-wrapper {
          flex: 1;
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          pointer-events: none;
        }
        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 14px;
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          background: rgba(15, 23, 42, 0.6);
          color: #e2e8f0;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .input-wrapper input::placeholder {
          color: #475569;
        }
        .input-wrapper input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .input-wrapper input.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .shorten-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.15s, box-shadow 0.25s, opacity 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
        }
        .shorten-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5);
        }
        .shorten-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .shorten-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loader {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-msg {
          margin: 12px 0 0;
          font-size: 0.85rem;
          color: #f87171;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .error-msg::before {
          content: '⚠';
          font-size: 0.9rem;
        }

        /* ======= RESULT CARD ======= */
        .result-card {
          margin-top: 20px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 4px 40px rgba(0,0,0,0.2);
        }
        .result-card.animate-in {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #10b981;
          margin-bottom: 12px;
        }
        .result-url-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .result-link {
          flex: 1;
          font-size: 1.1rem;
          font-weight: 600;
          color: #a5b4fc;
          text-decoration: none;
          word-break: break-all;
          transition: color 0.2s;
        }
        .result-link:hover {
          color: #c7d2fe;
          text-decoration: underline;
        }
        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 12px;
          border: 1.5px solid rgba(99,102,241,0.25);
          background: rgba(99,102,241,0.1);
          color: #a5b4fc;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .copy-btn:hover {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.4);
        }
        .copy-btn.copied {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.1);
          color: #34d399;
        }

        .result-original {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(148,163,184,0.1);
          font-size: 0.82rem;
          color: #64748b;
          display: flex;
          gap: 8px;
          align-items: baseline;
        }
        .result-original-label {
          flex-shrink: 0;
          font-weight: 600;
          color: #94a3b8;
        }
        .result-original-url {
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* ======= HISTORY ======= */
        .history-section {
          margin-top: 32px;
        }
        .history-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 700;
          color: #cbd5e1;
          margin: 0 0 16px;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .history-item {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(99,102,241,0.1);
          border-radius: 14px;
          padding: 16px 18px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: slideUp 0.35s ease-out backwards;
          transition: border-color 0.2s;
        }
        .history-item:hover {
          border-color: rgba(99,102,241,0.25);
        }
        .history-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .history-short {
          font-size: 0.92rem;
          font-weight: 600;
          color: #a5b4fc;
          text-decoration: none;
          transition: color 0.2s;
        }
        .history-short:hover {
          color: #c7d2fe;
          text-decoration: underline;
        }
        .copy-btn-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,0.2);
          background: rgba(99,102,241,0.08);
          color: #818cf8;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .copy-btn-sm:hover {
          background: rgba(99,102,241,0.18);
          border-color: rgba(99,102,241,0.35);
        }
        .copy-btn-sm.copied {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.1);
          color: #34d399;
        }
        .history-original {
          margin: 8px 0 0;
          font-size: 0.8rem;
          color: #475569;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ======= FOOTER ======= */
        .footer-note {
          text-align: center;
          margin-top: 32px;
          font-size: 0.75rem;
          color: #334155;
        }

        /* ======= RESPONSIVE ======= */
        @media (max-width: 520px) {
          .input-group {
            flex-direction: column;
          }
          .shorten-btn {
            justify-content: center;
          }
          .shortener-header h1 {
            font-size: 1.6rem;
          }
          .result-url-row {
            flex-direction: column;
            align-items: stretch;
          }
          .copy-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'

// In-memory URL store (persists as long as the server is running)
// Using a global variable to survive hot reloads in development
const globalStore = globalThis as typeof globalThis & {
  __urlStore?: Map<string, { originalUrl: string; createdAt: string; clicks: number }>
}

if (!globalStore.__urlStore) {
  globalStore.__urlStore = new Map()
}

const urlStore = globalStore.__urlStore

/**
 * Generate a random alphanumeric string of length 6
 */
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Ensure the code is unique
 */
function generateUniqueCode(): string {
  let code = generateShortCode()
  let attempts = 0
  while (urlStore.has(code) && attempts < 100) {
    code = generateShortCode()
    attempts++
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Check if URL was already shortened
    for (const [code, entry] of urlStore.entries()) {
      if (entry.originalUrl === url) {
        const origin = request.nextUrl.origin
        return NextResponse.json({
          id: code,
          originalUrl: url,
          shortCode: code,
          shortUrl: `${origin}/${code}`,
          createdAt: entry.createdAt,
          clicks: entry.clicks,
        })
      }
    }

    // Generate new short code
    const shortCode = generateUniqueCode()
    const origin = request.nextUrl.origin
    const createdAt = new Date().toISOString()

    urlStore.set(shortCode, {
      originalUrl: url,
      createdAt,
      clicks: 0,
    })

    return NextResponse.json({
      id: shortCode,
      originalUrl: url,
      shortCode,
      shortUrl: `${origin}/${shortCode}`,
      createdAt,
      clicks: 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: List all shortened URLs (optional utility)
export async function GET() {
  const urls = Array.from(urlStore.entries()).map(([code, entry]) => ({
    shortCode: code,
    ...entry,
  }))

  return NextResponse.json({ urls, total: urls.length })
}

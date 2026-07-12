import { NextRequest, NextResponse } from 'next/server'

// Access the same global store used by the shorten API
const globalStore = globalThis as typeof globalThis & {
  __urlStore?: Map<string, { originalUrl: string; createdAt: string; clicks: number }>
}

if (!globalStore.__urlStore) {
  globalStore.__urlStore = new Map()
}

const urlStore = globalStore.__urlStore

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params

  // Only handle 6-character alphanumeric codes (the URL shortener format)
  if (!/^[A-Za-z0-9]{6}$/.test(shortCode)) {
    // Not a short URL code — return 404
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  const entry = urlStore.get(shortCode)

  if (!entry) {
    return NextResponse.json(
      { error: 'Short URL not found' },
      { status: 404 }
    )
  }

  // Increment click count
  entry.clicks++

  // Redirect to the original URL
  return NextResponse.redirect(entry.originalUrl, 302)
}

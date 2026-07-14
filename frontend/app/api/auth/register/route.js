import { NextResponse } from 'next/server'
import { backendFetch, parseBackendError } from '@/app/lib/backend'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let res, data
  try {
    ;({ res, data } = await backendFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }))
  } catch (err) {
    console.error('[register]', err.message)
    return NextResponse.json(
      { error: 'Cannot connect to backend. Make sure it is running.' },
      { status: 502 }
    )
  }

  if (!res.ok) {
    return NextResponse.json({ error: parseBackendError(data, 'Registration failed') }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}

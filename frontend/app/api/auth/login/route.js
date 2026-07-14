import { cookies } from 'next/headers'
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
    ;({ res, data } = await backendFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }))
  } catch (err) {
    console.error('[login]', err.message)
    return NextResponse.json(
      { error: 'Cannot connect to backend. Make sure it is running.' },
      { status: 502 }
    )
  }

  if (!res.ok) {
    return NextResponse.json({ error: parseBackendError(data, 'Invalid credentials') }, { status: res.status })
  }

  try {
    const cookieStore = await cookies()
    cookieStore.set('session', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30,
    })
  } catch (err) {
    console.error('[login] cookie error:', err.message)
    return NextResponse.json({ error: 'Session could not be created' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

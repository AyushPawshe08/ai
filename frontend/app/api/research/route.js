import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch, parseBackendError } from '@/app/lib/backend'

export async function POST(request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let res, data
  try {
    ;({ res, data } = await backendFetch('/research/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }))
  } catch (err) {
    console.error('[research]', err.message)
    return NextResponse.json({ error: 'Cannot reach backend' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: parseBackendError(data, 'Research failed') }, { status: res.status })
  }

  return NextResponse.json(data)
}

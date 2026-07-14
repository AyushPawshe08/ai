import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch, parseBackendError } from '@/app/lib/backend'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  let res, data
  try {
    ;({ res, data } = await backendFetch('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }))
  } catch (err) {
    console.error('[me]', err.message)
    return NextResponse.json({ error: 'Cannot reach backend' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: parseBackendError(data, 'Unauthorized') }, { status: res.status })
  }

  return NextResponse.json(data)
}

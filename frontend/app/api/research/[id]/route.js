import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch, parseBackendError } from '@/app/lib/backend'

export async function GET(request, { params }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params

  let res, data
  try {
    ;({ res, data } = await backendFetch(`/research/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }))
  } catch (err) {
    console.error('[research/id]', err.message)
    return NextResponse.json({ error: 'Cannot reach backend' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: parseBackendError(data, 'Research not found') }, { status: res.status })
  }

  return NextResponse.json(data)
}

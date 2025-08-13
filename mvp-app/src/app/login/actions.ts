'use server'

import { redirect } from 'next/navigation'
import { createUser, startSession, verifyUser, endSession } from '@/lib/auth'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const user = verifyUser(email, password)
  if (!user) {
    return redirect('/login?message=Could not authenticate user')
  }
  await startSession(user.id)
  return redirect('/')
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const user = createUser(email, password)
  await startSession(user.id)
  return redirect('/')
}

export async function logout() {
  await endSession()
  return redirect('/login?message=Signed out')
}

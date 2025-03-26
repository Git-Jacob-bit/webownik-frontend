'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

function FormWithSearchParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (password !== confirmPassword) {
      setError("Hasła się nie zgadzają.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("new_password", password)

      const res = await fetch(
        `http://localhost:8000/users/reset-password?token=${token}`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      if (res.ok) {
        setMessage("Hasło zostało zmienione. Przekierowanie...")
        setTimeout(() => router.push("/login"), 2000)
      } else {
        setError(data.detail || "Wystąpił błąd.")
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
      {message && <p className="text-green-500 text-sm mb-2 text-center">{message}</p>}
      <input
        type="password"
        placeholder="Nowe hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
        required
      />
      <input
        type="password"
        placeholder="Powtórz hasło"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4 dark:bg-zinc-700 dark:border-zinc-600"
        required
      />
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
        Zmień hasło
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">🔒 Ustaw nowe hasło</h2>
        <Suspense fallback={<div>Ładowanie formularza...</div>}>
          <FormWithSearchParams />
        </Suspense>
      </div>
    </main>
  )
}

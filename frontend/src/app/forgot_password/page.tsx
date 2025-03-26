"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setToken("");

    const formData = new FormData();
    formData.append("email", email);

    try {
      const res = await fetch("http://localhost:8000/users/password-reset-request", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.reset_token);
        setMessage("Wysłano link resetujący hasło!");
      } else {
        setMessage(data.detail || "Wystąpił błąd");
      }
    } catch (err) {
      setMessage("Błąd połączenia z serwerem.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">🔐 Resetowanie hasła</h2>
        {message && <p className="mb-4 text-center text-sm">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Twój adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4 dark:bg-zinc-700 dark:border-zinc-600"
          />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
            Wyślij link resetujący
          </button>
        </form>
      </div>
    </main>
  );
}

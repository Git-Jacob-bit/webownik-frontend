"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("https://webownik-backend.onrender.com/users/token/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
      } else {
        setError(data.detail || "Błąd logowania");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Zaloguj się</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
          />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
            Zaloguj
          </button>
        </form>
        <p className="text-center mt-4">
          Nie masz konta?{" "}
          <a href="/register" className="text-blue-500 underline">
            Zarejestruj się
          </a>
        </p>

        <p className="text-center mt-2">
          <a href="/forgot_password" className="text-blue-500 underline">
            Nie pamiętasz hasła?
          </a>
        </p>

      </div>
    </main>
  );

}

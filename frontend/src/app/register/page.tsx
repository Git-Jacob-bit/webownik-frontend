"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Hasła się nie zgadzają!");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost:8000/users/register/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Rejestracja zakończona sukcesem! Przekierowanie...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.detail || "Błąd rejestracji");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Zarejestruj się</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
            required
          />
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
            required
          />
          <input
            type="password"
            placeholder="Potwierdź hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
            required
          />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
            Zarejestruj
          </button>
        </form>
        <p className="text-center mt-4">
          Masz już konto?{" "}
          <a href="/login" className="text-blue-500 underline">
            Zaloguj się
          </a>
        </p>
      </div>
    </main>
  );


}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isRealAdmin } from "@/lib/auth";
import Link from "next/link";

interface User {
  username: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8000/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (!data.username) {
          throw new Error("Invalid user data");
        }
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token"); // Usunięcie tokena po błędzie
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <p className="text-center text-white mt-10">Ładowanie...</p>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Witaj, {user?.username}!
        </h2>

        {/* PRZYCISK PRZEKIEROWUJĄCY NA STRONĘ PRZESYŁANIA PLIKÓW */}
        <button
          onClick={() => router.push("/upload")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-4"
        >
          Zarządzanie bazami pytań
        </button>

        {/* PRZYCISK PRZEKIEROWUJĄCY NA STRONĘ QUIZU */}
        <button
          onClick={() => router.push("/quiz")}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mb-4"
        >
          Rozpocznij testownikowanie
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Wyloguj
        </button>
        {isRealAdmin() && (
          <Link href="/admin/users" className="text-blue-500 underline">
            Panel administratora
          </Link>
        )}
      </div>
    </main>
  );

}

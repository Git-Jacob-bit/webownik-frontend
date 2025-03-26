"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SummaryPage() {
  const router = useRouter();
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Pobierz dane z localStorage po zakończeniu quizu
    const c = localStorage.getItem("correctCount");
    const w = localStorage.getItem("wrongCount");
    const t = localStorage.getItem("totalTime");

    setCorrect(c ? parseInt(c) : 0);
    setWrong(w ? parseInt(w) : 0);
    setTime(t ? parseInt(t) : 0);
  }, []);

  const total = correct + wrong;
  const percent = total ? Math.round((correct / total) * 100) : 0;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">📊 Podsumowanie quizu</h2>

        <p className="text-lg mb-2">✅ Poprawne odpowiedzi: <strong>{correct}</strong></p>
        <p className="text-lg mb-2">❌ Błędne odpowiedzi: <strong>{wrong}</strong></p>
        <p className="text-lg mb-2">🕒 Czas: <strong>{time}s</strong></p>
        <p className="text-lg mb-6">🎯 Wynik: <strong>{percent}%</strong></p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/quiz")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Powrót
          </button>
        </div>
      </div>
    </main>
  );

}

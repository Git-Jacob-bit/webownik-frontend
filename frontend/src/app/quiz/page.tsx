"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // NOWY STAN NA KOMUNIKATY
  const [activeDataset, setActiveDataset] = useState<string | null>(null);


  useEffect(() => {
    fetchDatasets();
    fetchQuizStatus();
  }, []);

  // Auto-usuwanie błędów po 3 sekundach
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000); // Usuwa komunikat po 3s
      return () => clearTimeout(timer); // Czyszczenie timera przy kolejnym błędzie
    }
  }, [error]);

  // Auto-usuwanie komunikatu po 3 sekundach
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchDatasets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://webownik-backend.onrender.com/datasets/datasets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets || []);
      } else {
        setError("Nie udało się pobrać listy baz.");
      }
    } catch (error) {
      setError("Błąd połączenia z serwerem.");
    }
  };

  const fetchQuizStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://webownik-backend.onrender.com/quiz/quiz/status/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.quiz_active) {
        setActiveDataset(data.dataset_name); // 👈 zakładamy, że backend zwraca dataset_name
      } else {
        setActiveDataset(null);
      }
    } catch (error) {
      console.error("Błąd pobierania statusu quizu:", error);
    }
  };


  const startQuiz = async () => {
    if (!selectedDataset) {
      setError("Wybierz bazę przed rozpoczęciem sesji.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Sprawdzanie czy sesja quizu już trwa
      const statusRes = await fetch("https://webownik-backend.onrender.com/quiz/quiz/status/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const statusData = await statusRes.json();
      if (statusData.quiz_active) {
        setError("Sesja już trwa. Zresetuj ją przed rozpoczęciem nowej.");
        return;
      }

      // Resetowanie zaznaczenia bazy
      setSelectedDataset(null);

      const res = await fetch(`https://webownik-backend.onrender.com/quiz/quiz/?dataset_name=${encodeURIComponent(selectedDataset)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Odpowiedź backendu:", data);
        setMessage("Testownikowanie rozpoczęte")
        localStorage.removeItem("correctCount");
        localStorage.removeItem("wrongCount");
        localStorage.removeItem("totalTime"); // (jeśli też resetujesz czas)
        router.push(`/next/?dataset_name=${selectedDataset}`);
      } else {
        console.error("❌ Błąd backendu:", data);
        setError(data.detail || "Nie udało się rozpocząć sesji.");
      }
    } catch (error) {
      console.error("🚨 Błąd połączenia:", error);
      setError("Błąd połączenia z serwerem.");
    }
  };

  const continueQuiz = async () => {

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const statusRes = await fetch("https://webownik-backend.onrender.com/quiz/quiz/status/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const statusData = await statusRes.json();
      if (!statusData.quiz_active) {
        setError("Brak aktywnej sesji do kontynuacji.");
        return;
      }

      router.push(`/next/?dataset_name=${selectedDataset}`);
    } catch (error) {
      setError("Błąd połączenia z serwerem.");
    }
  };


  const resetQuiz = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://webownik-backend.onrender.com/quiz/quiz/reset/", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        console.log("✅ Sesja została zresetowana");
        setMessage("Sesja została zresetowana")
        fetchDatasets();
        fetchQuizStatus();
      } else {
        setError("Nie udało się zresetować sesji.");
      }
    } catch (error) {
      console.error("🚨 Błąd połączenia:", error);
      setError("Błąd połączenia z serwerem.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-lg w-full relative flex flex-col">
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Powrót do Dashboardu
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Wybierz bazę i rozpocznij quiz</h2>
        {activeDataset && (
          <p className="text-sm text-blue-400 text-center mb-2">
            🔄 Trwa aktywna sesja: <strong>{activeDataset}</strong>
          </p>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-500 text-center">{message}</p>}

        {datasets.length > 0 ? (
          <ul className="mt-4 border rounded dark:border-zinc-600">
            {datasets.map((dataset) => (
              <li
                key={dataset}
                className="flex justify-between items-center p-3 border-b dark:border-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <span
                  onClick={() =>
                    setSelectedDataset(selectedDataset === dataset ? null : dataset)
                  }
                  className={`cursor-pointer ${selectedDataset === dataset ? "text-blue-500 font-bold" : ""
                    }`}
                >
                  {dataset}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-center">Brak dostępnych baz.</p>
        )}

        <button
          onClick={startQuiz}
          className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600"
        >
          Start
        </button>
        <button
          onClick={continueQuiz}
          className="w-full bg-blue-500 text-white py-2 rounded mt-2 hover:bg-blue-600"
        >
          Kontynuuj
        </button>
        <button
          onClick={resetQuiz}
          className="w-full bg-red-500 text-white py-2 rounded mt-2 hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </main>
  );

}
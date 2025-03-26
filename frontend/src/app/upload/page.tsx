"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [datasetName, setDatasetName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [datasets, setDatasets] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

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

      if (res.status === 401) {
        localStorage.removeItem("token"); // Usuń wygasły token
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Błąd pobierania baz danych.");

      const data = await res.json();
      setDatasets(data.datasets || []);
    } catch (error) {
      setMessage("❌ Błąd połączenia z serwerem.");
    }
  };

  const toggleQuestions = async (dataset: string) => {
    if (expandedDataset === dataset) {
      setExpandedDataset(null);
      setQuestions([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`https://webownik-backend.onrender.com/datasets/questions/${dataset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Błąd pobierania pytań.");

      const data = await res.json();
      setQuestions(data.questions || []);
      setExpandedDataset(dataset);
    } catch (error) {
      setMessage("❌ Błąd połączenia z serwerem.");
    }
  };

  const toggleAnswers = (questionId: number) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!datasetName || !files) {
      setMessage("Wybierz nazwę zestawu i pliki.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("dataset_name", datasetName);
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("https://webownik-backend.onrender.com/questions/upload-folder/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("❌ Nie udało się przesłać plików.");

      const data = await res.json();
      setMessage(`✅ ${data.message} (${data.count} plików przesłano)`);
      setDatasetName("");
      setFiles(null);
      fetchDatasets();
    } catch (error) {
      setMessage("❌ Błąd połączenia z serwerem.");
    }
  };

  const deleteDataset = async (name: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`https://webownik-backend.onrender.com/datasets/datasets/${name}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("❌ Błąd usuwania bazy.");

      fetchDatasets();
      if (expandedDataset === name) {
        setQuestions([]);
        setExpandedDataset(null);
      }
    } catch (error) {
      setMessage("❌ Błąd połączenia z serwerem.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-3xl w-full relative">

        {/* Przycisk powrotu */}
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-transform active:scale-95"
        >
          Powrót
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Zarządzaj bazami</h2>

        {/* Formularz przesyłania plików */}
        <form onSubmit={handleFileUpload} className="mb-4">
          <input
            type="text"
            placeholder="Nazwa zestawu pytań"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            className="w-full p-2 border rounded mb-2 dark:bg-zinc-700 dark:border-zinc-600"
            required
          />

          <div className="flex items-center space-x-3">
            <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition">
              Wybierz pliki
              <input
                type="file"
                multiple
                name="fileUpload"
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
                required
              />
            </label>

            <div className="border px-4 py-2 rounded text-gray-700 dark:text-white bg-gray-100 dark:bg-zinc-700 min-w-[50px] text-center">
              {files ? files.length : 0}
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Prześlij
            </button>
          </div>
        </form>

        {/* Lista baz pytań */}
        {datasets.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600">
            <p className="font-semibold">Dostępne zestawy (kliknij, aby zobaczyć pytania):</p>
            <ul>
              {datasets.map((name) => (
                <li
                  key={name}
                  className="p-2 border-b dark:border-zinc-600 cursor-pointer flex justify-between items-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                  onClick={() => toggleQuestions(name)}
                >
                  <span
                    className={`cursor-pointer transition-all duration-200 ${expandedDataset === name ? "text-blue-500 font-bold" : ""
                      }`}
                  >
                    {name}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDataset(name);
                    }}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lista pytań i odpowiedzi */}
        {expandedDataset && questions.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600 animate-fade-in">
            <p className="font-semibold text-lg">Pytania w bazie "{expandedDataset}":</p>
            <ul className="space-y-2">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="p-3 border-b dark:border-zinc-600 bg-white dark:bg-zinc-800 rounded shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-150"
                  onClick={() => toggleAnswers(q.id)}
                >
                  <span className="font-semibold">{q.question_text}</span>

                  {expandedQuestion === q.id && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded animate-fade-in">
                      <p className="text-sm font-semibold">Odpowiedzi:</p>
                      {q.answers?.map((answer: any, index: number) => (
                        <p
                          key={index}
                          className={`text-sm p-1 rounded ${answer.is_correct ? "bg-green-300 dark:bg-green-600" : ""
                            }`}
                        >
                          {index + 1}. {answer.text}
                        </p>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );

}

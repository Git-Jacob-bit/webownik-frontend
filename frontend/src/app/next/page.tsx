"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";


export default function QuizPage() {
    const router = useRouter();
    const [question, setQuestion] = useState<{ id: number; question_text: string; answers: { id: number; text: string }[] } | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{ correct: boolean; quiz_finished?: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
    const [time, setTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
    const [datasetName, setDatasetName] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get("dataset_name");
        if (name) {
            setDatasetName(decodeURIComponent(name));
        }
    }, []);

    useEffect(() => {
        fetchNextQuestion();
        fetchQuizStatus();
    }, []);

    const fetchNextQuestion = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/quiz/quiz/next/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (typeof data.remaining_questions === "number") {
                setRemainingQuestions(data.remaining_questions);
            }
            if (data.finished) {
                router.push("/summary");
            } else {
                // 🔀 tasujemy odpowiedzi lokalnie
                const shuffleArray = <T,>(array: T[]): T[] => {
                    const shuffled = [...array];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    return shuffled;
                };

                setQuestion({
                    ...data,
                    answers: shuffleArray(data.answers),
                });

                setSelectedAnswers([]);
                setFeedback(null);
                if (intervalRef.current) clearInterval(intervalRef.current);

                intervalRef.current = setInterval(() => {
                    setTime((prev) => prev + 1);
                }, 1000);

            }

        } catch (error) {
            console.error("Błąd pobierania pytania:", error);
            setError("Błąd pobierania pytania.");
        }
        setLoading(false);
    };

    const fetchQuizStatus = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        try {
            const res = await fetch("http://127.0.0.1:8000/quiz/quiz/status/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (typeof data.remaining_questions === "number") {
                setRemainingQuestions(data.remaining_questions);
            }
        } catch (error) {
            console.error("Błąd pobierania statusu quizu:", error);
        }
    };


    const handleAnswerClick = (answerId: number) => {
        if (!feedback) {
            setSelectedAnswers((prev) =>
                prev.includes(answerId)
                    ? prev.filter((id) => id !== answerId)
                    : [...prev, answerId]
            );
        }
    };

    const submitAnswer = async () => {
        if (!question || typeof question.id !== "number") {
            console.error("❌ Błąd: `question_id` nie jest liczbą lub nie istnieje.", question);
            setError("Błąd: `question_id` nie jest poprawny.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Błąd: Brak tokena.");
            setError("Błąd: Brak tokena.");
            router.push("/login")
            return;
        }

        // Zapewniamy, że `answers` to tablica liczb
        const validAnswers = Array.isArray(selectedAnswers) ? selectedAnswers.filter(a => typeof a === "number") : [];

        if (!Array.isArray(validAnswers) || validAnswers.some(a => typeof a !== "number")) {
            console.error("❌ Błąd: `answers` nie jest poprawną listą liczb.", validAnswers);
            setError("Błąd: `answers` nie jest poprawną listą liczb.");
            return;
        }

        const url = `http://127.0.0.1:8000/quiz/quiz/answer/?question_id=${question.id}`; // ✅ `question_id` w URL
        const body = JSON.stringify(validAnswers); // ✅ Wysyłamy czystą listę liczb

        console.log("📤 Wysyłane dane (JSON):", body, "➡️ do URL:", url); // Debugowanie

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: body
            });

            const data = await res.json();
            console.log("✅ Odpowiedź backendu:", data);

            if (!res.ok) {
                const errorMessage = Array.isArray(data.detail)
                    ? data.detail.map((err: { loc: string; msg: string }) => `${err.loc}: ${err.msg}`).join(", ")
                    : data.detail || "Błąd podczas zatwierdzania odpowiedzi.";
                throw new Error(errorMessage);
            }

            setFeedback(data);
            if (intervalRef.current) clearInterval(intervalRef.current);

            if (data.correct) {
                setCorrectCount((prev) => {
                    const updated = prev + 1;
                    localStorage.setItem("correctCount", updated.toString());
                    return updated;
                });
            } else {
                setWrongCount((prev) => {
                    const updated = prev + 1;
                    localStorage.setItem("wrongCount", updated.toString());
                    return updated;
                });
            }


            setCorrectAnswers(data.correct_answers || []); // 🟢 Zapamiętujemy ID poprawnych odpowiedzi


            if (data.quiz_finished) {
                // Od razu przenosi na podsumowanie po kliknięciu "Dalej"
                setFeedback({ correct: data.correct, quiz_finished: true });
            } else {
                setFeedback({ correct: data.correct });
            }
        } catch (error: unknown) {
            console.error("🚨 Błąd wysyłania odpowiedzi:", error);
            setError(error instanceof Error ? error.message : "Nieznany błąd.");
        }
    };

    const handleNext = () => {
        if (feedback?.quiz_finished) {
            localStorage.setItem("totalTime", time.toString());
            router.push("/summary");
        } else {
            fetchNextQuestion();
            fetchQuizStatus();
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };


    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
            <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                <button
                    onClick={() => router.push("/quiz")}
                    className="mb-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                    Powrót
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">
                    {datasetName ? `${datasetName}`: ""}
                </h2>


                {/* Info: czas, licznik poprawnych i błędnych, pytania */}
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-300 mb-4">
                    <span>⏱️ {formatTime(time)}</span>
                    <span>✅ {correctCount} | ❌ {wrongCount}</span>
                    {remainingQuestions !== null && <span>📊 Pozostało: {remainingQuestions}</span>}
                </div>

                {loading && <p className="text-center">Ładowanie...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {question && (
                    <>
                        <p className="text-lg font-semibold mb-4 text-center">{question.question_text}</p>
                        <ul className="space-y-2">
                            {question?.answers?.map((answer) => {
                                let answerClass = "bg-gray-200 dark:bg-zinc-700 text-black dark:text-white";

                                const isSelected = selectedAnswers.includes(answer.id);
                                const isCorrect = correctAnswers.includes(answer.id);

                                if (feedback) {
                                    if (isSelected && isCorrect) {
                                        answerClass = "bg-green-500 text-white";
                                    } else if (isSelected && !isCorrect) {
                                        answerClass = "bg-red-500 text-white";
                                    } else if (!isSelected && isCorrect) {
                                        answerClass = "bg-yellow-300 text-black"; // nie zaznaczona poprawna
                                    }
                                } else if (isSelected) {
                                    answerClass = "bg-blue-300 text-black dark:text-white";
                                }

                                return (
                                    <li
                                        key={answer.id}
                                        className={`p-3 rounded cursor-pointer ${answerClass}`}
                                        onClick={() => handleAnswerClick(answer.id)}
                                    >
                                        {answer.text}
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            onClick={feedback ? handleNext : submitAnswer}
                            className="w-full py-2 rounded mt-4 text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        >
                            {feedback ? "Dalej" : "Zatwierdź"}
                        </button>
                    </>
                )}
            </div>
        </main>
    );

}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isRealAdmin } from "@/lib/auth";

interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    is_admin: boolean;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isRealAdmin()) {
            router.push("/");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:8000/users/all/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch(() => setError("Błąd ładowania użytkowników"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (userId: number) => {
        const confirmed = confirm("Czy na pewno chcesz usunąć tego użytkownika?");
        if (!confirmed) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8000/users/${userId}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            } else {
                alert("Nie udało się usunąć użytkownika");
            }
        } catch {
            alert("Błąd połączenia z serwerem");
        }
    };

    if (loading) return <p className="p-4 text-white">Ładowanie użytkowników...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <main className="p-4 max-w-4xl mx-auto text-white">
            <h1 className="text-2xl font-bold mb-4">👨‍💼 Lista użytkowników</h1>
            <table className="w-full border border-gray-300 dark:border-zinc-600">
                <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-800">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Nazwa użytkownika</th>
                        <th className="p-2 text-left">E-mail</th>
                        <th className="p-2 text-left">Admin</th>
                        <th className="p-2 text-left">Utworzono</th>
                        <th className="p-2">Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t border-gray-200 dark:border-zinc-700">
                            <td className="p-2 text-left">{user.id}</td>
                            <td className="p-2 text-left">{user.username}</td>
                            <td className="p-2 text-left">{user.email}</td>
                            <td className="p-2">
                                {user.is_admin ? (
                                    <span className="text-green-400 font-bold">✅</span>
                                ) : (
                                    ""
                                )}
                            </td>

                            <td className="p-2 text-left">{new Date(user.created_at).toLocaleString()}</td>
                            <td className="p-2 text-center">
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
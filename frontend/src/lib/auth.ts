import { jwtDecode } from "jwt-decode";

interface MyJwtPayload {
  sub: string;
  email: string;
  exp: number;
}

export function isRealAdmin(): boolean {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return false;

  try {
    const decoded = jwtDecode<MyJwtPayload>(token);
    return decoded?.email === "jakub.czechowski12321@gmail.com"; // ← podmień na swój e-mail
  } catch {
    return false;
  }
}

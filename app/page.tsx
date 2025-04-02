import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const headerList = await headers(); // Esperamos a que se resuelva la promesa
  const cookieHeader = headerList.get("cookie") || "";

  const res = await fetch("http://localhost:4000/api/auth/me", {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (res.ok) {
    const data = await res.json();
    if (data.userId) {
      redirect(`/perfil/${data.userId}`);
    }
  }
  redirect("/login");
}

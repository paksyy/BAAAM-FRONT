import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default async function Home() {
  const headerList = await headers(); // Esperamos a que se resuelva la promesa
  const cookieHeader = headerList.get("cookie") || "";
  

  const res = await fetch(`${apiUrl}/auth/me`, {
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

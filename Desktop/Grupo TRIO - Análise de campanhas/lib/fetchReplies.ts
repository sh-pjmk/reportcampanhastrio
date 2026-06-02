export async function fetchReplies(
  contacts: Array<{ contactId?: string; phone: string; sentAt?: string }>
): Promise<Record<string, boolean>> {
  const res = await fetch("/api/replies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contacts }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      res.status === 404
        ? "Rota /api/replies não encontrada — reinicie o servidor com npm run dev"
        : `Erro ${res.status} ao buscar respostas${text ? `: ${text}` : ""}`
    );
  }

  const data = (await res.json()) as { replies: Record<string, boolean> };
  return data.replies;
}

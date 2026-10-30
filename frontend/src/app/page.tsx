"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";

interface PurchaseRequest {
  id: number;
  item_name: string;
  quantity: number;
  requester_name: string;
  justification: string | null;
  status: string;
  created_at: string;
  ai_priority: string | null;
  ai_summary_text: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) {
    return <span className="text-sm text-gray-400">Sem parecer</span>;
  }

  const priorityLabels: Record<string, string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };
  
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[priority] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {priorityLabels[priority] ?? priority}
    </span>
  );
}

export default function Home() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const endpoint = statusFilter
          ? `/purchase-requests?status=${encodeURIComponent(statusFilter)}`
          : "/purchase-requests";

        const data = await api.get<PurchaseRequest[]>(endpoint);
        setRequests(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as solicitações."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [statusFilter]);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Solicitações de Compra
            </h1>
            <p className="mt-2 text-gray-500">
              Gerencie e acompanhe as solicitações de compra.
            </p>
          </div>

          <Link
            href="/purchase-requests/new"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Nova solicitação
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Solicitações encontradas</p>
            <p className="mt-2 text-3xl font-bold">{totalRequests}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="mt-2 text-3xl font-bold">{pendingRequests}</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Todas as solicitações
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Consulte os pedidos e seus respectivos pareceres.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
            </select>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Carregando solicitações...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Nenhuma solicitação encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Solicitante</th>
                    <th className="px-6 py-4">Quantidade</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Prioridade IA</th>
                    <th className="px-6 py-4">Data</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link
                          href={`/purchase-requests/${request.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {request.item_name}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {request.requester_name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {request.quantity}
                      </td>

                      <td className="px-6 py-4">
                        {statusLabels[request.status] ?? request.status}
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge priority={request.ai_priority} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {new Date(request.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
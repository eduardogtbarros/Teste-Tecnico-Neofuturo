"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/services/api";

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  category: string | null;
}

interface AIReview {
  id: number;
  purchase_request_id: number;
  priority: string;
  summary_text: string;
  generated_at: string;
}

interface PurchaseRequest {
  id: number;
  item_name: string;
  quantity: number;
  supplier_id: number | null;
  requester_name: string;
  justification: string | null;
  status: string;
  created_at: string;
  supplier: Supplier | null;
  ai_review: AIReview | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const priorityLabels: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export default function PurchaseRequestDetails() {
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(false);

  async function loadRequest() {
    try {
      setLoading(true);
      setError("");

      const data = await api.get<PurchaseRequest>(
        `/purchase-requests/${id}`,
      );

      setRequest(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a solicitação.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequest();
  }, [id]);

  async function handleStatusChange(status: string) {
    try {
      setUpdating(true);

      await api.patch(`/purchase-requests/${id}/status`, { status });

      await loadRequest();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleGenerateReview() {
    try {
      setGeneratingReview(true);

      await api.post(`/purchase-requests/${id}/review`, {});

      await loadRequest();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar o parecer da IA.",
      );
    } finally {
      setGeneratingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center text-gray-500">
        Carregando solicitação...
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center">
        <p className="text-red-600">
          {error || "Solicitação não encontrada."}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-700 hover:underline"
        >
          Voltar para a listagem
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Voltar para solicitações
        </Link>

        <header className="mb-8 mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-gray-500">
              Solicitação #{request.id}
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              {request.item_name}
            </h1>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
            {statusLabels[request.status] ?? request.status}
          </span>
        </header>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Dados da solicitação
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Item solicitado</p>
              <p className="mt-1 font-medium">{request.item_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Quantidade</p>
              <p className="mt-1 font-medium">{request.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Solicitante</p>
              <p className="mt-1 font-medium">{request.requester_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Data da solicitação</p>
              <p className="mt-1 font-medium">
                {new Date(request.created_at).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Justificativa</p>
              <p className="mt-1 font-medium">
                {request.justification || "Nenhuma justificativa informada."}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Fornecedor</h2>

          {request.supplier ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="mt-1 font-medium">
                  {request.supplier.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <p className="mt-1 font-medium">
                  {request.supplier.email || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="mt-1 font-medium">
                  {request.supplier.phone || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="mt-1 font-medium">
                  {request.supplier.category || "Não informada"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Nenhum fornecedor associado a esta solicitação.
            </p>
          )}
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Parecer da IA</h2>

            <button
              onClick={handleGenerateReview}
              disabled={generatingReview}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingReview
                ? "Gerando parecer..."
                : request.ai_review
                  ? "Gerar novo parecer"
                  : "Gerar parecer com IA"}
            </button>
          </div>

          {request.ai_review ? (
            <div>
              <p className="text-sm text-gray-500">Prioridade</p>
              <p className="mt-1 font-semibold">
                {priorityLabels[request.ai_review.priority] ??
                  request.ai_review.priority}
              </p>

              <p className="mt-4 text-sm text-gray-500">Resumo</p>
              <p className="mt-1 leading-relaxed">
                {request.ai_review.summary_text}
              </p>

              <p className="mt-4 text-xs text-gray-400">
                Gerado em{" "}
                {new Date(
                  request.ai_review.generated_at,
                ).toLocaleString("pt-BR")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Ainda não existe um parecer para esta solicitação.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Atualizar status
          </h2>

          <select
            value={request.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            disabled={updating}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50 sm:w-64"
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovada</option>
            <option value="rejected">Rejeitada</option>
          </select>

          {updating && (
            <p className="mt-2 text-sm text-gray-500">
              Atualizando status...
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
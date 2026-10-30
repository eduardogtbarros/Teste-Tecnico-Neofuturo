"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

interface Supplier {
  id: number;
  name: string;
  email: string;
}

export default function NewPurchaseRequest() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [justification, setJustification] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await api.get<Supplier[]>("/suppliers");
        setSuppliers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Erro ao carregar fornecedores: ${err.message}`
            : "Não foi possível carregar os fornecedores.",
        );
      } finally {
        setLoadingSuppliers(false);
      }
    }

    loadSuppliers();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const created = await api.post<{ id: number }>(
        "/purchase-requests",
        {
          item_name: itemName,
          quantity: Number(quantity),
          requester_name: requesterName,
          justification: justification || null,
          supplier_id: supplierId ? Number(supplierId) : null,
        },
      );

      router.push(`/purchase-requests/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a solicitação.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Voltar para solicitações
        </Link>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold">
            Nova solicitação de compra
          </h1>
          <p className="mt-2 text-gray-500">
            Preencha os dados para registrar uma nova solicitação.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Item solicitado *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Ex.: Notebook"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Ex.: 5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Solicitante *
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Nome de quem está solicitando"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Justificativa
            </label>
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Explique o motivo da solicitação..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fornecedor
            </label>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              disabled={loadingSuppliers}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">
                {loadingSuppliers
                  ? "Carregando fornecedores..."
                  : "Nenhum fornecedor selecionado"}
              </option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            {!loadingSuppliers && suppliers.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Nenhum fornecedor cadastrado. Você pode registrar a
                solicitação sem selecionar um fornecedor.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-semibold hover:bg-gray-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading || loadingSuppliers}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar solicitação"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
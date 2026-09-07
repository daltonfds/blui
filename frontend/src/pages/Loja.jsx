import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import {
  PageHeader,
  StatCard,
  Badge,
  EmptyState,
  LoadingState,
  ErrorState,
  Modal,
  Button
} from '../components/ui/UI'

const money = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))

const statusLabel = {
  aberto: 'Aberto',
  abandonado: 'Abandonado',
  convertido: 'Convertido',
  cancelado: 'Cancelado',
  novo: 'Novo',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregue: 'Entregue'
}

export default function Loja() {
  const [tab, setTab] = useState('resumo')
  const [produtos, setProdutos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [carrinhos, setCarrinhos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [criando, setCriando] = useState(false)

  const carregar = async () => {
    setLoading(true)
    setError('')

    try {
      const [p, o, c] = await Promise.all([
        api.get('/loja/produtos'),
        api.get('/loja/pedidos'),
        api.get('/loja/carrinhos')
      ])

      setProdutos(p?.data || p || [])
      setPedidos(o?.data || o || [])
      setCarrinhos(c?.data || c || [])
    } catch (err) {
      setError(err?.message || 'Não foi possível carregar os dados da loja.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const receita = useMemo(
    () =>
      pedidos
        .filter((p) => !['cancelado'].includes(p.estado))
        .reduce((sum, p) => sum + Number(p.total || 0), 0),
    [pedidos]
  )

  const pedidosAtivos = pedidos.filter(
    (p) => !['entregue', 'cancelado'].includes(p.estado)
  ).length

  const carrinhosAbertos = carrinhos.filter(
    (c) => c.estado === 'aberto'
  ).length

  const criarCarrinho = async () => {
    setCriando(true)

    try {
      await api.post('/loja/carrinhos', {
        contacto_id: null
      })

      setModal(false)
      await carregar()
      setTab('carrinhos')
    } catch (err) {
      setError(err?.message || 'Não foi possível criar o carrinho.')
    } finally {
      setCriando(false)
    }
  }

  if (loading) return <LoadingState />

  if (error && !produtos.length && !pedidos.length && !carrinhos.length) {
    return <ErrorState message={error} onRetry={carregar} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loja"
        description="Produtos, pedidos, carrinhos e checkout do teu negócio."
        action={
          <Button onClick={() => setModal(true)}>
            + Novo carrinho
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Produtos" value={produtos.length} />
        <StatCard title="Pedidos" value={pedidos.length} />
        <StatCard title="Pedidos ativos" value={pedidosAtivos} />
        <StatCard title="Receita" value={money(receita)} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          ['resumo', 'Resumo'],
          ['produtos', 'Produtos'],
          ['pedidos', 'Pedidos'],
          ['carrinhos', 'Carrinhos'],
          ['checkout', 'Checkout']
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'resumo' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Últimos pedidos</h2>

            {!pedidos.length ? (
              <EmptyState
                title="Ainda não existem pedidos"
                description="Os pedidos criados pela loja aparecerão aqui."
              />
            ) : (
              <div className="space-y-3">
                {pedidos.slice(0, 8).map((pedido) => (
                  <div
                    key={pedido.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <div className="font-medium">
                        Pedido #{String(pedido.id).slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.criado_em
                          ? new Date(pedido.criado_em).toLocaleString('pt-BR')
                          : '—'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        {money(pedido.total)}
                      </div>
                      <Badge>{statusLabel[pedido.estado] || pedido.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Carrinhos</h2>

            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Abertos" value={carrinhosAbertos} />
              <StatCard title="Total" value={carrinhos.length} />
            </div>

            <div className="mt-6">
              <Button onClick={() => setTab('carrinhos')}>
                Ver carrinhos
              </Button>
            </div>
          </section>
        </div>
      )}

      {tab === 'produtos' && (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Produtos da loja</h2>
          </div>

          {!produtos.length ? (
            <EmptyState
              title="Nenhum produto encontrado"
              description="Cria produtos no módulo Produtos para que apareçam aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Idioma</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b last:border-0">
                      <td className="p-4 font-medium">
                        {produto.nome_produto || 'Sem nome'}
                      </td>
                      <td className="p-4">
                        {produto.idioma || '—'}
                      </td>
                      <td className="p-4">
                        {produto.forma_pagamento || '—'}
                      </td>
                      <td className="p-4">
                        <Badge>
                          {produto.ativo === false ? 'Inativo' : 'Ativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'pedidos' && (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Pedidos</h2>
          </div>

          {!pedidos.length ? (
            <EmptyState
              title="Nenhum pedido"
              description="Os pedidos aparecerão aqui assim que forem criados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Pedido</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Itens</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b last:border-0">
                      <td className="p-4 font-medium">
                        #{String(pedido.id).slice(0, 8)}
                      </td>
                      <td className="p-4">
                        <Badge>
                          {statusLabel[pedido.estado] || pedido.estado}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {pedido.order_items?.length || 0}
                      </td>
                      <td className="p-4 font-medium">
                        {money(pedido.total)}
                      </td>
                      <td className="p-4">
                        {pedido.criado_em
                          ? new Date(pedido.criado_em).toLocaleString('pt-BR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'carrinhos' && (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-semibold">Carrinhos</h2>
              <p className="text-sm text-gray-500">
                Carrinhos criados pelos teus contactos.
              </p>
            </div>

            <Button onClick={() => setModal(true)}>
              + Criar carrinho
            </Button>
          </div>

          {!carrinhos.length ? (
            <EmptyState
              title="Nenhum carrinho"
              description="Cria o primeiro carrinho para começar."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Carrinho</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinhos.map((cart) => (
                    <tr key={cart.id} className="border-b last:border-0">
                      <td className="p-4 font-medium">
                        #{String(cart.id).slice(0, 8)}
                      </td>
                      <td className="p-4">
                        <Badge>
                          {statusLabel[cart.estado] || cart.estado}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {cart.contacto_id
                          ? String(cart.contacto_id).slice(0, 8)
                          : 'Sem contacto'}
                      </td>
                      <td className="p-4 font-medium">
                        {money(cart.total)}
                      </td>
                      <td className="p-4">
                        {cart.atualizado_em
                          ? new Date(cart.atualizado_em).toLocaleString('pt-BR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'checkout' && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Checkout</h2>
          <p className="mt-2 text-sm text-gray-600">
            O checkout está preparado para receber o fluxo de compra da loja.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard title="Produtos disponíveis" value={produtos.length} />
            <StatCard title="Carrinhos abertos" value={carrinhosAbertos} />
            <StatCard title="Pedidos" value={pedidos.length} />
          </div>
        </section>
      )}

      <Modal
        open={modal}
        onClose={() => !criando && setModal(false)}
        title="Criar carrinho"
      >
        <p className="text-sm text-gray-600">
          Será criado um novo carrinho aberto sem contacto associado.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setModal(false)}
            disabled={criando}
          >
            Cancelar
          </Button>

          <Button onClick={criarCarrinho} disabled={criando}>
            {criando ? 'A criar...' : 'Criar carrinho'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

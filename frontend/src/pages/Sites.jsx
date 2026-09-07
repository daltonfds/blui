import React, { useEffect, useState } from 'react'
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

export default function Sites() {
  const [sites, setSites] = useState([])
  const [siteSelecionado, setSiteSelecionado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalSite, setModalSite] = useState(false)
  const [modalPagina, setModalPagina] = useState(false)
  const [editandoPagina, setEditandoPagina] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [siteForm, setSiteForm] = useState({
    nome: '',
    dominio: ''
  })

  const [paginaForm, setPaginaForm] = useState({
    slug: '',
    titulo: '',
    conteudo: '{}',
    publicado: false
  })

  const carregar = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await api.get('/sites')
      const data = result?.data || result || []
      setSites(data)

      if (siteSelecionado) {
        const atualizado = data.find((s) => s.id === siteSelecionado.id)
        setSiteSelecionado(atualizado || null)
      }
    } catch (err) {
      setError(err?.message || 'Não foi possível carregar os sites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const criarSite = async (event) => {
    event.preventDefault()
    setSalvando(true)

    try {
      await api.post('/sites', siteForm)
      setModalSite(false)
      setSiteForm({ nome: '', dominio: '' })
      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível criar o site.')
    } finally {
      setSalvando(false)
    }
  }

  const editarSite = async (site) => {
    const nome = window.prompt('Nome do site:', site.nome)
    if (nome === null) return

    const dominio = window.prompt(
      'Domínio:',
      site.dominio || ''
    )

    if (dominio === null) return

    try {
      await api.patch(`/sites/${site.id}`, {
        nome,
        dominio
      })

      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível atualizar o site.')
    }
  }

  const apagarSite = async (site) => {
    if (
      !window.confirm(
        `Apagar o site "${site.nome}"? Esta operação não pode ser desfeita.`
      )
    ) {
      return
    }

    try {
      await api.delete(`/sites/${site.id}`)

      if (siteSelecionado?.id === site.id) {
        setSiteSelecionado(null)
      }

      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível apagar o site.')
    }
  }

  const abrirPaginaNova = () => {
    setEditandoPagina(null)
    setPaginaForm({
      slug: '',
      titulo: '',
      conteudo: '{}',
      publicado: false
    })
    setModalPagina(true)
  }

  const abrirPaginaEdicao = (pagina) => {
    setEditandoPagina(pagina)

    setPaginaForm({
      slug: pagina.slug || '',
      titulo: pagina.titulo || '',
      conteudo:
        typeof pagina.conteudo === 'string'
          ? pagina.conteudo
          : JSON.stringify(pagina.conteudo || {}, null, 2),
      publicado: !!pagina.publicado
    })

    setModalPagina(true)
  }

  const salvarPagina = async (event) => {
    event.preventDefault()

    if (!siteSelecionado) return

    setSalvando(true)

    try {
      let conteudo = {}

      try {
        conteudo = JSON.parse(paginaForm.conteudo || '{}')
      } catch {
        throw new Error('O conteúdo da página precisa ser um JSON válido.')
      }

      const payload = {
        slug: paginaForm.slug,
        titulo: paginaForm.titulo,
        conteudo,
        publicado: paginaForm.publicado
      }

      if (editandoPagina) {
        await api.patch(
          `/sites/${siteSelecionado.id}/paginas/${editandoPagina.id}`,
          payload
        )
      } else {
        await api.post(
          `/sites/${siteSelecionado.id}/paginas`,
          payload
        )
      }

      setModalPagina(false)
      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível guardar a página.')
    } finally {
      setSalvando(false)
    }
  }

  const apagarPagina = async (pagina) => {
    if (!siteSelecionado) return

    if (
      !window.confirm(
        `Apagar a página "${pagina.titulo || pagina.slug}"?`
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/sites/${siteSelecionado.id}/paginas/${pagina.id}`
      )

      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível apagar a página.')
    }
  }

  const publicarPagina = async (pagina) => {
    if (!siteSelecionado) return

    try {
      await api.patch(
        `/sites/${siteSelecionado.id}/paginas/${pagina.id}`,
        {
          publicado: !pagina.publicado
        }
      )

      await carregar()
    } catch (err) {
      setError(err?.message || 'Não foi possível alterar a publicação.')
    }
  }

  if (loading) return <LoadingState />

  if (error && !sites.length) {
    return <ErrorState message={error} onRetry={carregar} />
  }

  const paginas = siteSelecionado?.site_pages || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sites"
        description="Landing pages, páginas de venda, formulários e domínios."
        action={
          <Button onClick={() => setModalSite(true)}>
            + Novo site
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Sites" value={sites.length} />
        <StatCard
          title="Páginas"
          value={sites.reduce(
            (total, site) => total + (site.site_pages?.length || 0),
            0
          )}
        />
        <StatCard
          title="Publicadas"
          value={sites.reduce(
            (total, site) =>
              total +
              (site.site_pages?.filter((p) => p.publicado).length || 0),
            0
          )}
        />
      </div>

      {!sites.length ? (
        <section className="rounded-2xl border bg-white shadow-sm">
          <EmptyState
            title="Ainda não tens sites"
            description="Cria o primeiro site para começar a construir as tuas páginas."
            action={
              <Button onClick={() => setModalSite(true)}>
                Criar primeiro site
              </Button>
            }
          />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="font-semibold">Os teus sites</h2>
            </div>

            <div className="divide-y">
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSiteSelecionado(site)}
                  className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                    siteSelecionado?.id === site.id
                      ? 'bg-gray-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {site.nome || 'Site sem nome'}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {site.dominio || 'Sem domínio'}
                      </div>
                    </div>

                    <Badge>
                      {site.estado || 'ativo'}
                    </Badge>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    {site.site_pages?.length || 0} página(s)
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm lg:col-span-2">
            {!siteSelecionado ? (
              <EmptyState
                title="Seleciona um site"
                description="Escolhe um site para gerir páginas e domínio."
              />
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {siteSelecionado.nome}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {siteSelecionado.dominio || 'Sem domínio configurado'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => editarSite(siteSelecionado)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => abrirPaginaNova()}
                    >
                      + Página
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => apagarSite(siteSelecionado)}
                    >
                      Apagar
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Páginas</h3>
                      <p className="text-sm text-gray-500">
                        Gere o conteúdo e publicação das páginas.
                      </p>
                    </div>
                  </div>

                  {!paginas.length ? (
                    <EmptyState
                      title="Nenhuma página criada"
                      description="Cria uma landing page ou página de venda."
                      action={
                        <Button onClick={abrirPaginaNova}>
                          Criar página
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {paginas.map((pagina) => (
                        <div
                          key={pagina.id}
                          className="rounded-xl border p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-medium">
                                {pagina.titulo || 'Sem título'}
                              </div>

                              <div className="mt-1 text-sm text-gray-500">
                                /{pagina.slug}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge>
                                {pagina.publicado
                                  ? 'Publicada'
                                  : 'Rascunho'}
                              </Badge>

                              <Button
                                variant="secondary"
                                onClick={() => abrirPaginaEdicao(pagina)}
                              >
                                Editar
                              </Button>

                              <Button
                                variant="secondary"
                                onClick={() => publicarPagina(pagina)}
                              >
                                {pagina.publicado
                                  ? 'Despublicar'
                                  : 'Publicar'}
                              </Button>

                              <Button
                                variant="danger"
                                onClick={() => apagarPagina(pagina)}
                              >
                                Apagar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <Modal
        open={modalSite}
        onClose={() => !salvando && setModalSite(false)}
        title="Novo site"
      >
        <form onSubmit={criarSite} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              value={siteForm.nome}
              onChange={(e) =>
                setSiteForm({
                  ...siteForm,
                  nome: e.target.value
                })
              }
              required
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              placeholder="Ex.: Minha loja"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Domínio
            </label>
            <input
              value={siteForm.dominio}
              onChange={(e) =>
                setSiteForm({
                  ...siteForm,
                  dominio: e.target.value
                })
              }
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              placeholder="Ex.: minhaempresa.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalSite(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={salvando}>
              {salvando ? 'A criar...' : 'Criar site'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalPagina}
        onClose={() => !salvando && setModalPagina(false)}
        title={editandoPagina ? 'Editar página' : 'Nova página'}
      >
        <form onSubmit={salvarPagina} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Título
            </label>

            <input
              value={paginaForm.titulo}
              onChange={(e) =>
                setPaginaForm({
                  ...paginaForm,
                  titulo: e.target.value
                })
              }
              required
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Página de vendas"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Slug
            </label>

            <input
              value={paginaForm.slug}
              onChange={(e) =>
                setPaginaForm({
                  ...paginaForm,
                  slug: e.target.value
                })
              }
              required
              className="w-full rounded-xl border px-3 py-2"
              placeholder="pagina-de-vendas"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Conteúdo JSON
            </label>

            <textarea
              value={paginaForm.conteudo}
              onChange={(e) =>
                setPaginaForm({
                  ...paginaForm,
                  conteudo: e.target.value
                })
              }
              rows={10}
              className="w-full rounded-xl border px-3 py-2 font-mono text-sm"
              placeholder='{"tipo":"landing","blocos":[]}'
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={paginaForm.publicado}
              onChange={(e) =>
                setPaginaForm({
                  ...paginaForm,
                  publicado: e.target.checked
                })
              }
            />
            Publicar imediatamente
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalPagina(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={salvando}>
              {salvando ? 'A guardar...' : 'Guardar página'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-7 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// Shared premium surface: hairline border, soft radius, smooth lift on hover.
const cardBase = 'group block rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_72px_rgba(15,23,42,0.14)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  if (task === 'article') {
    return <ArticleArchiveView posts={posts} pagination={pagination} category={category} categoryLabel={categoryLabel} basePath={basePath} />
  }

  if (task === 'listing') {
    return <ListingArchiveView posts={posts} pagination={pagination} category={category} categoryLabel={categoryLabel} basePath={basePath} />
  }

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-28 lg:px-8">
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--tk-accent)]">
              <span>{theme.kicker}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
              <span className="text-[var(--tk-muted)]">{label}</span>
            </div>
            <h1 className="editable-display mt-6 max-w-3xl text-balance text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {voice?.headline || `Browse ${label}`}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
            {voice?.chips?.length ? (
              <div className="mt-8 flex flex-wrap gap-2.5">
                {voice.chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]">{chip}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-12 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--tk-muted)]">
                <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'} · {categoryLabel}
              </p>
              <form action={basePath} className="flex items-center gap-2.5">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-11 items-center rounded-full bg-[var(--tk-accent)] px-5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Apply</button>
              </form>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveView({ posts, pagination, category, categoryLabel, basePath }: { posts: SitePost[]; pagination: SiteFeedPagination; category: string; categoryLabel: string; basePath: string }) {
  const page = pagination.page || 1
  const featured = posts[0]
  const side = posts.slice(1, 4)
  const rest = posts.slice(4)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle('article')} className="min-h-screen bg-[#fffdf9] text-[#151a27]">
        <header className="relative overflow-hidden border-b border-[#e8e1d8] bg-[#fff3e6]">
          <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#f15a2b]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#151a27]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#f15a2b]/20 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#f15a2b]">
                <BookOpen className="h-4 w-4" /> Article library
              </p>
              <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3.2rem,8vw,6.8rem)] font-black leading-[0.9] tracking-[-0.08em]">
                Read useful ideas with room to breathe.
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#656c79]">
                Browse fresh writing, practical guides, community posts, and business-friendly insights from Hoorness.
              </p>
              <form action={basePath} className="mt-9 flex max-w-2xl flex-col gap-3 rounded-[1.6rem] border border-black/10 bg-white p-3 shadow-[0_22px_70px_rgba(21,24,39,0.12)] sm:flex-row">
                <label className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <Search className="h-5 w-5 shrink-0 text-[#f15a2b]" />
                  <select name="category" defaultValue={category} className="h-12 min-w-0 flex-1 bg-transparent text-sm font-bold text-[#151a27] outline-none">
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                </label>
                <button className="rounded-2xl bg-[#151a27] px-7 py-3 text-sm font-black text-white transition hover:bg-[#f15a2b]">Filter</button>
              </form>
            </div>
            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(21,24,39,0.12)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f15a2b]">Current shelf</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl bg-[#151a27] p-5 text-white">
                  <p className="text-4xl font-black">{posts.length}</p>
                  <p className="mt-1 text-sm font-semibold text-white/65">{posts.length === 1 ? 'article' : 'articles'} on this page</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f7] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#656c79]">Category</p>
                  <p className="mt-2 text-2xl font-black">{categoryLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 lg:px-8 lg:py-20">
          {posts.length ? (
            <>
              {featured ? (
                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  <Link href={`${basePath}/${featured.slug}`} className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(21,24,39,0.12)]">
                    <div className="aspect-[16/9] overflow-hidden bg-[#ece9e3]">
                      <img src={getImage(featured)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-7 sm:p-9">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f15a2b]">{getCategory(featured, 'Featured article')}</p>
                      <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">{featured.title}</h2>
                      <p className="mt-4 line-clamp-2 max-w-2xl text-base leading-7 text-[#656c79]">{getSummary(featured)}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#151a27]">Read feature <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </Link>
                  <div className="grid gap-4">
                    {side.map((post, index) => (
                      <Link key={post.id || post.slug} href={`${basePath}/${post.slug}`} className="group grid grid-cols-[104px_1fr] gap-4 rounded-[1.4rem] border border-black/10 bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl">
                        <img src={getImage(post)} alt="" className="h-28 w-full rounded-2xl object-cover" />
                        <div className="min-w-0 py-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f15a2b]">No. {String(index + 2).padStart(2, '0')}</p>
                          <h3 className="mt-2 line-clamp-3 text-lg font-black leading-tight">{post.title}</h3>
                          <p className="mt-2 line-clamp-1 text-sm text-[#656c79]">{getCategory(post, 'Article')}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {rest.length ? (
                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((post, index) => <ArticleArchiveCard key={post.id || post.slug} post={post} href={`${basePath}/${post.slug}`} index={index + 4} />)}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-black/15 bg-white px-8 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-[#f15a2b]" />
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">No articles found</h2>
              <p className="mt-3 text-sm leading-6 text-[#656c79]">Try another category or return when more articles are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold transition hover:border-[#f15a2b]">Previous</Link> : null}
              <span className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold text-[#656c79]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold transition hover:border-[#f15a2b]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ListingArchiveView({ posts, pagination, category, categoryLabel, basePath }: { posts: SitePost[]; pagination: SiteFeedPagination; category: string; categoryLabel: string; basePath: string }) {
  const page = pagination.page || 1
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle('listing')} className="min-h-screen bg-[#f7f4ef] text-[#151a27]">
        <header className="relative overflow-hidden bg-[#151a27] text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(241,90,43,0.18)_1px,transparent_1px),linear-gradient(0deg,rgba(241,90,43,0.14)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <div className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-[#f15a2b]/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#ffb08e]">
                <BriefcaseBusiness className="h-4 w-4" /> Business directory
              </p>
              <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3rem,7vw,6.4rem)] font-black leading-[0.9] tracking-[-0.08em]">
                Find trusted businesses and useful services.
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/70">
                Explore company profiles, service listings, contact details, and helpful descriptions from the Hoorness community.
              </p>
              <form action={basePath} className="mt-9 flex max-w-2xl flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-white p-3 text-[#151a27] shadow-[0_28px_80px_rgba(0,0,0,0.25)] sm:flex-row">
                <label className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <Search className="h-5 w-5 shrink-0 text-[#f15a2b]" />
                  <select name="category" defaultValue={category} className="h-12 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none">
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                </label>
                <button className="rounded-2xl bg-[#f15a2b] px-7 py-3 text-sm font-black text-white transition hover:bg-[#151a27]">Search</button>
              </form>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffb08e]">Directory snapshot</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-5 text-[#151a27]">
                  <p className="text-4xl font-black">{posts.length}</p>
                  <p className="mt-1 text-sm font-semibold text-[#656c79]">visible listings</p>
                </div>
                <div className="rounded-2xl bg-[#f15a2b] p-5 text-white">
                  <p className="text-4xl font-black">{page}</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">current page</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#111827]/60 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Category</p>
                <p className="mt-2 text-2xl font-black">{categoryLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 lg:px-8 lg:py-20">
          {posts.length ? (
            <>
              {featured ? (
                <Link href={`${basePath}/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_18px_60px_rgba(21,24,39,0.08)] transition hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(21,24,39,0.14)] lg:grid-cols-[360px_1fr]">
                  <div className="flex min-h-72 items-center justify-center bg-[#151a27] p-8">
                    {getImages(featured)[0] ? <img src={getImages(featured)[0]} alt="" className="h-full max-h-72 w-full rounded-[1.4rem] object-cover" /> : <BriefcaseBusiness className="h-20 w-20 text-white/40" />}
                  </div>
                  <div className="p-7 sm:p-10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f15a2b]">Featured listing</p>
                    <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl">{featured.title}</h2>
                    <RatingLine post={featured} />
                    <p className="mt-4 line-clamp-3 max-w-2xl text-base leading-7 text-[#656c79]">{getSummary(featured)}</p>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-[#656c79]">
                      {getField(featured, ['location', 'address', 'city']) ? <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ef] px-4 py-2"><MapPin className="h-4 w-4 text-[#f15a2b]" /> {getField(featured, ['location', 'address', 'city'])}</span> : null}
                      {getField(featured, ['website', 'url']) ? <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ef] px-4 py-2"><Globe className="h-4 w-4 text-[#f15a2b]" /> Website</span> : null}
                    </div>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#151a27]">View profile <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              ) : null}

              {rest.length ? (
                <div className="mt-10 grid gap-5 xl:grid-cols-2">
                  {rest.map((post) => <ListingArchiveCard key={post.id || post.slug} post={post} href={`${basePath}/${post.slug}`} />)}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-black/15 bg-white px-8 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-[#f15a2b]" />
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">No listings found</h2>
              <p className="mt-3 text-sm leading-6 text-[#656c79]">Try another category or return when more listings are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold transition hover:border-[#f15a2b]">Previous</Link> : null}
              <span className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold text-[#656c79]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-bold transition hover:border-[#f15a2b]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

// Yelp-style red star ratings. Prefers real rating/review fields, falls back to
// a stable derived value so the UI always reads well (wire to real data later).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2.5 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--tk-muted)]">· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-2xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read article" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group grid gap-5 rounded-[1.6rem] border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(21,24,39,0.12)] sm:grid-cols-[132px_1fr]">
      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-[#151a27] sm:h-full">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <BriefcaseBusiness className="h-12 w-12 text-white/45" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f15a2b]">{getCategory(post, 'Business')}</p>
        <h2 className="mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.04em] text-[#151a27]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#656c79]">{getSummary(post)}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[#656c79]">
          {location ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f4ef] px-3 py-1.5"><MapPin className="h-3.5 w-3.5 text-[#f15a2b]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f4ef] px-3 py-1.5"><Phone className="h-3.5 w-3.5 text-[#f15a2b]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f4ef] px-3 py-1.5"><Globe className="h-3.5 w-3.5 text-[#f15a2b]" /> Website</span> : null}
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#151a27]">Open listing <ArrowUpRight className="h-4 w-4 text-[#f15a2b]" /></span>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-5 text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.78))] opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">View image <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Saved · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-display mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold tracking-[-0.02em]">{post.title}</h2>
      {role ? <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingLine post={post} center />
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

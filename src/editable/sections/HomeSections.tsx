import Link from 'next/link'
import { ArrowRight, Search, Sparkles, Star } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type Props = { primaryTask: TaskKey; primaryRoute: string; posts: SitePost[]; timeSections: HomeTimeSection[] }
const wrap = 'mx-auto w-full max-w-[1240px] px-5 sm:px-7 lg:px-10'

function pool(p: Props) {
  const seen = new Set<string>()
  return [...p.posts, ...p.timeSections.flatMap((section) => section.posts)].filter((post) => {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) return false
    seen.add(key); return true
  })
}

function href(p: Props, post: SitePost) { return postHref(p.primaryTask, post, p.primaryRoute) }

function Cover({ post, className = '' }: { post?: SitePost; className?: string }) {
  return post ? <img src={getEditablePostImage(post)} alt={post.title || 'Story cover'} className={`h-full w-full object-cover ${className}`} /> : <div className="h-full w-full bg-[linear-gradient(135deg,#172033,#31476f)]" />
}

export function EditableHomeHero(props: Props) {
  const items = pool(props); const lead = items[0]; const side = items.slice(1, 4)
  return (
    <section className="hero-canvas overflow-hidden">
      <div className={`${wrap} relative grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[.9fr_1.1fr] lg:py-24`}>
        <span className="hero-orb hero-orb-a" /><span className="hero-orb hero-orb-b" />
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#efb78d] bg-white/75 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-[#d84e21]"><Sparkles className="h-4 w-4" /> Ideas worth sharing</p>
          <h1 className="mt-6 max-w-[720px] text-[clamp(3.25rem,7vw,6.4rem)] font-black leading-[.91] tracking-[-.075em] text-[#121827]">Stories grow<br /><span className="text-[#f15a2b]">stronger</span> together.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#535a69]">Read fresh perspectives, publish your expertise, and discover businesses doing thoughtful work.</p>
          <form action="/search" className="mt-9 flex max-w-xl items-center rounded-2xl border border-black/10 bg-white p-2 shadow-[0_22px_60px_rgba(21,31,52,.14)]">
            <Search className="ml-3 h-5 w-5 text-[#f15a2b]" /><input name="q" placeholder="Search articles, people, or businesses" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none" /><button className="rounded-xl bg-[#121827] px-6 py-3 text-sm font-bold text-white hover:bg-[#f15a2b]">Explore</button>
          </form>
        </div>
        <div className="hero-stack relative z-10 hidden h-[530px] lg:block">
          <Link href={lead ? href(props, lead) : props.primaryRoute} className="hero-main-card group absolute left-[9%] top-[5%] h-[455px] w-[57%] overflow-hidden rounded-[34px] bg-[#172033] shadow-[0_36px_90px_rgba(18,24,39,.25)]"><Cover post={lead} className="opacity-90 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#101521] via-transparent"/><div className="absolute inset-x-0 bottom-0 p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ffb081]">Featured</p><h2 className="mt-3 line-clamp-2 text-3xl font-extrabold leading-tight">{lead?.title || 'Discover what the community is sharing'}</h2></div></Link>
          {side.map((post,i)=><Link key={post.id||post.slug} href={href(props,post)} className="hero-float-card absolute overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-xl" style={{right:`${i*3}%`,top:`${40+i*115}px`,width:'190px',height:'125px',animationDelay:`-${i*1.3}s`}}><Cover post={post}/><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/><p className="absolute inset-x-3 bottom-3 line-clamp-2 text-sm font-bold leading-tight text-white">{post.title}</p></Link>)}
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail(props: Props) {
  const items = pool(props).slice(0,10); if (!items.length) return null
  const doubled = [...items,...items]
  return <section className="border-y border-[#2b3242] bg-[#151a27] py-12 text-white"><div className={`${wrap} mb-7 flex items-end justify-between`}><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ff8d61]">Always moving</p><h2 className="mt-2 text-3xl font-black">Fresh from the community</h2></div><Link href={props.primaryRoute} className="hidden items-center gap-2 text-sm font-bold sm:flex">View all <ArrowRight className="h-4 w-4"/></Link></div><div className="marquee-mask"><div className="story-marquee">{doubled.map((post,i)=><Link key={`${post.id||post.slug}-${i}`} href={href(props,post)} className="group w-[245px] shrink-0"><div className="h-[300px] overflow-hidden rounded-2xl bg-[#252c3d]"><Cover post={post} className="transition duration-700 group-hover:scale-105"/></div><p className="mt-4 text-xs font-bold uppercase tracking-[.15em] text-[#ff8d61]">{getEditableCategory(post)}</p><h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug">{post.title}</h3></Link>)}</div></div></section>
}

export function EditableMagazineSplit(props: Props) {
  const items=pool(props); if(!items.length)return null; const feature=items[0], small=items.slice(1,5)
  return <section className="bg-[#fffdf9] py-20"><div className={wrap}><div className="mb-10 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#f15a2b]">Editor’s selection</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Read deeply. Think widely.</h2></div></div><div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><Link href={href(props,feature)} className="group relative min-h-[570px] overflow-hidden rounded-[28px] bg-[#171d2c]"><Cover post={feature} className="opacity-90 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#101521] via-black/10"/><div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10"><span className="rounded-full bg-[#f15a2b] px-3 py-1 text-xs font-bold">Featured read</span><h3 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] sm:text-5xl">{feature.title}</h3><p className="mt-4 line-clamp-2 max-w-xl text-white/75">{getEditableExcerpt(feature,170) || 'Open this story and discover a fresh point of view.'}</p></div></Link><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{small.map((post,i)=><Link key={post.id||post.slug} href={href(props,post)} className="group grid grid-cols-[115px_1fr] overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow-sm hover:-translate-y-1 hover:shadow-xl"><div className="h-[120px] overflow-hidden rounded-xl"><Cover post={post} className="transition duration-500 group-hover:scale-105"/></div><div className="min-w-0 px-4 py-2"><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#f15a2b]">{String(i+1).padStart(2,'0')} · {getEditableCategory(post)}</p><h3 className="mt-2 line-clamp-3 text-lg font-extrabold leading-snug">{post.title}</h3><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold">Read <ArrowRight className="h-3 w-3"/></span></div></Link>)}</div></div></div></section>
}

export function EditableTimeCollections(props: Props) {
  const items=pool(props).slice(5,13); if(!items.length)return null
  return <section className="directory-grid bg-[#f2f3f5] py-20"><div className={wrap}><div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#f15a2b]">Explore & connect</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em]">Knowledge meets opportunity.</h2><p className="mt-5 max-w-md leading-7 text-[#646b78]">Find practical articles, trusted professionals, and useful business profiles—all in one lively community.</p></div><div className="grid gap-5 sm:grid-cols-2">{items.map((post,i)=><Link key={post.id||post.slug} href={href(props,post)} className={`group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl ${i===0?'sm:col-span-2 sm:grid sm:grid-cols-2':''}`}><div className={`${i===0?'h-64 sm:h-full':'h-48'} overflow-hidden`}><Cover post={post} className="transition duration-600 group-hover:scale-105"/></div><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f15a2b]">{getEditableCategory(post)}</p><h3 className={`${i===0?'text-3xl':'text-xl'} mt-3 line-clamp-2 font-black leading-tight`}>{post.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6a707b]">{getEditableExcerpt(post,130) || 'Explore this contribution from the community.'}</p><div className="mt-5 flex items-center gap-2 text-xs font-bold"><Star className="h-4 w-4 fill-[#f4b64f] text-[#f4b64f]"/> Recommended</div></div></Link>)}</div></div></div></section>
}

export function EditableHomeCta() {
  return <section className="overflow-hidden bg-[#f15a2b] text-white"><div className={`${wrap} relative py-20 text-center sm:py-24`}><span className="cta-ring"/><p className="text-xs font-bold uppercase tracking-[.22em] text-white/70">Your voice belongs here</p><h2 className="relative mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-6xl">Share what you know. Find who you need.</h2><p className="relative mx-auto mt-5 max-w-xl text-lg text-white/80">Publish an article, create your profile, or introduce your business to an engaged audience.</p><div className="relative mt-8 flex flex-wrap justify-center gap-3"><Link href="/create" className="rounded-xl bg-[#141a28] px-7 py-4 text-sm font-bold">Start creating</Link><Link href="/search" className="rounded-xl border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold">Browse stories</Link></div></div></section>
}

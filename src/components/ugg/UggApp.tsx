/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { merge, UggContent } from '@/lib/ugg/util';
import { DEF } from '@/data/uggContent';
import type { Tournament } from '@/types/tournament';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('ugg-storage-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('ugg-storage-update', callback);
  };
}

function getClientStorage() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('ugg-content') || '';
}

function getServerStorage() {
  return '';
}

const IDS = ['home', 'events', 'about', 'esports', 'timeline', 'gallery', 'sponsors', 'team', 'join'];
const ext = (u?: string) => (/^https?:/.test(u || '') ? { target: '_blank', rel: 'noopener noreferrer' } : {});
const pad = (i: number) => String(i + 1).padStart(2, '0');
const calm = () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion:reduce)').matches : false);

const goTo = (t: HTMLElement) => {
  if (calm()) {
    t.scrollIntoView();
  } else {
    t.scrollIntoView({ behavior: 'smooth' });
  }
};

/* ---------- reveal on scroll ---------- */
interface RProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  rel?: string;
}

const R = React.forwardRef<HTMLElement, RProps>(function R(
  { as: Tag = 'div', className = '', children, ...props },
  forwardedRef
) {
  const localRef = useRef<HTMLElement>(null);
  const [on, set] = useState(() => calm());

  useEffect(() => {
    const el = localRef.current;
    if (!el || calm()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          set(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleRef = useCallback(
    (el: HTMLElement | null) => {
      (localRef as any).current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef && typeof forwardedRef === 'object') {
        (forwardedRef as any).current = el;
      }
    },
    [forwardedRef]
  );

  return (
    <Tag ref={handleRef} className={`rv ${on ? 'in' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  );
});

/* ---------- count-up numbers ---------- */
function Num({ v }: { v: string | number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = String(v).match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    if (calm()) {
      el.textContent = String(v);
      return;
    }
    let raf: number;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.unobserve(el);
          const t0 = performance.now();
          const target = +m[2];
          const f = (n: number) => {
            const p = Math.min(1, (n - t0) / 1000);
            el.textContent = m[1] + Math.round(target * (1 - Math.pow(1 - p, 3))) + m[3];
            if (p < 1) raf = requestAnimationFrame(f);
          };
          raf = requestAnimationFrame(f);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [v]);

  return <b ref={ref}>{v}</b>;
}

/* ---------- hero background (used when there is no video) ---------- */
function Fx({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (calm()) return;
    const cv = ref.current;
    if (!cv) return;
    const x = cv.getContext('2d');
    if (!x) return;

    let w = 0, h = 0;
    let P: Array<{ x: number; y: number; l: number; v: number; a: number }> = [];
    let raf = 0;
    let t = 0;
    let g: CanvasGradient | null = null;

    const rs = () => {
      w = cv.width = cv.offsetWidth;
      h = cv.height = cv.offsetHeight;
      if (w <= 0 || h <= 0) return;
      g = x.createRadialGradient(w * 0.75, h * 0.4, 0, w * 0.75, h * 0.4, w * 0.6);
      g.addColorStop(0, 'rgba(225,29,46,.35)');
      g.addColorStop(1, 'transparent');
      P = Array.from({ length: 45 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        l: 40 + Math.random() * 140,
        v: 2 + Math.random() * 5,
        a: 0.12 + Math.random() * 0.45,
      }));
    };
    rs();
    window.addEventListener('resize', rs);

    const d = () => {
      if (paused) return;
      t++;
      x.fillStyle = '#050506';
      x.fillRect(0, 0, w, h);
      if (g) {
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
      }

      x.strokeStyle = 'rgba(225,29,46,.12)';
      x.lineWidth = 1;
      x.beginPath();
      for (let i = 0; i < 18; i++) {
        const y = h * 0.55 + i * i * (h / 260) + ((t * 0.6) % 20);
        x.moveTo(0, y);
        x.lineTo(w, y);
      }
      for (let i = -10; i <= 10; i++) {
        x.moveTo(w / 2 + i * 30, h * 0.55);
        x.lineTo(w / 2 + i * 160, h);
      }
      x.stroke();

      x.lineWidth = 2;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.y -= p.v;
        p.x += p.v * 0.35;
        if (p.y < -p.l) {
          p.y = h + p.l;
          p.x = Math.random() * w;
        }
        x.strokeStyle = `rgba(225,29,46,${p.a})`;
        x.beginPath();
        x.moveTo(p.x, p.y);
        x.lineTo(p.x - p.l * 0.35, p.y + p.l);
        x.stroke();
      }
      raf = requestAnimationFrame(d);
    };

    if (!paused) {
      raf = requestAnimationFrame(d);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', rs);
    };
  }, [paused]);

  return <canvas ref={ref} />;
}

/* ---------- hero ---------- */
function Hero({ c }: { c: UggContent }) {
  const h = c.hero;
  const ref = useRef<HTMLElement>(null);
  const W = h.words?.length ? h.words : ['PLAY.'];
  const [s, setS] = useState({ k: 0, prev: -1 });
  const [off, setOff] = useState(false);
  const liveEv = c.events.items.find((x: any) => x.status === 'live');
  const art = h.img || c.brand.logo;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (off || W.length < 2) return;
    const t = setTimeout(() => setS((o) => ({ k: (o.k + 1) % W.length, prev: o.k })), s.prev === -1 ? 2900 : 2400);
    return () => clearTimeout(t);
  }, [s, off, W.length]);

  return (
    <section className={`s hero${off ? ' off' : ''}`} id="home" ref={ref}>
      {h.video ? <video autoPlay muted loop playsInline poster={h.poster} src={h.video} /> : <Fx paused={off} />}
      <div>
        <div className="kick">{h.kicker}</div>
        <h1 className="hd">
          <span>
            <i>
              <em className="rot">
                {W.map((w, i) => (
                  <b key={i} className={i === s.k ? 'on' : i === s.prev ? 'out' : ''}>{w}</b>
                ))}
              </em>
            </i>
          </span>
        </h1>
        <p>{h.text}</p>
        <div className="cta">
          <a className="btn fill" href={h.btn1Url}>{h.btn1}</a>
          <a className="btn wh" href={h.joinUrl} {...ext(h.joinUrl)}>{h.btn2}</a>
        </div>
        {liveEv && (
          <a className="lp" href={liveEv.url || '#events'} {...ext(liveEv.url)}>
            <i />Live now: {liveEv.title}
          </a>
        )}
      </div>
      {art && (
        <div className="hart">
          <svg className="rg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="97" />
            <circle className="b" cx="100" cy="100" r="82" />
          </svg>
          <div className="fl">
            <img src={art} alt={c.brand.name} />
          </div>
        </div>
      )}
      <i className="scroll" />
    </section>
  );
}

/* ---------- timeline: the line sweeps from right to left ---------- */
function Timeline({ c }: { c: UggContent }) {
  const t = c.timeline;
  const ref = useRef<HTMLDivElement>(null);
  const n = t.items.length;

  useEffect(() => {
    const tl = ref.current;
    if (!tl) return;
    const rail = tl.querySelector('.rail') as HTMLElement | null;
    const fill = rail?.querySelector('i') as HTMLElement | null;
    if (!rail || !fill) return;

    const nds = [...tl.querySelectorAll('.nd')] as HTMLElement[];
    const cols = [...tl.querySelectorAll('.col')] as HTMLElement[];
    const T = 5600, HOLD = 1400, FADE = 700;
    let t0: number | null = null, raf = 0;
    let isVisible = false;

    let v = false;
    let len = 0;
    let ndPositions: number[] = [];

    const measure = () => {
      v = window.innerWidth <= 900;
      const r = rail.getBoundingClientRect();
      len = v ? r.height : r.width;
      if (len <= 0) return;
      ndPositions = nds.map((nd) => {
        const b = nd.getBoundingClientRect();
        return v ? r.bottom - (b.top + b.height / 2) : r.right - (b.left + b.width / 2);
      });
    };

    const clear = () => {
      nds.forEach((x) => x.classList.remove('lit'));
      cols.forEach((x) => x.classList.remove('lit'));
    };

    const loop = (now: number) => {
      if (!isVisible) return;
      if (len <= 0) measure();
      if (len <= 0) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const k = v ? 'height' : 'width';
      if (t0 === null) t0 = now + 400;
      let e = now - t0;
      if (e < 0) {
        raf = requestAnimationFrame(loop);
        return;
      }
      if (calm()) e = T;
      let p = Math.min(1, e / T);
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const L = p * len;
      fill.style[k] = L + 'px';
      fill.style.opacity = String(e > T + HOLD ? Math.max(0, 1 - (e - T - HOLD) / FADE) : 1);

      for (let i = 0; i < nds.length; i++) {
        const pos = ndPositions[i] ?? 0;
        const isLit = L >= pos - 2;
        if (nds[i].classList.contains('lit') !== isLit) {
          nds[i].classList.toggle('lit', isLit);
          if (cols[i]) cols[i].classList.toggle('lit', isLit);
        }
      }

      if (!calm() && e > T + HOLD + FADE) {
        t0 = now + 300;
        fill.style[k] = '0px';
        clear();
      }

      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          measure();
          raf = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.1 }
    );

    io.observe(tl);
    window.addEventListener('resize', measure);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [n]);

  return (
    <section className="s" id="timeline">
      <div className="hrow">
        <div>
          <R as="h2">{t.title}</R>
          <R as="p" className="sub">{t.sub}</R>
        </div>
      </div>
      <R className="tl" ref={ref} style={{ '--n': n } as React.CSSProperties}>
        <div className="rail"><i /></div>
        {t.items.map((x: any, i: number) => (
          <R
            key={i}
            className={`col ${i % 2 ? 'dn' : 'up'} ${x.status === 'live' ? 'lv' : ''}`}
            style={{ '--i': i + 1 } as React.CSSProperties}
          >
            <i className="nd" />
            <div className="it">
              <span className="idx">{pad(i)}</span>
              <span className="dt">{x.date}</span>
              <h3>{x.title}</h3>
              <span className={`tag ${x.status}`}>{x.status}</span>
            </div>
          </R>
        ))}
      </R>
    </section>
  );
}

/* ---------- team card with a small 3D tilt ---------- */
function Member({ m, i, logo }: { m: any; i: number; logo: string }) {
  const rectRef = useRef<DOMRect | null>(null);

  const onEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rectRef.current || e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  };

  const reset = (e: React.PointerEvent<HTMLDivElement>) => {
    rectRef.current = null;
    e.currentTarget.style.transform = '';
  };

  return (
    <R
      className="mem"
      style={{ '--i': i } as React.CSSProperties}
      onPointerEnter={onEnter}
      onPointerMove={tilt}
      onPointerLeave={reset}
    >
      <div className="ph">
        {m.img ? (
          <img src={m.img} alt={m.name} loading="lazy" decoding="async" />
        ) : logo ? (
          <img className="wm" src={logo} alt="" loading="lazy" decoding="async" />
        ) : (
          <b>{(m.name || '?')[0]}</b>
        )}
      </div>
      <span className="ix">{pad(i)}</span>
      <div className="inf">
        <p>{m.role}</p>
        <h3>{m.name}</h3>
        {m.link && <a className="ct" href={m.link} {...ext(m.link)}>Connect →</a>}
      </div>
    </R>
  );
}

/* ---------- events arena with carousel controls ---------- */
interface EventsSectionProps {
  c: UggContent;
  initialTournaments?: Tournament[];
}

function EventsSection({ c }: EventsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReduced, setIsReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const items = c.events.items;

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    q.addEventListener('change', handler);
    return () => q.removeEventListener('change', handler);
  }, []);

  // Optional auto-slide for accessibility and test suites
  useEffect(() => {
    if (isPaused || isReduced || items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isReduced, items.length]);

  const nextSlide = () => setActiveIdx((prev) => (prev + 1) % items.length);
  const prevSlide = () => setActiveIdx((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section className="s" id="events" aria-label="Tournaments Arena">
      <div className="hrow">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <R as="h2">{c.events.title}</R>
            <span className="tag live" style={{ fontSize: 10, letterSpacing: '.1em' }}>Tournaments Arena</span>
          </div>
          <R as="p" className="sub">{c.events.sub}</R>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Accessible auto-slide toggle and next/prev controls */}
          {!isReduced && (
            <button
              type="button"
              className="sm"
              style={{
                background: isPaused ? '#ff1e3822' : '#ffffff14',
                border: '1px solid ' + (isPaused ? '#ff1e38' : '#ffffff30'),
                color: '#fff',
                fontSize: 12,
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? "Resume tournament auto-slide" : "Pause tournament auto-slide"}
            >
              {isPaused ? "▶ Auto" : "❚❚ Pause"}
            </button>
          )}
          <button
            type="button"
            className="sm"
            onClick={prevSlide}
            aria-label="Previous Tournament"
            style={{ color: '#fff', background: '#ffffff14', border: '1px solid #ffffff30', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
          >
            ←
          </button>
          <button
            type="button"
            className="sm"
            onClick={nextSlide}
            aria-label="Next Tournament"
            style={{ color: '#fff', background: '#ffffff14', border: '1px solid #ffffff30', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
          >
            →
          </button>
          <R as="a" className="more" href={c.events.moreUrl}>{c.events.more} →</R>
        </div>
      </div>

      {/* Accessible slide indicator */}
      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${activeIdx + 1} of ${items.length}: ${items[activeIdx]?.title || 'Event'}`}
        className="sr-only"
      >
        {items[activeIdx]?.title}
      </div>

      <div className="evg">
        {items.map((x: any, i: number) => {
          const isLive = x.status === 'live';
          const isSelected = i === activeIdx;
          const ctaMap: Record<string, string> = { live: 'Register now', registering: 'Register', upcoming: 'Details' };
          const ctaText = x.cta || ctaMap[x.status] || 'Open';
          return (
            <R
              key={i}
              as="a"
              className={`ev ${isLive ? 'live' : ''} ${isSelected ? 'selected' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
              href={x.url || '#timeline'}
              onFocus={() => setActiveIdx(i)}
              onMouseEnter={() => setActiveIdx(i)}
              {...ext(x.url)}
            >
              {x.img && <img src={x.img} alt={x.title} loading="lazy" decoding="async" />}
              <b className="gh">{x.game}</b>
              <div className="ei">
                <span className={`tag ${x.status}`}>{x.status}</span>
                <div>
                  <h3>{x.title}</h3>
                  <div className="m">
                    <span>{x.date}</span>
                    <span>{x.game}</span>
                    <span>{x.meta}</span>
                  </div>
                </div>
              </div>
              <span className="ar">{ctaText} →</span>
            </R>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- main application component ---------- */
interface UggAppProps {
  initialTournaments?: Tournament[];
  initialContent?: UggContent;
}

function getInitialContent(initialTournaments?: Tournament[], initialContent?: UggContent): UggContent {
  const base = initialContent ? structuredClone(initialContent) : structuredClone(DEF);
  if (initialTournaments && initialTournaments.length > 0) {
    const dbItems = initialTournaments.map((t) => ({
      status: t.status === 'active' ? 'live' : t.status === 'upcoming' ? 'upcoming' : t.status === 'completed' ? 'completed' : 'registering',
      title: t.title,
      game: t.game,
      meta: t.date || 'Collegiate Tournament',
      date: t.date || 'TBD',
      img: t.posterUrl || '',
      url: t.formUrl || '#',
      cta: t.status === 'active' ? 'Register now' : 'Details'
    }));
    base.events.items = dbItems;
  }
  return base;
}

function SponsorItem({ x }: { x: { name: string; logo?: string; url?: string } }) {
  const [imgError, setImgError] = useState(false);
  const hasLogo = Boolean(x.logo && x.logo.trim() && !imgError);

  return (
    <a href={x.url || '#'} aria-label={x.name} {...ext(x.url)}>
      {hasLogo ? (
        <img
          src={x.logo}
          alt={x.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{x.name}</span>
      )}
    </a>
  );
}

export default function UggApp({ initialTournaments, initialContent }: UggAppProps) {
  const baseContent = useMemo(() => getInitialContent(initialTournaments, initialContent), [initialTournaments, initialContent]);
  const storageRaw = useSyncExternalStore(subscribeStorage, getClientStorage, getServerStorage);

  const savedContent = useMemo(() => {
    if (!storageRaw) return baseContent;
    try {
      return merge(baseContent, JSON.parse(storageRaw)) as UggContent;
    } catch {
      return baseContent;
    }
  }, [baseContent, storageRaw]);

  const c = savedContent;
  const router = useRouter();

  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('home');
  const [lb, setLb] = useState<string | null>(null);
  const glow = useRef<HTMLDivElement>(null);

  // Global Escape key listener to close modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLb(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const s = document.documentElement.style;
    if (c.theme?.accent) s.setProperty('--red', c.theme.accent);
    if (c.theme?.bg) s.setProperty('--bg', c.theme.bg);
  }, [c.theme]);

  // Desktop mouse glow follower
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (calm() || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    let gx = 0, gy = 0, q = false;
    const mv = (e: PointerEvent) => {
      gx = e.clientX; gy = e.clientY;
      if (q) return;
      q = true;
      requestAnimationFrame(() => {
        q = false;
        if (glow.current) {
          glow.current.style.transform = `translate3d(${gx - 280}px,${gy - 280}px,0)`;
        }
        const h = document.getElementById('home');
        if (h && !h.classList.contains('off')) {
          h.style.setProperty('--mx', String(((gx / window.innerWidth - 0.5) * 2).toFixed(2)));
          h.style.setProperty('--my', String(((gy / window.innerHeight - 0.5) * 2).toFixed(2)));
        }
      });
    };
    window.addEventListener('pointermove', mv, { passive: true });
    return () => window.removeEventListener('pointermove', mv);
  }, []);

  // Smooth anchor link click handling
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || (a.getAttribute('href')?.length ?? 0) < 2) return;
      const href = a.getAttribute('href')!;
      const t = document.getElementById(href.slice(1));
      if (t) {
        e.preventDefault();
        goTo(t);
        setMenu(false);
      }
    };
    document.addEventListener('click', click);
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      router.push('/admin');
    }
    return () => document.removeEventListener('click', click);
  }, [router]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.5 }
    );
    document.querySelectorAll('section.s').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const f = c.footer;
  const footerCols = useMemo(() => {
    return f.cols.map((col: any, idx: number) => {
      if (idx === 0 && col.title === 'Explore') {
        return DEF.footer.cols[0];
      }
      return col;
    });
  }, [f.cols]);
  const sp = c.sponsors.items.map((x: any) => (typeof x === 'string' ? { name: x, logo: '', url: '#' } : x));
  const tick = Array.from({ length: Math.max(2, Math.ceil(8 / sp.length)) }, () => sp).flat();

  return (
    <>
      <div id="glow" ref={glow} />
      <div id="dots">
        {IDS.map((id) => (
          <a key={id} href={'#' + id} title={id} className={active === id ? 'on' : ''} />
        ))}
      </div>

      <nav>
        <a className="logo" href="#home">
          {c.brand.logo && <img src={c.brand.logo} alt="" />}
          <span>
            <b>{c.brand.name}</b>
            <small>{c.brand.sub}</small>
          </span>
        </a>
        <div className={`links${menu ? ' open' : ''}`}>
          {c.nav.links.map((l: any, i: number) => (
            <a key={i} href={l.u} className={active === l.u.slice(1) ? 'on' : ''}>
              {l.t}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="inst">
            {c.nav.logos.map((l: any, i: number) => (
              <a key={i} href={l.url || '#'} aria-label={l.alt} {...ext(l.url)}>
                <img src={l.img} alt={l.alt} />
              </a>
            ))}
          </div>
          <button type="button" className="burger" aria-label="Menu" onClick={() => setMenu((m) => !m)}>☰</button>
        </div>
      </nav>

      <main>
        <Hero c={c} />
        <EventsSection c={c} initialTournaments={initialTournaments} />

        <section className="s" id="about">
          <R as="h2">{c.about.title}</R>
          <R as="p" className="sub" style={{ fontSize: 20, maxWidth: '62ch' }}>
            {c.about.text}
          </R>
          <div className="stats">
            {c.about.stats.map((x: any, i: number) => (
              <R key={i} className="stat" style={{ '--i': i } as React.CSSProperties}>
                <Num v={x.n} />
                <span>{x.l}</span>
              </R>
            ))}
          </div>
        </section>

        <section className="s split" id="esports">
          {[
            { cls: 'l', data: c.esports },
            { cls: 'r', data: c.gamedev },
          ].map(({ cls, data: x }) => (
            <div key={cls} className={cls}>
              <R as="h2">{x.title}</R>
              <R as="p">{x.text}</R>
              <R as="ul">
                {x.points.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </R>
              <R as="a" className="btn" style={{ alignSelf: 'flex-start' }} href={x.url} {...ext(x.url)}>
                {x.btn}
              </R>
              {x.img && <img className="bgimg" src={x.img} alt="" loading="lazy" decoding="async" />}
              <span className="art">{x.art}</span>
            </div>
          ))}
        </section>

        <Timeline c={c} />

        <section className="s" id="gallery">
          <R as="h2">{c.gallery.title}</R>
          <R as="p" className="sub">{c.gallery.sub}</R>
          <div className="gal">
            {c.gallery.items.map((g: any, i: number) => (
              <R
                key={i}
                as="figure"
                tabIndex={0}
                role="button"
                aria-label={`View photo: ${g.caption}`}
                style={{ '--i': i, cursor: g.img ? 'pointer' : 'default' } as React.CSSProperties}
                onClick={() => g.img && setLb(g.img)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if ((e.key === 'Enter' || e.key === ' ') && g.img) {
                    e.preventDefault();
                    setLb(g.img);
                  }
                }}
              >
                {g.img && <img src={g.img} alt={g.caption} loading="lazy" decoding="async" />}
                <figcaption>{g.caption}</figcaption>
              </R>
            ))}
          </div>
        </section>

        <section className="s" id="sponsors">
          <div className="hrow">
            <div>
              <R as="h2">{c.sponsors.title}</R>
              <R as="p" className="sub">{c.sponsors.sub}</R>
            </div>
          </div>
          <div className="tick">
            <div>
              {[...tick, ...tick].map((x: any, i: number) => (
                <SponsorItem key={i} x={x} />
              ))}
            </div>
          </div>
          <R className="sbtn">
            <a className="btn fill" href={c.sponsors.link || `mailto:${c.sponsors.email}`} {...ext(c.sponsors.link)}>
              <b>{c.sponsors.cta} →</b>
              <small>{c.sponsors.email}</small>
            </a>
          </R>
        </section>

        <section className="s tsec" id="team">
          <R as="h2">{c.team.title}</R>
          <R as="p" className="sub">{c.team.sub}</R>
          <div className="team">
            {c.team.items.map((m: any, i: number) => (
              <Member key={i} m={m} i={i} logo={c.brand.logo} />
            ))}
          </div>
        </section>

        <section className="s" id="join">
          <div className="join">
            <R as="h2">
              {c.cta.title}&nbsp;<em>{c.cta.accent}</em>
            </R>
            <R className="words">
              {c.cta.words.map((w: string, i: number) => (
                <span key={i}>{w}</span>
              ))}
            </R>
            <R as="a" className="btn fill" href={c.cta.url} {...ext(c.cta.url)}>
              {c.cta.btn}
            </R>
          </div>
          <footer>
            <div>
              <a className="logo" style={{ color: '#fff' }} href="#home">
                {c.brand.logo && <img src={c.brand.logo} alt="" />}
                <span>
                  <b>{c.brand.name}</b>
                  <small>{c.brand.sub}</small>
                </span>
              </a>
              <p style={{ marginTop: 12, color: 'var(--mut)' }}>{f.about}</p>
            </div>
            {footerCols.map((k: any, i: number) => (
              <div key={i}>
                <h4>{k.title}</h4>
                {k.links.map((l: any, j: number) => (
                  <a key={j} href={l.u} {...ext(l.u)}>
                    {l.t}
                  </a>
                ))}
              </div>
            ))}
          </footer>
          <div className="copy">
            📍 {f.location} &nbsp;|&nbsp; {f.copy} &nbsp;|&nbsp;{' '}
            {c.socials.map((s: any, i: number) => (
              <a key={i} style={{ display: 'inline', marginRight: 10 }} href={s.u} {...ext(s.u)}>
                {s.t}
              </a>
            ))}
            <Link
              id="ab"
              href="/admin"
              title="Database Portal"
              aria-label="Database Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                verticalAlign: 'middle',
                marginLeft: 10,
                width: 26,
                height: 26,
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--mut)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--red)';
                e.currentTarget.style.background = 'rgba(225, 29, 46, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--mut)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Link>
            <span style={{ float: 'right', color: 'var(--red)' }} className="hd">
              {f.tagline}
            </span>
          </div>
        </section>
      </main>

      {/* Lightbox modal for gallery */}
      <div
        className={`lb${lb ? ' on' : ''}`}
        onClick={() => setLb(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Image Preview"
      >
        {lb && (
          <div
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLb(null)}
              aria-label="Close preview"
              style={{
                position: 'absolute',
                top: -38,
                right: 0,
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#fff',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ✕
            </button>
            <img src={lb} alt="Preview" />
          </div>
        )}
      </div>
    </>
  );
}

import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ResolvedBook, ResolvedScene } from './timing';
import { C, sans, serif } from './theme';

type Props = { scene: ResolvedScene; rb: ResolvedBook };

const FADE = 24; // rasmlar almashinuvi (kadr)

// ───────────── Umumiy yordamchilar ─────────────

const imgSrc = (rb: ResolvedBook, key: string) => staticFile(`images/${rb.book.slug}/${key}.jpg`);

/** Hozir aktiv diktor qatori (0 dan) */
const useActiveLine = (scene: ResolvedScene) => {
  const frame = useCurrentFrame();
  let idx = -1;
  scene.resolved.forEach((l, i) => {
    if (frame >= l.start - 6) idx = i;
  });
  return { frame, idx };
};

/** Pastdan ko'tarilib, shaffoflikdan chiqish */
const useReveal = (delay: number, distance = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` } as React.CSSProperties;
};

/** Sahna davomida almashinadigan rasmlar: har biri o'z yo'nalishida sekin harakatlanadi (Ken Burns) */
const useSlots = (scene: ResolvedScene) => {
  const n = scene.images.length;
  const slot = scene.frames / n;
  return scene.images.map((key, i) => ({
    key,
    i,
    from: i === 0 ? 0 : i * slot - FADE / 2,
    to: i === n - 1 ? scene.frames : (i + 1) * slot + FADE / 2,
  }));
};

const kenBurns = (i: number, t: number) => {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    scale: interpolate(t, [0, 1], [1.04, 1.16]),
    x: interpolate(t, [0, 1], [-18 * dir, 18 * dir]),
    y: interpolate(t, [0, 1], [10 * dir, -10 * dir]),
  };
};

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ───────────── Fon va bezaklar ─────────────

/** Hozirgi rasmning xira, qoraytirilgan nusxasi — butun ekran foni */
const Backdrop: React.FC<Props> = ({ scene, rb }) => {
  const frame = useCurrentFrame();
  const slots = useSlots(scene);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {slots.map((s) => {
        const opacity = interpolate(frame, [s.from, s.from + FADE, s.to - FADE, s.to], [0, 1, 1, 0], clampOpts);
        const kb = kenBurns(s.i, interpolate(frame, [s.from, s.to], [0, 1], clampOpts));
        return (
          <AbsoluteFill key={s.key} style={{ opacity: s.i === 0 && frame < s.from + FADE ? 1 : opacity }}>
            <Img
              src={imgSrc(rb, s.key)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(38px) brightness(0.55) saturate(1.2)',
                transform: `scale(${1.25 * kb.scale}) translate(${kb.x}px, ${kb.y}px)`,
              }}
            />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: 'linear-gradient(100deg, rgba(6,14,28,0.92) 0%, rgba(6,14,28,0.55) 55%, rgba(6,14,28,0.3) 100%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: `radial-gradient(${C.gold} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px' }} />
      <Dust />
    </AbsoluteFill>
  );
};

/** Sekin ko'tariladigan oltin zarralar */
const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 26 }, (_, i) => {
        const speed = 0.25 + ((i * 37) % 10) / 22;
        const x = ((i * 193) % 1920) + Math.sin((frame + i * 40) / 60) * 24;
        const y = 1180 - ((frame * speed * 1.6 + i * 131) % 1260);
        const size = 3 + ((i * 7) % 5);
        const o = 0.12 + ((i * 11) % 7) / 40;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: C.gold, opacity: o, boxShadow: `0 0 ${size * 3}px ${C.gold}` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Oltin hoshiya va burchak bezaklari */
const Frame: React.FC = () => {
  const corner = (extra: React.CSSProperties) => (
    <div style={{ position: 'absolute', width: 54, height: 54, border: '0 solid transparent', ...extra }} />
  );
  const b = `4px solid ${C.gold}`;
  return (
    <>
      <div style={{ position: 'absolute', inset: 30, border: '2px solid rgba(217,173,85,0.45)', borderRadius: 6 }} />
      {corner({ top: 30, left: 30, borderTop: b, borderLeft: b })}
      {corner({ top: 30, right: 30, borderTop: b, borderRight: b })}
      {corner({ bottom: 30, left: 30, borderBottom: b, borderLeft: b })}
      {corner({ bottom: 30, right: 30, borderBottom: b, borderRight: b })}
    </>
  );
};

// ───────────── Rasm kartasi ─────────────

/** Oltin hoshiyali foto-karta: rasm butunligicha ko'rinadi, ustida sekin harakat va almashinuv */
const PhotoCard: React.FC<Props & { width?: number; height?: number; right?: number; top?: number }> = ({
  scene, rb, width = 800, height = 680, right = 110, top = 120,
}) => {
  const frame = useCurrentFrame();
  const slots = useSlots(scene);
  const enter = useReveal(6, 60);
  const tilt = interpolate(frame, [0, scene.frames], [-1.6, 1.2]);
  const active = slots.find((s) => frame >= s.from && frame < s.to) ?? slots[slots.length - 1];
  return (
    <div style={{ position: 'absolute', right, top, width, height, opacity: enter.opacity, transform: `${enter.transform} rotate(${tilt}deg)` }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 14,
          overflow: 'hidden',
          border: `5px solid ${C.gold}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 0 10px rgba(217,173,85,0.12)',
          background: '#0b1627',
        }}
      >
        {slots.map((s) => {
          const opacity = interpolate(frame, [s.from, s.from + FADE, s.to - FADE, s.to], [0, 1, 1, 0], clampOpts);
          const kb = kenBurns(s.i, interpolate(frame, [s.from, s.to], [0, 1], clampOpts));
          if (rb.book.wide?.includes(s.key)) {
            // Panorama: to'liq balandlikda, chapdan o'ngga sekin siljiydi
            const pan = interpolate(frame, [s.from, s.to], [25, 75], clampOpts);
            return (
              <AbsoluteFill key={s.key} style={{ opacity: s.i === 0 && frame < s.from + FADE ? 1 : opacity }}>
                <Img src={imgSrc(rb, s.key)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${pan}% 50%` }} />
              </AbsoluteFill>
            );
          }
          return (
            <AbsoluteFill key={s.key} style={{ opacity: s.i === 0 && frame < s.from + FADE ? 1 : opacity }}>
              <Img src={imgSrc(rb, s.key)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(22px) brightness(0.5)', transform: 'scale(1.3)' }} />
              <Img
                src={imgSrc(rb, s.key)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${kb.scale}) translate(${kb.x}px, ${kb.y}px)` }}
              />
            </AbsoluteFill>
          );
        })}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.45)' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, fontSize: 17, color: 'rgba(245,236,215,0.6)', textAlign: 'right' }}>
        {rb.credits[active.key] ?? ''}
      </div>
    </div>
  );
};

// ───────────── Matn qismlari ─────────────

const Kicker: React.FC<{ text?: string }> = ({ text }) => {
  const style = useReveal(2, 20);
  if (!text) return null;
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', color: C.gold, fontWeight: 600 }}>
      <span style={{ width: 54, height: 3, background: C.gold, display: 'inline-block' }} />
      {text}
    </div>
  );
};

const Heading: React.FC<{ text?: string; size?: number }> = ({ text, size = 92 }) => {
  const style = useReveal(8, 50);
  if (!text) return null;
  return (
    <div style={{ ...style, fontFamily: serif, fontWeight: 900, fontSize: size, lineHeight: 1.08, color: C.cream, marginTop: 22, textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
      {text}
    </div>
  );
};

/** Katta oltin yil/raqam «muhri»: yangi qatorga o'tganda sakrab chiqadi */
const Stamp: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const { frame, idx } = useActiveLine(scene);
  const { fps } = useVideoConfig();
  if (!scene.stamps) return null;
  let at = -1;
  scene.stamps.forEach((s, i) => {
    if (s && i <= idx) at = i;
  });
  if (at < 0) return null;
  const start = scene.resolved[at].start - 6;
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 120 } });
  const text = scene.stamps[at] ?? '';
  return (
    <div
      key={at}
      style={{
        marginTop: 36,
        fontFamily: serif,
        fontWeight: 900,
        fontSize: text.length > 7 ? 120 : 210,
        lineHeight: 1,
        color: C.gold,
        opacity: Math.min(1, p),
        transform: `scale(${0.6 + 0.4 * p}) translateX(${(1 - p) * -60}px)`,
        transformOrigin: 'left center',
        textShadow: '0 0 50px rgba(217,173,85,0.55), 0 8px 30px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  );
};

/** Kalit so'zlar: qatorlar ketidan birin-ketin chiqadi */
const Chips: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!scene.chips?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 38, maxWidth: 940 }}>
      {scene.chips.map((chip, i) => {
        const line = scene.resolved[Math.min(i, scene.resolved.length - 1)];
        const p = spring({ frame: frame - (line.start + 4), fps, config: { damping: 14 } });
        return (
          <div
            key={chip}
            style={{
              opacity: Math.min(1, p),
              transform: `scale(${0.7 + 0.3 * p}) translateY(${(1 - p) * 24}px)`,
              padding: '12px 28px',
              borderRadius: 40,
              border: `2px solid ${C.gold}`,
              background: 'rgba(217,173,85,0.14)',
              color: C.cream,
              fontSize: 34,
              fontWeight: 600,
              boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
            }}
          >
            {chip}
          </div>
        );
      })}
    </div>
  );
};

/** Diktor ovozi: har bir qator o'z vaqtida */
const Narration: React.FC<{ scene: ResolvedScene; slug: string }> = ({ scene, slug }) => (
  <>
    {scene.resolved.map((l) => (
      <Sequence key={l.file} from={l.start} durationInFrames={l.frames + 6}>
        <Audio src={staticFile(`audio/${slug}/${l.file}`)} />
      </Sequence>
    ))}
  </>
);

/** Subtitr: faqat shu paytda aytilayotgan qator */
const Captions: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = [...scene.resolved].reverse().find((l) => frame >= l.start - 4);
  if (!line) return null;
  const local = frame - line.start;
  const opacity = interpolate(local, [-4, 6, line.frames - 4, line.frames + 6], [0, 1, 1, 0], clampOpts);
  return (
    <div
      style={{
        position: 'absolute',
        left: 130,
        right: 130,
        bottom: 66,
        minHeight: 104,
        display: 'flex',
        alignItems: 'center',
        padding: '18px 34px',
        borderRadius: 18,
        background: 'rgba(5, 12, 24, 0.82)',
        borderLeft: `6px solid ${C.gold}`,
        fontSize: 35,
        lineHeight: 1.35,
        opacity,
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
      }}
    >
      {line.text}
    </div>
  );
};

const Shell: React.FC<Props & { children: React.ReactNode }> = ({ scene, rb, children }) => (
  <AbsoluteFill style={{ fontFamily: sans, color: C.cream, fontVariantNumeric: 'lining-nums' }}>
    <Backdrop scene={scene} rb={rb} />
    <Frame />
    {children}
    <Captions scene={scene} />
    <Narration scene={scene} slug={rb.book.slug} />
  </AbsoluteFill>
);

// ───────────── Sahna turlari ─────────────

/** Oddiy hikoya sahnasi: chapda matn va muhr, o'ngda rasm kartasi */
export const StoryScene: React.FC<Props> = (p) => (
  <Shell {...p}>
    <div style={{ position: 'absolute', left: 120, top: 120, width: 900 }}>
      <Kicker text={p.scene.kicker} />
      <Heading text={p.scene.heading} />
      <Stamp scene={p.scene} />
      <Chips scene={p.scene} />
    </div>
    <PhotoCard {...p} />
  </Shell>
);

/** Boshlanish: katta sarlavha, muallif va yillar */
export const TitleScene: React.FC<Props> = (p) => {
  const line = useReveal(18, 30);
  const years = useReveal(34, 30);
  const frame = useCurrentFrame();
  const w = interpolate(frame, [20, 70], [0, 520], clampOpts);
  return (
    <Shell {...p}>
      <div style={{ position: 'absolute', left: 120, top: 190, width: 980 }}>
        <Kicker text={p.scene.kicker} />
        <Heading text={p.scene.heading} size={168} />
        <div style={{ height: 5, width: w, background: `linear-gradient(90deg, ${C.gold}, transparent)`, marginTop: 34 }} />
        <div style={{ ...line, fontFamily: serif, fontSize: 56, fontWeight: 700, marginTop: 34 }}>{p.rb.book.author}</div>
        <div style={{ ...years, fontSize: 42, color: C.gold, marginTop: 14, letterSpacing: 4 }}>{p.rb.book.years}</div>
      </div>
      <PhotoCard {...p} width={720} height={700} top={110} />
    </Shell>
  );
};

/** Iqtibos sahnasi: katta qo'shtirnoq va so'zma-so'z paydo bo'ladigan matn */
export const QuoteScene: React.FC<Props> = (p) => {
  const { frame, idx } = useActiveLine(p.scene);
  const quote = p.scene.quote;
  const words = (quote?.text ?? '').split(' ');
  const start = p.scene.resolved[Math.min(1, p.scene.resolved.length - 1)].start;
  const perWord = 5;
  const byOpacity = interpolate(frame, [start + words.length * perWord, start + words.length * perWord + 15], [0, 1], clampOpts);
  return (
    <Shell {...p}>
      <div style={{ position: 'absolute', left: 120, top: 120, width: 960 }}>
        <Kicker text={p.scene.kicker} />
        <Heading text={p.scene.heading} size={80} />
        <div style={{ position: 'relative', marginTop: 40, opacity: idx >= 1 ? 1 : 0.3 }}>
          <div style={{ position: 'absolute', left: -14, top: -64, fontFamily: serif, fontSize: 220, color: C.gold, opacity: 0.55, lineHeight: 1 }}>“</div>
          <div style={{ fontFamily: serif, fontSize: 60, lineHeight: 1.3, fontWeight: 700, color: C.cream, paddingLeft: 16, paddingTop: 40 }}>
            {words.map((w, i) => {
              const o = interpolate(frame, [start + i * perWord, start + i * perWord + 10], [0, 1], clampOpts);
              return (
                <span key={i} style={{ opacity: o, display: 'inline-block', marginRight: 14, transform: `translateY(${(1 - o) * 18}px)` }}>
                  {w}
                </span>
              );
            })}
          </div>
          <div style={{ marginTop: 26, paddingLeft: 16, fontSize: 34, color: C.gold, opacity: byOpacity }}>— {quote?.by}</div>
        </div>
      </div>
      <PhotoCard {...p} />
    </Shell>
  );
};

/** Yo'l xaritasi: shaharlar ketma-ket paydo bo'ladi, ular orasida chiziq chiziladi */
export const JourneyScene: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const route = p.scene.route ?? [];
  const W = 900;
  const H = 700;
  const lons = route.map((r) => r.lon);
  const lats = route.map((r) => r.lat);
  const [minLon, maxLon] = [Math.min(...lons) - 2.2, Math.max(...lons) + 2.2];
  const [minLat, maxLat] = [Math.min(...lats) - 2, Math.max(...lats) + 2];
  const k = Math.min(W / (maxLon - minLon), (H / (maxLat - minLat)) * 1.18); // kenglik gradusi kichrayishi uchun taxminiy tuzatish
  const pos = route.map((r) => ({ x: W / 2 + (r.lon - (minLon + maxLon) / 2) * k, y: H / 2 - (r.lat - (minLat + maxLat) / 2) * k * 0.85 }));
  const LEG = 50;
  /** Yo'l shu shaharga yetib kelgan kadr (birinchi shahar — qator boshida) */
  const arrive = (i: number) => {
    const base = p.scene.resolved[route[i].line].start;
    if (i === 0) return base;
    return base + (route[i].line === route[i - 1].line ? 30 : 0) + LEG;
  };
  const enter = useReveal(6, 50);
  return (
    <Shell {...p}>
      <div style={{ position: 'absolute', left: 120, top: 120, width: 760 }}>
        <Kicker text={p.scene.kicker} />
        <Heading text={p.scene.heading} />
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {route.map((r, i) => {
            const q = spring({ frame: frame - arrive(i), fps, config: { damping: 14 } });
            return (
              <div key={r.name} style={{ opacity: Math.min(1, q), transform: `translateX(${(1 - q) * -40}px)`, display: 'flex', alignItems: 'baseline', gap: 22 }}>
                <span style={{ fontFamily: serif, fontWeight: 900, fontSize: 52, color: C.cream }}>{r.name}</span>
                <span style={{ fontSize: 32, color: C.gold }}>{r.note}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', right: 100, top: 150, width: W, height: H, opacity: enter.opacity, transform: enter.transform }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 18, border: `4px solid ${C.gold}`, background: 'linear-gradient(160deg, rgba(20,54,90,0.85), rgba(8,22,40,0.92))', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={W} y1={(H / 8) * i} y2={(H / 8) * i} stroke="rgba(217,173,85,0.10)" strokeWidth={1} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} y1={0} y2={H} x1={(W / 10) * i} x2={(W / 10) * i} stroke="rgba(217,173,85,0.10)" strokeWidth={1} />
          ))}
          {pos.slice(1).map((b, i) => {
            const a = pos[i];
            const t = interpolate(frame, [arrive(i + 1) - LEG, arrive(i + 1)], [0, 1], clampOpts);
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.gold} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} opacity={0.95} />
                {t > 0 && t < 1 && <circle cx={a.x + (b.x - a.x) * t} cy={a.y + (b.y - a.y) * t} r={13} fill={C.cream} style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }} />}
              </g>
            );
          })}
          {pos.map((q, i) => {
            const s = spring({ frame: frame - arrive(i), fps, config: { damping: 9, stiffness: 140 } });
            const left = q.x > W * 0.6;
            return (
              <g key={route[i].name}>
                <g transform={`translate(${q.x} ${q.y}) scale(${Math.min(1.2, s)})`} opacity={Math.min(1, s)}>
                  <circle r={24} fill="rgba(217,173,85,0.25)" />
                  <circle r={13} fill={C.gold} stroke={C.cream} strokeWidth={3} />
                </g>
                <text x={q.x + (left ? -34 : 34)} y={q.y + (i % 2 === 0 ? -16 : 50)} textAnchor={left ? 'end' : 'start'} fill={C.cream} fontFamily={serif} fontWeight={900} fontSize={38} stroke="#0a1a2f" strokeWidth={7} paintOrder="stroke" strokeLinejoin="round" opacity={Math.min(1, s)}>
                  {route[i].name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Shell>
  );
};

/** Yakun: platformaga chaqiruv */
export const OutroScene: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(frame / 7);
  const brand = useReveal(30, 30);
  const cta = useReveal(52, 30);
  return (
    <Shell {...p}>
      <div style={{ position: 'absolute', left: 120, top: 190, width: 980 }}>
        <Kicker text={p.scene.kicker} />
        <Heading text={p.scene.heading} size={110} />
        <div style={{ ...brand, marginTop: 40, fontSize: 40, color: C.cream, lineHeight: 1.4, maxWidth: 860 }}>
          To‘liq matn, qidiruv, taqdimot va 3D/360° obyektlar — <b style={{ color: C.gold }}>Manbalar</b> bo‘limida.
        </div>
        <div
          style={{
            opacity: cta.opacity,
            marginTop: 46,
            display: 'inline-block',
            transform: `${cta.transform} scale(${pulse})`,
            padding: '20px 46px',
            borderRadius: 60,
            background: C.gold,
            color: '#10213a',
            fontSize: 44,
            fontWeight: 600,
            boxShadow: '0 12px 40px rgba(217,173,85,0.45)',
          }}
        >
          Digital History Teacher
        </div>
      </div>
      <PhotoCard {...p} />
    </Shell>
  );
};

import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ResolvedScene } from './timing';
import { C, sans, serif } from './theme';

/**
 * Sahna foni: sekin zoom (Ken Burns) qilinadigan rasm, ustida to'q gradient (matn o'qilishi uchun),
 * vignetka va oltin hoshiya. `light` — sarlavha sahnasi uchun rasm ko'proq ko'rinadi.
 */
export const Backdrop: React.FC<{ scene: ResolvedScene; light?: boolean; flip?: boolean; children: React.ReactNode }> = ({
  scene,
  light,
  flip,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = frame / scene.frames;
  const scale = interpolate(t, [0, 1], [1.08, 1.24]);
  const shift = interpolate(t, [0, 1], [0, flip ? -70 : 70]);
  const left = light ? 0.9 : 0.88;
  const right = light ? 0.25 : 0.55;
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: sans, color: C.cream, fontVariantNumeric: 'lining-nums' }}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={staticFile(scene.image)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${shift}px)` }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: `linear-gradient(90deg, rgba(6,14,28,${left}) 0%, rgba(6,14,28,${(left + right) / 2}) 45%, rgba(6,14,28,${right}) 100%)` }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill
        style={{ opacity: 0.06, backgroundImage: `radial-gradient(${C.gold} 1.5px, transparent 1.5px)`, backgroundSize: '48px 48px' }}
      />
      <div style={{ position: 'absolute', inset: 32, border: '2px solid rgba(217,173,85,0.45)', borderRadius: 6 }} />
      <div style={{ position: 'absolute', top: 58, right: 80, fontSize: 18, color: 'rgba(245,236,215,0.55)', maxWidth: 760, textAlign: 'right' }}>
        Rasm: {scene.credit}
      </div>
      {children}
    </AbsoluteFill>
  );
};

/** Kadr bo'yicha paydo bo'lish: pastdan ko'tarilib, shaffoflikdan chiqadi */
export const useReveal = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return { opacity: p, transform: `translateY(${(1 - p) * 40}px)` } as React.CSSProperties;
};

export const Heading: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 84 }) => (
  <div style={{ fontFamily: serif, fontWeight: 900, fontSize: size, color: C.cream, lineHeight: 1.1, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
    {children}
  </div>
);

/** Diktor ovozi: har bir qator o'z vaqtida */
export const Narration: React.FC<{ scene: ResolvedScene }> = ({ scene }) => (
  <>
    {scene.lines.map((l) => (
      <Sequence key={l.file} from={l.start} durationInFrames={l.frames + 6}>
        <Audio src={staticFile(`audio/${l.file}`)} />
      </Sequence>
    ))}
  </>
);

/** Subtitr: faqat shu paytda aytilayotgan qator ko'rinadi */
export const Captions: React.FC<{ scene: ResolvedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = [...scene.lines].reverse().find((l) => frame >= l.start - 4);
  if (!line) return null;
  const local = frame - line.start;
  const opacity = interpolate(local, [-4, 6, line.frames - 4, line.frames + 6], [0, 1, 1, 0.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 160,
        right: 160,
        bottom: 64,
        minHeight: 110,
        display: 'flex',
        alignItems: 'center',
        padding: '20px 36px',
        borderRadius: 18,
        background: 'rgba(5, 12, 24, 0.78)',
        borderLeft: `6px solid ${C.gold}`,
        fontSize: 36,
        lineHeight: 1.35,
        opacity,
      }}
    >
      {line.text}
    </div>
  );
};

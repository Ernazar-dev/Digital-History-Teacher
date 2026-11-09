import React from 'react';
import { Composition } from 'remotion';
import { BookVideo } from './Video';
import { RESOLVED } from './registry';
import { FPS } from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    {RESOLVED.map((r) => (
      <Composition
        key={r.book.slug}
        id={r.book.compId}
        component={BookVideo}
        defaultProps={{ slug: r.book.slug }}
        durationInFrames={r.total}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
  </>
);

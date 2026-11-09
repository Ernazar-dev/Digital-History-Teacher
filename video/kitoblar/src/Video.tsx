import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { JourneyScene, OutroScene, QuoteScene, StoryScene, TitleScene } from './engine';
import { RESOLVED } from './registry';
import type { ResolvedBook, ResolvedScene } from './timing';
import { TRANSITION } from './theme';
import type { SceneKind } from './types';

const VIEWS: Record<SceneKind, React.FC<{ scene: ResolvedScene; rb: ResolvedBook }>> = {
  title: TitleScene,
  story: StoryScene,
  journey: JourneyScene,
  quote: QuoteScene,
  outro: OutroScene,
};

export const BookVideo: React.FC<{ slug: string }> = ({ slug }) => {
  const rb = RESOLVED.find((r) => r.book.slug === slug);
  if (!rb) throw new Error(`Noma'lum kitob: ${slug}`);
  return (
    <AbsoluteFill style={{ background: '#0a1a2f' }}>
      <TransitionSeries>
        {rb.scenes.flatMap((scene, i) => {
          const View = VIEWS[scene.kind];
          const items = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.frames}>
              <View scene={scene} rb={rb} />
            </TransitionSeries.Sequence>,
          ];
          if (i < rb.scenes.length - 1) {
            items.push(<TransitionSeries.Transition key={`${scene.id}-t`} presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />);
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

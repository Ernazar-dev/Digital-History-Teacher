import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import {
  AnkaraScene,
  ArmyScene,
  CampaignsScene,
  FinaleScene,
  GovernmentScene,
  LegacyScene,
  OutroScene,
  RiseScene,
  SourcesScene,
  TacticsScene,
  TitleScene,
} from './scenes';
import { SCENES } from './timing';
import { TRANSITION } from './theme';

const COMPONENTS: Record<string, React.FC<{ scene: (typeof SCENES)[number] }>> = {
  title: TitleScene,
  rise: RiseScene,
  campaigns: CampaignsScene,
  tactics: TacticsScene,
  ankara: AnkaraScene,
  government: GovernmentScene,
  army: ArmyScene,
  sources: SourcesScene,
  finale: FinaleScene,
  legacy: LegacyScene,
  outro: OutroScene,
};

export const AmirTemurVideo: React.FC = () => (
  <AbsoluteFill style={{ background: '#0a1a2f' }}>
    <TransitionSeries>
      {SCENES.flatMap((scene, i) => {
        const Scene = COMPONENTS[scene.id];
        const items = [
          <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.frames}>
            <Scene scene={scene} />
          </TransitionSeries.Sequence>,
        ];
        if (i < SCENES.length - 1) {
          items.push(
            <TransitionSeries.Transition
              key={`${scene.id}-t`}
              presentation={fade()}
              timing={linearTiming({ durationInFrames: TRANSITION })}
            />,
          );
        }
        return items;
      })}
    </TransitionSeries>
  </AbsoluteFill>
);

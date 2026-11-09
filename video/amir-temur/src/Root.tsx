import React from 'react';
import { Composition } from 'remotion';
import { AmirTemurVideo } from './Video';
import { TOTAL_FRAMES } from './timing';
import { FPS } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="AmirTemur" component={AmirTemurVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
);

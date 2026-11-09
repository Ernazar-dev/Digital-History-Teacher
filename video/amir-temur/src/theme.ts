import { loadFont as loadSerif } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';

export const serif = loadSerif('normal', { weights: ['700', '900'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const sans = loadSans('normal', { weights: ['400', '600'], subsets: ['latin', 'latin-ext'] }).fontFamily;

export const C = {
  bg: '#0a1a2f',
  bg2: '#14365a',
  gold: '#d9ad55',
  cream: '#f5ecd7',
  teal: '#3aa0ad',
  muted: '#9fb3c8',
};

export const FPS = 30;
export const TRANSITION = 15; // kadr (0.5 s)

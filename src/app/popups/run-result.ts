import gsap from 'gsap';
import { Container, Graphics, Text } from 'pixi.js';
import { RunResult } from '../models/highscore.model';
import { TranslationService } from '../services/translation.service';

const TEXT_COLOR = 0x3c2f1e;
const RECORD_COLOR = 0xe06000;
const HIGHLIGHT_COLOR = 0x1a8fd6;
// eslint-disable-next-line no-magic-numbers
const CONFETTI_COLORS = [0xffcc00, 0xff5577, 0x33bbff, 0x66dd55, 0xaa66ff];
const CONFETTI_COUNT = 40;
const COUNT_UP_SECONDS = 1.2;

function label(content: string, size: number, y: number, fill = TEXT_COLOR): Text {
  const text = new Text({ text: content, style: { fontFamily: 'DefaultFont', fontSize: size, fill } });
  // eslint-disable-next-line no-magic-numbers
  text.anchor.set(0.5);
  text.y = y;
  return text;
}

// finite repeat: the popup is only detached, never destroyed, so an endless tween would outlive it
function startPulse(target: Container): void {
  // eslint-disable-next-line no-magic-numbers
  gsap.to(target.scale, { x: 1.12, y: 1.12, duration: 0.45, yoyo: true, repeat: 11, ease: 'sine.inOut' });
}

function spawnConfetti(parent: Container, y: number): void {
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    // eslint-disable-next-line no-magic-numbers
    const piece = new Graphics().rect(-4, -2.5, 8, 5).fill(CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    piece.y = y;
    parent.addChild(piece);
    /* eslint-disable no-magic-numbers */
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const delay = COUNT_UP_SECONDS + Math.random() * 0.15;
    const duration = 1.6 + Math.random() * 0.8;
    gsap.to(piece, {
      x: Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance + 60,
      rotation: Math.random() * 12 - 6,
      duration,
      delay,
      ease: 'power2.out',
      onComplete: () => piece.destroy(),
    });
    gsap.to(piece, { alpha: 0, duration: 0.6, delay: delay + duration - 0.6 });
    /* eslint-enable no-magic-numbers */
  }
}

/** Score count-up, record/rank banner and run stats shown when a run ends. */
export function createRunResult(run: RunResult | undefined, translation: TranslationService): Container {
  const view = new Container();
  if (!run) {
    return view;
  }

  const { entry } = run;
  /* eslint-disable no-magic-numbers */
  view.addChild(label(translation.getTranslation('youAreDead.points'), 12, 0));
  const score = view.addChild(label('0', 30, 28, run.isRecord ? RECORD_COLOR : TEXT_COLOR));
  const counter = { value: 0 };
  gsap.to(counter, {
    value: entry.kills,
    duration: entry.kills ? COUNT_UP_SECONDS : 0,
    ease: 'power1.out',
    onUpdate: () => (score.text = Math.round(counter.value).toString()),
  });

  const rankText = translation.getTranslation('run.rank', { rank: run.rank, total: run.total });
  let banner: Text;
  let detail = '';
  if (run.isRecord) {
    banner = label(translation.getTranslation('run.newRecord'), 14, 62, RECORD_COLOR);
    detail = run.previousBest
      ? translation.getTranslation('run.oldRecord', { best: run.previousBest })
      : translation.getTranslation('run.firstRun');
  } else if (run.isDailyBest) {
    banner = label(translation.getTranslation('run.dailyBest'), 14, 62, HIGHLIGHT_COLOR);
    detail = rankText;
  } else {
    banner = label(rankText, 14, 62);
    if (run.killsToNextRank) {
      detail = translation.getTranslation('run.nextRank', { kills: run.killsToNextRank, rank: run.rank - 1 });
    }
  }
  view.addChild(banner);
  view.addChild(label(detail, 11, 84));
  view.addChild(label(translation.getTranslation('run.stats', {
    level: entry.level,
    combo: entry.combo ?? 1,
    coins: entry.coins ?? 0,
  }), 11, 108));

  banner.alpha = 0;
  gsap.to(banner, { alpha: 1, duration: 0.3, delay: COUNT_UP_SECONDS });
  if (run.isRecord) {
    startPulse(banner);
    spawnConfetti(view, 28);
  }
  /* eslint-enable no-magic-numbers */
  return view;
}

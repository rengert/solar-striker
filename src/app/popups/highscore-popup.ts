import gsap from 'gsap';
import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import { compareEntries, HighscoreEntry, isSameDay } from '../models/highscore.model';
import { GameService } from '../services/game.service';
import { StorageService } from '../services/storage.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';

const POPUP_HEIGHT = 380;
const CLOSE_BUTTON_INDEX = 5;
const TEXT_COLOR = 0x3c2f1e;
const MUTED_COLOR = 0x8a8070;
const HIGHLIGHT_COLOR = 0x1a8fd6;
const VISIBLE_ROWS = 8;
const ROW_START_Y = 0;
const ROW_STEP = 21;
const ROW_SIZE = 12;
const MEDALS = ['🥇', '🥈', '🥉'];
const COLUMNS_X = { rank: -95, kills: -42, level: 4, combo: 50, date: 96 };
const TAB_X = 55;
const TAB_Y = -43;
const TAB_HIT_WIDTH = 100;
const TAB_HIT_HEIGHT = 30;
const HALF = 0.5;

interface RankedEntry {
  entry: HighscoreEntry;
  rank: number;
}

export class HighscorePopup extends Popup {
  private readonly storage: StorageService = new StorageService();
  private readonly rows = new Container();
  private readonly tabs: { text: Text; todayOnly: boolean }[] = [];
  private entries: HighscoreEntry[] = [];
  private latestId?: string;
  private readonly dateFormatter: Intl.DateTimeFormat;
  private readonly timeFormatter: Intl.DateTimeFormat;

  constructor(private readonly gameService: GameService, private readonly translation: TranslationService) {
    super(translation.getTranslation('highscore.title'), POPUP_HEIGHT);
    this.dateFormatter = new Intl.DateTimeFormat(translation.locale, { day: '2-digit', month: '2-digit' });
    this.timeFormatter = new Intl.DateTimeFormat(translation.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    this.addToContent(this.rows);
    this.addButton(translation.getTranslation('common.close'), () => gameService.openNavigation(this), CLOSE_BUTTON_INDEX);
  }

  override async show(): Promise<void> {
    this.entries = (await this.storage.getHighscore()).sort(compareEntries);
    this.latestId = this.gameService.lastRun?.entry.id
      ?? this.entries.reduce<HighscoreEntry | undefined>((latest, e) => (!latest || e.date > latest.date ? e : latest), undefined)?.id;

    if (this.entries.length) {
      const best = this.entries[0].kills;
      this.addText(
        `🏆 ${this.translation.getTranslation('highscore.summary', { best, games: this.entries.length })}`,
        { size: 11, fill: MUTED_COLOR },
        // eslint-disable-next-line no-magic-numbers
        { y: -66 },
      );
    }
    this.addTab('highscore.allTime', -TAB_X, false);
    this.addTab('highscore.today', TAB_X, true);
    this.selectTab(0);

    await super.show();
  }

  private addTab(key: 'highscore.allTime' | 'highscore.today', x: number, todayOnly: boolean): void {
    const tab = this.addText(this.translation.getTranslation(key), { size: 13 }, { y: TAB_Y, x });
    const index = this.tabs.push({ text: tab, todayOnly }) - 1;
    tab.eventMode = 'static';
    tab.cursor = 'pointer';
    // generous touch target, the label itself is tiny on phones
    tab.hitArea = new Rectangle(-TAB_HIT_WIDTH * HALF, -TAB_HIT_HEIGHT * HALF, TAB_HIT_WIDTH, TAB_HIT_HEIGHT);
    tab.on('pointertap', () => this.selectTab(index));
  }

  private selectTab(index: number): void {
    this.tabs.forEach(({ text }, i) => {
      text.style.fill = i === index ? HIGHLIGHT_COLOR : MUTED_COLOR;
      // eslint-disable-next-line no-magic-numbers
      text.scale.set(i === index ? 1.1 : 1);
    });
    const { todayOnly } = this.tabs[index];
    const now = new Date();
    this.renderRows(todayOnly ? this.entries.filter((e) => isSameDay(e.date, now)) : this.entries, todayOnly);
  }

  private renderRows(list: HighscoreEntry[], todayOnly: boolean): void {
    this.rows.removeChildren().forEach((child) => child.destroy({ children: true }));

    if (!list.length) {
      this.rows.addChild(this.createText(
        this.translation.getTranslation(todayOnly ? 'highscore.emptyToday' : 'highscore.empty'),
        { x: 0, y: 60, fill: MUTED_COLOR },
      ));
      return;
    }

    const header = new Container();
    header.y = ROW_START_Y - ROW_STEP;
    const headerCells: [string, number][] = [
      ['#', COLUMNS_X.rank],
      [this.translation.getTranslation('highscore.kills'), COLUMNS_X.kills],
      [this.translation.getTranslation('highscore.level'), COLUMNS_X.level],
      [this.translation.getTranslation('highscore.combo'), COLUMNS_X.combo],
      [this.translation.getTranslation('highscore.date'), COLUMNS_X.date],
    ];
    headerCells.forEach(([content, x]) => header.addChild(this.createText(content, { x, y: 0, fill: MUTED_COLOR, size: 10 })));
    this.rows.addChild(header);

    const ranked: RankedEntry[] = list.map((entry, i) => ({ entry, rank: i + 1 }));
    const visible = ranked.slice(0, VISIBLE_ROWS);
    const latest = ranked.find(({ entry }) => entry.id === this.latestId);
    // keep the player's latest run visible even when it did not make the top list
    if (latest && latest.rank > VISIBLE_ROWS) {
      visible[VISIBLE_ROWS - 1] = latest;
    }

    visible.forEach((item, i) => {
      const row = this.createRow(item, todayOnly);
      row.y = ROW_START_Y + i * ROW_STEP;
      row.alpha = 0;
      // eslint-disable-next-line no-magic-numbers
      row.x = -20;
      // eslint-disable-next-line no-magic-numbers
      gsap.to(row, { alpha: 1, x: 0, duration: 0.25, delay: i * 0.05, ease: 'power2.out' });
      this.rows.addChild(row);
    });
  }

  private createRow({ entry, rank }: RankedEntry, todayOnly: boolean): Container {
    const row = new Container();
    const isLatest = entry.id === this.latestId;
    const fill = isLatest ? HIGHLIGHT_COLOR : TEXT_COLOR;

    if (isLatest) {
      // eslint-disable-next-line no-magic-numbers
      row.addChild(new Graphics().roundRect(-120, -9, 240, 18, 6).fill({ color: HIGHLIGHT_COLOR, alpha: 0.15 }));
    }

    const date = new Date(entry.date);
    const cells: [string, number][] = [
      [MEDALS[rank - 1] ?? `${rank}.`, COLUMNS_X.rank],
      [entry.kills.toString(), COLUMNS_X.kills],
      [entry.level.toString(), COLUMNS_X.level],
      [entry.combo ? `x${entry.combo}` : '–', COLUMNS_X.combo],
      [todayOnly ? this.timeFormatter.format(date) : this.dateFormatter.format(date), COLUMNS_X.date],
    ];
    cells.forEach(([content, x]) => row.addChild(this.createText(content, { x, y: 0, fill })));
    return row;
  }

  private createText(content: string, options: { x: number; y: number; fill: number; size?: number }): Text {
    const text = new Text({
      text: content,
      style: { fontFamily: 'DefaultFont', fontSize: options.size ?? ROW_SIZE, fill: options.fill, align: 'center' },
    });
    // eslint-disable-next-line no-magic-numbers
    text.anchor.set(0.5);
    text.position.set(options.x, options.y);
    return text;
  }
}

import { MAX_STAGE } from '../game-constants';
import { getBossDebriefing, SPEAKER_COLORS } from '../models/story.model';
import { GameService } from '../services/game.service';
import { TranslationService } from '../services/translation.service';
import { Popup } from './popup';
import { createRunResult } from './run-result';

const RESULT_POPUP_HEIGHT = 380;
const OUTRO_Y = -6;
const OUTRO_SIZE = 10;
const OUTRO_LINE_GAP = 7;
const RESULT_Y = 18;

export class VictoryPopup extends Popup {
  constructor(gameService: GameService, translation: TranslationService) {
    super(translation.getTranslation('victory.title'), RESULT_POPUP_HEIGHT);

    this.addText(translation.getTranslation('victory.subtitle'), { size: 14 }, { y: -66 });
    this.addText(translation.getTranslation('victory.message'), { size: 12 }, { y: -38 });

    // the run ends before the radio could play it, so the last words of the story live here
    const [outro] = getBossDebriefing(MAX_STAGE);
    const appearance = { size: OUTRO_SIZE, fill: SPEAKER_COLORS[outro.speaker] };
    this.addText(`${translation.getTranslation(`story.speaker.${outro.speaker}`)}:`, appearance, { y: OUTRO_Y - OUTRO_LINE_GAP });
    this.addText(translation.getTranslation(outro.text), appearance, { y: OUTRO_Y + OUTRO_LINE_GAP });

    const result = createRunResult(gameService.lastRun, translation);
    result.y = RESULT_Y;
    this.addToContent(result);

    // eslint-disable-next-line no-magic-numbers
    this.addButton(translation.getTranslation('common.close'), () => gameService.endGame(this), 4.9);
  }
}

import { RunResult } from '../models/highscore.model';
import { TranslationService } from '../services/translation.service';
import { shareRun } from './run-result';

describe('shareRun', () => {
  const translation = { getTranslation: (key: string): string => key } as unknown as TranslationService;
  const run = { entry: { id: 'a', date: '', kills: 42, level: 7 } } as RunResult;
  const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share');

  afterEach(() => {
    if (originalShare) {
      Object.defineProperty(navigator, 'share', originalShare);
    } else {
      delete (navigator as { share?: unknown }).share;
    }
  });

  function setShare(share: unknown): void {
    Object.defineProperty(navigator, 'share', { value: share, configurable: true, writable: true });
  }

  it('opens the share sheet with the game link', async () => {
    const share = jasmine.createSpy('share').and.resolveTo();
    setShare(share);

    expect(await shareRun(run, translation)).toBeTrue();
    expect(share).toHaveBeenCalledWith(jasmine.objectContaining({ url: 'https://rengert.github.io/solar-striker/' }));
  });

  it('treats a closed share sheet as no failure, but reports other errors', async () => {
    setShare(jasmine.createSpy('share').and.rejectWith(new DOMException('closed', 'AbortError')));
    expect(await shareRun(run, translation)).toBeTrue();

    setShare(jasmine.createSpy('share').and.rejectWith(new DOMException('denied', 'NotAllowedError')));
    expect(await shareRun(run, translation)).toBeFalse();
  });

  it('copies the text when the device cannot share', async () => {
    setShare(undefined);
    const writeText = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

    expect(await shareRun(run, translation)).toBeTrue();
    expect(writeText).toHaveBeenCalled();
  });
});

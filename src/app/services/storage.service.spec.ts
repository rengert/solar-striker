import { StorageService } from './storage.service';

describe('StorageService', () => {
  it('clearAll() should wipe saved progress', async () => {
    const storage = new StorageService();
    // eslint-disable-next-line no-magic-numbers
    await storage.setCoins(42);
    await storage.setShipUpgrades({ speed: 2 });
    // eslint-disable-next-line no-magic-numbers
    expect(await storage.getCoins()).toBe(42);
    expect(await storage.getShipUpgrades()).toEqual({ speed: 2 });

    await storage.clearAll();

    expect(await storage.getCoins()).toBe(0);
    expect(await storage.getShipUpgrades()).toEqual({});
  });

  it('exportAll() code restores the save via importAll()', async () => {
    const storage = new StorageService();
    // eslint-disable-next-line no-magic-numbers
    await storage.setCoins(77);
    await storage.setShipUpgrades({ speed: 3 });
    const code = await storage.exportAll();

    await storage.clearAll();
    expect(await storage.importAll(code)).toBeTrue();

    // eslint-disable-next-line no-magic-numbers
    expect(await storage.getCoins()).toBe(77);
    expect(await storage.getShipUpgrades()).toEqual({ speed: 3 });
  });

  it('importAll() rejects invalid codes and keeps the save', async () => {
    const storage = new StorageService();
    // eslint-disable-next-line no-magic-numbers
    await storage.setCoins(5);

    expect(await storage.importAll('nonsense')).toBeFalse();
    expect(await storage.importAll('SOLAR1:%%%')).toBeFalse();
    expect(await storage.importAll(`SOLAR1:${btoa(JSON.stringify({ version: 1, data: { coins: [{ amount: 1 }] } }))}`)).toBeFalse();

    // eslint-disable-next-line no-magic-numbers
    expect(await storage.getCoins()).toBe(5);
  });
});

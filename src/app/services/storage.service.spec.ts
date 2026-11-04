import { StorageService } from './storage.service';

describe('StorageService', () => {
  it('clearAll() should wipe saved progress', async () => {
    const storage = new StorageService();
    // eslint-disable-next-line no-magic-numbers
    await storage.setCoins(42);
    await storage.setShipUpgrades({ speed: 2 });

    await storage.clearAll();

    expect(await storage.getCoins()).toBe(0);
    expect(await storage.getShipUpgrades()).toEqual({});
  });
});

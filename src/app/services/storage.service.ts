import { Injectable } from '@angular/core';

export enum Store {
  games = 'games',
  coins = 'coins',
  upgrades = 'upgrades',
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  toStore<T>(storeName: string, dataToStore: T | T[], clear = false): Promise<void> {
    const data: T[] = Array.isArray(dataToStore) ? dataToStore : [dataToStore];
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line no-magic-numbers
      const dbRequest = indexedDB.open('data', 6);
      dbRequest.onerror = (): void => {
        reject(Error('IndexedDB database error'));
      };

      dbRequest.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const database = (event.currentTarget as IDBOpenDBRequest).result;
        this.migrateDatabase(database);
      };

      dbRequest.onsuccess = function (event: Event): void {
        const database = (event.currentTarget as IDBOpenDBRequest).result;
        const objectStore = database.transaction([storeName], 'readwrite').objectStore(storeName);

        if (clear) {
          objectStore.clear().onsuccess = (): void => {
            // ignore the on success
          };
        }

        data.forEach((item) => {
          const objectRequest = objectStore.put(item); // Overwrite if exists
          objectRequest.onerror = (): void => reject();
          objectRequest.onsuccess = (): void => resolve();
        });
      };

      resolve();
    });
  }

  getManyFromStore<T>(storeName: Store, resolver?: (item: T) => boolean): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open('data');
      dbRequest.onerror = function (): void {
        resolve([]);
      };

      dbRequest.onupgradeneeded = function (event: IDBVersionChangeEvent): void {
        (event.currentTarget as IDBOpenDBRequest).transaction?.abort();
        resolve([]);
      };

      dbRequest.onsuccess = function (event: Event): void {
        const database = (event.currentTarget as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(storeName)) {
          resolve([]);
          return;
        }

        const store = database.transaction([storeName]).objectStore(storeName);
        const objectRequest = store.getAll();

        objectRequest.onerror = function (): void {
          reject(Error('Error text'));
        };

        objectRequest.onsuccess = function (): void {
          resolve((objectRequest.result as T[]).filter((item) => !resolver || resolver(item)));
        };
      };
    });
  }

  getHighscore(): Promise<{ date: string; kills: number; level: number }[]> {
    return this.getManyFromStore(Store.games, () => true);
  }

  setHighscore(kills: number, level: number): Promise<void> {
    return this.toStore(Store.games, {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      kills,
      level,
    });
  }

  async getCoins(): Promise<number> {
    const entries = await this.getManyFromStore<{ id: string; amount: number }>(
      Store.coins,
      (item) => item.id === 'coins',
    );
    const entry = entries.at(0);

    if (entry) {
      return entry.amount;
    }

    return 0;
  }

  setCoins(amount: number): Promise<void> {
    return this.toStore(Store.coins, {
      id: 'coins',
      amount,
    });
  }

  async getShipUpgrades(): Promise<Record<string, number>> {
    const entries = await this.getManyFromStore<{ id: string; levels: Record<string, number> }>(
      Store.upgrades,
      (item) => item.id === 'ship-upgrades',
    );

    const entry = entries.at(0);

    if (entry) {
      return entry.levels;
    }

    return {};
  }

  setShipUpgrades(levels: Record<string, number>): Promise<void> {
    return this.toStore(Store.upgrades, {
      id: 'ship-upgrades',
      levels,
    });
  }

  private migrateDatabase(database: IDBDatabase): void {
    if (!database.objectStoreNames.contains(Store.games)) {
      database.createObjectStore(Store.games, { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains(Store.coins)) {
      database.createObjectStore(Store.coins, { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains(Store.upgrades)) {
      database.createObjectStore(Store.upgrades, { keyPath: 'id' });
    }
  }
}

import { Injectable } from '@angular/core';

export enum Store {
  games = 'games',
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  toStore<T>(storeName: string, dataToStore: T | T[], clear = false): Promise<void> {
    const data: T[] = Array.isArray(dataToStore) ? dataToStore : [dataToStore];
    return new Promise<void>((resolve, reject) => {
      const dbRequest = indexedDB.open('data', 4);
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

        data.forEach(item => {
          const objectRequest = objectStore.put(item); // Overwrite if exists
          objectRequest.onerror = (): void => reject();
          objectRequest.onsuccess = (): void => resolve();
        });
      };

      resolve();
    });
  }

  getFromStore<T>(storeName: string, resolver: (item: T) => boolean): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('data');
        dbRequest.onerror = function (): void {
          resolve(undefined);
        };

        dbRequest.onupgradeneeded = function (event: IDBVersionChangeEvent): void {
          (event.currentTarget as IDBOpenDBRequest).transaction?.abort();
          resolve(undefined);
        };

        dbRequest.onsuccess = function (event: Event): void {
          const database = (event.currentTarget as IDBOpenDBRequest).result;
          const store = database.transaction([storeName]).objectStore(storeName);
          const objectRequest = store.getAll();

          objectRequest.onerror = function (): void {
            reject(Error('Error text'));
          };

          objectRequest.onsuccess = function (): void {
            resolve((objectRequest.result as T[]).find(item => resolver(item)));
          };
        };
      },
    );
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
          const store = database.transaction([storeName]).objectStore(storeName);
          const objectRequest = store.getAll();

          objectRequest.onerror = function (): void {
            reject(Error('Error text'));
          };

          objectRequest.onsuccess = function (): void {
            resolve((objectRequest.result as T[]).filter(item => !resolver || resolver(item)));
          };
        };
      },
    );
  }

  private migrateDatabase(database: IDBDatabase): void {
    database.createObjectStore(Store.games, { keyPath: 'id' });
  }

  setHighscore(kills: number, level: number): Promise<void> {
    return this.toStore(Store.games, { id: crypto.randomUUID(), date: new Date().toISOString(), kills, level });
  }
}

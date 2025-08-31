import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Safely store data in localStorage with error handling
   * @param key - Storage key
   * @param data - Data to store
   */

  setItem<T>(key: string, data: T): void {
    if (data === undefined) {
      console.warn(
        `StorageService: Attempted to store 'undefined' at key "${key}"`
      );
      return;
    }
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.log('Error saving to localStorage:', error);
    }
  }

  /**
   * Safely retrieve data from localStorage with type safety
   * @param key - Storage key
   * @returns Parsed data or null if not found/invalid
   */

  getItem<T>(key: string): T | null {
    try {
      const incomingData = localStorage.getItem(key) as string;
      return incomingData ? JSON.parse(incomingData) : null;
    } catch (error) {
      console.log(`Error while getting data from localStorage : ${error}`);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param key - Storage key to remove
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log(`Error while adding to LocalStorage : ${error}`);
    }
  }

  clearAllData(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.log(`Error while adding to LocalStorage : ${error}`);
    }
  }
}

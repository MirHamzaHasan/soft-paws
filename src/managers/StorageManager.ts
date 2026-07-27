import { createMMKV } from 'react-native-mmkv';
import { z } from 'zod';

class StorageManager {
  private static instance: StorageManager;

  private storage: ReturnType<typeof createMMKV>;

  private constructor() {
    this.storage = createMMKV({
      id: 'app-storage',
    });
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // String operations
  public setString(key: string, value: string): void {
    this.storage.set(key, value);
  }

  public getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  // Number operations
  public setNumber(key: string, value: number): void {
    this.storage.set(key, value);
  }

  public getNumber(key: string): number | undefined {
    return this.storage.getNumber(key);
  }

  // Boolean operations
  public setBoolean(key: string, value: boolean): void {
    this.storage.set(key, value);
  }

  public getBoolean(key: string): boolean | undefined {
    return this.storage.getBoolean(key);
  }

  // Object operations
  public setObject(key: string, value: object): void {
    this.storage.set(key, JSON.stringify(value));
  }

  public getObject<T>(key: string, schema?: z.ZodSchema<T>): T | undefined {
    const value = this.storage.getString(key);
    if (!value) return undefined;
    try {
      const parsed = JSON.parse(value);
      if (schema) {
        return schema.parse(parsed);
      }
      return parsed as T;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        console.error(`Validation error for key: ${key}`, e.issues);
      } else {
        console.error(`Error parsing object for key: ${key}`, e);
      }
      return undefined;
    }
  }

  // General operations
  public delete(key: string): void {
    this.storage.remove(key);
  }

  public clearAll(): void {
    this.storage.clearAll();
  }

  public getAllKeys(): string[] {
    return this.storage.getAllKeys();
  }
}

export default StorageManager.getInstance();

import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  category: string;
  account: string;
  source: string;
  date: string;
  type: 'income' | 'expense';
  receiptImage?: string; // base64
}

export interface Account {
  id?: number;
  name: string;
}

export interface Source {
  id?: number;
  name: string;
}

export class AppDatabase extends Dexie {
  transactions!: Table<Transaction>;
  accounts!: Table<Account>;
  sources!: Table<Source>;

  constructor() {
    super('FinTrackDB');
    this.version(2).stores({
      transactions: '++id, date, category, account, source, type',
      accounts: '++id, &name',
      sources: '++id, &name'
    });
  }
}

// Lazy instantiation to avoid SSR issues
let dbInstance: AppDatabase | null = null;
export const getDb = () => {
  if (!dbInstance) {
    dbInstance = new AppDatabase();
  }
  return dbInstance;
};

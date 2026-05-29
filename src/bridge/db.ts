import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { HistoryEntry } from './types';

interface LocalDB {
  entries: HistoryEntry[];
}

function getAlphDir(): string {
  const dir = join(homedir(), '.alph');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getDbPath(): string {
  return join(getAlphDir(), 'history.json');
}

function readDB(): LocalDB {
  try {
    if (!existsSync(getDbPath())) return { entries: [] };
    return JSON.parse(readFileSync(getDbPath(), 'utf-8'));
  } catch {
    return { entries: [] };
  }
}

function writeDB(db: LocalDB): void {
  try {
    writeFileSync(getDbPath(), JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // non-fatal
  }
}

export function logActivity(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const db = readDB();
  db.entries.unshift({
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString()
  });
  db.entries = db.entries.slice(0, 100);
  writeDB(db);
}

export function getHistory(limit = 20): HistoryEntry[] {
  return readDB().entries.slice(0, limit);
}

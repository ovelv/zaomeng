export type HistoryRecordType = "oral" | "pets" | "custom";

export type HistoryRecord = {
  id: string;
  type: HistoryRecordType;
  createdAt: string;
  title: string;
  data: any;
};

const STORAGE_KEY = "zaomeng_history";

export function saveHistory(record: Omit<HistoryRecord, "id" | "createdAt">): HistoryRecord {
  if (typeof window === "undefined") return record as HistoryRecord;

  const history = getHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  history.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history from localStorage", e);
    return [];
  }
}

export function getHistoryById(id: string): HistoryRecord | undefined {
  return getHistory().find((r) => r.id === id);
}

export function deleteHistory(id: string) {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

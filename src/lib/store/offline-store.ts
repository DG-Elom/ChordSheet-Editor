import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "chordsheet-offline";
const DB_VERSION = 1;
const PENDING_STORE = "pending-changes";

interface PendingChange {
  id: string;
  type: "update_sheet" | "update_section" | "create_section" | "delete_section" | "reorder";
  sheetId: string;
  payload: unknown;
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          const store = db.createObjectStore(PENDING_STORE, { keyPath: "id" });
          store.createIndex("sheetId", "sheetId");
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function addPendingChange(
  change: Omit<PendingChange, "id" | "createdAt">,
): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const entry: PendingChange = {
    ...change,
    id,
    createdAt: Date.now(),
  };
  await db.put(PENDING_STORE, entry);
  return id;
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await getDB();
  return db.getAllFromIndex(PENDING_STORE, "createdAt");
}

export async function removePendingChange(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(PENDING_STORE, id);
}

export async function clearPendingChanges(): Promise<void> {
  const db = await getDB();
  await db.clear(PENDING_STORE);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return db.count(PENDING_STORE);
}

export async function syncPendingChanges(
  syncFn: (change: PendingChange) => Promise<boolean>,
): Promise<{ synced: number; failed: number }> {
  const changes = await getPendingChanges();
  let synced = 0;
  let failed = 0;

  for (const change of changes) {
    try {
      const success = await syncFn(change);
      if (success) {
        await removePendingChange(change.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

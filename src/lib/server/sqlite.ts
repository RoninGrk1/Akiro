import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database } from "sql.js";
import { PROJECT_ROOT, ensureProjectRoot } from "@/lib/server/paths";

const DB_NAME = "akiro.db";

let dbPromise: Promise<Database> | null = null;

function dbFilePath(): string {
  ensureProjectRoot();
  return path.join(PROJECT_ROOT, DB_NAME);
}

function resolveWasm(): string {
  const candidates = [
    path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "node_modules/sql.js/dist/sql-wasm.wasm",
    ),
    path.join(
      /*turbopackIgnore: true*/ "/workspace/akiro/node_modules/sql.js/dist/sql-wasm.wasm",
    ),
  ];
  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
  }
  throw new Error(
    "sql.js wasm not found under node_modules/sql.js/dist/sql-wasm.wasm",
  );
}

async function loadDb(): Promise<Database> {
  const wasmPath = resolveWasm();
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });
  const file = dbFilePath();
  if (fs.existsSync(/*turbopackIgnore: true*/ file)) {
    const buf = fs.readFileSync(/*turbopackIgnore: true*/ file);
    return new SQL.Database(buf);
  }
  const db = new SQL.Database();
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY,
      target TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);
  db.run(
    `INSERT INTO users (id, name, role) VALUES (1, 'Ada', 'admin'), (2, 'Grace', 'developer');`,
  );
  db.run(
    `INSERT INTO deployments (id, target, status) VALUES (1, 'preview', 'ready'), (2, 'production', 'ready');`,
  );
  persist(db);
  return db;
}

function persist(db: Database): void {
  const data = db.export();
  fs.writeFileSync(/*turbopackIgnore: true*/ dbFilePath(), Buffer.from(data));
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = loadDb();
  return dbPromise;
}

const WRITE_RE =
  /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b/i;

export function isWriteSql(sql: string): boolean {
  return WRITE_RE.test(sql.trim());
}

export type QueryResult = {
  ok: boolean;
  message: string;
  columns: string[];
  rows: Record<string, string | number | boolean | null>[];
  changes?: number;
};

export async function runSql(
  sql: string,
  opts: { allowWrite: boolean },
): Promise<QueryResult> {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { ok: false, message: "Empty query", columns: [], rows: [] };
  }
  if (isWriteSql(trimmed) && !opts.allowWrite) {
    return {
      ok: false,
      message:
        "Write SQL requires explicit confirmation (allowWrite). Default mode is read-only.",
      columns: [],
      rows: [],
    };
  }

  const db = await getDb();
  try {
    if (isWriteSql(trimmed)) {
      db.run(trimmed);
      persist(db);
      return {
        ok: true,
        message: "Write executed and persisted to akiro.db",
        columns: [],
        rows: [],
        changes: db.getRowsModified(),
      };
    }
    const result = db.exec(trimmed);
    if (!result.length) {
      return { ok: true, message: "0 rows", columns: [], rows: [] };
    }
    const { columns, values } = result[0];
    const rows = values.map((row) => {
      const obj: Record<string, string | number | boolean | null> = {};
      columns.forEach((col, i) => {
        const v = row[i];
        obj[col] =
          v === null || v === undefined
            ? null
            : typeof v === "number" || typeof v === "string"
              ? v
              : String(v);
      });
      return obj;
    });
    return {
      ok: true,
      message: `${rows.length} row(s)`,
      columns,
      rows,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      columns: [],
      rows: [],
    };
  }
}

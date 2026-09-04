import { cache } from "react";
import type { RowDataPacket } from "mysql2/promise";
import { rows } from "../pool";
import type { SqlValue } from "../pool";

/**
 * ONE QUERY PER REQUEST, NOT ONE PER CALLER.
 *
 * The homepage's repository has ten methods and each of them wants the same page's
 * strings; the CMS builds its read model twice over, once for pages and once for
 * collections; a screen may read three collections that two other screens also read. Left
 * alone that is eighty round trips to another host for what is a handful of distinct
 * queries, and it exhausted the connection pool the first time the dashboard was opened.
 *
 * React's `cache` scopes the memo to ONE server request. That is the property that makes
 * it safe here: an editor saves, the panel re-renders, and the next request starts with an
 * empty cache — so a memo can never show someone their own change not having happened.
 * Outside a request (a script, a test) each call gets its own cache, which is the same
 * thing one request would have given it.
 *
 * The key is the SQL plus its parameters, so two callers asking the same question share an
 * answer and two asking different ones do not.
 */
const load = cache(async (key: string): Promise<ReadonlyArray<RowDataPacket>> => {
  const { sql, values } = JSON.parse(key) as { sql: string; values: SqlValue[] };
  return rows<RowDataPacket>(sql, values);
});

export async function cachedRows<T extends RowDataPacket>(
  sql: string,
  values: ReadonlyArray<SqlValue> = [],
): Promise<T[]> {
  const found = await load(JSON.stringify({ sql, values }));
  // A copy per caller: the memo hands the same array to everyone, and a caller that sorts
  // it in place would reorder someone else's rows.
  return [...found] as T[];
}

import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local","utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m) process.env[m[1]] = m[2].replace(/\\$/g, "$");
}
const c = await mysql.createConnection({host:process.env.DB_HOST,port:+process.env.DB_PORT,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
const [a] = await c.execute("SELECT owner_kind, owner_key, field_key, label, list_key, is_editable, is_approved, LEFT(value,40) v FROM content_strings WHERE owner_key IN ('home:hero','capabilities:creative-design') ORDER BY owner_key, sort_order");
console.table(a);
const [b] = await c.execute("SELECT DISTINCT owner_kind, owner_key FROM content_strings ORDER BY owner_kind, owner_key");
console.log(b.map(r=>r.owner_kind+" | "+r.owner_key).join("\n"));
await c.end();

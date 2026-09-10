// Checks that the contact form can send mail through Microsoft Graph.
//
//   npm run mail:check              stage 1 only: are the credentials and the permission right?
//   npm run mail:check -- --send    stage 2 as well: send one real message to MAIL_NOTIFY_TO
//
// On the server the credentials live in shared/.env, not .env.local, so point Node at it:
//
//   node --env-file=/home/aspirfxc/apps/fsstudios/shared/.env scripts/mail-check.mjs --send
//
// TWO STAGES, BECAUSE THEY FAIL FOR DIFFERENT REASONS IN DIFFERENT PLACES. A send-only check
// reports all of them as "403 Access is denied", the least informative sentence Microsoft
// produces. Taken apart:
//
//   token refused                     wrong tenant, client id or secret, or the secret expired
//   token issued, `roles` empty       Mail.Send was added as DELEGATED, or admin consent was
//                                     never granted. This is the common one.
//   `roles` has Mail.Send, send 403s  the ApplicationAccessPolicy excludes MAIL_SENDER, or
//                                     names a different mailbox
//
// Three fixes in three places, and the first two are settled without sending anything.
//
// NOTHING SECRET IS PRINTED. The token is decoded for its claims and never shown; Microsoft's
// error text is cut to its first line, because later lines can quote the request back.

import { loadEnv } from "./lib/loadEnv.mjs";

loadEnv();

const shouldSend = process.argv.includes("--send");
const TIMEOUT_MS = 15_000;
const MAX_ERROR_LENGTH = 300;
const REQUIRED = [
  "MAIL_SENDER",
  "MAIL_NOTIFY_TO",
  "GRAPH_TENANT_ID",
  "GRAPH_CLIENT_ID",
  "GRAPH_CLIENT_SECRET",
];

/** Entra's commonest refusals, and what each one means in this setup. */
const ENTRA_HINTS = [
  ["AADSTS7000215", "The secret is wrong. Copy the secret's VALUE, not its Secret ID."],
  ["AADSTS7000222", "The secret has expired. Create a new one and diarise its expiry."],
  ["AADSTS700016", "No app with GRAPH_CLIENT_ID exists in this tenant. Check both ids."],
  ["AADSTS90002", "GRAPH_TENANT_ID does not name a tenant."],
  ["AADSTS900023", "GRAPH_TENANT_ID is not a valid tenant id."],
];

function env(name) {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? undefined : value.trim();
}

function fail(...lines) {
  for (const line of lines) console.error(line);
  process.exit(1);
}

function firstLine(text) {
  const line = String(text).split(/\r?\n/)[0]?.trim() ?? "";
  return line.length > MAX_ERROR_LENGTH ? `${line.slice(0, MAX_ERROR_LENGTH)}…` : line;
}

async function describeFailure(response) {
  const body = await response.json().catch(() => null);
  const nested = body && typeof body.error === "object" ? body.error : undefined;
  const code = nested?.code ?? (typeof body?.error === "string" ? body.error : undefined);
  const text = nested?.message ?? body?.error_description;
  return { code, message: typeof text === "string" ? firstLine(text) : undefined };
}

/** The token's claims. The token itself never leaves this function. */
function claimsOf(token) {
  const payload = token.split(".")[1];
  if (!payload) return {};
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

async function request(url, init, what) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    const reason = error?.name === "TimeoutError" ? `timed out after ${TIMEOUT_MS / 1000}s` : error?.message;
    fail(
      `✗ ${what}: the request did not complete (${reason}).`,
      "  Is outbound HTTPS to Microsoft allowed from this machine?",
    );
  }
}

async function token() {
  const tenantId = env("GRAPH_TENANT_ID");
  const response = await request(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env("GRAPH_CLIENT_ID"),
        client_secret: env("GRAPH_CLIENT_SECRET"),
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
    "Token",
  );

  if (!response.ok) {
    const { code, message } = await describeFailure(response);
    const hint = ENTRA_HINTS.find(([prefix]) => message?.startsWith(prefix))?.[1];
    fail(
      `✗ 1/2 Token: Entra refused the client credentials (${response.status}${code ? `, ${code}` : ""}).`,
      ...(message ? [`  ${message}`] : []),
      `  ${hint ?? "Check GRAPH_TENANT_ID, GRAPH_CLIENT_ID and GRAPH_CLIENT_SECRET, and whether the secret has expired."}`,
    );
  }

  const body = await response.json().catch(() => null);
  if (typeof body?.access_token !== "string") fail("✗ 1/2 Token: Entra returned no access_token.");
  return body.access_token;
}

function checkRoles(claims) {
  const roles = Array.isArray(claims.roles) ? claims.roles : [];
  const minutes = typeof claims.exp === "number" ? Math.round((claims.exp * 1000 - Date.now()) / 60_000) : "?";
  console.log(`✓ 1/2 Token issued for app ${claims.appid ?? "?"} in tenant ${claims.tid ?? "?"}, valid ${minutes} min.`);

  if (roles.length === 0) {
    fail(
      "✗ 1/2 Permission: the token carries no application roles.",
      "  The app registration has no APPLICATION permission consented. Either Mail.Send was",
      "  added as a Delegated permission, or admin consent was never granted. In Entra:",
      "  API permissions → Microsoft Graph → Application permissions → Mail.Send →",
      "  Grant admin consent. (This is the common one.)",
    );
  }
  if (!roles.includes("Mail.Send")) {
    fail(
      `✗ 1/2 Permission: the token's roles are ${roles.join(", ")} — Mail.Send is not among them.`,
      "  Add Mail.Send as an APPLICATION permission and grant admin consent.",
    );
  }
  console.log(`✓ 1/2 Permission: roles include Mail.Send (${roles.join(", ")}).`);
}

async function sendOne(accessToken) {
  const sender = env("MAIL_SENDER");
  const notifyTo = env("MAIL_NOTIFY_TO");
  const response = await request(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        message: {
          subject: "Famysys Studio — mail check",
          body: {
            contentType: "Text",
            content:
              `Sent by scripts/mail-check.mjs at ${new Date().toISOString()}.\n\n` +
              "If this arrived, the contact form can send mail through Microsoft Graph.",
          },
          toRecipients: [{ emailAddress: { address: notifyTo } }],
          from: { emailAddress: { name: env("MAIL_FROM_NAME") ?? "Famysys Studio", address: sender } },
        },
        saveToSentItems: true,
      }),
    },
    "Send",
  );

  if (response.status === 202) {
    console.log(`✓ 2/2 Send: Graph accepted a message from ${sender} to ${notifyTo}. Check that inbox.`);
    return;
  }

  const { code, message } = await describeFailure(response);
  const detail = [`✗ 2/2 Send: Graph answered ${response.status}${code ? ` (${code})` : ""}.`];
  if (message) detail.push(`  ${message}`);
  if (response.status === 403) {
    detail.push(
      "  The token has Mail.Send, so this is the mailbox scope: the ApplicationAccessPolicy",
      `  excludes ${sender}, or names a different mailbox. In Exchange Online PowerShell:`,
      `    Test-ApplicationAccessPolicy -AppId ${env("GRAPH_CLIENT_ID")} -Identity ${sender}`,
      "  A policy change can take up to an hour to apply.",
    );
  } else if (response.status === 404) {
    detail.push(`  No mailbox answers to MAIL_SENDER (${sender}) in this tenant.`);
  }
  fail(...detail);
}

async function main() {
  if (env("MAIL_ENABLED")?.toLowerCase() !== "true") {
    console.log("MAIL_ENABLED is not true here; checking the credentials anyway.");
  }

  const missing = REQUIRED.filter((name) => env(name) === undefined);
  if (missing.length > 0) {
    fail(`✗ Missing ${missing.join(", ")}. See the mail block in .env.example.`);
  }

  const accessToken = await token();
  checkRoles(claimsOf(accessToken));

  if (!shouldSend) {
    console.log(`- 2/2 Send: skipped. Run with -- --send to send one real message to ${env("MAIL_NOTIFY_TO")}.`);
    return;
  }
  await sendOne(accessToken);
}

await main();

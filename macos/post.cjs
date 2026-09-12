#!/usr/bin/env node
// Shared poster for the macOS capture scripts. Builds a JSON body from argv and
// POSTs it to the local Event Horizon server, so the shell scripts never have
// to escape JSON themselves.
//
//   node post.cjs /api/mistakes what="tripped" happenedToday:=true
//
// key=value sends a string; key:=raw sends raw JSON (true, false, numbers).
// Exits 0 only when the server answered { ok: true }.

const endpoint = process.argv[2];
if (!endpoint || !endpoint.startsWith("/")) {
  console.error("usage: node post.cjs /api/endpoint key=value [key:=raw ...]");
  process.exit(2);
}

const port = Number(process.env.JOURNAL_PORT || 8787);
const payload = {};
for (const arg of process.argv.slice(3)) {
  const raw = arg.match(/^([^=:]+):=(.*)$/s);
  const str = arg.match(/^([^=]+)=(.*)$/s);
  if (raw) payload[raw[1]] = JSON.parse(raw[2]);
  else if (str) payload[str[1]] = str[2];
  else {
    console.error(`unparseable argument: ${arg}`);
    process.exit(2);
  }
}

fetch(`http://127.0.0.1:${port}${endpoint}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(4000)
})
  .then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      console.error(`server rejected it: ${response.status} ${JSON.stringify(data)}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(`Event Horizon is not running (${error.message}). Start it and try again.`);
    process.exit(1);
  });

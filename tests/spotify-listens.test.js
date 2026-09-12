// Harness: extracts the pure half of the Spotify listening log from server.cjs
// -- the row mapper, the idempotent merge, the now-playing shape -- and runs
// them over fabricated Spotify responses.
//
// What this guards: the log is fed by a timer that re-reads the same 50 plays
// every ten minutes. If the merge stops being idempotent the file gains a
// duplicate row per play per poll, six an hour, silently, until the
// append-only guard is the only thing that notices (and it never would: the
// file only grows). The date filter behind GET /api/spotify/listens is also
// here because an off-by-one there hands a day's plays to the wrong day.
//
// Run with: node tests/spotify-listens.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverSource = fs.readFileSync(path.join(root, "server.cjs"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

let pass = 0;
let fail = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    pass += 1;
    console.log(`PASS ${name}`);
    return;
  }
  fail += 1;
  console.log(`FAIL ${name}${detail ? `  -> ${detail}` : ""}`);
};

const pureSource = sliceBetween(
  serverSource,
  "function spotifyListenFromItem(",
  "// Only one pull at a time.",
  "listen mapper + merge + now playing"
);
const api = new Function(`${pureSource}\nreturn { spotifyListenFromItem, mergeSpotifyListens, spotifyNowPlayingFromResponse };`)();

const item = (playedAt, id, name, extra = {}) => ({
  played_at: playedAt,
  context: { type: "playlist", uri: "spotify:playlist:abc" },
  track: {
    id,
    name,
    uri: `spotify:track:${id}`,
    duration_ms: 180000,
    explicit: false,
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    artists: [{ id: "a1", name: "Artist One" }, { id: "a2", name: "Artist Two" }],
    album: { id: "al1", name: "The Album", images: [{ url: "big.jpg" }, { url: "small.jpg" }] },
    ...extra
  }
});

console.log("Row mapper:");
{
  const row = api.spotifyListenFromItem(item("2026-09-10T08:00:00.000Z", "t1", "Song"), "2026-09-10T08:10:00.000Z");
  check("id is playedAt + trackId", row.id === "2026-09-10T08:00:00.000Z:t1");
  check("artists flattened to names", row.artists.join("|") === "Artist One|Artist Two");
  check("artist ids kept", row.artistIds.join("|") === "a1|a2");
  check("smallest album art chosen", row.albumArt === "small.jpg");
  check("context recorded", row.contextType === "playlist" && row.contextUri === "spotify:playlist:abc");
  check("loggedAt carried", row.loggedAt === "2026-09-10T08:10:00.000Z");
  check("item without played_at is dropped", api.spotifyListenFromItem({ track: { id: "x" } }, "") === null);
  check("item without track id is dropped", api.spotifyListenFromItem({ played_at: "2026-01-01T00:00:00Z", track: {} }, "") === null);
  check("local file falls back to uri as id", api.spotifyListenFromItem({ played_at: "2026-01-01T00:00:00Z", track: { uri: "spotify:local:x", name: "L" } }, "").trackId === "spotify:local:x");
  check("album with no images does not throw", api.spotifyListenFromItem(item("2026-01-01T00:00:00Z", "t", "n", { album: { name: "A" } }), "").albumArt === "");
}

console.log("\nMerge:");
{
  const a = api.spotifyListenFromItem(item("2026-09-10T08:00:00.000Z", "t1", "One"), "x");
  const b = api.spotifyListenFromItem(item("2026-09-10T08:03:00.000Z", "t2", "Two"), "x");
  const c = api.spotifyListenFromItem(item("2026-09-10T08:06:00.000Z", "t1", "One again"), "x");
  const first = api.mergeSpotifyListens([], [b, a]);
  check("first pull stores every row", first.listens.length === 2 && first.added.length === 2);
  check("sorted oldest first", first.listens[0].id === a.id && first.listens[1].id === b.id);
  const again = api.mergeSpotifyListens(first.listens, [a, b]);
  check("same 50 again adds nothing", again.added.length === 0);
  check("and hands back the same array untouched", again.listens === first.listens);
  const third = api.mergeSpotifyListens(first.listens, [a, b, c, null]);
  check("same track played again is a new row", third.added.length === 1 && third.added[0].id === c.id);
  check("null rows from a bad item are skipped", third.listens.length === 3);
  check("existing array not mutated", first.listens.length === 2);
  const dupInBatch = api.mergeSpotifyListens([], [a, a]);
  check("duplicate inside one batch stored once", dupInBatch.listens.length === 1);
}

console.log("\nNow playing:");
{
  const playing = api.spotifyNowPlayingFromResponse({
    is_playing: true,
    progress_ms: 4200,
    currently_playing_type: "track",
    item: item("", "t9", "Live").track,
    context: null
  });
  check("track shape", playing.track === "Live" && playing.isPlaying === true && playing.progressMs === 4200);
  check("204 / nothing playing", api.spotifyNowPlayingFromResponse(null) === null);
  check("podcast episode ignored", api.spotifyNowPlayingFromResponse({ currently_playing_type: "episode", item: { id: "e" } }) === null);
}

console.log("\nWhat the policy table says:");
{
  const policy = sliceBetween(serverSource, "const DATA_FILE_POLICY = {", "};", "policy table");
  check("spotify-listens.json is append-only", /"spotify-listens\.json":\s*\{[^}]*append-only/.test(policy));
  check("spotify-auth.json has no policy (so no token copies in backups)", !policy.includes("spotify-auth.json"));
  check("spotify-config.json has no policy", !policy.includes("spotify-config.json"));
  check("poller starts once the port answers", /server\.listen\([\s\S]*startSpotifyPoller\(\)/.test(serverSource));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

// Cell-selection logic for Chat Bingo.
//
// A board is built by deterministically shuffling the entry list with a PRNG
// seeded from the game code, then taking the first 25. Because the shuffle is
// seeded by the full game code, the same code + entries always produce the
// same board (so it can be shared), different codes produce different boards,
// and every entry the user typed is eligible — no blank or repeated squares.

// FNV-1a hash: turns the game code string into a 32-bit seed.
function hashSeed(str) {
  var h = 2166136261;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: a small, well-distributed PRNG returning floats in [0, 1).
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Returns 25 bingo entries (a 5x5 board), chosen deterministically from
// `bingoData` based on `gameCode`. Assumes bingoData has at least 25 entries
// (the input form enforces this).
function createBingoCells(gameCode, bingoData) {
  var rnd = mulberry32(hashSeed(gameCode));
  var pool = bingoData.slice();

  // Fisher–Yates shuffle.
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(rnd() * (i + 1));
    var tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return pool.slice(0, 25);
}

// --- Sharing -------------------------------------------------------------
//
// A board is fully determined by its game code and entry list, so sharing
// those two reproduces an identical board. We pack them into a URL-safe
// base64 token that lives in the page's URL hash.

// URL-safe base64 (RFC 4648 §5): no '+', '/', or '=' padding, so the token
// survives being pasted into links and messaging apps untouched.
function _toBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function _fromBase64Url(token) {
  var b64 = token.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return b64;
}

// Encode { gameCode, entries } into a share token.
function encodeBoard(gameCode, entries) {
  var json = JSON.stringify({ g: gameCode, e: entries });
  var bytes = new TextEncoder().encode(json);
  var binary = '';
  bytes.forEach(function (b) {
    binary += String.fromCharCode(b);
  });
  return _toBase64Url(btoa(binary));
}

// Decode a share token back into { gameCode, entries }, or null if the token
// is missing or malformed.
function decodeBoard(token) {
  if (!token) return null;
  try {
    var binary = atob(_fromBase64Url(token));
    var bytes = Uint8Array.from(binary, function (c) {
      return c.charCodeAt(0);
    });
    var obj = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof obj.g !== 'string' || !Array.isArray(obj.e)) return null;
    return { gameCode: obj.g, entries: obj.e.map(String) };
  } catch (e) {
    return null;
  }
}

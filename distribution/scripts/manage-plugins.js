#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 BearingPoint GmbH
//
// SPDX-License-Identifier: Apache-2.0
//
// CLI helper to manage the external plugin registry:
//   * add    - append a new plugin to remote-plugins.json AND register it in
//              public/public/js/plugins.js with src: "/external-plugins/<dest>".
//              The plugin is downloaded so sha256 can be generated automatically
//              unless --allow-insecure is used.
//   * update - locate a plugin in remote-plugins.json by name and change its
//              url and/or dest, always re-downloading and recomputing sha256
//              unless --allow-insecure is used.
//   * verify - download every listed plugin and compare content against the
//              stored sha256 (entries without sha256 fail unless
//              --allow-insecure is used).
//
// This is a plain Node >= 18 script with NO runtime dependencies. It relies
// only on Node built-ins (fs, path, url, crypto) and the global fetch.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { URL, fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths (resolved relative to this script so it works from any CWD)
// ---------------------------------------------------------------------------
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const REMOTE_PLUGINS_PATH = path.join(
  REPO_ROOT,
  'distribution',
  'remote-plugins.json',
);
const PLUGINS_JS_PATH = path.join(
  REPO_ROOT,
  'public',
  'public',
  'js',
  'plugins.js',
);

const EXTERNAL_PLUGINS_PREFIX = '/external-plugins/';

const ACCEPTED_COMMANDS = ['add', 'update', 'verify'];

const DEFAULT_EDITOR_META = {
  icon: 'extension',
  kind: 'editor',
  activeByDefault: false,
  requireDoc: true,
};

const VALID_KINDS = ['editor', 'menu', 'validator'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Print CLI usage information to stderr.
function usage() {
  const msg = [
    'Usage: node manage-plugins.js <command> [flags]',
    '',
    'Commands:',
    '  add     Add a plugin to remote-plugins.json and register it in plugins.js',
    '  update  Change url and/or dest of an existing plugin (re-downloads sha256)',
    '  verify  Download every plugin and compare against stored sha256',
    '',
    'Flags for "add":',
    '  --name <name>              (required) Plugin display name',
    '  --url <url>                (required) Remote https URL to fetch from',
    '  --dest <path>              (optional) Relative destination (defaults to',
    '                             the last URL path segment)',
    '  --allow-insecure           (optional) Skip automatic sha256 generation',
    '  --icon <name>              (optional, default: extension)',
    '  --kind <editor|menu|validator>  (optional, default: editor)',
    '  --active-by-default <bool> (optional, default: false)',
    '  --require-doc <bool>       (optional, default: true)',
    '',
    'Flags for "update":',
    '  --name <name>              (required) Existing plugin name',
    '  --url <url>                (required) New https URL',
    '  --dest <path>              (optional) New destination',
    '  --allow-insecure           (optional) Skip automatic sha256 generation',
    '  (the name must match an existing plugin entry)',
    '',
    'Flags for "verify":',
    '  --name <name>              (optional) Verify only the given plugin',
    '  --allow-insecure           (optional) Skip sha256 comparison for all entries',
  ].join('\n');
  process.stderr.write(msg + '\n');
}

// Print an error message to stderr and exit with a non-zero status.
function fail(msg) {
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(1);
}

// Parse a "true"/"false" CLI value into a boolean; fail on anything else.
function parseBool(value, flag) {
  if (typeof value !== 'string') {
    fail(`Flag ${flag} requires a boolean value (true|false).`);
  }
  const v = value.toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  fail(`Flag ${flag} must be true or false, got "${value}".`);
  return false;
}

// Return true if the value is a well-formed https URL. Plain http is
// rejected so plugin content is always fetched over an authenticated,
// tamper-resistant channel.
function isValidHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

// Return true if the value is a 64-character hex string (a valid sha256 digest).
function isValidSha256(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{64}$/.test(value);
}

// Validate and normalize a destination path. Rejects absolute paths, Windows
// drive letters, backslashes, and "." / ".." segments; returns null on rejection.
function normalizeDest(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (value.includes('\\')) return null;
  if (value.startsWith('/')) return null;
  if (/^[a-zA-Z]:/.test(value)) return null;
  const parts = value.split('/');
  for (const p of parts) {
    if (p === '' || p === '.' || p === '..') return null;
  }
  return parts.join('/');
}

// Derive a default destination path from a URL's pathname (everything after
// the domain, without the leading slash).
function destFromUrl(urlStr) {
  const url = new URL(urlStr);
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  return segments.join('/');
}

// Compute the sha256 hex digest of a buffer.
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

// Parse the CLI arguments into a single args object. Fails on unknown flags,
// unknown commands, or missing flag values.
function parseArgs(argv) {
  const args = {
    cmd: undefined,
    name: undefined,
    url: undefined,
    dest: undefined,
    icon: undefined,
    kind: undefined,
    activeByDefault: undefined,
    requireDoc: undefined,
    allowInsecure: false,
  };

  if (argv.length < 1) {
    usage();
    fail('No command supplied.');
  }

  args.cmd = argv[0];

  if (!ACCEPTED_COMMANDS.includes(args.cmd)) {
    usage();
    fail(
      `Unknown command "${args.cmd}". Accepted commands: ${ACCEPTED_COMMANDS.join(', ')}.`,
    );
  }

  for (let i = 1; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    const needValue = () => {
      if (typeof next !== 'string') {
        usage();
        fail(`Flag ${flag} requires a value.`);
      }
    };

    switch (flag) {
      case '--name':
        needValue();
        args.name = next;
        i++;
        break;
      case '--url':
        needValue();
        args.url = next;
        i++;
        break;
      case '--dest':
        needValue();
        args.dest = next;
        i++;
        break;
      case '--icon':
        needValue();
        args.icon = next;
        i++;
        break;
      case '--kind':
        needValue();
        args.kind = next;
        i++;
        break;
      case '--active-by-default':
        needValue();
        args.activeByDefault = parseBool(next, '--active-by-default');
        i++;
        break;
      case '--require-doc':
        needValue();
        args.requireDoc = parseBool(next, '--require-doc');
        i++;
        break;
      case '--allow-insecure':
        args.allowInsecure = true;
        break;
      case '-h':
      case '--help':
        usage();
        process.exit(0);
        break;
      default:
        usage();
        fail(`Unknown argument "${flag}".`);
    }
  }

  return args;
}

// Enforce the flag requirements for the "add" command and normalize its
// values in place (e.g. defaulting dest, normalizing the path).
function validateAddArgs(args) {
  if (!args.name || !args.url) {
    usage();
    fail('"add" requires both --name and --url.');
  }
  if (!isValidHttpsUrl(args.url)) {
    fail(`Invalid URL: "${args.url}". Must be an https URL.`);
  }
  if (args.dest !== undefined) {
    const normalized = normalizeDest(args.dest);
    if (normalized === null) {
      fail(
        `Invalid --dest "${args.dest}". Must be a relative path with no ` +
        'leading slash, backslashes, or ".."/"." segments.',
      );
    }
    args.dest = normalized;
  } else {
    const inferred = destFromUrl(args.url);
    if (!inferred) {
      fail(`Cannot infer --dest from URL "${args.url}". Please specify --dest.`);
    }
    args.dest = inferred;
  }
  if (args.kind !== undefined && !VALID_KINDS.includes(args.kind)) {
    fail(`Invalid --kind "${args.kind}". Must be one of: ${VALID_KINDS.join(', ')}.`);
  }
}

// Enforce the flag requirements for the "update" command and normalize its
// values in place.
function validateUpdateArgs(args) {
  if (!args.name) {
    usage();
    fail('"update" requires --name.');
  }
  if (args.url === undefined) {
    usage();
    fail('"update" requires --url.');
  }
  if (args.url !== undefined && !isValidHttpsUrl(args.url)) {
    fail(`Invalid URL: "${args.url}". Must be an https URL.`);
  }
  if (args.dest !== undefined) {
    const normalized = normalizeDest(args.dest);
    if (normalized === null) {
      fail(
        `Invalid --dest "${args.dest}". Must be a relative path with no ` +
        'leading slash, backslashes, or ".."/"." segments.',
      );
    }
    args.dest = normalized;
  }
}

// ---------------------------------------------------------------------------
// File I/O helpers
// ---------------------------------------------------------------------------

// Read and parse remote-plugins.json. Also reports whether the source file
// ended with a trailing newline so writeRemotePlugins can preserve it.
function readRemotePlugins() {
  if (!fs.existsSync(REMOTE_PLUGINS_PATH)) {
    fail(`Configuration file not found: ${REMOTE_PLUGINS_PATH}`);
  }
  let raw;
  try {
    raw = fs.readFileSync(REMOTE_PLUGINS_PATH, 'utf8');
  } catch (e) {
    fail(`Cannot read ${REMOTE_PLUGINS_PATH}: ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    fail(`Cannot parse ${REMOTE_PLUGINS_PATH}: ${e.message}`);
  }
  if (!parsed || !Array.isArray(parsed.plugins)) {
    fail(`Invalid ${REMOTE_PLUGINS_PATH}: expected a "plugins" array.`);
  }
  return { data: parsed, rawEndsWithNewline: raw.endsWith('\n') };
}

// Serialize the plugin registry back to disk with 2-space indentation.
function writeRemotePlugins(data, endsWithNewline) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(
    REMOTE_PLUGINS_PATH,
    endsWithNewline ? json + '\n' : json,
    'utf8',
  );
}

// Read the plugins.js source as a UTF-8 string.
function readPluginsJs() {
  if (!fs.existsSync(PLUGINS_JS_PATH)) {
    fail(`plugins.js not found: ${PLUGINS_JS_PATH}`);
  }
  return fs.readFileSync(PLUGINS_JS_PATH, 'utf8');
}

// Overwrite plugins.js with the given content.
function writePluginsJs(content) {
  fs.writeFileSync(PLUGINS_JS_PATH, content, 'utf8');
}

// Case-insensitive lookup of a plugin's index by name in the plugin array.
function findPluginIndex(plugins, name) {
  const lc = name.toLowerCase();
  return plugins.findIndex(
    p => typeof p.name === 'string' && p.name.toLowerCase() === lc,
  );
}

// Return the index of the first plugin whose url matches exactly.
function findPluginUrlIndex(plugins, url) {
  return plugins.findIndex(p => typeof p.url === 'string' && p.url === url);
}

// Return the index of the first plugin whose dest matches exactly.
function findPluginDestIndex(plugins, dest) {
  return plugins.findIndex(p => typeof p.dest === 'string' && p.dest === dest);
}

// ---------------------------------------------------------------------------
// HTTP download
// ---------------------------------------------------------------------------

// Download an https resource. Redirects are followed automatically by the
// built-in fetch. Resolves with the response body as a Buffer; throws on
// non-2xx status or network error.
async function download(urlStr) {
  const response = await fetch(urlStr, {
    headers: { 'User-Agent': 'manage-plugins/1.0' },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${urlStr}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// ---------------------------------------------------------------------------
// plugins.js manipulation
// ---------------------------------------------------------------------------

// Build the text of a new officialPlugins entry with the standard 2-space
// indentation used elsewhere in plugins.js.
function buildPluginsJsEntry(pluginName, destRelPath, meta) {
  const src = EXTERNAL_PLUGINS_PREFIX + destRelPath;
  const lines = [
    '  {',
    `    name: '${escapeJsSingleQuote(pluginName)}',`,
    `    src: '${escapeJsSingleQuote(src)}',`,
    `    icon: '${escapeJsSingleQuote(meta.icon)}',`,
    `    activeByDefault: ${meta.activeByDefault ? 'true' : 'false'},`,
    `    kind: '${escapeJsSingleQuote(meta.kind)}',`,
    `    requireDoc: ${meta.requireDoc ? 'true' : 'false'},`,
    '  }',
  ];
  return lines.join('\n');
}

// Escape backslashes and single quotes for embedding inside a single-quoted
// JavaScript string literal.
function escapeJsSingleQuote(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Insert a new officialPlugins entry just before the closing `];`, adding a
// trailing comma to the previous entry when necessary.
function appendEntryToPluginsJs(content, entryText) {
  const marker = /\n];\s*$/;
  if (!marker.test(content)) {
    fail(
      `Could not locate end of officialPlugins array in ${PLUGINS_JS_PATH}. ` +
      'Expected the file to end with "];".',
    );
  }
  const idx = content.lastIndexOf('\n];');
  const before = content.slice(0, idx);
  const after = content.slice(idx);
  const trailingCommaFixed = before.replace(/\}(\s*)$/, '},$1');
  return trailingCommaFixed + '\n' + entryText + ',' + after;
}

// Rewrite the `src:` line of the officialPlugins entry whose `name:` matches
// pluginName (case-insensitive). Returns { content, updated } where `updated`
// is false when either the name or the src line cannot be found.
function updateEntrySrcInPluginsJs(content, pluginName, newSrc) {
  const lc = pluginName.toLowerCase();
  const nameLineRe = /^([ \t]*)name:\s*(['"])([^'"]*)\2\s*,?\s*$/gm;
  let match;
  let foundStart = -1;
  while ((match = nameLineRe.exec(content)) !== null) {
    if (match[3].toLowerCase() === lc) {
      foundStart = match.index;
      break;
    }
  }
  if (foundStart === -1) {
    return { content, updated: false };
  }
  const objEndIdx = content.indexOf('\n  }', foundStart);
  const searchEnd = objEndIdx === -1 ? content.length : objEndIdx;
  const region = content.slice(foundStart, searchEnd);
  const srcRe = /^([ \t]*)src:\s*(['"])[^'"]*\2(\s*,?\s*)$/m;
  if (!srcRe.test(region)) {
    return { content, updated: false };
  }
  const newRegion = region.replace(
    srcRe,
    (_all, indent, quote, tail) =>
      `${indent}src: ${quote}${escapeJsSingleQuote(newSrc)}${quote}${tail || ','}`,
  );
  return {
    content: content.slice(0, foundStart) + newRegion + content.slice(searchEnd),
    updated: true,
  };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

// Append a new plugin to remote-plugins.json and register it in plugins.js.
// Refuses to overwrite an existing entry (case-insensitive name, url and dest match) and
// reads/parses plugins.js up-front so a malformed file aborts before any
// on-disk change is made.
async function cmdAdd(args) {
  validateAddArgs(args);

  const { data, rawEndsWithNewline } = readRemotePlugins();
  if (findPluginIndex(data.plugins, args.name) !== -1) {
    fail(
      `A plugin named "${args.name}" (case-insensitive) already exists in ` +
      'remote-plugins.json. Refusing to overwrite.',
    );
  }
  if (findPluginUrlIndex(data.plugins, args.url) !== -1) {
    fail(
      `A plugin with url "${args.url}" already exists in remote-plugins.json. ` +
      'Refusing to overwrite.',
    );
  }
  if (findPluginDestIndex(data.plugins, args.dest) !== -1) {
    fail(
      `A plugin with dest "${args.dest}" already exists in remote-plugins.json. ` +
      'Refusing to overwrite.',
    );
  }

  const meta = {
    icon: args.icon !== undefined ? args.icon : DEFAULT_EDITOR_META.icon,
    kind: args.kind !== undefined ? args.kind : DEFAULT_EDITOR_META.kind,
    activeByDefault:
      args.activeByDefault !== undefined
        ? args.activeByDefault
        : DEFAULT_EDITOR_META.activeByDefault,
    requireDoc:
      args.requireDoc !== undefined
        ? args.requireDoc
        : DEFAULT_EDITOR_META.requireDoc,
  };

  process.stdout.write(`Downloading "${args.name}" from ${args.url}...\n`);
  let buffer;
  try {
    buffer = await download(args.url);
  } catch (e) {
    fail(`Failed to download from ${args.url}: ${e.message}`);
  }
  if (!buffer || buffer.length === 0) {
    fail(`Downloaded content from ${args.url} is empty.`);
  }

  const newEntry = {
    name: args.name,
    url: args.url,
    dest: args.dest,
    sha256: args.allowInsecure ? '' : sha256(buffer),
  };

  const pluginsJs = readPluginsJs();
  const entryText = buildPluginsJsEntry(args.name, args.dest, meta);
  const newPluginsJs = appendEntryToPluginsJs(pluginsJs, entryText);

  data.plugins.push(newEntry);
  writeRemotePlugins(data, rawEndsWithNewline);
  writePluginsJs(newPluginsJs);

  process.stdout.write(
    `Added plugin "${args.name}"\n` +
    `  url  : ${newEntry.url}\n` +
    `  dest : ${newEntry.dest}\n` +
    `  sha256: ${newEntry.sha256 || '(empty)'}\n` +
    `  src  : ${EXTERNAL_PLUGINS_PREFIX + newEntry.dest}\n`,
  );
}

// Change the url and/or dest of an existing plugin. Always re-downloads the
// content and recomputes its sha256 so the stored hash can never drift from
// what the URL actually serves. Keeps plugins.js in sync when dest changes.
async function cmdUpdate(args) {
  validateUpdateArgs(args);

  const { data, rawEndsWithNewline } = readRemotePlugins();
  const idx = findPluginIndex(data.plugins, args.name);
  if (idx === -1) {
    fail(`No plugin named "${args.name}" found in remote-plugins.json.`);
  }
  const plugin = data.plugins[idx];
  const oldDest = plugin.dest;
  const newUrl = args.url;
  const newDest = args.dest !== undefined ? args.dest : plugin.dest;

  process.stdout.write(`Downloading "${plugin.name}" from ${newUrl}...\n`);
  let buffer;
  try {
    buffer = await download(newUrl);
  } catch (e) {
    fail(`Failed to download from ${newUrl}: ${e.message}`);
  }
  if (!buffer || buffer.length === 0) {
    fail(`Downloaded content from ${newUrl} is empty.`);
  }

  plugin.url = newUrl;
  plugin.dest = newDest;
  plugin.sha256 = args.allowInsecure ? '' : sha256(buffer);

  if (newDest !== oldDest) {
    const pluginsJs = readPluginsJs();
    const newSrc = EXTERNAL_PLUGINS_PREFIX + newDest;
    const { content, updated } = updateEntrySrcInPluginsJs(
      pluginsJs,
      plugin.name,
      newSrc,
    );
    if (updated) {
      writePluginsJs(content);
      process.stdout.write(`Updated src in plugins.js to ${newSrc}\n`);
    } else {
      process.stderr.write(
        `Warning: plugin "${plugin.name}" not found in ${PLUGINS_JS_PATH}; ` +
        'skipping plugins.js update.\n',
      );
    }
  }

  writeRemotePlugins(data, rawEndsWithNewline);

  process.stdout.write(
    `Updated plugin "${plugin.name}"\n` +
    `  url   : ${plugin.url}\n` +
    `  dest  : ${plugin.dest}\n` +
    `  sha256: ${plugin.sha256}\n`,
  );
}

// Download every plugin (or a single one when --name is given) and compare
// its content against the stored sha256. Reports OK / SKIP (--allow-insecure) /
// FAIL (missing sha256, mismatch, download error, or empty response) per
// plugin and exits non-zero on any failure.
async function cmdVerify(args) {
  const { data } = readRemotePlugins();
  let plugins = data.plugins;
  if (args.name) {
    const idx = findPluginIndex(plugins, args.name);
    if (idx === -1) {
      fail(`No plugin named "${args.name}" found in remote-plugins.json.`);
    }
    plugins = [plugins[idx]];
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const plugin of plugins) {
    process.stdout.write(`Verifying "${plugin.name}" (${plugin.url})... `);
    let buffer;
    try {
      buffer = await download(plugin.url);
    } catch (e) {
      failed++;
      failures.push(`${plugin.name}: download error - ${e.message}`);
      process.stdout.write(`FAIL (${e.message})\n`);
      continue;
    }
    if (!buffer || buffer.length === 0) {
      failed++;
      failures.push(`${plugin.name}: empty response`);
      process.stdout.write('FAIL (empty response)\n');
      continue;
    }
    if (args.allowInsecure) {
      skipped++;
      process.stdout.write('SKIP (--allow-insecure)\n');
      continue;
    }
    if (!plugin.sha256) {
      failed++;
      failures.push(
        `${plugin.name}: missing sha256 (use --allow-insecure to bypass hash verification)`,
      );
      process.stdout.write('FAIL (missing sha256; use --allow-insecure to bypass)\n');
      continue;
    }
    const actual = sha256(buffer);
    if (actual === plugin.sha256) {
      ok++;
      process.stdout.write('OK\n');
    } else {
      failed++;
      failures.push(
        `${plugin.name}: sha256 mismatch (expected ${plugin.sha256}, got ${actual})`,
      );
      process.stdout.write(
        `FAIL (expected ${plugin.sha256}, got ${actual})\n`,
      );
    }
  }

  process.stdout.write(
    `\nSummary: ${ok} ok, ${skipped} skipped, ${failed} failed ` +
    `(total ${plugins.length}).\n`,
  );
  if (failed > 0) {
    process.stderr.write('\nFailures:\n');
    for (const f of failures) process.stderr.write(`  - ${f}\n`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  switch (args.cmd) {
    case 'add':
      await cmdAdd(args);
      break;
    case 'update':
      await cmdUpdate(args);
      break;
    case 'verify':
      await cmdVerify(args);
      break;
    default:
      usage();
      fail(`Unknown command "${args.cmd}".`);
  }
}

main().catch(err => {
  process.stderr.write(`Error: ${err && err.message ? err.message : err}\n`);
  process.exit(1);
});

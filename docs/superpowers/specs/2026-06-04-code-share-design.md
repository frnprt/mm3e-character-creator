# Code-Based Character Share/Restore

Portable save/restore for characters and rosters without file transfer or server-side storage.

## Overview

Encode character data into a compressed, URL-safe string that can be shared as a URL fragment or copied as a text code. Decode on import via the same pipeline in reverse.

## Codec

### Encode

1. `JSON.stringify(data)` → raw JSON string
2. Compress via `CompressionStream('deflate-raw')` → compressed bytes
3. Encode as base64url (`A-Z a-z 0-9 - _`, no `=` padding) → string

### Decode

1. base64url → bytes
2. `DecompressionStream('deflate-raw')` → decompressed bytes
3. `JSON.parse(text)` → character/roster object

### Scope Prefix

The encoded string is prefixed with a single character indicating data scope:

- `c` — single character (the current character's state object)
- `r` — full roster (the roster object: `{ activeId, characters, nextRosterId }`)

The importer reads this prefix to determine how to handle the payload.

## URL Fragment Import

### Export

Construct a URL: `<current-origin-and-path>#mm3e=<prefix><base64url-data>`

The `mm3e=` namespace prefix prevents collisions with other hash usage.

### Auto-Import on Load

At app startup, check `window.location.hash`:
1. If it matches `#mm3e=...`, extract and decode the payload.
2. Show a confirmation modal:
   - Single char: *"Import character 'Hero Name'?"*
   - Roster: *"Import roster with N characters? This will replace your current roster."*
3. On confirm: import the data.
4. Clear the hash via `history.replaceState(null, '', window.location.pathname)` to prevent re-import on refresh.
5. On cancel: clear the hash silently.

### "Share as URL" Button

Encodes the current character, constructs the full URL, and copies it to clipboard. Shows a toast: *"URL copied to clipboard"*. If the encoded URL exceeds 2000 characters, also show a warning: *"URL is long and may be truncated in some apps. Use 'Share as Code' for reliable sharing."*

## Copy-Paste Code Import/Export

### Export Modal

Triggered by "Share as Code" button. Contains:
- A toggle: "Current character" / "Full roster"
- A read-only textarea with the encoded string (auto-selected on focus)
- A "Copy to clipboard" button with toast feedback

### Import Modal

Triggered by "Import Code" button. Contains:
- A textarea for pasting the encoded string
- An "Import" button
- An inline error area (hidden by default)

### Import Behavior

1. Decode the pasted string.
2. Detect scope from prefix (`c` or `r`).
3. Single character → add to roster and switch to it.
4. Full roster → confirm: *"Replace your entire roster with N characters?"* → on confirm, replace roster and load first character.
5. On decode failure → show inline error: *"Invalid code. Please check you copied the full string."*

## UI Placement

New buttons added to the existing "Save / Load" panel in the Info tab:

```
[Save Character (JSON)] [Load Character] [Export as Text]
[Share as Code] [Import Code] [Share as URL]
[Reset Character]
```

Modals follow the existing app pattern (overlay with backdrop, title, content, close button).

## Browser Compatibility

- Requires `CompressionStream` / `DecompressionStream`: Chrome 80+, Firefox 113+, Safari 16.4+.
- No polyfill or external library needed.
- Clipboard API (`navigator.clipboard.writeText`) with fallback to `document.execCommand('copy')` on a selected textarea. If both fail, leave textarea visible for manual copy.

## Edge Cases

- **Empty character**: produces a small encoded string; works normally.
- **Long URLs (>2000 chars)**: warning shown alongside the "Share as URL" action; "Share as Code" recommended as alternative.
- **Hash cleared after import**: prevents refresh re-triggering import.
- **Malformed input**: graceful error message, no crash.
- **Forward compatibility**: `loadStateFromData` already handles missing keys with defaults, so older encoded characters load safely in newer app versions.

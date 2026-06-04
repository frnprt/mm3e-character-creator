# Code-Based Character Share/Restore — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add compressed code-string and URL-fragment share/restore to the M&M 3e character creator.

**Architecture:** A shared async codec (compress/decompress using browser-native `CompressionStream`) encodes character or roster data into a base64url string. Two export surfaces use this codec: a "Share as URL" button (copies a `#mm3e=...` URL to clipboard) and a "Share as Code" modal (shows the string in a textarea). Import surfaces: URL hash auto-detection on startup, and an "Import Code" modal with a paste textarea.

**Tech Stack:** Vanilla JS (no build step), browser-native `CompressionStream`/`DecompressionStream`, Clipboard API with fallback.

---

### Task 1: Codec — Encode/Decode Functions

**Files:**
- Create: `js/codec.js`

- [ ] **Step 1: Create `js/codec.js` with encode function**

```javascript
// js/codec.js — Encode/decode character data as compressed base64url strings
'use strict';

/**
 * Compress and encode data to a prefixed base64url string.
 * @param {'c'|'r'} scope - 'c' for single character, 'r' for roster
 * @param {object} data - The character state or roster object
 * @returns {Promise<string>} prefixed base64url string
 */
async function encodeShareString(scope, data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const compressed = await new Response(cs.readable).arrayBuffer();
  const b64 = uint8ToBase64url(new Uint8Array(compressed));
  return scope + b64;
}

/**
 * Decode a prefixed base64url string back to scope + data.
 * @param {string} str - The encoded string (with scope prefix)
 * @returns {Promise<{scope: string, data: object}>}
 */
async function decodeShareString(str) {
  if (!str || str.length < 2) throw new Error('Invalid share string');
  const scope = str[0];
  if (scope !== 'c' && scope !== 'r') throw new Error('Invalid scope prefix');
  const b64 = str.slice(1);
  const compressed = base64urlToUint8(b64);
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed);
  writer.close();
  const decompressed = await new Response(ds.readable).arrayBuffer();
  const json = new TextDecoder().decode(decompressed);
  return { scope, data: JSON.parse(json) };
}

function uint8ToBase64url(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToUint8(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
```

- [ ] **Step 2: Add script tag to `index.html`**

In `index.html`, add the codec script before `app.js`:

```html
  <script src="js/codec.js"></script>
  <script src="js/app.js"></script>
```

- [ ] **Step 3: Manual smoke test**

Open the browser console and run:
```javascript
encodeShareString('c', {name: 'Test', level: 10}).then(s => {
  console.log('Encoded length:', s.length, 'chars');
  return decodeShareString(s);
}).then(r => console.log('Decoded:', r));
```
Expected: Logs the encoded length (short string) and decoded object `{scope: 'c', data: {name: 'Test', level: 10}}`.

- [ ] **Step 4: Commit**

```bash
git add js/codec.js index.html
git commit -m "feat: add codec for compressed base64url share strings"
```

---

### Task 2: Share as Code — Export Modal

**Files:**
- Modify: `index.html` (add modal HTML and export button)
- Modify: `js/app.js` (add export modal logic)
- Modify: `css/styles.css` (add share-code textarea style)

- [ ] **Step 1: Add export modal HTML to `index.html`**

After the last existing modal (before the closing `</main>` or `</body>`), add:

```html
    <!-- Share Code Export modal -->
    <div class="modal-overlay" id="share-export-modal" style="display:none">
      <div class="modal modal-small">
        <div class="modal-header">
          <h3>Share as Code</h3>
          <button class="modal-close" id="share-export-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>What to share:</label>
            <div class="button-row" style="margin-bottom:0.75rem">
              <button class="btn-secondary active" id="share-scope-char">Current Character</button>
              <button class="btn-secondary" id="share-scope-roster">Full Roster</button>
            </div>
          </div>
          <div class="form-group">
            <label for="share-export-text">Share Code:</label>
            <textarea id="share-export-text" class="share-code-textarea" readonly></textarea>
          </div>
          <div id="share-export-status" class="share-status"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="share-export-cancel">Close</button>
          <button class="btn-primary" id="share-export-copy">Copy to Clipboard</button>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Add the "Share as Code" button to the Save/Load panel in `index.html`**

In the existing `.button-row` inside the "Save / Load" panel, after the "Export as Text" button, add:

```html
          <button class="btn-secondary" id="btn-share-code">Share as Code</button>
```

- [ ] **Step 3: Add textarea CSS to `css/styles.css`**

```css
.share-code-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  font-family: monospace;
  font-size: 0.8rem;
  background: var(--bg-dark);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem;
  word-break: break-all;
}

.share-status {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  min-height: 1.2em;
}

.share-status.success { color: var(--accent); }
.share-status.error { color: var(--danger, #e74c3c); }
```

- [ ] **Step 4: Add export modal logic to `js/app.js`**

Add a new function `setupShareExport()` and call it from `init()`:

```javascript
// ========== SHARE CODE EXPORT ==========
function setupShareExport() {
  let shareScope = 'c';
  const modal = $('#share-export-modal');
  const textarea = $('#share-export-text');
  const status = $('#share-export-status');
  const btnChar = $('#share-scope-char');
  const btnRoster = $('#share-scope-roster');

  function setScope(scope) {
    shareScope = scope;
    btnChar.classList.toggle('active', scope === 'c');
    btnRoster.classList.toggle('active', scope === 'r');
    generateCode();
  }

  async function generateCode() {
    status.textContent = '';
    status.className = 'share-status';
    textarea.value = 'Generating...';
    try {
      const data = shareScope === 'c'
        ? getStateForSave()
        : { activeId: roster.activeId, characters: roster.characters, nextRosterId };
      const code = await encodeShareString(shareScope, data);
      textarea.value = code;
    } catch (e) {
      textarea.value = '';
      status.textContent = 'Error generating code.';
      status.className = 'share-status error';
    }
  }

  $('#btn-share-code').addEventListener('click', () => {
    shareScope = 'c';
    btnChar.classList.add('active');
    btnRoster.classList.remove('active');
    modal.style.display = 'flex';
    generateCode();
  });

  btnChar.addEventListener('click', () => setScope('c'));
  btnRoster.addEventListener('click', () => setScope('r'));

  $('#share-export-copy').addEventListener('click', () => {
    const text = textarea.value;
    if (!text || text === 'Generating...') return;
    navigator.clipboard.writeText(text).then(() => {
      status.textContent = 'Copied to clipboard!';
      status.className = 'share-status success';
    }).catch(() => {
      textarea.select();
      document.execCommand('copy');
      status.textContent = 'Copied to clipboard!';
      status.className = 'share-status success';
    });
  });

  textarea.addEventListener('focus', () => textarea.select());

  const closeModal = () => { modal.style.display = 'none'; };
  $('#share-export-close').addEventListener('click', closeModal);
  $('#share-export-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}
```

In `init()`, add `setupShareExport();` after `setupSaveLoad();`.

- [ ] **Step 5: Test manually**

Open the app, click "Share as Code". Verify the modal opens, shows a base64url string for the current character. Toggle to "Full Roster" and verify it updates. Click "Copy to Clipboard" and paste elsewhere to confirm.

- [ ] **Step 6: Commit**

```bash
git add index.html js/app.js css/styles.css
git commit -m "feat: add Share as Code export modal"
```

---

### Task 3: Import Code Modal

**Files:**
- Modify: `index.html` (add import modal HTML and button)
- Modify: `js/app.js` (add import modal logic)

- [ ] **Step 1: Add import modal HTML to `index.html`**

After the share-export modal:

```html
    <!-- Share Code Import modal -->
    <div class="modal-overlay" id="share-import-modal" style="display:none">
      <div class="modal modal-small">
        <div class="modal-header">
          <h3>Import Code</h3>
          <button class="modal-close" id="share-import-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="share-import-text">Paste share code below:</label>
            <textarea id="share-import-text" class="share-code-textarea" placeholder="Paste code here..."></textarea>
          </div>
          <div id="share-import-status" class="share-status"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="share-import-cancel">Cancel</button>
          <button class="btn-primary" id="share-import-go">Import</button>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Add "Import Code" button to the Save/Load panel in `index.html`**

After the "Share as Code" button:

```html
          <button class="btn-secondary" id="btn-import-code">Import Code</button>
```

- [ ] **Step 3: Add import modal logic to `js/app.js`**

```javascript
// ========== SHARE CODE IMPORT ==========
function setupShareImport() {
  const modal = $('#share-import-modal');
  const textarea = $('#share-import-text');
  const status = $('#share-import-status');

  $('#btn-import-code').addEventListener('click', () => {
    textarea.value = '';
    status.textContent = '';
    status.className = 'share-status';
    modal.style.display = 'flex';
    textarea.focus();
  });

  $('#share-import-go').addEventListener('click', async () => {
    const code = textarea.value.trim();
    if (!code) {
      status.textContent = 'Please paste a share code.';
      status.className = 'share-status error';
      return;
    }
    try {
      const { scope, data } = await decodeShareString(code);
      if (scope === 'c') {
        // Import single character into roster
        saveCurrentToRoster();
        const id = generateRosterId();
        roster.characters[id] = data;
        roster.activeId = id;
        loadStateFromData(data);
        renderCharacterBar();
        autoSaveRoster();
        modal.style.display = 'none';
        status.textContent = '';
      } else {
        // Roster import — confirm first
        const count = Object.keys(data.characters || {}).length;
        if (!confirm(`Replace your entire roster with ${count} character(s)? This cannot be undone.`)) return;
        roster.characters = data.characters || {};
        roster.activeId = data.activeId || Object.keys(roster.characters)[0];
        nextRosterId = data.nextRosterId || Object.keys(roster.characters).length + 1;
        loadStateFromData(roster.characters[roster.activeId]);
        renderCharacterBar();
        autoSaveRoster();
        modal.style.display = 'none';
        status.textContent = '';
      }
    } catch (e) {
      status.textContent = 'Invalid code. Please check you copied the full string.';
      status.className = 'share-status error';
    }
  });

  const closeModal = () => { modal.style.display = 'none'; };
  $('#share-import-close').addEventListener('click', closeModal);
  $('#share-import-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}
```

In `init()`, add `setupShareImport();` after `setupShareExport();`.

- [ ] **Step 4: Test manually**

Export a code from the export modal, then open the import modal, paste it, click Import. Verify the character appears in the roster. Test with an invalid string to see the error message.

- [ ] **Step 5: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add Import Code modal"
```

---

### Task 4: Share as URL

**Files:**
- Modify: `index.html` (add Share as URL button)
- Modify: `js/app.js` (add URL share logic + hash auto-import on load)

- [ ] **Step 1: Add "Share as URL" button to `index.html`**

After the "Import Code" button in the Save/Load panel:

```html
          <button class="btn-secondary" id="btn-share-url">Share as URL</button>
```

- [ ] **Step 2: Add Share as URL click handler in `js/app.js`**

Add inside `setupShareExport()` (or as a standalone setup — append to `setupShareExport`):

```javascript
  $('#btn-share-url').addEventListener('click', async () => {
    try {
      const data = getStateForSave();
      const code = await encodeShareString('c', data);
      const url = window.location.origin + window.location.pathname + '#mm3e=' + code;
      await navigator.clipboard.writeText(url);
      const btn = $('#btn-share-url');
      const original = btn.textContent;
      btn.textContent = 'URL Copied!';
      setTimeout(() => btn.textContent = original, 2000);
      if (url.length > 2000) {
        alert('Note: This URL is ' + url.length + ' characters long and may be truncated by some apps (Slack, Discord, etc.). Use "Share as Code" for reliable sharing.');
      }
    } catch (e) {
      alert('Could not copy URL to clipboard.');
    }
  });
```

- [ ] **Step 3: Add hash auto-import on startup in `js/app.js`**

Add a function `checkHashImport()` and call it at the end of `init()`, after the roster is loaded:

```javascript
// ========== HASH IMPORT ==========
async function checkHashImport() {
  const hash = window.location.hash;
  if (!hash.startsWith('#mm3e=')) return;
  const code = hash.slice(6); // remove '#mm3e='
  try {
    const { scope, data } = await decodeShareString(code);
    if (scope === 'c') {
      const name = data.name || 'Unnamed Character';
      if (!confirm(`Import character "${name}"?`)) {
        history.replaceState(null, '', window.location.pathname);
        return;
      }
      saveCurrentToRoster();
      const id = generateRosterId();
      roster.characters[id] = data;
      roster.activeId = id;
      loadStateFromData(data);
      renderCharacterBar();
      autoSaveRoster();
    } else {
      const count = Object.keys(data.characters || {}).length;
      if (!confirm(`Import roster with ${count} character(s)? This will replace your current roster.`)) {
        history.replaceState(null, '', window.location.pathname);
        return;
      }
      roster.characters = data.characters || {};
      roster.activeId = data.activeId || Object.keys(roster.characters)[0];
      nextRosterId = data.nextRosterId || Object.keys(roster.characters).length + 1;
      loadStateFromData(roster.characters[roster.activeId]);
      renderCharacterBar();
      autoSaveRoster();
    }
  } catch (e) {
    alert('Could not read the shared character from the URL. The link may be incomplete.');
  }
  history.replaceState(null, '', window.location.pathname);
}
```

In `init()`, after the roster load block, add:
```javascript
  checkHashImport();
```

- [ ] **Step 4: Test manually**

1. Click "Share as URL", verify clipboard has a URL with `#mm3e=...`
2. Paste the URL into the browser address bar, load. Verify the import confirmation appears.
3. Accept → character imported. Verify URL hash is cleared.
4. Decline → hash cleared, no import.
5. Truncate the hash and reload → verify error alert.

- [ ] **Step 5: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add Share as URL with hash auto-import on load"
```

---

### Task 5: Final Polish

**Files:**
- Modify: `js/app.js` (scope toggle active style)
- Modify: `css/styles.css` (active toggle style for scope buttons)

- [ ] **Step 1: Add active toggle style for scope buttons**

In `css/styles.css`, add:

```css
#share-scope-char.active,
#share-scope-roster.active {
  background: var(--accent);
  color: var(--bg-dark);
  border-color: var(--accent);
}
```

- [ ] **Step 2: End-to-end test**

1. Create a character with abilities, powers, skills.
2. "Share as Code" → copy → open import modal → paste → Import. Verify duplicate in roster.
3. "Share as URL" → copy URL → open in new tab → confirm import → verify character appears.
4. Toggle to "Full Roster" in export modal → copy code → open app in incognito → import code → confirm roster replacement → verify all characters present.
5. Paste garbage in import modal → verify "Invalid code" error.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css js/app.js
git commit -m "feat: polish share code UI with active scope toggle"
```

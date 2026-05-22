// Web Components for Chat Bingo.
//
// Four custom elements, all rendering into the light DOM so the global styles
// in styles.css (and Bootstrap) apply:
//   <bingo-app>    top-level state; swaps between the input form and the board
//   <bingo-input>  the "game code + entries" form; fires a `start` event
//   <bingo-chart>  the 5x5 board
//   <bingo-cell>   a single clickable square that toggles when tapped

// A single bingo square. Set its `text` property before inserting it.
class BingoCell extends HTMLElement {
  connectedCallback() {
    if (this._button) return; // already rendered

    this._clicked = false;
    this._button = document.createElement('button');
    this._button.textContent = this.text || '';
    this._button.style.backgroundColor = '#aaa';

    this._button.addEventListener('click', () => {
      this._clicked = !this._clicked;
      this._button.style.backgroundColor = this._clicked ? '#fae' : '#aaa';
    });

    this.appendChild(this._button);
  }
}

// The 5x5 board. Set `gameCode`, `entries`, and `cells` before inserting /
// calling render(). `entries` (the full list) is what gets shared; `cells`
// are the 25 squares derived from it.
class BingoChart extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const cells = this.cells || [];

    this.textContent = '';

    const heading = document.createElement('p');
    heading.textContent = ' Game Code: ' + (this.gameCode || '');
    this.appendChild(heading);

    for (let r = 0; r < 5; r++) {
      const row = document.createElement('div');
      row.className = 'row';

      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('bingo-cell');
        cell.text = cells[r * 5 + c] || '';
        row.appendChild(cell);
      }

      this.appendChild(row);
    }

    this.appendChild(this.buildShareControls());
  }

  buildShareControls() {
    const share = document.createElement('div');
    share.className = 'share';

    const button = document.createElement('button');
    button.className = 'share-btn';
    button.textContent = 'Copy share link';

    const status = document.createElement('span');
    status.className = 'share-status';

    const urlField = document.createElement('input');
    urlField.className = 'share-url';
    urlField.type = 'text';
    urlField.readOnly = true;
    urlField.hidden = true;

    button.addEventListener('click', async () => {
      const token = encodeBoard(this.gameCode || '', this.entries || []);
      const url = location.href.split('#')[0] + '#' + token;

      urlField.value = url;
      urlField.hidden = false;
      urlField.focus();
      urlField.select();

      try {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Link copied to clipboard';
      } catch (e) {
        // Clipboard API can be unavailable (e.g. opened via file://);
        // the link is shown below for manual copying.
        status.textContent = 'Copy the link below';
      }
    });

    share.append(button, status, urlField);
    return share;
  }
}

// The entry form. Fires a `start` CustomEvent with { gameCode, entries }.
// Entries are an editable list of one-input-per-entry rows: Enter adds the
// next row, the ✕ removes one, pasting multiple lines splits them into rows,
// and Go stays disabled until at least MIN_ENTRIES are filled in.
class BingoInput extends HTMLElement {
  connectedCallback() {
    this.MIN_ENTRIES = 25;

    this.innerHTML = `
      <div class="c_board">
        <div class="container-fluid">
          <p> Do you have a game code? </p>
          <p> Enter below </p>
        </div>

        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">Game Code</span>
          </div>
          <input type="text" class="input-group-lg" data-role="gamecode" />
        </div>

        <div class="entries-section">
          <div class="entries-header">
            <label>Bingo entries</label>
            <span class="entry-count" data-role="count"></span>
          </div>
          <div class="entry-list" data-role="list"></div>
          <button type="button" class="add-entry" data-role="add">+ Add entry</button>
          <p class="entry-help" data-role="help"></p>
        </div>

        <div class="container-fluid">
          <input type="button" value="Go" class="btn" data-role="go" />
        </div>
      </div>
    `;

    this.gameCodeInput = this.querySelector('[data-role="gamecode"]');
    this.list = this.querySelector('[data-role="list"]');
    this.countEl = this.querySelector('[data-role="count"]');
    this.helpEl = this.querySelector('[data-role="help"]');
    this.goButton = this.querySelector('[data-role="go"]');

    this.querySelector('[data-role="add"]').addEventListener('click', () => {
      this.addRow('').focus();
    });

    // Recount on every keystroke (input events bubble up from the rows).
    this.list.addEventListener('input', () => this.updateState());

    this.goButton.addEventListener('click', () => {
      const entries = this.collectEntries();
      if (entries.length < this.MIN_ENTRIES) return;
      this.dispatchEvent(
        new CustomEvent('start', {
          detail: { gameCode: this.gameCodeInput.value, entries: entries },
        })
      );
    });

    this.addRow('');
    this.updateState();
  }

  // Builds one entry row and inserts it after `afterRow` (or at the end).
  // Returns the row's <input> so callers can focus it.
  addRow(value, afterRow) {
    const row = document.createElement('div');
    row.className = 'entry-row';

    const num = document.createElement('span');
    num.className = 'entry-num';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'entry-input';
    input.value = value || '';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'entry-remove';
    remove.textContent = '✕';
    remove.title = 'Remove entry';

    remove.addEventListener('click', () => {
      row.remove();
      if (this.list.children.length === 0) this.addRow('');
      this.renumber();
      this.updateState();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addRow('', row).focus();
      } else if (
        e.key === 'Backspace' &&
        input.value === '' &&
        this.list.children.length > 1
      ) {
        e.preventDefault();
        const prev = row.previousElementSibling;
        row.remove();
        this.renumber();
        this.updateState();
        if (prev) {
          const prevInput = prev.querySelector('.entry-input');
          prevInput.focus();
          prevInput.setSelectionRange(
            prevInput.value.length,
            prevInput.value.length
          );
        }
      }
    });

    input.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (lines.length <= 1) return; // single line: let the default paste happen

      e.preventDefault();
      input.value = lines[0];
      let after = row;
      let last = input;
      for (let i = 1; i < lines.length; i++) {
        last = this.addRow(lines[i], after);
        after = last.closest('.entry-row');
      }
      this.updateState();
      last.focus();
    });

    row.append(num, input, remove);
    this.list.insertBefore(row, afterRow ? afterRow.nextSibling : null);
    this.renumber();
    return input;
  }

  renumber() {
    const rows = this.list.querySelectorAll('.entry-row');
    rows.forEach((row, i) => {
      row.querySelector('.entry-num').textContent = i + 1;
      row.querySelector('.entry-input').setAttribute('aria-label', 'Entry ' + (i + 1));
    });
  }

  collectEntries() {
    return Array.from(this.list.querySelectorAll('.entry-input'))
      .map((input) => input.value.trim())
      .filter((value) => value.length > 0);
  }

  updateState() {
    const count = this.collectEntries().length;
    const min = this.MIN_ENTRIES;

    this.countEl.textContent = count + ' / ' + min + (count >= min ? ' ✓' : '');
    this.countEl.classList.toggle('enough', count >= min);

    if (count >= min) {
      this.helpEl.textContent = 'Ready to play!';
      this.helpEl.classList.add('ready');
      this.goButton.disabled = false;
    } else {
      const remaining = min - count;
      this.helpEl.textContent =
        'Need ' + remaining + ' more ' + (remaining === 1 ? 'entry' : 'entries') +
        ' before you can play.';
      this.helpEl.classList.remove('ready');
      this.goButton.disabled = true;
    }
  }
}

// Top-level app: holds state and swaps the input form for the board on `start`.
class BingoApp extends HTMLElement {
  connectedCallback() {
    this.gameCode = '';
    this.bingoData = [];
    this.hasEntered = false;

    // If the URL carries a shared board, load straight into it.
    const shared = decodeBoard(location.hash.slice(1));
    if (shared) {
      this.gameCode = shared.gameCode;
      this.bingoData = shared.entries;
      this.hasEntered = true;
    }

    this.render();
  }

  render() {
    this.textContent = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'App';
    wrapper.innerHTML = '<h1> Chat Bingo </h1>';
    this.appendChild(wrapper);

    if (this.hasEntered) {
      const chart = document.createElement('bingo-chart');
      chart.gameCode = this.gameCode;
      chart.entries = this.bingoData;
      chart.cells = createBingoCells(this.gameCode, this.bingoData);
      wrapper.appendChild(chart);
    } else {
      const input = document.createElement('bingo-input');
      input.addEventListener('start', (e) => {
        this.gameCode = e.detail.gameCode;
        this.bingoData = e.detail.entries;
        this.hasEntered = true;
        this.render();
      });
      wrapper.appendChild(input);
    }
  }
}

customElements.define('bingo-cell', BingoCell);
customElements.define('bingo-chart', BingoChart);
customElements.define('bingo-input', BingoInput);
customElements.define('bingo-app', BingoApp);

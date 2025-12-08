function init() {
  const STORAGE_KEY = 'todo-v1';
  const listEl = document.getElementById('list');
  const form = document.getElementById('addForm');
  const newInput = document.getElementById('newInput');
  const countEl = document.getElementById('count');
  const filters = document.querySelectorAll('.filters button');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const importBtn = document.getElementById('importBtn');
  const emptyEl = document.getElementById('empty');
  const lastSaved = document.getElementById('last-saved');

  let tasks = [];
  let filter = 'all';

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    lastSaved.textContent = 'Saved';
    setTimeout(() => (lastSaved.textContent = ''), 1500);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function updateCount() {
    const active = tasks.filter((t) => !t.done).length;
    countEl.textContent = active + (active === 1 ? ' item' : ' items') + ' left';
  }

  function render() {
    listEl.innerHTML = '';
    const shown = tasks.filter((t) => {
      if (filter === 'all') return true;
      if (filter === 'active') return !t.done;
      return t.done;
    });

    emptyEl.hidden = shown.length !== 0;

    shown.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task';
      li.dataset.id = task.id;
      li.innerHTML = `
        <label class="checkbox" title="Mark complete">
          <input type="checkbox" ${task.done ? 'checked' : ''} aria-label="Mark task ${task.text} complete"/>
        </label>
        <div class="text ${task.done ? 'done' : ''}" contenteditable="true" role="textbox" aria-label="Task text">${escapeHtml(
          task.text)}</div>
        <div class="actions" aria-hidden="true">
          <button class="icon-btn edit" title="Edit (double-click or type)">&nbsp;&#9998;&nbsp;</button>
          <button class="icon-btn delete" title="Delete task" style="color:var(--danger)">&#128465;</button>
        </div>
      `;
      listEl.appendChild(li);
    });

    updateCount();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function addTask(text) {
    const t = { id: generateId(), text: text.trim(), done: false, created: Date.now() };
    if (!t.text) return;
    tasks.unshift(t);
    save();
    render();
  }

  function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
  }

  function toggleDone(id, done) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !!done;
    save();
    render();
  }

  function updateText(id, text) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.text = text.trim();
    save();
    render();
  }

  // Event handlers
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = newInput.value;
    if (v.trim() === '') return;
    addTask(v);
    newInput.value = '';
    newInput.focus();
  });

  listEl.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const li = e.target.closest('li');
      toggleDone(li.dataset.id, e.target.checked);
    }
  });

  // Delegated clicks for delete/edit
  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    if (e.target.closest('.delete')) {
      removeTask(id);
    } else if (e.target.closest('.edit')) {
      const txt = li.querySelector('.text');
      txt.focus();
      // place caret at end
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
    }
  });

  // Save edits when blur or Enter pressed; Esc cancels revert
  listEl.addEventListener('focusin', (e) => {
    if (e.target.classList && e.target.classList.contains('text')) {
      e.target.dataset.old = e.target.textContent;
    }
  });

  listEl.addEventListener('keydown', (e) => {
    if (e.target.classList && e.target.classList.contains('text')) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      } else if (e.key === 'Escape') {
        e.target.textContent = e.target.dataset.old || '';
        e.target.blur();
      }
    }
  });

  listEl.addEventListener(
    'blur',
    (e) => {
      if (e.target.classList && e.target.classList.contains('text')) {
        const li = e.target.closest('li');
        const id = li.dataset.id;
        const newText = e.target.textContent.trim();
        if (newText === '') {
          // if emptied, delete
          removeTask(id);
        } else {
          if (newText !== (e.target.dataset.old || '').trim()) {
            updateText(id, newText);
          } else {
            // restore sanitized rendering
            render();
          }
        }
      }
    },
    true
  );

  // Filters
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('active'));
      filters.forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      filter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
  });

  importBtn.addEventListener('click', () => {
    const samples = [
      'Plan weekly schedule',
      'Finish time-tracker README',
      'Buy groceries',
      'Walk the dog',
      'Call Alice'
    ];
    samples.reverse().forEach((s) =>
      tasks.unshift({ id: generateId(), text: s, done: false, created: Date.now() })
    );
    save();
    render();
  });

  // Accessibility: keyboard shortcut N to focus new input
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      newInput.focus();
    }
  });

  // Initialize
  load();
  render();

  // Keep saved timestamp updated every minute
  setInterval(() => (lastSaved.textContent = ''), 60000);
};

// Ensure the todo app initializes after the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
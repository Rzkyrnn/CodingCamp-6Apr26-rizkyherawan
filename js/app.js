// Storage module — thin localStorage wrapper
const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silently continue in-memory if storage unavailable
    }
  }
};

// Theme module — light/dark toggle
const Theme = {
  _current: 'light',
  init() {
    const saved = Storage.get('pd_theme');
    this.apply(saved === 'dark' ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },
  toggle() {
    this.apply(this._current === 'light' ? 'dark' : 'light');
    Storage.set('pd_theme', this._current);
  },
  apply(theme) {
    this._current = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }
};

// Greeting module — time/date display + custom name
const Greeting = {
  _name: '',
  init() {
    const saved = Storage.get('pd_name');
    this._name = typeof saved === 'string' ? saved : '';
    this.render(new Date());
    setInterval(() => this.render(new Date()), 60000);
    const input = document.getElementById('name-input');
    const btn = document.getElementById('name-save-btn');
    if (input && this._name) input.value = this._name;
    if (btn) btn.addEventListener('click', () => {
      if (input) this.saveName(input.value);
    });
    if (input) input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.saveName(input.value);
    });
  },
  render(date) {
    const timeEl = document.getElementById('greeting-time');
    const dateEl = document.getElementById('greeting-date');
    const msgEl = document.getElementById('greeting-message');
    if (timeEl) timeEl.textContent = this.formatTime(date);
    if (dateEl) dateEl.textContent = this.formatDate(date);
    if (msgEl) {
      const base = this.getGreeting(date.getHours());
      msgEl.textContent = this._name ? `${base}, ${this._name}` : base;
    }
  },
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good morning';
    if (hour >= 12 && hour <= 17) return 'Good afternoon';
    if (hour >= 18 && hour <= 21) return 'Good evening';
    return 'Good night';
  },
  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  },
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  },
  saveName(name) {
    this._name = (name || '').trim();
    Storage.set('pd_name', this._name);
    this.render(new Date());
  }
};

// FocusTimer module — configurable countdown state machine
const FocusTimer = {
  _duration: 25 * 60, // seconds
  _remaining: 25 * 60,
  _state: 'idle', // idle | running | paused
  _interval: null,
  init() {
    const saved = Storage.get('pd_timer_duration');
    const mins = typeof saved === 'number' && saved >= 1 && saved <= 99 ? saved : 25;
    this._duration = mins * 60;
    this._remaining = this._duration;
    this._render();
    const startBtn = document.getElementById('timer-start-btn');
    const stopBtn = document.getElementById('timer-stop-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const saveBtn = document.getElementById('timer-duration-save-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const input = document.getElementById('timer-duration-input');
      if (input) this.setDuration(Number(input.value));
    });
  },
  start() {
    if (this._state === 'running') return;
    this._state = 'running';
    this._interval = setInterval(() => this.tick(), 1000);
  },
  stop() {
    if (this._state !== 'running') return;
    clearInterval(this._interval);
    this._interval = null;
    this._state = 'paused';
  },
  reset() {
    clearInterval(this._interval);
    this._interval = null;
    this._state = 'idle';
    this._remaining = this._duration;
    this._render();
  },
  tick() {
    if (this._remaining <= 0) {
      this.stop();
      this._state = 'idle';
      return;
    }
    this._remaining -= 1;
    this._render();
    if (this._remaining === 0) {
      clearInterval(this._interval);
      this._interval = null;
      this._state = 'idle';
    }
  },
  setDuration(minutes) {
    const errorEl = document.getElementById('timer-duration-error');
    const mins = Math.floor(minutes);
    if (!Number.isFinite(mins) || mins < 1 || mins > 99) {
      if (errorEl) errorEl.textContent = 'Duration must be between 1 and 99 minutes.';
      return;
    }
    if (errorEl) errorEl.textContent = '';
    this._duration = mins * 60;
    Storage.set('pd_timer_duration', mins);
    this.reset();
    const input = document.getElementById('timer-duration-input');
    if (input) input.value = '';
  },
  formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },
  _render() {
    const el = document.getElementById('timer-display');
    if (el) el.textContent = this.formatTime(this._remaining);
  }
};

// TodoList module — task CRUD + persistence
const TodoList = {
  _tasks: [],
  save() { Storage.set('pd_tasks', this._tasks); },
  render() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '';
    this._tasks.forEach(task => list.appendChild(this._buildItem(task)));
  },
  _buildItem(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.completed) li.classList.add('completed');
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? '↩' : '✓';
    toggleBtn.addEventListener('click', () => this.toggle(task.id));
    const labelSpan = document.createElement('span');
    labelSpan.className = 'task-label';
    labelSpan.textContent = task.label;
    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', () => this._startEdit(task.id, li, labelSpan));
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => this.delete(task.id));
    li.append(toggleBtn, labelSpan, editBtn, deleteBtn);
    return li;
  },
  _startEdit(id, li, labelSpan) {
    const task = this._tasks.find(t => t.id === id);
    if (!task) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.label;
    li.replaceChild(input, labelSpan);
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✔';
    const editBtn = li.querySelector('button:nth-child(3)');
    if (editBtn) li.replaceChild(confirmBtn, editBtn);
    const confirm = () => this.edit(id, input.value);
    confirmBtn.addEventListener('click', confirm);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') this._rerenderItem(id); });
    input.focus();
  },
  _rerenderItem(id) {
    const task = this._tasks.find(t => t.id === id);
    if (!task) return;
    const list = document.getElementById('task-list');
    const existing = list && list.querySelector(`li[data-id="${id}"]`);
    if (existing) list.replaceChild(this._buildItem(task), existing);
  },
  add(label) {
    const errorEl = document.getElementById('task-error');
    const trimmed = (label || '').trim();
    if (!trimmed) { if (errorEl) errorEl.textContent = 'Task label cannot be empty.'; return; }
    if (errorEl) errorEl.textContent = '';
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + Math.random();
    this._tasks.push({ id, label: trimmed, completed: false });
    this.save();
    this.render();
    const input = document.getElementById('task-input');
    if (input) input.value = '';
  },
  toggle(id) {
    const task = this._tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this.save();
    this._rerenderItem(id);
  },
  delete(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.save();
    const list = document.getElementById('task-list');
    const el = list && list.querySelector(`li[data-id="${id}"]`);
    if (el) el.remove();
  },
  edit(id, label) {
    const trimmed = (label || '').trim();
    const task = this._tasks.find(t => t.id === id);
    if (!task) return;
    if (!trimmed) { this._rerenderItem(id); return; }
    task.label = trimmed;
    this.save();
    this._rerenderItem(id);
  },
  init() {
    const saved = Storage.get('pd_tasks');
    this._tasks = Array.isArray(saved) ? saved : [];
    this.render();
    const addBtn = document.getElementById('add-task-btn');
    const input = document.getElementById('task-input');
    if (addBtn) addBtn.addEventListener('click', () => this.add(input ? input.value : ''));
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') this.add(input.value); });
  }
};

// QuickLinks module — link CRUD + persistence
const QuickLinks = {
  _links: [],
  save() { Storage.set('pd_links', this._links); },
  render() {
    const container = document.getElementById('links-list');
    if (!container) return;
    container.innerHTML = '';
    this._links.forEach(link => {
      const wrapper = document.createElement('div');
      wrapper.dataset.id = link.id;
      const btn = document.createElement('button');
      btn.textContent = link.label;
      btn.addEventListener('click', () => window.open(link.url, '_blank', 'noopener'));
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => this.delete(link.id));
      wrapper.append(btn, delBtn);
      container.appendChild(wrapper);
    });
  },
  add(label, url) {
    const errorEl = document.getElementById('link-error');
    const trimLabel = (label || '').trim();
    const trimUrl = (url || '').trim();
    if (!trimLabel || !trimUrl) {
      if (errorEl) errorEl.textContent = 'Both label and URL are required.';
      return;
    }
    try { new URL(trimUrl); } catch {
      if (errorEl) errorEl.textContent = 'Please enter a valid URL.';
      return;
    }
    if (errorEl) errorEl.textContent = '';
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString() + Math.random();
    this._links.push({ id, label: trimLabel, url: trimUrl });
    this.save();
    this.render();
    const li = document.getElementById('link-label-input');
    const ui = document.getElementById('link-url-input');
    if (li) li.value = '';
    if (ui) ui.value = '';
  },
  delete(id) {
    this._links = this._links.filter(l => l.id !== id);
    this.save();
    const container = document.getElementById('links-list');
    const el = container && container.querySelector(`div[data-id="${id}"]`);
    if (el) el.remove();
  },
  init() {
    const saved = Storage.get('pd_links');
    this._links = Array.isArray(saved) ? saved : [];
    this.render();
    const addBtn = document.getElementById('add-link-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      const l = document.getElementById('link-label-input');
      const u = document.getElementById('link-url-input');
      this.add(l ? l.value : '', u ? u.value : '');
    });
  }
};

// Bootstrap — wire everything up after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  FocusTimer.init();
  TodoList.init();
  QuickLinks.init();
});

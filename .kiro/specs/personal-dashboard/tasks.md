# Implementation Plan: Personal Dashboard

## Overview

Implement a single-page personal dashboard using plain HTML, CSS, and Vanilla JavaScript. The app is structured as `index.html`, `css/style.css`, and `js/app.js` with no build step or backend. Each widget is a self-contained module inside `app.js`, sharing a thin `localStorage` persistence layer.

## Tasks

- [~] 1. Create project file structure and HTML skeleton
  - Create `index.html` with semantic sections for all four widgets (Greeting, Focus Timer, To-Do List, Quick Links)
  - Create empty `css/style.css` and `js/app.js` files linked from `index.html`
  - Include the add-task form, add-link form, and timer controls in the HTML
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [~] 2. Implement the Storage module
  - [~] 2.1 Write the `Storage` module in `app.js`
    - Implement `Storage.get(key)` with JSON parse and try/catch fallback returning `null`
    - Implement `Storage.set(key, value)` with JSON stringify and try/catch for quota/unavailable errors
    - _Requirements: 3.9, 3.10, 4.5, 4.6_

- [~] 3. Implement the Greeting widget
  - [~] 3.1 Write the `Greeting` module in `app.js`
    - Implement `Greeting.getGreeting(hour)` mapping hour 0–23 to the four greeting strings per requirements 1.3–1.6
    - Implement `Greeting.formatTime(date)` returning zero-padded `HH:MM`
    - Implement `Greeting.formatDate(date)` returning human-readable date string
    - Implement `Greeting.render(date)` updating the DOM time, date, and greeting elements
    - Implement `Greeting.init()` calling `render` immediately and scheduling `setInterval` every 60 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [~] 3.2 Write property test for greeting hour coverage (Property 1)
    - **Property 1: Greeting message covers all hours**
    - Generate integers 0–23 with fast-check, assert `getGreeting` returns one of the four valid strings and matches the correct range
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [~] 3.3 Write property test for time formatting (Property 2)
    - **Property 2: Time formatting round-trip**
    - Generate arbitrary `Date` objects, assert `formatTime` output matches `/^\d{2}:\d{2}$/`
    - **Validates: Requirements 1.1**

- [~] 4. Implement the Focus Timer widget
  - [~] 4.1 Write the `FocusTimer` module in `app.js`
    - Implement `FocusTimer.formatTime(totalSeconds)` returning zero-padded `MM:SS`
    - Implement state machine with states `idle`, `running`, `paused`
    - Implement `FocusTimer.tick()` decrementing seconds, stopping at 0 and transitioning to `idle`
    - Implement `FocusTimer.start()`, `FocusTimer.stop()`, `FocusTimer.reset()` with correct state transitions and interval management
    - Implement `FocusTimer.init()` rendering 25:00 and binding button click events
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [~] 4.2 Write property test for timer format correctness (Property 3)
    - **Property 3: Timer format correctness**
    - Generate integers 0–1500, assert `formatTime` output matches `/^\d{2}:\d{2}$/` and decodes back to the input value
    - **Validates: Requirements 2.7**

  - [~] 4.3 Write property test for timer countdown floor (Property 4)
    - **Property 4: Timer countdown never goes below zero**
    - Simulate sequences of `tick()` calls, assert displayed seconds never go negative and timer halts at zero
    - **Validates: Requirements 2.6**

- [~] 5. Implement the To-Do List widget
  - [x] 5.1 Write the `TodoList` module in `app.js`
    - Implement `TodoList.save()` writing the task array to `Storage` under key `"pd_tasks"`
    - Implement `TodoList.render()` rebuilding the task list DOM from in-memory state, applying strikethrough for completed tasks
    - Implement `TodoList.add(label)` — trim, validate non-empty, generate id, push to array, save, render; show inline error on empty
    - Implement `TodoList.toggle(id)` flipping `completed`, saving, and re-rendering the item
    - Implement `TodoList.delete(id)` removing the task, saving, and removing the DOM node
    - Implement `TodoList.edit(id, label)` — trim, validate non-empty, update label, save, re-render item; retain previous label on empty
    - Implement `TodoList.init()` loading from `Storage` (defaulting to `[]` on missing/invalid JSON) and calling `render()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 5.2 Write property test for task addition round-trip (Property 5)
    - **Property 5: Task addition round-trip**
    - Generate non-empty strings, call `add`, assert list length increases by 1 and `localStorage` contains the label
    - **Validates: Requirements 3.1, 3.9**

  - [x] 5.3 Write property test for empty label rejection (Property 6)
    - **Property 6: Empty task label rejection**
    - Generate whitespace-only strings, assert `add` is rejected and list is unchanged
    - **Validates: Requirements 3.2**

  - [x] 5.4 Write property test for task toggle involution (Property 7)
    - **Property 7: Task toggle is an involution**
    - Generate tasks, toggle twice, assert completion state is unchanged
    - **Validates: Requirements 3.6, 3.7**

  - [x] 5.5 Write property test for task edit identity preservation (Property 8)
    - **Property 8: Task edit preserves identity**
    - Generate tasks and non-empty labels, call `edit`, assert label updated and `id`/`completed` unchanged
    - **Validates: Requirements 3.4**

  - [x] 5.6 Write property test for localStorage persistence round-trip (Property 9)
    - **Property 9: localStorage persistence round-trip**
    - Generate task arrays, call `save()` then reload from storage, assert deep equality
    - **Validates: Requirements 3.9, 3.10**

- [ ] 6. Implement the Quick Links widget
  - [x] 6.1 Write the `QuickLinks` module in `app.js`
    - Implement `QuickLinks.save()` writing the link array to `Storage` under key `"pd_links"`
    - Implement `QuickLinks.render()` rebuilding the links DOM, rendering each link as a button opening the URL in a new tab
    - Implement `QuickLinks.add(label, url)` — trim both fields, validate non-empty, validate URL with `new URL()` try/catch, generate id, push, save, render; show inline error on invalid input
    - Implement `QuickLinks.delete(id)` removing the link, saving, and removing the DOM node
    - Implement `QuickLinks.init()` loading from `Storage` (defaulting to `[]`) and calling `render()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.2 Write property test for link addition round-trip (Property 10)
    - **Property 10: Link addition round-trip**
    - Generate non-empty labels and valid URLs, call `add`, assert list and `localStorage` contain the entry
    - **Validates: Requirements 4.1, 4.5**

  - [x] 6.3 Write property test for empty label or URL rejection (Property 11)
    - **Property 11: Empty label or URL rejection**
    - Generate submissions with empty label or empty URL, assert rejection and list unchanged
    - **Validates: Requirements 4.2**

- [x] 7. Checkpoint — wire all modules together
  - Add `DOMContentLoaded` listener in `app.js` that calls `Theme.init()`, `Greeting.init()`, `FocusTimer.init()`, `TodoList.init()`, `QuickLinks.init()` in order
  - Verify the page loads without console errors and all four widgets render
  - _Requirements: 5.1, 5.4_

- [ ] 8. Implement Light / Dark mode
  - [x] 8.1 Add the `Theme` module in `app.js`
    - Implement `Theme.apply(theme)` setting `data-theme` attribute on `<html>`
    - Implement `Theme.toggle()` switching between `"light"` and `"dark"`, persisting to Storage under `"pd_theme"`
    - Implement `Theme.init()` reading saved theme from Storage (defaulting to `"light"`), applying it, and binding the toggle button click event
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 8.2 Add dark-mode CSS overrides in `style.css`
    - Define CSS custom properties for colours on `:root` (light defaults)
    - Override custom properties under `[data-theme="dark"]` for the dark palette
    - Ensure all widgets, buttons, inputs, and text respect the active theme variables
    - _Requirements: 6.3_

- [ ] 9. Implement Custom name in greeting
  - [x] 9.1 Extend the `Greeting` module with name support
    - Add `Greeting.saveName(name)` — trim, persist to Storage under `"pd_name"`, re-render greeting
    - Update `Greeting.render(date)` to append the saved name to the greeting string when present
    - Update `Greeting.init()` to load the name from Storage before first render
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 1.11_
  - [x] 9.2 Add name input UI to the Greeting section in `index.html`
    - Add a text input and save button for the user to enter their name
    - _Requirements: 1.9_

- [ ] 10. Implement configurable Pomodoro duration
  - [x] 10.1 Extend the `FocusTimer` module with duration configuration
    - Add `FocusTimer.setDuration(minutes)` — validate range 1–99, persist to Storage under `"pd_timer_duration"`, reset display to new duration
    - Update `FocusTimer.init()` to load saved duration from Storage (defaulting to 25) before rendering
    - Update `FocusTimer.reset()` to restore to the configured duration rather than hardcoded 25:00
    - _Requirements: 2.8, 2.9, 2.10_
  - [x] 10.2 Add duration input UI to the Focus Timer section in `index.html`
    - Add a number input (min 1, max 99) and save button for the user to set their preferred duration
    - _Requirements: 2.8_

- [x] 11. Apply CSS layout and visual styling
  - Style the dashboard grid/flex layout so all four widgets are visible on a single page without navigation
  - Apply visual hierarchy so each widget is clearly distinct (borders, spacing, typography)
  - Style the timer display, task list items (including strikethrough for completed), and link buttons
  - Style inline validation error messages
  - Style the theme toggle button and name/duration input controls
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 12. Final checkpoint — verify all requirements
  - Confirm all four widgets render and function correctly in a modern browser without a build step or server
  - Confirm tasks, links, theme, name, and timer duration persist across simulated page reloads via `localStorage`
  - _Requirements: 5.4_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for a faster MVP
- Property tests reference the numbered properties in the design document for traceability
- No build step, test runner setup, or backend is required — the app runs directly from the file system or any static server

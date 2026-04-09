# Requirements Document

## Introduction

A personal dashboard web app built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend, using Local Storage for persistence. The dashboard provides four core widgets: a time/date greeting, a focus timer, a to-do list, and a quick links panel. Three enhancements are included: light/dark mode theming, a custom user name in the greeting, and a configurable Pomodoro timer duration.

## Glossary

- **Dashboard**: The single-page web application rendered in the browser.
- **Widget**: A self-contained UI section on the Dashboard (Greeting, Focus_Timer, Todo_List, Quick_Links).
- **Greeting**: The widget that displays the current time, date, a time-based greeting message, and the user's custom name.
- **Focus_Timer**: The widget that counts down from a user-configured duration to help the user focus.
- **Todo_List**: The widget that manages a list of user-defined tasks.
- **Task**: A single item in the Todo_List with a text label and a completion state.
- **Quick_Links**: The widget that displays user-defined shortcut buttons to external URLs.
- **Link**: A single entry in Quick_Links consisting of a label and a URL.
- **Local_Storage**: The browser's Local Storage API used to persist Tasks, Links, and user preferences client-side.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable releases.
- **Theme**: The active colour scheme of the Dashboard — either "light" or "dark".
- **Custom_Name**: A user-supplied name displayed in the Greeting widget.

---

## Requirements

### Requirement 1: Time, Date, and Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting (including my name) when I open the dashboard, so that I have an immediate sense of the time of day without checking elsewhere.

#### Acceptance Criteria

1. THE Greeting SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting SHALL display the current date in a human-readable format (e.g., "Monday, July 14 2025").
3. WHEN the current hour is between 05:00 and 11:59, THE Greeting SHALL display the message "Good morning".
4. WHEN the current hour is between 12:00 and 17:59, THE Greeting SHALL display the message "Good afternoon".
5. WHEN the current hour is between 18:00 and 21:59, THE Greeting SHALL display the message "Good evening".
6. WHEN the current hour is between 22:00 and 04:59, THE Greeting SHALL display the message "Good night".
7. WHEN a Custom_Name has been saved, THE Greeting SHALL append the name to the greeting message (e.g., "Good morning, Alex").
8. WHEN no Custom_Name has been saved, THE Greeting SHALL display the greeting message without a name.
9. THE Dashboard SHALL provide an input field for the user to enter or update their Custom_Name.
10. WHEN the user saves a Custom_Name, THE Dashboard SHALL persist it to Local_Storage and update the Greeting immediately.
11. WHEN the Dashboard loads, THE Greeting SHALL read the Custom_Name from Local_Storage and display it if present.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a configurable countdown timer with start, stop, and reset controls, so that I can time focused work sessions of my preferred length.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a default countdown duration of 25 minutes (25:00).
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second per second.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown at the current value.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed value to the configured duration.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display 00:00.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format.
8. THE Dashboard SHALL provide an input for the user to set a custom timer duration in whole minutes (minimum 1, maximum 99).
9. WHEN the user saves a custom duration, THE Focus_Timer SHALL update its configured duration, persist it to Local_Storage, and reset the display to the new duration.
10. WHEN the Dashboard loads, THE Focus_Timer SHALL read the saved duration from Local_Storage and initialise with that value, defaulting to 25 minutes if none is saved.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks that persist across browser sessions, so that I can track my work without losing it on page reload.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task label, THE Todo_List SHALL add a new Task with that label and a default completion state of incomplete.
2. IF the user submits an empty task label, THEN THE Todo_List SHALL reject the submission and display an inline validation message.
3. WHEN the user activates the edit control on a Task, THE Todo_List SHALL allow the user to modify the Task label inline.
4. WHEN the user confirms an edit with a non-empty label, THE Todo_List SHALL update the Task label and exit edit mode.
5. IF the user confirms an edit with an empty label, THEN THE Todo_List SHALL reject the update and retain the previous Task label.
6. WHEN the user activates the complete control on an incomplete Task, THE Todo_List SHALL mark the Task as complete and apply a visual distinction (e.g., strikethrough).
7. WHEN the user activates the complete control on a complete Task, THE Todo_List SHALL mark the Task as incomplete and remove the visual distinction.
8. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove that Task from the list.
9. WHEN any Task is added, edited, completed, or deleted, THE Todo_List SHALL write the updated Task collection to Local_Storage.
10. WHEN the Dashboard loads, THE Todo_List SHALL read the Task collection from Local_Storage and render all persisted Tasks.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and manage shortcut buttons to my favourite websites, so that I can open them quickly from the dashboard.

#### Acceptance Criteria

1. WHEN the user submits a non-empty label and a valid URL, THE Quick_Links SHALL add a new Link and render it as a clickable button.
2. IF the user submits an empty label or an empty URL, THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
3. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
4. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove that Link from the panel.
5. WHEN any Link is added or deleted, THE Quick_Links SHALL write the updated Link collection to Local_Storage.
6. WHEN the Dashboard loads, THE Quick_Links SHALL read the Link collection from Local_Storage and render all persisted Links.

---

### Requirement 5: Layout and Visual Design

**User Story:** As a user, I want a clean, readable dashboard layout that works across modern browsers, so that the app is pleasant and easy to use without any setup.

#### Acceptance Criteria

1. THE Dashboard SHALL render all four widgets (Greeting, Focus_Timer, Todo_List, Quick_Links) on a single page without requiring navigation.
2. THE Dashboard SHALL apply a single CSS file located at `css/style.css` for all visual styling.
3. THE Dashboard SHALL apply a single JavaScript file located at `js/app.js` for all interactive behaviour.
4. THE Dashboard SHALL be functional in Modern_Browser without requiring installation, a build step, or a backend server.
5. THE Dashboard SHALL present a clear visual hierarchy so that each widget is visually distinct from the others.

---

### Requirement 6: Light / Dark Mode

**User Story:** As a user, I want to toggle between a light and dark colour scheme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control to switch between light and dark Theme.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL switch to the opposite Theme immediately without a page reload.
3. WHEN the Theme changes, ALL widgets and page elements SHALL update their colours to reflect the active Theme.
4. WHEN the user saves a Theme preference, THE Dashboard SHALL persist it to Local_Storage.
5. WHEN the Dashboard loads, THE Dashboard SHALL read the saved Theme from Local_Storage and apply it before rendering, defaulting to light if none is saved.

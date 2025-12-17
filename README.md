**Project**

- **Name**: Productive Planner Pro
- **Description**: A lightweight browser-based task manager with deadlines, priorities, subtasks, drag-and-drop ordering, keyboard shortcuts, notifications, and persistent storage using localStorage.

**Files**

- **HTML**: [productivity-app/index.html](<index.html>)
- **CSS**: [productivity-app/style.css](<style.css>)
- **JS**: [productivity-app/script.js](<script.js>)
- **Assets**: [productivity-app/images](<images/icon.png>)


**Main Features**
- **ui design** : Applied basic CSS styling to enhance the visual appeal of the app, aligning it with the inspiration image and the provided live demo.  https://react-todo-app-1-xaq7.onrender.com
- **Add Task**: Enter text and optional deadline (`datetime-local`) and select priority (LOW / MEDIUM / HIGH). Click Add or press Enter.
- **Edit Task**: Edit name and deadline via a modal editor. Completed tasks cannot be edited until unchecked.
- **Delete Task**: Remove tasks with delete button (confirmation prompt).
- **Subtasks**: Add, complete, and delete subtasks for any task. Completing all subtasks marks the parent task completed.
- **Drag & Drop**: Reorder tasks by dragging list items; order is saved to localStorage.
- **Search**: Live search with the box at the top (shortcut: Ctrl+S to focus).
- **Filters**: Filter by All / Active / Completed / Missed (overdue) and by priority (LOW / MEDIUM / HIGH).
- **Select All / Bulk Actions**: A `select all` checkbox toggles completion on visible tasks.
- **Notifications**: Uses the browser Notification API to alert when a task is due within 15 minutes (permission required).
- **Overdue Detection**: Tasks with past deadlines (and not completed) are highlighted as overdue; the UI updates in real time.
- **Persistence**: All tasks (with subtasks, notes, priority, deadline, completed state) are stored in `localStorage` so they persist across sessions.
- **Initial Seed**: When no tasks exist, the app fetches a small sample set from `https://jsonplaceholder.typicode.com/todos?_limit=10` to demonstrate functionality.
- **Remaining Tasks Counter**: Displays the current count of active (not completed, not overdue) tasks.
- **source identity**: assign task source in local storage to identify if the task is whether came from API or user.

**Bonus & Extra Features**

- **Keyboard Navigation**: ArrowUp / ArrowDown to move selection, Space to toggle completion, Enter to add, Ctrl+A to jump to add field, Ctrl+S to focus search.
- **Drag visual cues**: Items show border during dragover to indicate insertion point.
- **Accessible interactions**: Focus handling attempts to maintain accessibility when navigating tasks.
- **Animated UI**: Small CSS animations for error/confirmation popups and checkbox transitions.

**How to Use**

- **Open**: Open https://todo-list.quadstack.pro.et in a modern browser.
- **Add**: Type a task, optionally choose deadline and priority, then click `Add` or press Enter.
- **Edit/Delete**: Use pencil icon to edit (cannot edit completed tasks) or trash icon to delete.
- **Subtasks**: Expand Details → add subtasks → check to mark subtask complete.
- **Reorder**: Drag a task up or down to reorder.
- **Notifications**: Allow notifications when prompted to receive reminders.

**Data & Storage**

- **Where stored**: Tasks are saved in the browser's `localStorage` under the key `tasks`.
- **Format**: Each task object includes `id`, `text`, `completed`, `deadline` (ISO string), `priority`, `subtasks` (array), `detailsExpanded`, `notified`, and `source`.
- **Backup**: To backup, copy the `localStorage` `tasks` value and store externally.

**Development Notes**

- **No build system**: This is plain HTML/CSS/JS — drop the folder on a static server or open the HTML directly.
- **Extending**: To add server sync, replace `localStorage` calls with API calls and manage authentication.
- **Browser APIs used**: `localStorage`, `Notification`, `Drag and Drop`.

**Credits**

- **Authors**: Created by KUE IT department group — list of group members is included in the app footer.
- **Assets**: Any icons loaded from external CDN (Font Awesome).

**Included Files**

- Images used by the app are in the `images` folder: [ip assignment to-do(2)/images](images>)



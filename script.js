// === Simple Productivity App ===

// DOM elements
const textInput = document.getElementById("taskText");
const deadlineInput = document.getElementById("taskDeadline");
const priority = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchBox = document.getElementById("searchBox");
const filter = document.getElementById("filter");
const editTask = document.querySelector('.edit-task');
const newName = document.querySelector('.newName');
const newDate = document.querySelector('.newDate');
const editBtn = document.querySelector('.editBtn');
const cancel = document.querySelector('.cancel');
const remains = document.querySelector(".remaining-tasks");
const selectDiv = document.querySelector('.select-box');
const selectAllBox = document.querySelector('.select-all');
const error = document.querySelector(".error");


document.addEventListener("DOMContentLoaded", () => {//make sure the content is loaded
  let id = 0;
  // this code save tasks into localStorage of our browser whenever it's called
  function saveTasks() {
    return localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /*Render  or draw tasks all tasks on the screen.
  it removes the previous tasks 
  before rendering the updated tasks to the screen333333333333333333
  not to display overlapped tasks after updation of time*/

  function renderTasks() {
    taskList.innerHTML = "";
    const visibleTasks = getVisibleTasks();
    const now = new Date();

    // create each task item
    visibleTasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = t.completed ? "completed" : "";
      if (t.deadline && new Date(t.deadline) < now && !t.completed) li.classList.add("overdue");
      if (selectedTaskId !== null && t.id === selectedTaskId) li.classList.add("selected");

      // make draggable and expose id on element
      li.draggable = true;
      li.dataset.id = t.id;

      li.innerHTML = `
      <div class="main-row" value='${t.id}'>
<label class="container">
   <input type="checkbox" ${t.completed ? "checked" : ""} data-index="${t.id}">
  <div class="checkmark"></div>
</label>

       
        <div class="title-container"><span class="task-title">${t.text}</span></div>
        ${t.deadline ? `<div class="deadline">Due: ${new Date(t.deadline).toLocaleString()}</div>` : ""}
      </div>
      <div class="priority-div">priority:<span  class="priority-level ${t.priority}" name="${t.priority}">${t.priority}</span></div>
      <div class="actions">
        <button class="edit" data-index="${t.id}"><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button class="delete" data-index="${t.id}"><i class="fa-trash fa" aria-hidden="true"></i></button>
      </div>

      <!-- Details (subordinate UI) -->
      <div class="task-details ${t.detailsExpanded ? 'expanded' : 'collapsed'}" data-index="${t.id}">
        <div class="details-header">
          <div class="details-label"></div>
          <div class="details-controls">
            <button class="details-toggle" data-index="${t.id}" aria-expanded="${t.detailsExpanded}">${t.detailsExpanded ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div class="details-body">
          <div class="subtasks">
            <div class="subtasks-label">Subtasks</div>
            <ul class="subtask-list">
              ${t.subtasks && t.subtasks.length ? t.subtasks.map((s, i) => `<li><input type="checkbox" class="subtask-checkbox" data-index="${t.id}" data-subindex="${i}" ${s.completed ? 'checked' : ''}> <span class="subtask-text ${s.completed ? 'completed' : ''}">${(s.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span> <button class="subtask-delete" data-index="${t.id}" data-subindex="${i}"><i class="fa fa-trash" aria-hidden="true"></i></button></li>`).join('') : '<li class="no-subtasks">no subtasks</li>'}
            </ul>
            <div class="add-subtask">
              <input class="subtask-input" data-index="${t.id}" placeholder="Add new subtask" />
              <button class="subtask-add" data-index="${t.id}">Add</button>
            </div>
          </div>
        </div>
      </div>
    `;
 // Drag handlers
      li.addEventListener('dragstart', (ev) => {
        draggedTaskId = t.id;
        li.classList.add('dragging');
        try { ev.dataTransfer.effectAllowed = 'move'; } catch (e) { }
      });
      li.addEventListener('dragend', () => {
        draggedTaskId = null;
        li.classList.remove('dragging');
        // clear any inline borders left on re-render
        li.style.borderTop = li.style.borderBottom = '';
      });

      li.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        try { ev.dataTransfer.dropEffect = 'move'; } catch (e) { }
        const rect = li.getBoundingClientRect();
        const after = ev.clientY > rect.top + rect.height / 2;
        li.style.borderTop = after ? '' : '2px solid #007bff';
        li.style.borderBottom = after ? '2px solid #007bff' : '';
      });

      li.addEventListener('dragleave', () => {
        li.style.borderTop = li.style.borderBottom = '';
      });

      li.addEventListener('drop', (ev) => {
        ev.preventDefault();
        li.style.borderTop = li.style.borderBottom = '';
        if (draggedTaskId === null) return;
        const draggedId = draggedTaskId;
        const targetId = t.id;
        if (draggedId === targetId) return;

        const draggedIdx = tasks.findIndex(x => x.id == draggedId);
        if (draggedIdx === -1) return;

        // determine drop position (before/after)
        const rect = li.getBoundingClientRect();
        const after = ev.clientY > rect.top + rect.height / 2;

        // remove dragged item
        const [draggedTask] = tasks.splice(draggedIdx, 1);

        // find current index of target (may have shifted after removal)
        const newTargetIdx = tasks.findIndex(x => x.id == targetId);
        const insertIndex = Math.max(0, newTargetIdx + (after ? 1 : 0));

        tasks.splice(insertIndex, 0, draggedTask);

        saveTasks();
        renderTasks();
      });

      taskList.appendChild(li);
    });

  // update remaining active tasks (unchecked and not overdue)
    try {
      const now2 = new Date();
      const activeCount = tasks.filter(t => !t.completed && !(t.deadline && new Date(t.deadline) < now2)).length;
      if (remains) remains.textContent = activeCount;
    } catch (e) {
      // ignore
    }
  };

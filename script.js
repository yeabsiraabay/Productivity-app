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
/* taks variable retreive tasks form local storage in the
  form of strings and convert it into array of objects to display*/

  let tasks = []; //created empty array
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];//trying to load tasks from local strorage
  // ensure older saved tasks get new default fields ( subtasks, detailsExpanded)
  tasks.forEach(t => {
    if (!Array.isArray(t.subtasks)) t.subtasks = [];
    if (typeof t.detailsExpanded === 'undefined') t.detailsExpanded = false;
    if (typeof t.priority === 'undefined') t.priority = 'MEDIUM';
  });

  // return currently visible tasks (used by render and keyboard navigation)
  function getVisibleTasks() {
    const now = new Date();
    return tasks.filter(t => {
      const matchSearch = t.text.toLowerCase().includes(searchBox.value.toLowerCase());
      const overdue = t.deadline && new Date(t.deadline) < now && !t.completed;
      if (filter.value === "active" && t.completed) return false;
      if (filter.value === "completed" && !t.completed) return false;
      if (filter.value === "overdue" && !overdue) return false;
      if (filter.value === 'LOW' || filter.value === "MEDIUM" || filter.value == "HIGH") {
        const pf = filter.value.toLowerCase();
        if (pf !== 'all' && pf !== '') {
          const tp = (t.priority || 'MEDIUM').toLowerCase();
          if (tp !== pf) return false;
        }
      }
      return matchSearch;
    });
  };


   // --- FETCH initial tasks if tasks empty ---
  if (tasks.length === 0) {
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=10")
      .then(res => res.json())
      .then(data => {
        tasks = data.map(d => ({ id: ++id, text: d.title, completed: d.completed, deadline: null, notified: false, source: 'API', priority: "MEDIUM" }));
        saveTasks();
        renderTasks();

      })
      .catch(err => console.error("Failed to fetch initial tasks", err));
  };



  // Add new task
  addBtn.onclick = () => {
    const text = textInput.value.trim();
    if (!text) {
      error.textContent = "To add to the list, enter a task first!";
      error.style.background = 'red';
      error.style.display = 'inline-block';
      return setTimeout(() => { error.style.display = 'none' }, 3000);
    };
    const priorityLevel = priority.value;
    let deadline = deadlineInput.value;
    let validDate;
    if (deadline) {

      const isDateValid = new Date(deadline) > new Date();
      if (!isDateValid) {//check if the data  in past
        error.textContent = "invalid date!";
        error.style.background = 'red';
        error.style.display = 'inline-block';
        return setTimeout(() => { error.style.display = 'none' }, 3000);;
      }
      validDate = new Date(deadline).toISOString();//changes deadline into a format suitable for localstorage(to string)  
    }
    else {
      deadline = null;
    }
    lastId = tasks[tasks.length - 1] ? tasks[tasks.length - 1].id : 0;//get the end of the list id 

    /* push the task with its time and date to the tasklist. 
    it is initially incompleted and not notified */
    tasks.push({ id: ++lastId, text, completed: false, deadline: validDate, notified: false, source: 'USER', priority: priorityLevel, subtasks: [], detailsExpanded: false });//added the source of the task

    /* clear the feilds of add task and deadline picking after one task pushed */
    textInput.value = "";
    deadlineInput.value = "";
    /* save the added task to the local storage and render it on the 
    screen */
    saveTasks();
    renderTasks();
    error.textContent = "New task is Added";
    error.style.background = 'green';
    error.style.display = 'inline-block';
    return setTimeout(() => { error.style.display = 'none' }, 3000);
  };
 // Toggle complete / edit / delete

  taskList.onclick = (e) => {
    const target = e.target;

    // allow direct interaction with inputs (typing) without triggering click handlers that re-render
    if (target.classList && (target.classList.contains('subtask-input') )) return;
    // also allow normal text/datetime inputs to be focused without interference
    if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'datetime-local')) return;

    const dataIndex = target.dataset.index;
    // if no data-index, ignore clicks that are not on controls
    if (typeof dataIndex === 'undefined') return;

    // find the task by its id (dataset.index stores task.id in render)
    const taskIdx = tasks.findIndex(t => t.id == dataIndex);
    if (taskIdx === -1) return;

    // checkbox toggle

    // checkbox toggle
    // checkbox toggle for main task only (ignore subtask checkboxes here)
    if (e.target.type === "checkbox" && !e.target.classList.contains('subtask-checkbox')) {
      tasks[taskIdx].completed = e.target.checked;
      selectDiv.style.display = tasks.some(t => t.completed) ? 'flex' : 'none';
    }

    // delete
    if (e.target.classList.contains("delete")) {
      if (confirm("Delete this task?")) {
        tasks.splice(taskIdx, 1);
        saveTasks();
        renderTasks()
        error.textContent = "task deleted";
        error.style.background = 'green';
        error.style.display = 'inline-block';
        return setTimeout(() => { error.style.display = 'none' }, 3000);
      }
    }

    // open edit dialog: set currentEditIndex and populate fields
    if (e.target.classList.contains("edit")) {
      if (tasks[taskIdx].completed) {
        error.textContent = "can not edit completed task. please uncheck to edit!";
        error.style.background = 'red';
        error.style.display = 'inline-block';
        return setTimeout(() => { error.style.display = 'none' }, 3000);
      }
      currentEditIndex = taskIdx;
      newName.value = tasks[taskIdx].text || "";
      // try to convert stored ISO to input-friendly format (for input type datetime-local)
      newDate.value = tasks[taskIdx].deadline ? new Date(tasks[taskIdx].deadline).toISOString().slice(0, 16) : "";
      editTask.style.display = 'flex';
    }

    // Details toggle
    if (e.target.classList.contains('details-toggle')) {
      const idx = tasks.findIndex(t => t.id == dataIndex);
      if (idx !== -1) {
        tasks[idx].detailsExpanded = !tasks[idx].detailsExpanded;
        saveTasks();
        renderTasks();
      }
    }
// add subtask
    if (e.target.classList.contains('subtask-add')) {
      const idx = tasks.findIndex(t => t.id == dataIndex);
      if (idx === -1) return;
      const li = e.target.closest('li');
      const input = li.querySelector('.subtask-input');
      const txt = input && input.value.trim();
      if (!txt) return;
      tasks[idx].subtasks = tasks[idx].subtasks || [];
      tasks[idx].subtasks.push({ text: txt, completed: false });
      // persist and re-render, then restore focus to the subtask input for quick entry
      saveTasks();
      renderTasks();
      // focus the (new) input for this task after re-render
      const newInput = document.querySelector(`.subtask-input[data-index="${dataIndex}"]`);
      if (newInput) newInput.focus();
      error.textContent = "New Subtask is Added";
      error.style.background = 'green';
      error.style.display = 'inline-block';
      return setTimeout(() => { error.style.display = 'none' }, 3000);
    }

    // subtask checkbox toggle
    if (e.target.classList.contains('subtask-checkbox')) {
      const idx = tasks.findIndex(t => t.id == dataIndex);
      const si = parseInt(e.target.dataset.subindex, 10);
      if (idx === -1 || isNaN(si)) return;
      tasks[idx].subtasks[si].completed = e.target.checked;
      // set main task completed only if all subtasks are completed
      const allDone = tasks[idx].subtasks.length > 0 && tasks[idx].subtasks.every(s => s.completed);
      if (allDone) tasks[idx].completed = true;
      else tasks[idx].completed = false;
      selectDiv.style.display = tasks.some(t => t.completed) ? 'flex' : 'none';
      saveTasks();
      renderTasks();
    }

    // subtask delete
    if (e.target.classList.contains('subtask-delete')) {
      const idx = tasks.findIndex(t => t.id == dataIndex);
      const si = parseInt(e.target.dataset.subindex, 10);
      if (idx === -1 || isNaN(si)) return;
      tasks[idx].subtasks.splice(si, 1);
      saveTasks();
      renderTasks();
      error.textContent = "subtask deleted";
      error.style.background = 'green';
      error.style.display = 'inline-block';
      return setTimeout(() => { error.style.display = 'none' }, 3000);
    }

    saveTasks();
    renderTasks();

  };

  // single edit button handler (added once)
  editBtn.addEventListener('click', () => {
    if (currentEditIndex === null) return;
    const newText = newName.value.trim();
    if (!newText) {
      error.textContent = "To add to the list, enter a task first!";
      error.style.background = 'red';
      error.style.display = 'inline-block';
      return setTimeout(() => { error.style.display = 'none' }, 3000);;
    };

    tasks[currentEditIndex].text = newText;

    const newDeadline = newDate.value;
    if (newDeadline && newDeadline.trim() !== "") {
      const parsed = new Date(newDeadline);
      if (!isNaN(parsed) && parsed > new Date()) {
        tasks[currentEditIndex].deadline = parsed.toISOString();
      } else {
        error.textContent = "invalid date!";
        error.style.background = 'red';
        error.style.display = 'inline-block';
        return setTimeout(() => { error.style.display = 'none' }, 3000);;
      }
    }

    saveTasks();
    renderTasks();

    // clear and close editor
    newName.value = '';
    newDate.value = '';
    editTask.style.display = 'none';
    currentEditIndex = null;
    error.textContent = "Task edited successfully";
    error.style.background = 'green';
    error.style.display = 'inline-block';
    return setTimeout(() => { error.style.display = 'none' }, 3000);
  });

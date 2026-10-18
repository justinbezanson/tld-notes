## Implementation

### TICKET-001: Create Task Model and Migration
**Description:** Create the Task model and database migration as specified in the data model.

**Acceptance Criteria:**
- Migration creates tasks table with id, status (boolean), description (varchar(255)), run_id (int, foreign key), and timestamps
- Task model exists with proper fillable/relationships
- Foreign key constraint to runs table exists
- Migration runs successfully

**Implementation Steps:**
1. Create migration: `php artisan make:migration create_tasks_table`
2. Add fields: status (boolean, default false), description (string), run_id (unsignedBigInteger with foreign), timestamps
3. Add foreign key constraint run_id references id on runs table, onDelete cascade
4. Create model: `php artisan make:model Task`
5. Define fillable fields in model (status, description, run_id)
6. Define relationship to Run model (Task belongsTo Run)
7. Run migration: `php artisan migrate`

---

### TICKET-002: Add Task Routes and Controller (Backend)
**Description:** Create routes and controller actions for managing tasks scoped to runs using Inertia.

**Acceptance Criteria:**
- Routes defined for tasks under runs (following existing web route patterns)
- TaskController exists with methods to index/store/update/destroy as appropriate
- Tasks are returned to Inertia components with proper data
- Validation: description cannot be empty
- Proper authorization (user owns run - following existing patterns)

**Implementation Steps:**
1. Create TaskController: `php artisan make:controller TaskController --resource` (or nested under Runs/TaskController)
2. Add web routes in routes/web.php or routes/settings.php consistent with app patterns - likely under runs/{run}/tasks
3. Implement controller methods - query tasks by run_id, order by status asc (incomplete first), then created_at asc
4. Implement store method - validate request (description required, string, max 255), create task with run_id
5. Implement update method - validate, update status or description
6. Implement destroy method - delete task
7. Add authorization/policy if needed (ensure user can only access their own run's tasks)
8. Write feature tests for endpoints

---

### TICKET-003: Update GoalsPanel Component (Frontend Structure)
**Description:** Replace the placeholder in GoalsPanel.vue with full task management UI.

**Acceptance Criteria:**
- Component displays "Add Task" button at top
- Lists tasks for current run
- Shows empty state when no tasks: "There are no tasks to display"
- Tasks display checkbox, description, edit button
- Completed tasks show strikethrough
- Add Task button disabled when in add/edit mode
- Component handles Esc key to cancel

**Implementation Steps:**
1. Read current run context (from props or Inertia/shared data)
2. Define task interface/type (id, status, description, run_id, created_at)
3. Implement state: tasks array, adding flag, editingTaskId, editForm, newTaskForm
4. Load tasks from Inertia props (or fetch via router if needed)
5. Build UI structure: header with Add Task button, task list, empty state
6. Implement helper methods for display logic (sorting, strikethrough)
7. Add event handlers for checkbox toggle, edit, save, delete, cancel using Inertia router
8. Implement Esc key listener (add/remove on mount/unmount)

---

### TICKET-004: Implement Add Task Flow
**Description:** Implement adding a new task with inline edit mode.

**Acceptance Criteria:**
- Clicking Add Task creates unsaved task in list with empty description, unchecked, in edit mode
- Input gets immediate focus
- Save button saves to database, returns to display mode
- Delete button removes from UI (unsaved, so no DB call)
- Cannot save with empty description (validation)
- Add Task button disabled while adding

**Implementation Steps:**
1. Implement addTask() - push new task object to list with temp id, status false, editing true
2. Set focus on input after render (use nextTick/ref)
3. Implement saveNewTask(task) - POST via Inertia router, on success update local state, exit edit mode
4. Implement cancelAdd(task) - remove from list if unsaved (no id or temp)
5. Validate before save - if description empty, prevent save/show validation
6. Disable Add Task button when adding/editing

---

### TICKET-005: Implement Edit Task Flow
**Description:** Implement editing existing tasks with inline form.

**Acceptance Criteria:**
- Clicking Edit button shows input, hides Edit button, shows Save and Delete
- Checkbox disabled in edit mode
- Save button saves changes and returns to display mode
- Delete button deletes from DB and removes from UI
- Esc cancels edit with no changes
- Cannot save with empty description

**Implementation Steps:**
1. Implement startEdit(task) - set editingTaskId, store original values in case of cancel
2. Implement saveEdit(task) - PUT/PATCH via Inertia router with description, on success update task, exit edit mode
3. Implement cancelEdit(task) - revert to original values, exit edit mode
4. Implement deleteTask(task) - DELETE via Inertia router, on success remove from list
5. Disable checkbox when editing (v-if or disabled attribute)
6. Hide Edit button when editing, show Save/Delete

---

### TICKET-006: Implement Toggle Task Completion
**Description:** Implement immediate save when toggling checkbox.

**Acceptance Criteria:**
- Checkbox enabled only when not editing
- Toggling checkbox immediately saves to database (PATCH)
- Assume success, update UI optimistically (reorder list after change)
- On error, revert checkbox state
- Completed tasks get strikethrough styling
- Sorting updates after completion change (incomplete at top, completed bottom, then by created_at)

**Implementation Steps:**
1. Implement toggleComplete(task) - don't allow if editing
2. Optimistically update task.status and task order
3. Call Inertia router.patch to update status with {status: newValue}
4. On success, keep changes (already optimistic)
5. On error, revert status and resort list; show error message if appropriate
6. Apply strikethrough class when task.status is true
7. Resort tasks array after status change

---

### TICKET-007: Add Keyboard Support and Polish
**Description:** Add Esc key handling and final UX polish.

**Acceptance Criteria:**
- Esc key cancels add or edit in progress
- Focus management works correctly
- Save button disabled when description is empty
- Only one add/edit can be active at a time (enforced by disabled Add Task button)
- Sorting works correctly in all cases

**Implementation Steps:**
1. Add global keydown listener in component (mounted/unmounted)
2. Handle Esc: if adding new unsaved task, cancel add; if editing existing, cancel edit
3. Ensure focus moves to input on add/edit
4. Disable Save buttons when input is empty/whitespace
5. Add loading states if desired (optional but good practice)
6. Test edge cases

---

### TICKET-008: Write Tests
**Description:** Add comprehensive tests for tasks feature.

**Acceptance Criteria:**
- Backend feature tests cover all API endpoints (CRUD operations)
- Validation tests (empty description)
- Authorization tests (user can only access own run's tasks)
- Frontend component tests for GoalsPanel
- All tests pass

**Implementation Steps:**
1. Create TaskFactory: `php artisan make:factory TaskFactory`
2. Create TaskPolicy if needed: `php artisan make:policy TaskPolicy`
3. Write TaskController feature tests (Inertia-based)
4. Write GoalsPanel Vue component tests (vitest)
5. Test sorting behavior
6. Test toggle completion
7. Test add/edit/cancel flows
8. Run all tests and ensure passing

---

### TICKET-009: Final Integration and QA
**Description:** Integrate all pieces and do end-to-end verification.

**Acceptance Criteria:**
- Goals & Tasks tab shows tasks correctly
- All user stories from spec work as described
- No console errors
- Existing functionality not broken
- Code follows project conventions

**Implementation Steps:**
1. Verify GoalsPanel renders in correct context (run page)
2. Test full workflow: add, edit, complete, delete
3. Test empty state
4. Test Esc key behavior
5. Test sorting after multiple operations
6. Run linting/type checking if configured
7. Review code against project rules (.ai/rules)
8. Manual QA of all acceptance criteria

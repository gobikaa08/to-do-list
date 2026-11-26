import './TaskCards.css';

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

const PRIORITY_CLASS_MAP = {
  low: 'task-badge--priority-low',
  medium: 'task-badge--priority-medium',
  high: 'task-badge--priority-high',
};

const STATUS_CLASS_MAP = {
  pending: 'task-badge--status-pending',
  'in progress': 'task-badge--status-in-progress',
  completed: 'task-badge--status-completed',
};

function parseLocalDueDate(dueDateValue) {
  if (dueDateValue === null || dueDateValue === undefined || dueDateValue === '') {
    return null;
  }

  if (dueDateValue instanceof Date) {
    if (Number.isNaN(dueDateValue.getTime())) {
      return null;
    }
    return new Date(
      dueDateValue.getFullYear(),
      dueDateValue.getMonth(),
      dueDateValue.getDate()
    );
  }

  if (typeof dueDateValue !== 'string') {
    return null;
  }

  const trimmed = dueDateValue.trim();
  if (!trimmed) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const localDate = new Date(year, month - 1, day);

    if (
      localDate.getFullYear() !== year ||
      localDate.getMonth() !== month - 1 ||
      localDate.getDate() !== day
    ) {
      return null;
    }

    return localDate;
  }

  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );
}

function formatDueDate(dueDateValue, parsedDate) {
  if (dueDateValue === null || dueDateValue === undefined || String(dueDateValue).trim() === '') {
    return 'No due date';
  }

  if (!parsedDate) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function isTaskOverdue(parsedDueDate, status) {
  if (!parsedDueDate) {
    return false;
  }

  if (typeof status === 'string' && status.trim().toLowerCase() === 'completed') {
    return false;
  }

  const now = new Date();
  const todayLocalStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parsedDueDate < todayLocalStart;
}

function getNormalizedLabel(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function TaskCards({ tasks = [], onStatusChange, onDelete }) {
  const taskList = Array.isArray(tasks) ? tasks.filter(Boolean) : [];

  if (taskList.length === 0) {
    return (
      <section className="task-cards-section" aria-label="Task list">
        <div className="task-cards-empty" role="status" aria-live="polite">
          <div className="task-cards-empty__icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="17" rx="3" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
              <path d="M9 2v4" />
              <path d="M15 2v4" />
            </svg>
          </div>
          <h2 className="task-cards-empty__heading">No tasks yet</h2>
          <p className="task-cards-empty__text">
            Your tasks will appear here once they are added.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="task-cards-section" aria-label="Task list">
      <div className="task-cards-grid">
        {taskList.map((task, index) => {
          const taskKey = task.id ?? `task-${index}`;
          const title = getNormalizedLabel(task.title, 'Untitled task');
          const description =
            typeof task.description === 'string' ? task.description.trim() : '';
          const priority = getNormalizedLabel(task.priority, 'Medium');
          const status = getNormalizedLabel(task.status, 'Pending');
          const parsedDueDate = parseLocalDueDate(task.dueDate);
          const formattedDueDate = formatDueDate(task.dueDate, parsedDueDate);
          const overdue = isTaskOverdue(parsedDueDate, status);

          const priorityClass =
            PRIORITY_CLASS_MAP[priority.toLowerCase()] || 'task-badge--priority-neutral';
          const statusClass =
            STATUS_CLASS_MAP[status.toLowerCase()] || 'task-badge--status-pending';

          const selectId = `task-status-${String(taskKey).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
          const selectValue = TASK_STATUSES.includes(status) ? status : 'Pending';
          const isCompleted = status.toLowerCase() === 'completed';

          const handleStatusSelectChange = (event) => {
            if (typeof onStatusChange === 'function') {
              onStatusChange(task.id, event.target.value);
            }
          };

          const handleDeleteClick = () => {
            if (typeof onDelete === 'function') {
              onDelete(task.id);
            }
          };

          return (
            <article
              key={taskKey}
              className={[
                'task-card',
                overdue ? 'task-card--overdue' : '',
                isCompleted ? 'task-card--completed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Task: ${title}`}
            >
              <header className="task-card__header">
                <div className="task-card__badges">
                  <span className={`task-badge ${priorityClass}`}>
                    {priority} Priority
                  </span>
                  <span className={`task-badge ${statusClass}`}>
                    <span className="task-badge__dot" aria-hidden="true" />
                    {status}
                  </span>
                  {overdue && (
                    <span className="task-badge task-badge--overdue" role="status">
                      Overdue
                    </span>
                  )}
                </div>

                <h3 className="task-card__title">{title}</h3>
              </header>

              <div className="task-card__body">
                {description ? (
                  <p className="task-card__description">{description}</p>
                ) : (
                  <p className="task-card__description task-card__description--empty">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="task-card__meta">
                <div className="task-card__due-date">
                  <span className="task-card__meta-label">Due date</span>
                  {parsedDueDate && typeof task.dueDate === 'string' ? (
                    <time
                      className={`task-card__meta-value ${
                        overdue ? 'task-card__meta-value--overdue' : ''
                      }`}
                      dateTime={task.dueDate.trim()}
                    >
                      {formattedDueDate}
                    </time>
                  ) : (
                    <span
                      className={`task-card__meta-value ${
                        !parsedDueDate && task.dueDate
                          ? 'task-card__meta-value--muted'
                          : ''
                      }`}
                    >
                      {formattedDueDate}
                    </span>
                  )}
                </div>
              </div>

              <footer className="task-card__footer">
                <div className="task-card__status-control">
                  <label className="task-card__control-label" htmlFor={selectId}>
                    Status
                  </label>
                  <select
                    id={selectId}
                    className="task-card__select"
                    value={selectValue}
                    onChange={handleStatusSelectChange}
                    aria-label={`Update status for ${title}`}
                  >
                    {TASK_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="task-card__delete-btn"
                  onClick={handleDeleteClick}
                  aria-label={`Delete ${title}`}
                >
                  Delete
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TaskCards;

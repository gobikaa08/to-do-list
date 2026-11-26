import { useId, useState } from 'react';
import './TaskForm.css';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const DEFAULT_PRIORITY = 'Medium';

const INITIAL_VALUES = {
  title: '',
  description: '',
  dueDate: '',
  priority: DEFAULT_PRIORITY,
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidCalendarDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function generateTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function validateForm(values, todayDate) {
  const errors = {};
  const trimmedTitle = values.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Please enter a task title.';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Please choose a due date.';
  } else if (!isValidCalendarDate(values.dueDate)) {
    errors.dueDate = 'Please enter a valid due date.';
  } else if (values.dueDate < todayDate) {
    errors.dueDate = 'Due date cannot be in the past.';
  }

  if (!PRIORITY_OPTIONS.includes(values.priority)) {
    errors.priority = 'Please select a valid priority level.';
  }

  return errors;
}

export function TaskForm({ onAddTask }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});

  const formId = useId();
  const headingId = `${formId}-heading`;
  const titleId = `${formId}-title`;
  const titleErrorId = `${formId}-title-error`;
  const descriptionId = `${formId}-description`;
  const dueDateId = `${formId}-due-date`;
  const dueDateErrorId = `${formId}-due-date-error`;
  const priorityId = `${formId}-priority`;
  const priorityErrorId = `${formId}-priority-error`;

  const todayDate = getTodayDateString();

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleReset() {
    setValues(INITIAL_VALUES);
    setErrors({});
  }

  function handleSubmit(event) {
    event.preventDefault();

    const currentToday = getTodayDateString();
    const validationErrors = validateForm(values, currentToday);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newTask = {
      id: generateTaskId(),
      title: values.title.trim(),
      description: values.description.trim(),
      dueDate: values.dueDate,
      priority: values.priority,
      status: 'Pending',
    };

    if (typeof onAddTask === 'function') {
      onAddTask(newTask);
    }

    handleReset();
  }

  return (
    <section className="task-form-card" aria-labelledby={headingId}>
      <header className="task-form-card__header">
        <h2 id={headingId} className="task-form-card__title">
          Create New Task
        </h2>
        <p className="task-form-card__subtitle">
          Add task details, set a due date, and choose a priority level.
        </p>
      </header>

      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <div className="task-form__field">
          <label htmlFor={titleId} className="task-form__label">
            Task Title
            <span className="task-form__required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={titleId}
            name="title"
            type="text"
            className={`task-form__input${errors.title ? ' task-form__control--error' : ''}`}
            placeholder="e.g., Complete website design"
            value={values.title}
            onChange={handleChange}
            aria-required="true"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? titleErrorId : undefined}
          />
          {errors.title && (
            <p id={titleErrorId} className="task-form__error" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div className="task-form__field">
          <label htmlFor={descriptionId} className="task-form__label">
            Description
            <span className="task-form__optional"> (optional)</span>
          </label>
          <textarea
            id={descriptionId}
            name="description"
            className="task-form__textarea"
            placeholder="Add context, notes, or key deliverables..."
            rows={3}
            value={values.description}
            onChange={handleChange}
          />
        </div>

        <div className="task-form__row">
          <div className="task-form__field">
            <label htmlFor={dueDateId} className="task-form__label">
              Due Date
              <span className="task-form__required" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id={dueDateId}
              name="dueDate"
              type="date"
              min={todayDate}
              className={`task-form__input${errors.dueDate ? ' task-form__control--error' : ''}`}
              value={values.dueDate}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? dueDateErrorId : undefined}
            />
            {errors.dueDate && (
              <p id={dueDateErrorId} className="task-form__error" role="alert">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div className="task-form__field">
            <label htmlFor={priorityId} className="task-form__label">
              Priority
              <span className="task-form__required" aria-hidden="true">
                *
              </span>
            </label>
            <select
              id={priorityId}
              name="priority"
              className={`task-form__select${errors.priority ? ' task-form__control--error' : ''}`}
              value={values.priority}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(errors.priority)}
              aria-describedby={errors.priority ? priorityErrorId : undefined}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p id={priorityErrorId} className="task-form__error" role="alert">
                {errors.priority}
              </p>
            )}
          </div>
        </div>

        <div className="task-form__actions">
          <button
            type="button"
            className="task-form__button task-form__button--secondary"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="task-form__button task-form__button--primary"
          >
            Add Task
          </button>
        </div>
      </form>
    </section>
  );
}

export default TaskForm;

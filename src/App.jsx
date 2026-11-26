import { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskCards from './components/TaskCards';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);

  function handleAddTask(newTask) {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  }

  function handleStatusChange(taskId, newStatus) {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }

  function handleDelete(taskId) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === 'Pending').length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === 'In Progress'
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === 'Completed'
  ).length;

  const summaryItems = [
    { id: 'total', label: 'Total Tasks', value: totalTasks, modifier: '' },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingTasks,
      modifier: 'summary-card--pending',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: inProgressTasks,
      modifier: 'summary-card--in-progress',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: completedTasks,
      modifier: 'summary-card--completed',
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">To-Do List</h1>
          <p className="dashboard__subtitle">
            Organize tasks, monitor progress, and keep upcoming deadlines visible.
          </p>
        </div>
      </header>

      <section className="dashboard__summary" aria-label="Task summary">
        {summaryItems.map((item) => (
          <div
            key={item.id}
            className={`summary-card${item.modifier ? ` ${item.modifier}` : ''}`}
          >
            <span className="summary-card__label">{item.label}</span>
            <strong className="summary-card__value">{item.value}</strong>
          </div>
        ))}
      </section>

      <main className="dashboard__workspace">
        <div className="dashboard__form-column">
          <TaskForm onAddTask={handleAddTask} />
        </div>

        <div className="dashboard__tasks-column">
          <div className="dashboard__tasks-header">
            <h2 className="dashboard__section-title">Tasks</h2>
            <span className="dashboard__tasks-count">
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <TaskCards
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

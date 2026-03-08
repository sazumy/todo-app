export function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let _idCounter = 0;
export function createTodo(text) {
  return { id: `${Date.now()}_${++_idCounter}`, text: text.trim(), done: false };
}

export function addTodo(todos, text) {
  const trimmed = text.trim();
  if (!trimmed) return todos;
  return [createTodo(trimmed), ...todos];
}

export function toggleTodo(todos, id) {
  return todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
}

export function editTodo(todos, id, text) {
  const trimmed = text.trim();
  if (!trimmed) return todos;
  return todos.map(t => t.id === id ? { ...t, text: trimmed } : t);
}

export function deleteTodo(todos, id) {
  return todos.filter(t => t.id !== id);
}

export function clearCompleted(todos) {
  return todos.filter(t => !t.done);
}

export function filterTodos(todos, filter) {
  if (filter === 'active')    return todos.filter(t => !t.done);
  if (filter === 'completed') return todos.filter(t => t.done);
  return todos;
}

export function getActiveCount(todos) {
  return todos.filter(t => !t.done).length;
}

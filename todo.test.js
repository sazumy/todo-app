import { describe, it, expect, beforeEach } from 'vitest';
import {
  escHtml,
  createTodo,
  addTodo,
  toggleTodo,
  editTodo,
  deleteTodo,
  clearCompleted,
  filterTodos,
  getActiveCount,
} from './todo.js';

// ─── escHtml ────────────────────────────────────────────────────────────────

describe('escHtml', () => {
  it('通常の文字列はそのまま返す', () => {
    expect(escHtml('hello world')).toBe('hello world');
  });

  it('& を &amp; にエスケープする', () => {
    expect(escHtml('A & B')).toBe('A &amp; B');
  });

  it('< を &lt; にエスケープする', () => {
    expect(escHtml('<div')).toBe('&lt;div');
  });

  it('> を &gt; にエスケープする', () => {
    expect(escHtml('a > b')).toBe('a &gt; b');
  });

  it('複数の特殊文字を同時にエスケープする', () => {
    expect(escHtml('<b>A & B</b>')).toBe('&lt;b&gt;A &amp; B&lt;/b&gt;');
  });

  it('空文字列を渡した場合は空文字列を返す', () => {
    expect(escHtml('')).toBe('');
  });
});

// ─── createTodo ─────────────────────────────────────────────────────────────

describe('createTodo', () => {
  it('id・text・done を持つオブジェクトを返す', () => {
    const todo = createTodo('買い物');
    expect(todo).toMatchObject({ text: '買い物', done: false });
    expect(typeof todo.id).toBe('string');
    expect(todo.id.length).toBeGreaterThan(0);
  });

  it('前後の空白をトリムした text を持つ', () => {
    const todo = createTodo('  タスク  ');
    expect(todo.text).toBe('タスク');
  });

  it('呼び出すたびに異なる id を生成する（連続呼び出しでも衝突しない）', () => {
    const ids = Array.from({ length: 10 }, (_, i) => createTodo(`Task ${i}`).id);
    const unique = new Set(ids);
    expect(unique.size).toBe(10);
  });
});

// ─── addTodo ────────────────────────────────────────────────────────────────

describe('addTodo', () => {
  it('新しいタスクをリストの先頭に追加する', () => {
    const todos = [{ id: '1', text: '既存', done: false }];
    const result = addTodo(todos, '新規');
    expect(result[0].text).toBe('新規');
    expect(result).toHaveLength(2);
  });

  it('空文字列を渡した場合はリストを変更しない', () => {
    const todos = [{ id: '1', text: '既存', done: false }];
    const result = addTodo(todos, '');
    expect(result).toHaveLength(1);
  });

  it('空白のみの文字列を渡した場合はリストを変更しない', () => {
    const todos = [];
    const result = addTodo(todos, '   ');
    expect(result).toHaveLength(0);
  });

  it('元のリストを変更しない（イミュータブル）', () => {
    const todos = [{ id: '1', text: '既存', done: false }];
    addTodo(todos, '新規');
    expect(todos).toHaveLength(1);
  });
});

// ─── toggleTodo ─────────────────────────────────────────────────────────────

describe('toggleTodo', () => {
  it('未完了のタスクを完了に切り替える', () => {
    const todos = [{ id: '1', text: 'A', done: false }];
    const result = toggleTodo(todos, '1');
    expect(result[0].done).toBe(true);
  });

  it('完了済みのタスクを未完了に切り替える', () => {
    const todos = [{ id: '1', text: 'A', done: true }];
    const result = toggleTodo(todos, '1');
    expect(result[0].done).toBe(false);
  });

  it('対象外のタスクは変更しない', () => {
    const todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: false },
    ];
    const result = toggleTodo(todos, '1');
    expect(result[1].done).toBe(false);
  });

  it('存在しない id を渡した場合はリストをそのまま返す', () => {
    const todos = [{ id: '1', text: 'A', done: false }];
    const result = toggleTodo(todos, 'unknown');
    expect(result[0].done).toBe(false);
  });
});

// ─── editTodo ───────────────────────────────────────────────────────────────

describe('editTodo', () => {
  it('指定した id のテキストを更新する', () => {
    const todos = [{ id: '1', text: '旧テキスト', done: false }];
    const result = editTodo(todos, '1', '新テキスト');
    expect(result[0].text).toBe('新テキスト');
  });

  it('前後の空白をトリムして保存する', () => {
    const todos = [{ id: '1', text: '旧', done: false }];
    const result = editTodo(todos, '1', '  新  ');
    expect(result[0].text).toBe('新');
  });

  it('空文字列を渡した場合はリストを変更しない（空編集をリバート）', () => {
    const todos = [{ id: '1', text: '旧', done: false }];
    const result = editTodo(todos, '1', '');
    expect(result[0].text).toBe('旧');
  });

  it('空白のみを渡した場合もリストを変更しない', () => {
    const todos = [{ id: '1', text: '旧', done: false }];
    const result = editTodo(todos, '1', '   ');
    expect(result[0].text).toBe('旧');
  });
});

// ─── deleteTodo ─────────────────────────────────────────────────────────────

describe('deleteTodo', () => {
  it('指定した id のタスクを削除する', () => {
    const todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: false },
    ];
    const result = deleteTodo(todos, '1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('存在しない id を指定しても何も削除しない', () => {
    const todos = [{ id: '1', text: 'A', done: false }];
    const result = deleteTodo(todos, 'unknown');
    expect(result).toHaveLength(1);
  });

  it('空のリストに対して呼び出しても空のリストを返す', () => {
    const result = deleteTodo([], '1');
    expect(result).toHaveLength(0);
  });
});

// ─── clearCompleted ─────────────────────────────────────────────────────────

describe('clearCompleted', () => {
  it('完了済みタスクをすべて削除し、未完了タスクを残す', () => {
    const todos = [
      { id: '1', text: 'A', done: true },
      { id: '2', text: 'B', done: false },
      { id: '3', text: 'C', done: true },
    ];
    const result = clearCompleted(todos);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('完了済みタスクがない場合はリストをそのまま返す', () => {
    const todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: false },
    ];
    const result = clearCompleted(todos);
    expect(result).toHaveLength(2);
  });

  it('全タスクが完了済みの場合は空のリストを返す', () => {
    const todos = [
      { id: '1', text: 'A', done: true },
      { id: '2', text: 'B', done: true },
    ];
    const result = clearCompleted(todos);
    expect(result).toHaveLength(0);
  });
});

// ─── filterTodos ────────────────────────────────────────────────────────────

describe('filterTodos', () => {
  let todos;

  beforeEach(() => {
    todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: true },
      { id: '3', text: 'C', done: false },
    ];
  });

  it('"all" フィルターは全タスクを返す', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('"active" フィルターは未完了タスクのみ返す', () => {
    const result = filterTodos(todos, 'active');
    expect(result).toHaveLength(2);
    expect(result.every(t => !t.done)).toBe(true);
  });

  it('"completed" フィルターは完了済みタスクのみ返す', () => {
    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('不明なフィルター値の場合は全タスクを返す', () => {
    expect(filterTodos(todos, 'unknown')).toHaveLength(3);
  });
});

// ─── getActiveCount ─────────────────────────────────────────────────────────

describe('getActiveCount', () => {
  it('未完了タスクの件数を返す', () => {
    const todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: true },
      { id: '3', text: 'C', done: false },
    ];
    expect(getActiveCount(todos)).toBe(2);
  });

  it('全タスクが完了済みの場合は 0 を返す', () => {
    const todos = [
      { id: '1', text: 'A', done: true },
      { id: '2', text: 'B', done: true },
    ];
    expect(getActiveCount(todos)).toBe(0);
  });

  it('空のリストの場合は 0 を返す', () => {
    expect(getActiveCount([])).toBe(0);
  });

  it('全タスクが未完了の場合はリストの長さを返す', () => {
    const todos = [
      { id: '1', text: 'A', done: false },
      { id: '2', text: 'B', done: false },
      { id: '3', text: 'C', done: false },
    ];
    expect(getActiveCount(todos)).toBe(3);
  });
});

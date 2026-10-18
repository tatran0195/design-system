import { useCallback, useRef, useState } from 'react';
export interface Command {
  execute: () => void;
  undo: () => void;
  redo: () => void;
}
/** Synchronous commands; failed commands do not alter history. Newest entries win. */
export function useCommandHistory(maxHistory = 20) {
  const limit = Number.isFinite(maxHistory) ? Math.max(0, Math.floor(maxHistory)) : 20;
  const history = useRef<{ past: Command[]; future: Command[] }>({ past: [], future: [] });
  const [, render] = useState(0);
  const notify = useCallback(() => render((value) => value + 1), []);
  const trim = useCallback((commands: Command[]) => (limit === 0 ? [] : commands.slice(-limit)), [limit]);
  const execute = useCallback(
    (command: Command) => {
      command.execute();
      history.current = { past: trim([...history.current.past, command]), future: [] };
      notify();
    },
    [trim, notify],
  );
  const undo = useCallback(() => {
    const command = history.current.past.at(-1);
    if (!command) return;
    command.undo();
    history.current = { past: history.current.past.slice(0, -1), future: [command, ...history.current.future].slice(0, limit) };
    notify();
  }, [limit, notify]);
  const redo = useCallback(() => {
    const command = history.current.future[0];
    if (!command) return;
    command.redo();
    history.current = { past: trim([...history.current.past, command]), future: history.current.future.slice(1) };
    notify();
  }, [trim, notify]);
  const clear = useCallback(() => {
    history.current = { past: [], future: [] };
    notify();
  }, [notify]);
  return { execute, undo, redo, clear, canUndo: history.current.past.length > 0, canRedo: history.current.future.length > 0 };
}

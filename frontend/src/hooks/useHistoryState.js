import { useCallback, useRef, useState } from "react";

/**
 * State container with undo/redo. `set` accepts a value or updater and pushes
 * a new history entry; `reset` replaces state without adding history (used when
 * loading a form from the server).
 */
export function useHistoryState(initial) {
  const [state, setState] = useState(initial);
  const past = useRef([]);
  const future = useRef([]);

  const set = useCallback((next) => {
    setState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (value === prev) return prev;
      past.current.push(prev);
      if (past.current.length > 100) past.current.shift();
      future.current = [];
      return value;
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (past.current.length === 0) return prev;
      const previous = past.current.pop();
      future.current.push(prev);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (future.current.length === 0) return prev;
      const next = future.current.pop();
      past.current.push(prev);
      return next;
    });
  }, []);

  const reset = useCallback((value) => {
    past.current = [];
    future.current = [];
    setState(value);
  }, []);

  return {
    state,
    set,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}

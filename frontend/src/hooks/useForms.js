import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formApi } from "../services/index.js";

/** Loads and mutates the current user's forms with optimistic UI helpers. */
export function useForms({ search = "", filter = "all" } = {}) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await formApi.list({ search, filter });
      setForms(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    setForms((prev) => prev.filter((f) => f._id !== id));
    try {
      await formApi.remove(id);
      toast.success("Form deleted");
    } catch (err) {
      toast.error(err.message);
      load();
    }
  }, [load]);

  const duplicate = useCallback(async (id) => {
    try {
      const copy = await formApi.duplicate(id);
      setForms((prev) => [copy, ...prev]);
      toast.success("Form duplicated");
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const patch = useCallback(async (id, updates) => {
    setForms((prev) => prev.map((f) => (f._id === id ? { ...f, ...updates } : f)));
    try {
      await formApi.update(id, updates);
    } catch (err) {
      toast.error(err.message);
      load();
    }
  }, [load]);

  return { forms, loading, error, reload: load, remove, duplicate, patch, setForms };
}

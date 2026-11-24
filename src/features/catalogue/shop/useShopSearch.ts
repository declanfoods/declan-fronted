import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useShopSearch() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const [draft, setDraft] = useState({ source: search, value: search });
  const query = draft.source === search ? draft.value : search;

  if (draft.source !== search) {
    setDraft({ source: search, value: search });
  }

  useEffect(() => {
    const next = query.trim();
    if (next === search) return;

    const timer = window.setTimeout(() => {
      setParams((current) => {
        const updated = new URLSearchParams(current);
        if (next) updated.set('search', next);
        else updated.delete('search');
        return updated;
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [query, search, setParams]);

  return {
    search: search.trim(),
    query,
    setQuery: (value: string) => setDraft({ source: search, value }),
  };
}

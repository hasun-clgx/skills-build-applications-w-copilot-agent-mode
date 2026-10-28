import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type State<T> =
  | { status: 'loading' }
  | { status: 'success'; items: T[] }
  | { status: 'error' };

type Props<T> = {
  title: string;
  description: string;
  dataPath: string;
  responseKey: string;
  emptyMessage: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, dataPath, responseKey, emptyMessage, renderItem }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<Record<string, T[]>>(dataPath)
      .then((response) => {
        const items = response[responseKey];
        if (!Array.isArray(items)) throw new Error('Invalid API response');
        if (active) setState({ status: 'success', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => { active = false; };
  }, [dataPath, responseKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
        {state.status === 'success' && state.items.length === 0 && <p>{emptyMessage}</p>}
        {state.status === 'success' && state.items.length > 0 && (
          <ul className="list-group list-group-flush">
            {state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item, index)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; reason: string };
type WorkoutSuggestionsResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadItems={async () => (await getJson<WorkoutSuggestionsResponse>('/api/workouts/suggestions/mona%40example.com')).suggestions}
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <>{suggestion.title} · {suggestion.reason}</>}
    />
  );
}

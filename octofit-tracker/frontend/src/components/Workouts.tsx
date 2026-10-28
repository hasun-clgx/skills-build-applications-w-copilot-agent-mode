import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; reason: string };

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      dataPath="/api/workouts/suggestions/mona%40example.com"
      responseKey="suggestions"
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => <>{suggestion.title} · {suggestion.reason}</>}
    />
  );
}

import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      loadItems={async () => (await getJson<ActivitiesResponse>('/api/activities')).activities}
      emptyMessage="No activities yet."
      renderItem={(activity) => <>{activity.type} · {activity.minutes} min · {activity.points} points</>}
    />
  );
}

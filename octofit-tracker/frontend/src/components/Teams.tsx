import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      loadItems={async () => (await getJson<TeamsResponse>('/api/teams')).teams}
      emptyMessage="No teams yet."
      renderItem={(team) => <>{team.name} · {team.members.length} members</>}
    />
  );
}

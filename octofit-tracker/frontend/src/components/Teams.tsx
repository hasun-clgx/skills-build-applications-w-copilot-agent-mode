import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      dataPath="/api/teams"
      responseKey="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => <>{team.name} · {team.members.length} members</>}
    />
  );
}

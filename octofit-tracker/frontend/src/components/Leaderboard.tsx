import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      loadItems={async () => (await getJson<LeaderboardResponse>('/api/leaderboard')).leaderboard}
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => <>#{entry.rank} {entry.teamName} · {entry.totalPoints} points</>}
    />
  );
}

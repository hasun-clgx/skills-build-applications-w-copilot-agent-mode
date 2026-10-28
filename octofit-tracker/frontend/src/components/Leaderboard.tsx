import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      dataPath="/api/leaderboard"
      responseKey="leaderboard"
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => <>#{entry.rank} {entry.teamName} · {entry.totalPoints} points</>}
    />
  );
}

import { Activity, Team, User, Workout } from '../models/index.js';

const objectIdPattern = /^[0-9a-f]{24}$/i;

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity input is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !objectIdPattern.test(userId) ||
    typeof teamId !== 'string' || !objectIdPattern.test(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Valid userId, teamId, type, and minutes are required'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 400 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team input is required'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Team mascot is required'), { status: 400 });
  }
  if (
    members !== undefined &&
    (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !objectIdPattern.test(member)))
  ) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  const memberIds = [...new Set(((members ?? []) as string[]).map((id) => id.toLowerCase()))];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== memberIds.length) {
      throw Object.assign(new Error('Team members must exist'), { status: 400 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: members ?? [] });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    { $set: { totalPoints: { $sum: '$activities.points' } } },
    { $sort: { totalPoints: -1, name: 1, _id: 1 } },
    { $project: { _id: 0, teamName: '$name', totalPoints: 1 } },
  ]);

  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusForActivity(type: string) {
  const normalizedType = type.trim().toLowerCase();
  if (['run', 'running', 'cycle', 'cycling', 'walk', 'walking'].includes(normalizedType)) return 'endurance';
  return normalizedType;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  const activityFocusCounts = new Map<string, number>();
  for (const activity of recentActivities) {
    const focus = focusForActivity(activity.type);
    activityFocusCounts.set(focus, (activityFocusCounts.get(focus) ?? 0) + 1);
  }

  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const availableFocuses = new Set(workouts.map((workout) => workout.focus.toLowerCase()));
  const recentFocus = [...activityFocusCounts.entries()]
    .filter(([focus]) => availableFocuses.has(focus))
    .sort((first, second) => second[1] - first[1])[0]?.[0];
  const preferredFocus = availableFocuses.has(goalFocus)
    ? goalFocus
    : recentFocus ?? goalFocus;

  return workouts
    .sort((first, second) => Number(second.focus.toLowerCase() === preferredFocus) - Number(first.focus.toLowerCase() === preferredFocus))
    .map((workout) => {
      const workoutFocus = workout.focus.toLowerCase();
      let reason = `Supports your ${goalFocus} fitness goal.`;
      if (workoutFocus === goalFocus && recentActivities.length > 0) {
        reason = `Matches your ${goalFocus} goal and recent ${recentActivities[0].type} activity.`;
      } else if (workoutFocus === goalFocus) {
        reason = `Matches your ${goalFocus} fitness goal.`;
      } else if (workoutFocus === recentFocus && recentActivities.length > 0) {
        reason = `Based on your recent ${recentActivities[0].type} activity.`;
      }
      return { ...workout, reason };
    });
}

export { User };

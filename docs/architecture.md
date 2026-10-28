# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route components focused on rendering. Load data through the shared `api/client.ts` helper and show accessible loading, empty, and error states for each capability.
- Logic tier decision: Keep Express routes as thin HTTP adapters and put validation, persistence, and capability behavior in `octofitService.ts`. Return deliberate 4xx responses for invalid input or missing records; do not leak Mongoose cast errors as 500s.
- Data tier decision: Add Mongoose required fields and defaults to the existing schemas. Keep references as ObjectIds, default team members to an empty array, and make the seed script idempotent without deleting unrelated records.
- Activity tracking approach: Validate the submitted user and team IDs and confirm both records exist before creating an activity. Compute points as one point per minute, set `occurredAt` on creation, and return the persisted activity from both create and list endpoints.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and persist the supplied member IDs using the existing members array.
- Leaderboard approach: Aggregate activity points by team, return each team's name and total, sort highest total first, and assign ranks starting at 1.
- Workout suggestions approach: Find the user by email, consider their fitness goal and recent activity when choosing matching workouts, and include a reason for the first suggestion. Return a 4xx response when no user matches.

## Test plan

Run the focused checks after implementing each tier, then run both builds as integration checks. These commands are planned checks and have not been run as part of documenting the decisions.

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — failures indicate missing schema constraints/defaults or seed behavior that is not representative, idempotent, or preserving unrelated data.
- Logic tier: `npm run test:api --prefix octofit-tracker/backend` — failures indicate incorrect HTTP validation/status codes, persistence or response shape, point totals/ranking, or user-specific workout matching.
- Presentation tier: `npm test --prefix octofit-tracker/frontend` — failures indicate the UI is not using the shared API path correctly or is missing its data, loading, empty, error, or accessible content state.
- Backend integration: `npm run build --prefix octofit-tracker/backend` — failures indicate TypeScript or backend module integration errors.
- Frontend integration: `npm run build --prefix octofit-tracker/frontend` — failures indicate TypeScript, Vite, or frontend module integration errors.

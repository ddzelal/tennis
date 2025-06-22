# Tennis Dashboard API

This API provides endpoints for managing tennis tournaments, leagues, players, matches, and stages.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the `apps/request` directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/tennis-dashboard
   PORT=3001
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

## API Endpoints

### Players

- `GET /request/players` - Get all players
- `GET /request/players/:id` - Get player by ID
- `POST /request/players` - Create new player
- `PUT /request/players/:id` - Update player
- `DELETE /request/players/:id` - Delete player

### Tournaments

- `GET /request/tournaments` - Get all tournaments
- `GET /request/tournaments/:id` - Get tournament by ID
- `POST /request/tournaments` - Create new tournament
- `PUT /request/tournaments/:id` - Update tournament
- `DELETE /request/tournaments/:id` - Delete tournament
- `POST /request/tournaments/:id/players` - Add player to tournament
- `DELETE /request/tournaments/:id/players` - Remove player from tournament

### Stages

- `GET /request/stages` - Get all stages
- `GET /request/stages/:id` - Get stage by ID
- `POST /request/stages` - Create new stage
- `PUT /request/stages/:id` - Update stage
- `DELETE /request/stages/:id` - Delete stage
- `POST /request/stages/:id/players` - Add player to stage
- `POST /request/stages/:id/generate-matches` - Generate matches for a stage

### Matches

- `GET /request/matches` - Get all matches
- `GET /request/matches/:id` - Get match by ID
- `POST /request/matches` - Create new match
- `PUT /request/matches/:id` - Update match
- `DELETE /request/matches/:id` - Delete match
- `POST /request/matches/:id/result` - Record match result

## Data Models

### Player

```typescript
{
  name: string;
  email: string;
  phone?: string;
  ranking?: number;
}
```

### Tournament

```typescript
{
  name: string;
  description?: string;
  type: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | 'CUSTOM';
  status: 'DRAFT' | 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  players: Player[];
  maxPlayers?: number;
  rules?: {
    matchesPerPlayer?: number;
    advancingPlayers?: number;
    scoringSystem?: string;
    sets?: number;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
    tiebreakers?: string[];
  };
  createdBy: User;
}
```

### Stage

```typescript
{
  tournament: Tournament;
  name: string;
  type: 'GROUP' | 'ROUND_ROBIN' | 'KNOCKOUT' | 'SEMIFINALS' | 'FINALS' | 'CUSTOM';
  order: number;
  startDate?: Date;
  endDate?: Date;
  players: Player[];
  advancingPlayers?: number;
  rules?: {
    matchesPerPlayer?: number;
    scoringSystem?: string;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
    tiebreakers?: string[];
  };
}
```

### Match

```typescript
{
  tournament: Tournament;
  stage?: Stage;
  player1: Player;
  player2: Player;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: Date;
  completedDate?: Date;
  sets?: {
    player1Score: number;
    player2Score: number;
    tiebreak?: boolean;
    tiebreakScore?: string;
  }[];
  winner?: Player;
  notes?: string;
}
```

## Example: Creating a Tournament with Stages and Matches

1. Create players
2. Create a tournament
3. Add players to the tournament
4. Create stages for the tournament
5. Add players to stages
6. Generate matches for each stage
7. Record match results
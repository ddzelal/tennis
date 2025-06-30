import mongoose from 'mongoose';
import { TournamentType } from '../models';
import { StageType, SeedingType } from '../models';
import { MatchStatus, MatchResultType } from '../models';

/**
 * Generates a round-robin schedule for a group of players
 * Uses the rotation algorithm (circle method)
 * 
 * @param players Array of player IDs
 * @param groupName Optional group name for group stages
 * @returns Array of match pairings, each containing player1 and player2 IDs, round, and group
 */
export function generateRoundRobinSchedule(
  players: mongoose.Types.ObjectId[],
  groupName?: string
): Array<{
  player1: mongoose.Types.ObjectId;
  player2: mongoose.Types.ObjectId;
  round: number;
  group?: string;
}> {
  const matches = [];
  let playersCopy = [...players];
  
  // If odd number of players, add a "bye" placeholder
  if (playersCopy.length % 2 !== 0) {
    playersCopy.push(null as any); // null represents a "bye"
  }
  
  const totalRounds = playersCopy.length - 1;
  const matchesPerRound = playersCopy.length / 2;
  
  for (let round = 0; round < totalRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const player1 = playersCopy[match];
      const player2 = playersCopy[playersCopy.length - 1 - match];
      
      // Skip matches with "bye" (null player)
      if (player1 && player2) {
        matches.push({
          player1,
          player2,
          round: round + 1,
          group: groupName
        });
      }
    }
    
    // Rotate players (keep the first player fixed, rotate the rest)
    const firstPlayer = playersCopy[0];
    const lastPlayer = playersCopy[playersCopy.length - 1];
    
    for (let i = playersCopy.length - 1; i > 1; i--) {
      playersCopy[i] = playersCopy[i - 1];
    }
    
    playersCopy[1] = lastPlayer;
  }
  
  return matches;
}

/**
 * Generates a knockout bracket for a tournament stage
 * 
 * @param players Array of player IDs, should ideally be a power of 2
 * @param seedingType How to seed the players in the bracket
 * @returns Array of match objects with player assignments and next match references
 */
export function generateKnockoutBracket(
  players: mongoose.Types.ObjectId[],
  seedingType: SeedingType = SeedingType.RANDOM
): Array<{
  player1: mongoose.Types.ObjectId;
  player2: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  resultForWinner: string;
  resultForLoser: string;
}> {
  const matches = [];
  let playersCopy = [...players];
  
  // If not a power of 2, add byes to make it a power of 2
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(playersCopy.length)));
  const byesCount = nextPowerOf2 - playersCopy.length;
  
  // Add byes (null) to the player list
  for (let i = 0; i < byesCount; i++) {
    playersCopy.push(null as any);
  }
  
  // Seed the players according to the seeding type
  if (seedingType === SeedingType.RANDOM) {
    // Shuffle the players randomly
    for (let i = playersCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playersCopy[i], playersCopy[j]] = [playersCopy[j], playersCopy[i]];
    }
  } else if (seedingType === SeedingType.RANKING) {
    // Assume players are already sorted by ranking
    // Implement standard tournament seeding (1 vs lowest, 2 vs second lowest, etc.)
    const seededPlayers = new Array(playersCopy.length);
    
    // Place the top seeds in their positions
    for (let i = 0; i < playersCopy.length / 2; i++) {
      seededPlayers[i] = playersCopy[i];
      seededPlayers[playersCopy.length - 1 - i] = playersCopy[i + playersCopy.length / 2];
    }
    
    playersCopy = seededPlayers;
  }
  // For CROSS_GROUP and CUSTOM, assume the players are already in the desired order
  
  // Calculate the number of rounds in the bracket
  const totalRounds = Math.log2(nextPowerOf2);
  
  // Generate first round matches
  let matchCount = 0;
  for (let i = 0; i < playersCopy.length; i += 2) {
    const player1 = playersCopy[i];
    const player2 = playersCopy[i + 1];
    
    // If player2 is a bye, player1 automatically advances
    if (!player2) {
      // Find the next match this player would go to
      const nextMatchNumber = Math.floor(matchCount / 2);
      const nextRound = 2;
      
      // Add the match with the bye
      matches.push({
        player1,
        player2: null as any,
        round: 1,
        matchNumber: matchCount,
        resultForWinner: `R${nextRound}M${nextMatchNumber}`,
        resultForLoser: MatchResultType.EXIT
      });
    } else {
      // Regular match
      const nextMatchNumber = Math.floor(matchCount / 2);
      const nextRound = 2;
      
      matches.push({
        player1,
        player2,
        round: 1,
        matchNumber: matchCount,
        resultForWinner: `R${nextRound}M${nextMatchNumber}`,
        resultForLoser: MatchResultType.EXIT
      });
    }
    
    matchCount++;
  }
  
  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = nextPowerOf2 / Math.pow(2, round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const nextMatchNumber = Math.floor(i / 2);
      const nextRound = round + 1;
      
      // For the final round, winner wins the tournament
      const resultForWinner = round === totalRounds 
        ? MatchResultType.WINS_TOURNAMENT 
        : `R${nextRound}M${nextMatchNumber}`;
      
      matches.push({
        player1: null as any, // Will be filled in when previous matches are completed
        player2: null as any, // Will be filled in when previous matches are completed
        round,
        matchNumber: i,
        resultForWinner,
        resultForLoser: MatchResultType.EXIT
      });
    }
  }
  
  return matches;
}

/**
 * Creates a tournament with multiple stages based on the tournament type
 * 
 * @param tournamentType The type of tournament to create
 * @param players Array of player IDs
 * @param config Configuration options for the tournament
 * @returns Configuration for tournament stages and matches
 */
export function createTournamentStructure(
  tournamentType: TournamentType,
  players: mongoose.Types.ObjectId[],
  config: {
    groupCount?: number;
    advancingPerGroup?: number;
    advancingPlayers?: number;
    seedingType?: SeedingType;
  }
) {
  const stages = [];
  
  switch (tournamentType) {
    case TournamentType.LEAGUE:
    case TournamentType.ROUND_ROBIN:
      // Single round-robin stage
      stages.push({
        type: StageType.ROUND_ROBIN,
        order: 1,
        players,
        matches: generateRoundRobinSchedule(players)
      });
      break;
      
    case TournamentType.KNOCKOUT:
      // Single knockout stage
      stages.push({
        type: StageType.KNOCKOUT,
        order: 1,
        players,
        matches: generateKnockoutBracket(players, config.seedingType)
      });
      break;
      
    case TournamentType.GROUP_KNOCKOUT:
      // Group stage followed by knockout stage
      const { groupCount = 2, advancingPerGroup = 2 } = config;
      
      // Create groups
      const playersPerGroup = Math.ceil(players.length / groupCount);
      const groups = [];
      
      for (let i = 0; i < groupCount; i++) {
        const groupName = String.fromCharCode(65 + i); // A, B, C, ...
        const groupPlayers = players.slice(i * playersPerGroup, (i + 1) * playersPerGroup);
        
        if (groupPlayers.length > 0) {
          groups.push({
            name: groupName,
            players: groupPlayers
          });
        }
      }
      
      // Group stage
      const groupStage = {
        type: StageType.GROUP,
        order: 1,
        players,
        groups,
        advancingPerGroup,
        matches: [] as any[]
      };
      
      // Generate matches for each group
      groups.forEach(group => {
        const groupMatches = generateRoundRobinSchedule(group.players, group.name);
        groupStage.matches.push(...groupMatches);
      });
      
      stages.push(groupStage);
      
      // Knockout stage (will be populated with advancing players after group stage)
      const totalAdvancing = groups.length * advancingPerGroup;
      
      stages.push({
        type: StageType.KNOCKOUT,
        order: 2,
        players: [], // Will be populated after group stage
        seedingType: config.seedingType || SeedingType.CROSS_GROUP,
        matches: [] // Will be generated after group stage
      });
      break;
      
    case TournamentType.CUSTOM:
      // For custom tournaments, stages would be defined manually
      break;
  }
  
  return stages;
}

/**
 * Calculates standings for a round-robin or group stage
 * 
 * @param matches Array of completed matches
 * @param players Array of player IDs
 * @param rules Scoring rules
 * @returns Array of player standings with points, wins, etc.
 */
export function calculateStandings(
  matches: Array<{
    player1: mongoose.Types.ObjectId;
    player2: mongoose.Types.ObjectId;
    winner?: mongoose.Types.ObjectId;
    sets?: Array<{ player1Score: number; player2Score: number }>;
  }>,
  players: mongoose.Types.ObjectId[],
  rules: {
    pointsPerWin: number;
    pointsPerLoss: number;
    pointsPerDraw: number;
  }
) {
  const standings = players.map(playerId => ({
    player: playerId,
    matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0
  }));
  
  // Process each match
  matches.forEach(match => {
    if (!match.winner) return; // Skip matches without a result
    
    const player1Index = standings.findIndex(s => s.player.equals(match.player1));
    const player2Index = standings.findIndex(s => s.player.equals(match.player2));
    
    if (player1Index === -1 || player2Index === -1) return; // Skip if player not found
    
    // Update match count
    standings[player1Index].matches++;
    standings[player2Index].matches++;
    
    // Update wins, losses, draws and points
    if (match.winner.equals(match.player1)) {
      standings[player1Index].wins++;
      standings[player1Index].points += rules.pointsPerWin;
      standings[player2Index].losses++;
      standings[player2Index].points += rules.pointsPerLoss;
    } else if (match.winner.equals(match.player2)) {
      standings[player2Index].wins++;
      standings[player2Index].points += rules.pointsPerWin;
      standings[player1Index].losses++;
      standings[player1Index].points += rules.pointsPerLoss;
    } else {
      // Draw
      standings[player1Index].draws++;
      standings[player1Index].points += rules.pointsPerDraw;
      standings[player2Index].draws++;
      standings[player2Index].points += rules.pointsPerDraw;
    }
    
    // Update sets and games if available
    if (match.sets && match.sets.length > 0) {
      let player1Sets = 0;
      let player2Sets = 0;
      let player1Games = 0;
      let player2Games = 0;
      
      match.sets.forEach(set => {
        if (set.player1Score > set.player2Score) {
          player1Sets++;
        } else if (set.player2Score > set.player1Score) {
          player2Sets++;
        }
        
        player1Games += set.player1Score;
        player2Games += set.player2Score;
      });
      
      standings[player1Index].setsWon += player1Sets;
      standings[player1Index].setsLost += player2Sets;
      standings[player1Index].gamesWon += player1Games;
      standings[player1Index].gamesLost += player2Games;
      
      standings[player2Index].setsWon += player2Sets;
      standings[player2Index].setsLost += player1Sets;
      standings[player2Index].gamesWon += player2Games;
      standings[player2Index].gamesLost += player1Games;
    }
  });
  
  // Sort standings by points (descending), then by wins, then by set difference, then by game difference
  return standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.wins !== b.wins) return b.wins - a.wins;
    
    const aSetDiff = a.setsWon - a.setsLost;
    const bSetDiff = b.setsWon - b.setsLost;
    if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff;
    
    const aGameDiff = a.gamesWon - a.gamesLost;
    const bGameDiff = b.gamesWon - b.gamesLost;
    return bGameDiff - aGameDiff;
  });
}

/**
 * Determines which players advance from a group stage to a knockout stage
 * 
 * @param groupStandings Object with group standings
 * @param advancingPerGroup Number of players to advance from each group
 * @param seedingType How to seed the advancing players
 * @returns Array of advancing players in the order they should be seeded
 */
export function determineAdvancingPlayers(
  groupStandings: Record<string, Array<{ player: mongoose.Types.ObjectId; points: number; wins: number }>>,
  advancingPerGroup: number,
  seedingType: SeedingType
): mongoose.Types.ObjectId[] {
  const advancingPlayers: mongoose.Types.ObjectId[] = [];
  
  if (seedingType === SeedingType.CROSS_GROUP) {
    // For cross-group seeding (A1, B2, B1, A2, C1, D2, D1, C2, ...)
    const groups = Object.keys(groupStandings).sort();
    const pairs: [string, string][] = [];
    
    // Create pairs of groups (A-B, C-D, etc.)
    for (let i = 0; i < groups.length; i += 2) {
      if (i + 1 < groups.length) {
        pairs.push([groups[i], groups[i + 1]]);
      } else {
        // Odd number of groups, pair the last one with the first one
        pairs.push([groups[i], groups[0]]);
      }
    }
    
    // Add players from each pair in cross-group order
    for (let i = 0; i < advancingPerGroup; i++) {
      for (const [group1, group2] of pairs) {
        if (i < groupStandings[group1].length) {
          advancingPlayers.push(groupStandings[group1][i].player);
        }
        
        if (i < groupStandings[group2].length) {
          advancingPlayers.push(groupStandings[group2][i].player);
        }
      }
    }
  } else {
    // For other seeding types, just take the top N from each group
    const groups = Object.keys(groupStandings).sort();
    
    for (const group of groups) {
      for (let i = 0; i < advancingPerGroup && i < groupStandings[group].length; i++) {
        advancingPlayers.push(groupStandings[group][i].player);
      }
    }
  }
  
  return advancingPlayers;
}
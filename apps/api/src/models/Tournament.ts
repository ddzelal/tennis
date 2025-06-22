import mongoose, { Document, Schema } from 'mongoose';
import { IPlayer } from './Player';

export enum TournamentType {
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT',
  GROUP_KNOCKOUT = 'GROUP_KNOCKOUT',
  CUSTOM = 'CUSTOM',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ITournament extends Document {
  name: string;
  description?: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate?: Date;
  endDate?: Date;
  players: mongoose.Types.ObjectId[] | IPlayer[];
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
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: Object.values(TournamentType), 
      default: TournamentType.LEAGUE 
    },
    status: { 
      type: String, 
      enum: Object.values(TournamentStatus), 
      default: TournamentStatus.DRAFT 
    },
    startDate: { type: Date },
    endDate: { type: Date },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    maxPlayers: { type: Number },
    rules: {
      matchesPerPlayer: { type: Number },
      advancingPlayers: { type: Number },
      scoringSystem: { type: String },
      sets: { type: Number },
      pointsPerWin: { type: Number },
      pointsPerLoss: { type: Number },
      pointsPerDraw: { type: Number },
      tiebreakers: [{ type: String }],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);
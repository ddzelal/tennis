import mongoose, { Document, Schema } from 'mongoose';
import { IPlayer } from './Player';
import { IStage } from './Stage';

export enum TournamentType {
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT',
  GROUP_KNOCKOUT = 'GROUP_KNOCKOUT',
  ROUND_ROBIN = 'ROUND_ROBIN',
  CUSTOM = 'CUSTOM',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ITournamentSettings {
  setsToWin?: number;
  gamesPerSet?: number;
  tieBreak?: boolean;
  pointsPerWin?: number;
  pointsPerLoss?: number;
  pointsPerDraw?: number;
  tiebreakers?: string[];
}

export interface ITournament extends Document {
  name: string;
  description?: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate?: Date;
  endDate?: Date;
  players: mongoose.Types.ObjectId[] | IPlayer[];
  stages?: mongoose.Types.ObjectId[] | IStage[];
  maxPlayers?: number;
  currentStage?: number;
  settings?: ITournamentSettings;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSettingsSchema = new Schema<ITournamentSettings>({
  setsToWin: { type: Number, default: 2 }, // Best of 3 sets by default
  gamesPerSet: { type: Number, default: 6 }, // 6 games per set by default
  tieBreak: { type: Boolean, default: true }, // Use tiebreak at 6-6 by default
  pointsPerWin: { type: Number, default: 2 },
  pointsPerLoss: { type: Number, default: 0 },
  pointsPerDraw: { type: Number, default: 1 },
  tiebreakers: [{ type: String }],
}, { _id: false });

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
    stages: [{ type: Schema.Types.ObjectId, ref: 'Stage' }],
    maxPlayers: { type: Number },
    currentStage: { type: Number, default: 0 },
    settings: { 
      type: TournamentSettingsSchema,
      default: () => ({})
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);

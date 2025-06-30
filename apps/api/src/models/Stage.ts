import mongoose, { Document, Schema } from 'mongoose';

export enum StageType {
  GROUP = 'GROUP',
  ROUND_ROBIN = 'ROUND_ROBIN',
  KNOCKOUT = 'KNOCKOUT',
  SEMIFINALS = 'SEMIFINALS',
  FINALS = 'FINALS',
  CUSTOM = 'CUSTOM',
}

export enum SeedingType {
  RANDOM = 'RANDOM',
  RANKING = 'RANKING',
  CROSS_GROUP = 'CROSS_GROUP',
  CUSTOM = 'CUSTOM',
}

export interface IGroup {
  name: string;
  players: mongoose.Types.ObjectId[];
}

export interface IStage extends Document {
  tournament: mongoose.Types.ObjectId;
  name: string;
  type: StageType;
  order: number;
  startDate?: Date;
  endDate?: Date;
  players: mongoose.Types.ObjectId[];
  groups?: IGroup[];
  advancingPlayers?: number;
  advancingPerGroup?: number;
  seedingType?: SeedingType;
  rules?: {
    matchesPerPlayer?: number;
    scoringSystem?: string;
    setsToWin?: number;
    gamesPerSet?: number;
    tieBreak?: boolean;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
    tiebreakers?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
}, { _id: false });

const StageSchema = new Schema<IStage>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(StageType), 
      required: true 
    },
    order: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    groups: [GroupSchema],
    advancingPlayers: { type: Number },
    advancingPerGroup: { type: Number },
    seedingType: { 
      type: String, 
      enum: Object.values(SeedingType), 
      default: SeedingType.RANDOM 
    },
    rules: {
      matchesPerPlayer: { type: Number },
      scoringSystem: { type: String },
      setsToWin: { type: Number, default: 2 }, // Best of 3 sets by default
      gamesPerSet: { type: Number, default: 6 }, // 6 games per set by default
      tieBreak: { type: Boolean, default: true }, // Use tiebreak at 6-6 by default
      pointsPerWin: { type: Number },
      pointsPerLoss: { type: Number },
      pointsPerDraw: { type: Number },
      tiebreakers: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Stage = mongoose.model<IStage>('Stage', StageSchema);

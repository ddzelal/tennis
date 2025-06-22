import mongoose, { Document, Schema } from 'mongoose';

export enum StageType {
  GROUP = 'GROUP',
  ROUND_ROBIN = 'ROUND_ROBIN',
  KNOCKOUT = 'KNOCKOUT',
  SEMIFINALS = 'SEMIFINALS',
  FINALS = 'FINALS',
  CUSTOM = 'CUSTOM',
}

export interface IStage extends Document {
  tournament: mongoose.Types.ObjectId;
  name: string;
  type: StageType;
  order: number;
  startDate?: Date;
  endDate?: Date;
  players: mongoose.Types.ObjectId[];
  advancingPlayers?: number;
  rules?: {
    matchesPerPlayer?: number;
    scoringSystem?: string;
    pointsPerWin?: number;
    pointsPerLoss?: number;
    pointsPerDraw?: number;
    tiebreakers?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

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
    advancingPlayers: { type: Number },
    rules: {
      matchesPerPlayer: { type: Number },
      scoringSystem: { type: String },
      pointsPerWin: { type: Number },
      pointsPerLoss: { type: Number },
      pointsPerDraw: { type: Number },
      tiebreakers: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Stage = mongoose.model<IStage>('Stage', StageSchema);
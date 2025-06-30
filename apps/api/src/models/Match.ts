import mongoose, { Document, Schema } from 'mongoose';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MatchResultType {
  NEXT_MATCH = 'NEXT_MATCH',
  WINS_TOURNAMENT = 'WINS_TOURNAMENT',
  EXIT = 'EXIT',
}

export interface ISet {
  player1Score: number;
  player2Score: number;
  tiebreak?: boolean;
  tiebreakScore?: string;
}

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  stage?: mongoose.Types.ObjectId;
  group?: string;
  round?: number;
  matchNumber?: number;
  player1: mongoose.Types.ObjectId;
  player2: mongoose.Types.ObjectId;
  status: MatchStatus;
  scheduledDate?: Date;
  completedDate?: Date;
  sets?: ISet[];
  winner?: mongoose.Types.ObjectId;
  resultForWinner?: string; // Next match ID or MatchResultType
  resultForLoser?: string; // Next match ID or MatchResultType
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SetSchema = new Schema<ISet>({
  player1Score: { type: Number, required: true },
  player2Score: { type: Number, required: true },
  tiebreak: { type: Boolean, default: false },
  tiebreakScore: { type: String },
});

const MatchSchema = new Schema<IMatch>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
    group: { type: String }, // For group stages (e.g., "A", "B")
    round: { type: Number }, // For knockout stages (e.g., 1 = Round of 16, 2 = Quarterfinals)
    matchNumber: { type: Number }, // Unique identifier within a round
    player1: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    player2: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    status: { 
      type: String, 
      enum: Object.values(MatchStatus), 
      default: MatchStatus.SCHEDULED 
    },
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    sets: [SetSchema],
    winner: { type: Schema.Types.ObjectId, ref: 'Player' },
    resultForWinner: { type: String }, // Next match ID or MatchResultType
    resultForLoser: { type: String }, // Next match ID or MatchResultType
    notes: { type: String },
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>('Match', MatchSchema);

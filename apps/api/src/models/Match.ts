import mongoose, { Document, Schema } from "mongoose";
import { IMatchDocument, MatchStatus, MatchSet } from "@repo/lib";

export interface IMatch extends IMatchDocument, Document {}

const MatchSetSchema = new Schema<MatchSet>(
  {
    player1Score: {
      type: Number,
      required: true,
      min: [0, "Score cannot be negative"],
    },
    player2Score: {
      type: Number,
      required: true,
      min: [0, "Score cannot be negative"],
    },
    tiebreak: { type: Boolean, default: false },
    tiebreakScore: { type: String },
  },
  { _id: false },
);

const MatchSchema = new Schema<IMatch>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: [true, "Tournament is required"],
    },
    stage: {
      type: Schema.Types.ObjectId,
      ref: "Stage",
    },
    group: { type: String },
    round: {
      type: Number,
      min: [1, "Round must be at least 1"],
    },
    matchNumber: {
      type: Number,
      min: [1, "Match number must be at least 1"],
    },
    player1: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player 1 is required"],
    },
    player2: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player 2 is required"],
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.SCHEDULED,
    },
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    sets: [MatchSetSchema],
    winner: {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
    resultForWinner: { type: String },
    resultForLoser: { type: String },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields
MatchSchema.virtual("isCompleted").get(function () {
  return this.status === MatchStatus.COMPLETED;
});

MatchSchema.virtual("duration").get(function () {
  if (this.completedDate && this.scheduledDate) {
    return this.completedDate.getTime() - this.scheduledDate.getTime();
  }
  return null;
});

// Validation middleware
MatchSchema.pre("save", function () {
  // Players cannot be the same
  if (this.player1.toString() === this.player2.toString()) {
    throw new Error("Player 1 and Player 2 cannot be the same");
  }

  // Winner must be one of the players
  if (
    this.winner &&
    this.winner.toString() !== this.player1.toString() &&
    this.winner.toString() !== this.player2.toString()
  ) {
    throw new Error("Winner must be one of the playing participants");
  }
});

// Indexes
MatchSchema.index({ tournament: 1, round: 1, matchNumber: 1 });
MatchSchema.index({ stage: 1 });
MatchSchema.index({ player1: 1 });
MatchSchema.index({ player2: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ scheduledDate: 1 });

export const Match = mongoose.model<IMatch>("Match", MatchSchema);
export default Match;

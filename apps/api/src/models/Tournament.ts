import mongoose, { Document, Schema } from "mongoose";
import {
  ITournamentDocument,
  TournamentType,
  TournamentStatus,
  TournamentSettings,
} from "@repo/lib";

export interface ITournament extends ITournamentDocument, Document {}

const TournamentSettingsSchema = new Schema<TournamentSettings>(
  {
    setsToWin: { type: Number, default: 2 }, // Best of 3 sets by default
    gamesPerSet: { type: Number, default: 6 }, // 6 games per set by default
    tieBreak: { type: Boolean, default: true }, // Use tiebreak at 6-6 by default
    pointsPerWin: { type: Number, default: 2 },
    pointsPerLoss: { type: Number, default: 0 },
    pointsPerDraw: { type: Number, default: 1 },
    tiebreakers: [{ type: String }],
  },
  { _id: false },
);

const TournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
      maxlength: [100, "Tournament name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: Object.values(TournamentType),
      default: TournamentType.LEAGUE,
      required: [true, "Tournament type is required"],
    },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      default: TournamentStatus.DRAFT,
    },
    startDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          // Start date should be in the future or today for new tournaments
          if (this.isNew && value) {
            return value >= new Date(new Date().setHours(0, 0, 0, 0));
          }
          return true;
        },
        message: "Start date cannot be in the past",
      },
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          // End date should be after start date
          if (value && this.startDate) {
            return value > this.startDate;
          }
          return true;
        },
        message: "End date must be after start date",
      },
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    stages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stage",
      },
    ],
    maxPlayers: {
      type: Number,
      min: [2, "Tournament must allow at least 2 players"],
      max: [1000, "Tournament cannot exceed 1000 players"],
    },
    currentStage: {
      type: Number,
      default: 0,
      min: [0, "Current stage cannot be negative"],
    },
    settings: {
      type: TournamentSettingsSchema,
      default: () => ({}),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tournament creator is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields
TournamentSchema.virtual("playerCount").get(function () {
  return this.players ? this.players.length : 0;
});

TournamentSchema.virtual("isActive").get(function () {
  return this.status === TournamentStatus.IN_PROGRESS;
});

TournamentSchema.virtual("isCompleted").get(function () {
  return this.status === TournamentStatus.COMPLETED;
});

TournamentSchema.virtual("canRegister").get(function () {
  return (
    this.status === TournamentStatus.REGISTRATION &&
    (!this.maxPlayers || this.players.length < this.maxPlayers)
  );
});

// Indexes
TournamentSchema.index({ name: "text", description: "text" });
TournamentSchema.index({ type: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ startDate: 1 });
TournamentSchema.index({ createdBy: 1 });
TournamentSchema.index({ createdAt: -1 });

// Middleware
TournamentSchema.pre("save", function () {
  // Validate player count doesn't exceed maxPlayers
  if (
    this.maxPlayers &&
    this.players &&
    this.players.length > this.maxPlayers
  ) {
    throw new Error(
      `Cannot exceed maximum players limit of ${this.maxPlayers}`,
    );
  }
});

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  TournamentSchema,
);

export default Tournament;

import mongoose, { Document, Schema } from "mongoose";
import { IStageDocument, StageType, StageStatus, StageRules } from "@repo/lib";

export interface IStage extends IStageDocument, Document {}

const StageRulesSchema = new Schema<StageRules>(
  {
    setsToWin: { type: Number, default: 2 },
    tieBreak: { type: Boolean, default: true },
    pointsPerWin: { type: Number, default: 2 },
    pointsPerLoss: { type: Number, default: 0 },
    pointsPerDraw: { type: Number, default: 1 },
  },
  { _id: false },
);

const StageSchema = new Schema<IStage>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: [true, "Tournament is required"],
    },
    name: {
      type: String,
      required: [true, "Stage name is required"],
      trim: true,
      maxlength: [100, "Stage name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: Object.values(StageType),
      required: [true, "Stage type is required"],
    },
    status: {
      type: String,
      enum: Object.values(StageStatus),
      default: StageStatus.SCHEDULED,
    },
    order: {
      type: Number,
      required: [true, "Stage order is required"],
      min: [1, "Order must be at least 1"],
    },
    startDate: { type: Date },
    endDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
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
    advancingPlayers: {
      type: Number,
      min: [0, "Advancing players cannot be negative"],
    },
    rules: {
      type: StageRulesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields
StageSchema.virtual("playerCount").get(function () {
  return this.players ? this.players.length : 0;
});

StageSchema.virtual("isCompleted").get(function () {
  return this.status === StageStatus.COMPLETED;
});

// Indexes
StageSchema.index({ tournament: 1, order: 1 });
StageSchema.index({ type: 1 });
StageSchema.index({ status: 1 });

export const Stage = mongoose.model<IStage>("Stage", StageSchema);
export default Stage;

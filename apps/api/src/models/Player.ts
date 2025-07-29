import mongoose, { Document, Schema } from "mongoose";
import { IPlayerDocument } from "@repo/lib";

export interface IPlayer extends IPlayerDocument, Document {}

const PlayerSchema = new Schema<IPlayer>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value: Date) {
          return value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    ranking: {
      type: Number,
      min: [1, "Ranking must be at least 1"],
      max: [10000, "Ranking cannot exceed 10000"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields
PlayerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

PlayerSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Indexes
PlayerSchema.index({ firstName: "text", lastName: "text" });
PlayerSchema.index({ ranking: 1 });

export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;

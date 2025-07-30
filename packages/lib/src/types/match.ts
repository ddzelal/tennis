import { Tournament } from "./tournament";
import { Stage } from "./stage";
import { Player } from "./player";
import {MatchStatus} from "../validations/matchValidator";

export interface MatchSet {
  player1Score: number;
  player2Score: number;
  tiebreak?: boolean;
  tiebreakScore?: string;
}

export interface Match {
  _id: string;
  tournament: string | Tournament;
  stage?: string | Stage;
  group?: string;
  round?: number;
  matchNumber?: number;
  player1: string | Player;
  player2: string | Player;
  status: MatchStatus;
  scheduledDate?: string;
  completedDate?: string;
  sets?: MatchSet[];
  winner?: string | Player;
  resultForWinner?: string;
  resultForLoser?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}




export interface MatchResult {
  sets: MatchSet[];
  winner: string;
}

// Backend interface (extends Document)
export interface IMatchDocument {
  tournament: any; // mongoose.Types.ObjectId
  stage?: any; // mongoose.Types.ObjectId
  group?: string;
  round?: number;
  matchNumber?: number;
  player1: any; // mongoose.Types.ObjectId
  player2: any; // mongoose.Types.ObjectId
  status: MatchStatus;
  scheduledDate?: Date;
  completedDate?: Date;
  sets?: MatchSet[];
  winner?: any; // mongoose.Types.ObjectId
  resultForWinner?: string;
  resultForLoser?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

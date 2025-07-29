"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Match, Player, MatchSet } from "@repo/lib";
import { useRecordMatchResult } from "@/lib/queries/matches";

interface RecordMatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  match: Match;
}

interface SetData {
  player1Score: string;
  player2Score: string;
  tiebreakScore?: string;
}

interface FormErrors {
  sets?: string;
  winner?: string;
  general?: string;
}

export const RecordMatchResultModal: React.FC<RecordMatchResultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  match,
}) => {
  const [sets, setSets] = useState<SetData[]>([
    { player1Score: "", player2Score: "" },
    { player1Score: "", player2Score: "" },
    { player1Score: "", player2Score: "" },
  ]);
  const [winner, setWinner] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  const recordResultMutation = useRecordMatchResult({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error("Failed to record match result:", error);
      setErrors({
        general:
          error.response?.data?.message || "Failed to record match result",
      });
    },
  });

  const resetForm = () => {
    setSets([
      { player1Score: "", player2Score: "" },
      { player1Score: "", player2Score: "" },
      { player1Score: "", player2Score: "" },
    ]);
    setWinner("");
    setErrors({});
  };

  // Get player objects
  const player1 = typeof match.player1 === "object" ? match.player1 : null;
  const player2 = typeof match.player2 === "object" ? match.player2 : null;

  const getPlayerName = (player: Player | null) => {
    if (!player) return "Unknown Player";
    return `${player.firstName} ${player.lastName}`;
  };

  const getPlayerInitials = (player: Player | null) => {
    if (!player) return "??";
    return `${player.firstName?.[0] || "?"}${player.lastName?.[0] || "?"}`;
  };

  // Validate tennis score
  const isValidTennisScore = (score1: number, score2: number): boolean => {
    // Normal set: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5
    if ((score1 === 6 && score2 <= 4) || (score2 === 6 && score1 <= 4)) {
      return true;
    }
    // Extended set: 7-5 or 5-7
    if ((score1 === 7 && score2 === 5) || (score2 === 7 && score1 === 5)) {
      return true;
    }
    // Tiebreak set: 7-6 or 6-7
    if ((score1 === 7 && score2 === 6) || (score2 === 7 && score1 === 6)) {
      return true;
    }
    return false;
  };

  const needsTiebreak = (score1: number, score2: number): boolean => {
    return (score1 === 7 && score2 === 6) || (score1 === 6 && score2 === 7);
  };

  const calculateWinner = (): string => {
    const completedSets = sets.filter(
      (set) =>
        set.player1Score &&
        set.player2Score &&
        isValidTennisScore(
          parseInt(set.player1Score),
          parseInt(set.player2Score),
        ),
    );

    if (completedSets.length < 2) return "";

    let player1Sets = 0;
    let player2Sets = 0;

    completedSets.forEach((set) => {
      const p1Score = parseInt(set.player1Score);
      const p2Score = parseInt(set.player2Score);

      if (p1Score > p2Score) {
        player1Sets++;
      } else {
        player2Sets++;
      }
    });

    // Best of 3: need 2 sets to win
    if (player1Sets >= 2) {
      return typeof match.player1 === "object"
        ? match.player1._id
        : match.player1;
    }
    if (player2Sets >= 2) {
      return typeof match.player2 === "object"
        ? match.player2._id
        : match.player2;
    }

    return "";
  };

  // Auto-calculate winner when sets change
  useEffect(() => {
    const autoWinner = calculateWinner();
    if (autoWinner) {
      setWinner(autoWinner);
    }
  }, [sets]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if we have at least 2 completed sets
    const validSets = sets.filter((set) => {
      if (!set.player1Score || !set.player2Score) return false;
      const p1Score = parseInt(set.player1Score);
      const p2Score = parseInt(set.player2Score);
      return isValidTennisScore(p1Score, p2Score);
    });

    if (validSets.length < 2) {
      newErrors.sets = "At least 2 completed sets are required";
    }

    // Validate each set
    sets.forEach((set, index) => {
      if (set.player1Score && set.player2Score) {
        const p1Score = parseInt(set.player1Score);
        const p2Score = parseInt(set.player2Score);

        if (!isValidTennisScore(p1Score, p2Score)) {
          newErrors.sets = `Invalid score in Set ${index + 1}. Check tennis scoring rules.`;
        }

        // Check tiebreak if needed
        if (needsTiebreak(p1Score, p2Score)) {
          if (!set.tiebreakScore || set.tiebreakScore.trim() === "") {
            newErrors.sets = `Set ${index + 1} needs tiebreak score (e.g., "7-3")`;
          }
        }
      }
    });

    if (!winner) {
      newErrors.winner = "Winner must be determined from the sets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build sets array
    const matchSets: MatchSet[] = sets
      .filter((set) => set.player1Score && set.player2Score)
      .map((set) => {
        const p1Score = parseInt(set.player1Score);
        const p2Score = parseInt(set.player2Score);
        const hasTiebreak = needsTiebreak(p1Score, p2Score);

        const setData: MatchSet = {
          player1Score: p1Score,
          player2Score: p2Score,
        };

        // Add tiebreak if present
        if (hasTiebreak && set.tiebreakScore) {
          setData.tiebreak = true;
          setData.tiebreakScore = set.tiebreakScore.trim();
        }

        return setData;
      });

    const resultData = {
      sets: matchSets,
      winner: winner,
    };

    console.log("🎾 Recording match result:", resultData);
    recordResultMutation.mutate({
      id: match._id,
      data: resultData,
    });
  };

  const handleClose = () => {
    if (!recordResultMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const updateSet = (setIndex: number, field: keyof SetData, value: string) => {
    setSets((prev) =>
      prev.map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set,
      ),
    );
  };

  const renderSetInput = (setIndex: number, set: SetData) => {
    const p1Score = parseInt(set.player1Score) || 0;
    const p2Score = parseInt(set.player2Score) || 0;
    const showTiebreak = needsTiebreak(p1Score, p2Score);
    const isValidSet =
      set.player1Score &&
      set.player2Score &&
      isValidTennisScore(p1Score, p2Score);

    return (
      <div key={setIndex} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Set {setIndex + 1}</h4>
          {isValidSet && <CheckCircle className="text-green-500" size={16} />}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Player 1 */}
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mx-auto mb-2">
              {getPlayerInitials(player1)}
            </div>
            <input
              type="number"
              min="0"
              max="7"
              value={set.player1Score}
              onChange={(e) =>
                updateSet(setIndex, "player1Score", e.target.value)
              }
              className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* VS */}
          <div className="text-center text-gray-400 font-medium">VS</div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium mx-auto mb-2">
              {getPlayerInitials(player2)}
            </div>
            <input
              type="number"
              min="0"
              max="7"
              value={set.player2Score}
              onChange={(e) =>
                updateSet(setIndex, "player2Score", e.target.value)
              }
              className="w-full text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Tiebreak Input */}
        {showTiebreak && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
              Tiebreak Score
            </label>
            <input
              type="text"
              value={set.tiebreakScore || ""}
              onChange={(e) =>
                updateSet(setIndex, "tiebreakScore", e.target.value)
              }
              className="w-full text-center border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g. 7-3"
            />
            <p className="text-xs text-gray-500 text-center mt-1">
              Enter tiebreak score (e.g., "7-3", "10-8")
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="text-green-600" size={20} />
              <span>Record Match Result</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the final score for this tennis match
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={recordResultMutation.isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getPlayerInitials(player1)}
                </div>
                <p className="text-sm font-medium mt-1">
                  {getPlayerName(player1)}
                </p>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getPlayerInitials(player2)}
                </div>
                <p className="text-sm font-medium mt-1">
                  {getPlayerName(player2)}
                </p>
              </div>
            </div>
            {match.scheduledDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>
                  {new Date(match.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {(errors.general || errors.sets || errors.winner) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="text-red-500 mt-0.5" size={16} />
              <div className="flex-1">
                {errors.general && (
                  <p className="text-red-700 text-sm">{errors.general}</p>
                )}
                {errors.sets && (
                  <p className="text-red-700 text-sm">{errors.sets}</p>
                )}
                {errors.winner && (
                  <p className="text-red-700 text-sm">{errors.winner}</p>
                )}
              </div>
            </div>
          )}

          {/* Score Input */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Match Score</h3>
            {sets.map((set, index) => renderSetInput(index, set))}
          </div>

          {/* Winner Display */}
          {winner && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="text-green-600" size={20} />
                <span className="font-medium text-green-800">
                  Winner:{" "}
                  {winner ===
                  (typeof match.player1 === "object"
                    ? match.player1._id
                    : match.player1)
                    ? getPlayerName(player1)
                    : getPlayerName(player2)}
                </span>
              </div>
            </div>
          )}

          {/* Scoring Help */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Tennis Scoring Guide:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Normal set: 6-0, 6-1, 6-2, 6-3, 6-4</li>
              <li>• Extended set: 7-5</li>
              <li>• Tiebreak set: 7-6 or 6-7 (enter tiebreak score)</li>
              <li>• Best of 3 sets (first to win 2 sets)</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={recordResultMutation.isPending}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordResultMutation.isPending || !winner}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {recordResultMutation.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Record Result</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

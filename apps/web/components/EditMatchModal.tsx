"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Save,
  Edit,
  Target,
  CheckCircle,
} from "lucide-react";
import { Match, MatchStatus, Player, Tournament, MatchSet } from "@repo/lib";
import { useUpdateMatch } from "@/lib/queries/matches";

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  match: Match | null;
  tournament: Tournament;
}

interface SetData {
  player1Score: string;
  player2Score: string;
  tiebreakScore?: string;
}

interface FormData {
  player1: string;
  player2: string;
  scheduledDate: string;
  scheduledTime: string;
  status: MatchStatus;
  notes: string;
  sets: SetData[];
  winner: string;
}

interface FormErrors {
  player1?: string;
  player2?: string;
  scheduledDate?: string;
  players?: string;
  sets?: string;
  winner?: string;
  general?: string;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  match,
  tournament,
}) => {
  const [formData, setFormData] = useState<FormData>({
    player1: "",
    player2: "",
    scheduledDate: "",
    scheduledTime: "",
    status: MatchStatus.SCHEDULED,
    notes: "",
    sets: [
      { player1Score: "", player2Score: "" },
      { player1Score: "", player2Score: "" },
      { player1Score: "", player2Score: "" },
    ],
    winner: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<"basic" | "results">("basic");

  // Populate form when match changes
  useEffect(() => {
    if (match && isOpen) {
      // Get player IDs
      const player1Id =
        typeof match.player1 === "object" ? match.player1._id : match.player1;
      const player2Id =
        typeof match.player2 === "object" ? match.player2._id : match.player2;

      // Parse scheduled date
      let dateStr = "";
      let timeStr = "";
      if (match.scheduledDate) {
        const scheduleDate = new Date(match.scheduledDate);
        // @ts-ignore
        dateStr = scheduleDate.toISOString().split("T")[0];
        // @ts-ignore
        timeStr = scheduleDate.toTimeString().split(" ")[0].slice(0, 5);
      }

      // Get winner ID
      const winnerId =
        typeof match.winner === "object"
          ? match.winner._id
          : match.winner || "";

      // Convert existing sets to SetData format
      const existingSets: SetData[] = [
        { player1Score: "", player2Score: "" },
        { player1Score: "", player2Score: "" },
        { player1Score: "", player2Score: "" },
      ];

      if (match.sets && match.sets.length > 0) {
        match.sets.forEach((set, index) => {
          if (index < 3) {
            existingSets[index] = {
              player1Score: set.player1Score.toString(),
              player2Score: set.player2Score.toString(),
              tiebreakScore: set.tiebreakScore || "",
            };
          }
        });
      }

      setFormData({
        player1: player1Id,
        player2: player2Id,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        status: match.status || MatchStatus.SCHEDULED,
        notes: match.notes || "",
        sets: existingSets,
        winner: winnerId,
      });
      setErrors({});
      setActiveTab("basic");
    }
  }, [match, isOpen]);

  const updateMatchMutation = useUpdateMatch({
    onSuccess: () => {
      console.log("✅ Match updated successfully");
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error("❌ Failed to update match:", error);
      setErrors({
        general: error.response?.data?.message || "Failed to update match",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      player1: "",
      player2: "",
      scheduledDate: "",
      scheduledTime: "",
      status: MatchStatus.SCHEDULED,
      notes: "",
      sets: [
        { player1Score: "", player2Score: "" },
        { player1Score: "", player2Score: "" },
        { player1Score: "", player2Score: "" },
      ],
      winner: "",
    });
    setErrors({});
    setActiveTab("basic");
  };

  // Tennis validation logic from RecordMatchResultModal
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
    const completedSets = formData.sets.filter(
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
      return formData.player1;
    }
    if (player2Sets >= 2) {
      return formData.player2;
    }

    return "";
  };

  // Auto-calculate winner when sets change
  useEffect(() => {
    if (formData.status === MatchStatus.COMPLETED) {
      const autoWinner = calculateWinner();
      if (autoWinner) {
        setFormData((prev) => ({ ...prev, winner: autoWinner }));
      }
    }
  }, [formData.sets, formData.status]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.player1) {
      newErrors.player1 = "Player 1 is required";
    }

    if (!formData.player2) {
      newErrors.player2 = "Player 2 is required";
    }

    if (
      formData.player1 &&
      formData.player2 &&
      formData.player1 === formData.player2
    ) {
      newErrors.players = "Players must be different";
    }

    // Check if selected players are in the tournament
    const tournamentPlayerIds =
      tournament.players?.map((p) => (typeof p === "string" ? p : p._id)) || [];

    if (formData.player1 && !tournamentPlayerIds.includes(formData.player1)) {
      newErrors.player1 = "Player 1 must be part of this tournament";
    }

    if (formData.player2 && !tournamentPlayerIds.includes(formData.player2)) {
      newErrors.player2 = "Player 2 must be part of this tournament";
    }

    // Validate sets if status is completed
    if (formData.status === MatchStatus.COMPLETED) {
      // Check if we have at least 2 completed sets
      const validSets = formData.sets.filter((set) => {
        if (!set.player1Score || !set.player2Score) return false;
        const p1Score = parseInt(set.player1Score);
        const p2Score = parseInt(set.player2Score);
        return isValidTennisScore(p1Score, p2Score);
      });

      if (validSets.length < 2) {
        newErrors.sets = "At least 2 completed sets are required";
      }

      // Validate each set
      formData.sets.forEach((set, index) => {
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

      if (!formData.winner) {
        newErrors.winner = "Winner must be determined from the sets";
      }
    }

    // Optional validation for scheduled date
    if (formData.scheduledDate) {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only validate future date for non-completed matches
      if (formData.status !== MatchStatus.COMPLETED && selectedDate < today) {
        newErrors.scheduledDate = "Scheduled date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!match || !validateForm()) {
      return;
    }

    // Combine date and time for scheduledDate
    let scheduledDateTime: string | undefined;
    if (formData.scheduledDate) {
      const dateTime = formData.scheduledTime
        ? `${formData.scheduledDate}T${formData.scheduledTime}`
        : formData.scheduledDate;
      scheduledDateTime = dateTime;
    }

    const submitData: any = {
      tournament: tournament._id,
      player1: formData.player1,
      player2: formData.player2,
      ...(scheduledDateTime && { scheduledDate: scheduledDateTime }),
      status: formData.status,
      ...(formData.notes && { notes: formData.notes }),
    };

    // Add sets and winner if match is completed
    if (formData.status === MatchStatus.COMPLETED) {
      // Build sets array like in RecordMatchResultModal
      const matchSets: MatchSet[] = formData.sets
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

      submitData.sets = matchSets;
      submitData.winner = formData.winner;
      submitData.completedDate = new Date().toISOString();
    } else {
      // Clear sets and winner if not completed
      submitData.sets = [];
      submitData.winner = null;
    }

    console.log("🔄 Updating match with data:", submitData);
    updateMatchMutation.mutate({
      id: match._id,
      data: submitData,
    });
  };

  const handleClose = () => {
    if (!updateMatchMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  // Helper functions
  const getPlayerName = (player: Player | string | undefined): string => {
    if (!player) return "Unknown Player";
    if (typeof player === "object") {
      return `${player.firstName} ${player.lastName}`;
    }
    return "Unknown Player";
  };

  const getPlayerInitials = (player: Player | null) => {
    if (!player) return "??";
    return `${player.firstName?.[0] || "?"}${player.lastName?.[0] || "?"}`;
  };

  // Get available players from tournament
  const availablePlayers = (tournament.players || []).filter(
    (player): player is Player => {
      return typeof player === "object" && player !== null;
    },
  );

  const availableForPlayer2 = availablePlayers.filter((player) => {
    return player._id !== formData.player1;
  });

  const updateSet = (setIndex: number, field: keyof SetData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sets: prev.sets.map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set,
      ),
    }));
  };

  const renderSetInput = (setIndex: number, set: SetData) => {
    const p1Score = parseInt(set.player1Score) || 0;
    const p2Score = parseInt(set.player2Score) || 0;
    const showTiebreak = needsTiebreak(p1Score, p2Score);
    const isValidSet =
      set.player1Score &&
      set.player2Score &&
      isValidTennisScore(p1Score, p2Score);

    // Get player objects for display
    const player1 = availablePlayers.find((p) => p._id === formData.player1);
    const player2 = availablePlayers.find((p) => p._id === formData.player2);

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
              {getPlayerInitials(player1 || null)}
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
              {getPlayerInitials(player2 || null)}
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

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Edit className="text-blue-600" size={20} />
              <span>Edit Match</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update match details, schedule, and results
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={updateMatchMutation.isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Match Info */}
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getPlayerInitials(
                    typeof match.player1 === "object" ? match.player1 : null,
                  )}
                </div>
                <p className="text-sm font-medium mt-1">
                  {getPlayerName(match.player1)}
                </p>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getPlayerInitials(
                    typeof match.player2 === "object" ? match.player2 : null,
                  )}
                </div>
                <p className="text-sm font-medium mt-1">
                  {getPlayerName(match.player2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  match.status === MatchStatus.COMPLETED
                    ? "bg-green-100 text-green-800"
                    : match.status === MatchStatus.IN_PROGRESS
                      ? "bg-yellow-100 text-yellow-800"
                      : match.status === MatchStatus.CANCELLED
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                }`}
              >
                {match.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex px-6">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-4 px-1 border-b-2 font-medium text-sm mr-8 ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                Basic Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "results"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Target size={16} />
                Match Results
              </div>
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Global Error */}
          {(errors.general ||
            errors.players ||
            errors.sets ||
            errors.winner) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5" size={16} />
              <div className="flex-1">
                {errors.general && (
                  <p className="text-red-700 text-sm">{errors.general}</p>
                )}
                {errors.players && (
                  <p className="text-red-700 text-sm">{errors.players}</p>
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

          {/* Basic Details Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              {/* Player Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Users size={18} />
                  Players
                </h3>

                {/* Player 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player 1 *
                  </label>
                  <select
                    value={formData.player1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        player1: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.player1 ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Player 1</option>
                    {availablePlayers.map((player) => (
                      <option key={player._id} value={player._id}>
                        {getPlayerName(player)}
                      </option>
                    ))}
                  </select>
                  {errors.player1 && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.player1}
                    </p>
                  )}
                </div>

                {/* Player 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player 2 *
                  </label>
                  <select
                    value={formData.player2}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        player2: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.player2 ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Player 2</option>
                    {availableForPlayer2.map((player) => (
                      <option key={player._id} value={player._id}>
                        {getPlayerName(player)}
                      </option>
                    ))}
                  </select>
                  {errors.player2 && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.player2}
                    </p>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={18} />
                  Schedule (Optional)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduledDate: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.scheduledDate
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.scheduledDate && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.scheduledDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduledTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as MatchStatus,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={MatchStatus.SCHEDULED}>Scheduled</option>
                  <option value={MatchStatus.IN_PROGRESS}>In Progress</option>
                  <option value={MatchStatus.COMPLETED}>Completed</option>
                  <option value={MatchStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional notes about this match..."
                />
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {formData.status !== MatchStatus.COMPLETED ? (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Match Not Completed
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set the status to "Completed" in Basic Details to record
                    results.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        status: MatchStatus.COMPLETED,
                      }));
                      setActiveTab("basic");
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Set as Completed
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Match Score
                    </h3>
                    {formData.sets.map((set, index) =>
                      renderSetInput(index, set),
                    )}
                  </div>

                  {/* Winner Display */}
                  {formData.winner && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Trophy className="text-green-600" size={20} />
                        <span className="font-medium text-green-800">
                          Winner:{" "}
                          {formData.winner === formData.player1
                            ? getPlayerName(
                                availablePlayers.find(
                                  (p) => p._id === formData.player1,
                                ),
                              )
                            : getPlayerName(
                                availablePlayers.find(
                                  (p) => p._id === formData.player2,
                                ),
                              )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Scoring Help */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={updateMatchMutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                updateMatchMutation.isPending ||
                (formData.status === MatchStatus.COMPLETED && !formData.winner)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updateMatchMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Match
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { X, Calendar, Users, Target, Trophy } from "lucide-react";
import { useCreateStage } from "@/lib/queries/stages";
import {
  useGetPlayersInTournament,
  useGetTournaments,
} from "@/lib/queries/tournaments";
import { useGetPlayers } from "@/lib/queries/players";
import { StageType } from "@repo/lib";

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTournamentId?: string;
}

export const CreateStageModal: React.FC<CreateStageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTournamentId,
}) => {
  const [formData, setFormData] = useState({
    tournament: defaultTournamentId || "",
    name: "",
    type: StageType.GROUP,
    order: 1,
    startDate: "",
    endDate: "",
    players: [] as string[],
    advancingPlayers: "",
    rules: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: tournamentsResponse } = useGetTournaments({ limit: 100 });
  const { data: playersResponse } = useGetPlayersInTournament(
    defaultTournamentId!,
  );

  const tournaments = tournamentsResponse?.data || [];
  const players = playersResponse?.data || [];

  const createStageMutation = useCreateStage({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating stage:", error);
      setErrors({ submit: "Failed to create stage. Please try again." });
    },
  });

  const resetForm = () => {
    setFormData({
      tournament: defaultTournamentId || "",
      name: "",
      type: StageType.GROUP,
      order: 1,
      startDate: "",
      endDate: "",
      players: [],
      advancingPlayers: "",
      rules: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tournament.trim()) {
      newErrors.tournament = "Tournament is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Stage name is required";
    }

    if (formData.order < 1) {
      newErrors.order = "Order must be at least 1";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    if (
      formData.advancingPlayers &&
      (isNaN(Number(formData.advancingPlayers)) ||
        Number(formData.advancingPlayers) < 0)
    ) {
      newErrors.advancingPlayers = "Must be a valid number";
    }

    if (
      formData.advancingPlayers &&
      Number(formData.advancingPlayers) > formData.players.length
    ) {
      newErrors.advancingPlayers =
        "Cannot advance more players than are in the stage";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      tournament: formData.tournament,
      name: formData.name.trim(),
      type: formData.type,
      order: formData.order,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      players: formData.players.length > 0 ? formData.players : undefined,
      advancingPlayers: formData.advancingPlayers
        ? Number(formData.advancingPlayers)
        : undefined,
      rules: formData.rules.trim() || undefined,
    };

    createStageMutation.mutate(submitData);
  };

  const handlePlayerToggle = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.includes(playerId)
        ? prev.players.filter((id) => id !== playerId)
        : [...prev.players, playerId],
    }));
  };

  const getStageTypeLabel = (type: StageType) => {
    switch (type) {
      case StageType.GROUP:
        return "Group Stage";
      case StageType.ROUND_ROBIN:
        return "Round Robin";
      case StageType.KNOCKOUT:
        return "Knockout";
      case StageType.SEMIFINALS:
        return "Semifinals";
      case StageType.FINALS:
        return "Finals";
      case StageType.CUSTOM:
        return "Custom";
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Stage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tournament Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tournament *
            </label>
            <select
              value={formData.tournament}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tournament: e.target.value }))
              }
              disabled={!!defaultTournamentId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name}
                </option>
              ))}
            </select>
            {errors.tournament && (
              <p className="mt-1 text-sm text-red-600">{errors.tournament}</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Group Stage A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as StageType,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.values(StageType).map((type) => (
                  <option key={type} value={type}>
                    {getStageTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order and Advancing Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline w-4 h-4 mr-1" />
                Stage Order *
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">{errors.order}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Advancing Players
              </label>
              <input
                type="number"
                min="0"
                value={formData.advancingPlayers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    advancingPlayers: e.target.value,
                  }))
                }
                placeholder="Optional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.advancingPlayers && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.advancingPlayers}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Players Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Select Players ({formData.players.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              {players.length === 0 ? (
                <p className="text-gray-500 text-sm">No players available</p>
              ) : (
                players.map((player) => (
                  <label
                    key={player._id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.players.includes(player._id)}
                      onChange={() => handlePlayerToggle(player._id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      {player.firstName} {player.lastName}
                      {player.ranking && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Rank #{player.ranking})
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules & Notes
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rules: e.target.value }))
              }
              placeholder="Enter any special rules or notes for this stage..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStageMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createStageMutation.isPending ? "Creating..." : "Create Stage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

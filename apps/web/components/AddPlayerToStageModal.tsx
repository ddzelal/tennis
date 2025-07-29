"use client";

import React, { useState } from "react";
import { X, User, Plus, Search, Users } from "lucide-react";
import { useAddPlayerToStage } from "@/lib/queries/stages";
import { Player } from "@repo/lib";

interface AddPlayerToStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  availablePlayers: Player[];
  onSuccess: () => void;
}

export const AddPlayerToStageModal: React.FC<AddPlayerToStageModalProps> = ({
  isOpen,
  onClose,
  stageId,
  availablePlayers,
  onSuccess,
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const addPlayerMutation = useAddPlayerToStage({
    onSuccess: () => {
      onSuccess();
      setSelectedPlayers([]);
      setSearchQuery("");
    },
    onError: (error) => {
      console.error("Error adding players to stage:", error);
      alert("Failed to add players to stage. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayers.length === 0) {
      alert("Please select at least one player to add.");
      return;
    }

    // Add players one by one
    for (const playerId of selectedPlayers) {
      try {
        await addPlayerMutation.mutateAsync({
          stageId,
          playerId,
        });
      } catch (error) {
        console.error("Error adding player:", error);
        break; // Stop on first error
      }
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const filteredPlayers = availablePlayers.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || "unknown";
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Players to Stage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search players by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Selected count */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              {selectedPlayers.length} player
              {selectedPlayers.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Players List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Players ({filteredPlayers.length})
            </label>

            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8">
                {availablePlayers.length === 0 ? (
                  <>
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No available players to add to this stage.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      All players may already be in this stage.
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No players found matching your search.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search terms.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredPlayers.map((player) => (
                  <label
                    key={player._id}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player._id)}
                      onChange={() => handlePlayerToggle(player._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(player.firstName, player.lastName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {player.firstName} {player.lastName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {player.ranking && (
                          <span className="flex-shrink-0">
                            Rank #{player.ranking}
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedPlayers.includes(player._id) && (
                      <div className="text-blue-600">
                        <Plus size={16} />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

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
              disabled={
                selectedPlayers.length === 0 || addPlayerMutation.isPending
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {addPlayerMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>
                    Add {selectedPlayers.length} Player
                    {selectedPlayers.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

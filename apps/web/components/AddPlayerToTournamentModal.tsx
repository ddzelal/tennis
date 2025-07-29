"use client";

import React, { useState } from "react";
import { X, Search, Plus, Users, Trophy } from "lucide-react";
import { Player, Tournament } from "@repo/lib";
import { useAddPlayerToTournament } from "@/lib/queries/tournaments";

interface AddPlayerToTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tournament: Tournament;
  availablePlayers: Player[];
}

export const AddPlayerToTournamentModal: React.FC<
  AddPlayerToTournamentModalProps
> = ({ isOpen, onClose, onSuccess, tournament, availablePlayers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  console.log(tournament, "Dwadwa");

  const addPlayerMutation = useAddPlayerToTournament({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error("Failed to add player to tournament:", error);
    },
  });

  const resetForm = () => {
    setSearchTerm("");
    setSelectedPlayers([]);
  };

  const handleClose = () => {
    if (!addPlayerMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const filteredPlayers = availablePlayers.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleAddPlayers = async () => {
    if (selectedPlayers.length === 0) return;

    if (!tournament || !tournament._id) {
      console.error("❌ Tournament ID is missing!", tournament);
      return;
    }

    console.log("🎾 Adding players to tournament:", {
      tournamentId: tournament._id,
      selectedPlayers,
      tournament,
    });

    try {
      // Add players one by one
      for (const playerId of selectedPlayers) {
        console.log(
          `🎾 Adding player ${playerId} to tournament ${tournament._id}`,
        );
        await addPlayerMutation.mutateAsync({
          tournamentId: tournament._id,
          playerId,
        });
      }
    } catch (error) {
      console.error("Error adding players:", error);
    }
  };

  const canAddMorePlayers = tournament?.maxPlayers
    ? (tournament.players?.length || 0) + selectedPlayers.length <
      tournament.maxPlayers
    : true;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Plus className="text-green-600" size={20} />
              <span>Add Players to Tournament</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {tournament?.name || "Unknown Tournament"} -{" "}
              {selectedPlayers.length} player(s) selected
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={addPlayerMutation.isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tournament Info */}
        <div className="p-4 bg-green-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg text-white">
              <Trophy size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {tournament?.name || "Unknown Tournament"}
              </h3>
              <p className="text-sm text-gray-600">
                Current players: {tournament?.players?.length || 0}
                {tournament?.maxPlayers && ` / ${tournament.maxPlayers}`}
              </p>
              {/* DEBUG INFO */}
              <p className="text-xs text-gray-500">
                Tournament ID: {tournament?._id || "MISSING!"}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search available players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredPlayers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No players found" : "No available players"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No players match "${searchTerm}"`
                  : "All players are already in this tournament"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player._id);
                const wouldExceedLimit = !canAddMorePlayers && !isSelected;

                return (
                  <div
                    key={player._id}
                    className={`
                                            p-3 rounded-lg border cursor-pointer transition-all
                                            ${
                                              isSelected
                                                ? "border-green-500 bg-green-50"
                                                : wouldExceedLimit
                                                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                                  : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                                            }
                                        `}
                    onClick={() =>
                      !wouldExceedLimit && togglePlayerSelection(player._id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {player.firstName?.[0]}
                          {player.lastName?.[0]}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {player.firstName} {player.lastName}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {player.ranking && (
                              <span>Rank #{player.ranking}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {wouldExceedLimit && (
                      <p className="text-xs text-red-500 mt-2">
                        Tournament is full ({tournament?.maxPlayers} players
                        max)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedPlayers.length > 0 && (
                <span>{selectedPlayers.length} player(s) selected</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={addPlayerMutation.isPending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayers}
                disabled={
                  selectedPlayers.length === 0 ||
                  addPlayerMutation.isPending ||
                  !tournament?._id
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {addPlayerMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  Add{" "}
                  {selectedPlayers.length > 0
                    ? `${selectedPlayers.length} `
                    : ""}
                  Player{selectedPlayers.length !== 1 ? "s" : ""}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

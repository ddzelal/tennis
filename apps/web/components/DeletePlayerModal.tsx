"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { X, AlertTriangle, Trophy, Calendar } from "lucide-react";
import { Player } from "@repo/lib";
import { useDeletePlayer } from "@/lib/queries";

interface DeletePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess: () => void;
}

export const DeletePlayerModal: React.FC<DeletePlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  onSuccess,
}) => {
  const deletePlayerMutation = useDeletePlayer({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Failed to delete player:", error);
    },
  });

  const handleDelete = () => {
    if (player) {
      deletePlayerMutation.mutate(player._id);
    }
  };

  const calculateAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (!isOpen || !player) return null;

  const fullName = `${player.firstName} ${player.lastName}`;
  const age = calculateAge(player.dateOfBirth);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Player
              </h2>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={deletePlayerMutation.isPending}
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Info Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials(player.firstName, player.lastName)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {fullName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{age} years old</span>
                </div>
                {player.ranking && (
                  <div className="flex items-center space-x-1">
                    <Trophy size={14} />
                    <span>Rank #{player.ranking}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{fullName}</span>?
            This action cannot be undone and will permanently remove all
            associated data.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2 flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>This will permanently remove:</span>
            </h4>
            <ul className="text-sm text-red-700 space-y-1 ml-6">
              <li>• Player profile and personal information</li>
              <li>• All tournament registrations and participations</li>
              <li>• Complete match history and results</li>
              <li>• Player statistics and performance data</li>
              <li>• Ranking history and achievements</li>
            </ul>
          </div>

          {/* Player Stats Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-gray-800 mb-2">Player Summary:</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">First Name:</span>
                <p className="font-medium">{player.firstName}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Name:</span>
                <p className="font-medium">{player.lastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Age:</span>
                <p className="font-medium">{age} years</p>
              </div>
              <div>
                <span className="text-gray-600">Ranking:</span>
                <p className="font-medium">
                  {player.ranking ? `#${player.ranking}` : "Unranked"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={deletePlayerMutation.isPending}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deletePlayerMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {deletePlayerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>Delete Player</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {deletePlayerMutation.isError && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">
                Failed to delete player. Please try again or contact support if
                the problem persists.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

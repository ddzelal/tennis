"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  Trophy,
  Info,
  CheckCircle,
  Edit,
} from "lucide-react";
import { Player } from "@repo/lib";
import { useUpdatePlayer } from "@/lib/queries/players";

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess: () => void;
}

// Local interface for form data - all fields required for form state
interface EditFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ranking?: number;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ranking?: string;
  dateInFuture?: string;
  ageTooYoung?: string;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  onClose,
  player,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    ranking: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updatePlayerMutation = useUpdatePlayer({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error("Failed to update player:", error);
      // Handle specific API errors
      if (error.response?.data?.message) {
        setErrors({
          firstName: error.response.data.message.includes("firstName")
            ? error.response.data.message
            : undefined,
          lastName: error.response.data.message.includes("lastName")
            ? error.response.data.message
            : undefined,
          dateOfBirth: error.response.data.message.includes("dateOfBirth")
            ? error.response.data.message
            : undefined,
          ranking: error.response.data.message.includes("ranking")
            ? error.response.data.message
            : undefined,
        });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      ranking: undefined,
    });
    setErrors({});
  };

  useEffect(() => {
    if (player && player.dateOfBirth) {
      setFormData({
        firstName: player.firstName ?? "",
        lastName: player.lastName ?? "",
        dateOfBirth:
          new Date(player.dateOfBirth).toISOString().split("T")[0] || "",
        ranking: player.ranking ?? undefined,
      });
      setErrors({});
    }
  }, [player]);

  const calculateAge = (dateOfBirth: string): number => {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "First name cannot exceed 50 characters";
    }

    // Last Name validation
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Last name cannot exceed 50 characters";
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();

      if (birthDate >= today) {
        newErrors.dateInFuture = "Date of birth must be in the past";
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age < 10) {
          newErrors.ageTooYoung = "Player must be at least 10 years old";
        }
      }
    }

    // Ranking validation (optional field)
    if (formData.ranking !== undefined && formData.ranking !== null) {
      if (formData.ranking < 1 || formData.ranking > 10000) {
        newErrors.ranking = "Ranking must be between 1 and 10,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !player) {
      return;
    }

    // Clean data before sending - convert to UpdatePlayerData format
    const submitData = {
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      dateOfBirth: formData.dateOfBirth,
      ...(formData.ranking && formData.ranking > 0
        ? { ranking: formData.ranking }
        : {}),
    };

    updatePlayerMutation.mutate({ id: player._id, data: submitData });
  };

  const handleClose = () => {
    if (!updatePlayerMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen || !player) return null;

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const previewName =
    `${(formData.firstName || "").trim()} ${(formData.lastName || "").trim()}`.trim();
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Edit size={20} className="text-green-600" />
              <span>Edit Player 🎾</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update player information
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={updatePlayerMutation.isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Player Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {getInitials(player.firstName, player.lastName)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Current: {player.firstName} {player.lastName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Age: {calculateAge(player.dateOfBirth)} years</span>
                {player.ranking && <span>Rank: #{player.ranking}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Player Preview */}
        {previewName && (
          <div className="px-6 py-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(formData.firstName || "", formData.lastName || "")}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Preview: {previewName}
                </h3>
                {age && (
                  <p className="text-sm text-gray-600">{age} years old</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.firstName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g. Novak"
                maxLength={50}
                disabled={updatePlayerMutation.isPending}
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <Info size={12} className="mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.lastName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g. Djokovic"
                maxLength={50}
                disabled={updatePlayerMutation.isPending}
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <Info size={12} className="mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.dateOfBirth || errors.dateInFuture || errors.ageTooYoung
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              disabled={updatePlayerMutation.isPending}
            />
            {(errors.dateOfBirth ||
              errors.dateInFuture ||
              errors.ageTooYoung) && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <Info size={12} className="mr-1" />
                {errors.dateOfBirth ||
                  errors.dateInFuture ||
                  errors.ageTooYoung}
              </p>
            )}
            {age && age >= 10 && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <CheckCircle size={12} className="mr-1" />
                Age: {age} years old
              </p>
            )}
          </div>

          {/* Ranking (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Trophy size={16} className="inline mr-1" />
              Ranking (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={formData.ranking || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  ranking: value ? parseInt(value) : undefined,
                });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.ranking ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="e.g. 15 (leave empty if unranked)"
              disabled={updatePlayerMutation.isPending}
            />
            {errors.ranking && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <Info size={12} className="mr-1" />
                {errors.ranking}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Clear field to mark player as unranked
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Info size={16} className="mr-2" />
              Edit Information
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All fields except ranking are required</li>
              <li>• Players must be at least 10 years old</li>
              <li>• Changes will be reflected immediately</li>
              <li>• Player statistics will be preserved</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={updatePlayerMutation.isPending}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                updatePlayerMutation.isPending ||
                !formData.firstName?.trim() ||
                !formData.lastName?.trim() ||
                !formData.dateOfBirth
              }
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {updatePlayerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Update Player</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error State */}
        {updatePlayerMutation.isError && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center">
                <Info size={14} className="mr-2" />
                Failed to update player. Please check your input and try again.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

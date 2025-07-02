
'use client';

import React, { useState } from 'react';
import { X, Trophy, Calendar, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Tournament, Player, MatchStatus } from '@repo/lib';
import { useCreateMatch } from '@/lib/queries/matches';

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tournament: Tournament;
}

interface FormData {
    player1: string;
    player2: string;
    scheduledDate: string;
    scheduledTime: string;
    status: MatchStatus;
    notes: string;
}

interface FormErrors {
    player1?: string;
    player2?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    players?: string;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onSuccess,
                                                                      tournament
                                                                  }) => {
    const [formData, setFormData] = useState<FormData>({
        player1: '',
        player2: '',
        scheduledDate: '',
        scheduledTime: '',
        status: MatchStatus.SCHEDULED,
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const createMatchMutation = useCreateMatch({
        onSuccess: () => {
            console.log('✅ Match created successfully');
            onSuccess();
            resetForm();
        },
        onError: (error: any) => {
            console.error('❌ Failed to create match:', error);
            if (error.response?.data?.message) {
                setErrors({
                    players: error.response.data.message
                });
            }
        }
    });

    const resetForm = () => {
        setFormData({
            player1: '',
            player2: '',
            scheduledDate: '',
            scheduledTime: '',
            status: MatchStatus.SCHEDULED,
            notes: ''
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.player1) {
            newErrors.player1 = 'Player 1 is required';
        }

        if (!formData.player2) {
            newErrors.player2 = 'Player 2 is required';
        }

        if (formData.player1 && formData.player2 && formData.player1 === formData.player2) {
            newErrors.players = 'Players must be different';
        }

        // Check if selected players are in the tournament
        const tournamentPlayerIds = tournament.players?.map(p =>
            typeof p === 'string' ? p : p._id
        ) || [];

        if (formData.player1 && !tournamentPlayerIds.includes(formData.player1)) {
            newErrors.player1 = 'Player 1 must be part of this tournament';
        }

        if (formData.player2 && !tournamentPlayerIds.includes(formData.player2)) {
            newErrors.player2 = 'Player 2 must be part of this tournament';
        }

        // Optional validation for scheduled date (if provided, must be in future)
        if (formData.scheduledDate) {
            const selectedDate = new Date(formData.scheduledDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.scheduledDate = 'Scheduled date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
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

        const submitData = {
            tournament: tournament._id,
            player1: formData.player1,
            player2: formData.player2,
            ...(scheduledDateTime && { scheduledDate: scheduledDateTime }),
            status: formData.status
        };

        console.log('🚀 Creating match with data:', submitData);
        createMatchMutation.mutate(submitData);
    };

    const handleClose = () => {
        if (!createMatchMutation.isPending) {
            resetForm();
            onClose();
        }
    };

    // ✅ HELPER FUNCTIONS SA TYPE SAFETY
    const getPlayerName = (player: Player | string | undefined): string => {
        if (!player) return 'Unknown Player';
        if (typeof player === 'object') {
            return `${player.firstName} ${player.lastName}`;
        }
        return 'Unknown Player';
    };

    const getPlayerInitials = (player: Player | string | undefined): string => {
        if (!player) return '??';
        if (typeof player === 'object') {
            return `${player.firstName?.[0] || '?'}${player.lastName?.[0] || '?'}`;
        }
        return '??';
    };

    // ✅ SAFE PLAYER FINDING
    const findPlayerById = (playerId: string): Player | undefined => {
        return availablePlayers.find(p => {
            const id = typeof p === 'string' ? p : p._id;
            return id === playerId;
        }) as Player | undefined;
    };

    // Get available players from tournament - ENSURE THEY ARE PLAYER OBJECTS
    const availablePlayers = (tournament.players || []).filter((player): player is Player => {
        return typeof player === 'object' && player !== null;
    });

    const availableForPlayer2 = availablePlayers.filter(player => {
        const playerId = player._id;
        return playerId !== formData.player1;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <Trophy className="text-green-600" size={20} />
                            <span>Create New Match</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Schedule a match between tournament players
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={createMatchMutation.isPending}
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
                            <h3 className="font-medium text-gray-900">{tournament.name}</h3>
                            <p className="text-sm text-gray-600">
                                {availablePlayers.length} players available
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Global Error */}
                    {errors.players && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={16} />
                            <span className="text-red-700 text-sm">{errors.players}</span>
                        </div>
                    )}

                    {/* Player Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <Users size={18} />
                            Select Players
                        </h3>

                        {/* Player 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Player 1 *
                            </label>
                            <select
                                value={formData.player1}
                                onChange={(e) => setFormData(prev => ({ ...prev, player1: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.player1 ? 'border-red-300' : 'border-gray-300'
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
                                <p className="text-red-500 text-xs mt-1">{errors.player1}</p>
                            )}
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-3">
                                {formData.player1 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {getPlayerInitials(findPlayerById(formData.player1))}
                                        </div>
                                    </div>
                                )}
                                <span className="text-gray-400 font-bold text-lg">VS</span>
                                {formData.player2 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {getPlayerInitials(findPlayerById(formData.player2))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Player 2 *
                            </label>
                            <select
                                value={formData.player2}
                                onChange={(e) => setFormData(prev => ({ ...prev, player2: e.target.value }))}
                                disabled={!formData.player1}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                    errors.player2 ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">
                                    {!formData.player1 ? 'Select Player 1 first' : 'Select Player 2'}
                                </option>
                                {availableForPlayer2.map((player) => (
                                    <option key={player._id} value={player._id}>
                                        {getPlayerName(player)}
                                    </option>
                                ))}
                            </select>
                            {errors.player2 && (
                                <p className="text-red-500 text-xs mt-1">{errors.player2}</p>
                            )}
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <Calendar size={18} />
                            Schedule (Optional)
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Scheduled Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.scheduledDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>
                                )}
                            </div>

                            {/* Scheduled Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                    disabled={!formData.scheduledDate}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Match Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MatchStatus }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value={MatchStatus.SCHEDULED}>Scheduled</option>
                            <option value={MatchStatus.IN_PROGRESS}>In Progress</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Add any additional notes about this match..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>

                    {/* Match Preview */}
                    {formData.player1 && formData.player2 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                <CheckCircle size={16} />
                                Match Preview
                            </h4>
                            <div className="text-sm text-green-800">
                                <p className="font-medium">
                                    {getPlayerName(findPlayerById(formData.player1))}
                                    {' vs '}
                                    {getPlayerName(findPlayerById(formData.player2))}
                                </p>
                                {formData.scheduledDate && (
                                    <p>
                                        Scheduled: {new Date(formData.scheduledDate + (formData.scheduledTime ? `T${formData.scheduledTime}` : '')).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        ...(formData.scheduledTime && {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    })}
                                    </p>
                                )}
                                <p>Status: {formData.status}</p>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={createMatchMutation.isPending}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMatchMutation.isPending || !formData.player1 || !formData.player2}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {createMatchMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Trophy size={16} />
                                    Create Match
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
'use client';

import React from 'react';
import { X, AlertTriangle, Trophy, Calendar, Users, Info } from 'lucide-react';
import { Tournament, TournamentStatus } from '@repo/lib';
import { useDeleteTournament } from '@/lib/queries/tournaments';

interface DeleteTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournament: Tournament | null;
    onSuccess: () => void;
}

export const DeleteTournamentModal: React.FC<DeleteTournamentModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                tournament,
                                                                                onSuccess
                                                                            }) => {

    const deleteTournamentMutation = useDeleteTournament({
        onSuccess: () => {
            onSuccess();
        },
        onError: (error: any) => {
            console.error('Failed to delete tournament:', error);
        }
    });

    const handleDelete = () => {
        if (tournament) {
            deleteTournamentMutation.mutate(tournament._id);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: TournamentStatus }) => {
        const colors = {
            [TournamentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
            [TournamentStatus.REGISTRATION]: 'bg-blue-100 text-blue-800',
            [TournamentStatus.IN_PROGRESS]: 'bg-green-100 text-green-800',
            [TournamentStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
            [TournamentStatus.CANCELLED]: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
                {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
            </span>
        );
    };

    if (!isOpen || !tournament) return null;

    const playersCount = Array.isArray(tournament.players) ? tournament.players.length : 0;
    const isActiveTournament = tournament.status === TournamentStatus.IN_PROGRESS ||
        tournament.status === TournamentStatus.REGISTRATION;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Delete Tournament</h2>
                            <p className="text-sm text-gray-500">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={deleteTournamentMutation.isPending}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tournament Info Section */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(tournament.name)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {tournament.name}
                            </h3>
                            {tournament.description && (
                                <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                                <StatusBadge status={tournament.status} />
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                    {tournament.type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-gray-900">
                            {tournament.name}
                        </span>
                        ? This action cannot be undone and will permanently remove all associated data.
                    </p>

                    {/* Warning for active tournaments */}
                    {isActiveTournament && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-yellow-800 mb-2 flex items-center space-x-2">
                                <AlertTriangle size={16} />
                                <span>Active Tournament Warning!</span>
                            </h4>
                            <p className="text-sm text-yellow-700">
                                This tournament is currently {tournament.status.toLowerCase().replace('_', ' ')}.
                                Deleting it will affect all registered players and ongoing matches.
                            </p>
                        </div>
                    )}

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center space-x-2">
                            <AlertTriangle size={16} />
                            <span>This will permanently remove:</span>
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1 ml-6">
                            <li>• Tournament configuration and settings</li>
                            <li>• All player registrations and participations</li>
                            <li>• Complete match history and results</li>
                            <li>• Tournament statistics and rankings</li>
                            <li>• All stages and brackets data</li>
                            <li>• Historical tournament data</li>
                        </ul>
                    </div>

                    {/* Tournament Stats Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h5 className="font-medium text-gray-800 mb-3">Tournament Summary:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <Trophy size={16} className="text-gray-400" />
                                <div>
                                    <span className="text-gray-600">Type:</span>
                                    <p className="font-medium">{tournament.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Info size={16} className="text-gray-400" />
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <p className="font-medium">{tournament.status.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users size={16} className="text-gray-400" />
                                <div>
                                    <span className="text-gray-600">Players:</span>
                                    <p className="font-medium">
                                        {playersCount}{tournament.maxPlayers && ` / ${tournament.maxPlayers}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-gray-400" />
                                <div>
                                    <span className="text-gray-600">Start Date:</span>
                                    <p className="font-medium">
                                        {tournament.startDate ? formatDate(tournament.startDate) : 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            disabled={deleteTournamentMutation.isPending}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleteTournamentMutation.isPending}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {deleteTournamentMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={16} />
                                    <span>Delete Tournament</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {deleteTournamentMutation.isError && (
                    <div className="px-6 pb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 flex items-center">
                                <Info size={14} className="mr-2" />
                                Failed to delete tournament. Please try again or contact support if the problem persists.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
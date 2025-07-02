'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Trophy,
    Users,
    Calendar,
    Settings,
    Plus,
    UserMinus,
    ArrowLeft,
    Star,
    Clock,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useGetTournament, useGetPlayers } from '@/lib/queries';
import { useRemovePlayerFromTournament } from '@/lib/queries/tournaments';
import { AddPlayerToTournamentModal } from '@/components/AddPlayerToTournamentModal';

export default function TournamentDetailsPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);

    console.log('🎾 Tournament ID from params:', tournamentId);

    const { data: tournament, isLoading, error, refetch } = useGetTournament(tournamentId);
    const { data: playersResponse } = useGetPlayers({ limit: 100 });

    // REMOVE PLAYER MUTATION
    const removePlayerMutation = useRemovePlayerFromTournament({
        onSuccess: () => {
            console.log('✅ Player removed successfully');
            setRemovingPlayerId(null);
            refetch(); // Refresh tournament data
        },
        onError: (error: any) => {
            console.error('❌ Failed to remove player:', error);
            setRemovingPlayerId(null);
            // TODO: Show error toast/notification
        }
    });

    console.log('🎾 Tournament data:', tournament);
    console.log('🎾 Is modal open:', isAddPlayerModalOpen);

    if (error || !tournament) {
        return (
            <div className="p-4 lg:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Tournament Not Found</h2>
                    <p className="text-red-600 mb-4">The tournament you're looking for doesn't exist.</p>
                    <Link
                        href="/dashboard/tournaments"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    const players = tournament.players || [];
    const allPlayers = playersResponse?.data || [];

    // SAFE FALLBACK VALUES
    const tournamentType = tournament.type || 'LEAGUE';
    const tournamentStatus = tournament.status || 'DRAFT';

    const handleAddPlayerSuccess = () => {
        setIsAddPlayerModalOpen(false);
        refetch();
    };

    // HANDLE REMOVE PLAYER
    const handleRemovePlayer = async (playerId: string, playerName: string) => {
        // Show confirmation
        const confirmed = window.confirm(
            `Are you sure you want to remove ${playerName} from this tournament?`
        );

        if (!confirmed) return;

        console.log('🎾 Removing player:', { tournamentId, playerId, playerName });

        try {
            setRemovingPlayerId(playerId);
            await removePlayerMutation.mutateAsync({
                tournamentId,
                playerId
            });
        } catch (error) {
            console.error('❌ Error removing player:', error);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
            {/* Header - ISTI STIL KAO TOURNAMENT LISTING */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                        <Link
                            href="/dashboard/tournaments"
                            className="mt-1 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{tournament.name} 🏆</h1>
                            <p className="text-green-100">
                                {tournament.description || 'Tournament details and player management'}
                            </p>
                            {/* DEBUG INFO */}
                            <p className="text-xs text-green-200 mt-1">
                                Tournament ID: {tournament._id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            console.log('🎾 Opening modal with tournament:', tournament);
                            setIsAddPlayerModalOpen(true);
                        }}
                        className="mt-4 lg:mt-0 bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Add Player</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - ISTI STIL KAO TOURNAMENT LISTING */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            Players
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{players.length}</h3>
                    <p className="text-sm text-gray-600">
                        {tournament.maxPlayers ? `of ${tournament.maxPlayers} max` : 'Registered'}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                            <Trophy size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Matches
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">0</h3>
                    <p className="text-sm text-gray-600">Completed</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-yellow-500 text-white">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Start Date
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {tournament.startDate
                            ? new Date(tournament.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })
                            : 'TBD'
                        }
                    </h3>
                    <p className="text-sm text-gray-600">Tournament Date</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                            <Settings size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            Format
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {tournament.settings?.setsToWin ? `Best of ${tournament.settings.setsToWin}` : 'Standard'}
                    </h3>
                    <p className="text-sm text-gray-600">Match Format</p>
                </div>
            </div>

            {/* Tournament Info - ISTI STIL KAO SEARCH AND FILTERS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:space-x-4">
                    {/* Tournament Type & Status */}
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                                Type: {tournamentType.replace('_', ' ')}
                            </span>
                            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                Status: {tournamentStatus.replace('_', ' ')}
                            </span>
                            {tournament.maxPlayers && (
                                <span className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                                    Max: {tournament.maxPlayers} Players
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tournament Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Generate Brackets
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Tournament Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Players Content - UPDATED WITH REMOVE FUNCTIONALITY */}
            {isLoading ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tournament...</p>
                </div>
            ) : players.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Yet</h3>
                    <p className="text-gray-600 mb-4">
                        Add players to start the tournament
                    </p>
                    <button
                        onClick={() => setIsAddPlayerModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Add First Player
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Tournament Players ({players.length})</h2>
                            <button
                                onClick={() => setIsAddPlayerModalOpen(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus size={16} />
                                <span>Add Player</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {players.map((player: any) => {
                                const isRemoving = removingPlayerId === player._id;
                                const playerName = `${player.firstName} ${player.lastName}`;

                                return (
                                    <div key={player._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {player.firstName?.[0]}{player.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {playerName}
                                                    </h4>
                                                    {player.ranking && (
                                                        <div className="flex items-center space-x-1">
                                                            <Star size={12} className="text-yellow-500" />
                                                            <p className="text-sm text-gray-600">Rank #{player.ranking}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* REMOVE BUTTON WITH LOADING STATE */}
                                            <button
                                                onClick={() => handleRemovePlayer(player._id, playerName)}
                                                disabled={isRemoving || removePlayerMutation.isPending}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={`Remove ${playerName} from tournament`}
                                            >
                                                {isRemoving ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                ) : (
                                                    <UserMinus size={16} />
                                                )}
                                            </button>
                                        </div>

                                        {/* LOADING OVERLAY */}
                                        {isRemoving && (
                                            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                                                <AlertTriangle size={14} />
                                                <span>Removing player...</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {tournament && (
                <AddPlayerToTournamentModal
                    isOpen={isAddPlayerModalOpen}
                    onClose={() => setIsAddPlayerModalOpen(false)}
                    tournament={tournament}
                    availablePlayers={allPlayers.filter(p =>
                        !players.some((tp: any) => tp._id === p._id)
                    )}
                    onSuccess={handleAddPlayerSuccess}
                />
            )}
        </div>
    );
}
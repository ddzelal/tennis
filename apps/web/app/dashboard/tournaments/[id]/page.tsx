'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Users,
    Settings,
    Trophy,
    Plus,
    Edit,
    UserPlus,
    Target,
    Activity,
    Star, Trash2
} from 'lucide-react';
import Link from 'next/link';
import {useGetTournament, useRemovePlayerFromTournament} from '@/lib/queries/tournaments';
import { useGetPlayers } from '@/lib/queries/players';
import { EditTournamentModal } from '@/components/EditTournamentModal';
import { DeleteTournamentModal } from '@/components/DeleteTournamentModal';
import { AddPlayerToTournamentModal } from '@/components/AddPlayerToTournamentModal';
import { MatchTable } from '@/components/MatchTable';
import { CreateMatchModal } from '@/components/CreateMatchModal';
import { Match } from '@repo/lib';

export default function TournamentDetailsPage() {
    const params = useParams();
    const tournamentId = params.id as string;

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
    const [selectedMatchForResult, setSelectedMatchForResult] = useState<Match | null>(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'matches'>('overview');

    // Fetch tournament data
    const { data: tournament, isLoading, error, refetch } = useGetTournament(tournamentId);

    // Fetch all players to show available ones
    const { data: allPlayersData } = useGetPlayers();
    const allPlayers = allPlayersData?.data || [];

    const removePlayerMutation = useRemovePlayerFromTournament({
        onSuccess: () => {
            refetch(); // Refresh tournament data
        },
        onError: (error) => {
            console.error('Error removing player:', error);
            alert('Failed to remove player from tournament');
        }
    });


    const handleRemovePlayer = async (playerId: string) => {
        if (confirm('Are you sure you want to remove this player from the tournament?')) {
            try {
                await removePlayerMutation.mutateAsync({
                    tournamentId,
                    playerId
                });
            } catch (error) {
                console.error('Error removing player:', error);
            }
        }
    };

    const handleModalSuccess = () => {
        refetch();
    };

    // Get players that are NOT already in the tournament
    const getAvailablePlayers = () => {
        if (!tournament || !allPlayers) return [];

        const tournamentPlayerIds = tournament.players?.map(player =>
            typeof player === 'string' ? player : player._id
        ) || [];

        return allPlayers.filter(player => !tournamentPlayerIds.includes(player._id));
    };

    const availablePlayers = getAvailablePlayers();

    if (isLoading) {
        return (
            <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
                <div className="bg-white rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tournament details...</p>
                </div>
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
                <div className="bg-white rounded-xl p-8 text-center">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Tournament Not Found</h1>
                    <p className="text-gray-600 mb-4">
                        The tournament you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/dashboard/tournaments"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const playersCount = tournament.players?.length || 0;
    const maxPlayersText = tournament.maxPlayers ? `/ ${tournament.maxPlayers}` : '';

    // Calculate stats for the cards
    const stats = {
        totalPlayers: playersCount,
        availablePlayers: availablePlayers.length,
        matches: 0, // TODO: Get from matches API
        settings: tournament.settings ? 'Configured' : 'Not Set'
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
            {/* Header - same style as Players page */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/tournaments"
                            className="p-2 hover:bg-green-500 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{tournament.name} 🏆</h1>
                            <p className="text-green-100">
                                {tournament.description || 'Tournament management and details'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                        <button
                            onClick={() => setIsAddPlayerModalOpen(true)}
                            disabled={availablePlayers.length === 0}
                            className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={availablePlayers.length === 0 ? 'No available players to add' : 'Add player to tournament'}
                        >
                            <UserPlus size={16} />
                            <span>Add Player</span>
                        </button>
                        <button
                            onClick={() => setIsCreateMatchModalOpen(true)}
                            disabled={playersCount < 2}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={playersCount < 2 ? 'Need at least 2 players to create matches' : 'Create new match'}
                        >
                            <Plus size={16} />
                            <span>Create Match</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards - same style as Players page */}
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
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</h3>
                    <p className="text-sm text-gray-600">Total Players</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                            <UserPlus size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Available
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.availablePlayers}</h3>
                    <p className="text-sm text-gray-600">Can Add</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-yellow-500 text-white">
                            <Trophy size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Type
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tournament.type}</h3>
                    <p className="text-sm text-gray-600">Tournament</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                            <Settings size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            Config
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tournament.settings ? '✓' : '✗'}</h3>
                    <p className="text-sm text-gray-600">{stats.settings}</p>
                </div>
            </div>

            {/* Navigation Tabs - same style as Players page */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Activity size={16} />
                                Overview
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('players')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'players'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                Players ({playersCount})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'matches'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Trophy size={16} />
                                Matches
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tournament Settings */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Settings size={18} />
                                        Tournament Settings
                                    </h3>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Sets to Win</span>
                                        <p className="font-medium text-lg">{tournament.settings?.setsToWin || 'Not set'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Games per Set</span>
                                        <p className="font-medium text-lg">{tournament.settings?.gamesPerSet || 'Not set'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Tie Break</span>
                                        <p className="font-medium text-lg">
                                            {tournament.settings?.tieBreak ? '✅ Enabled' : '❌ Disabled'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Points System</span>
                                        <p className="font-medium text-lg">
                                            {tournament.settings?.pointsPerWin || 0}W /
                                            {tournament.settings?.pointsPerDraw || 0}D /
                                            {tournament.settings?.pointsPerLoss || 0}L
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Players</span>
                                        <span className="font-semibold">{playersCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Available to Add</span>
                                        <span className="font-semibold">{availablePlayers.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tournament Type</span>
                                        <span className="font-semibold">{tournament.type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status</span>
                                        <span className="font-semibold">{tournament.status}</span>
                                    </div>
                                    {tournament.startDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Start Date</span>
                                            <span className="font-semibold">{formatDate(tournament.startDate)}</span>
                                        </div>
                                    )}
                                    {tournament.endDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">End Date</span>
                                            <span className="font-semibold">{formatDate(tournament.endDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Players Tab */}
                {activeTab === 'players' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={18} />
                                Tournament Players ({playersCount})
                            </h3>
                            <button
                                onClick={() => setIsAddPlayerModalOpen(true)}
                                disabled={availablePlayers.length === 0}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={availablePlayers.length === 0 ? 'No available players to add' : 'Add player to tournament'}
                            >
                                <Plus size={16} />
                                Add Player
                            </button>
                        </div>

                        {playersCount === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Players Yet</h4>
                                <p className="text-gray-600 mb-4">Add players to start organizing matches</p>
                                {availablePlayers.length > 0 ? (
                                    <button
                                        onClick={() => setIsAddPlayerModalOpen(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Add First Player
                                    </button>
                                ) : (
                                    <p className="text-gray-500 text-sm">No available players in the system.</p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tournament.players?.map((player, index) => {
                                    const playerData = typeof player === 'object' ? player : null;
                                    if (!playerData) return null;

                                    return (
                                        <div key={playerData._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {getInitials(`${playerData.firstName} ${playerData.lastName}`)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {playerData.firstName} {playerData.lastName}
                                                    </h4>
                                                    {playerData.ranking && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Star size={12} />
                                                            Ranking: {playerData.ranking}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePlayer(playerData._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove player from tournament"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Matches Tab */}
                {activeTab === 'matches' && (
                    <MatchTable
                        tournament={tournament}
                        tournamentId={tournamentId}
                        onCreateMatch={() => setIsCreateMatchModalOpen(true)}
                        onEditMatch={(match) => {
                            // TODO: Implement edit match modal
                            console.log('Edit match:', match);
                        }}
                        onRecordResult={(match) => {
                            setSelectedMatchForResult(match);
                            // TODO: Implement record result modal
                            console.log('Record result for match:', match);
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            <EditTournamentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleModalSuccess}
                tournament={tournament}
            />

            <DeleteTournamentModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => {
                    // Redirect to a tournament list after deletion
                    window.location.href = '/dashboard/tournaments';
                }}
                tournament={tournament}
            />

            <AddPlayerToTournamentModal
                isOpen={isAddPlayerModalOpen}
                onClose={() => setIsAddPlayerModalOpen(false)}
                onSuccess={handleModalSuccess}
                tournament={tournament}
                availablePlayers={availablePlayers}
            />

            <CreateMatchModal
                isOpen={isCreateMatchModalOpen}
                onClose={() => setIsCreateMatchModalOpen(false)}
                onSuccess={() => {
                    setIsCreateMatchModalOpen(false);
                    handleModalSuccess();
                }}
                tournament={tournament}
            />
        </div>
    );
}
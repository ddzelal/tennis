
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
    Star,
    Trash2,
    UserMinus,
    PlayCircle,
    MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useGetTournament, useRemovePlayerFromTournament } from '@/lib/queries/tournaments';
import { useGetStagesByTournament } from '@/lib/queries/stages';
import { useGetPlayers } from '@/lib/queries/players';
import { useGetMatchesByTournament } from '@/lib/queries/matches';
import { EditTournamentModal } from '@/components/EditTournamentModal';
import { DeleteTournamentModal } from '@/components/DeleteTournamentModal';
import { AddPlayerToTournamentModal } from '@/components/AddPlayerToTournamentModal';
import { CreateStageModal } from '@/components/CreateStageModal';
import { EditStageModal } from '@/components/EditStageModal';
import { DeleteStageModal } from '@/components/DeleteStageModal';
import { Stage, StageType } from '@repo/lib';

export default function TournamentDetailsPage() {
    const params = useParams();
    const tournamentId = params.id as string;

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [isCreateStageModalOpen, setIsCreateStageModalOpen] = useState(false);
    const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
    const [isDeleteStageModalOpen, setIsDeleteStageModalOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
    const [openStageDropdown, setOpenStageDropdown] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'stages' | 'matches'>('overview');

    // Fetch tournament data
    const { data: tournament, isLoading, error, refetch } = useGetTournament(tournamentId);

    // Fetch stages for this tournament
    const { data: stagesResponse, refetch: refetchStages } = useGetStagesByTournament(tournamentId);
    const stages = stagesResponse?.data || [];

    // Fetch all players to show available ones
    const { data: allPlayersData } = useGetPlayers();
    const allPlayers = allPlayersData?.data || [];

    // Fetch matches for this tournament
    const { data: matchesResponse, isLoading: isMatchesLoading } = useGetMatchesByTournament(tournamentId,{
        limit:999
    });
    const matches = matchesResponse?.data || [];

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
        refetchStages();
    };

    const handleEditStage = (stage: Stage) => {
        setSelectedStage(stage);
        setIsEditStageModalOpen(true);
        setOpenStageDropdown(null);
    };

    const handleDeleteStage = (stage: Stage) => {
        setSelectedStage(stage);
        setIsDeleteStageModalOpen(true);
        setOpenStageDropdown(null);
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

    const formatDateTime = (date: string | Date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getTournamentStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getStageTypeColor = (type: StageType) => {
        switch (type) {
            case StageType.GROUP:
                return 'bg-blue-100 text-blue-800';
            case StageType.ROUND_ROBIN:
                return 'bg-green-100 text-green-800';
            case StageType.KNOCKOUT:
                return 'bg-red-100 text-red-800';
            case StageType.SEMIFINALS:
                return 'bg-orange-100 text-orange-800';
            case StageType.FINALS:
                return 'bg-indigo-100 text-indigo-800';
            case StageType.CUSTOM:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-500';
        }
    };

    const getStageTypeLabel = (type: StageType) => {
        switch (type) {
            case StageType.GROUP:
                return 'Group Stage';
            case StageType.ROUND_ROBIN:
                return 'Round Robin';
            case StageType.KNOCKOUT:
                return 'Knockout';
            case StageType.SEMIFINALS:
                return 'Semifinals';
            case StageType.FINALS:
                return 'Finals';
            case StageType.CUSTOM:
                return 'Custom';
            default:
                return type;
        }
    };

    const getStageStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-600';
            case 'ACTIVE':
                return 'bg-green-100 text-green-600';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-600';
            case 'CANCELLED':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const playersCount = tournament.players.length || 0;
    const stagesCount = stages.length;

    // Calculate stats for the cards
    const stats = {
        totalPlayers: playersCount,
        maxPlayers: tournament.maxPlayers,
        stages: stagesCount,
        currentStage: tournament.currentStage
    };

    const sortedStages = [...stages].sort((a, b) => a.order - b.order);

    return (
        <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
            {/* Header */}
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
                            disabled={availablePlayers.length === 0 || playersCount >= (tournament?.maxPlayers || 0)}
                            className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                                playersCount >= (tournament?.maxPlayers || 0)
                                    ? 'Tournament is full'
                                    : availablePlayers.length === 0
                                        ? 'No available players to add'
                                        : 'Add player to tournament'
                            }
                        >
                            <UserPlus size={16} />
                            <span>Add Player</span>
                        </button>
                        <button
                            onClick={() => setIsCreateStageModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} />
                            <span>Create Stage</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
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
                    <p className="text-sm text-gray-600">of {stats.maxPlayers} max</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                            <Target size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Stages
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.stages}</h3>
                    <p className="text-sm text-gray-600">Created</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-yellow-500 text-white">
                            <Activity size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Current
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.currentStage}</h3>
                    <p className="text-sm text-gray-600">Stage</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                            <Settings size={20} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTournamentStatusColor(tournament.status)}`}>
                            {tournament.status}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {tournament.status ? 'Active' : tournament.status ? 'Done' : 'Pending'}
                    </h3>
                    <p className="text-sm text-gray-600">Status</p>
                </div>
            </div>

            {/* Navigation Tabs - dodato Matches tab */}
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
                            onClick={() => setActiveTab('stages')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'stages'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Target size={16} />
                                Stages ({stagesCount})
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
                                <PlayCircle size={16} />
                                Matches ({matches.length})
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
                                {tournament.players?.map((player) => {
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
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Stages Tab */}
                {activeTab === 'stages' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Target size={18} />
                                Tournament Stages ({stagesCount})
                            </h3>
                            <button
                                onClick={() => setIsCreateStageModalOpen(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Create Stage
                            </button>
                        </div>

                        {stagesCount === 0 ? (
                            <div className="text-center py-12">
                                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Stages Created</h4>
                                <p className="text-gray-600 mb-4">Create stages to organize your tournament</p>
                                <button
                                    onClick={() => setIsCreateStageModalOpen(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create First Stage
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedStages.map((stage) => {
                                    const playersInStage = stage.players.length || 0;

                                    return (
                                        <div key={stage._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        #{stage.order}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageTypeColor(stage.type)}`}>
                                                                {getStageTypeLabel(stage.type)}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageStatusColor(stage.status)}`}>
                                                                {stage.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span className="flex items-center space-x-1">
                                                                <Users size={14} />
                                                                <span>{playersInStage} players</span>
                                                            </span>
                                                            {stage.startDate && (
                                                                <span className="flex items-center space-x-1">
                                                                    <Calendar size={14} />
                                                                    <span>{formatDate(stage.startDate)}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/dashboard/stages/${stage._id}`}
                                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                                                    >
                                                        <PlayCircle size={14} />
                                                        Manage
                                                    </Link>

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenStageDropdown(openStageDropdown === stage._id ? null : stage._id)}
                                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical size={16} className="text-gray-500" />
                                                        </button>

                                                        {openStageDropdown === stage._id && (
                                                            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                                <button
                                                                    onClick={() => handleEditStage(stage)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                                >
                                                                    <Edit size={14} />
                                                                    <span>Edit Stage</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteStage(stage)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Delete Stage</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Matches Tab - NOVA SEKCIJA */}
                {activeTab === 'matches' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <PlayCircle size={18} />
                                Tournament Matches ({matches.length})
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {matches.filter(m => m.status === 'COMPLETED').length} completed
                                </span>
                            </div>
                        </div>

                        {isMatchesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="text-center py-12">
                                <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Matches Found</h4>
                                <p className="text-gray-600 mb-4">
                                    Matches will appear here once they are created for this tournament
                                </p>
                                <p className="text-sm text-gray-500">
                                    Create stages and add players to start organizing matches
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {matches.map((match) => {
                                    const player1 = typeof match.player1 === 'string' ? null : match.player1;
                                    const player2 = typeof match.player2 === 'string' ? null : match.player2;
                                    const winner = typeof match.winner === 'string' ? null : match.winner;
                                    const stage = typeof match.stage === 'string' ? null : match.stage;

                                    return (
                                        <div
                                            key={match._id}
                                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        match.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : match.status === 'IN_PROGRESS'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : match.status === 'SCHEDULED'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {match.status.replace('_', ' ')}
                                                    </span>
                                                    {stage && (
                                                        <span className="text-sm text-gray-600">
                                                            {stage.name}
                                                        </span>
                                                    )}
                                                    {match.round && (
                                                        <span className="text-sm text-gray-600">
                                                            Round {match.round}
                                                        </span>
                                                    )}
                                                </div>
                                                {match.scheduledDate && (
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateTime(match.scheduledDate)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {/* Player 1 */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                                                            {player1 ? getInitials(`${player1.firstName} ${player1.lastName}`) : 'P1'}
                                                        </div>
                                                        <span className={`font-medium ${
                                                            winner && winner._id === (player1?._id || match.player1)
                                                                ? 'text-green-600'
                                                                : 'text-gray-900'
                                                        }`}>
                                                            {player1 ? `${player1.firstName} ${player1.lastName}` : 'Player 1'}
                                                        </span>
                                                        {winner && winner._id === (player1?._id || match.player1) && (
                                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                        )}
                                                    </div>

                                                    <span className="text-gray-400 font-medium">vs</span>

                                                    {/* Player 2 */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-medium">
                                                            {player2 ? getInitials(`${player2.firstName} ${player2.lastName}`) : 'P2'}
                                                        </div>
                                                        <span className={`font-medium ${
                                                            winner && winner._id === (player2?._id || match.player2)
                                                                ? 'text-green-600'
                                                                : 'text-gray-900'
                                                        }`}>
                                                            {player2 ? `${player2.firstName} ${player2.lastName}` : 'Player 2'}
                                                        </span>
                                                        {winner && winner._id === (player2?._id || match.player2) && (
                                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Match Sets/Score */}
                                                {match.sets && match.sets.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        {match.sets.map((set, index) => (
                                                            <div key={index} className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                                                {set.player1Score}-{set.player2Score}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {match.notes && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">{match.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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

            <CreateStageModal
                isOpen={isCreateStageModalOpen}
                onClose={() => setIsCreateStageModalOpen(false)}
                onSuccess={handleModalSuccess}
                defaultTournamentId={tournamentId}
            />

            {selectedStage && (
                <>
                    <EditStageModal
                        isOpen={isEditStageModalOpen}
                        onClose={() => {
                            setIsEditStageModalOpen(false);
                            setSelectedStage(null);
                        }}
                        stage={selectedStage}
                        onSuccess={handleModalSuccess}
                    />

                    <DeleteStageModal
                        isOpen={isDeleteStageModalOpen}
                        onClose={() => {
                            setIsDeleteStageModalOpen(false);
                            setSelectedStage(null);
                        }}
                        stage={selectedStage}
                        onSuccess={handleModalSuccess}
                    />
                </>
            )}
        </div>
    );
}
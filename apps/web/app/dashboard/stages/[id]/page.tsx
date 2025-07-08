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
    Target,
    Activity,
    Star,
    Trash2,
    UserMinus,
    Clock,
    Hash
} from 'lucide-react';
import Link from 'next/link';
import { useGetStage, useRemovePlayerFromStage, useGenerateMatches } from '@/lib/queries/stages';
import { useGetMatchesByStage } from '@/lib/queries/matches';
import { useGetPlayers } from '@/lib/queries/players';
import { EditStageModal } from '@/components/EditStageModal';
import { DeleteStageModal } from '@/components/DeleteStageModal';
import { AddPlayerToStageModal } from '@/components/AddPlayerToStageModal';
import { MatchTable } from '@/components/MatchTable';
import {Player} from "@repo/lib";
import {StageMatchTable} from "@/components/StageMatchTable";

export default function StageDetailsPage() {
    const params = useParams();
    const stageId = params.id as string;

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

    // Active tab state
    const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'matches'>('overview');

    // Fetch stage data
    const { data: stage, isLoading, error, refetch } = useGetStage(stageId);


    // Fetch matches for this stage
    const { data: matchesData } = useGetMatchesByStage(stageId,{
        limit:999
    });
    const matches = matchesData?.data || [];

    // Fetch all players to show available ones
    const { data: allPlayersData } = useGetPlayers();
    const allPlayers = allPlayersData?.data || [];

    const removePlayerMutation = useRemovePlayerFromStage({
        onSuccess: () => {
            refetch(); // Refresh stage data
        },
        onError: (error) => {
            console.error('Error removing player:', error);
            alert('Failed to remove player from stage');
        }
    });

    // Generate matches mutation
    const generateMatchesMutation = useGenerateMatches({
        onSuccess: (result) => {
            refetch(); // Refresh stage data
            alert(`Successfully generated ${result.matchCount} matches!`);
        },
        onError: (error) => {
            console.error('Error generating matches:', error);
            alert('Failed to generate matches');
        }
    });

    const handleRemovePlayer = async (playerId: string) => {
        if (confirm('Are you sure you want to remove this player from the stage?')) {
            try {
                await removePlayerMutation.mutateAsync({
                    stageId,
                    playerId
                });
            } catch (error) {
                console.error('Error removing player:', error);
            }
        }
    };

    const handleGenerateMatches = async () => {
        if (confirm(`Generate matches for this stage? This will create matches for all ${playersCount} players.`)) {
            try {
                await generateMatchesMutation.mutateAsync(stageId);
            } catch (error) {
                console.error('Error generating matches:', error);
            }
        }
    };

    const handleModalSuccess = () => {
        refetch();
    };

    // Get players that are NOT already in the stage
    const getAvailablePlayers = (): Player[] => {
        if (!stage || !allPlayers) return [];

        const stagePlayerIds = stage?.players?.map(player => player._id);
        return allPlayers?.filter(player => !stagePlayerIds?.includes(player._id));
    };

    const availablePlayers = getAvailablePlayers();

    if (isLoading) {
        return (
            <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
                <div className="bg-white rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading stage details...</p>
                </div>
            </div>
        );
    }

    if (error || !stage) {
        return (
            <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
                <div className="bg-white rounded-xl p-8 text-center">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Stage Not Found</h1>
                    <p className="text-gray-600 mb-4">
                        The stage you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/dashboard/stages"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Stages
                    </Link>
                </div>
            </div>
        );
    }

    // Helper functions
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (fullName: string) => {
        if (!fullName || fullName === 'undefined undefined') {
            return '??';
        }
        return fullName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getDisplayName = (player: Player) => {
        if (player.fullName && player.fullName !== 'undefined undefined') {
            return player.fullName;
        }
        if (player.firstName && player.lastName) {
            return `${player.firstName} ${player.lastName}`;
        }
        return `Player #${player.ranking || 'Unknown'}`;
    };

    const getStageStatus = () => {
        const now = new Date();
        const startDate = stage.startDate ? new Date(stage.startDate) : null;
        const endDate = stage.endDate ? new Date(stage.endDate) : null;

        if (!startDate && !endDate) return { label: 'Not Scheduled', color: 'bg-gray-100 text-gray-600' };
        if (startDate && startDate > now) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600' };
        if (endDate && endDate < now) return { label: 'Completed', color: 'bg-green-100 text-green-600' };
        return { label: 'Active', color: 'bg-yellow-100 text-yellow-600' };
    };

    const getStageTypeColor = (type: string) => {
        switch (type) {
            case 'GROUP':
                return 'bg-blue-100 text-blue-800';
            case 'ROUND_ROBIN':
                return 'bg-green-100 text-green-800';
            case 'KNOCKOUT':
                return 'bg-red-100 text-red-800';
            case 'SEMIFINALS':
                return 'bg-orange-100 text-orange-800';
            case 'FINALS':
                return 'bg-purple-100 text-purple-800';
            case 'CUSTOM':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-500';
        }
    };

    const getStageTypeLabel = (type: string) => {
        switch (type) {
            case 'GROUP':
                return 'Group Stage';
            case 'ROUND_ROBIN':
                return 'Round Robin';
            case 'KNOCKOUT':
                return 'Knockout';
            case 'SEMIFINALS':
                return 'Semifinals';
            case 'FINALS':
                return 'Finals';
            case 'CUSTOM':
                return 'Custom';
            default:
                return type;
        }
    };

    const status = getStageStatus();
    const playersCount = stage?.players?.length || 0;
    const tournamentName = stage?.tournament?.name;
    const matchesCount = matches.length;

    // Calculate stats for the cards
    const stats = {
        totalPlayers: playersCount,
        availablePlayers: availablePlayers.length,
        advancingPlayers: stage.advancingPlayers || 0,
        matches: matchesCount
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/stages"
                            className="p-2 hover:bg-green-500 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl lg:text-3xl font-bold">{stage.name}</h1>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStageTypeColor(stage.type)}`}>
                                    {getStageTypeLabel(stage.type)}
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-green-100">
                                {tournamentName} • Stage #{stage.order}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                        <button
                            onClick={() => setIsAddPlayerModalOpen(true)}
                            disabled={availablePlayers.length === 0}
                            className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={availablePlayers.length === 0 ? 'No available players to add' : 'Add player to stage'}
                        >
                            <Plus size={16} />
                            <span>Add Player</span>
                        </button>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit size={16} />
                            <span>Edit Stage</span>
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
                    <p className="text-sm text-gray-600">In Stage</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                            <Plus size={20} />
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
                            <Target size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Advancing
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.advancingPlayers}</h3>
                    <p className="text-sm text-gray-600">Next Round</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-indigo-500 text-white">
                            <Activity size={20} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.matches}</h3>
                    <p className="text-sm text-gray-600">Matches</p>
                </div>
            </div>

            {/* Navigation Tabs */}
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
                                <Settings size={16} />
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
                                Matches ({matchesCount})
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
                        {/* Stage Information */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Settings size={18} />
                                        Stage Information
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
                                        <span className="text-sm text-gray-500">Type</span>
                                        <p className="font-medium text-lg">{getStageTypeLabel(stage.type)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Order</span>
                                        <p className="font-medium text-lg">#{stage.order}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Tournament</span>
                                        <p className="font-medium text-lg">{tournamentName}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <p className="font-medium text-lg">{status.label}</p>
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
                                        <span className="text-gray-600">Players</span>
                                        <span className="font-semibold">{playersCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Matches</span>
                                        <span className="font-semibold">{matchesCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Available to Add</span>
                                        <span className="font-semibold">{availablePlayers.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Advancing</span>
                                        <span className="font-semibold">{stage.advancingPlayers || 0}</span>
                                    </div>
                                    {stage.startDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Start Date</span>
                                            <span className="font-semibold">{formatDate(stage.startDate)}</span>
                                        </div>
                                    )}
                                    {stage.endDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">End Date</span>
                                            <span className="font-semibold">{formatDate(stage.endDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stage Rules */}
                            {stage.rules && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Rules</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Sets to Win</span>
                                            <span className="font-semibold">{stage.rules.setsToWin || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Tie Break</span>
                                            <span className="font-semibold">
                                                {stage.rules.tieBreak ? '✅ Enabled' : '❌ Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Points System</span>
                                            <span className="font-semibold">
                                                {stage.rules.pointsPerWin || 0}W /
                                                {stage.rules.pointsPerDraw || 0}D /
                                                {stage.rules.pointsPerLoss || 0}L
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Players Tab */}
                {activeTab === 'players' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={18} />
                                Stage Players ({playersCount})
                            </h3>
                            <button
                                onClick={() => setIsAddPlayerModalOpen(true)}
                                disabled={availablePlayers.length === 0}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={availablePlayers.length === 0 ? 'No available players to add' : 'Add player to stage'}
                            >
                                <Plus size={16} />
                                Add Player
                            </button>
                        </div>

                        {playersCount === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Players Yet</h4>
                                <p className="text-gray-600 mb-4">Add players to get started with this stage</p>
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
                                {stage?.players?.map((player) => {
                                    const displayName = getDisplayName(player);

                                    return (
                                        <div key={player._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {getInitials(displayName)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {displayName}
                                                    </h4>
                                                    {player.ranking && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Star size={12} />
                                                            Ranking: #{player.ranking}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePlayer(player._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove player from stage"
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

                {/* Matches Tab - Updated to show actual matches */}
                {activeTab === 'matches' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Trophy size={18} />
                                Stage Matches ({matchesCount})
                            </h3>
                            <button
                                onClick={handleGenerateMatches}
                                disabled={playersCount < 2 || generateMatchesMutation.isPending}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={playersCount < 2 ? 'Need at least 2 players to generate matches' : 'Generate matches for this stage'}
                            >
                                {generateMatchesMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Generate Matches
                                    </>
                                )}
                            </button>
                        </div>

                        {matches.length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Matches Yet</h4>
                                <p className="text-gray-600 mb-4">
                                    {playersCount < 2
                                        ? 'Add at least 2 players to generate matches'
                                        : 'Generate matches to start organizing games'
                                    }
                                </p>
                                {playersCount >= 2 && (
                                    <button
                                        onClick={handleGenerateMatches}
                                        disabled={generateMatchesMutation.isPending}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        {generateMatchesMutation.isPending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Generating Matches...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                Generate Matches
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <StageMatchTable
                                tournament={stage?.tournament}
                                matches={matches}
                                showTournament={false}
                                showStage={false}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Edit size={18} />
                    Edit Stage
                </button>
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    Delete Stage
                </button>
            </div>

            {/* Modals */}
            <EditStageModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                stage={stage}
                onSuccess={handleModalSuccess}
            />

            <DeleteStageModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                stage={stage}
                onSuccess={() => {
                    window.location.href = '/dashboard/stages';
                }}
            />

            <AddPlayerToStageModal
                isOpen={isAddPlayerModalOpen}
                onClose={() => setIsAddPlayerModalOpen(false)}
                stageId={stageId}
                availablePlayers={availablePlayers}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
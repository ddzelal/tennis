
'use client';

import React, { useState } from 'react';
import {
    Trophy,
    Edit,
    Trash2,
    Plus,
    Calendar,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Play,
    Target,
    AlertCircle
} from 'lucide-react';
import { Match, MatchStatus } from '@repo/lib';
import { useDeleteMatch } from '@/lib/queries/matches';
import { RecordMatchResultModal } from './RecordMatchResultModal';
import { EditMatchModal } from './EditMatchModal';

interface StageMatchTableProps {
    matches: Match[];
    isLoading?: boolean;
    onRefresh?: () => void;
    showTournament?: boolean;
    showStage?: boolean;
}

export const StageMatchTable: React.FC<StageMatchTableProps> = ({
                                                                    matches,
                                                                    isLoading = false,
                                                                    onRefresh,
                                                                    showTournament = false,
                                                                    showStage = false
                                                                }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedMatchForResult, setSelectedMatchForResult] = useState<Match | null>(null);
    const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);

    const deleteMatchMutation = useDeleteMatch({
        onSuccess: () => {
            console.log('✅ Match deleted successfully');
            if (onRefresh) onRefresh();
        },
        onError: (error: any) => {
            console.error('❌ Failed to delete match:', error);
        }
    });

    const handleDeleteMatch = async (match: Match) => {
        const playerName1 = typeof match.player1 === 'object' ? `${match.player1.firstName} ${match.player1.lastName}` : 'Player 1';
        const playerName2 = typeof match.player2 === 'object' ? `${match.player2.firstName} ${match.player2.lastName}` : 'Player 2';

        const confirmed = window.confirm(
            `Are you sure you want to delete the match between ${playerName1} vs ${playerName2}?`
        );

        if (!confirmed) return;

        try {
            await deleteMatchMutation.mutateAsync(match._id);
        } catch (error) {
            console.error('Error deleting match:', error);
        }
    };

    const handleEditMatch = (match: Match) => {
        setSelectedMatchForEdit(match);
        setOpenDropdown(null);
    };

    const handleRecordResult = (match: Match) => {
        setSelectedMatchForResult(match);
        setOpenDropdown(null);
    };

    const handleResultModalSuccess = () => {
        setSelectedMatchForResult(null);
        if (onRefresh) onRefresh();
    };

    const handleEditModalSuccess = () => {
        setSelectedMatchForEdit(null);
        if (onRefresh) onRefresh();
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: MatchStatus }) => {
        const config = {
            [MatchStatus.SCHEDULED]: {
                color: 'bg-blue-100 text-blue-800',
                icon: <Calendar size={12} />,
                text: 'Scheduled'
            },
            [MatchStatus.IN_PROGRESS]: {
                color: 'bg-yellow-100 text-yellow-800',
                icon: <Play size={12} />,
                text: 'In Progress'
            },
            [MatchStatus.COMPLETED]: {
                color: 'bg-green-100 text-green-800',
                icon: <CheckCircle size={12} />,
                text: 'Completed'
            },
            [MatchStatus.CANCELLED]: {
                color: 'bg-red-100 text-red-800',
                icon: <AlertCircle size={12} />,
                text: 'Cancelled'
            }
        };

        const statusConfig = config[status] || config[MatchStatus.SCHEDULED];

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.text}
            </span>
        );
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlayerName = (player: any) => {
        if (typeof player === 'object') {
            return `${player.firstName} ${player.lastName}`;
        }
        return 'Unknown Player';
    };

    const getPlayerInitials = (player: any) => {
        if (typeof player === 'object') {
            return `${player.firstName?.[0] || '?'}${player.lastName?.[0] || '?'}`;
        }
        return '??';
    };

    const renderMatchResult = (match: Match) => {
        if (match.status !== MatchStatus.COMPLETED || !match.sets || match.sets.length === 0) {
            return <span className="text-gray-400 text-sm">No result</span>;
        }

        return (
            <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                    {match.sets.map((set, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                {set.player1Score}-{set.player2Score}
                            </span>
                            {set.tiebreak && set.tiebreakScore && (
                                <span className="text-xs text-gray-500">
                                    ({set.tiebreakScore})
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                {match.winner && (
                    <div className="text-xs text-green-600 font-medium">
                        Winner: {typeof match.winner === 'object'
                        ? `${match.winner.firstName} ${match.winner.lastName}`
                        : 'Player'
                    }
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Table Content */}
                {matches.length === 0 ? (
                    <div className="p-8 text-center">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Found</h3>
                        <p className="text-gray-600 mb-4">No matches have been created yet</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {matches.map((match) => (
                                <div key={match._id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className="text-center">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium">
                                                        {getPlayerInitials(match.player1)}
                                                    </div>
                                                    <span className="text-sm font-medium">vs</span>
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-medium">
                                                        {getPlayerInitials(match.player2)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {getPlayerName(match.player1)} vs {getPlayerName(match.player2)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === match._id ? null : match._id)}
                                                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>

                                            {openDropdown === match._id && (
                                                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                    <button
                                                        onClick={() => handleEditMatch(match)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                    >
                                                        <Edit size={14} />
                                                        <span>Edit Match</span>
                                                    </button>
                                                    {match.status !== MatchStatus.COMPLETED && (
                                                        <button
                                                            onClick={() => handleRecordResult(match)}
                                                            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                                                        >
                                                            <Target size={14} />
                                                            <span>Record Result</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMatch(match)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <StatusBadge status={match.status} />
                                            {match.scheduledDate && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {formatDate(match.scheduledDate)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {renderMatchResult(match)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Match
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Scheduled
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Result
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {matches.map((match) => (
                                    <tr key={match._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium">
                                                        {getPlayerInitials(match.player1)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {getPlayerName(match.player1)}
                                                    </span>
                                                </div>
                                                <span className="text-gray-400 font-medium">vs</span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-medium">
                                                        {getPlayerInitials(match.player2)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {getPlayerName(match.player2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={match.status} />
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {match.scheduledDate ? (
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>{formatDate(match.scheduledDate)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not scheduled</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderMatchResult(match)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === match._id ? null : match._id)}
                                                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreVertical size={16} className="text-gray-500" />
                                                </button>

                                                {openDropdown === match._id && (
                                                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                        <button
                                                            onClick={() => handleEditMatch(match)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                        >
                                                            <Edit size={14} />
                                                            <span>Edit Match</span>
                                                        </button>
                                                        {match.status !== MatchStatus.COMPLETED && (
                                                            <button
                                                                onClick={() => handleRecordResult(match)}
                                                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                                                            >
                                                                <Target size={14} />
                                                                <span>Record Result</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteMatch(match)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedMatchForResult && (
                <RecordMatchResultModal
                    isOpen={!!selectedMatchForResult}
                    onClose={() => setSelectedMatchForResult(null)}
                    match={selectedMatchForResult}
                    onSuccess={handleResultModalSuccess}
                />
            )}

            {selectedMatchForEdit && (
                <EditMatchModal
                    isOpen={!!selectedMatchForEdit}
                    onClose={() => setSelectedMatchForEdit(null)}
                    match={selectedMatchForEdit}
                    onSuccess={handleEditModalSuccess}
                />
            )}
        </>
    );
};
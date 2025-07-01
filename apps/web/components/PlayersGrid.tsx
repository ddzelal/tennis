'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    Trophy,
    Star,
    Clock,
    User
} from 'lucide-react';
import { EditPlayerModal } from './EditPlayerModal';
import { DeletePlayerModal } from './DeletePlayerModal';
import { Player } from '@repo/lib';

interface PlayersGridProps {
    players: Player[];
    onRefresh: () => void;
}

export const PlayersGrid: React.FC<PlayersGridProps> = ({ players, onRefresh }) => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleEdit = (player: Player) => {
        setSelectedPlayer(player);
        setIsEditModalOpen(true);
        setOpenDropdown(null);
    };

    const handleDelete = (player: Player) => {
        setSelectedPlayer(player);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };

    const getRankingColor = (ranking?: number) => {
        if (!ranking) return 'bg-gray-100 text-gray-500';
        if (ranking <= 10) return 'bg-yellow-100 text-yellow-800';
        if (ranking <= 50) return 'bg-green-100 text-green-800';
        if (ranking <= 100) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-600';
    };

    const calculateAge = (dateOfBirth: string | Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    const getTimeAgo = (date: string | Date) => {
        const now = new Date();
        const dateObj = new Date(date);
        const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 24 * 7) {
            const days = Math.floor(diffInHours / 24);
            return `${days}d ago`;
        } else if (diffInHours < 24 * 30) {
            const weeks = Math.floor(diffInHours / (24 * 7));
            return `${weeks}w ago`;
        } else {
            return formatDate(date);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {players.map((player) => {
                    const age = calculateAge(player.dateOfBirth);
                    const fullName = `${player.firstName} ${player.lastName}`;
                    
                    return (
                        <div
                            key={player._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group"
                        >
                            {/* Dropdown Menu */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === player._id ? null : player._id)}
                                    className="p-1 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical size={16} className="text-gray-500" />
                                </button>

                                {openDropdown === player._id && (
                                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                        <button
                                            onClick={() => handleEdit(player)}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <Edit size={14} />
                                            <span>Edit Player</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(player)}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete Player</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Player Avatar & Basic Info */}
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {getInitials(player.firstName, player.lastName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {fullName}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {player.ranking ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankingColor(player.ranking)}`}>
                                                <Trophy size={10} className="inline mr-1" />
                                                #{player.ranking}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                Unranked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Player Details */}
                            <div className="space-y-3">
                                {/* Age & Birth Date */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{age} years old</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(player.dateOfBirth)}
                                    </span>
                                </div>

                                {/* Full Name Details */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <User size={14} className="text-gray-400" />
                                    <span className="truncate">
                                        {player.firstName} • {player.lastName}
                                    </span>
                                </div>

                                {/* Join Date */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="truncate">
                                        Joined {getTimeAgo(player.createdAt)}
                                    </span>
                                </div>

                                {/* Stats Footer */}
                                <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        {player.ranking ? (
                                            <>
                                                <Trophy size={12} />
                                                <span>Rank #{player.ranking}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Star size={12} />
                                                <span>No ranking yet</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        <span>Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {players.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        No players match your current search and filter criteria. Try adjusting your filters or add some new players.
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            <EditPlayerModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlayer(null);
                }}
                player={selectedPlayer}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlayer(null);
                    onRefresh();
                }}
            />

            {/* Delete Modal */}
            <DeletePlayerModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPlayer(null);
                }}
                player={selectedPlayer}
                onSuccess={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPlayer(null);
                    onRefresh();
                }}
            />

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </>
    );
};
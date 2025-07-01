'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    Edit,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    Trophy
} from 'lucide-react';
import { EditPlayerModal } from './EditPlayerModal';
import { DeletePlayerModal } from './DeletePlayerModal';
import { Player } from '@repo/lib';

interface PlayersTableProps {
    players: Player[];
    onRefresh: () => void;
}

type SortField = 'fullName' | 'firstName' | 'lastName' | 'dateOfBirth' | 'ranking' | 'age' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const PlayersTable: React.FC<PlayersTableProps> = ({ players, onRefresh }) => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('ranking');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
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

    const sortedPlayers = [...players].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortField) {
            case 'fullName':
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                break;
            case 'firstName':
                aValue = a.firstName.toLowerCase();
                bValue = b.firstName.toLowerCase();
                break;
            case 'lastName':
                aValue = a.lastName.toLowerCase();
                bValue = b.lastName.toLowerCase();
                break;
            case 'dateOfBirth':
                aValue = new Date(a.dateOfBirth).getTime();
                bValue = new Date(b.dateOfBirth).getTime();
                break;
            case 'age':
                aValue = calculateAge(a.dateOfBirth);
                bValue = calculateAge(b.dateOfBirth);
                break;
            case 'ranking':
                // Handle null/undefined rankings - put them at the end
                aValue = a.ranking ?? 999999;
                bValue = b.ranking ?? 999999;
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            default:
                aValue = 0;
                bValue = 0;
        }

        if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="text-gray-400" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp size={14} className="text-green-600" /> :
            <ArrowDown size={14} className="text-green-600" />;
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('fullName')}
                                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-green-600 transition-colors"
                                >
                                    <span>Player</span>
                                    <SortIcon field="fullName" />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('dateOfBirth')}
                                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-green-600 transition-colors"
                                >
                                    <span>Birth Date</span>
                                    <SortIcon field="dateOfBirth" />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('age')}
                                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-green-600 transition-colors"
                                >
                                    <span>Age</span>
                                    <SortIcon field="age" />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('ranking')}
                                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-green-600 transition-colors"
                                >
                                    <span>Ranking</span>
                                    <SortIcon field="ranking" />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-green-600 transition-colors"
                                >
                                    <span>Joined</span>
                                    <SortIcon field="createdAt" />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left font-medium text-gray-900">Status</th>
                            <th className="px-6 py-4 text-right font-medium text-gray-900">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {sortedPlayers.map((player) => {
                            const age = calculateAge(player.dateOfBirth);
                            const fullName = `${player.firstName} ${player.lastName}`;
                            
                            return (
                                <tr key={player._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {getInitials(player.firstName, player.lastName)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {fullName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {player.firstName} {player.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>{formatDate(player.dateOfBirth)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {age} years
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {player.ranking ? (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankingColor(player.ranking)}`}>
                                                <Trophy size={12} className="mr-1" />
                                                #{player.ranking}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                Unranked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(player.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === player._id ? null : player._id)}
                                                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
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
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {/* Empty state */}
                    {sortedPlayers.length === 0 && (
                        <div className="text-center py-12">
                            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
                            <p className="text-gray-500">No players match your current filters.</p>
                        </div>
                    )}
                </div>
            </div>

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
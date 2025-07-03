'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    Users,
    Target,
    Clock,
    Trophy,
    Play
} from 'lucide-react';
import { EditStageModal } from './EditStageModal';
import { DeleteStageModal } from './DeleteStageModal';
import { Stage, StageType } from '@repo/lib';

interface StageGridProps {
    stages: Stage[];
    onRefresh: () => void;
}

export const StageGrid: React.FC<StageGridProps> = ({ stages, onRefresh }) => {
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleEdit = (stage: Stage) => {
        setSelectedStage(stage);
        setIsEditModalOpen(true);
        setOpenDropdown(null);
    };

    const handleDelete = (stage: Stage) => {
        setSelectedStage(stage);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
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
                return 'bg-purple-100 text-purple-800';
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

    const getStageStatus = (stage: Stage) => {
        const now = new Date();
        const startDate = stage.startDate ? new Date(stage.startDate) : null;
        const endDate = stage.endDate ? new Date(stage.endDate) : null;

        if (!startDate && !endDate) return { label: 'Not Scheduled', color: 'bg-gray-100 text-gray-600' };
        if (startDate && startDate > now) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600' };
        if (endDate && endDate < now) return { label: 'Completed', color: 'bg-green-100 text-green-600' };
        return { label: 'Active', color: 'bg-yellow-100 text-yellow-600' };
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {stages.map((stage) => {
                    const status = getStageStatus(stage);
                    const tournamentName = typeof stage.tournament === 'object'
                        ? stage.tournament.name
                        : 'Unknown Tournament';

                    return (
                        <div
                            key={stage._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group"
                        >
                            {/* Dropdown Menu */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === stage._id ? null : stage._id)}
                                    className="p-1 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical size={16} className="text-gray-500" />
                                </button>

                                {openDropdown === stage._id && (
                                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                        <button
                                            onClick={() => handleEdit(stage)}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <Edit size={14} />
                                            <span>Edit Stage</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(stage)}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete Stage</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Stage Header */}
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {getInitials(stage.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {stage.name}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageTypeColor(stage.type)}`}>
                                            {getStageTypeLabel(stage.type)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stage Details */}
                            <div className="space-y-3">
                                {/* Tournament */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Trophy size={14} className="text-gray-400" />
                                    <span className="truncate">{tournamentName}</span>
                                </div>

                                {/* Order */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Target size={14} className="text-gray-400" />
                                    <span>Stage #{stage.order}</span>
                                </div>

                                {/* Players Count */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users size={14} className="text-gray-400" />
                                    <span>{stage.players?.length || 0} players</span>
                                    {stage.advancingPlayers && (
                                        <span className="text-xs text-green-600">
                                            • {stage.advancingPlayers} advancing
                                        </span>
                                    )}
                                </div>

                                {/* Dates */}
                                {(stage.startDate || stage.endDate) && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>
                                            {stage.startDate && formatDate(stage.startDate)}
                                            {stage.startDate && stage.endDate && ' - '}
                                            {stage.endDate && formatDate(stage.endDate)}
                                        </span>
                                    </div>
                                )}

                                {/* Created At */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>Created {formatDate(stage.createdAt || new Date())}</span>
                                </div>

                                {/* Action Button */}
                                <div className="pt-3 mt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(stage)}
                                        className="w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Play size={14} />
                                        <span>Manage Stage</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Stage Modal */}
            {selectedStage && (
                <EditStageModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedStage(null);
                    }}
                    stage={selectedStage}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setSelectedStage(null);
                        onRefresh();
                    }}
                />
            )}

            {/* Delete Stage Modal */}
            {selectedStage && (
                <DeleteStageModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedStage(null);
                    }}
                    stage={selectedStage}
                    onSuccess={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedStage(null);
                        onRefresh();
                    }}
                />
            )}
        </>
    );
};
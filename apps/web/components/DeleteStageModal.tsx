'use client';

import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useDeleteStage } from '@/lib/queries/stages';
import { Stage } from '@repo/lib';

interface DeleteStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: Stage;
    onSuccess: () => void;
}

export const DeleteStageModal: React.FC<DeleteStageModalProps> = ({
    isOpen,
    onClose,
    stage,
    onSuccess
}) => {
    const deleteStageMutation = useDeleteStage({
        onSuccess: () => {
            onSuccess();
        },
        onError: (error) => {
            console.error('Error deleting stage:', error);
            alert('Failed to delete stage. Please try again.');
        }
    });

    const handleDelete = () => {
        deleteStageMutation.mutate(stage._id);
    };

    if (!isOpen) return null;

    const tournamentName = typeof stage.tournament === 'object' 
        ? stage.tournament.name 
        : 'Unknown Tournament';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Delete Stage</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Are you sure you want to delete this stage?
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Stage:</span>
                                    <span className="text-sm text-gray-900">{stage.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Tournament:</span>
                                    <span className="text-sm text-gray-900">{tournamentName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Order:</span>
                                    <span className="text-sm text-gray-900">#{stage.order}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Players:</span>
                                    <span className="text-sm text-gray-900">{stage.players?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-6">
                            This action cannot be undone. All data related to this stage will be permanently deleted.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleteStageMutation.isPending}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteStageMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {deleteStageMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                <span>Delete Stage</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

'use client';

import React, { useState } from 'react';
import { X, Trophy, Calendar, Users, Info, CheckCircle, FileText, Settings } from 'lucide-react';
import { TournamentType, CreateTournamentData } from '@repo/lib';
import { useCreateTournament } from '@/lib/queries/tournaments';

interface CreateTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    description: string;
    type: TournamentType;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    setsToWin: string;
    gamesPerSet: string;
    tieBreak: boolean;
    pointsPerWin: string;
    pointsPerLoss: string;
    pointsPerDraw: string;
}

interface FormErrors {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    maxPlayers?: string;
    setsToWin?: string;
    gamesPerSet?: string;
    pointsPerWin?: string;
    pointsPerLoss?: string;
    pointsPerDraw?: string;
    dateRange?: string;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                onSuccess
                                                                            }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        type: TournamentType.LEAGUE,
        startDate: '',
        endDate: '',
        maxPlayers: '',
        setsToWin: '2',
        gamesPerSet: '6',
        tieBreak: true,
        pointsPerWin: '2',
        pointsPerLoss: '0',
        pointsPerDraw: '1'
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [currentStep, setCurrentStep] = useState(1);

    const createTournamentMutation = useCreateTournament({
        onSuccess: (data) => {
            console.log('🎉 MODAL onSuccess called with:', data);
            onSuccess();
            resetForm();
        },
        onError: (error: any) => {
            console.error('💥 MODAL onError called with:', error);
            if (error.response?.data?.message) {
                setErrors({
                    name: error.response.data.message.includes('name') ? error.response.data.message : undefined,
                });
            }
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: TournamentType.LEAGUE,
            startDate: '',
            endDate: '',
            maxPlayers: '',
            setsToWin: '2',
            gamesPerSet: '6',
            tieBreak: true,
            pointsPerWin: '2',
            pointsPerLoss: '0',
            pointsPerDraw: '1'
        });
        setErrors({});
        setCurrentStep(1);
    };

    const validateStep1 = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tournament name is required';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Tournament name cannot exceed 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            if (endDate <= startDate) {
                newErrors.dateRange = 'End date must be after start date';
            }
        }

        if (formData.maxPlayers) {
            const maxPlayers = parseInt(formData.maxPlayers);
            if (isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 1000) {
                newErrors.maxPlayers = 'Max players must be between 2 and 1000';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: FormErrors = {};

        const setsToWin = parseInt(formData.setsToWin);
        if (isNaN(setsToWin) || setsToWin < 1 || setsToWin > 5) {
            newErrors.setsToWin = 'Sets to win must be between 1 and 5';
        }

        const gamesPerSet = parseInt(formData.gamesPerSet);
        if (isNaN(gamesPerSet) || gamesPerSet < 1 || gamesPerSet > 20) {
            newErrors.gamesPerSet = 'Games per set must be between 1 and 20';
        }

        const pointsPerWin = parseInt(formData.pointsPerWin);
        if (isNaN(pointsPerWin) || pointsPerWin < 0 || pointsPerWin > 10) {
            newErrors.pointsPerWin = 'Points per win must be between 0 and 10';
        }

        const pointsPerLoss = parseInt(formData.pointsPerLoss);
        if (isNaN(pointsPerLoss) || pointsPerLoss < 0 || pointsPerLoss > 10) {
            newErrors.pointsPerLoss = 'Points per loss must be between 0 and 10';
        }

        const pointsPerDraw = parseInt(formData.pointsPerDraw);
        if (isNaN(pointsPerDraw) || pointsPerDraw < 0 || pointsPerDraw > 10) {
            newErrors.pointsPerDraw = 'Points per draw must be between 0 and 10';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📝 MODAL handleSubmit called');

        if (currentStep !== 2) {
            console.log('⚠️ Not on step 2, returning');
            return;
        }

        if (!validateStep1() || !validateStep2()) {
            console.log('⚠️ Validation failed');
            return;
        }

        const submitData: CreateTournamentData = {
            name: formData.name.trim(),
            ...(formData.description && { description: formData.description.trim() }),
            type: formData.type,
            ...(formData.startDate && { startDate: formData.startDate }),
            ...(formData.endDate && { endDate: formData.endDate }),
            ...(formData.maxPlayers && { maxPlayers: parseInt(formData.maxPlayers) }),
            settings: {
                setsToWin: parseInt(formData.setsToWin),
                gamesPerSet: parseInt(formData.gamesPerSet),
                tieBreak: formData.tieBreak,
                pointsPerWin: parseInt(formData.pointsPerWin),
                pointsPerLoss: parseInt(formData.pointsPerLoss),
                pointsPerDraw: parseInt(formData.pointsPerDraw)
            }
        };

        console.log('🚀 MODAL submitting data:', submitData);
        createTournamentMutation.mutate(submitData);
        console.log('📡 MODAL mutation.mutate called');
    };

    const handleClose = () => {
        if (!createTournamentMutation.isPending) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    const previewName = formData.name.trim();
    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Create Tournament 🏆</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Step {currentStep} of 2 - {currentStep === 1 ? 'Basic Information' : 'Tournament Settings'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={createTournamentMutation.isPending}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tournament Preview */}
                {previewName && (
                    <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                {getInitials(previewName)}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{previewName}</h3>
                                <p className="text-sm text-gray-600">{formData.type} Tournament</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar - same style as Players */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Basic Info</span>
                        </div>
                        <div className={`h-px flex-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Settings</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Tournament Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Trophy size={16} className="inline mr-1" />
                                    Tournament Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g. Summer Championship 2024"
                                    maxLength={100}
                                    disabled={createTournamentMutation.isPending}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <Info size={12} className="mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText size={16} className="inline mr-1" />
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Brief description of the tournament..."
                                    maxLength={500}
                                    rows={3}
                                    disabled={createTournamentMutation.isPending}
                                />
                                {errors.description && (
                                    <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <Info size={12} className="mr-1" />
                                        {errors.description}
                                    </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    {formData.description.length}/500 characters
                                </p>
                            </div>

                            {/* Tournament Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tournament Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TournamentType })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={createTournamentMutation.isPending}
                                >
                                    <option value={TournamentType.LEAGUE}>League</option>
                                    <option value={TournamentType.KNOCKOUT}>Knockout</option>
                                    <option value={TournamentType.GROUP_KNOCKOUT}>Group Knockout</option>
                                    <option value={TournamentType.ROUND_ROBIN}>Round Robin</option>
                                    <option value={TournamentType.CUSTOM}>Custom</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar size={16} className="inline mr-1" />
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar size={16} className="inline mr-1" />
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                </div>
                            </div>

                            {errors.dateRange && (
                                <p className="text-red-600 text-xs flex items-center">
                                    <Info size={12} className="mr-1" />
                                    {errors.dateRange}
                                </p>
                            )}

                            {/* Max Players */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users size={16} className="inline mr-1" />
                                    Maximum Players (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max="1000"
                                    value={formData.maxPlayers}
                                    onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                        errors.maxPlayers ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g. 32"
                                    disabled={createTournamentMutation.isPending}
                                />
                                {errors.maxPlayers && (
                                    <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <Info size={12} className="mr-1" />
                                        {errors.maxPlayers}
                                    </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    Leave empty for unlimited players
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Tournament Settings */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {/* Match Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Settings size={16} className="inline mr-1" />
                                        Sets to Win *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={formData.setsToWin}
                                        onChange={(e) => setFormData({ ...formData, setsToWin: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.setsToWin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    {errors.setsToWin && (
                                        <p className="text-red-600 text-xs mt-1 flex items-center">
                                            <Info size={12} className="mr-1" />
                                            {errors.setsToWin}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Games per Set *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.gamesPerSet}
                                        onChange={(e) => setFormData({ ...formData, gamesPerSet: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.gamesPerSet ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    {errors.gamesPerSet && (
                                        <p className="text-red-600 text-xs mt-1 flex items-center">
                                            <Info size={12} className="mr-1" />
                                            {errors.gamesPerSet}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Tie Break */}
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.tieBreak}
                                        onChange={(e) => setFormData({ ...formData, tieBreak: e.target.checked })}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Enable Tie Break</span>
                                </label>
                            </div>

                            {/* Points System */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points per Win *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={formData.pointsPerWin}
                                        onChange={(e) => setFormData({ ...formData, pointsPerWin: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.pointsPerWin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    {errors.pointsPerWin && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {errors.pointsPerWin}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points per Loss *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={formData.pointsPerLoss}
                                        onChange={(e) => setFormData({ ...formData, pointsPerLoss: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.pointsPerLoss ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    {errors.pointsPerLoss && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {errors.pointsPerLoss}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points per Draw *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={formData.pointsPerDraw}
                                        onChange={(e) => setFormData({ ...formData, pointsPerDraw: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                                            errors.pointsPerDraw ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={createTournamentMutation.isPending}
                                    />
                                    {errors.pointsPerDraw && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {errors.pointsPerDraw}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                    <Info size={16} className="mr-2" />
                                    Tournament Settings
                                </h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Standard tennis: 2 sets to win, 6 games per set</li>
                                    <li>• Point system: 2 for win, 0 for loss, 1 for draw</li>
                                    <li>• Tie break recommended for competitive play</li>
                                    <li>• Settings can be modified later</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        {currentStep === 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={createTournamentMutation.isPending}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={createTournamentMutation.isPending || !formData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Step
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={createTournamentMutation.isPending}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTournamentMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {createTournamentMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            <span>Create Tournament</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </form>

                {/* Error State */}
                {createTournamentMutation.isError && (
                    <div className="px-6 pb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 flex items-center">
                                <Info size={14} className="mr-2" />
                                Failed to create tournament. Please check your input and try again.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
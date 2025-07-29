"use client";

import React, { useState } from "react";
import { Plus, Trophy, Calendar, Users, Star } from "lucide-react";
import { TournamentTable } from "@/components/TournamentTable";
import { CreateTournamentModal } from "@/components/CreateTournamentModal";
import { TournamentType, TournamentStatus } from "@repo/lib";
import { useGetTournaments } from "@/lib/queries/tournaments";

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TournamentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | "all">(
    "all",
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get tournaments for stats
  const {
    data: tournamentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetTournaments({
    search: searchTerm,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100, // Get more for stats
  });

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Tournaments
          </h2>
          <p className="text-red-600 mb-4">
            Failed to load tournaments data: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tournaments = tournamentsResponse?.data || [];

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(
      (t) =>
        t.status === TournamentStatus.REGISTRATION ||
        t.status === TournamentStatus.IN_PROGRESS,
    ).length,
    completed: tournaments.filter(
      (t) => t.status === TournamentStatus.COMPLETED,
    ).length,
    newThisMonth: tournaments.filter((t) => {
      const tournamentDate = new Date(t.createdAt || Date.now());
      const thisMonth = new Date();
      return (
        tournamentDate.getMonth() === thisMonth.getMonth() &&
        tournamentDate.getFullYear() === thisMonth.getFullYear()
      );
    }).length,
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
      {/* Header - same style as Players */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Tournament Management 🏆
            </h1>
            <p className="text-green-100">
              Manage tennis tournaments, competitions, and brackets
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 lg:mt-0 bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - same style as Players */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Trophy size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Total
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-sm text-gray-600">All Tournaments</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Star size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          <p className="text-sm text-gray-600">Running</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500 text-white">
              <Trophy size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Complete
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.completed}
          </h3>
          <p className="text-sm text-gray-600">Finished</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              New
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.newThisMonth}
          </h3>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>

      {/* Search and Filters - enhanced mobile-first */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:space-x-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TournamentType | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value={TournamentType.LEAGUE}>League</option>
              <option value={TournamentType.KNOCKOUT}>Knockout</option>
              <option value={TournamentType.GROUP_KNOCKOUT}>
                Group Knockout
              </option>
              <option value={TournamentType.ROUND_ROBIN}>Round Robin</option>
              <option value={TournamentType.CUSTOM}>Custom</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TournamentStatus | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value={TournamentStatus.DRAFT}>Draft</option>
              <option value={TournamentStatus.REGISTRATION}>
                Registration
              </option>
              <option value={TournamentStatus.IN_PROGRESS}>In Progress</option>
              <option value={TournamentStatus.COMPLETED}>Completed</option>
              <option value={TournamentStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournament Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "No tournaments found" : "No tournaments yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No tournaments match "${searchTerm}"`
              : "Start by creating your first tournament"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Tournament
            </button>
          )}
        </div>
      ) : (
        <TournamentTable
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
        />
      )}

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

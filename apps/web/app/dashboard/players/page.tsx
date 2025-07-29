"use client";

import React, { useState } from "react";
import { Plus, Users, Trophy, Calendar, Star } from "lucide-react";
import { PlayersTable } from "@/components/PlayersTable";
import { PlayersGrid } from "@/components/PlayersGrid";
import { CreatePlayerModal } from "@/components/CreatePlayerModal";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { useGetPlayers } from "@/lib/queries";

export default function PlayersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const {
    data: playersResponse,
    isLoading,
    error,
    refetch,
  } = useGetPlayers({ search: searchQuery, limit: 10 });

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Players
          </h2>
          <p className="text-red-600 mb-4">
            Failed to load players data: {error.message}
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

  const players = playersResponse?.data || [];

  const filteredPlayers = players.filter(
    (player) =>
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.fullName &&
        player.fullName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const stats = {
    total: players.length,
    ranked: players.filter((p) => p.ranking && p.ranking > 0).length,
    topRanked: players.filter((p) => p.ranking && p.ranking <= 10).length,
    newThisMonth: players.filter((p) => {
      const playerDate = new Date(p.createdAt || Date.now());
      const thisMonth = new Date();
      return (
        playerDate.getMonth() === thisMonth.getMonth() &&
        playerDate.getFullYear() === thisMonth.getFullYear()
      );
    }).length,
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Players Management 🎾
            </h1>
            <p className="text-green-100">
              Manage tennis players, rankings, and profiles
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 lg:mt-0 bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Player</span>
          </button>
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
              Total
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-sm text-gray-600">All Players</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Star size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              Ranked
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.ranked}</h3>
          <p className="text-sm text-gray-600">With Ranking</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500 text-white">
              <Trophy size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Elite
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats.topRanked}
          </h3>
          <p className="text-sm text-gray-600">Top 10</p>
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

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalPlayers={filteredPlayers.length}
      />

      {/* Players Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? "No players found" : "No players yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? `No players match "${searchQuery}"`
              : "Start by adding your first tennis player"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add First Player
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            {viewMode === "table" ? (
              <PlayersTable players={filteredPlayers} onRefresh={refetch} />
            ) : (
              <PlayersGrid players={filteredPlayers} onRefresh={refetch} />
            )}
          </div>

          {/* Mobile Grid View */}
          <div className="lg:hidden">
            <PlayersGrid players={filteredPlayers} onRefresh={refetch} />
          </div>
        </>
      )}

      {/* Create Player Modal */}
      <CreatePlayerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

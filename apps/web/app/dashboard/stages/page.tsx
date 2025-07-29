"use client";

import React, { useState } from "react";
import {
  Plus,
  Users,
  Trophy,
  Calendar,
  Target,
  Layers,
  Star,
  Activity,
} from "lucide-react";
import { StageTable } from "@/components/StageTable";
import { StageGrid } from "@/components/StageGrid";
import { CreateStageModal } from "@/components/CreateStageModal";
import { StageSearchAndFilters } from "@/components/StageSearchAndFilters";
import { useGetStages } from "@/lib/queries/stages";
import { StageType } from "@repo/lib";

export default function StagesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StageType | "all">("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const {
    data: stagesResponse,
    isLoading,
    error,
    refetch,
  } = useGetStages({
    type: typeFilter !== "all" ? typeFilter : undefined,
    tournamentId: tournamentFilter !== "all" ? tournamentFilter : undefined,
    limit: 50,
  });

  if (error) {
    return (
      <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Stages
          </h2>
          <p className="text-red-600 mb-4">
            Failed to load stages data: {error.message}
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

  const stages = stagesResponse?.data || [];

  const filteredStages = stages.filter((stage) => {
    const matchesSearch = stage.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || stage.type === typeFilter;
    const matchesTournament =
      tournamentFilter === "all" ||
      (typeof stage.tournament === "object" &&
        stage.tournament._id === tournamentFilter);

    return matchesSearch && matchesType && matchesTournament;
  });

  const stats = {
    total: stages.length,
    active: stages.filter((s) => {
      const now = new Date();
      const startDate = s.startDate ? new Date(s.startDate) : null;
      const endDate = s.endDate ? new Date(s.endDate) : null;
      return (!startDate || startDate <= now) && (!endDate || endDate >= now);
    }).length,
    completed: stages.filter((s) => {
      const now = new Date();
      const endDate = s.endDate ? new Date(s.endDate) : null;
      return endDate && endDate < now;
    }).length,
    newThisMonth: stages.filter((s) => {
      const stageDate = new Date(s.createdAt || Date.now());
      const thisMonth = new Date();
      return (
        stageDate.getMonth() === thisMonth.getMonth() &&
        stageDate.getFullYear() === thisMonth.getFullYear()
      );
    }).length,
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gray-50">
      {/* Header - changed to green gradient to match other pages */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Stage Management 🎭
            </h1>
            <p className="text-green-100">
              Manage tournament stages, phases, and competition rounds
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 lg:mt-0 bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Stage</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - kept same style but updated colors for consistency */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Layers size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Total
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-sm text-gray-600">All Stages</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Activity size={20} />
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
            <div className="p-2 rounded-lg bg-indigo-500 text-white">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
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
      <StageSearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        tournamentFilter={tournamentFilter}
        onTournamentFilterChange={setTournamentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalStages={filteredStages.length}
      />

      {/* Stages Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stages...</p>
        </div>
      ) : filteredStages.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || typeFilter !== "all" || tournamentFilter !== "all"
              ? "No stages found"
              : "No stages yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || typeFilter !== "all" || tournamentFilter !== "all"
              ? "No stages match your current filters"
              : "Start by creating your first tournament stage"}
          </p>
          {!searchQuery &&
            typeFilter === "all" &&
            tournamentFilter === "all" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First Stage
              </button>
            )}
        </div>
      ) : (
        <>
          {/* Desktop Table/Grid View */}
          <div className="hidden lg:block">
            {viewMode === "table" ? (
              <StageTable stages={filteredStages} onRefresh={refetch} />
            ) : (
              <StageGrid stages={filteredStages} onRefresh={refetch} />
            )}
          </div>

          {/* Mobile Grid View */}
          <div className="lg:hidden">
            <StageGrid stages={filteredStages} onRefresh={refetch} />
          </div>
        </>
      )}

      {/* Create Stage Modal */}
      <CreateStageModal
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

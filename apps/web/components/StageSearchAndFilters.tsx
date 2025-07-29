"use client";

import React from "react";
import { Grid, List, Search } from "lucide-react";
import { StageType } from "@repo/lib";
import { useGetTournaments } from "@/lib/queries/tournaments";

interface StageSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: StageType | "all";
  onTypeFilterChange: (type: StageType | "all") => void;
  tournamentFilter: string;
  onTournamentFilterChange: (tournamentId: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  totalStages: number;
}

export const StageSearchAndFilters: React.FC<StageSearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  tournamentFilter,
  onTournamentFilterChange,
  viewMode,
  onViewModeChange,
  totalStages,
}) => {
  const { data: tournamentsResponse } = useGetTournaments({ limit: 100 });
  const tournaments = tournamentsResponse?.data || [];

  const getStageTypeLabel = (type: StageType) => {
    switch (type) {
      case StageType.GROUP:
        return "Group Stage";
      case StageType.ROUND_ROBIN:
        return "Round Robin";
      case StageType.KNOCKOUT:
        return "Knockout";
      case StageType.SEMIFINALS:
        return "Semifinals";
      case StageType.FINALS:
        return "Finals";
      case StageType.CUSTOM:
        return "Custom";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:space-x-4">
        {/* Search */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stages..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(e.target.value as StageType | "all")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {Object.values(StageType).map((type) => (
              <option key={type} value={type}>
                {getStageTypeLabel(type)}
              </option>
            ))}
          </select>

          {/* Tournament Filter */}
          <select
            value={tournamentFilter}
            onChange={(e) => onTournamentFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((tournament) => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle - Only on desktop */}
          <div className="hidden lg:flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 lg:mt-0 lg:absolute lg:top-6 lg:right-6">
        <span className="text-sm text-gray-500">
          {totalStages} stage{totalStages !== 1 ? "s" : ""} found
        </span>
      </div>
    </div>
  );
};

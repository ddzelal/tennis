"use client";

import React from "react";
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  totalPlayers: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalPlayers,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between lg:justify-end space-x-4">
          {/* Results Count */}
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {totalPlayers} player{totalPlayers !== 1 ? "s" : ""}
          </span>

          {/* View Mode Toggle (Desktop Only) */}
          <div className="hidden lg:flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white shadow-sm text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Filter Button */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Trophy,
  Target,
  Users,
} from "lucide-react";
import { EditStageModal } from "./EditStageModal";
import { DeleteStageModal } from "./DeleteStageModal";
import { Stage, StageType } from "@repo/lib";

interface StageTableProps {
  stages: Stage[];
  onRefresh: () => void;
}

type SortField =
  | "name"
  | "type"
  | "order"
  | "tournament"
  | "players"
  | "startDate"
  | "endDate"
  | "createdAt";
type SortDirection = "asc" | "desc";

export const StageTable: React.FC<StageTableProps> = ({
  stages,
  onRefresh,
}) => {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedStages = [...stages].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "type":
        aValue = a.type;
        bValue = b.type;
        break;
      case "order":
        aValue = a.order;
        bValue = b.order;
        break;
      case "tournament":
        aValue =
          typeof a.tournament === "object"
            ? a.tournament.name.toLowerCase()
            : "";
        bValue =
          typeof b.tournament === "object"
            ? b.tournament.name.toLowerCase()
            : "";
        break;
      case "players":
        aValue = a.players?.length || 0;
        bValue = b.players?.length || 0;
        break;
      case "startDate":
        aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
        bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
        break;
      case "endDate":
        aValue = a.endDate ? new Date(a.endDate).getTime() : 0;
        bValue = b.endDate ? new Date(b.endDate).getTime() : 0;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

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
        return "bg-blue-100 text-blue-800";
      case StageType.ROUND_ROBIN:
        return "bg-green-100 text-green-800";
      case StageType.KNOCKOUT:
        return "bg-red-100 text-red-800";
      case StageType.SEMIFINALS:
        return "bg-orange-100 text-orange-800";
      case StageType.FINALS:
        return "bg-purple-100 text-purple-800";
      case StageType.CUSTOM:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

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

  const getStageStatus = (stage: Stage) => {
    const now = new Date();
    const startDate = stage.startDate ? new Date(stage.startDate) : null;
    const endDate = stage.endDate ? new Date(stage.endDate) : null;

    if (!startDate && !endDate)
      return { label: "Not Scheduled", color: "bg-gray-100 text-gray-600" };
    if (startDate && startDate > now)
      return { label: "Upcoming", color: "bg-blue-100 text-blue-600" };
    if (endDate && endDate < now)
      return { label: "Completed", color: "bg-green-100 text-green-600" };
    return { label: "Active", color: "bg-yellow-100 text-yellow-600" };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-purple-600" />
    ) : (
      <ArrowDown size={14} className="text-purple-600" />
    );
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
                    onClick={() => handleSort("name")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Stage</span>
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Type</span>
                    <SortIcon field="type" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("tournament")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Tournament</span>
                    <SortIcon field="tournament" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("order")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Order</span>
                    <SortIcon field="order" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("players")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Players</span>
                    <SortIcon field="players" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("startDate")}
                    className="flex items-center space-x-1 font-medium text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <span>Schedule</span>
                    <SortIcon field="startDate" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStages.map((stage) => {
                const status = getStageStatus(stage);
                const tournamentName =
                  typeof stage.tournament === "object"
                    ? stage.tournament.name
                    : "Unknown Tournament";

                return (
                  <tr
                    key={stage._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(stage.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stage.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Stage #{stage.order}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageTypeColor(stage.type)}`}
                      >
                        {getStageTypeLabel(stage.type)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Trophy size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900 truncate max-w-[150px]">
                          {tournamentName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Target size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          #{stage.order}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {stage.players?.length || 0}
                        </span>
                        {stage.advancingPlayers && (
                          <span className="text-xs text-green-600">
                            • {stage.advancingPlayers} advancing
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {stage.startDate ? (
                            <div>
                              <div>{formatDate(stage.startDate)}</div>
                              {stage.endDate && (
                                <div className="text-xs text-gray-500">
                                  to {formatDate(stage.endDate)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not scheduled</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === stage._id ? null : stage._id,
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>

                        {openDropdown === stage._id && (
                          <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

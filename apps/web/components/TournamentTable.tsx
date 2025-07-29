"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Dodaj ovo!
import {
  Trophy,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tournament, TournamentType, TournamentStatus } from "@repo/lib";
import { DeleteTournamentModal } from "./DeleteTournamentModal";
import { useGetTournaments } from "@/lib/queries/tournaments";
import { EditTournamentModal } from "./EditTournamentModal";

interface TournamentTableProps {
  searchTerm?: string;
  typeFilter?: TournamentType | "all";
  statusFilter?: TournamentStatus | "all";
}

export const TournamentTable: React.FC<TournamentTableProps> = ({
  searchTerm = "",
  typeFilter = "all",
  statusFilter = "all",
}) => {
  const router = useRouter(); // Dodaj ovo!
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const limit = 10;

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit,
    ...(searchTerm && { search: searchTerm }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data, isLoading, error } = useGetTournaments(queryParams);

  const handleEditTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedTournament(null);
  };

  const handleDeleteTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedTournament(null);
  };

  // Dodaj ovu funkciju za navigaciju na details page!
  const handleViewDetails = (tournament: Tournament) => {
    router.push(`/dashboard/tournaments/${tournament._id}`);
    setOpenDropdown(null);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: TournamentStatus }) => {
    const colors = {
      [TournamentStatus.DRAFT]: "bg-gray-100 text-gray-800",
      [TournamentStatus.REGISTRATION]: "bg-blue-100 text-blue-800",
      [TournamentStatus.IN_PROGRESS]: "bg-green-100 text-green-800",
      [TournamentStatus.COMPLETED]: "bg-purple-100 text-purple-800",
      [TournamentStatus.CANCELLED]: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
      </span>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }: { type: TournamentType }) => {
    const colors = {
      [TournamentType.LEAGUE]: "bg-orange-100 text-orange-800",
      [TournamentType.KNOCKOUT]: "bg-red-100 text-red-800",
      [TournamentType.GROUP_KNOCKOUT]: "bg-purple-100 text-purple-800",
      [TournamentType.ROUND_ROBIN]: "bg-green-100 text-green-800",
      [TournamentType.CUSTOM]: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}
      >
        {type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-8 text-center">
          <Trophy className="mx-auto text-red-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Tournaments
          </h3>
          <p className="text-red-500">
            Failed to load tournaments. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-8 text-center">
          <Trophy className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Tournaments Found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Create your first tournament to get started"}
          </p>
        </div>
      </div>
    );
  }

  const tournaments = data.data;
  const pagination = data.pagination;

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {tournaments.map((tournament) => (
          <div
            key={tournament._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(tournament.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {tournament.name}
                  </h3>
                  {tournament.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {tournament.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === tournament._id ? null : tournament._id,
                    )
                  }
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical size={16} className="text-gray-500" />
                </button>

                {openDropdown === tournament._id && (
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => handleEditTournament(tournament)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit size={14} />
                      <span>Edit Tournament</span>
                    </button>
                    {/* AŽURIRAJ OVO DUGME SA NAVIGATION! */}
                    <button
                      onClick={() => handleViewDetails(tournament)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(tournament)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <TypeBadge type={tournament.type} />
              <StatusBadge status={tournament.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users size={14} />
                <span>
                  {Array.isArray(tournament.players)
                    ? tournament.players.length
                    : 0}
                  {tournament.maxPlayers && ` / ${tournament.maxPlayers}`}{" "}
                  players
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar size={14} />
                <span>
                  {tournament.startDate
                    ? formatDate(tournament.startDate)
                    : "TBD"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tournament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tournaments.map((tournament) => (
                <tr
                  key={tournament._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(tournament.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tournament.name}
                        </div>
                        {tournament.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {tournament.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={tournament.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tournament.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Users size={14} className="text-gray-400" />
                      <span>
                        {Array.isArray(tournament.players)
                          ? tournament.players.length
                          : 0}
                        {tournament.maxPlayers && ` / ${tournament.maxPlayers}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tournament.startDate
                      ? formatDate(tournament.startDate)
                      : "TBD"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === tournament._id
                              ? null
                              : tournament._id,
                          )
                        }
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>

                      {openDropdown === tournament._id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleEditTournament(tournament)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Edit size={14} />
                            <span>Edit Tournament</span>
                          </button>
                          {/* AŽURIRAJ I OVO DUGME SA NAVIGATION! */}
                          <button
                            onClick={() => handleViewDetails(tournament)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTournament(tournament)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} tournaments
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Tournament Modal */}
      {selectedTournament && (
        <EditTournamentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          tournament={selectedTournament}
        />
      )}

      {/* Delete Tournament Modal */}
      {selectedTournament && (
        <DeleteTournamentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
          tournament={selectedTournament}
        />
      )}
    </>
  );
};

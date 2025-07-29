"use client";

import React from "react";
import {
  Users,
  Trophy,
  Gamepad2,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Target,
} from "lucide-react";

const statsCards = [
  {
    title: "Total Players",
    value: "248",
    change: "+12",
    changeType: "increase" as const,
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    title: "Active Tournaments",
    value: "8",
    change: "+2",
    changeType: "increase" as const,
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    title: "Matches Today",
    value: "15",
    change: "-3",
    changeType: "decrease" as const,
    icon: <Gamepad2 className="w-6 h-6" />,
    color: "bg-orange-500",
  },
  {
    title: "Completion Rate",
    value: "94%",
    change: "+5%",
    changeType: "increase" as const,
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-purple-500",
  },
];

const recentMatches = [
  {
    id: 1,
    player1: "Novak Djokovic",
    player2: "Rafael Nadal",
    score: "6-4, 6-2",
    status: "completed",
  },
  {
    id: 2,
    player1: "Roger Federer",
    player2: "Andy Murray",
    score: "6-3, 4-6, 6-4",
    status: "completed",
  },
  {
    id: 3,
    player1: "Serena Williams",
    player2: "Venus Williams",
    score: "3-2",
    status: "live",
  },
  {
    id: 4,
    player1: "Maria Sharapova",
    player2: "Caroline Wozniacki",
    score: "Scheduled",
    status: "scheduled",
  },
];

const upcomingTournaments = [
  {
    name: "Wimbledon Championship",
    date: "2024-07-01",
    players: 128,
    status: "Upcoming",
  },
  {
    name: "US Open Qualifier",
    date: "2024-07-15",
    players: 64,
    status: "Registration",
  },
  {
    name: "French Open Junior",
    date: "2024-08-01",
    players: 32,
    status: "Planning",
  },
];

export const DashboardHome: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back! 🎾
        </h1>
        <p className="text-green-100 text-sm lg:text-base">
          Here's what's happening in your tennis tournaments today
        </p>
        <div className="mt-4 flex items-center space-x-4 text-green-100">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span className="text-sm">
              Today: {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span className="text-sm">8 matches scheduled</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.changeType === "increase"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Matches
              </h2>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                View All
              </button>
            </div>
          </div>
          <div className="p-4 lg:p-6 space-y-4">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {match.player1} vs {match.player2}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{match.score}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : match.status === "live"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {match.status === "live"
                    ? "🔴 Live"
                    : match.status === "completed"
                      ? "✅ Done"
                      : "⏱️ Soon"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Tournaments
              </h2>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                Create New
              </button>
            </div>
          </div>
          <div className="p-4 lg:p-6 space-y-4">
            {upcomingTournaments.map((tournament, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {tournament.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {tournament.players} players • {tournament.date}
                    </p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                  {tournament.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
            <Users className="w-6 h-6 text-gray-400 group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
              Add Player
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
            <Trophy className="w-6 h-6 text-gray-400 group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
              New Tournament
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
            <Gamepad2 className="w-6 h-6 text-gray-400 group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
              Schedule Match
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
            <Award className="w-6 h-6 text-gray-400 group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
              View Results
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

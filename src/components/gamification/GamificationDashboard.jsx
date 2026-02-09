import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, TrendingUp, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function GamificationDashboard({ user }) {
  const { data: userPoints } = useQuery({
    queryKey: ["userPoints", user?.id],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({
        created_by: user.email,
      });
      return (
        points[0] || {
          total_points: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          points_this_week: 0,
        }
      );
    },
    enabled: !!user,
  });

  const { data: allUserPoints } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => base44.entities.UserPoints.list("-total_points", 10),
    initialData: [],
  });

  const pointsToNextLevel = (userPoints?.level || 1) * 100;
  const currentLevelProgress =
    (((userPoints?.total_points || 0) % pointsToNextLevel) /
      pointsToNextLevel) *
    100;

  return (
    <div className="space-y-6">
      {/* Level & Points */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-4xl font-bold text-amber-600">
                {userPoints?.level || 1}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-gray-900">
                {userPoints?.total_points || 0}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Progress to Level {(userPoints?.level || 1) + 1}
              </span>
              <span className="font-medium text-amber-600">
                {currentLevelProgress.toFixed(0)}%
              </span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-600">Current Streak</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {userPoints?.current_streak || 0} days
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {userPoints?.points_this_week || 0} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allUserPoints.slice(0, 5).map((userPoint, index) => (
              <motion.div
                key={userPoint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  userPoint.created_by === user?.email
                    ? "bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0
                      ? "bg-yellow-400 text-white"
                      : index === 1
                        ? "bg-gray-300 text-white"
                        : index === 2
                          ? "bg-orange-400 text-white"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {userPoint.created_by === user?.email
                      ? "You"
                      : userPoint.created_by.split("@")[0]}
                  </p>
                  <p className="text-sm text-gray-600">
                    Level {userPoint.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-600">
                    {userPoint.total_points}
                  </p>
                  <p className="text-xs text-gray-600">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-700">Clean 10 files</span>
              <Badge className="bg-amber-600 text-white">+10 pts</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-700">Organize a folder</span>
              <Badge className="bg-amber-600 text-white">+15 pts</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-700">Daily login streak</span>
              <Badge className="bg-amber-600 text-white">+5 pts/day</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-700">
                Complete AI analysis
              </span>
              <Badge className="bg-amber-600 text-white">+25 pts</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-700">Share a folder</span>
              <Badge className="bg-amber-600 text-white">+20 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

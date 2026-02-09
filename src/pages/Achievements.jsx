import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const AVAILABLE_BADGES = [
  {
    name: "First Steps",
    icon: "🌱",
    description: "Clean your first 10 files",
    requirement: 10,
    category: "milestone",
  },
  {
    name: "Space Maker",
    icon: "🌟",
    description: "Free over 1GB in a single session",
    requirement: 1000,
    category: "cleaning",
  },
  {
    name: "Zen Desktop",
    icon: "🧘",
    description: "Complete 5 cleaning sessions",
    requirement: 5,
    category: "consistency",
  },
  {
    name: "Folder Whisperer",
    icon: "📁",
    description: "Organize 10 folders",
    requirement: 10,
    category: "organizing",
  },
  {
    name: "Digital Minimalist",
    icon: "✨",
    description: "Clean 100 files total",
    requirement: 100,
    category: "milestone",
  },
  {
    name: "Week Warrior",
    icon: "🔥",
    description: "Maintain a 7-day cleaning streak",
    requirement: 7,
    category: "consistency",
  },
  {
    name: "Space Guardian",
    icon: "🛡️",
    description: "Free over 10GB total",
    requirement: 10000,
    category: "milestone",
  },
  {
    name: "Organization Master",
    icon: "👑",
    description: "Create 20 organized folders",
    requirement: 20,
    category: "organizing",
  },
];

export default function Achievements() {
  const [user, setUser] = useState(null);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => base44.entities.Achievement.list("-earned_date"),
    initialData: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const earnedBadgeNames = new Set(achievements.map((a) => a.badge_name));
  const earnedCount = achievements.length;
  const totalCount = AVAILABLE_BADGES.length;

  const categoryColors = {
    milestone: "from-amber-100 to-orange-100",
    cleaning: "from-emerald-100 to-teal-100",
    consistency: "from-blue-100 to-indigo-100",
    organizing: "from-purple-100 to-pink-100",
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mb-2">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Your Achievements
          </h1>
          <p className="text-lg text-gray-600">
            Celebrate every step of your journey to digital wellness 🌟
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/60 rounded-xl">
                  <p className="text-4xl font-bold text-amber-600 mb-2">
                    {earnedCount}
                  </p>
                  <p className="text-gray-600">Badges Earned</p>
                </div>
                <div className="text-center p-6 bg-white/60 rounded-xl">
                  <p className="text-4xl font-bold text-emerald-600 mb-2">
                    {user?.total_files_cleaned || 0}
                  </p>
                  <p className="text-gray-600">Files Cleaned</p>
                </div>
                <div className="text-center p-6 bg-white/60 rounded-xl">
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {user?.cleaning_streak_days || 0}
                  </p>
                  <p className="text-gray-600">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">All Badges</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AVAILABLE_BADGES.map((badge, index) => {
              const isEarned = earnedBadgeNames.has(badge.name);
              const earned = achievements.find(
                (a) => a.badge_name === badge.name,
              );

              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`border-2 transition-all duration-300 ${
                      isEarned
                        ? "border-amber-400 shadow-xl"
                        : "border-gray-200 opacity-60"
                    }`}
                  >
                    <CardContent
                      className={`p-6 bg-gradient-to-br ${categoryColors[badge.category]}`}
                    >
                      <div className="text-center space-y-4">
                        <div className="relative inline-block">
                          <div className="text-6xl">{badge.icon}</div>
                          {!isEarned && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-700 mb-3">
                            {badge.description}
                          </p>

                          {isEarned && earned ? (
                            <div className="bg-white/60 rounded-lg p-2">
                              <p className="text-xs text-gray-600">
                                Earned{" "}
                                {format(
                                  new Date(earned.earned_date),
                                  "MMM d, yyyy",
                                )}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white/40 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Locked</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-lg bg-gradient-to-r from-lavender-100 to-cyan-100">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-lavender-600" />
              <p className="text-lg text-gray-700 italic">
                {earnedCount === 0 &&
                  "Start your journey today! Every small step counts. 🌱"}
                {earnedCount > 0 &&
                  earnedCount < 3 &&
                  "You're off to a wonderful start! Keep going! 🌸"}
                {earnedCount >= 3 &&
                  earnedCount < 6 &&
                  "Amazing progress! You're creating beautiful habits. ✨"}
                {earnedCount >= 6 &&
                  "You're a true digital wellness champion! 🏆"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

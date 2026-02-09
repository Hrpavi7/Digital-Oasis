import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";

export default function ChallengeCard({ challenge, progress, onJoin }) {
  const progressPercentage = progress
    ? (progress.current_value / challenge.target_value) * 100
    : 0;
  const daysLeft = differenceInDays(new Date(challenge.ends_at), new Date());
  const isCompleted = progress?.is_completed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`border-2 ${
          isCompleted
            ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
            : challenge.is_team_challenge
              ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50"
              : "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50"
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`text-4xl ${isCompleted ? "grayscale-0" : "grayscale"}`}
              >
                {challenge.badge_icon}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {challenge.challenge_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      challenge.challenge_type === "weekly"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {challenge.challenge_type}
                  </Badge>
                  {challenge.is_team_challenge && (
                    <Badge className="bg-purple-600 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      Team
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isCompleted && <Trophy className="w-8 h-8 text-green-600" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{challenge.description}</p>

          {progress ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">
                  {progress.current_value}/{challenge.target_value}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          ) : (
            <button
              onClick={onJoin}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold"
            >
              Join Challenge
            </button>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="w-4 h-4" />
              <span className="font-semibold">
                {challenge.bonus_points} bonus points
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Target, Users as UsersIcon, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import GamificationDashboard from "../components/gamification/GamificationDashboard";
import ChallengeCard from "../components/gamification/ChallengeCard";
import TeamManager from "../components/gamification/TeamManager";

export default function Gamification() {
  const [user, setUser] = useState(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState("all");

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: () =>
      base44.entities.Challenge.filter({ is_active: true }, "-created_date"),
    initialData: [],
  });

  const { data: myProgress } = useQuery({
    queryKey: ["challengeProgress", user?.email],
    queryFn: () =>
      base44.entities.ChallengeProgress.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: teams } = useQuery({
    queryKey: ["myTeams", user?.email],
    queryFn: async () => {
      const allTeams = await base44.entities.Team.filter({});
      return allTeams.filter(
        (t) =>
          t.members?.includes(user?.email) || t.team_leader === user?.email,
      );
    },
    enabled: !!user,
    initialData: [],
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId) => {
      return base44.entities.ChallengeProgress.create({
        challenge_id: challengeId,
        user_email: user.email,
        current_value: 0,
        is_completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challengeProgress"] });
    },
  });

  const weeklyChallenges = challenges.filter(
    (c) => c.challenge_type === "weekly",
  );
  const monthlyChallenges = challenges.filter(
    (c) => c.challenge_type === "monthly",
  );
  const teamChallenges = challenges.filter((c) => c.is_team_challenge);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Your Digital Journey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your progress, compete with friends, and unlock achievements
            as you master digital wellness 🏆
          </p>
        </motion.div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <GamificationDashboard user={user} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-8">
            <div className="space-y-8">
              {/* Weekly Challenges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Weekly Challenges
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeklyChallenges.map((challenge) => {
                    const progress = myProgress.find(
                      (p) => p.challenge_id === challenge.id,
                    );
                    return (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        progress={progress}
                        onJoin={() => joinChallenge.mutate(challenge.id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Monthly Challenges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Monthly Challenges
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthlyChallenges.map((challenge) => {
                    const progress = myProgress.find(
                      (p) => p.challenge_id === challenge.id,
                    );
                    return (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        progress={progress}
                        onJoin={() => joinChallenge.mutate(challenge.id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Team Challenges */}
              {teamChallenges.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UsersIcon className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Team Challenges
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamChallenges.map((challenge) => {
                      const progress = myProgress.find(
                        (p) => p.challenge_id === challenge.id,
                      );
                      return (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          progress={progress}
                          onJoin={() => joinChallenge.mutate(challenge.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-8">
            <TeamManager user={user} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-8">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-600" />
                    Global Leaderboard
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <Select
                      value={leaderboardFilter}
                      onValueChange={setLeaderboardFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="team">My Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {leaderboardFilter === "all" && (
                  <GamificationDashboard user={user} />
                )}
                {leaderboardFilter === "team" && teams.length > 0 && (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <Card key={team.id} className="bg-purple-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{team.team_icon}</span>
                              <div>
                                <h4 className="font-bold">{team.team_name}</h4>
                                <p className="text-sm text-gray-600">
                                  {team.members?.length} members • Level{" "}
                                  {team.team_level}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-purple-600">
                                {team.total_points}
                              </p>
                              <p className="text-xs text-gray-600">points</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {leaderboardFilter === "friends" && (
                  <p className="text-center text-gray-500 py-8">
                    Friend leaderboard coming soon! Invite friends to compete
                    together.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

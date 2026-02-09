import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Crown, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamManager({ user }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    team_name: "",
    description: "",
    team_icon: "🌟",
  });
  const queryClient = useQueryClient();

  const { data: teams } = useQuery({
    queryKey: ["teams", user?.email],
    queryFn: async () => {
      const myTeams = await base44.entities.Team.filter({});
      return myTeams.filter(
        (t) =>
          t.members?.includes(user?.email) || t.team_leader === user?.email,
      );
    },
    enabled: !!user,
    initialData: [],
  });

  const createTeam = useMutation({
    mutationFn: async (teamData) => {
      return base44.entities.Team.create({
        ...teamData,
        team_leader: user.email,
        members: [user.email],
        total_points: 0,
        team_level: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setShowCreateForm(false);
      setNewTeam({ team_name: "", description: "", team_icon: "🌟" });
    },
  });

  const ICON_OPTIONS = ["🌟", "🚀", "🔥", "⚡", "🎯", "💎", "🌈", "🎨"]; // :insert tiktok emoji peter: Petah?

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              My Teams
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="bg-white border-purple-200">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label>Team Name</Label>
                      <Input
                        value={newTeam.team_name}
                        onChange={(e) =>
                          setNewTeam({ ...newTeam, team_name: e.target.value })
                        }
                        placeholder="e.g., Digital Warriors"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newTeam.description}
                        onChange={(e) =>
                          setNewTeam({
                            ...newTeam,
                            description: e.target.value,
                          })
                        }
                        placeholder="Tell others about your team..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Team Icon</Label>
                      <div className="flex gap-2 mt-2">
                        {ICON_OPTIONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() =>
                              setNewTeam({ ...newTeam, team_icon: icon })
                            }
                            className={`text-3xl p-2 rounded-lg transition-all ${
                              newTeam.team_icon === icon
                                ? "bg-purple-200 scale-125"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createTeam.mutate(newTeam)}
                        disabled={createTeam.isPending || !newTeam.team_name}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        Create Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {teams.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No teams yet. Create one to compete together!
            </p>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <Card key={team.id} className="bg-white border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{team.team_icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                              {team.team_name}
                            </h4>
                            {team.team_leader === user?.email && (
                              <Crown className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {team.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="p-2 bg-purple-50 rounded-lg text-center">
                        <Users className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                        <p className="text-xs text-gray-600">Members</p>
                        <p className="font-bold text-gray-900">
                          {team.members?.length || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                        <p className="text-xs text-gray-600">Level</p>
                        <p className="font-bold text-gray-900">
                          {team.team_level}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <p className="text-xs text-gray-600">Points</p>
                        <p className="font-bold text-gray-900">
                          {team.total_points}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.members?.slice(0, 5).map((member, idx) => (
                        <Badge key={idx} variant="secondary">
                          {member.split("@")[0]}
                        </Badge>
                      ))}
                      {team.members?.length > 5 && (
                        <Badge variant="secondary">
                          +{team.members.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

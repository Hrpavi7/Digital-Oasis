import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Zap,
  Heart,
  Leaf,
  TrendingUp,
  Calendar,
  Brain,
  AlertCircle,
  CheckCircle,
  Archive as ArchiveIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import SecurityAudit from "../components/security/SecurityAudit";

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [user, setUser] = useState(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proactiveArchives, setProactiveArchives] = useState(null);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ["cleaningSessions"],
    queryFn: () => base44.entities.CleaningSession.list("-created_date", 10),
    initialData: [],
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => base44.entities.Achievement.list(),
    initialData: [],
  });

  const totalSpaceFreed = user?.total_space_freed_mb || 0;
  const totalFilesCleaned = user?.total_files_cleaned || 0;
  const cleaningStreak = user?.cleaning_streak_days || 0;

  const computerHealth = Math.min(100, 50 + totalFilesCleaned * 0.5);

  const messages = {
    cozy_friend: [
      "Your space is looking lovely today! 🌸",
      "Ready to create some calm together?",
      "I'm here to help you breathe easier.",
    ],
    productivity_coach: [
      "Let's optimize your digital workspace!",
      "Time to boost your productivity! 💪",
      "Small steps lead to big improvements.",
    ],
    gentle_fairy: [
      "Sprinkling some digital magic your way ✨",
      "Let's make your space sparkle!",
      "Every file organized is a wish granted 🌟",
    ],
    minimalist_guru: [
      "Less clutter, more clarity.",
      "Simplicity is the ultimate sophistication.",
      "Let go of what no longer serves you.",
    ],
  };

  const assistantTone = user?.assistant_tone || "cozy_friend";
  const dailyMessage =
    messages[assistantTone][
      Math.floor(Math.random() * messages[assistantTone].length)
    ];

  const analyzeProactiveArchiving = async () => {
    setIsLoadingArchives(true);

    try {
      const learnedPrefs = user?.ai_preferences?.learned_preferences || [];
      const autoArchiveDays = user?.ai_preferences?.auto_archive_days || 180;

      const prompt = `You are an AI archiving assistant. Analyze user's file access patterns and preferences to suggest proactive archiving.

User Preferences:
- Auto-archive threshold: ${autoArchiveDays} days
- Learned actions: ${learnedPrefs.length} user choices recorded
- User tends to: ${learnedPrefs
        .slice(-10)
        .map((p) => p.action)
        .join(", ")}

Suggest:
1. Files to move to yearly archives (2020, 2021, 2022, 2023)
2. Custom archive categories based on user patterns
3. Estimated performance improvement
4. Risk level for each suggestion

Return JSON:
{
  "yearly_archives": [
    {
      "year": "2023",
      "files": ["file1", "file2"],
      "total_size_mb": number,
      "reason": "why archive these"
    }
  ],
  "custom_archives": [
    {
      "archive_name": "name",
      "description": "what goes here",
      "files": ["files"],
      "pattern": "what pattern identified"
    }
  ],
  "performance_impact": {
    "estimated_speed_gain": "percentage",
    "space_freed": "amount"
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            yearly_archives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  year: { type: "string" },
                  files: { type: "array", items: { type: "string" } },
                  total_size_mb: { type: "number" },
                  reason: { type: "string" },
                },
              },
            },
            custom_archives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  archive_name: { type: "string" },
                  description: { type: "string" },
                  files: { type: "array", items: { type: "string" } },
                  pattern: { type: "string" },
                },
              },
            },
            performance_impact: {
              type: "object",
              properties: {
                estimated_speed_gain: { type: "string" },
                space_freed: { type: "string" },
              },
            },
          },
        },
      });

      setProactiveArchives(result);
    } catch (error) {
      console.error("Error analyzing archives:", error);
    }

    setIsLoadingArchives(false);
  };

  const executeArchiving = useMutation({
    mutationFn: async (archiveData) => {
      // Simulate execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update user preferences with this action
      const updatedPrefs = user.ai_preferences?.learned_preferences || [];
      updatedPrefs.push({
        action: "auto_archive",
        files_count: archiveData.files.length,
        timestamp: new Date().toISOString(),
      });

      await base44.auth.updateMe({
        ai_preferences: {
          ...user.ai_preferences,
          learned_preferences: updatedPrefs.slice(-50),
        },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setProactiveArchives(null);
    },
  });

  const analyzePerformance = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `You are an AI performance optimization assistant. Analyze this system data and provide actionable recommendations.

System Stats:
- Total Files Cleaned: ${totalFilesCleaned}
- Total Space Freed: ${(totalSpaceFreed / 1024).toFixed(2)} GB
- Computer Health Score: ${computerHealth}%
- Recent Sessions: ${sessions.length}

User's Risk Tolerance: Medium (can suggest moderate optimizations)

Provide JSON with:
{
  "performance_score": number,
  "bottlenecks": [{ "issue": string, "impact": "high/medium/low", "description": string }],
  "recommendations": [
    { 
      "action": string, 
      "benefit": string, 
      "estimated_gain": string, 
      "priority": "high/medium/low",
      "executable": boolean,
      "risk_level": "low/medium/high",
      "execution_details": "what will be done"
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            performance_score: { type: "number" },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  impact: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  benefit: { type: "string" },
                  estimated_gain: { type: "string" },
                  priority: { type: "string" },
                  executable: { type: "boolean" },
                  risk_level: { type: "string" },
                  execution_details: { type: "string" },
                },
              },
            },
          },
        },
      });

      setPerformanceAnalysis(result);
    } catch (error) {
      console.error("Error analyzing performance:", error);
    }

    setIsAnalyzing(false);
  };

  const executeOptimization = useMutation({
    mutationFn: async (recommendation) => {
      // Simulate execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Learn from this action
      const updatedPrefs = user.ai_preferences?.learned_preferences || [];
      updatedPrefs.push({
        action: "optimization_executed",
        optimization: recommendation.action,
        timestamp: new Date().toISOString(),
      });

      await base44.auth.updateMe({
        ai_preferences: {
          ...user.ai_preferences,
          learned_preferences: updatedPrefs.slice(-50),
        },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sage-600 to-lavender-600 bg-clip-text text-transparent">
            {greeting}, {user?.full_name?.split(" ")[0] || "friend"}
          </h1>
          <p className="text-lg text-gray-600 italic">{dailyMessage}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-sage-50/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-lavender-200/30 to-transparent rounded-full blur-3xl" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="w-6 h-6 text-rose-400" />
                Your Digital Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Computer Health</span>
                  <span className="text-2xl font-bold text-sage-600">
                    {computerHealth.toFixed(0)}%
                  </span>
                </div>
                <Progress value={computerHealth} className="h-3" />
                <p className="text-sm text-gray-500">
                  {computerHealth < 60 &&
                    "Your computer could use some love and care 💚"}
                  {computerHealth >= 60 &&
                    computerHealth < 85 &&
                    "You're doing great! Keep up the good work 🌿"}
                  {computerHealth >= 85 &&
                    "Wonderful! Your space is thriving ✨"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {totalFilesCleaned}
                  </p>
                  <p className="text-xs text-gray-600">Files Cleaned</p>
                </div>
                <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center">
                  <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalSpaceFreed / 1024).toFixed(1)}GB
                  </p>
                  <p className="text-xs text-gray-600">Space Freed</p>
                </div>
                <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {cleaningStreak}
                  </p>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Audit Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <SecurityAudit user={user} />
        </motion.div>

        {/* Proactive Archiving */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArchiveIcon className="w-6 h-6 text-cyan-600" />
                AI-Driven Proactive Archiving
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!proactiveArchives ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Let AI analyze your file patterns and suggest smart
                    archiving based on learned preferences
                  </p>
                  <Button
                    onClick={analyzeProactiveArchiving}
                    disabled={isLoadingArchives}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    {isLoadingArchives
                      ? "Analyzing..."
                      : "Analyze for Archiving"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Performance Impact */}
                  <div className="p-4 bg-white/60 rounded-xl border border-cyan-200">
                    <h4 className="font-semibold mb-2">
                      Expected Performance Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Speed Gain</p>
                        <p className="text-xl font-bold text-green-600">
                          {
                            proactiveArchives.performance_impact
                              ?.estimated_speed_gain
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Space Freed</p>
                        <p className="text-xl font-bold text-blue-600">
                          {proactiveArchives.performance_impact?.space_freed}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Archives */}
                  {proactiveArchives.yearly_archives?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">
                        Yearly Archive Suggestions
                      </h4>
                      <div className="space-y-2">
                        {proactiveArchives.yearly_archives.map(
                          (archive, idx) => (
                            <Card
                              key={idx}
                              className="bg-white/60 border-cyan-200"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold">
                                      Archive {archive.year}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {archive.reason}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="secondary">
                                        {archive.files.length} files
                                      </Badge>
                                      <Badge variant="secondary">
                                        {(archive.total_size_mb / 1024).toFixed(
                                          2,
                                        )}{" "}
                                        GB
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      executeArchiving.mutate(archive)
                                    }
                                    disabled={executeArchiving.isPending}
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Execute
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Archives */}
                  {proactiveArchives.custom_archives?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">
                        Custom Archive Suggestions
                      </h4>
                      <div className="space-y-2">
                        {proactiveArchives.custom_archives.map(
                          (archive, idx) => (
                            <Card
                              key={idx}
                              className="bg-white/60 border-blue-200"
                            >
                              <CardContent className="p-4">
                                <h5 className="font-semibold">
                                  {archive.archive_name}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {archive.description}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                  Pattern: {archive.pattern}
                                </p>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setProactiveArchives(null)}
                    className="w-full"
                  >
                    Run New Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Performance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                AI Performance Analysis (Actionable)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!performanceAnalysis ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Let AI analyze your system and provide actionable
                    optimization recommendations
                  </p>
                  <Button
                    onClick={analyzePerformance}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Performance"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/60 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Performance Score
                      </h3>
                      <span className="text-3xl font-bold text-indigo-600">
                        {performanceAnalysis.performance_score}%
                      </span>
                    </div>
                    <Progress
                      value={performanceAnalysis.performance_score}
                      className="h-3"
                    />
                  </div>

                  {performanceAnalysis.bottlenecks?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Identified Bottlenecks
                      </h3>
                      <div className="space-y-2">
                        {performanceAnalysis.bottlenecks.map(
                          (bottleneck, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${
                                bottleneck.impact === "high"
                                  ? "bg-red-50 border-red-200"
                                  : bottleneck.impact === "medium"
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-blue-50 border-blue-200"
                              } border`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {bottleneck.issue}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    bottleneck.impact === "high"
                                      ? "bg-red-200 text-red-800"
                                      : bottleneck.impact === "medium"
                                        ? "bg-amber-200 text-amber-800"
                                        : "bg-blue-200 text-blue-800"
                                  }`}
                                >
                                  {bottleneck.impact} impact
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {bottleneck.description}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {performanceAnalysis.recommendations?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Actionable AI Recommendations
                      </h3>
                      <div className="space-y-3">
                        {performanceAnalysis.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white/60 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{rec.action}</h4>
                                  <Badge
                                    className={`text-xs ${
                                      rec.priority === "high"
                                        ? "bg-green-200 text-green-800"
                                        : rec.priority === "medium"
                                          ? "bg-blue-200 text-blue-800"
                                          : "bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    {rec.priority} priority
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${
                                      rec.risk_level === "low"
                                        ? "bg-green-100 text-green-700"
                                        : rec.risk_level === "medium"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {rec.risk_level} risk
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {rec.benefit}
                                </p>
                                <p className="text-xs text-green-600 font-medium mb-2">
                                  Expected gain: {rec.estimated_gain}
                                </p>
                                {rec.executable && (
                                  <p className="text-xs text-gray-500 italic">
                                    {rec.execution_details}
                                  </p>
                                )}
                              </div>
                              {rec.executable && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    executeOptimization.mutate(rec)
                                  }
                                  disabled={executeOptimization.isPending}
                                  className="ml-4 bg-indigo-600 hover:bg-indigo-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Execute
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setPerformanceAnalysis(null)}
                    className="w-full"
                  >
                    Run New Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Link to={createPageUrl("Scan")}>
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-br from-lavender-100 to-lavender-200 h-full">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-lavender-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Start Cleaning
                  </h3>
                  <p className="text-gray-600">
                    Scan and refresh your digital space
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Organize")}>
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-br from-sage-100 to-sage-200 h-full">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-sage-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Organize Files
                  </h3>
                  <p className="text-gray-600">
                    Create harmony in your folders
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sage-600" />
                  Recent Cleaning Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-sage-50/50 rounded-xl hover:bg-sage-100/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.files_cleaned} files cleaned
                        </p>
                        <p className="text-sm text-gray-600">
                          {(session.space_freed_mb / 1024).toFixed(2)} GB freed
                          • {session.session_duration_minutes} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(session.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {achievements.slice(0, 5).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex-shrink-0 bg-white rounded-xl p-4 text-center min-w-[120px] shadow-sm"
                    >
                      <div className="text-3xl mb-2">
                        {achievement.badge_icon}
                      </div>
                      <p className="font-medium text-sm text-gray-900">
                        {achievement.badge_name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

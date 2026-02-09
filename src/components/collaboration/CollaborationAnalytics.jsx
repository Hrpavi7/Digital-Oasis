import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function CollaborationAnalytics({ user }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const { data: activityFeed } = useQuery({
    queryKey: ["activityFeed"],
    queryFn: () => base44.entities.ActivityFeed.list("-created_date", 100),
    initialData: [],
  });

  const { data: sharedItems } = useQuery({
    queryKey: ["sharedItems"],
    queryFn: () => base44.entities.SharedItem.list(),
    initialData: [],
  });

  const { data: comments } = useQuery({
    queryKey: ["documentComments"],
    queryFn: () => base44.entities.DocumentComment.list("-created_date", 100),
    initialData: [],
  });

  const analyzeTeamDynamics = async () => {
    setIsAnalyzing(true);

    try {
      // Aggregate activity data
      const activityByUser = {};
      activityFeed.forEach((activity) => {
        if (!activityByUser[activity.user_email]) {
          activityByUser[activity.user_email] = {
            created: 0,
            edited: 0,
            commented: 0,
            total: 0,
          };
        }
        activityByUser[activity.user_email][activity.action_type] =
          (activityByUser[activity.user_email][activity.action_type] || 0) + 1;
        activityByUser[activity.user_email].total++;
      });

      // Document metrics
      const documentsWithComments = [
        ...new Set(comments.map((c) => c.document_id)),
      ].length;
      const unresolvedComments = comments.filter((c) => !c.is_resolved).length;
      const avgCommentsPerDoc = comments.length / (documentsWithComments || 1);

      const prompt = `You are an AI collaboration analyst for Digital Oasis. Analyze team dynamics and provide insights.

Team Activity Data:
- Total activities: ${activityFeed.length}
- Active team members: ${Object.keys(activityByUser).length}
- Shared items: ${sharedItems.length}
- Total comments: ${comments.length}
- Unresolved comments: ${unresolvedComments}
- Documents with collaboration: ${documentsWithComments}
- Average comments per document: ${avgCommentsPerDoc.toFixed(1)}

Activity breakdown: ${JSON.stringify(activityByUser)}

Analyze and provide JSON:
{
  "team_health_score": number (0-100),
  "productivity_rating": "excellent/good/needs_improvement",
  "communication_patterns": {
    "description": "analysis of communication patterns",
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"]
  },
  "bottlenecks": [
    {
      "issue": "bottleneck description",
      "severity": "high/medium/low",
      "affected_area": "area name",
      "suggestion": "how to resolve"
    }
  ],
  "optimization_strategies": [
    {
      "strategy": "strategy name",
      "description": "detailed description",
      "expected_impact": "impact description",
      "priority": "high/medium/low"
    }
  ],
  "key_insights": ["insight1", "insight2", "insight3"],
  "response_time_analysis": "analysis of how quickly team responds",
  "collaboration_balance": "whether workload is balanced across team"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            team_health_score: { type: "number" },
            productivity_rating: { type: "string" },
            communication_patterns: {
              type: "object",
              properties: {
                description: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                concerns: { type: "array", items: { type: "string" } },
              },
            },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  affected_area: { type: "string" },
                  suggestion: { type: "string" },
                },
              },
            },
            optimization_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  description: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string" },
                },
              },
            },
            key_insights: { type: "array", items: { type: "string" } },
            response_time_analysis: { type: "string" },
            collaboration_balance: { type: "string" },
          },
        },
      });

      setInsights(result);
    } catch (error) {
      console.error("Error analyzing team dynamics:", error);
    }

    setIsAnalyzing(false);
  };

  // Activity chart data
  const activityChartData = activityFeed
    .slice(0, 20)
    .reverse()
    .map((activity, idx) => ({
      name: `Activity ${idx + 1}`,
      count: 1,
      type: activity.action_type,
    }));

  return (
    <div className="space-y-6">
      {/* Header with Analyze Button */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Team Dynamics & Productivity AI
              </h2>
              <p className="text-gray-600">
                Get AI-powered insights into collaboration patterns,
                bottlenecks, and optimization strategies
              </p>
            </div>
            <Button
              onClick={analyzeTeamDynamics}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Team
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{sharedItems.length}</p>
                <p className="text-sm text-gray-600">Shared Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{comments.length}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activityFeed.length}</p>
                <p className="text-sm text-gray-600">Team Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">
                  {comments.filter((c) => !c.is_resolved).length}
                </p>
                <p className="text-sm text-gray-600">Pending Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Team Health Score */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Team Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-green-600">
                  {insights.team_health_score}%
                </span>
                <Badge
                  className={
                    insights.productivity_rating === "excellent"
                      ? "bg-green-600"
                      : insights.productivity_rating === "good"
                        ? "bg-blue-600"
                        : "bg-amber-600"
                  }
                >
                  {insights.productivity_rating}
                </Badge>
              </div>
              <Progress value={insights.team_health_score} className="h-3" />
              <p className="text-sm text-gray-600">
                {insights.collaboration_balance}
              </p>
            </CardContent>
          </Card>

          {/* Communication Patterns */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                Communication Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {insights.communication_patterns?.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {insights.communication_patterns?.strengths?.map(
                      (strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {strength}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {insights.communication_patterns?.concerns?.map(
                      (concern, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {concern}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Response Time Analysis
                </h4>
                <p className="text-sm text-gray-700">
                  {insights.response_time_analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bottlenecks */}
          {insights.bottlenecks?.length > 0 && (
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Identified Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.bottlenecks.map((bottleneck, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      bottleneck.severity === "high"
                        ? "bg-red-50 border-red-500"
                        : bottleneck.severity === "medium"
                          ? "bg-amber-50 border-amber-500"
                          : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {bottleneck.issue}
                      </h4>
                      <Badge
                        className={
                          bottleneck.severity === "high"
                            ? "bg-red-600"
                            : bottleneck.severity === "medium"
                              ? "bg-amber-600"
                              : "bg-blue-600"
                        }
                      >
                        {bottleneck.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Affected:</strong> {bottleneck.affected_area}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>💡 Suggestion:</strong> {bottleneck.suggestion}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Optimization Strategies */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Optimization Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.optimization_strategies?.map((strategy, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {strategy.strategy}
                    </h4>
                    <Badge
                      className={
                        strategy.priority === "high"
                          ? "bg-green-600"
                          : strategy.priority === "medium"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                      }
                    >
                      {strategy.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {strategy.description}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Expected Impact:</strong> {strategy.expected_impact}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.key_insights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Chart */}
      {activityChartData.length > 0 && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Recent Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

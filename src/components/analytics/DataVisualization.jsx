import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Download, Sparkles, Calendar, FileText, Archive } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function DataVisualization({ user }) {
  const [chartType, setChartType] = useState("bar");
  const [timeRange, setTimeRange] = useState("week");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const { data: sessions } = useQuery({
    queryKey: ["cleaningSessions"],
    queryFn: () => base44.entities.CleaningSession.list("-created_date", 50),
    initialData: [],
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => base44.entities.Achievement.list("-created_date"),
    initialData: [],
  });

  // Prepare data for cleaning history
  const cleaningData = sessions
    .slice(0, 10)
    .reverse()
    .map((session, idx) => ({
      name: `Session ${idx + 1}`,
      files: session.files_cleaned,
      space: (session.space_freed_mb / 1024).toFixed(2),
      duration: session.session_duration_minutes,
    }));

  // Prepare data for file type distribution (mock data)
  const fileTypeData = [
    { name: "Documents", value: 35, files: 245 },
    { name: "Images", value: 25, files: 180 },
    { name: "Videos", value: 20, files: 45 },
    { name: "Archives", value: 10, files: 67 },
    { name: "Cache", value: 10, files: 523 },
  ];

  // Achievement progress by category
  const achievementData = [
    {
      category: "Cleaning",
      count: achievements.filter((a) => a.category === "cleaning").length,
    },
    {
      category: "Organizing",
      count: achievements.filter((a) => a.category === "organizing").length,
    },
    {
      category: "Consistency",
      count: achievements.filter((a) => a.category === "consistency").length,
    },
    {
      category: "Milestones",
      count: achievements.filter((a) => a.category === "milestone").length,
    },
  ].filter((d) => d.count > 0);

  // Performance over time
  const performanceData = sessions
    .slice(0, 7)
    .reverse()
    .map((session) => ({
      date: new Date(session.created_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      spaceMB: session.space_freed_mb,
      files: session.files_cleaned,
    }));

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);

    try {
      const totalSpace = sessions.reduce((acc, s) => acc + s.space_freed_mb, 0);
      const totalFiles = sessions.reduce((acc, s) => acc + s.files_cleaned, 0);
      const avgSession = sessions.length > 0 ? totalSpace / sessions.length : 0;

      const prompt = `You are an AI data analyst for Digital Oasis. Analyze this user's cleaning data and provide insights.

Data Summary:
- Total cleaning sessions: ${sessions.length}
- Total space freed: ${(totalSpace / 1024).toFixed(2)} GB
- Total files cleaned: ${totalFiles}
- Average per session: ${(avgSession / 1024).toFixed(2)} GB
- Achievements earned: ${achievements.length}

Provide a JSON response with:
{
  "key_insights": ["insight1", "insight2", "insight3"],
  "trends": "description of trends observed",
  "recommendations": ["recommendation1", "recommendation2"],
  "performance_rating": "excellent/good/needs_improvement"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            key_insights: { type: "array", items: { type: "string" } },
            trends: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            performance_rating: { type: "string" },
          },
        },
      });

      setAiInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
    }

    setIsGeneratingInsights(false);
  };

  const exportData = () => {
    const csvContent = [
      ["Session", "Files Cleaned", "Space Freed (GB)", "Duration (min)"],
      ...cleaningData.map((d) => [d.name, d.files, d.space, d.duration]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "digital-oasis-data.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Chart Type
                </label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Time Range
                </label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={generateAIInsights}
                disabled={isGeneratingInsights}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingInsights ? "Analyzing..." : "AI Insights"}
              </Button>
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Performance Rating
                  </h4>
                  <Badge
                    className={
                      aiInsights.performance_rating === "excellent"
                        ? "bg-green-600"
                        : aiInsights.performance_rating === "good"
                          ? "bg-blue-600"
                          : "bg-amber-600"
                    }
                  >
                    {aiInsights.performance_rating}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {aiInsights.key_insights?.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Trends</h4>
                <p className="text-sm text-gray-700">{aiInsights.trends}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {aiInsights.recommendations?.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded"
                    >
                      💡 {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              Cleaning History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
                <BarChart data={cleaningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="files" fill="#8b5cf6" name="Files Cleaned" />
                </BarChart>
              ) : (
                <LineChart data={cleaningData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="files"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Files Cleaned"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-purple-600" />
              File Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Archive className="w-5 h-5 text-green-600" />
              Space Freed Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spaceMB"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Space (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {achievementData.length > 0 && (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={achievementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Achievements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

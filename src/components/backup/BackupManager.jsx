import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Cloud, Clock, CheckCircle, AlertCircle, Sparkles, Plus, Loader2, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function BackupManager() {
  const [showForm, setShowForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newBackup, setNewBackup] = useState({
    backup_name: "",
    backup_type: "incremental",
    schedule: "weekly",
    backup_location: "cloud",
    retention_days: 30,
  });

  const queryClient = useQueryClient();

  const { data: backups } = useQuery({
    queryKey: ["backupConfigurations"],
    queryFn: () => base44.entities.BackupConfiguration.list("-created_date"),
    initialData: [],
  });

  const { data: history } = useQuery({
    queryKey: ["backupHistory"],
    queryFn: () => base44.entities.BackupHistory.list("-created_date", 10),
    initialData: [],
  });

  const createBackup = useMutation({
    mutationFn: (backupData) => {
      const nextBackup = new Date();
      if (backupData.schedule === "daily")
        nextBackup.setDate(nextBackup.getDate() + 1);
      else if (backupData.schedule === "weekly")
        nextBackup.setDate(nextBackup.getDate() + 7);
      else if (backupData.schedule === "monthly")
        nextBackup.setMonth(nextBackup.getMonth() + 1);

      return base44.entities.BackupConfiguration.create({
        ...backupData,
        next_backup: nextBackup.toISOString(),
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backupConfigurations"] });
      setShowForm(false);
      setNewBackup({
        backup_name: "",
        backup_type: "incremental",
        schedule: "weekly",
        backup_location: "cloud",
        retention_days: 30,
      });
    },
  });

  const analyzeBackups = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `You are an AI backup optimization assistant. Analyze user's data and suggest optimal backup strategies.

Current Backups: ${backups.length}
User Activity: Regular file organization and cleaning

Suggest:
1. Optimal backup type (full, incremental, differential)
2. Best schedule based on user activity
3. Retention policy recommendations
4. Which files/folders to prioritize

Return JSON:
{
  "recommended_type": "string",
  "recommended_schedule": "string",
  "recommended_retention": number,
  "priority_folders": ["list"],
  "reasoning": "why these recommendations",
  "estimated_space": "how much space needed"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_type: { type: "string" },
            recommended_schedule: { type: "string" },
            recommended_retention: { type: "number" },
            priority_folders: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" },
            estimated_space: { type: "string" },
          },
        },
      });

      setAiSuggestions(result);
    } catch (error) {
      console.error("Error analyzing backups:", error);
    }

    setIsAnalyzing(false);
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setNewBackup({
        backup_name: "AI-Optimized Backup",
        backup_type: aiSuggestions.recommended_type,
        schedule: aiSuggestions.recommended_schedule,
        backup_location: "cloud",
        retention_days: aiSuggestions.recommended_retention,
      });
      setShowForm(true);
      setAiSuggestions(null);
    }
  };

  return (
    <div className="space-y-6">
      {!aiSuggestions && (
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">AI Backup Analysis</h3>
            <p className="text-gray-600 mb-4">
              Let AI analyze your data and suggest optimal backup strategies
            </p>
            <Button
              onClick={analyzeBackups}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {aiSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  AI Backup Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Backup Type</p>
                    <p className="text-lg font-bold capitalize">
                      {aiSuggestions.recommended_type}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Schedule</p>
                    <p className="text-lg font-bold capitalize">
                      {aiSuggestions.recommended_schedule}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Retention</p>
                    <p className="text-lg font-bold">
                      {aiSuggestions.recommended_retention} days
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-semibold mb-2">
                    Priority Folders:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.priority_folders.map((folder, idx) => (
                      <Badge key={idx} variant="secondary">
                        {folder}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    {aiSuggestions.reasoning}
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Estimated space: {aiSuggestions.estimated_space}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setAiSuggestions(null)}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={applyAISuggestions}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="border-none shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-600" />
              Backup Configurations
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label>Backup Name</Label>
                      <Input
                        value={newBackup.backup_name}
                        onChange={(e) =>
                          setNewBackup({
                            ...newBackup,
                            backup_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Daily Work Backup"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Backup Type</Label>
                        <Select
                          value={newBackup.backup_type}
                          onValueChange={(value) =>
                            setNewBackup({ ...newBackup, backup_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Backup</SelectItem>
                            <SelectItem value="incremental">
                              Incremental
                            </SelectItem>
                            <SelectItem value="differential">
                              Differential
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Schedule</Label>
                        <Select
                          value={newBackup.schedule}
                          onValueChange={(value) =>
                            setNewBackup({ ...newBackup, schedule: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Location</Label>
                        <Select
                          value={newBackup.backup_location}
                          onValueChange={(value) =>
                            setNewBackup({
                              ...newBackup,
                              backup_location: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cloud">Cloud</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Retention (days)</Label>
                        <Input
                          type="number"
                          value={newBackup.retention_days}
                          onChange={(e) =>
                            setNewBackup({
                              ...newBackup,
                              retention_days: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createBackup.mutate(newBackup)}
                        disabled={
                          createBackup.isPending || !newBackup.backup_name
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Create Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {backups.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No backup configurations yet. Create your first backup!
              </p>
            ) : (
              backups.map((backup) => (
                <Card key={backup.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {backup.backup_name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {backup.backup_type}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {backup.schedule}
                          </Badge>
                          <Badge variant="outline">
                            {backup.backup_location === "cloud" ? (
                              <Cloud className="w-3 h-3 mr-1" />
                            ) : (
                              <HardDrive className="w-3 h-3 mr-1" />
                            )}
                            {backup.backup_location}
                          </Badge>
                          {backup.ai_optimized && (
                            <Badge className="bg-green-600 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Optimized
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch checked={backup.is_active} />
                    </div>
                    {backup.next_backup && (
                      <p className="text-xs text-gray-600">
                        Next backup:{" "}
                        {format(
                          new Date(backup.next_backup),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {history.length > 0 && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      item.status === "success"
                        ? "bg-green-100"
                        : item.status === "failed"
                          ? "bg-red-100"
                          : "bg-blue-100"
                    }`}
                  >
                    {item.status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">
                      {item.backup_type} Backup
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.files_backed_up} files •{" "}
                      {(item.size_mb / 1024).toFixed(2)} GB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.created_date), "MMM d, h:mm a")}
                    </p>
                    {item.duration_seconds && (
                      <p className="text-xs text-gray-500">
                        {item.duration_seconds}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

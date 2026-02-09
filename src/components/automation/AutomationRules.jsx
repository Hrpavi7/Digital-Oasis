import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Zap, AlertTriangle, CheckCircle, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function AutomationRules({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    description: "",
    rule_type: "auto_archive",
    risk_level: "low",
    requires_confirmation: true,
  });

  const queryClient = useQueryClient();

  const { data: rules } = useQuery({
    queryKey: ["automationRules"],
    queryFn: () => base44.entities.AutomationRule.list("-created_date"),
    initialData: [],
  });

  const createRule = useMutation({
    mutationFn: (ruleData) => {
      return base44.entities.AutomationRule.create({
        ...ruleData,
        trigger_conditions: {
          age_days: 180,
          size_threshold_mb: 100,
        },
        action_details: {
          destination: "archive",
        },
        execution_count: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
      setShowForm(false);
      setNewRule({
        rule_name: "",
        description: "",
        rule_type: "auto_archive",
        risk_level: "low",
        requires_confirmation: true,
      });
    },
  });

  const toggleRule = useMutation({
    mutationFn: ({ id, is_active }) => {
      return base44.entities.AutomationRule.update(id, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automationRules"] });
    },
  });

  const suggestRules = async () => {
    setIsAnalyzing(true);

    try {
      const learnedPrefs = user?.ai_preferences?.learned_preferences || [];

      const prompt = `You are an AI automation assistant. Based on user's learned preferences, suggest intelligent automation rules.

User's Action History:
${learnedPrefs
  .slice(-20)
  .map((p) => `- ${p.action} on ${p.file_type} (${p.category})`)
  .join("\n")}

Analyze patterns and suggest:
1. Auto-archive rules (files not accessed in X days)
2. Auto-compress rules (large files in specific categories)
3. Auto-delete rules (temporary files, duplicates)
4. Auto-organize rules (move files to specific folders)
5. Auto-backup rules (critical files)

For each rule, provide:
- Rule name
- Description
- Rule type
- Trigger conditions
- Risk level (low/medium/high)
- Why this helps the user

Return JSON with up to 5 most relevant suggestions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rule_name: { type: "string" },
                  description: { type: "string" },
                  rule_type: { type: "string" },
                  trigger_conditions: { type: "object" },
                  risk_level: { type: "string" },
                  reasoning: { type: "string" },
                },
              },
            },
          },
        },
      });

      setAiSuggestions(result);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }

    setIsAnalyzing(false);
  };

  const applyAISuggestion = (suggestion) => {
    createRule.mutate({
      rule_name: suggestion.rule_name,
      description: suggestion.description,
      rule_type: suggestion.rule_type,
      risk_level: suggestion.risk_level,
      requires_confirmation: suggestion.risk_level !== "low",
      ai_learned: true,
      trigger_conditions: suggestion.trigger_conditions,
      action_details: {},
    });
  };

  const RISK_COLORS = {
    low: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    high: "bg-red-100 text-red-800 border-red-300",
  };

  const RULE_TYPE_ICONS = {
    auto_archive: "📦",
    auto_compress: "🗜️",
    auto_delete: "🗑️",
    auto_organize: "📁",
    auto_backup: "💾",
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      {!aiSuggestions && (
        <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">
              AI-Powered Automation
            </h3>
            <p className="text-gray-600 mb-4">
              Let AI analyze your behavior and suggest intelligent automation
              rules
            </p>
            <Button
              onClick={suggestRules}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? "Analyzing..." : "Get AI Suggestions"}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    AI Automation Suggestions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiSuggestions(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiSuggestions.suggestions?.map((suggestion, idx) => (
                  <Card key={idx} className="bg-white border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {RULE_TYPE_ICONS[suggestion.rule_type]}
                          </span>
                          <div>
                            <h4 className="font-semibold">
                              {suggestion.rule_name}
                            </h4>
                            <Badge
                              className={RISK_COLORS[suggestion.risk_level]}
                            >
                              {suggestion.risk_level} risk
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applyAISuggestion(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Apply
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-blue-600 italic">
                        {suggestion.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Rule Creation */}
      <Card className="border-none shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Automation Rules
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Rule
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
                      <Label>Rule Name</Label>
                      <Input
                        value={newRule.rule_name}
                        onChange={(e) =>
                          setNewRule({ ...newRule, rule_name: e.target.value })
                        }
                        placeholder="e.g., Archive old documents"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newRule.description}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            description: e.target.value,
                          })
                        }
                        placeholder="What does this rule do?"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Rule Type</Label>
                        <Select
                          value={newRule.rule_type}
                          onValueChange={(value) =>
                            setNewRule({ ...newRule, rule_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto_archive">
                              Auto Archive
                            </SelectItem>
                            <SelectItem value="auto_compress">
                              Auto Compress
                            </SelectItem>
                            <SelectItem value="auto_delete">
                              Auto Delete
                            </SelectItem>
                            <SelectItem value="auto_organize">
                              Auto Organize
                            </SelectItem>
                            <SelectItem value="auto_backup">
                              Auto Backup
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Risk Level</Label>
                        <Select
                          value={newRule.risk_level}
                          onValueChange={(value) =>
                            setNewRule({ ...newRule, risk_level: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <Label>Require Confirmation</Label>
                      <Switch
                        checked={newRule.requires_confirmation}
                        onCheckedChange={(checked) =>
                          setNewRule({
                            ...newRule,
                            requires_confirmation: checked,
                          })
                        }
                      />
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
                        onClick={() => createRule.mutate(newRule)}
                        disabled={createRule.isPending || !newRule.rule_name}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Create Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing Rules */}
          <div className="space-y-3">
            {rules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No automation rules yet. Create one or get AI suggestions!
              </p>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">
                          {RULE_TYPE_ICONS[rule.rule_type]}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {rule.rule_name}
                            </h4>
                            {rule.ai_learned && (
                              <Badge className="bg-purple-600 text-white text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={RISK_COLORS[rule.risk_level]}>
                              {rule.risk_level} risk
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rule.rule_type.replace("auto_", "")}
                            </Badge>
                            {rule.requires_confirmation && (
                              <Badge variant="outline" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Needs approval
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) =>
                          toggleRule.mutate({ id: rule.id, is_active: checked })
                        }
                      />
                    </div>
                    {rule.execution_count > 0 && (
                      <div className="text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Executed {rule.execution_count} times
                        {rule.last_executed &&
                          ` • Last: ${format(new Date(rule.last_executed), "MMM d, h:mm a")}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

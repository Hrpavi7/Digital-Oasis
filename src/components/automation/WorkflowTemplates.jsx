import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Clock, CheckCircle, Play, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkflowTemplates({ user }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ["workflowTemplates"],
    queryFn: () =>
      base44.entities.WorkflowTemplate.filter({ created_by: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: automationRules } = useQuery({
    queryKey: ["automationRules"],
    queryFn: () =>
      base44.entities.AutomationRule.filter({ created_by: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ["cleaningSessions"],
    queryFn: () =>
      base44.entities.CleaningSession.filter(
        { created_by: user?.email },
        "-created_date",
        20,
      ),
    enabled: !!user,
    initialData: [],
  });

  const generateTemplates = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      try {
        // Analyze user patterns
        const userPreferences = user?.ai_preferences?.learned_preferences || [];
        const commonActions = {};
        userPreferences.forEach((pref) => {
          commonActions[pref.action] = (commonActions[pref.action] || 0) + 1;
        });

        const sessionPatterns = {
          avg_files_cleaned:
            sessions.length > 0
              ? sessions.reduce((acc, s) => acc + s.files_cleaned, 0) /
                sessions.length
              : 0,
          categories: [
            ...new Set(sessions.flatMap((s) => s.categories_organized || [])),
          ],
          frequency: sessions.length,
        };

        const prompt = `You are an AI workflow optimization assistant for Digital Oasis. Analyze user patterns and suggest personalized workflow templates.

User Activity Patterns:
- Common actions: ${JSON.stringify(commonActions)}
- Automation rules: ${automationRules.length}
- Cleaning sessions: ${sessions.length}
- Average files per session: ${sessionPatterns.avg_files_cleaned.toFixed(0)}
- Categories worked on: ${sessionPatterns.categories.join(", ")}

Generate 4-6 personalized workflow templates that would be most useful for this user. Return JSON array:
[
  {
    "template_name": "template name",
    "description": "what it does",
    "category": "reporting/organization/backup/cleanup/project_setup",
    "steps": [
      {"step": 1, "action": "action description", "details": "specific details"},
      {"step": 2, "action": "action description", "details": "specific details"}
    ],
    "estimated_time": "5 min / 10 min / 30 min",
    "benefits": "why this template is useful for user"
  }
]

Make templates practical, actionable, and tailored to the user's actual usage patterns.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                template_name: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      step: { type: "number" },
                      action: { type: "string" },
                      details: { type: "string" },
                    },
                  },
                },
                estimated_time: { type: "string" },
                benefits: { type: "string" },
              },
            },
          },
        });

        // Create templates in database
        const createPromises = result.map((template) =>
          base44.entities.WorkflowTemplate.create({
            template_name: template.template_name,
            description: template.description,
            category: template.category,
            steps: template.steps,
            estimated_time: template.estimated_time,
            ai_generated: true,
            is_active: false,
          }),
        );

        await Promise.all(createPromises);
      } catch (error) {
        console.error("Error generating templates:", error);
      }

      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["workflowTemplates"] });
    },
  });

  const activateTemplate = useMutation({
    mutationFn: async (templateId) => {
      const template = templates.find((t) => t.id === templateId);

      // Simulate execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await base44.entities.WorkflowTemplate.update(templateId, {
        is_active: true,
        execution_count: (template.execution_count || 0) + 1,
        last_executed: new Date().toISOString(),
      });

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowTemplates"] });
    },
  });

  const categoryIcons = {
    reporting: "📊",
    organization: "📁",
    backup: "🛡️",
    cleanup: "🧹",
    project_setup: "🚀",
  };

  const categoryColors = {
    reporting: "from-blue-100 to-cyan-100",
    organization: "from-purple-100 to-pink-100",
    backup: "from-green-100 to-emerald-100",
    cleanup: "from-amber-100 to-orange-100",
    project_setup: "from-indigo-100 to-violet-100",
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-7 h-7 text-purple-600" />
                AI Workflow Templates
              </h2>
              <p className="text-gray-600">
                Pre-configured workflows tailored to your usage patterns.
                Activate with one click!
              </p>
            </div>
            <Button
              onClick={() => generateTemplates.mutate()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Templates
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {templates.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Templates Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Click "Generate Templates" to let AI create personalized workflows
              based on your activity
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`border-none shadow-xl bg-gradient-to-br ${categoryColors[template.category]} h-full`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">
                          {categoryIcons[template.category]}
                        </span>
                        <div>
                          <CardTitle className="text-lg">
                            {template.template_name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      {template.is_active && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.estimated_time}
                      </div>
                      {template.execution_count > 0 && (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" />
                          {template.execution_count}x used
                        </div>
                      )}
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Workflow Steps:
                      </h4>
                      {template.steps?.map((step, idx) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className="font-semibold text-purple-600">
                            {step.step}.
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {step.action}
                            </p>
                            <p className="text-xs text-gray-600">
                              {step.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {template.ai_generated && (
                      <Badge className="bg-purple-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}

                    <Button
                      onClick={() => activateTemplate.mutate(template.id)}
                      disabled={
                        activateTemplate.isPending || template.is_active
                      }
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {activateTemplate.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Activating...
                        </>
                      ) : template.is_active ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Running
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate Workflow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

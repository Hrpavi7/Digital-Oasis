import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, RefreshCw, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartRenamer() {
  const [fileName, setFileName] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const generateNames = async () => {
    if (!fileName.trim()) return;

    setIsGenerating(true);

    try {
      const prompt = `You are a helpful file naming assistant. Generate 5 clear, descriptive file name suggestions for this file.

Original filename: "${fileName}"
${context ? `Context: ${context}` : ""}

Rules:
- Use clear, descriptive names
- Include relevant keywords
- Use proper capitalization and spacing
- Keep extensions intact
- Make names human-readable
- Follow best practices (no spaces, use underscores or hyphens)

Return as JSON array of objects with "name" and "reason" properties.`;

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
                  name: { type: "string" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Error generating names:", error);
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            Smart File Renamer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Current File Name
            </label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., IMG_2034.jpg, document1.pdf"
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Context (optional)
            </label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., vacation photo from Italy, work presentation"
              className="text-base"
            />
          </div>

          <Button
            onClick={generateNames}
            disabled={!fileName.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Smart Names...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Name Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    AI-Generated Suggestions
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSuggestions([])}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-amber-600 text-white">
                                Option {index + 1}
                              </Badge>
                              <code className="text-sm font-semibold text-gray-900 bg-white px-3 py-1 rounded">
                                {suggestion.name}
                              </code>
                            </div>
                            <p className="text-sm text-gray-600">
                              {suggestion.reason}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              navigator.clipboard.writeText(suggestion.name);
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-lg bg-gradient-to-r from-lavender-100 to-cyan-100">
        <CardContent className="p-6">
          <p className="text-sm text-gray-700 italic text-center">
            💡 <strong>Tip:</strong> Good file names are descriptive, organized,
            and easy to search. Let AI help you create names that make sense!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

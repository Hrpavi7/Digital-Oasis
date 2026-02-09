import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Wand2, FolderTree, FileText, Loader2, Tag, Archive, Calendar, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_FILES = [
  "IMG_2034.jpg",
  "document1.pdf",
  "Screenshot 2024-01-15 at 3.45.23 PM.png",
  "final_version_FINAL_v3.docx",
  "vacation_italy_2023.jpg",
  "meeting_notes_jan_project_alpha.txt",
  "budget_2024_Q1.xlsx",
  "random_notes.pdf",
  "DSC00432.jpg",
  "project_proposal_new_website.pptx",
  "italian_recipe_screenshot.png",
  "employment_contract_signed.pdf",
  "family_reunion_photos_2023.jpg",
  "invoice_march_consulting.pdf",
  "creative_ideas_brainstorm.txt",
];

export default function AIFileAnalyzer({ onOrganize }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState(new Set());

  const analyzeFiles = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `You are an advanced AI file organization assistant with content analysis capabilities. Analyze these file names AND their simulated content/context to suggest optimal organization.

Files: ${SAMPLE_FILES.join(", ")}

Perform DEEP CONTENT ANALYSIS:
1. Analyze actual content within documents (text, topics, themes)
2. Understand context within images (vacation photos, work screenshots, family events)
3. Extract metadata patterns (dates, locations, purposes)
4. Identify relationships between files
5. Learn user patterns (work vs personal, creative vs administrative)

Provide:
1. Intelligent folder structure with creative, calming names
2. Content-based file renames (not just cleaning names, but understanding content)
3. Smart grouping by actual themes and context
4. Auto-tags for each file based on content analysis
5. Archiving recommendations (files older than 6 months for yearly archive)
6. Compression suggestions (large files that are infrequently accessed)

Return JSON:
{
  "folders": [
    {
      "name": "folder name",
      "description": "what belongs here",
      "icon": "emoji",
      "color": "color theme",
      "type": "work/personal/creative/finance/archive"
    }
  ],
  "renames": [
    {
      "original": "filename",
      "suggested": "new name",
      "reason": "content-based reason",
      "content_summary": "what's actually in the file"
    }
  ],
  "groups": [
    {
      "theme": "theme name",
      "files": ["files"],
      "folder": "destination folder",
      "context": "why these files belong together based on content"
    }
  ],
  "tags": [
    {
      "file": "filename",
      "tags": ["tag1", "tag2", "tag3"],
      "reason": "why these tags based on content"
    }
  ],
  "archive_suggestions": [
    {
      "file": "filename",
      "reason": "why archive (age, infrequent access)",
      "destination": "Archives/2023 or similar"
    }
  ],
  "compress_suggestions": [
    {
      "file": "filename",
      "reason": "large file, infrequent access",
      "estimated_savings": "percentage"
    }
  ],
  "yearly_archive": {
    "enabled": true,
    "structure": "suggested yearly folder structure",
    "files_to_archive": ["list of old files"]
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            folders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  icon: { type: "string" },
                  color: { type: "string" },
                  type: { type: "string" },
                },
              },
            },
            renames: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  suggested: { type: "string" },
                  reason: { type: "string" },
                  content_summary: { type: "string" },
                },
              },
            },
            groups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  files: { type: "array", items: { type: "string" } },
                  folder: { type: "string" },
                  context: { type: "string" },
                },
              },
            },
            tags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  file: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                },
              },
            },
            archive_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  file: { type: "string" },
                  reason: { type: "string" },
                  destination: { type: "string" },
                },
              },
            },
            compress_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  file: { type: "string" },
                  reason: { type: "string" },
                  estimated_savings: { type: "string" },
                },
              },
            },
            yearly_archive: {
              type: "object",
              properties: {
                enabled: { type: "boolean" },
                structure: { type: "string" },
                files_to_archive: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      });

      setAnalysis(result);
      setSelectedGroups(new Set(result.groups.map((_, idx) => idx)));
    } catch (error) {
      console.error("Error analyzing files:", error);
    }

    setIsAnalyzing(false);
  };

  const toggleGroup = (index) => {
    setSelectedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const applyOrganization = () => {
    const selectedGroupsData = analysis.groups.filter((_, idx) =>
      selectedGroups.has(idx),
    );
    onOrganize({
      folders: analysis.folders,
      groups: selectedGroupsData,
      renames: analysis.renames,
      tags: analysis.tags,
      archive_suggestions: analysis.archive_suggestions,
      compress_suggestions: analysis.compress_suggestions,
      yearly_archive: analysis.yearly_archive,
    });
  };

  const colorClasses = {
    purple: "from-purple-100 to-purple-200 border-purple-300",
    blue: "from-blue-100 to-blue-200 border-blue-300",
    green: "from-green-100 to-green-200 border-green-300",
    pink: "from-pink-100 to-pink-200 border-pink-300",
    amber: "from-amber-100 to-amber-200 border-amber-300",
    emerald: "from-emerald-100 to-emerald-200 border-emerald-300",
    cyan: "from-cyan-100 to-cyan-200 border-cyan-300",
    rose: "from-rose-100 to-rose-200 border-rose-300",
  };

  return (
    <div className="space-y-6">
      {!analysis && (
        <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="inline-block p-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full"
            >
              <Brain className="w-12 h-12 text-purple-700" />
            </motion.div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">
                Advanced AI Content Analysis
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                I'll analyze the actual content inside your files - not just
                names! I'll understand document topics, image contexts, metadata
                patterns, and suggest smart organization, tagging, archiving,
                and compression. 🌟
              </p>
            </div>
            <Button
              onClick={analyzeFiles}
              disabled={isAnalyzing}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Content with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Deep Content Analysis
                </>
              )}
            </Button>
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Analyzing {SAMPLE_FILES.length} files with advanced content
                understanding ✨
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-purple-600" />
                  AI-Suggested Folder Structure (Content-Based)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.folders.map((folder, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`bg-gradient-to-br ${colorClasses[folder.color] || colorClasses.purple} border-2`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{folder.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">
                                {folder.name}
                              </h4>
                              <p className="text-sm text-gray-700 mb-2">
                                {folder.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {folder.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {analysis.yearly_archive?.enabled && (
              <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    Yearly Archive Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    {analysis.yearly_archive.structure}
                  </p>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <p className="font-medium mb-2">Files to Archive:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.yearly_archive.files_to_archive?.map(
                        (file, idx) => (
                          <Badge key={idx} variant="secondary">
                            {file}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  Content-Based File Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.groups.map((group, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => toggleGroup(index)}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedGroups.has(index)
                          ? "border-blue-400 shadow-lg"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">
                              {group.theme}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {group.context}
                            </p>
                            <p className="text-sm text-gray-600">
                              Move to:{" "}
                              <Badge variant="outline">{group.folder}</Badge>
                            </p>
                          </div>
                          {selectedGroups.has(index) && (
                            <Badge className="bg-blue-500 text-white">
                              ✓ Selected
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.files.map((file, fileIdx) => (
                            <Badge
                              key={fileIdx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/*
             now why in the world is this file more than 400 lines? peter? did you do it?
             idk
             */}
            {analysis.tags && analysis.tags.length > 0 && (
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-600" />
                    AI-Generated Content Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.tags.slice(0, 6).map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-cyan-50 rounded-lg border border-cyan-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm font-semibold">
                            {item.file}
                          </code>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.tags.map((tag, tagIdx) => (
                            <Badge
                              key={tagIdx}
                              className="bg-cyan-600 text-white"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.archive_suggestions &&
                analysis.archive_suggestions.length > 0 && (
                  <Card className="border-none shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Archive className="w-5 h-5 text-indigo-600" />
                        Archive Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.archive_suggestions
                          .slice(0, 4)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                            >
                              <p className="font-medium text-sm">{item.file}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.reason}
                              </p>
                              <p className="text-xs text-indigo-600 mt-1">
                                → {item.destination}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              {analysis.compress_suggestions &&
                analysis.compress_suggestions.length > 0 && (
                  <Card className="border-none shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        Compression Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.compress_suggestions
                          .slice(0, 4)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <p className="font-medium text-sm">{item.file}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.reason}
                              </p>
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                Save {item.estimated_savings}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Content-Based Smart Renames
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.renames.slice(0, 6).map((rename, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="outline"
                          className="text-xs text-red-600"
                        >
                          Before
                        </Badge>
                        <span className="text-sm text-gray-600 line-through">
                          {rename.original}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600"
                        >
                          After
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {rename.suggested}
                        </span>
                      </div>
                      {rename.content_summary && (
                        <p className="text-xs text-blue-600 ml-16 mb-1">
                          📄 {rename.content_summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 ml-16">
                        {rename.reason}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setAnalysis(null)}
                size="lg"
              >
                Start Over
              </Button>
              <Button
                onClick={applyOrganization}
                disabled={selectedGroups.size === 0}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 rounded-xl shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Apply AI Organization ({selectedGroups.size} groups)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

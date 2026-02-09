import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Sparkles, Check, Brain, FileText, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AIFileAnalyzer from "../components/organize/AIFileAnalyzer";
import SmartRenamer from "../components/organize/SmartRenamer";

const FOLDER_SUGGESTIONS = [
  {
    id: 1,
    name: "Creative Corner",
    description:
      "A beautiful space for all your creative projects, designs, and inspirations",
    icon: "🎨",
    fileTypes: ["Images", "Videos", "Design Files"],
    color: "from-pink-100 to-purple-100",
  },
  {
    id: 2,
    name: "Work Haven",
    description: "Keep your professional documents organized and accessible",
    icon: "💼",
    fileTypes: ["Documents", "Spreadsheets", "Presentations"],
    color: "from-blue-100 to-cyan-100",
  },
  {
    id: 3,
    name: "Memory Chest",
    description: "A treasure box for your precious photos and memories",
    icon: "📸",
    fileTypes: ["Photos", "Videos", "Personal"],
    color: "from-amber-100 to-orange-100",
  },
  {
    id: 4,
    name: "Daily Flow",
    description: "Quick access to files you use every day",
    icon: "⚡",
    fileTypes: ["Recent", "Frequent", "Active"],
    color: "from-emerald-100 to-teal-100",
  },
  {
    id: 5,
    name: "Learning Library",
    description: "Store courses, tutorials, and educational materials",
    icon: "📚",
    fileTypes: ["PDFs", "Videos", "Notes"],
    color: "from-indigo-100 to-violet-100",
  },
  {
    id: 6,
    name: "Archive Vault",
    description: "Safe storage for completed projects and old files",
    icon: "🗄️",
    fileTypes: ["Old Projects", "Backups", "Archives"],
    color: "from-gray-100 to-slate-100",
  },
];

export default function Organize() {
  const [selectedFolders, setSelectedFolders] = useState(new Set());
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [aiOrganization, setAiOrganization] = useState(null);

  const toggleFolder = (folderId) => {
    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const startOrganizing = () => {
    setIsOrganizing(true);
    setTimeout(() => {
      setIsOrganizing(false);
      setIsComplete(true);
    }, 3000);
  };

  const handleAIOrganization = (organizationData) => {
    setAiOrganization(organizationData);
    setIsOrganizing(true);
    setTimeout(() => {
      setIsOrganizing(false);
      setIsComplete(true);
    }, 3000);
  };

  const reset = () => {
    setSelectedFolders(new Set());
    setIsComplete(false);
    setAiOrganization(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4"
                >
                  <Folder className="w-12 h-12 text-purple-600" />
                </motion.div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create Harmony in Your Space
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Let AI help you organize your files beautifully, or choose
                  from our curated folder structures 🌸
                </p>
              </div>

              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Organize
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger
                    value="rename"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Rename
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="mt-8">
                  <AIFileAnalyzer onOrganize={handleAIOrganization} />
                </TabsContent>

                <TabsContent value="manual" className="mt-8">
                  <div className="space-y-6">
                    <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardContent className="p-6 text-center">
                        <Wand2 className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                        <p className="text-gray-700">
                          Choose from our beautiful, pre-designed folder
                          structures
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {FOLDER_SUGGESTIONS.map((folder, index) => (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            onClick={() => toggleFolder(folder.id)}
                            className={`cursor-pointer transition-all duration-300 border-2 ${
                              selectedFolders.has(folder.id)
                                ? "border-purple-400 shadow-xl scale-105"
                                : "border-gray-200 hover:border-purple-200 hover:shadow-lg"
                            }`}
                          >
                            <CardContent
                              className={`p-6 bg-gradient-to-br ${folder.color}`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="text-4xl">{folder.icon}</div>
                                {selectedFolders.has(folder.id) && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                                  >
                                    <Check className="w-5 h-5 text-white" />
                                  </motion.div>
                                )}
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {folder.name}
                              </h3>
                              <p className="text-sm text-gray-700 mb-4">
                                {folder.description}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {folder.fileTypes.map((type) => (
                                  <span
                                    key={type}
                                    className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {selectedFolders.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <Button
                          onClick={startOrganizing}
                          disabled={isOrganizing}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl"
                        >
                          {isOrganizing ? (
                            <>
                              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                              Creating Magic...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Organize {selectedFolders.size} Folder
                              {selectedFolders.size > 1 ? "s" : ""}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rename" className="mt-8">
                  <SmartRenamer />
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
                <CardContent className="p-12 space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                  >
                    <div className="inline-block p-8 bg-white rounded-full shadow-xl">
                      <Check className="w-20 h-20 text-emerald-500" />
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Your Space is Transformed! ✨
                    </h2>
                    {aiOrganization ? (
                      <div className="space-y-3">
                        <p className="text-xl text-gray-700">
                          AI organized {aiOrganization.groups.length} file
                          groups
                        </p>
                        <p className="text-lg text-gray-600">
                          Created {aiOrganization.folders.length} beautiful
                          folders
                        </p>
                        <p className="text-lg text-gray-600">
                          Renamed {aiOrganization.renames.length} files with
                          clear names
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl text-gray-700">
                        {selectedFolders.size} beautiful folder
                        {selectedFolders.size > 1 ? "s" : ""} created
                      </p>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-lavender-100 to-peach-100 rounded-2xl p-8 max-w-2xl mx-auto">
                    <p className="text-lg text-gray-700 italic leading-relaxed">
                      "Order is the shape upon which beauty depends." 🌺
                      <br />
                      Your files now have a beautiful home.
                    </p>
                  </div>

                  <Button
                    onClick={reset}
                    size="lg"
                    className="bg-gradient-to-r from-sage-500 to-emerald-500 hover:from-sage-600 hover:to-emerald-600 text-white rounded-xl"
                  >
                    Organize More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  FileText,
  Image,
  Archive,
  Trash2,
  Clock,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ScanningAnimation from "../components/scan/ScanningAnimation";
import FileItem from "../components/scan/FileItem";
import BreathingPrompt from "../components/scan/BreathingPrompt";
import CompletionCelebration from "../components/scan/CompletionCelebration";
import AdvancedOptions from "../components/scan/AdvancedOptions";
import FilePreview from "../components/scan/FilePreview";

const MOCK_FILES = [
  {
    id: 1,
    name: "old-presentation-2020.pptx",
    size: 45,
    type: "document",
    category: "Old Files",
    reason:
      "This presentation is over 3 years old and hasn't been opened recently",
    icon: FileText,
  },
  {
    id: 2,
    name: "screenshot-2019-backup.png",
    size: 12,
    type: "image",
    category: "Screenshots",
    reason: "Old screenshot from 2019 that might no longer be needed",
    icon: Image,
  },
  {
    id: 3,
    name: "temp-download-cache",
    size: 234,
    type: "cache",
    category: "Temporary Files",
    reason: "Temporary files that are safe to remove to free up space",
    icon: Archive,
  },
  {
    id: 4,
    name: "duplicate-photo-1.jpg",
    size: 8,
    type: "image",
    category: "Duplicates",
    reason: "This appears to be a duplicate of another photo in your library",
    icon: Image,
  },
  {
    id: 5,
    name: "browser-cache-2023",
    size: 567,
    type: "cache",
    category: "Cache Files",
    reason: "Browser cache files that can be safely removed",
    icon: Archive,
  },
  {
    id: 6,
    name: "old-project-backup",
    size: 123,
    type: "archive",
    category: "Old Backups",
    reason: "Backup files from completed projects that could be archived",
    icon: Archive,
  },
  {
    id: 7,
    name: "unused-app-data",
    size: 89,
    type: "cache",
    category: "App Data",
    reason: "Leftover data from apps you no longer use",
    icon: Trash2,
  },
  {
    id: 8,
    name: "temp-video-render.mp4",
    size: 456,
    type: "video",
    category: "Temporary Files",
    reason: "Temporary video file that's no longer needed",
    icon: FileText,
  },
];

export default function Scan() {
  const [scanningStage, setScanningStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [filesFound, setFilesFound] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [selectedAction, setSelectedAction] = useState("delete");
  const [appliedRules, setAppliedRules] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const queryClient = useQueryClient();

  const startScan = () => {
    setScanningStage("scanning");
    setProgress(0);
    setFilesFound([]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningStage("results");
          setFilesFound(MOCK_FILES);
          setSelectedFiles(new Set(MOCK_FILES.map((f) => f.id)));
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const applyRules = (rules) => {
    setAppliedRules(rules);
    const filteredFiles = MOCK_FILES.filter((file) => {
      return rules.some((rule) => {
        const extensionMatch =
          rule.file_extension === "*" ||
          file.name.endsWith(rule.file_extension);
        const sizeMatch =
          !rule.larger_than_mb || file.size >= rule.larger_than_mb;
        return extensionMatch && sizeMatch;
      });
    });

    if (filteredFiles.length > 0) {
      setScanningStage("results");
      setFilesFound(filteredFiles);
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleFileAction = async (fileId, action) => {
    // Learn from user action
    const user = await base44.auth.me();
    const learnedPreferences = user.ai_preferences?.learned_preferences || [];

    learnedPreferences.push({
      action: action,
      file_type: filesFound.find((f) => f.id === fileId)?.type,
      category: filesFound.find((f) => f.id === fileId)?.category,
      timestamp: new Date().toISOString(),
    });

    await base44.auth.updateMe({
      ai_preferences: {
        ...user.ai_preferences,
        learned_preferences: learnedPreferences.slice(-50), // Keep last 50 actions
      },
    });

    if (action === "delete") {
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      setFilesFound((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const saveSession = useMutation({
    mutationFn: async (sessionData) => {
      const session = await base44.entities.CleaningSession.create(sessionData);

      const user = await base44.auth.me();
      await base44.auth.updateMe({
        total_space_freed_mb:
          (user.total_space_freed_mb || 0) + sessionData.space_freed_mb,
        total_files_cleaned:
          (user.total_files_cleaned || 0) + sessionData.files_cleaned,
        last_cleaning_date: new Date().toISOString().split("T")[0],
      });

      if (
        (user.total_files_cleaned || 0) + sessionData.files_cleaned >= 10 &&
        (user.total_files_cleaned || 0) < 10
      ) {
        await base44.entities.Achievement.create({
          badge_name: "First Steps",
          badge_icon: "🌱",
          description: "Cleaned your first 10 files",
          earned_date: new Date().toISOString(),
          category: "milestone",
        });
      }

      if (sessionData.space_freed_mb >= 1000) {
        await base44.entities.Achievement.create({
          badge_name: "Space Maker",
          badge_icon: "🌟",
          description: "Freed over 1GB in a single session",
          earned_date: new Date().toISOString(),
          category: "cleaning",
        });
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaningSessions"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const startCleaning = async () => {
    setScanningStage("cleaning");
    setCleaningProgress(0);
    setShowBreathingPrompt(true);

    const selectedFilesArray = filesFound.filter((f) =>
      selectedFiles.has(f.id),
    );
    const totalSize = selectedFilesArray.reduce((sum, f) => sum + f.size, 0);
    const totalFiles = selectedFilesArray.length;

    const interval = setInterval(() => {
      setCleaningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowBreathingPrompt(false);

          saveSession.mutate({
            files_scanned: filesFound.length,
            files_cleaned: totalFiles,
            space_freed_mb:
              selectedAction === "compress" ? totalSize * 0.6 : totalSize,
            session_duration_minutes: Math.round(Math.random() * 5 + 3),
            categories_organized: [
              ...new Set(selectedFilesArray.map((f) => f.category)),
            ],
          });

          setScanningStage("complete");
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const resetScan = () => {
    setScanningStage("idle");
    setProgress(0);
    setFilesFound([]);
    setSelectedFiles(new Set());
    setCleaningProgress(0);
  };

  const totalSize = filesFound
    .filter((f) => selectedFiles.has(f.id))
    .reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Floating Advanced Options Button */}
      {scanningStage === "idle" && (
        <motion.div
          className="fixed top-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <div
            onMouseEnter={() => setShowAdvancedOptions(true)}
            onMouseLeave={() => setShowAdvancedOptions(false)}
            className="relative"
          >
            <motion.div
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl cursor-pointer border-2 border-white"
            >
              <Settings className="w-7 h-7 text-white" />
            </motion.div>

            <AnimatePresence>
              {showAdvancedOptions && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute top-0 right-16 w-96"
                >
                  <AdvancedOptions
                    onApplyRules={applyRules}
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {scanningStage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              {/* Centered Content */}
              <div className="text-center space-y-6 max-w-3xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-block p-6 bg-gradient-to-br from-lavender-100 to-sage-100 rounded-full"
                >
                  <Sparkles className="w-12 h-12 text-lavender-600" />
                </motion.div>

                <h1 className="text-5xl font-bold text-gray-900">
                  Ready to Refresh?
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Let's gently scan your digital space and find opportunities to
                  create calm and clarity. 🌸
                </p>
              </div>

              {/* Begin Scanning Button */}
              <Button
                onClick={startScan}
                size="lg"
                className="bg-black hover:bg-white hover:text-black text-white px-12 py-8 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-black font-bold"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Begin Scanning
              </Button>

              {appliedRules.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center"
                >
                  <p className="text-sm text-purple-900">
                    <strong>
                      {appliedRules.length} custom rule
                      {appliedRules.length > 1 ? "s" : ""}
                    </strong>{" "}
                    will be applied during the scan
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {scanningStage === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScanningAnimation progress={progress} />
            </motion.div>
          )}

          {scanningStage === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Scan Complete! 🌟
                </h2>
                <p className="text-lg text-gray-600">
                  I found {filesFound.length} items that could use some
                  attention. Preview each file to decide what to keep.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div
                  className={`px-6 py-3 rounded-xl shadow-md ${
                    selectedAction === "delete"
                      ? "bg-red-100 border-red-200"
                      : selectedAction === "archive"
                        ? "bg-blue-100 border-blue-200"
                        : "bg-purple-100 border-purple-200"
                  } border-2`}
                >
                  <p className="text-sm font-medium">
                    Selected action:{" "}
                    <strong className="capitalize">{selectedAction}</strong>
                    {selectedAction === "compress" && " (saves ~60% space)"}
                    {selectedAction === "archive" &&
                      " (moves to safe location)"}
                  </p>
                </div>
              </motion.div>

              <Card className="border-none shadow-xl bg-gradient-to-br from-white to-lavender-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Selected Items</span>
                    <div className="text-right">
                      <p className="text-sm font-normal text-gray-600">
                        {selectedFiles.size} items •{" "}
                        {selectedAction === "compress"
                          ? ((totalSize * 0.4) / 1024).toFixed(2)
                          : (totalSize / 1024).toFixed(2)}{" "}
                        GB
                        {selectedAction === "compress" && (
                          <span className="text-green-600 ml-2">
                            (saves {((totalSize * 0.6) / 1024).toFixed(2)} GB)
                          </span>
                        )}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filesFound.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      isSelected={selectedFiles.has(file.id)}
                      onToggle={() => toggleFileSelection(file.id)}
                      onPreview={() => handlePreview(file)}
                    />
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={resetScan}
                  size="lg"
                  className="rounded-xl"
                >
                  Start Over
                </Button>
                <Button
                  onClick={startCleaning}
                  disabled={selectedFiles.size === 0}
                  size="lg"
                  className="bg-gradient-to-r from-sage-500 to-emerald-500 hover:from-sage-600 hover:to-emerald-600 text-white rounded-xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {selectedAction === "delete"
                    ? "Clean"
                    : selectedAction === "archive"
                      ? "Archive"
                      : "Compress"}{" "}
                  Selected ({selectedFiles.size})
                </Button>
              </div>
            </motion.div>
          )}

          {scanningStage === "cleaning" && (
            <motion.div
              key="cleaning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="inline-block p-6 bg-gradient-to-br from-sage-100 to-emerald-100 rounded-full">
                      <Clock
                        className="w-12 h-12 text-sage-600 animate-spin"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Creating Space...
                    </h3>
                    <p className="text-gray-600">
                      Take a moment to breathe while I work my magic ✨
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-sage-600">
                        {cleaningProgress}%
                      </span>
                    </div>
                    <Progress value={cleaningProgress} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {showBreathingPrompt && <BreathingPrompt />}
            </motion.div>
          )}

          {scanningStage === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompletionCelebration
                filesCleared={selectedFiles.size}
                spaceFreed={totalSize}
                onReset={resetScan}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FilePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDelete={() => handleFileAction(previewFile?.id, "delete")}
          onArchive={() => handleFileAction(previewFile?.id, "archive")}
          onCompress={() => handleFileAction(previewFile?.id, "compress")}
        />
      </div>
    </div>
  );
}

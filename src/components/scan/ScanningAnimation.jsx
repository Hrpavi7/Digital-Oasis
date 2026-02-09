import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, FileText, Image, Folder, Archive } from "lucide-react";
import { motion } from "framer-motion";

export default function ScanningAnimation({ progress }) {
  const icons = [FileText, Image, Folder, Archive];

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-lavender-50">
      <CardContent className="p-12 space-y-8">
        <div className="text-center space-y-4">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="inline-block p-8 bg-gradient-to-br from-lavender-200 to-sage-200 rounded-full"
          >
            <Sparkles className="w-16 h-16 text-lavender-700" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">
            Scanning Your Space
          </h2>
          <p className="text-lg text-gray-600">
            Gently looking through your files with care...
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-sage-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        <div className="flex justify-center gap-6">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-4 bg-white rounded-xl shadow-md"
            >
              <Icon className="w-8 h-8 text-sage-500" />
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 italic">
            "Patience is the companion of wisdom." 🌿 {/*some ass shit? */}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

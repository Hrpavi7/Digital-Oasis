import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function FileItem({ file, isSelected, onToggle, onPreview }) {
  const Icon = file.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-sage-400 bg-sage-50"
          : "border-gray-200 bg-white hover:border-sage-200"
      }`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-1"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon className="w-5 h-5 text-sage-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {file.name}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {(file.size / 1024).toFixed(2)} GB
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-2">{file.reason}</p>

            <Badge className="bg-lavender-100 text-lavender-700 border-lavender-200">
              {file.category}
            </Badge>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        className="gap-2 text-sage-600 hover:text-sage-700 hover:bg-sage-100"
      >
        <Eye className="w-4 h-4" />
        Preview
      </Button>
    </motion.div>
  );
}

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Archive, Package } from "lucide-react";
import { motion } from "framer-motion";

const ACTIONS = [
  {
    value: "delete",
    label: "Delete Files",
    description: "Permanently remove files to free up space",
    icon: Trash2,
    color: "from-red-100 to-rose-100",
    iconColor: "text-red-600",
  },
  {
    value: "archive",
    label: "Archive Files",
    description: "Move files to an archive folder for safekeeping",
    icon: Archive,
    color: "from-blue-100 to-cyan-100",
    iconColor: "text-blue-600",
  },
  {
    value: "compress",
    label: "Compress Files",
    description: "Compress files to save space while keeping them accessible",
    icon: Package,
    color: "from-purple-100 to-violet-100",
    iconColor: "text-purple-600",
  },
];

export default function ActionSelector({ selectedAction, setSelectedAction }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Default Action</h3>
        <p className="text-sm text-gray-600">
          Select what should happen to files during cleaning
        </p>
      </div>

      <div className="grid gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.value;

          return (
            <motion.div
              key={action.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => setSelectedAction(action.value)}
                className={`cursor-pointer border-2 transition-all ${
                  isSelected
                    ? "border-purple-400 shadow-lg"
                    : "border-gray-200 hover:border-purple-200"
                }`}
              >
                <CardContent
                  className={`p-6 bg-gradient-to-br ${action.color}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 bg-white rounded-xl shadow-sm ${action.iconColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {action.description}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-sm">✓</span>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedAction === "archive" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <p className="text-sm text-blue-900">
            <strong>Archive Location:</strong> Files will be moved to
            Documents/Digital Oasis Archives/
          </p>
        </motion.div>
      )}

      {selectedAction === "compress" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-purple-50 rounded-xl border border-purple-200"
        >
          <p className="text-sm text-purple-900">
            <strong>Compression:</strong> Files will be compressed to .zip
            format, saving approximately 30-70% space
          </p>
        </motion.div>
      )}
    </div>
  );
}

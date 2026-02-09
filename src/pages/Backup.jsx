import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import BackupManager from "../components/backup/BackupManager";

export default function Backup() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            AI-Powered Backup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Intelligent backup solutions that learn your preferences and protect
            what matters most 🛡️
          </p>
        </motion.div>

        <BackupManager />
      </div>
    </div>
  );
}

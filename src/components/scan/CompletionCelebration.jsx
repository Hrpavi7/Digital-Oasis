import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CompletionCelebration({
  filesCleared,
  spaceFreed,
  onReset,
}) {
  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-lavender-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-lavender-200/20" />

      <CardContent className="relative p-12 space-y-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="inline-block"
        >
          <div className="p-8 bg-white rounded-full shadow-xl">
            <Sparkles className="w-20 h-20 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            All Done! Your Space is Glowing ✨
          </h2>
          <p className="text-xl text-gray-700">
            Take a moment to enjoy the calm and clarity you've created.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {filesCleared}
            </p>
            <p className="text-gray-700">Files Cleared</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <p className="text-3xl font-bold text-cyan-600 mb-2">
              {(spaceFreed / 1024).toFixed(2)} GB
            </p>
            <p className="text-gray-700">Space Freed</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-lavender-100 to-cyan-100 rounded-2xl p-8 max-w-2xl mx-auto"
        >
          <p className="text-lg text-gray-700 italic leading-relaxed">
            "Your computer is refreshed and glowing — just like you deserve. 🌼
            <br />
            Take a moment to enjoy the peace you've created."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 justify-center"
        >
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="rounded-xl"
          >
            Clean Again
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-sage-500 to-emerald-500 hover:from-sage-600 hover:to-emerald-600 text-white rounded-xl shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </CardContent>
    </Card>
  );
}

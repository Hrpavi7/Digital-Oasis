import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function BreathingPrompt() {
  const [phase, setPhase] = useState("inhale");

  useEffect(() => {
    const cycle = () => {
      setPhase("inhale");
      setTimeout(() => setPhase("hold"), 4000);
      setTimeout(() => setPhase("exhale"), 8000);
      setTimeout(() => setPhase("hold"), 12000);
    };

    cycle();
    const interval = setInterval(cycle, 16000);
    return () => clearInterval(interval);
  }, []);
  // shits so fucking ass LMFAOOOO
  const messages = {
    inhale: "Breathe in slowly... 🌸",
    hold: "Hold gently...",
    exhale: "Breathe out... 🍃",
  };
  // i dont even know why i did the part above
  // so fuckin sus AAAAA
  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <p className="text-lg font-medium text-gray-700">
            While I work, let's take a mindful moment together
          </p>

          <motion.div
            animate={{
              scale:
                phase === "inhale"
                  ? [1, 1.3]
                  : phase === "exhale"
                    ? [1.3, 1]
                    : [1.3, 1.3],
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
            }}
            className="inline-block w-24 h-24 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full"
          />

          <p className="text-2xl font-semibold text-gray-800">
            {messages[phase]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

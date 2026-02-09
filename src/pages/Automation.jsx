import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationRules from "../components/automation/AutomationRules";
import WorkflowTemplates from "../components/automation/WorkflowTemplates";

export default function Automation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
            <Zap className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Task Automation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let AI learn from your actions and automate recurring tasks
            intelligently ⚡
          </p>
        </motion.div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-8">
            <WorkflowTemplates user={user} />
          </TabsContent>

          <TabsContent value="rules" className="mt-8">
            <AutomationRules user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

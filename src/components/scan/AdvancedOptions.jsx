import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Settings, Calendar, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RuleCreator from "./RuleCreator";
import ScheduleManager from "./ScheduleManager";
import ActionSelector from "./ActionSelector";

export default function AdvancedOptions({
  onApplyRules,
  selectedAction,
  setSelectedAction,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        className="w-full justify-between"
        size="lg"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Advanced Cleaning Options
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </Button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  Customize Your Cleaning Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="action" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="action"
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Action
                    </TabsTrigger>
                    <TabsTrigger
                      value="rules"
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Rules
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="action" className="mt-6">
                    <ActionSelector
                      selectedAction={selectedAction}
                      setSelectedAction={setSelectedAction}
                    />
                  </TabsContent>
                  <TabsContent value="rules" className="mt-6">
                    <RuleCreator onApplyRules={onApplyRules} />
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-6">
                    <ScheduleManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

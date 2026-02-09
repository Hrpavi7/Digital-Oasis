import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileEdit, MessageSquare, Share2, Trash2, FileText, Clock, } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ACTION_ICONS = {
  created: FileText,
  edited: FileEdit,
  commented: MessageSquare,
  shared: Share2,
  deleted: Trash2,
  renamed: FileEdit,
};

const ACTION_COLORS = {
  created: "text-green-600 bg-green-100",
  edited: "text-blue-600 bg-blue-100",
  commented: "text-purple-600 bg-purple-100",
  shared: "text-cyan-600 bg-cyan-100",
  deleted: "text-red-600 bg-red-100",
  renamed: "text-amber-600 bg-amber-100",
};

export default function ActivityFeed({ itemId }) {
  const { data: activities } = useQuery({
    queryKey: ["activityFeed", itemId],
    queryFn: () => {
      if (itemId) {
        return base44.entities.ActivityFeed.filter(
          { item_id: itemId },
          "-created_date",
          20,
        );
      }
      return base44.entities.ActivityFeed.list("-created_date", 20);
    },
    initialData: [],
  });

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = ACTION_ICONS[activity.action_type] || FileText;
              const colorClass =
                ACTION_COLORS[activity.action_type] ||
                "text-gray-600 bg-gray-100";

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <strong>{activity.user_email.split("@")[0]}</strong>{" "}
                      {activity.action_type}{" "}
                      <strong>{activity.item_name}</strong>
                    </p>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(activity.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

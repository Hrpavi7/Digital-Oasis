import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Calendar, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function ScheduleManager() {
  const [showForm, setShowForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    schedule_name: "",
    frequency: "weekly",
    day_of_week: "sunday",
    time_of_day: "10:00",
    is_active: true,
  });
  const queryClient = useQueryClient();
  const { data: schedules } = useQuery({
    queryKey: ["scheduledCleanings"],
    queryFn: () => base44.entities.ScheduledCleaning.list(),
    initialData: [],
  });
  const { data: rules } = useQuery({
    queryKey: ["cleaningRules"],
    queryFn: () => base44.entities.CleaningRule.list(),
    initialData: [],
  });
  const createSchedule = useMutation({
    mutationFn: (scheduleData) => {
      // Calculate next run time
      const now = new Date();
      const nextRun = new Date(now);

      if (scheduleData.frequency === "weekly") {
        const dayIndex = DAYS.findIndex(
          (d) => d.value === scheduleData.day_of_week,
        );
        const currentDay = now.getDay();
        const daysUntil = (dayIndex - currentDay + 7) % 7 || 7;
        nextRun.setDate(now.getDate() + daysUntil);
      } else if (scheduleData.frequency === "daily") {
        nextRun.setDate(now.getDate() + 1);
      } else if (scheduleData.frequency === "monthly") {
        nextRun.setMonth(now.getMonth() + 1);
      }

      const [hours, minutes] = scheduleData.time_of_day.split(":");
      nextRun.setHours(parseInt(hours), parseInt(minutes), 0);

      return base44.entities.ScheduledCleaning.create({
        ...scheduleData,
        next_run: nextRun.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledCleanings"] });
      setShowForm(false);
      setNewSchedule({
        schedule_name: "",
        frequency: "weekly",
        day_of_week: "sunday",
        time_of_day: "10:00",
        is_active: true,
      });
    },
  });
  const deleteSchedule = useMutation({
    mutationFn: (scheduleId) =>
      base44.entities.ScheduledCleaning.delete(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledCleanings"] });
    },
  });
  const toggleSchedule = useMutation({
    mutationFn: ({ id, is_active }) =>
      base44.entities.ScheduledCleaning.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledCleanings"] });
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    createSchedule.mutate(newSchedule);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Automatic Cleaning Schedules
          </h3>
          <p className="text-sm text-gray-600">
            Set it and forget it - let cleaning happen automatically
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="schedule_name">Schedule Name</Label>
                    <Input
                      id="schedule_name"
                      value={newSchedule.schedule_name}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          schedule_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Weekly Sunday Cleanup"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newSchedule.frequency}
                      onValueChange={(value) =>
                        setNewSchedule({ ...newSchedule, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newSchedule.frequency === "weekly" && (
                    <div>
                      <Label htmlFor="day_of_week">Day of Week</Label>
                      <Select
                        value={newSchedule.day_of_week}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, day_of_week: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="time_of_day">Time of Day</Label>
                    <Input
                      id="time_of_day"
                      type="time"
                      value={newSchedule.time_of_day}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          time_of_day: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> This schedule will apply all your
                      active cleaning rules automatically
                      {rules.filter((r) => r.is_active).length > 0
                        ? ` (${rules.filter((r) => r.is_active).length} active rule${rules.filter((r) => r.is_active).length > 1 ? "s" : ""})`
                        : " (create some rules first!)"}
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSchedule.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Schedule
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">
              No schedules yet. Create your first automated cleaning schedule!
            </p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card
                className={`${schedule.is_active ? "border-blue-200" : "border-gray-200 opacity-60"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {schedule.schedule_name}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {schedule.frequency}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {schedule.frequency === "weekly" &&
                            `Every ${schedule.day_of_week} at `}
                          {schedule.frequency === "daily" && "Every day at "}
                          {schedule.frequency === "monthly" && "Monthly at "}
                          {schedule.time_of_day}
                        </p>
                        {schedule.next_run && (
                          <p className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Next run:{" "}
                            {format(
                              new Date(schedule.next_run),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </p>
                        )}
                        {schedule.last_run && (
                          <p className="text-xs text-gray-500">
                            Last run:{" "}
                            {format(new Date(schedule.last_run), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={(checked) =>
                          toggleSchedule.mutate({
                            id: schedule.id,
                            is_active: checked,
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSchedule.mutate(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

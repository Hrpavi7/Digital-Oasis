import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  MessageSquare,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const TONES = [
  {
    value: "cozy_friend",
    label: "Cozy Friend",
    description: "Warm, supportive, and caring",
  },
  {
    value: "productivity_coach",
    label: "Productivity Coach",
    description: "Motivating and action-oriented",
  },
  {
    value: "gentle_fairy",
    label: "Gentle Fairy",
    description: "Magical and whimsical",
  },
  {
    value: "minimalist_guru",
    label: "Minimalist Guru",
    description: "Calm and philosophical",
  },
];

const THEMES = [
  {
    value: "calm_meadow",
    label: "Calm Meadow",
    colors: "from-green-100 to-emerald-100",
  },
  {
    value: "peaceful_ocean",
    label: "Peaceful Ocean",
    colors: "from-blue-100 to-cyan-100",
  },
  {
    value: "zen_garden",
    label: "Zen Garden",
    colors: "from-gray-100 to-slate-100",
  },
  {
    value: "cozy_forest",
    label: "Cozy Forest",
    colors: "from-emerald-100 to-teal-100",
  },
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

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    assistant_tone: "cozy_friend",
    theme: "calm_meadow",
    reminder_enabled: true,
    reminder_day: "sunday",
  });
  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setSettings({
        assistant_tone: currentUser.assistant_tone || "cozy_friend",
        theme: currentUser.theme || "calm_meadow",
        reminder_enabled: currentUser.reminder_enabled !== false,
        reminder_day: currentUser.reminder_day || "sunday",
      });
    };
    loadUser();
  }, []);

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => {
      await base44.auth.updateMe(newSettings);
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    updateSettings.mutate(settings);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-2">
            <SettingsIcon className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Personalize Your Experience
          </h1>
          <p className="text-lg text-gray-600">
            Customize your digital wellness journey 🌸
          </p>
        </motion.div>

        {/* Assistant Tone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Assistant Personality
              </CardTitle>
              <CardDescription>
                Choose how your digital companion speaks to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.assistant_tone}
                onValueChange={(value) => handleChange("assistant_tone", value)}
                className="space-y-3"
              >
                {TONES.map((tone) => (
                  <div
                    key={tone.value}
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      settings.assistant_tone === tone.value
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:border-purple-200"
                    }`}
                    onClick={() => handleChange("assistant_tone", tone.value)}
                  >
                    <RadioGroupItem value={tone.value} id={tone.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={tone.value}
                        className="text-base font-semibold cursor-pointer"
                      >
                        {tone.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {tone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Visual Theme
              </CardTitle>
              <CardDescription>
                Select a color palette that brings you peace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {THEMES.map((theme) => (
                  <div
                    key={theme.value}
                    onClick={() => handleChange("theme", theme.value)}
                    className={`p-6 rounded-xl cursor-pointer border-2 transition-all ${
                      settings.theme === theme.value
                        ? "border-blue-400 shadow-lg scale-105"
                        : "border-gray-200 hover:border-blue-200"
                    } bg-gradient-to-br ${theme.colors}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {theme.label}
                      </span>
                      {settings.theme === theme.value && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Cleaning Reminders
              </CardTitle>
              <CardDescription>
                Get gentle nudges to maintain your digital wellness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-sage-50 rounded-xl">
                <div>
                  <Label
                    htmlFor="reminders"
                    className="text-base font-semibold"
                  >
                    Enable Weekly Reminders
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive a gentle reminder to clean your space
                  </p>
                </div>
                <Switch
                  id="reminders"
                  checked={settings.reminder_enabled}
                  onCheckedChange={(checked) =>
                    handleChange("reminder_enabled", checked)
                  }
                />
              </div>

              {settings.reminder_enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label className="text-sm font-medium mb-3 block">
                    Reminder Day
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <Button
                        key={day.value}
                        variant={
                          settings.reminder_day === day.value
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleChange("reminder_day", day.value)}
                        className={
                          settings.reminder_day === day.value
                            ? "bg-sage-600 hover:bg-sage-700"
                            : ""
                        }
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Saved!
              </>
            ) : updateSettings.isPending ? (
              "Saving..."
            ) : (
              "Save Settings"
            )}
          </Button>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="border-none shadow-lg bg-gradient-to-r from-emerald-100 to-teal-100">
              <CardContent className="p-6">
                <p className="text-lg text-gray-700 italic">
                  Your preferences have been saved beautifully! 🌟
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

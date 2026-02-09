import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FILE_EXTENSIONS = [
  { value: ".tmp", label: "Temporary files (.tmp)" },
  { value: ".log", label: "Log files (.log)" },
  { value: ".cache", label: "Cache files (.cache)" },
  { value: ".bak", label: "Backup files (.bak)" },
  { value: ".old", label: "Old files (.old)" },
  { value: ".temp", label: "Temp files (.temp)" },
  { value: "custom", label: "Custom extension..." },
];

export default function RuleCreator({ onApplyRules }) {
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    file_extension: ".tmp",
    older_than_days: 7,
    larger_than_mb: 0,
    folder_path: "",
    action: "delete",
    is_active: true,
  });
  const [customExtension, setCustomExtension] = useState("");

  const queryClient = useQueryClient();

  const { data: rules } = useQuery({
    queryKey: ["cleaningRules"],
    queryFn: () => base44.entities.CleaningRule.list(),
    initialData: [],
  });

  const createRule = useMutation({
    mutationFn: (ruleData) => base44.entities.CleaningRule.create(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaningRules"] });
      setShowForm(false);
      setNewRule({
        rule_name: "",
        file_extension: ".tmp",
        older_than_days: 7,
        larger_than_mb: 0,
        folder_path: "",
        action: "delete",
        is_active: true,
      });
      setCustomExtension("");
    },
  });

  const deleteRule = useMutation({
    mutationFn: (ruleId) => base44.entities.CleaningRule.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaningRules"] });
    },
  });

  const toggleRule = useMutation({
    mutationFn: ({ id, is_active }) =>
      base44.entities.CleaningRule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaningRules"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalExtension =
      newRule.file_extension === "custom"
        ? customExtension
        : newRule.file_extension;
    createRule.mutate({
      ...newRule,
      file_extension: finalExtension,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom Cleaning Rules</h3>
          <p className="text-sm text-gray-600">
            Create rules to automatically identify files
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="rule_name">Rule Name</Label>
                    <Input
                      id="rule_name"
                      value={newRule.rule_name}
                      onChange={(e) =>
                        setNewRule({ ...newRule, rule_name: e.target.value })
                      }
                      placeholder="e.g., Clean old temp files"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="file_extension">File Type</Label>
                    <Select
                      value={newRule.file_extension}
                      onValueChange={(value) =>
                        setNewRule({ ...newRule, file_extension: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILE_EXTENSIONS.map((ext) => (
                          <SelectItem key={ext.value} value={ext.value}>
                            {ext.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newRule.file_extension === "custom" && (
                      <Input
                        className="mt-2"
                        value={customExtension}
                        onChange={(e) => setCustomExtension(e.target.value)}
                        placeholder="e.g., .xyz"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="older_than_days">Older Than (days)</Label>
                      <Input
                        id="older_than_days"
                        type="number"
                        min="0"
                        value={newRule.older_than_days}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            older_than_days: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="larger_than_mb">Larger Than (MB)</Label>
                      <Input
                        id="larger_than_mb"
                        type="number"
                        min="0"
                        value={newRule.larger_than_mb}
                        onChange={(e) =>
                          setNewRule({
                            ...newRule,
                            larger_than_mb: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="folder_path">Folder Path (optional)</Label>
                    <Input
                      id="folder_path"
                      value={newRule.folder_path}
                      onChange={(e) =>
                        setNewRule({ ...newRule, folder_path: e.target.value })
                      }
                      placeholder="e.g., /Downloads or leave empty for all folders"
                    />
                  </div>

                  <div>
                    <Label htmlFor="action">Action</Label>
                    <Select
                      value={newRule.action}
                      onValueChange={(value) =>
                        setNewRule({ ...newRule, action: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                        <SelectItem value="compress">Compress</SelectItem>
                      </SelectContent>
                    </Select>
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
                      disabled={createRule.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Rules */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">
              No custom rules yet. Create your first rule to get started!
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card
                className={`${rule.is_active ? "border-purple-200" : "border-gray-200 opacity-60"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {rule.rule_name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rule.action === "delete"
                              ? "bg-red-100 text-red-700"
                              : rule.action === "archive"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {rule.action}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Files:</strong> {rule.file_extension} files
                          {rule.older_than_days > 0 &&
                            ` older than ${rule.older_than_days} days`}
                          {rule.larger_than_mb > 0 &&
                            ` larger than ${rule.larger_than_mb} MB`}
                        </p>
                        {rule.folder_path && (
                          <p>
                            <strong>Location:</strong> {rule.folder_path}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) =>
                          toggleRule.mutate({ id: rule.id, is_active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule.mutate(rule.id)}
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

      {rules.length > 0 && (
        <Button
          onClick={() => onApplyRules(rules.filter((r) => r.is_active))}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Active Rules to Scan
        </Button>
      )}
    </div>
  );
}

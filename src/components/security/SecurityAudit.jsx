import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  FileText,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function SecurityAudit({ user }) {
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const { data: audits } = useQuery({
    queryKey: ["securityAudits"],
    queryFn: () =>
      base44.entities.SecurityAudit.filter(
        { created_by: user?.email },
        "-created_date",
        10,
      ),
    enabled: !!user,
    initialData: [],
  });

  const latestAudit = audits[0];

  const runSecurityAudit = useMutation({
    mutationFn: async () => {
      setIsScanning(true);

      try {
        // Simulate file scanning
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get user's automation rules and shared items for security analysis
        const automationRules = await base44.entities.AutomationRule.filter({
          created_by: user.email,
        });
        const sharedItems = await base44.entities.SharedItem.filter({
          created_by: user.email,
        });
        const backupConfigs = await base44.entities.BackupConfiguration.filter({
          created_by: user.email,
        });

        const prompt = `You are an AI security auditor for Digital Oasis. Perform a security audit and identify vulnerabilities.

System Configuration:
- Automation rules: ${automationRules.length}
- Shared items: ${sharedItems.length}
- Backup configurations: ${backupConfigs.length}
- High-risk automation rules: ${automationRules.filter((r) => r.risk_level === "high").length}
- Items shared with external users: ${sharedItems.filter((i) => i.shared_with?.length > 0).length}

Analyze and provide JSON:
{
  "security_score": number (0-100),
  "files_scanned": 250,
  "issues_found": number,
  "critical_issues": number,
  "vulnerabilities": [
    {
      "title": "vulnerability name",
      "severity": "critical/high/medium/low",
      "category": "permissions/encryption/access/backup/automation",
      "description": "detailed description",
      "affected_items": ["item1", "item2"],
      "remediation": "how to fix",
      "priority": number (1-5)
    }
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],
  "compliance_status": {
    "backup_strategy": "pass/fail/warning",
    "access_controls": "pass/fail/warning",
    "data_encryption": "pass/fail/warning",
    "automation_safety": "pass/fail/warning"
  }
}`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              security_score: { type: "number" },
              files_scanned: { type: "number" },
              issues_found: { type: "number" },
              critical_issues: { type: "number" },
              vulnerabilities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    severity: { type: "string" },
                    category: { type: "string" },
                    description: { type: "string" },
                    affected_items: {
                      type: "array",
                      items: { type: "string" },
                    },
                    remediation: { type: "string" },
                    priority: { type: "number" },
                  },
                },
              },
              recommendations: { type: "array", items: { type: "string" } },
              compliance_status: {
                type: "object",
                properties: {
                  backup_strategy: { type: "string" },
                  access_controls: { type: "string" },
                  data_encryption: { type: "string" },
                  automation_safety: { type: "string" },
                },
              },
            },
          },
        });

        setIsScanning(false);

        return base44.entities.SecurityAudit.create({
          audit_date: new Date().toISOString(),
          security_score: result.security_score,
          vulnerabilities: result.vulnerabilities,
          recommendations: result.recommendations,
          files_scanned: result.files_scanned,
          issues_found: result.issues_found,
          critical_issues: result.critical_issues,
          status: "completed",
        });
      } catch (error) {
        console.error("Error running security audit:", error);
        setIsScanning(false);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityAudits"] });
    },
  });

  const severityColors = {
    critical: {
      bg: "bg-red-600",
      border: "border-red-500",
      text: "text-red-900",
      light: "bg-red-50",
    },
    high: {
      bg: "bg-orange-600",
      border: "border-orange-500",
      text: "text-orange-900",
      light: "bg-orange-50",
    },
    medium: {
      bg: "bg-amber-600",
      border: "border-amber-500",
      text: "text-amber-900",
      light: "bg-amber-50",
    },
    low: {
      bg: "bg-blue-600",
      border: "border-blue-500",
      text: "text-blue-900",
      light: "bg-blue-50",
    },
  };

  const complianceIcons = {
    pass: <CheckCircle className="w-5 h-5 text-green-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    fail: <XCircle className="w-5 h-5 text-red-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-7 h-7 text-blue-600" />
                AI Security Audit
              </h2>
              <p className="text-gray-600">
                Automated security scanning with AI-powered vulnerability
                detection and remediation
              </p>
            </div>
            <Button
              onClick={() => runSecurityAudit.mutate()}
              disabled={isScanning}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run Security Audit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Audit Results */}
      {latestAudit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Security Score */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Security Score
                </span>
                <span className="text-sm text-gray-600">
                  {format(
                    new Date(latestAudit.audit_date),
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl font-bold text-green-600">
                  {latestAudit.security_score}/100
                </span>
                <Badge
                  className={
                    latestAudit.security_score >= 80
                      ? "bg-green-600"
                      : latestAudit.security_score >= 60
                        ? "bg-amber-600"
                        : "bg-red-600"
                  }
                >
                  {latestAudit.security_score >= 80
                    ? "Excellent"
                    : latestAudit.security_score >= 60
                      ? "Good"
                      : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={latestAudit.security_score} className="h-3" />

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {latestAudit.files_scanned}
                  </p>
                  <p className="text-xs text-gray-600">Files Scanned</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {latestAudit.issues_found}
                  </p>
                  <p className="text-xs text-gray-600">Issues Found</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {latestAudit.critical_issues}
                  </p>
                  <p className="text-xs text-gray-600">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          {latestAudit.vulnerabilities?.[0]?.compliance_status && (
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-600" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(
                    latestAudit.vulnerabilities[0].compliance_status || {},
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900 font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        {complianceIcons[value]}
                        <Badge
                          className={
                            value === "pass"
                              ? "bg-green-600"
                              : value === "warning"
                                ? "bg-amber-600"
                                : "bg-red-600"
                          }
                        >
                          {value}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vulnerabilities */}
          {latestAudit.vulnerabilities?.length > 0 && (
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Identified Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestAudit.vulnerabilities
                  .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                  .map((vuln, idx) => {
                    const colors =
                      severityColors[vuln.severity] || severityColors.low;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${colors.light} ${colors.border}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {vuln.title}
                              </h4>
                              <Badge className={colors.bg}>
                                {vuln.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {vuln.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {vuln.description}
                            </p>

                            {vuln.affected_items?.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  Affected Items:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {vuln.affected_items.map((item, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs font-medium text-green-900 mb-1">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Remediation:
                              </p>
                              <p className="text-sm text-green-800">
                                {vuln.remediation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {latestAudit.recommendations?.length > 0 && (
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {latestAudit.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Audit History */}
      {audits.length > 1 && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Audit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {audits.slice(1, 6).map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Score: {audit.security_score}/100
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(audit.audit_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {audit.issues_found} issues
                    </p>
                    {audit.critical_issues > 0 && (
                      <p className="text-xs text-red-600">
                        {audit.critical_issues} critical
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareModal({ isOpen, onClose, item }) {
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [permission, setPermission] = useState("view");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const createShare = useMutation({
    mutationFn: async () => {
      const link = `https://digitaloasis.app/share/${Math.random().toString(36).substr(2, 9)}`;

      const share = await base44.entities.SharedItem.create({
        item_name: item.name,
        item_type: item.type || "file",
        shared_by: (await base44.auth.me()).email,
        shared_with: emails,
        permission_level: permission,
        share_link: link,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      // Award points for sharing
      const user = await base44.auth.me();
      const userPoints = await base44.entities.UserPoints.filter({
        created_by: user.email,
      });
      if (userPoints[0]) {
        await base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: (userPoints[0].total_points || 0) + 20,
          points_this_week: (userPoints[0].points_this_week || 0) + 20,
        });
      }

      return { share, link };
    },
    onSuccess: ({ link }) => {
      setShareLink(link);
      queryClient.invalidateQueries({ queryKey: ["sharedItems"] });
    },
  });

  const addEmail = () => {
    if (emailInput && emailInput.includes("@")) {
      setEmails([...emails, emailInput]);
      setEmailInput("");
    }
  };

  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share "{item?.name}"
          </DialogTitle>
          <DialogDescription>
            Share this {item?.type || "file"} with others and set permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {!shareLink ? (
            <>
              <div>
                <Label htmlFor="email">Share with people</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addEmail()}
                    placeholder="Enter email address"
                  />
                  <Button onClick={addEmail} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-2">
                      {email}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeEmail(email)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="permission">Permission Level</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => createShare.mutate()}
                disabled={createShare.isPending || emails.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createShare.isPending ? "Creating share link..." : "Share"}
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                <Check className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Shared Successfully!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {emails.length} {emails.length === 1 ? "person" : "people"}{" "}
                  can now {permission} this {item?.type || "file"}
                </p>
              </div>

              <div>
                <Label>Share Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={shareLink} readOnly className="bg-gray-50" />
                  <Button onClick={copyLink} size="icon">
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Link expires in 30 days
                </p>
              </div>

              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { FileEdit, Send, Eye, MessageSquare, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function RealTimeEditor({
  documentId,
  documentName,
  permission,
}) {
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: comments } = useQuery({
    queryKey: ["documentComments", documentId],
    queryFn: () =>
      base44.entities.DocumentComment.filter(
        { document_id: documentId },
        "-created_date",
      ),
    initialData: [],
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });

  const { data: activities } = useQuery({
    queryKey: ["documentActivity", documentId],
    queryFn: () =>
      base44.entities.ActivityFeed.filter(
        { item_id: documentId },
        "-created_date",
        10,
      ),
    initialData: [],
    refetchInterval: 2000,
  });

  const addComment = useMutation({
    mutationFn: async (commentText) => {
      const newComment = await base44.entities.DocumentComment.create({
        document_id: documentId,
        user_email: user.email,
        comment_text: commentText,
        position: { line: 1 },
      });

      // Log activity
      await base44.entities.ActivityFeed.create({
        user_email: user.email,
        action_type: "commented",
        item_name: documentName,
        item_id: documentId,
        description: `Added a comment`,
      });

      // Send notification to other collaborators
      const sharedItems = await base44.entities.SharedItem.filter({
        item_name: documentName,
      });
      for (const share of sharedItems) {
        for (const recipientEmail of share.shared_with) {
          if (recipientEmail !== user.email) {
            await base44.entities.Notification.create({
              recipient_email: recipientEmail,
              notification_type: "collaboration",
              title: "New Comment",
              message: `${user.email} commented on ${documentName}`,
              related_id: documentId,
              priority: "normal",
            });
          }
        }
      }

      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentComments"] });
      queryClient.invalidateQueries({ queryKey: ["documentActivity"] });
      setComment("");
    },
  });

  const saveContent = useMutation({
    mutationFn: async () => {
      await base44.entities.ActivityFeed.create({
        user_email: user.email,
        action_type: "edited",
        item_name: documentName,
        item_id: documentId,
        description: `Made changes to document`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentActivity"] });
    },
  });

  const resolveComment = useMutation({
    mutationFn: (commentId) => {
      return base44.entities.DocumentComment.update(commentId, {
        is_resolved: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentComments"] });
    },
  });

  const canEdit = permission === "edit";
  const canComment = permission === "comment" || canEdit;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="md:col-span-2 space-y-4">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-blue-600" />
                {documentName}
              </CardTitle>
              <Badge
                className={
                  canEdit
                    ? "bg-green-600"
                    : canComment
                      ? "bg-blue-600"
                      : "bg-gray-600"
                }
              >
                {canEdit ? (
                  <FileEdit className="w-3 h-3 mr-1" />
                ) : canComment ? (
                  <MessageSquare className="w-3 h-3 mr-1" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                {permission}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit}
              placeholder={canEdit ? "Start typing..." : "View only"}
              rows={15}
              className="font-mono text-sm"
            />
            {canEdit && (
              <Button
                onClick={() => saveContent.mutate()}
                disabled={saveContent.isPending}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-xs text-gray-600 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>
                      <strong>{activity.user_email.split("@")[0]}</strong>{" "}
                      {activity.action_type}
                    </span>
                    <span className="text-gray-400">
                      {format(new Date(activity.created_date), "h:mm a")}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Sidebar */}
      <div className="space-y-4">
        {canComment && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-sm">Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
              />
              <Button
                onClick={() => addComment.mutate(comment)}
                disabled={addComment.isPending || !comment}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No comments yet
                </p>
              ) : (
                comments.map((cmt) => (
                  <motion.div
                    key={cmt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      cmt.is_resolved ? "bg-gray-100" : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                          {cmt.user_email[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold">
                          {cmt.user_email.split("@")[0]}
                        </span>
                      </div>
                      {!cmt.is_resolved && canEdit && (
                        <button
                          onClick={() => resolveComment.mutate(cmt.id)}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{cmt.comment_text}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(cmt.created_date), "MMM d, h:mm a")}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

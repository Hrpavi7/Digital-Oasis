import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  Users,
  FolderOpen,
  Eye,
  Edit3,
  MessageSquare,
  FileEdit,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import ShareModal from "../components/collaboration/ShareModal";
import ActivityFeed from "../components/collaboration/ActivityFeed";
import RealTimeEditor from "../components/collaboration/RealTimeEditor";
import AIDocumentEditor from "../components/collaboration/AIDocumentEditor";
import CollaborationAnalytics from "../components/collaboration/CollaborationAnalytics";

const SAMPLE_ITEMS = [
  {
    id: 1,
    name: "Q4 Financial Report.xlsx",
    type: "file",
    category: "Finance",
  },
  { id: 2, name: "Project Proposals", type: "folder", category: "Work" },
  { id: 3, name: "Vacation Photos 2024", type: "folder", category: "Personal" },
  { id: 4, name: "Meeting Notes.docx", type: "file", category: "Work" },
];

const PERMISSION_ICONS = {
  view: Eye,
  edit: Edit3,
  comment: MessageSquare,
};

export default function Collaboration() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState(
    "Sample document content for AI editing...",
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: sharedItems } = useQuery({
    queryKey: ["sharedItems"],
    queryFn: () => base44.entities.SharedItem.list("-created_date"),
    initialData: [],
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Notification.filter(
        {
          recipient_email: user.email,
          is_read: false,
        },
        "-created_date",
        10,
      );
    },
    initialData: [],
    refetchInterval: 5000,
  });

  const openShareModal = (item) => {
    setSelectedItem(item);
    setShareModalOpen(true);
  };

  const openEditor = (item, permission) => {
    setEditingDocument({ ...item, permission });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4">
            <Users className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Collaboration Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share files, collaborate in real-time, and let AI help you edit
            documents 🤝
          </p>
        </motion.div>

        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {notifications.length} new notification
                      {notifications.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notifications[0].message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="files">Files & Folders</TabsTrigger>
            <TabsTrigger value="editor">Real-Time Editor</TabsTrigger>
            <TabsTrigger value="ai-editor">AI Editor</TabsTrigger>
            <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      Your Files & Folders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SAMPLE_ITEMS.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {item.type === "folder" ? (
                                    <FolderOpen className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <FileEdit className="w-5 h-5 text-purple-600" />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {item.category}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {item.type === "file" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditor(item, "edit")}
                                    >
                                      <FileEdit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => openShareModal(item)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-green-600" />
                      Shared with You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sharedItems.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No items shared with you yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {sharedItems.map((item) => {
                          const PermissionIcon =
                            PERMISSION_ICONS[item.permission_level];
                          return (
                            <Card key={item.id} className="bg-green-50">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.item_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Shared by {item.shared_by}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-600 text-white">
                                    <PermissionIcon className="w-3 h-3 mr-1" />
                                    {item.permission_level}
                                  </Badge>
                                </div>
                                {item.item_type === "file" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openEditor(
                                        {
                                          id: item.id,
                                          name: item.item_name,
                                        },
                                        item.permission_level,
                                      )
                                    }
                                    className="mt-2 w-full"
                                  >
                                    Open in Editor
                                  </Button>
                                )}
                                {item.expires_at && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Expires{" "}
                                    {format(
                                      new Date(item.expires_at),
                                      "MMM d, yyyy",
                                    )}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <ActivityFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="mt-8">
            {!editingDocument ? (
              <Card className="border-none shadow-xl">
                <CardContent className="p-12 text-center">
                  <FileEdit className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Real-Time Collaborative Editor
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a file from the Files tab to start editing together
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingDocument(null)}
                >
                  ← Back to Files
                </Button>
                <RealTimeEditor
                  documentId={editingDocument.id}
                  documentName={editingDocument.name}
                  permission={editingDocument.permission}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-editor" className="mt-8">
            <div className="max-w-5xl mx-auto space-y-6">
              <AIDocumentEditor
                content={documentContent}
                onContentUpdate={setDocumentContent}
              />

              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle>Document Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
                    placeholder="Type or paste your document content here..."
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <CollaborationAnalytics user={user} />
          </TabsContent>

          <TabsContent value="activity" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <ActivityFeed />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
}

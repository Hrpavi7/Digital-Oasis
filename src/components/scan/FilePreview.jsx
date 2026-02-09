import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Calendar,
  HardDrive,
  FolderOpen,
} from "lucide-react";
import { format } from "date-fns";

const PREVIEW_CONTENT = {
  "old-presentation-2020.pptx": {
    type: "document",
    preview:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    description: "Quarterly Business Review Q2 2020",
    pages: 24,
    lastModified: new Date(2020, 5, 15),
  },
  "screenshot-2019-backup.png": {
    type: "image",
    preview:
      "https://images.unsplash.com/photo-1551650992-6f8f4c5e5c7c?w=800&h=600&fit=crop",
    description: "Desktop screenshot from 2019",
    dimensions: "1920x1080",
    lastModified: new Date(2019, 8, 10),
  },
  "duplicate-photo-1.jpg": {
    type: "image",
    preview:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    description: "Mountain landscape photo",
    dimensions: "4032x3024",
    lastModified: new Date(2022, 3, 20),
  },
  "temp-download-cache": {
    type: "cache",
    content:
      "Cache metadata:\n- 1,234 cached items\n- Browser: Chrome\n- Size: 234 MB\n- Last accessed: 2 weeks ago",
    description: "Temporary download cache files",
    lastModified: new Date(2024, 9, 15),
  },
  "browser-cache-2023": {
    type: "cache",
    content:
      "Browser cache directory containing:\n- Cookies\n- Temporary internet files\n- Website data\n- 567 MB of cached content",
    description: "Browser cache from 2023",
    lastModified: new Date(2023, 11, 30),
  },
  "old-project-backup": {
    type: "archive",
    content:
      "Backup archive contents:\n- Project files (342 files)\n- Created: March 2022\n- Project: Website Redesign v2\n- Compressed size: 123 MB",
    description: "Old project backup archive",
    lastModified: new Date(2022, 2, 15),
  },
  "unused-app-data": {
    type: "text",
    content:
      "Application data from uninstalled software:\n\nApp: PhotoEditor Pro\nStatus: Uninstalled 6 months ago\nData includes:\n- User preferences\n- Temporary files\n- Cache data\n- Plugin data\n\nSafe to remove.",
    description: "Leftover application data",
    lastModified: new Date(2024, 3, 10),
  },
  "temp-video-render.mp4": {
    type: "video",
    preview:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    description: "Temporary video render file",
    duration: "5:24",
    resolution: "1920x1080",
    lastModified: new Date(2024, 10, 5),
  },
};

export default function FilePreview({
  file,
  isOpen,
  onClose,
  onDelete,
  onArchive,
  onCompress,
}) {
  const [imageError, setImageError] = useState(false);

  if (!file) return null;

  const previewData = PREVIEW_CONTENT[file.name] || {
    type: "unknown",
    description: "File preview not available",
    lastModified: new Date(),
  };

  const Icon = file.icon;

  const renderPreview = () => {
    if (previewData.type === "image" && !imageError) {
      return (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
          <img
            src={previewData.preview}
            alt={file.name}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
          {previewData.dimensions && (
            <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
              {previewData.dimensions}
            </Badge>
          )}
        </div>
      );
    }

    if (previewData.type === "document") {
      return (
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 aspect-video flex items-center justify-center">
          <div className="text-center p-8">
            <FileText className="w-20 h-20 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {previewData.description}
            </h3>
            {previewData.pages && (
              <p className="text-sm text-gray-600">{previewData.pages} pages</p>
            )}
            <Button variant="outline" className="mt-4" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Document
            </Button>
          </div>
        </div>
      );
    }

    if (previewData.type === "video") {
      return (
        <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={previewData.preview}
              alt={file.name}
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-900 border-b-8 border-b-transparent ml-1" />
            </div>
            {previewData.duration && (
              <Badge className="bg-black/70 text-white">
                {previewData.duration}
              </Badge>
            )}
            {previewData.resolution && (
              <Badge className="ml-2 bg-black/70 text-white">
                {previewData.resolution}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    if (
      previewData.type === "text" ||
      previewData.type === "cache" ||
      previewData.type === "archive"
    ) {
      return (
        <div className="rounded-xl bg-gray-900 p-6 text-gray-100 font-mono text-sm overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap">{previewData.content}</pre>
        </div>
      );
    }

    return (
      <div className="rounded-xl bg-gray-100 aspect-video flex items-center justify-center">
        <div className="text-center p-8">
          <File className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Preview not available for this file type
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Icon className="w-6 h-6 text-sage-600" />
            {file.name}
          </DialogTitle>
          <DialogDescription>
            Review this file before taking action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* File Preview */}
          {renderPreview()}

          {/* File Metadata */}
          <Card className="border-sage-200">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Size</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} GB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Modified
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(previewData.lastModified, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FolderOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Category
                    </p>
                    <p className="text-sm text-gray-600">{file.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {file.type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Why this file was flagged:</strong> {file.reason}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="gap-2">
              <X className="w-4 h-4" />
              Keep File
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onArchive();
                onClose();
              }}
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FolderOpen className="w-4 h-4" />
              Archive
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onCompress();
                onClose();
              }}
              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <HardDrive className="w-4 h-4" />
              Compress
            </Button>

            <Button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
              Delete File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

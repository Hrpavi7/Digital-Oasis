import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Sparkles, Lightbulb, TrendingUp, Loader2, X, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function AIChatbot({ user, isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: chatHistory } = useQuery({
    queryKey: ["chatHistory", user?.email],
    queryFn: () =>
      base44.entities.ChatMessage.filter(
        { user_email: user?.email },
        "-created_date",
        50,
      ),
    enabled: !!user,
    initialData: [],
  });

  const sendMessage = useMutation({
    mutationFn: async (userMessage) => {
      setIsTyping(true);

      // Optimized: Only fetch essential context
      const userLevel = user?.total_files_cleaned
        ? Math.floor(user.total_files_cleaned / 10) + 1
        : 1;

      const prompt = `You are a helpful AI assistant for Digital Oasis, a digital cleaning app.

User Level: ${userLevel}

User's message: "${userMessage}"

Quick feature guide:
- Scan: Find and remove unnecessary files
- Organize: AI file organization
- Analytics: View cleaning statistics and insights
- Achievements: Track progress with badges
- Collaboration: Share and co-edit files
- Automation: Auto-clean with learned rules
- Gamification: Challenges and leaderboards
- Backup: AI-optimized backups

Provide a helpful, friendly response (under 100 words).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setIsTyping(false);

      return base44.entities.ChatMessage.create({
        user_email: user.email,
        message: userMessage,
        response: response,
        message_type: "question",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      setMessage("");
    },
  });

  const generateProactiveTip = useMutation({
    mutationFn: async () => {
      setIsTyping(true);

      const filesCount = user?.total_files_cleaned || 0;

      const prompt = `You are a proactive AI assistant for Digital Oasis.

User has cleaned ${filesCount} files total.

Generate ONE short tip (25-40 words) to help improve digital wellness. Focus on:
${filesCount < 10 ? "- Getting started with regular cleaning" : ""}
${filesCount >= 10 && filesCount < 50 ? "- Building consistency and trying automation" : ""}
${filesCount >= 50 ? "- Advanced features like teams and AI optimization" : ""}

Make it actionable and encouraging!`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setIsTyping(false);

      return base44.entities.ChatMessage.create({
        user_email: user.email,
        message: "[AI Generated Tip]",
        response: response,
        message_type: "tip",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-96 shadow-2xl"
    >
      <Card className="border-none bg-white h-[600px] flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Hello! I'm your AI Assistant 👋
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ask me anything about Digital Oasis features, get tips, or
                request personalized recommendations!
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    sendMessage.mutate("How can I organize my files better?")
                  }
                  className="w-full text-left"
                >
                  💡 How can I organize my files better?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    sendMessage.mutate("Show me automation features")
                  }
                  className="w-full text-left"
                >
                  ⚡ Show me automation features
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateProactiveTip.mutate()}
                  className="w-full text-left"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get a personalized tip
                </Button>
              </div>
            </div>
          )}

          {chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                  <p className="text-sm">{chat.message}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    {chat.message_type === "tip" && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Tip
                      </Badge>
                    )}
                    {chat.message_type === "recommendation" && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Recommendation
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {chat.response}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(chat.created_date), "h:mm a")}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateProactiveTip.mutate()}
              disabled={generateProactiveTip.isPending}
              className="text-xs"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Get Tip
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              disabled={sendMessage.isPending || !message.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

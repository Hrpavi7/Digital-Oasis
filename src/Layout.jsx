import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Sparkles, Home, Scan, FolderTree, Award, Settings, Trophy, Users, Shield, Zap, BarChart3, MessageCircle, } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import AIChatbot from "@/components/assistant/AIChatbot";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Clean & Scan",
    url: createPageUrl("Scan"),
    icon: Scan,
  },
  {
    title: "Organize",
    url: createPageUrl("Organize"),
    icon: FolderTree,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Achievements",
    url: createPageUrl("Achievements"),
    icon: Award,
  },
  {
    title: "Gamification",
    url: createPageUrl("Gamification"),
    icon: Trophy,
  },
  {
    title: "Collaboration",
    url: createPageUrl("Collaboration"),
    icon: Users,
  },
  {
    title: "Backup",
    url: createPageUrl("Backup"),
    icon: Shield,
  },
  {
    title: "Automation",
    url: createPageUrl("Automation"),
    icon: Zap,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --color-sage-50: #f6f7f6;
          --color-sage-100: #e8ebe8;
          --color-sage-200: #d4dbd4;
          --color-sage-300: #b3c2b3;
          --color-sage-400: #8ea98e;
          --color-sage-500: #6b8e6b;
          --color-sage-600: #547254;
          --color-lavender-100: #f3f0ff;
          --color-lavender-200: #e9e0ff;
          --color-lavender-300: #d4c5f9;
          --color-lavender-400: #b69ff7;
          --color-peach-100: #fff5f0;
          --color-peach-200: #ffe8db;
          --color-warm-50: #fafaf9;
        }
      `}</style>
      <div
        className="min-h-screen flex w-full bg-gradient-to-br from-sage-50 to-lavender-100"
        style={{
          background: "linear-gradient(135deg, #f6f7f6 0%, #f3f0ff 100%)",
        }}
      >
        <Sidebar className="border-r border-sage-200/50 backdrop-blur-sm bg-white/80">
          <SidebarHeader className="border-b border-sage-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-lavender-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">
                  Digital Oasis
                </h2>
                <p className="text-xs text-sage-600">Your peaceful companion</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-sage-100 hover:text-sage-700 transition-all duration-300 rounded-xl px-4 py-3 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-sage-200 to-lavender-200 text-sage-800 shadow-sm"
                            : ""
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sage-200/50 p-4 space-y-3">
            <Link to={createPageUrl("Settings")}>
              <SidebarMenuButton
                className={`w-full hover:bg-sage-100 hover:text-sage-700 transition-all duration-300 rounded-xl px-4 py-3 ${
                  location.pathname === createPageUrl("Settings")
                    ? "bg-gradient-to-r from-sage-200 to-lavender-200 text-sage-800 shadow-sm"
                    : ""
                }`}
              >
                <Settings className="w-4 h-4 mr-3" />
                <span className="font-medium">Settings</span>
              </SidebarMenuButton>
            </Link>

            <div className="bg-gradient-to-br from-lavender-100 to-peach-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 italic">
                "Every clean space begins with a single file organized." 🌸
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/60 backdrop-blur-md border-b border-sage-200/50 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-sage-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-gray-900">
                Digital Oasis
              </h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
        {!chatbotOpen && (
          <Button
            onClick={() => setChatbotOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl"
            size="icon"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        )}
        <AnimatePresence>
          {chatbotOpen && (
            <AIChatbot
              user={user}
              isOpen={chatbotOpen}
              onClose={() => setChatbotOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </SidebarProvider>
  );
}

"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatDetails?: {
    title?: string;
    content?: string;
    // Add more properties as needed
  };
}

export function ChatSidePanel({ isOpen, onClose, chatDetails }: ChatSidePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 p-4"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Chat Details</h3>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-1 h-auto hover:bg-muted"
            >
              ✕
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Add your panel content here */}
            {chatDetails?.title && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                <p>{chatDetails.title}</p>
              </div>
            )}
            {chatDetails?.content && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Content</h4>
                <p>{chatDetails.content}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
} 
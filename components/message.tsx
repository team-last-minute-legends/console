"use client";

import { useState } from "react";
import type { Message } from "ai";
import { motion } from "framer-motion";

import { SparklesIcon } from "./icons";
import { X } from "lucide-react";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/utils";
import { Weather } from "./weather";

export const PreviewMessage = ({
  message,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [imagesLoading, setImagesLoading] = useState([true, true]); // Track loading state for each image

  const handleTextClick = () => {
    setIsPanelOpen(true);
  };

  const handleImageLoad = (index: number) => {
    setImagesLoading(prev => prev.map((state, i) => i === index ? false : state));
  };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <div 
                onClick={handleTextClick}
                className="cursor-pointer hover:opacity-80"
              >
                <Markdown>{message.content as string}</Markdown>
              </div>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "get_current_weather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cn({
                      skeleton: ["get_current_weather"].includes(toolName),
                    })}
                  >
                    {toolName === "get_current_weather" ? <Weather /> : null}
                  </div>
                );
              })}
            </div>
          )}

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border shadow-lg">
          <div className="p-4">
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="mb-4 hover:text-foreground flex items-center gap-2 text-muted-foreground"
            >
              <X size={16} />
              Close
            </button>
            <div className="space-y-4">
              <div>
                <h2 className="font-medium mb-2">Message Details</h2>
                <p>{message.content}</p>
              </div>
              
              <div>
                <h2 className="font-medium mb-2">Related Images</h2>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    {imagesLoading[0] && (
                      <div className="absolute inset-0 animate-pulse bg-muted rounded-lg" />
                    )}
                    <img 
                      src="https://picsum.photos/400/300" 
                      alt="Sample image 1"
                      className="w-full h-48 object-cover rounded-lg"
                      onLoad={() => handleImageLoad(0)}
                    />
                  </div>
                  <div className="relative">
                    {imagesLoading[1] && (
                      <div className="absolute inset-0 animate-pulse bg-muted rounded-lg" />
                    )}
                    <img 
                      src="https://picsum.photos/400/301" 
                      alt="Sample image 2"
                      className="w-full h-48 object-cover rounded-lg"
                      onLoad={() => handleImageLoad(1)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

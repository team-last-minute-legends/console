"use client";


import { useCallback } from "react";
import { Button } from "./ui/button";
import { GoUnmute, GoMute } from "react-icons/go";
import { useConversation } from "@/hooks/useConversation";

async function getSignedUrl(): Promise<string> {
  const response = await fetch('/api/signed-url')
  if (!response.ok) {
      throw Error('Failed to get signed url')
  }
  const data = await response.json()
  return data.signedUrl
}

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      const signedUrl = await getSignedUrl()
      await conversation.startSession({
        signedUrl: signedUrl,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-inline">
      {conversation.status === "connected" ? (
        <Button
          onClick={(event) => {
            event.preventDefault();
            stopConversation();
          }}
          className="rounded-full p-1.5 h-fit  m-0.5 border dark:border-zinc-600"
        >
          <GoMute size={14} />
        </Button>
      ) : (
        <Button
          onClick={(event) => {
            event.preventDefault();
            startConversation();
          }}
          className="rounded-full p-1.5 h-fit  m-0.5 border dark:border-zinc-600"
        >
          <GoUnmute size={14} />
        </Button>
      )}
    </div>
  );
}

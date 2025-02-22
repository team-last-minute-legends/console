import { motion } from "framer-motion";
import React from "react";
import { Button } from "./ui/button";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { Globe, UtensilsIcon } from "lucide-react";

const suggestedActions = [
  {
    title: "Find the most affordable red shoe in amazon",
    label: "Amazon",
    icon: Globe,
  },
  {
    title: "Find popular white kurta in myntra", 
    label: "Myntra",
    icon: UtensilsIcon,
  },
];


type SuggestionsProps = {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
};
export default function Suggestions({ append }: SuggestionsProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-2 w-full">
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className={index > 1 ? "hidden sm:block" : "block"}
          >
            <Button
              variant="ghost"
              onClick={async (event) => {
                event.preventDefault();
                append({
                  role: "user",
                  content: suggestedAction.title,
                });
              }}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
            >
              <suggestedAction.icon className="w-6 h-6 text-primary" />
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </>
  );
}

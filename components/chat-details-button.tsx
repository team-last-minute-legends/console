"use client";

import { Button } from "./ui/button";

interface ChatDetailsButtonProps {
  onClick: () => void;
  className?: string;
}

const ArrowIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 61 61"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.7271 15.3115L37.7271 30.3115L22.7271 45.3115"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ChatDetailsButton({ onClick, className }: ChatDetailsButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`transition-opacity p-1 h-auto ${className}`}
    >
      <ArrowIcon />
    </Button>
  );
} 
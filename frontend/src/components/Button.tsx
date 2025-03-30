import React, { ReactNode, MouseEvent } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function Button({ children, onClick, className = "" }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded-md ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
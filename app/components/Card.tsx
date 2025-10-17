import React from "react";

interface CardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export default function Card({ title, icon, children }: CardProps) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl w-full max-w-2xl text-white">
      <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2 text-center">
        {icon && <span>{icon}</span>} {title}
      </h2>
      {children}
    </div>
  );
}
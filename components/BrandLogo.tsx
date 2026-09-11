import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "image";
}

export function BrandLogo({
  className = "",
  size = "md",
  variant = "full",
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  if (variant === "image") {
    const imgHeights = {
      sm: 24,
      md: 32,
      lg: 40,
    };
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <Image
          src="/logo.png"
          alt="DreamFlow"
          width={imgHeights[size] * 2.55}
          height={imgHeights[size]}
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Flow Icon */}
      <div
        className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E7F60]/20 via-[#145741]/40 to-[#0A261D] border border-[#2EB88A]/30 shadow-[0_0_15px_rgba(46,184,138,0.2)]`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[72%] h-[72%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Upper flowing ribbon */}
          <path
            d="M58 20 C68 20 78 28 78 40 L78 62 C78 72 70 80 60 80 L52 80 C44 80 40 74 40 68 L40 50 C40 40 48 32 58 32 L70 32"
            stroke="#2EB88A"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lower flowing ribbon */}
          <path
            d="M42 80 C32 80 22 72 22 60 L22 38 C22 28 30 20 40 20 L48 20 C56 20 60 26 60 32 L60 50 C60 60 52 68 42 68 L30 68"
            stroke="#1E7F60"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {variant === "full" && (
        <span
          className={`font-black tracking-tight text-white ${textSizes[size]} flex items-center`}
        >
          Dream
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-[#2EB88A] ml-0.5 font-extrabold">
            Flow
          </span>
        </span>
      )}
    </div>
  );
}

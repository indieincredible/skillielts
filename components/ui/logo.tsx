import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brain shape representing skills */}
        <path
          d="M16 4C10.477 4 6 8.477 6 14C6 17.991 8.157 21.431 11.343 23.343C11.123 23.771 11 24.258 11 24.777V27C11 28.657 12.343 30 14 30H18C19.657 30 21 28.657 21 27V24.777C21 24.258 20.877 23.771 20.657 23.343C23.843 21.431 26 17.991 26 14C26 8.477 21.523 4 16 4Z"
          className="fill-black dark:fill-white"
        />
        {/* Lightning bolt for snap/speed */}
        <path
          d="M17.5 2L10 16H15.5L14.5 30L22 16H16.5L17.5 2Z"
          fill="#ffffff"
          className="stroke-black dark:stroke-white"
          strokeWidth="1"
        />
      </svg>
      <span className="ml-2 text-xl font-bold text-black dark:text-white">SkillIelts</span>
    </div>
  );
}







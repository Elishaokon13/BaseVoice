"use client";
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 bg-background/80 border-b border-primary/10 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
        <Image 
          src="/base-logo.svg"
          alt="Base"
          width={28}
          height={28}
          className="dark:invert sm:w-8 sm:h-8"
        />
        <span className="font-coinbase-mono text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
          BaseVoice
        </span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-6">
        <Link 
          href="/view-feedback" 
          className="text-xs sm:text-sm font-coinbase-mono hover:text-primary transition-colors duration-200 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hidden sm:block"
        >
          View Feedback
        </Link>
        <Link
          href="/view-feedback"
          className="sm:hidden text-xs font-coinbase-mono hover:text-primary transition-colors duration-200 bg-primary/10 p-2 rounded-full"
          aria-label="View Feedback"
        >
          <MessageCircle className="h-4 w-4" />
        </Link>
        
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 hover:bg-primary/10 hover:cursor-pointer rounded-full transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        )}

        <w3m-button />
      </div>
    </nav>
  );
}
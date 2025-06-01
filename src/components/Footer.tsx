import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4">
          
          {/* Left side - Branding */}
          <div className="flex items-center gap-2">
            <div className="font-coinbase-mono text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
              BaseVoice
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-coinbase-mono">
            <Link 
              href="https://base.org" 
              target="_blank"
              className="hover:text-primary transition-colors duration-200"
            >
              Base Network
            </Link>
            <Link 
              href="https://docs.base.org" 
              target="_blank"
              className="hover:text-primary transition-colors duration-200"
            >
              Documentation
            </Link>
            <Link 
              href="/view-feedback"
              className="hover:text-primary transition-colors duration-200"
            >
              View Feedback
            </Link>
          </div>

          {/* Right side - Privacy note */}
          <div className="text-xs text-muted-foreground font-coinbase-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
            ENCRYPTED • ANONYMOUS
          </div>
          
        </div>

      </div>
    </footer>
  );
}
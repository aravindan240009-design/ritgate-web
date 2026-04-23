import LogoImg from '../../assets/logo.png';
import { cn } from '../../utils/cn';

interface RITLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'color' | 'white';
  glow?: boolean;
}

export default function RITLogo({ className, size = 100, variant = 'color', glow = false }: RITLogoProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Glow Rings (for Splash) */}
      {glow && (
        <>
          <div className="absolute inset-[-20%] rounded-full border border-blue-500/10 animate-pulse" />
          <div className="absolute inset-[-40%] rounded-full border border-blue-500/5" />
        </>
      )}
      
      <div 
        className={cn(
          "relative w-full h-full flex items-center justify-center rounded-full overflow-hidden bg-white shadow-xl",
          glow ? "border-[6px] border-blue-100" : "border-4 border-slate-50",
          className
        )}
      >
        <img
          src={LogoImg}
          alt="RIT Logo"
          className={cn(
            "w-full h-full object-cover",
            variant === 'white' && "brightness-0 invert opacity-90"
          )}
        />
      </div>
    </div>
  );
}

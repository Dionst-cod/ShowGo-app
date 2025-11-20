import { useEffect, useRef } from 'react';

interface HeroProps {
  onOpenSignUp: () => void;
}

export default function Hero({ onOpenSignUp }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const waves: Array<{
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.6)',
      'rgba(59, 130, 246, 0.5)',
      'rgba(167, 139, 250, 0.7)',
      'rgba(217, 70, 239, 0.6)',
    ];

    for (let i = 0; i < 5; i++) {
      waves.push({
        amplitude: 25 + Math.random() * 40,
        frequency: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.025,
        opacity: 0.4 + Math.random() * 0.4,
        color: colors[i],
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = wave.color;

        for (let x = 0; x < width; x += 1.5) {
          const y =
            centerY +
            Math.sin(x * wave.frequency + wave.phase + time * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.3);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      time += 1;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-pink-900/10 to-transparent" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
          <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Discover Music Events
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
          Find live shows, connect with artists, and experience unforgettable nights
        </p>

        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-xl" />
          <canvas
            ref={canvasRef}
            className="w-full max-w-4xl h-40 mx-auto pointer-events-none relative"
          />
        </div>

        <button
          onClick={onOpenSignUp}
          className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-500 transform hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Join the movement
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

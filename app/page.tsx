export default function HomePage() {
  return (
    <main className="relative">
      {/* Cinematic Gradient Hero - Full viewport */}
      <section 
        className="homepage-hero"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, oklch(0.70 0.15 280 / 30%) 0%, transparent 50%),
            linear-gradient(135deg, oklch(0.85 0.04 60) 0%, oklch(0.75 0.10 200) 50%, oklch(0.70 0.15 280) 100%)
          `,
        }}
      >
        {/* Floating orbs for depth */}
        <div 
          className="homepage-hero-orb-1" 
          style={{
            background: 'radial-gradient(circle, oklch(0.60 0.18 180 / 40%) 0%, transparent 70%)',
          }}
          aria-hidden="true" 
        />
        <div 
          className="homepage-hero-orb-2" 
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.15 300 / 40%) 0%, transparent 70%)',
          }}
          aria-hidden="true" 
        />
        
        {/* Center glow */}
        <div 
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 40% at 50% 40%, oklch(0.50 0.15 270 / 25%) 0%, transparent 70%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        
        {/* Content placeholder - gradient only for now */}
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-black text-white drop-shadow-lg">
            TechBox
          </h1>
        </div>
      </section>
    </main>
  );
}

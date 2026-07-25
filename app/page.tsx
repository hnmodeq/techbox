export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Blue to Black Gradient */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(
              180deg,
              oklch(0.15 0.08 250) 0%,
              oklch(0.10 0.06 250) 40%,
              oklch(0.05 0.03 250) 70%,
              oklch(0.02 0.02 250) 100%
            )
          `,
        }}
      />

      {/* White Impact Lines - Grid */}
      <div 
        className="fixed inset-0 -z-5 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(1 0 0) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(1 0 0) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Subtle Radial Glow */}
      <div 
        className="fixed inset-0 -z-5"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 30%, oklch(0.20 0.10 250 / 20%) 0%, transparent 60%)',
        }}
      />

      {/* Content Area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* Placeholder - ready for content */}
      </div>
    </main>
  );
}

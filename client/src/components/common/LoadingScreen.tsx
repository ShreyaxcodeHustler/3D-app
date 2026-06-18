export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-1 text-neon-2">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon/30 border-t-neon shadow-neon" />
      <div className="ml-4 text-sm tracking-wide">Initializing…</div>
    </div>
  );
}


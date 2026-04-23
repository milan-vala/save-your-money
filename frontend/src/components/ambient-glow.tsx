type AmbientGlowProps = {
  /** When false, nothing is rendered (e.g. light theme). */
  visible: boolean;
};

/**
 * Soft blue background glow for dark mode only.
 * Non-interactive; keep inside a `relative` stacking context.
 */
export function AmbientGlow({ visible }: AmbientGlowProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -top-28 left-[-10%] h-80 w-80 rounded-full bg-sky-500/18 blur-3xl" />
      <div className="absolute top-[18%] right-[-8%] h-96 w-96 rounded-full bg-blue-500/14 blur-3xl" />
      <div className="absolute top-[45%] left-[-15%] h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="absolute right-[10%] bottom-[-12%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/16 blur-3xl" />
      <div className="absolute bottom-[25%] left-[20%] h-56 w-56 rounded-full bg-sky-400/10 blur-2xl" />
    </div>
  );
}

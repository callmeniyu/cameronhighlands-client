"use client";

export default function Loader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-white shadow-soft flex items-center justify-center text-xs font-semibold text-text-secondary">
          CH
        </div>
      </div>
    </div>
  );
}

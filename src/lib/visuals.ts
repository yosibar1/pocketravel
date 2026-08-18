// Local visual identity per destination — gradient + emoji, no external image
// hosts needed. Swap for real photography when a media CDN is wired up.
export const destinationVisuals: Record<string, { gradient: string; emoji: string }> = {
  paris: { gradient: "from-indigo-400 via-purple-400 to-pink-300", emoji: "🗼" },
  rome: { gradient: "from-amber-400 via-orange-400 to-rose-400", emoji: "🏛️" },
  santorini: { gradient: "from-sky-400 via-blue-500 to-indigo-500", emoji: "🏖️" },
  barcelona: { gradient: "from-orange-400 via-amber-400 to-yellow-300", emoji: "⛪" },
  london: { gradient: "from-slate-500 via-gray-500 to-zinc-400", emoji: "🎡" },
  newyork: { gradient: "from-zinc-600 via-slate-500 to-sky-400", emoji: "🗽" },
  tokyo: { gradient: "from-rose-400 via-pink-500 to-fuchsia-500", emoji: "🗻" },
  bangkok: { gradient: "from-emerald-400 via-teal-400 to-amber-300", emoji: "🛕" },
  dubai: { gradient: "from-amber-300 via-yellow-400 to-orange-500", emoji: "🏙️" },
  amsterdam: { gradient: "from-orange-300 via-rose-300 to-red-400", emoji: "🚲" },
  prague: { gradient: "from-red-400 via-rose-400 to-amber-300", emoji: "🏰" },
  lisbon: { gradient: "from-yellow-300 via-amber-300 to-sky-400", emoji: "🚋" },
  bali: { gradient: "from-green-400 via-emerald-400 to-teal-500", emoji: "🌴" },
  maldives: { gradient: "from-cyan-300 via-teal-400 to-blue-500", emoji: "🐠" },
  innsbruck: { gradient: "from-blue-300 via-indigo-300 to-slate-400", emoji: "⛷️" },
  rio: { gradient: "from-green-500 via-emerald-400 to-yellow-300", emoji: "🎭" },
};

export function getVisual(imageKey: string): { gradient: string; emoji: string } {
  return (
    destinationVisuals[imageKey] ?? {
      gradient: "from-sky-400 via-blue-400 to-indigo-400",
      emoji: "✈️",
    }
  );
}

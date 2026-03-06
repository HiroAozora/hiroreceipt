import clsx from "clsx";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineEvent {
  title: string;
  description: string;
  timestamp: any; // Firestore timestamp
}

interface TimelineProps {
  events: TimelineEvent[];
  currentProgressDesc: string;
}

export function Timeline({ events, currentProgressDesc }: TimelineProps) {
  // Sort events by timestamp descending (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    // Basic fallback for dates/timestamps
    const dateA = a.timestamp?.toDate
      ? a.timestamp.toDate()
      : new Date(a.timestamp);
    const dateB = b.timestamp?.toDate
      ? b.timestamp.toDate()
      : new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {/* Current/Active Status Node at the top */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
        {/* Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
          <Clock size={16} className="animate-pulse" />
        </div>

        {/* Card */}
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.03)] border border-emerald-100 relative">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full w-4 h-4 bg-white border-t border-l border-emerald-100 rotate-45 transform origin-center hidden md:block md:group-even:-translate-x-1/2 md:group-odd:translate-x-4 md:group-even:left-0 md:group-odd:left-auto md:group-odd:right-0 md:group-odd:border-l-0 md:group-odd:border-t-0 md:group-odd:border-r md:group-odd:border-b"></div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            Status Saat Ini
          </h4>
          <p className="text-slate-600 text-sm leading-snug">
            {currentProgressDesc}
          </p>
        </div>
      </div>

      {/* History Nodes */}
      {sortedEvents.map((event, index) => {
        const isLatestHistory = index === 0;
        const dateObj = event.timestamp?.toDate
          ? event.timestamp.toDate()
          : new Date(event.timestamp);

        return (
          <div
            key={index}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            {/* Icon */}
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10",
                isLatestHistory
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              {isLatestHistory ? (
                <CheckCircle2 size={16} />
              ) : (
                <Circle size={12} />
              )}
            </div>

            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100/50 hover:shadow-md hover:border-slate-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-1">
                <h4
                  className={clsx(
                    "font-semibold text-sm",
                    isLatestHistory ? "text-slate-800" : "text-slate-600",
                  )}
                >
                  {event.title}
                </h4>
                <time className="text-xs font-medium text-slate-400 shrink-0">
                  {dateObj.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="text-slate-500 text-sm leading-snug">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

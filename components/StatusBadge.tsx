import clsx from "clsx";

interface StatusBadgeProps {
  type: "payment" | "progress";
  status: string;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  if (type === "payment") {
    return (
      <span
        className={clsx(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
          status === "Lunas" &&
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          status === "DP" && "bg-blue-50 text-blue-700 border-blue-200",
          status === "Belum Bayar" && "bg-red-50 text-red-700 border-red-200",
        )}
      >
        {status}
      </span>
    );
  }

  // Progress
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        status === "Selesai" &&
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        status === "Dikerjakan" && "bg-blue-50 text-blue-700 border-blue-200",
        status === "Revisi" && "bg-amber-50 text-amber-700 border-amber-200",
        status === "Menunggu" && "bg-slate-50 text-slate-700 border-slate-200",
      )}
    >
      {status}
    </span>
  );
}

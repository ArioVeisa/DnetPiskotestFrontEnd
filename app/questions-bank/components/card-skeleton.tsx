"use client";

export default function BankSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="group flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-black/5 animate-pulse"
        >
          {/* Placeholder untuk ikon */}
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-gray-200" />
            <div className="min-w-0">
              {/* Placeholder untuk nama bank soal */}
              <div className="h-4 w-1/2 bg-gray-200 rounded-md mb-2" />
              {/* Placeholder untuk kategori atau badge */}
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
              </div>
            </div>
          </div>

          {/* Placeholder untuk tombol */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-md" />
            <div className="h-8 w-20 bg-gray-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

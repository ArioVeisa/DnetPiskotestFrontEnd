"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAddPackage } from "./hooks/use-add-package";
import { useMakeSession } from "../../hooks/use-make-session";
import { NotepadText, Clock } from "lucide-react";

type Props = {
  onNext: (id: number) => void;
  onCancel: () => void;
};

export default function AddPackageStep({ onNext, onCancel }: Props) {
  const { packages, loading, error } = useAddPackage();
  const { packageId, setPackageId, setTestName } = useMakeSession();

  const [selected, setSelected] = useState<number | null>(packageId ?? null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <div>Loading packages...</div>;
  if (error) return <div className="text-red-500">Gagal load: {error}</div>;

  function handleSelect(id: number, name: string) {
    setSelected(id);
    setPackageId(id);
    setTestName(name);
    localStorage.setItem("selectedPackageId", String(id));
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8">
      {/* JUDUL */}
      <h2 className="font-bold text-2xl mb-1">Add Packages</h2>
      <p className="text-gray-500 text-sm mb-6">
        Add Packages from test packages
      </p>

      {/* LIST PACKAGE */}
      <div className="space-y-4 pb-24"> {/* ada padding bawah supaya tidak ketutup sticky footer */}
        {packages.map((p) => (
          <Card
            key={p.id}
            onClick={() => handleSelect(p.id, p.name)}
            className={`cursor-pointer transition rounded-xl ${
              selected === p.id
                ? "border-blue-500 ring-2 ring-blue-200"
                : "hover:border-blue-400"
            }`}
          >
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <CardTitle className="text-base font-semibold flex-1">
                  {p.name}
                </CardTitle>

                <input
                  type="radio"
                  name="package"
                  checked={selected === p.id}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelect(p.id, p.name);
                  }}
                  className="w-5 h-5 accent-blue-600 shrink-0 self-end sm:self-auto"
                  aria-label={`Pilih paket ${p.name}`}
                />
              </div>
            </CardContent>

            <CardContent className="font-medium">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-sm bg-blue-50 text-blue-500 flex gap-2">
                  <NotepadText className="h-3.5 w-3.5" aria-hidden />
                  {p.questions} Questions
                </span>
                <span className="px-2 py-1 rounded-sm bg-blue-50 text-blue-500 flex gap-2">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {p.duration}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FOOTER STICKY */}
      <div
        className={`border-t bg-white py-3 px-6 md:px-8 flex justify-end gap-2 transition-all duration-300 ${
          isScrolled
            ? "fixed bottom-0 left-[260px] right-0 shadow-md z-40"
            : "relative mt-8"
        }`}
      >
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

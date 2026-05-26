"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { createClient } from "@/lib/supabaseClient";

interface AvatarUploadModalProps {
  userId: string;
  onClose: () => void;
  onErfolg: (neueUrl: string) => void;
}

// Erzeugt das gecropte Bild als Blob (512x512 JPG, Quality 0.85)
async function cropBildZuBlob(
  imageSrc: string,
  cropArea: Area
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas-Kontext nicht verfügbar"));

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        512,
        512
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas-Export fehlgeschlagen"));
          resolve(blob);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = imageSrc;
  });
}

export default function AvatarUploadModal({
  userId,
  onClose,
  onErfolg,
}: AvatarUploadModalProps) {
  const supabase = createClient();

  const [bildSrc, setBildSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const handleDateiWahl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFehler("");
    const datei = e.target.files?.[0];
    if (!datei) return;

    if (datei.size > 5 * 1024 * 1024) {
      setFehler("Das Bild ist zu groß. Maximal 5 MB erlaubt.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setBildSrc(reader.result as string);
    reader.readAsDataURL(datei);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSpeichern = async () => {
    if (!bildSrc || !croppedAreaPixels) return;
    setFehler("");
    setLaden(true);

    try {
      const blob = await cropBildZuBlob(bildSrc, croppedAreaPixels);
      const dateiPfad = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(dateiPfad, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(dateiPfad);

      // Cache-Busting: Zeitstempel an URL anhängen
      const oeffentlicheUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: oeffentlicheUrl })
        .eq("id", userId);

      if (profileError) throw profileError;

      onErfolg(oeffentlicheUrl);
    } catch (err) {
      setFehler(
        err instanceof Error
          ? "Fehler beim Hochladen: " + err.message
          : "Unbekannter Fehler beim Hochladen"
      );
      setLaden(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profilbild hochladen</h2>

        {fehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
            {fehler}
          </p>
        )}

        {!bildSrc ? (
          <div className="space-y-3">
            <p className="text-sm opacity-70">
              Wähle ein Bild (JPG, PNG oder WebP, max. 5 MB). Es wird quadratisch zugeschnitten.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleDateiWahl}
              className="block w-full text-sm"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Crop-Bereich */}
            <div className="relative w-full h-64 bg-gray-800 rounded overflow-hidden">
              <Cropper
                image={bildSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom-Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-60">-</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs opacity-60">+</span>
            </div>

            <button
              type="button"
              onClick={() => setBildSrc(null)}
              className="text-xs underline opacity-60 hover:opacity-100"
            >
              Anderes Bild wählen
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:opacity-70 transition"
          >
            Abbrechen
          </button>
          {bildSrc && (
            <button
              type="button"
              onClick={handleSpeichern}
              disabled={laden}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
            >
              {laden ? "Wird hochgeladen …" : "Speichern"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { createClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

interface AvatarUploadModalProps {
  open: boolean;
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
  open,
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
    // Modal-Primitive übernimmt Overlay, Fokus-Falle und Escape-Handling
    <Modal open={open} onClose={onClose} title="Profilbild hochladen" size="md">
      <div className="space-y-4">
        {fehler && <Banner variant="error" message={fehler} />}

        {!bildSrc ? (
          <div className="space-y-3">
            <p className="font-inter text-sm text-fcb-muted">
              Wähle ein Bild (JPG, PNG oder WebP, max. 5 MB). Es wird quadratisch zugeschnitten.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleDateiWahl}
              className="block w-full font-inter text-sm text-fcb-text"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Crop-Bereich – bg-fcb-bg statt bg-gray-800 */}
            <div className="relative w-full h-64 rounded overflow-hidden bg-fcb-bg">
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
              <span className="font-inter text-xs text-fcb-muted">-</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-inter text-xs text-fcb-muted">+</span>
            </div>

            <button
              type="button"
              onClick={() => setBildSrc(null)}
              className="font-inter text-xs text-fcb-muted underline hover:text-fcb-text transition-colors"
            >
              Anderes Bild wählen
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          {bildSrc && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSpeichern}
              disabled={laden}
            >
              {laden ? "Wird hochgeladen …" : "Speichern"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

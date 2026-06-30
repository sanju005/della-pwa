"use client";

import { useRef, useState } from "react";

export type CropTone = "profile" | "service" | "document" | "work";

export type CropSelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function cropImageFromSelection(
  sourceDataUrl: string,
  selection: CropSelection,
) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const sourceX = Math.round((selection.x / 100) * image.width);
      const sourceY = Math.round((selection.y / 100) * image.height);
      const sourceWidth = Math.round((selection.width / 100) * image.width);
      const sourceHeight = Math.round((selection.height / 100) * image.height);
      const maxOutputSize = 1280;
      const scale = Math.min(1, maxOutputSize / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to process this image."));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    image.onerror = () => reject(new Error("Unable to load this image for cropping."));
    image.src = sourceDataUrl;
  });
}

export function ImageCropModal({
  imageDataUrl,
  tone,
  aspectRatio,
  onClose,
  onApply,
}: {
  imageDataUrl: string;
  tone: CropTone;
  aspectRatio?: number;
  onClose: () => void;
  onApply: (selection: CropSelection) => void;
}) {
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<CropSelection>(
    aspectRatio
      ? { x: 12, y: 12, width: 76, height: 76 }
      : { x: 7, y: 24, width: 86, height: 52 },
  );
  const [dragState, setDragState] = useState<{
    mode: "move" | "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    startSelection: CropSelection;
  } | null>(null);

  const clampSelection = (nextSelection: CropSelection) => {
    const minSize = 18;
    const next = { ...nextSelection };

    if (aspectRatio) {
      const rect = imageFrameRef.current?.getBoundingClientRect();
      const frameRatio = rect && rect.height > 0 ? rect.width / rect.height : 1;
      next.height = (next.width * frameRatio) / aspectRatio;
    }

    next.width = Math.max(minSize, Math.min(next.width, 100));
    next.height = Math.max(minSize, Math.min(next.height, 100));
    next.x = Math.max(0, Math.min(next.x, 100 - next.width));
    next.y = Math.max(0, Math.min(next.y, 100 - next.height));

    return next;
  };

  const resetInitialSelection = () => {
    if (!aspectRatio || !imageFrameRef.current) {
      return;
    }

    const rect = imageFrameRef.current.getBoundingClientRect();
    const frameRatio = rect.height > 0 ? rect.width / rect.height : 1;
    const width = 76;
    const height = (width * frameRatio) / aspectRatio;
    setSelection(clampSelection({
      x: (100 - width) / 2,
      y: (100 - height) / 2,
      width,
      height,
    }));
  };

  const updateSelectionFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || !imageFrameRef.current) {
      return;
    }

    const rect = imageFrameRef.current.getBoundingClientRect();
    const deltaX = ((event.clientX - dragState.startX) / rect.width) * 100;
    const deltaY = ((event.clientY - dragState.startY) / rect.height) * 100;
    const original = dragState.startSelection;

    if (dragState.mode === "move") {
      setSelection(clampSelection({
        ...original,
        x: original.x + deltaX,
        y: original.y + deltaY,
      }));
      return;
    }

    if (dragState.mode === "se") {
      setSelection(clampSelection({
        ...original,
        width: original.width + deltaX,
        height: original.height + deltaY,
      }));
      return;
    }

    if (dragState.mode === "sw") {
      setSelection(clampSelection({
        x: original.x + deltaX,
        y: original.y,
        width: original.width - deltaX,
        height: original.height + deltaY,
      }));
      return;
    }

    if (dragState.mode === "ne") {
      setSelection(clampSelection({
        x: original.x,
        y: original.y + deltaY,
        width: original.width + deltaX,
        height: original.height - deltaY,
      }));
      return;
    }

    setSelection(clampSelection({
      x: original.x + deltaX,
      y: original.y + deltaY,
      width: original.width - deltaX,
      height: original.height - deltaY,
    }));
  };

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    mode: "move" | "nw" | "ne" | "sw" | "se",
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startSelection: selection,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/85 px-4">
      <div className="w-full max-w-[430px] overflow-hidden rounded-[24px] bg-[#191919] shadow-[0_24px_60px_rgba(15,23,42,0.36)]">
        <div className="px-4 pt-4 text-center">
          <h3 className="text-[18px] font-extrabold text-white">Crop image</h3>
          <p className="mt-1 text-[12px] text-white/65">
            Drag the box and pull the corners to crop your{" "}
            {tone === "profile"
              ? "profile photo"
              : tone === "service"
                ? "service image"
                : tone === "work"
                  ? "job completion image"
                  : "document image"}.
          </p>
        </div>

        <div className="mt-4 flex min-h-[25rem] items-center justify-center bg-[#111] px-3 py-6">
          <div
            ref={imageFrameRef}
            className="relative max-h-[23rem] max-w-full touch-none select-none"
            onPointerMove={updateSelectionFromPointer}
            onPointerUp={() => setDragState(null)}
            onPointerCancel={() => setDragState(null)}
          >
            {/* Native img keeps the overlay aligned to the real rendered image size. */}
            <img
              src={imageDataUrl}
              alt="Crop preview"
              onLoad={resetInitialSelection}
              className="block max-h-[23rem] max-w-full object-contain"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/45" />
            <div
              role="presentation"
              onPointerDown={(event) => startDrag(event, "move")}
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
              style={{
                left: `${selection.x}%`,
                top: `${selection.y}%`,
                width: `${selection.width}%`,
                height: `${selection.height}%`,
              }}
            >
              <span className="pointer-events-none absolute left-1/3 top-0 h-full border-l border-white/40" />
              <span className="pointer-events-none absolute left-2/3 top-0 h-full border-l border-white/40" />
              <span className="pointer-events-none absolute left-0 top-1/3 w-full border-t border-white/40" />
              <span className="pointer-events-none absolute left-0 top-2/3 w-full border-t border-white/40" />
              {(["nw", "ne", "sw", "se"] as const).map((handle) => (
                <span
                  key={handle}
                  role="presentation"
                  onPointerDown={(event) => startDrag(event, handle)}
                  className={`absolute h-5 w-5 rounded-full border-2 border-white bg-[#8E5EB5] ${
                    handle === "nw"
                      ? "-left-3 -top-3 cursor-nwse-resize"
                      : handle === "ne"
                        ? "-right-3 -top-3 cursor-nesw-resize"
                        : handle === "sw"
                          ? "-bottom-3 -left-3 cursor-nesw-resize"
                          : "-bottom-3 -right-3 cursor-nwse-resize"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] border border-white/15 bg-white/5 text-[14px] font-extrabold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(selection)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#8E5EB5] text-[14px] font-extrabold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

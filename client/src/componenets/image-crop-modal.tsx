import { useState, useRef, useEffect } from "react";
import { Crop, RotateCcw, X, Check } from "lucide-react";

type AspectPreset = {
  id: "free" | "portrait45" | "square11";
  label: string;
  ratio: number | null; // null => free-form edges & corners
};

type DragMode = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { id: "free", label: "Free Crop", ratio: null },
  { id: "portrait45", label: "Team Frame (4:5)", ratio: 4 / 5 },
  { id: "square11", label: "Square (1:1)", ratio: 1 },
];

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  canUseOriginal?: boolean;
  onUseOriginal?: () => void;
  onCropComplete: (croppedBlob: Blob, croppedFileName: string) => void;
  onClose: () => void;
}

const MAX_STAGE_WIDTH = 360;
const MAX_STAGE_HEIGHT = 400;
const MIN_CROP_SIZE = 44;

export default function ImageCropModal({
  isOpen,
  imageSrc,
  fileName = "team-member.jpg",
  canUseOriginal = false,
  onUseOriginal,
  onCropComplete,
  onClose,
}: ImageCropModalProps) {
  const [aspectId, setAspectId] = useState<AspectPreset["id"]>("free");
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 240, h: 240 });
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropError, setCropError] = useState("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragOriginRef = useRef<{
    pointerX: number;
    pointerY: number;
    startRect: CropRect;
  }>({
    pointerX: 0,
    pointerY: 0,
    startRect: { x: 0, y: 0, w: 240, h: 240 },
  });

  const activePreset = ASPECT_PRESETS.find((p) => p.id === aspectId) ?? ASPECT_PRESETS[0];

  // Fit the full uncropped image cleanly inside the modal stage
  const fitScale = naturalSize
    ? Math.min(MAX_STAGE_WIDTH / naturalSize.w, MAX_STAGE_HEIGHT / naturalSize.h)
    : 1;
  const stageWidth = naturalSize ? Math.round(naturalSize.w * fitScale) : 320;
  const stageHeight = naturalSize ? Math.round(naturalSize.h * fitScale) : 320;

  const initDefaultCrop = (w: number, h: number, ratio: number | null): CropRect => {
    if (!ratio) {
      const boxW = Math.round(w * 0.92);
      const boxH = Math.round(h * 0.72);
      return {
        x: Math.round((w - boxW) / 2),
        y: Math.round((h - boxH) / 2),
        w: boxW,
        h: boxH,
      };
    }
    let boxW = Math.round(w * 0.86);
    let boxH = Math.round(boxW / ratio);
    if (boxH > h * 0.86) {
      boxH = Math.round(h * 0.86);
      boxW = Math.round(boxH * ratio);
    }
    return {
      x: Math.round((w - boxW) / 2),
      y: Math.round((h - boxH) / 2),
      w: boxW,
      h: boxH,
    };
  };

  // Reset crop state when modal opens with a new image
  useEffect(() => {
    if (!isOpen) return;
    setAspectId("free");
    setNaturalSize(null);
    setDragMode(null);
    setCropError("");
    setIsProcessing(false);
  }, [isOpen, imageSrc]);

  // Initialize selection rect once image dimensions load or aspect changes
  useEffect(() => {
    if (!naturalSize) return;
    setCrop(initDefaultCrop(stageWidth, stageHeight, activePreset.ratio));
  }, [naturalSize, aspectId, stageWidth, stageHeight, activePreset.ratio]);

  const startDrag = (
    e: React.PointerEvent<HTMLElement>,
    mode: DragMode
  ) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragMode(mode);
    dragOriginRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startRect: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragMode || !naturalSize) return;
    const dx = e.clientX - dragOriginRef.current.pointerX;
    const dy = e.clientY - dragOriginRef.current.pointerY;
    const s = dragOriginRef.current.startRect;

    if (dragMode === "move") {
      const nextX = Math.max(0, Math.min(stageWidth - s.w, s.x + dx));
      const nextY = Math.max(0, Math.min(stageHeight - s.h, s.y + dy));
      setCrop({ ...s, x: nextX, y: nextY });
      return;
    }

    let left = s.x;
    let top = s.y;
    let right = s.x + s.w;
    let bottom = s.y + s.h;

    if (dragMode.includes("w")) left = Math.max(0, Math.min(right - MIN_CROP_SIZE, s.x + dx));
    if (dragMode.includes("e")) right = Math.min(stageWidth, Math.max(left + MIN_CROP_SIZE, s.x + s.w + dx));
    if (dragMode.includes("n")) top = Math.max(0, Math.min(bottom - MIN_CROP_SIZE, s.y + dy));
    if (dragMode.includes("s")) bottom = Math.min(stageHeight, Math.max(top + MIN_CROP_SIZE, s.y + s.h + dy));

    let nextW = right - left;
    let nextH = bottom - top;

    // Enforce aspect ratio when preset is locked
    const ratio = activePreset.ratio;
    if (ratio) {
      if (dragMode === "n" || dragMode === "s") {
        nextW = Math.min(stageWidth, Math.max(MIN_CROP_SIZE, Math.round(nextH * ratio)));
        left = Math.max(0, Math.min(stageWidth - nextW, s.x + (s.w - nextW) / 2));
        nextH = Math.round(nextW / ratio);
        if (dragMode === "n") top = bottom - nextH;
      } else {
        nextH = Math.max(MIN_CROP_SIZE, Math.round(nextW / ratio));
        if (dragMode.includes("n")) {
          top = bottom - nextH;
          if (top < 0) {
            top = 0;
            nextH = bottom;
            nextW = Math.round(nextH * ratio);
            if (dragMode.includes("w")) left = right - nextW;
          }
        } else if (top + nextH > stageHeight) {
          nextH = stageHeight - top;
          nextW = Math.round(nextH * ratio);
          if (dragMode.includes("w")) left = right - nextW;
        }
      }
    }

    setCrop({
      x: Math.round(left),
      y: Math.round(top),
      w: Math.round(nextW),
      h: Math.round(nextH),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragMode) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragMode(null);
  };

  const handleApplyCrop = async () => {
    const imgEl = imgRef.current;
    if (!imgEl || !naturalSize) return;

    setIsProcessing(true);
    setCropError("");

    try {
      const scaleX = naturalSize.w / stageWidth;
      const scaleY = naturalSize.h / stageHeight;

      const srcX = Math.max(0, Math.round(crop.x * scaleX));
      const srcY = Math.max(0, Math.round(crop.y * scaleY));
      const srcW = Math.max(1, Math.min(naturalSize.w - srcX, Math.round(crop.w * scaleX)));
      const srcH = Math.max(1, Math.min(naturalSize.h - srcY, Math.round(crop.h * scaleY)));

      const outScale = Math.min(1, 1200 / Math.max(srcW, srcH));
      const outW = Math.max(1, Math.round(srcW * outScale));
      const outH = Math.max(1, Math.round(srcH * outScale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Failed to export cropped image"));
          },
          "image/jpeg",
          0.92
        );
      });

      const baseName = fileName.replace(/\.[^.]+$/, "") || "team-member";
      onCropComplete(blob, `${baseName}-cropped.jpg`);
    } catch (err: any) {
      console.error("Crop export failed:", err);
      setCropError("Unable to crop this image directly. Try uploading a local image file.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const cornerHandleCls =
    "absolute w-3.5 h-3.5 bg-white border-[1.5px] border-[#2563EB] shadow-xs rounded-[2px] z-20";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-['Onest',sans-serif]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE4F2] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
              <Crop className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141010]">Crop Profile Photo</h3>
              <p className="text-[11px] text-[#716A7E]">
                Drag corners or edges to resize crop area, or drag inside to move
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close crop dialog"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Full Image + Interactive Crop Box Overlay */}
        <div className="p-5 space-y-4 bg-[#FAF8FC]">
          {/* Mode / Preset Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {ASPECT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAspectId(preset.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                    aspectId === preset.id
                      ? "bg-[#5D2381] text-white border-[#5D2381] shadow-xs"
                      : "bg-white text-[#4A4458] border-[#E2DBEA] hover:border-[#5D2381]/40"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                naturalSize &&
                setCrop(initDefaultCrop(stageWidth, stageHeight, activePreset.ratio))
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2DBEA] text-[11px] font-semibold text-[#4A4458] hover:border-[#5D2381] cursor-pointer"
              title="Reset crop box"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stage Wrapper */}
          <div className="flex items-center justify-center py-1">
            <div
              className="relative bg-[#161224] rounded-2xl shadow-md select-none touch-none"
              style={{ width: `${stageWidth}px`, height: `${stageHeight}px` }}
            >
              {/* Clipped Image + Dimmed Outer Scrim */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[#E2DBEA]">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop source"
                  crossOrigin={imageSrc.startsWith("http") ? "anonymous" : undefined}
                  onLoad={(e) => {
                    const t = e.currentTarget;
                    if (t.naturalWidth && t.naturalHeight) {
                      setNaturalSize({ w: t.naturalWidth, h: t.naturalHeight });
                    }
                  }}
                  draggable={false}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                {naturalSize && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${crop.x}px`,
                      top: `${crop.y}px`,
                      width: `${crop.w}px`,
                      height: `${crop.h}px`,
                      boxShadow: "0 0 0 9999px rgba(10, 8, 20, 0.45)",
                    }}
                  />
                )}
              </div>

              {/* Unclipped Resizable Selection Box with Blue Border, Corner Squares & Grid */}
              {naturalSize && (
                <div
                  onPointerDown={(e) => startDrag(e, "move")}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className="absolute border-[1.5px] border-[#3B82F6] cursor-move z-10"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.w}px`,
                    height: `${crop.h}px`,
                  }}
                >
                  {/* Subtle Rule-of-Thirds Grid */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-y-0 left-1/3 w-px bg-white/45" />
                    <div className="absolute inset-y-0 left-2/3 w-px bg-white/45" />
                    <div className="absolute inset-x-0 top-1/3 h-px bg-white/45" />
                    <div className="absolute inset-x-0 top-2/3 h-px bg-white/45" />
                  </div>

                  {/* 4 Corner Handles (nw, ne, sw, se) */}
                  <div
                    onPointerDown={(e) => startDrag(e, "nw")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`${cornerHandleCls} -top-[7px] -left-[7px] cursor-nwse-resize`}
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "ne")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`${cornerHandleCls} -top-[7px] -right-[7px] cursor-nesw-resize`}
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "sw")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`${cornerHandleCls} -bottom-[7px] -left-[7px] cursor-nesw-resize`}
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "se")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`${cornerHandleCls} -bottom-[7px] -right-[7px] cursor-nwse-resize`}
                  />

                  {/* 4 Edge Drag Strips (n, s, w, e) */}
                  <div
                    onPointerDown={(e) => startDrag(e, "n")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-10"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "s")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-10"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "w")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute top-3 bottom-3 -left-1.5 w-3 cursor-ew-resize z-10"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, "e")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="absolute top-3 bottom-3 -right-1.5 w-3 cursor-ew-resize z-10"
                  />
                </div>
              )}
            </div>
          </div>

          {cropError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {cropError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#ECE4F2] flex items-center justify-between gap-2 bg-white">
          <div>
            {canUseOriginal && onUseOriginal && (
              <button
                type="button"
                onClick={onUseOriginal}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer disabled:opacity-50"
              >
                Use Original
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing || !naturalSize}
              className="hover-brand-gradient bg-[#5D2381] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.4]" />
              <span>{isProcessing ? "Cropping..." : "Crop & Upload"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

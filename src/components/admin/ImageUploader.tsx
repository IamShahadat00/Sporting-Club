"use client";

import { useState, useRef } from "react";
import { supabaseClient } from "@/lib/supabase";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  bucket: "player-photos" | "banners";
  value?: string;
  onChange: (url: string) => void;
  aspect?: "square" | "wide";
}

export function ImageUploader({
  bucket,
  value,
  onChange,
  aspect = "square",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      // 1. Generate unique file name
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      // 2. Upload to Supabase Storage
      const { error } = await supabaseClient.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // 3. Get the Public URL
      const { data } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(data.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Check your Supabase Storage Policies.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/30 hover:border-pitch transition-colors cursor-pointer ${
          aspect === "square" ? "h-44 w-44" : "h-44 w-full"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-pitch" />
            <span className="text-[10px] font-bold text-pitch uppercase">
              Uploading...
            </span>
          </div>
        ) : value && value.trim() !== "" ? (
          <>
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
            />
            {/* Delete/Clear Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-2 right-2 bg-danger hover:bg-danger-dark text-white rounded-full p-1.5 shadow-lg transition-transform active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          /* Placeholder State */
          <div className="flex flex-col items-center text-muted-foreground group">
            <ImagePlus className="h-10 w-10 mb-2 group-hover:text-pitch transition-colors" />
            <span className="text-xs font-medium">Click to upload</span>
            <span className="text-[10px] opacity-60 mt-1 uppercase tracking-wider">
              {aspect}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <p className="text-[10px] text-muted-foreground text-center italic">
        Max size: 2MB. Format: JPG, PNG, WEBP.
      </p>
    </div>
  );
}

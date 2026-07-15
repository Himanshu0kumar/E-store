"use client";

import { useState, useRef } from "react";

export default function ImageDropzone({ files, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    onFilesChange([...(files || []), ...newFiles]);
  };

  const getImageSource = (file) => {
    // If it's already a URL (string), return it directly
    if (typeof file === "string") {
      return file;
    }
    // If it's a File object, create an object URL
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Images</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition ${
          dragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <p className="text-sm font-semibold text-slate-700">Drop or select files</p>
        <p className="mt-1 text-sm text-slate-400">
          Drag files here, or{" "}
          <span className="text-emerald-500 underline underline-offset-2">browse</span> your device.
        </p>
      </div>

      {/* PREVIEW LIST */}
      {files?.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {files.map((file, i) => {
            const src = getImageSource(file);
            return (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                <img
                  src={src}
                  alt={typeof file === "string" ? "Product image" : file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <span className="text-white text-lg font-bold">✕</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
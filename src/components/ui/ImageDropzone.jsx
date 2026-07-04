"use client";

import { useState, useRef } from "react";

export default function ImageDropzone({ files, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    onFilesChange([...(files || []), ...newFiles]);
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
          {files.map((file, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
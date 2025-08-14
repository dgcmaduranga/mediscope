"use client";
import { useRef, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

type Props = {
  accept?: string;                 // e.g., "application/pdf,image/*"
  onUpload: (file: File) => Promise<void>;
  maxSizeMB?: number;
};

export default function FileDrop({ accept = "application/pdf,image/*", onUpload, maxSizeMB = 15 }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Max ${maxSizeMB}MB`);
      return;
    }
    setLoading(true);
    try {
      await onUpload(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      sx={{
        border: "2px dashed rgba(255,255,255,0.2)",
        p: 4,
        borderRadius: 2,
        textAlign: "center",
        outline: dragOver ? "2px solid rgba(110,231,249,0.6)" : "none",
        cursor: "pointer",
      }}
      onClick={() => inputRef.current?.click()}
    >
      <Typography variant="h6" gutterBottom>Drop PDF / image here</Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        or click to choose a file
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? <CircularProgress size={24} /> : <Button variant="contained">Choose File</Button>}
    </Box>
  );
}

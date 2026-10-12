import React, { useState, useRef } from "react";
import { X, UploadCloud, Check, Loader2, Trash2 } from "lucide-react";
import { AvatarItem } from "../types";
import {
  uploadAvatar,
  setCanonicalAvatar,
  deleteAvatar,
} from "../services/avatarService";

export interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: AvatarItem[];
  canonicalAvatar: AvatarItem | null;
  onAvatarUpdated: () => void;
}

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  avatars,
  canonicalAvatar,
  onAvatarUpdated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be under 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleUploadNew = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setErrorMessage(null);
      await uploadAvatar(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      onAvatarUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to upload photo. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectActive = async (id: string) => {
    try {
      await setCanonicalAvatar(id);
      onAvatarUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to select active avatar:", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteAvatar(id);
      onAvatarUpdated();
    } catch (err) {
      console.error("Failed to delete avatar:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-border-light shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink-primary font-sans">
              Change Model Photo
            </h3>
            <p className="text-xs text-ink-muted">
              Upload a full-body or upper-body photo for AI try-ons.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Upload Area */}
          <div>
            <label className="text-xs font-bold text-ink-primary block mb-2">
              Upload New Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-subtle hover:border-ink-primary rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-surface-subtle/30 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-28 h-36 rounded-xl overflow-hidden shadow-xs mb-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-ink-secondary mb-2 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5 text-ink-primary" />
                </div>
              )}

              <p className="text-xs font-semibold text-ink-primary">
                {selectedFile ? selectedFile.name : "Click to select a photo"}
              </p>
              <p className="text-[10px] text-ink-muted mt-0.5">
                Front-facing, good lighting recommended (JPG, PNG under 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border-light text-ink-secondary text-xs font-semibold hover:bg-surface-subtle cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadNew}
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isUploading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {isUploading ? "Uploading..." : "Save & Set Active"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Existing Photos List */}
          {avatars.length > 0 && (
            <div>
              <label className="text-xs font-bold text-ink-primary block mb-2">
                Your Saved Photos ({avatars.length})
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {avatars.map((av) => {
                  const isActive = canonicalAvatar?.id === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => handleSelectActive(av.id)}
                      className={`relative aspect-3/4 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                        isActive
                          ? "border-ink-primary ring-2 ring-ink-primary/20 shadow-xs"
                          : "border-border-light hover:border-border-subtle"
                      }`}
                    >
                      <img
                        src={av.imageUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ink-primary text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {!isActive && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, av.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

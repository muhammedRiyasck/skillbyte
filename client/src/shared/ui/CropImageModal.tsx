import { useState, useEffect } from "react";
import Modal from "./Modal";
import Cropper from "react-easy-crop";

interface CropImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  onCropComplete: (croppedAreaPixels: { x: number; y: number; width: number; height: number }) => void;
  aspect?: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropImageModal({ isOpen, onClose, file, onCropComplete, aspect = 16 / 9 }: CropImageModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleConfirm = () => {
    if (!file || !croppedAreaPixels) return;
    onCropComplete(croppedAreaPixels);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop Image"
      onConfirm={handleConfirm}
      confirmLabel="Save"
      cancelLabel="Cancel"
    >
      <div className="relative w-full h-64 bg-black rounded-md">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedArea) => setCroppedAreaPixels(croppedArea as CroppedAreaPixels)}
          />
        )}
      </div>
    </Modal>
  );
}

import { useState } from "react";
import Modal from "./Modal";
import Cropper from "react-easy-crop";

export default function CropImageModal({ isOpen, onClose, file, onCropComplete }: any) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
        <Cropper
          image={URL.createObjectURL(file)}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9} // or 1/1, depending on your thumbnail
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedArea) => setCroppedAreaPixels(croppedArea)}
        />
      </div>
    </Modal>
  );
}

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { btnTap, ease } from './animations/motionConfig';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(URL.createObjectURL(file));
      }, 'image/jpeg');
    });
  };

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      // Wait, we need the BLOB to upload, not just the object URL.
      // Let's modify getCroppedImg to return the blob too.
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      onCropComplete(blob, croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(60, 47, 47, 0.4)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="card"
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 28,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>Adjust Photo</h3>
          <button onClick={onCancel} style={{ background: 'var(--bg)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
        </div>

        <div style={{ position: 'relative', height: 400, background: 'var(--bg)' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', minWidth: 60, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', minWidth: 60, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rotate</span>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation"
              onChange={(e) => setRotation(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <button 
              onClick={() => setRotation(r => (r + 90) % 360)}
              style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <RotateCw size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button 
              onClick={onCancel} 
              className="btn-secondary" 
              style={{ flex: 1, padding: '16px', fontSize: 15, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}
            >
              Discard
            </button>
            <button 
              onClick={handleConfirm} 
              className="btn-primary" 
              style={{ flex: 1, padding: '16px', fontSize: 15, fontWeight: 800, boxShadow: '0 8px 16px rgba(107, 79, 58, 0.2)' }}
            >
              <Check size={20} />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCropper;

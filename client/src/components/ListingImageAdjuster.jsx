import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, Maximize2, Square, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const ListingImageAdjuster = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(4 / 3); // Standard listing aspect ratio as default
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
        resolve({
          blob: file,
          url: URL.createObjectURL(file)
        });
      }, 'image/jpeg', 0.95);
    });
  };

  const handleConfirm = async () => {
    try {
      const { blob, url } = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(blob, url);
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
        background: 'rgba(26, 21, 18, 0.65)',
        backdropFilter: 'blur(16px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 550,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Adjust Listing Photo</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: 500 }}>Zoom, rotate, drag, and select aspect ratio for the photo.</p>
          </div>
          <button onClick={onCancel} style={{ background: 'var(--bg)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>

        {/* Cropper Box */}
        <div style={{ position: 'relative', height: 340, background: '#1a1715' }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Aspect Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aspect Ratio</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Standard (4:3)', val: 4/3, icon: Maximize2 },
                { label: 'Square (1:1)', val: 1/1, icon: Square },
                { label: 'Wide (16:9)', val: 16/9, icon: Compass }
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAspect(opt.val)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: `1px solid ${aspect === opt.val ? 'var(--primary)' : 'var(--border)'}`,
                    background: aspect === opt.val ? 'var(--primary-light)' : 'white',
                    color: aspect === opt.val ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  <opt.icon size={13} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Control */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', minWidth: 50, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              aria-labelledby="Zoom Slider"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', width: 32, textAlign: 'right' }}>{Number(zoom).toFixed(1)}x</span>
          </div>

          {/* Rotation Control */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', minWidth: 50, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rotate</span>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation Slider"
              onChange={(e) => setRotation(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <button 
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Rotate 90 degrees"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button 
              type="button"
              onClick={onCancel} 
              className="btn-secondary" 
              style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 700, background: 'white', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleConfirm} 
              className="btn-primary" 
              style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 800, boxShadow: '0 8px 16px rgba(107, 79, 58, 0.15)' }}
            >
              <Check size={16} style={{ marginRight: 6 }} />
              Apply Edit
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ListingImageAdjuster;

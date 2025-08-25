import { useState } from 'react';

export const useImageHandler = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [imagePreview, setImagePreview] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(0.5);
  const [rotationAngle, setRotationAngle] = useState(0);

  const handleMouseDown = (event: any) => {
    setIsDragging(true);
    setOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const handleMouseMove = (event: any) => {
    if (isDragging) {
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
  };

  const handleZoomOut = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
  };

  const handleWheel = (event: any) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3));
    } else {
      setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
    }
  };

  const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
  const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

  return {
    imageSrc,
    setImageSrc,
    imagePreview,
    setImagePreview,
    isDragging,
    setIsDragging,
    offset,
    setOffset,
    position,
    setPosition,
    zoomScale,
    setZoomScale,
    rotationAngle,
    setRotationAngle,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    handleWheel,
    handleRotateLeft,
    handleRotateRight,
  };
};

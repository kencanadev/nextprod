import React, { useRef, useState, useEffect } from 'react';

const GambarProdukPersediaan = ({ formState, updateState }: { formState: any; updateState: any }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview if image exists in form state
  useEffect(() => {
    if (formState?.gambar && formState?.gambar?.type === 'Buffer') {
      const temp = bufferObjToBase64Image(formState?.gambar);
      console.log('temp buff', temp);
      
      setImagePreview(temp);
    } else {
      setImagePreview(formState?.gambar);
    }
  }, [formState?.gambar]);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  function bufferObjToBase64Image(bufferObj : any, mimeType = 'image/jpeg') {
  const buffer = Buffer.from(bufferObj.data); // ubah ke Buffer asli
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}


function getMimeTypeFromDataURL(dataURL : any) {
  const match = dataURL.match(/^data:(.*?);base64,/);
  return match ? match[1] : null;
}

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      try {
        setSelectedFile(file);
        const base64String = await convertToBase64(file);
        setImagePreview(base64String);
        // Update form state with base64 string
        updateState('gambar', base64String);
      } catch (error) {
        console.error('Error converting image:', error);
        alert('Gagal mengkonversi gambar');
      }
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear image in form state
    updateState('gambar', null);
  };

  const handleSaveImage = () => {
    if (!imagePreview) {
      alert('Pilih gambar terlebih dahulu!');
      return;
    }

    // Create an anchor element to trigger download
    const link = document.createElement('a');
    link.href = imagePreview;

    // Set a default filename for the downloaded image
    link.download = 'downloaded_image.png';

    // Append the link to the body (required for some browsers)
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Remove the link from the DOM
    document.body.removeChild(link);
  };

  return (
    <div className="p-2">
      <div className="mb-3 flex items-center gap-2">
        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif" className="hidden" />
        <button onClick={handleClick} className="rounded bg-black px-4 py-1.5 text-xs text-white hover:bg-gray-800">
          Pilih Gambar
        </button>
        <button onClick={handleClearImage} className="rounded bg-black px-4 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!imagePreview}>
          Bersihkan Gambar
        </button>
        <button onClick={handleSaveImage} className="rounded bg-black px-4 py-1.5 text-xs text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={!imagePreview}>
          Simpan Gambar
        </button>
      </div>

      <div className="relative mb-2">
        {imagePreview ? (
          <div className="h-60 w-60 overflow-hidden rounded border border-gray-300">
            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-60 w-60 items-center justify-center rounded border border-gray-300 p-5 text-gray-500">No Picture</div>
        )}
      </div>
      <span className="text-xs">*Memasukkan gambar item menyebabkan akses database menjadi besar.</span>
    </div>
  );
};

export default GambarProdukPersediaan;

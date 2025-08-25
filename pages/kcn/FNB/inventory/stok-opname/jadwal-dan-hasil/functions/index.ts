import { swalDialog } from '@/utils/global/fungsi';
import withReactContent from 'sweetalert2-react-content';

export const handleJenisCheckbox = (value: string, isChecked: boolean, setFilterData: any) => {
    setFilterData((prev: any) => {
        const updatedJenisOpname = isChecked
            ? [...prev.jenisOpname, value] // Tambah jika dicentang
            : prev.jenisOpname.filter((item: any) => item !== value); // Hapus jika tidak dicentang

        return { ...prev, jenisOpname: updatedJenisOpname };
    });
};

export const handleStatusCheckbox = (value: string, isChecked: boolean, setFilterData: any) => {
    setFilterData((prev: any) => {
        const updatedStatusOpname = isChecked
            ? [...prev.statusOpname, value] // Tambah jika dicentang
            : prev.statusOpname.filter((item: any) => item !== value); // Hapus jika tidak dicentang

        return { ...prev, statusOpname: updatedStatusOpname };
    });
};

export const handleJenisTransaksiCheckbox = (value: string, isChecked: boolean, setFilterData: any) => {
    setFilterData((prev: any) => {
        const updatedJenisTransaksi = isChecked
            ? [...prev.jenisTransaksiOpname, value] // Tambah jika dicentang
            : prev.jenisTransaksiOpname.filter((item: any) => item !== value); // Hapus jika tidak dicentang

        return { ...prev, jenisTransaksiOpname: updatedJenisTransaksi };
    });
};

export const frmNumber = (value: string) => {
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0 });
};

export const handleRotateLeft = (setRotationAngle: any, rotationAngle: any) => setRotationAngle(rotationAngle - 90);
export const handleRotateRight = (setRotationAngle: any, rotationAngle: any) => setRotationAngle(rotationAngle + 90);

export const handleMouseDown = (event: any, setIsDragging: any, setOffset: any, position: any) => {
    setIsDragging(true);
    setOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
    });
};

export const handleMouseMove = (event: any, isDragging: any, offset: any, setPosition: any) => {
    if (isDragging) {
        setPosition({
            x: event.clientX - offset.x,
            y: event.clientY - offset.y,
        });
    }
};

export const HandleZoomIn = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
};

export const HandleZoomOut = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
};

export const handleMouseUp = (setIsDragging: any) => {
    setIsDragging(false);
};

export const handleWheel = (event: any, setZoomScale: any) => {
    event.preventDefault();
    if (event.deltaY < 0) {
        // Scroll up
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    } else {
        // Scroll down
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    }
};

export const cekGudang = (detail: any, master: any) => {
    let a = 0,
        b = 0;

    for (let i = 0; i < detail.length; i++) {
        if (detail[i].jenis_gudang === 'I') {
            a += 1;
        }
        if (detail[i].jenis_gudang === 'E' && detail[i].nama_gudang.includes('TTB')) {
            b += 1;
        }
    }

    if (a > 0) {
        if (master.jenis.includes('T') && b === 0) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

const injectCustomStyle = (width: number) => {
    const style = document.createElement('style');
    style.innerHTML = `
      .popup-khusus {
          width: ${width}px !important;
          padding: 20px;
          border-radius: 12px;
      }

      .popup-khusus-text {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin-left: 39px;
          margin-bottom: 10px;
      }

      .swal2-actions {
          margin-top: 10px !important;
      }

      .btn-yes {
          background-color: #3B82F6 !important;
          color: white !important;
          width: 60px;
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
          margin: 0 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .btn-no {
          background-color: #1F2937 !important;
          color: white !important;
          width: 60px;
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
          margin: 0 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
  `;
    document.head.appendChild(style);
};

export const showErrorPopup = async (message: string, styleHeight: number = 350, target: string) => {
    injectCustomStyle(styleHeight);
    const result = await withReactContent(swalDialog).fire({
        html: `<div class="popup-khusus-text">${message}</div>`,
        confirmButtonText: 'OK',
        target: target,
        allowOutsideClick: false,
        customClass: {
            popup: 'popup-khusus',
            confirmButton: 'btn-yes',
            cancelButton: 'btn-no',
        },
    });
    return result.isConfirmed;
};

export const showConfirmPopup = async (message: string, styleHeight: number = 350, target: string = '#dialogHasilOpname') => {
    injectCustomStyle(styleHeight);
    const result = await withReactContent(swalDialog).fire({
        html: `<div class="popup-khusus-text">${message}</div>`,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        showCancelButton: true,
        target: target,
        allowOutsideClick: false,
        customClass: {
            popup: 'popup-khusus',
            confirmButton: 'btn-yes',
            cancelButton: 'btn-no',
        },
    });
    return result.isConfirmed;
};

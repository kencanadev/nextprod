import Swal from 'sweetalert2';
import { generateNoItem } from '../api/api';
import { validateAlert } from './sweetalert';

export const handleGenerateNoItem = async (masterState: any, formState: any, updateFormState: any, token: any, entitas: any) => {
  // Validasi input
  if (!formState.grp) {
    validateAlert('error', 'Kategori harus diisi!', '#DialogBaruEditPersediaan');
    return;
  }

  if (!formState.kustom10) {
    validateAlert('error', 'Kelompok harus diisi!', '#DialogBaruEditPersediaan');
    return;
  }

  // Parameter untuk generate no item
  const params = {
    entitas,
    param1: formState.grp,
    param2: formState.kustom10,
  };

  try {
    // Handle berdasarkan mode (EDIT/BARU)
    if (masterState === 'EDIT') {
      const result = await Swal.fire({
        icon: 'warning',
        text: 'Apakah akan membuat No. Barang baru?',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    // Generate no item hanya jika dalam mode BARU atau user mengkonfirmasi di mode EDIT
    const noItem = await generateNoItem(params, token);

    if (noItem) {
      updateFormState('no_item', noItem);
    }
  } catch (error) {
    console.error('Error generating no item:', error);
    Swal.fire({
      icon: 'error',
      text: 'Terjadi kesalahan saat generate No. Barang',
    });
  }
};

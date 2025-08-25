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

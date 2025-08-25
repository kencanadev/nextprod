import React, { useEffect, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Sort, Filter, Selection } from '@syncfusion/ej2-react-grids';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

interface DialogListBarangProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (selectedItem: any) => void;
}

const DialogListBarang: React.FC<DialogListBarangProps> = ({ isOpen, onClose, onSave }) => {
  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';
  const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formState, setFormState] = useState({
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarang: '',
    isNamaBarangChecked: false,
    grupBarang: '',
    isGrupBarangChecked: false,
    noBarangSupplier: '',
    isNoBarangSupplierChecked: false,
    namaBarangSupplier: '',
    isNamaBarangSupplierChecked: false,
    kategori: '',
    isKategoriChecked: false,
    kelompokProduk: '',
    isKelompokProdukChecked: false,
    merekProduk: '',
    isMerekProdukChecked: false,
    tipe: '',
    isTipeChecked: false,
    searchNoPersediaan: '',
    searchNamaPersediaan: '',
    aktivasiState: 'all',
    statusState: 'all',
    paketProdukState: 'all',
    barangKonsinyasiState: 'all',
    dataEksportState: 'all',
    barangKontrakState: 'all',
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/erp/list_persediaan?`, {
        params: {
          entitas: kode_entitas,
          param1: formState.noBarangValue == '' ? 'all' : formState.noBarangValue,
          param2: formState.namaBarang == '' ? 'all' : formState.namaBarang,
          param3: formState.grupBarang == '' ? 'all' : formState.grupBarang,
          param4: formState.noBarangSupplier == '' ? 'all' : formState.noBarangSupplier,
          param5: formState.namaBarangSupplier == '' ? 'all' : formState.namaBarangSupplier,
          param6: formState.kategori == '' ? 'all' : formState.kategori,
          param7: formState.kelompokProduk == '' ? 'all' : formState.kelompokProduk,
          param8: formState.merekProduk == '' ? 'all' : formState.merekProduk,
          param9: formState.tipe == '' ? 'all' : formState.tipe,
          param10: formState.aktivasiState,
          param11: formState.statusState,
          param12: formState.paketProdukState,
          param13: formState.barangKonsinyasiState,
          param14: formState.dataEksportState,
          param15: formState.barangKontrakState,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleRowSelected = (args: any) => {
    setSelectedItem(args.data);
  };

  const handleSave = () => {
    if (selectedItem && onSave) {
      onSave(selectedItem);
      onClose?.();
    }
  };

  const buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Simpan',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: handleSave,
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent allowDragging id="DialogBaruEdit" visible={isOpen} header="Daftar Barang" width="700px" height="90%" buttons={buttonsInputData} close={onClose} isModal zIndex={1000}>
      <GridComponent
        dataSource={data}
        allowSorting={true}
        allowFiltering={true}
        allowPaging={true}
        pageSettings={{ pageSize: 15 }}
        selectionSettings={{ type: 'Single' }}
        rowSelected={handleRowSelected}
        recordDoubleClick={handleSave}
      >
        <ColumnsDirective>
          <ColumnDirective field="no_item" headerText="No. Barang" />
          <ColumnDirective field="nama_item" headerText="Nama Barang" />
          <ColumnDirective field="nama_grp" headerText="Grup Barang" />
          <ColumnDirective field="tipe" headerText="Tipe" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogListBarang;

// Combobox

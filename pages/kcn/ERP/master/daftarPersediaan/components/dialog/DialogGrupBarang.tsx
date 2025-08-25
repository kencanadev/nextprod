import React, { useEffect, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Sort, Filter, Selection } from '@syncfusion/ej2-react-grids';
import { useSession } from '@/pages/api/sessionContext';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { fetchGrupBarang } from '../../api/api';

interface DialogGrupBarangProps {
  isOpen?: boolean;
  onClose?: any;
  updateState: any;
}

const DialogGrupBarang = ({ isOpen, onClose, updateState }: DialogGrupBarangProps) => {
  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';

  const [data, setData] = useState<any[]>([]);
  const [searchGrp, setSearchGrp] = useState<string>('');

  const fetchData = async () => {
    const data = await fetchGrupBarang(kode_entitas, searchGrp, token);
    setData(data);
  };

  const handleSelectedRow = (args: any) => {
    // console.log('handleSelectedRow', args.rowData.nama_grp);
    updateState('nama_grp', args.rowData.nama_grp);
    onClose();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchGrp]);

  const buttonsInputData: ButtonPropsModel[] = [
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
    <DialogComponent
      allowDragging
      id="DialogBaruEdit"
      visible={isOpen}
      target="#DialogBaruEditPersediaan"
      header="Daftar Barang"
      width="700px"
      height="90%"
      buttons={buttonsInputData}
      close={onClose}
      isModal
      zIndex={1000}
    >
      <input type="text" className="w-full border border-gray-300 px-3 py-5" placeholder="Cari Grup Barang" value={searchGrp} onChange={(e) => setSearchGrp(e.target.value)} />
      <GridComponent dataSource={data} selectionSettings={{ type: 'Single' }} rowSelected={() => {}} recordDoubleClick={handleSelectedRow}>
        <ColumnsDirective>
          <ColumnDirective field="nama_grp" headerText="Deskripsi" headerTextAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogGrupBarang;

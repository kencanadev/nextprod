import React, { useEffect, useRef, useState } from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { fetchListGdUtama } from '../api';

type DialogGdUtamaProps = {
  isOpen: boolean;
  onClose: () => void;
  gridRefMutasi: any;
  gridRefStok: any;
  selectedRowIdx: number;
  selectedRowIdx2: number;
  tipe?: string;
  selectedGudang?: string;
  token: string;
  kode_entitas: string;
};

const DialogGdUtama: React.FC<DialogGdUtamaProps> = ({ isOpen, onClose, gridRefMutasi, gridRefStok, selectedRowIdx = 0, selectedRowIdx2 = 0, tipe, selectedGudang, token, kode_entitas }) => {
  const [gudangData, setGudangData] = useState<any>([]);

  useEffect(() => {
    const getListGdUtama = async () => {
      const params = {
        entitas: kode_entitas,
      };
      const response = await fetchListGdUtama({ params, token });

      setGudangData(response);
    };

    getListGdUtama();
  }, []);

  const handlePilihGudang = (args: any) => {
    console.log(args);
    onClose();

    let key;
    let key2;
    if (tipe === 'nama_asal') {
      key = 'nama_asal';
      key2 = 'kode_gudang';
    } else if (tipe === 'nama_tujuan') {
      key = 'nama_tujuan';
      key2 = 'kode_tujuan';
    } else {
      key = 'nama_gudang';
      key2 = 'kode_gudang';
    }

    let data;
    if (tipe === 'nama_tujuan' || tipe === 'nama_asal') {
      data = gridRefMutasi.current.dataSource[selectedRowIdx];
    } else {
      data = gridRefStok.current.dataSource[selectedRowIdx2];
    }
    const modifiedData = {
      ...data,
      [key]: args.rowData.nama_gudang,
      [key2]: args.rowData.kode_gudang,
    };

    if (tipe === 'nama_tujuan' || tipe === 'nama_asal') {
      data = gridRefMutasi.current.dataSource[selectedRowIdx] = modifiedData;
      gridRefMutasi.current.refresh();
    } else {
      data = gridRefStok.current.dataSource[selectedRowIdx2] = modifiedData;
      gridRefStok.current.refresh();
    }
  };

  return (
    <DialogComponent
      target={'#dialogHasilOpname'}
      header="List Gudang"
      visible={isOpen}
      close={onClose}
      isModal
      allowDragging
      showCloseIcon
      closeOnEscape
      width={'515px'}
      height={'440px'}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
    >
      <div className="flex">
        <div className="form-input mb-1 mr-1">
          <TextBoxComponent id="cariNamaGudang" placeholder="Cari Nama Gudang" showClearButton input={(args: ChangeEventArgsInput) => {}} floatLabelType="Never" />
        </div>
      </div>
      <GridComponent id="gridListGudang" locale="id" style={{ width: '100%' }} dataSource={gudangData} recordDoubleClick={handlePilihGudang} allowResizing allowSorting>
        <ColumnsDirective>
          <ColumnDirective field="nama_gudang" headerText="Nama Gudang" />
        </ColumnsDirective>
        <Inject services={[Page, Edit, Toolbar, Resize, Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogGdUtama;

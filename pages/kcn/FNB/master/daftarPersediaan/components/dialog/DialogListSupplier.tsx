import React, { useEffect, useState } from 'react';
import { fetchListSupplier } from '../../api/api';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Sort, Filter, Selection } from '@syncfusion/ej2-react-grids';

interface DialogListSupplierProps {
  isOpen?: boolean;
  onClose?: any;
  updateState: any;
  entitas: any;
  token: any;
}

const DialogListSupplier = ({ isOpen, onClose, updateState, entitas, token }: DialogListSupplierProps) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const data = await fetchListSupplier(entitas, token);
    setData(data);
  };

  const handleSelectedRow = (args: any) => {
    updateState('kode_supp', args.rowData.kode_supp);
    updateState('nama_supplier', args.rowData.nama_relasi);
    onClose();
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      id="dialogListSupplier"
      visible={isOpen}
      target={'#DialogBaruEditPersediaan'}
      header="Daftar Supplier"
      width="700px"
      height="90%"
      buttons={buttonsInputData}
      close={onClose}
      isModal
    >
      <GridComponent dataSource={data} selectionSettings={{ type: 'Single' }} allowFiltering recordDoubleClick={handleSelectedRow} pageSettings={{ pageSize: 15 }}>
        <ColumnsDirective>
          <ColumnDirective field="no_supp" headerText="No. Supplier" headerTextAlign="Center" />
          <ColumnDirective field="kode_mu" headerText="MU" headerTextAlign="Center" />
          <ColumnDirective field="nama_relasi" headerText="Nama Supplier" headerTextAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogListSupplier;

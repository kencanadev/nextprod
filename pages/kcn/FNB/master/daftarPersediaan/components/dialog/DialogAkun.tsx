import React from 'react';
import PersediaanTable from '../PersediaanTable';

import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnDirective, ColumnsDirective, RowSelectEventArgs } from '@syncfusion/ej2-react-grids';

interface dialogAkunProps {
  isOpen?: boolean;
  onClose?: any;
  data: any;
  onSelectAkun: (selectedAkun: { no_akun: string; nama_akun: string; kode_akun: string }) => void;
}

const TemplateNoAkun = (args: any) => {
  return (
    <div style={args.header === 'Y' ? { fontWeight: 'bold' } : { fontWeight: 'none', marginLeft: 12 }}>
      {/* Isi template sesuai kebutuhan */}
      {args.no_akun}
    </div>
  );
};

const TemplateNamaAkun = (args: any) => {
  return (
    <div style={args.header === 'Y' ? { fontWeight: 'bold' } : { fontWeight: 'none', marginLeft: 12 }}>
      {/* Isi template sesuai kebutuhan */}
      {args.nama_akun}
    </div>
  );
};

const DialogAkun = ({ isOpen, onClose, data, onSelectAkun }: dialogAkunProps) => {
  const handleRecordDoubleClick = (args: any) => {
    console.log('argsss: ', args);
    if (args.rowData) {
      const selectedAkun = {
        no_akun: args.rowData.no_akun,
        nama_akun: args.rowData.nama_akun,
        kode_akun: args.rowData.kode_akun,
      };
      onSelectAkun(selectedAkun);
      onClose();
    }
  };

  let buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Simpan',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: () => {},
      // click: masterState === 'BARU' ? saveDialogSupplier : handleUpdateData,
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent
      id="dialogAkun"
      name="dialogAkun"
      target="#main-target"
      header={() => 'Daftar Akun'}
      visible={isOpen}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      width="500px" //"70%"
      height="100%"
      position={{ X: 'center', Y: 'center' }}
      style={{ position: 'fixed' }}
      close={() => {}}
      buttons={buttonsInputData}
      allowDragging
      closeOnEscape
      open={(args: any) => {
        args.preventFocus = true;
      }}
    >
      <PersediaanTable data={data}>
        <GridComponent
          id="gridListData"
          locale="id"
          dataSource={data}
          selectionSettings={{
            mode: 'Row',
            type: 'Single',
          }}
          allowSorting={true}
          allowFiltering={true}
          autoFit={true}
          allowReordering={true}
          width={'100%'}
          height={'95%'}
          rowHeight={22}
          gridLines="Both"
          loadingIndicator={{ indicatorType: 'Shimmer' }}
          filterSettings={{
            enableInfiniteScrolling: true,
          }}
          recordDoubleClick={handleRecordDoubleClick}
          // rowSelected={handleRowSelect}
        >
          <ColumnsDirective>
            <ColumnDirective template={TemplateNoAkun} field="no_akun" headerText="No. Akun" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
            <ColumnDirective template={TemplateNamaAkun} field="nama_akun" headerText="Keterangan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
          </ColumnsDirective>
        </GridComponent>
      </PersediaanTable>
    </DialogComponent>
  );
};

export default DialogAkun;

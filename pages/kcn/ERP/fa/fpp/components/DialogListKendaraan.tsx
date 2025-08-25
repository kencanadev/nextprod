import React, { useRef } from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';

interface DialogListKendaraanProps {
  isOpen: boolean;
  onClose: () => void;
  handlePilihKendaraan: () => void;
  pencarianKendaraan: (e: any, a: any) => void;
  setSelectedKendaraan: any;
  dataSource: any;
}

const DialogListKendaraan: React.FC<DialogListKendaraanProps> = ({ isOpen, onClose, handlePilihKendaraan, pencarianKendaraan, setSelectedKendaraan, dataSource }) => {
  const gridDaftarJurnalDetailList = useRef<GridComponent>(null);

  let buttonDaftarAkunKasDetail: ButtonPropsModel[];

  // Tambahan ini untuk button
  buttonDaftarAkunKasDetail = [
    {
      buttonModel: {
        content: 'Pilih',
        //iconCss: 'e-icons e-save',
        cssClass: 'e-primary e-small',
      },
      isFlat: false,
      click: handlePilihKendaraan,
    },
    {
      buttonModel: {
        content: 'Batal',
        //iconCss: 'e-icons e-close',
        cssClass: 'e-primary e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: onClose,
    },
  ];
  return (
    <DialogComponent
      target="#dialogFrmFpp"
      style={{ position: 'fixed' }}
      header={'Daftar Kendaraan'}
      buttons={buttonDaftarAkunKasDetail}
      visible={isOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="515"
      height="440"
      close={onClose}
      closeOnEscape={true}
    >
      <div className="flex">
        <div className="form-input mb-1 mr-1">
          <TextBoxComponent
            id="cariNamaAkunDetail"
            className="searchtext"
            placeholder="Cari No Kendaraan"
            showClearButton={true}
            input={(args: ChangeEventArgsInput) => {
              const value: any = args.value;
              pencarianKendaraan(value, 'nopol');
            }}
            floatLabelType="Never"
          />
        </div>
      </div>
      <GridComponent
        id="dialogJurnalDetailList"
        ref={gridDaftarJurnalDetailList}
        locale="id"
        style={{ width: '100%', height: '75%' }}
        dataSource={dataSource}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        width={'100%'}
        height={'285'}
        rowSelecting={(args: any) => {
          setSelectedKendaraan(args.data);
        }}
        recordDoubleClick={(args: any) => {
          handlePilihKendaraan();
        }}
        allowResizing
        allowPaging={false}
        allowSorting={true}
        pageSettings={{
          pageSize: 10,
          // pageCount: 10,
          // pageSizes: ['10', '50', '100', 'All']
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="nopol" headerText="No. Kendaraan" headerTextAlign="Center" textAlign="Left" width="55" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="merek" headerText="Merek" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="jenis" headerText="Jenis Kendaraan" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
        </ColumnsDirective>
        <Inject services={[Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogListKendaraan;

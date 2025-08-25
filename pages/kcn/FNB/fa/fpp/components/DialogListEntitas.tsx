import React, { useRef } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';

interface DialogListEntitasProps {
  isOpen: boolean;
  onClose: () => void;
  handlePilihEntitas: () => void;
  pencarianEntitas: (e: any, a: any) => void;
  setSelectedEntitas: any;
  dataSource: any;
}

const DialogListEntitas: React.FC<DialogListEntitasProps> = ({ isOpen, onClose, handlePilihEntitas, pencarianEntitas, dataSource, setSelectedEntitas }) => {
  const gridDaftarListEntitas = useRef<GridComponent>(null);

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
      click: handlePilihEntitas,
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
      header={'Daftar Entitas'}
      buttons={buttonDaftarAkunKasDetail}
      visible={isOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="415"
      height="440"
      close={onClose}
      closeOnEscape={true}
    >
      <div className="flex">
        <div className="form-input mb-1 mr-1" style={{ width: '40%' }}>
          <TextBoxComponent
            id="cariNoAkunDetail"
            className="searchtext"
            placeholder="Cari Kode Cabang"
            showClearButton={true}
            input={(args: ChangeEventArgsInput) => {
              const value: any = args.value;
              pencarianEntitas(value, 'Kode');
            }}
            floatLabelType="Never"
          />
        </div>
        <div className="form-input mb-1 mr-1">
          <TextBoxComponent
            id="cariNamaAkunDetail"
            className="searchtext"
            placeholder="Cari Nama Cabang"
            showClearButton={true}
            input={(args: ChangeEventArgsInput) => {
              const value: any = args.value;
              pencarianEntitas(value, 'Cabang');
            }}
            floatLabelType="Never"
          />
        </div>
      </div>
      <GridComponent
        id="dialogListEntitas"
        ref={gridDaftarListEntitas}
        locale="id"
        style={{ width: '100%', height: '75%' }}
        dataSource={dataSource}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        width={'100%'}
        height={'285'}
        rowSelecting={(args: any) => {
          setSelectedEntitas(args.data);
        }}
        recordDoubleClick={(args: any) => {
          console.log('args', args);

          handlePilihEntitas();
        }}
        allowPaging={false}
        allowSorting={true}
        pageSettings={{
          pageSize: 10,
          // pageCount: 10,
          // pageSizes: ['10', '50', '100', 'All']
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="Kode" headerText="Kode" headerTextAlign="Center" textAlign="Center" width="35" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="Cabang" headerText="Entitas Bisnis" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
        </ColumnsDirective>
        <Inject services={[Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogListEntitas;

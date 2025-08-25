import React, { useRef } from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';

interface DialogListBarangProps {
  isOpen: boolean;
  onClose: () => void;
  handlePilihBarang: () => void;
  pencarianBarang: (e: any, a: any) => void;
  setSelectedBarang: any;
  setSelectedRowIndex: any;
  dataSource: any;
}

const DialogListBarang: React.FC<DialogListBarangProps> = ({ isOpen, onClose, handlePilihBarang, pencarianBarang, setSelectedRowIndex, setSelectedBarang, dataSource }) => {
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
      click: handlePilihBarang,
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
      header={'Daftar Item'}
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
            placeholder="Cari Nama Item"
            showClearButton={true}
            input={(args: ChangeEventArgsInput) => {
              const value: any = args.value;
              pencarianBarang(value, 'nama_item');
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
          setSelectedBarang(args.data);
        }}
        recordDoubleClick={(args: any) => {
          handlePilihBarang();
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
          <ColumnDirective field="id_supp" headerText="ID. SUPP" headerTextAlign="Center" textAlign="Left" width="45" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="nama_item" headerText="Deskripsi" headerTextAlign="Center" textAlign="Left" width="140" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            field="harga"
            headerText="Harga"
            headerTextAlign="Center"
            textAlign="Right"
            width="100"
            clipMode="EllipsisWithTooltip"
            template={(props: any) => {
              return <span>{props.harga ? parseFloat(props.harga).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
            }}
          />
          <ColumnDirective field="ukuran" headerText="Ukuran" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="merk" headerText="Merk" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
        </ColumnsDirective>
        <Inject services={[Selection]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogListBarang;

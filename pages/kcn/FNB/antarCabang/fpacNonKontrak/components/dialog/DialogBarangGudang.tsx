import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface DialogBarangGudangProps {
  onOpen: boolean;
  onClose: () => void;
  pencarianNamaGudang: (value: string) => void;
  dataSource: any;
  setSelectedGudang: (value: any) => void;
  handlePilihGudang: () => void;
  setModalDaftarGudang: any;
}

const DialogBarangGudang = ({ onOpen, onClose, pencarianNamaGudang, dataSource, setSelectedGudang, handlePilihGudang, setModalDaftarGudang }: DialogBarangGudangProps) => {
  return (
    <DialogComponent
      target="#dialogFPACList"
      style={{ position: 'fixed' }}
      header={'Daftar Gudang'}
      visible={onOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="250"
      close={onClose}
      //   close={() => {
      //     setModalDaftarGudang(false);
      //     setSearchNamaGudang('');
      //     const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
      //     if (cariNoAkun) {
      //       cariNoAkun.value = '';
      //     }
      //   }}
      closeOnEscape={true}
    >
      <div className="form-input mb-1 mr-1" style={{ display: 'inline-block' }}>
        <TextBoxComponent
          id="cariNoAkun"
          className="searchtext"
          placeholder="Cari Nama Gudang"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            const value: any = args.value;
            pencarianNamaGudang(value);
          }}
          floatLabelType="Never"
        />
      </div>

      <GridComponent
        id="dialogGudang"
        locale="id"
        style={{ width: '100%', height: '100%' }}
        // dataSource={searchNamaGudang !== '' ? filteredDataGudang : daftarGudang}
        dataSource={dataSource}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        height={'285'}
        rowSelecting={(args: any) => {
          setSelectedGudang(args.data);
        }}
        recordDoubleClick={(args: any) => {
          handlePilihGudang();
          // console.log(args, 'args double click');
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="nama_gudang" headerText="Nama Gudang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
        </ColumnsDirective>
        <Inject services={[Selection]} />
      </GridComponent>

      <div>
        <ButtonComponent
          id="buBatalDokumen1"
          content="Batal"
          cssClass="e-primary e-small"
          style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
          onClick={() => {
            setModalDaftarGudang(false);
          }}
        />

        <ButtonComponent
          id="buSimpanDokumen1"
          content="Pilih"
          cssClass="e-primary e-small"
          style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
          onClick={() => {
            handlePilihGudang();
          }}
        />
      </div>
    </DialogComponent>
  );
};

export default DialogBarangGudang;

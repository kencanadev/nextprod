import React from 'react';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface DialogListTermin {
  onOpen: boolean;
  onClose: () => void;
  dataSource: any;
  setModalDaftarTermin: any;
  setSelectedTermin: any;
  pencarianNoTermin: (val: any) => void;
  handlePilihTermin: () => void;
}

const DialogListTermin = ({ onOpen, onClose, dataSource, setModalDaftarTermin, setSelectedTermin, pencarianNoTermin, handlePilihTermin }: DialogListTermin) => {
  return (
    <DialogComponent
      target="#dialogFPACList"
      style={{ position: 'fixed' }}
      header={'Daftar Termin'}
      visible={onOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="250"
      close={onClose}
      closeOnEscape={true}
    >
      <div className="form-input mb-1 mr-1" style={{ display: 'inline-block' }}>
        <TextBoxComponent
          id="cariNoAkun"
          className="searchtext"
          placeholder="Cari Nomor akun Jurnal"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            pencarianNoTermin(args.value);
          }}
          floatLabelType="Never"
        />
      </div>

      <GridComponent
        id="dialogTermin"
        locale="id"
        style={{ width: '100%', height: '100%' }}
        dataSource={dataSource}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        height={'225'}
        rowSelecting={(args: any) => {
          setSelectedTermin(args.data);
        }}
        recordDoubleClick={(args: any) => {
          handlePilihTermin();
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="nama_termin" headerText="Nama Termin" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
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
            setModalDaftarTermin(false);
          }}
        />

        <ButtonComponent
          id="buSimpanDokumen1"
          content="Pilih"
          cssClass="e-primary e-small"
          style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
          onClick={() => {
            handlePilihTermin();
          }}
        />
      </div>
    </DialogComponent>
  );
};

export default DialogListTermin;

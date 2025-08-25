import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface DialogListSupplier {
  onOpen: boolean;
  onClose: () => void;
  pencarianSupplier: (value: any, flag: string) => void;
  dataSource: any;
  setSelectedSupplier: (value: any) => void;
  handlePilihSupplier: () => void;
  setModalDaftarSupplier: any;
}

const DialogListSupplier = ({ onOpen, onClose, dataSource, handlePilihSupplier, pencarianSupplier, setModalDaftarSupplier, setSelectedSupplier }: DialogListSupplier) => {
  return (
    <DialogComponent
      target="#dialogFPACList"
      style={{ position: 'fixed' }}
      header={'Daftar Supplier'}
      visible={onOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="350"
      close={onClose}
      closeOnEscape={true}
    >
      <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <TextBoxComponent
          id="cariNoSupp"
          className="searchtext"
          placeholder="Cari No Supplier"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            const value = args.value;
            pencarianSupplier(value, 'no_supp');
          }}
          floatLabelType="Never"
        />
        <TextBoxComponent
          id="cariNamaRelasi"
          className="searchtext"
          placeholder="Cari Nama Relasi"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            const value = args.value;
            pencarianSupplier(value, 'nama_relasi');
          }}
          floatLabelType="Never"
        />
      </div>

      <GridComponent
        id="dialogSupplier"
        locale="id"
        style={{ width: '100%', height: '100%' }}
        dataSource={dataSource}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        height={'325'}
        rowSelecting={(args) => {
          setSelectedSupplier(args.data);
        }}
        recordDoubleClick={(args) => {
          handlePilihSupplier();
          // console.log(args, 'args double click');
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="no_supp" headerText="No Supplier" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="kode_mu" headerText="Kode MU" headerTextAlign="Center" textAlign="Left" width="75" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="nama_relasi" headerText="Nama Relasi" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
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
            setModalDaftarSupplier(false);
          }}
        />

        <ButtonComponent
          id="buSimpanDokumen1"
          content="Pilih"
          cssClass="e-primary e-small"
          style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
          onClick={() => {
            handlePilihSupplier();
          }}
        />
      </div>
    </DialogComponent>
  );
};

export default DialogListSupplier;

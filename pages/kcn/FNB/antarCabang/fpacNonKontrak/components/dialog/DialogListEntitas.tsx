import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface DialogListEntitas {
  onOpen: boolean;
  onClose: () => void;
  filterEntitas: (value: any, value2: any) => void;
  dataSource: any;
  setSelectedEntitas: (value: any) => void;
  handlePilihEntitas: () => void;
  setModalDaftarEntitas: any;
  searchCabang: any;
  setSearchCabang: any;
  searchKodeCabang: any;
  setSearchKodeCabang: any;
}

const DialogListEntitas = ({ dataSource, handlePilihEntitas, onClose, onOpen, filterEntitas, searchCabang, searchKodeCabang, setSearchCabang, setSearchKodeCabang, setModalDaftarEntitas, setSelectedEntitas }: DialogListEntitas) => {
  return (
    <DialogComponent
      target="#dialogFPACList"
      style={{ position: 'fixed' }}
      header={'Daftar Entitas'}
      visible={onOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="290"
      close={onClose}
      //   close={() => {
      //     setSearchKodeCabang('');
      //     setSearchCabang('');
      //     const cariKodeCabang = document.getElementById('cariKodeCabang') as HTMLInputElement;
      //     if (cariKodeCabang) {
      //       cariKodeCabang.value = '';
      //     }
      //     const cariCabang = document.getElementById('cariCabang') as HTMLInputElement;
      //     if (cariCabang) {
      //       cariCabang.value = '';
      //     }
      //     setFilteredDataEntitas(listDaftarEntitas);
      //     setModalDaftarEntitas(false);
      //   }}
      closeOnEscape={true}
    >
      <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <TextBoxComponent
          id="cariKodeCabang"
          className="searchtext"
          placeholder="Cari Kode Cabang"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            const value = args.value;
            setSearchKodeCabang(value);
            filterEntitas(value, searchCabang);
          }}
          floatLabelType="Never"
        />
        <TextBoxComponent
          id="cariCabang"
          className="searchtext"
          placeholder="Cari Cabang"
          showClearButton={true}
          input={(args: ChangeEventArgsInput) => {
            const value = args.value;
            setSearchCabang(value);
            filterEntitas(searchKodeCabang, value);
          }}
          floatLabelType="Never"
        />
      </div>
      <GridComponent
        id="dialogEntitas"
        locale="id"
        style={{ width: '100%', height: '100%' }}
        dataSource={dataSource}
        // dataSource={filteredDataEntitas.length > 0 ? filteredDataEntitas : listDaftarEntitas}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowHeight={22}
        height={'255'}
        rowSelecting={(args) => {
          setSelectedEntitas(args.data);
        }}
        recordDoubleClick={(args) => {
          handlePilihEntitas();
          // console.log(args, 'args double click');
        }}
      >
        <ColumnsDirective>
          <ColumnDirective field="Kode" headerText="Kode Cabang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="Cabang" headerText="Cabang" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
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
            setModalDaftarEntitas(false);
          }}
        />

        <ButtonComponent
          id="buSimpanDokumen1"
          content="Pilih"
          cssClass="e-primary e-small"
          style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
          onClick={() => {
            handlePilihEntitas();
          }}
        />
      </div>
    </DialogComponent>
  );
};

export default DialogListEntitas;

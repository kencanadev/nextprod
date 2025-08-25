import React from 'react';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

interface DialogFakturJualProps {
  onOpen: boolean;
  onClose: () => void;
  setSelectedFj: any;
  setSearchFj?: any;
  dataNoFj: any;
  dataListFj: any;
  pencarianNoFj: (val: any) => void;
  handlePilihFj: (val: any) => void;
}

const DialogFakturJual = ({ onOpen, onClose, setSelectedFj, setSearchFj, dataNoFj, dataListFj, pencarianNoFj, handlePilihFj }: DialogFakturJualProps) => {
  return (
    <DialogComponent
      target="#dialogFPACList"
      style={{ position: 'fixed' }}
      header={'Daftar Faktur Jual'}
      visible={onOpen}
      isModal={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      allowDragging={true}
      showCloseIcon={true}
      width="80vw"
      close={onClose}
      closeOnEscape={true}
    >
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          <section id="daftar-fj" className="max-w-80">
            <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextBoxComponent
                id="cariKodeCabang"
                className="searchtext"
                placeholder="Cari No. FJ"
                showClearButton={true}
                // input={(args: ChangeEventArgsInput) => {
                //     const value = args.value;
                //     setSearchKodeCabang(value);
                //     filterEntitas(value, searchCabang);
                // }}
                input={(args: ChangeEventArgsInput) => {
                  pencarianNoFj(args.value);
                }}
                floatLabelType="Never"
              />
            </div>
            <GridComponent
              id="dialogDaftarFj"
              locale="id"
              style={{ height: '100%', width: '100%' }}
              dataSource={dataNoFj}
              selectionSettings={{ mode: 'Row', type: 'Single' }}
              height={'255'}
              rowSelecting={(args: any) => {
                setSelectedFj(args.data);
              }}
              recordDoubleClick={(args: any) => {
                handlePilihFj(args.rowData);
              }}
            >
              <ColumnsDirective>
                <ColumnDirective field="no_fj" headerText="Daftar FJ" width="100" textAlign="Center" />
              </ColumnsDirective>
            </GridComponent>
          </section>
          <section id="table-fj">
            <GridComponent id="dialogTableFj" locale="id" style={{ height: '100%', width: '100%' }} dataSource={dataListFj} selectionSettings={{ mode: 'Row', type: 'Single' }} height={'255'}>
              <ColumnsDirective>
                <ColumnDirective field="no_fj" headerText="No. FJ" width="100" textAlign="Center" />
                <ColumnDirective field="no_item" headerText="No. Barang" width="100" textAlign="Center" />
                <ColumnDirective field="diskripsi" headerText="Nama Barang" width="100" textAlign="Center" />
                <ColumnDirective field="satuan" headerText="Satuan" width="100" textAlign="Center" />
                <ColumnDirective field="qty" headerText="Jumlah Batang" width="100" textAlign="Center" />
              </ColumnsDirective>
            </GridComponent>
          </section>
        </div>

        <div>
          <ButtonComponent
            id="buBatalDokumen1"
            content="Batal"
            cssClass="e-primary e-small"
            style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
            onClick={onClose}
          />
          {/* <ButtonComponent
            id="buSimpanDokumen1"
            content="Pilih"
            cssClass="e-primary e-small"
            style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
            //   onClick={() => {
            //     handlePilihEntitas();
            //   }}
          /> */}
        </div>
      </div>
    </DialogComponent>
  );
};

export default DialogFakturJual;

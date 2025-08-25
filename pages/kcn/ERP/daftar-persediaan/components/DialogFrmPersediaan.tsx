import axios from 'axios';
import React from 'react';

// Syncfusion
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
// Others
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

// Component Tabs
import Informasi from './tabs/Informasi';
import { usePersediaanState } from '../hooks/usePersediaanState';

type DialogFrmPersediaanProps = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  kode_entitas: string;
  statusPage: string;
  kode_dokumen: string;
  onRefresh: Function;
};

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const DialogFrmPersediaan = ({ isOpen, kode_dokumen, kode_entitas, onClose, onRefresh, statusPage, token }: DialogFrmPersediaanProps) => {
  // Custom Hooks

  const {
    showDialogGrp,
    updateState,
    masterData,
    handleShowDialogGrp,
    pencarianBarang,
    searchGrpBarang,
    setSelectedGrpBarang,
    listGrpBarang,
    filteredGrpBarang,
    handlePilihGrpBarang,
    generateNoItem,
  } = usePersediaanState({
    kode_entitas,
    token,
    statusPage,
  });

  // Global Functions
  const handleEdit = async () => {
    const response = await axios.get(`${apiUrl}/erp/master_detail_persediaan`, {
      params: {
        entitas: kode_entitas,
        param1: kode_dokumen,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  return (
    <DialogComponent
      id="dialogFrmPersediaan"
      target="#main-target"
      header={statusPage === 'BARU' ? '< ITEM BARU >' : '< ITEM UBAH >'}
      width="90%"
      height="75%"
      visible={isOpen}
      close={onClose}
      showCloseIcon
      closeOnEscape
      allowDragging
      isModal
      position={{ X: 'center', Y: 20 }}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
    >
      <div className="mb-1 p-4">
        {/* ============= HEADER DATA ================= */}
        {/* ===== UPPER ===== */}
        <div className="flex items-center justify-start gap-3">
          {/* TIPE */}
          <div className="flex w-[14%] items-center gap-1">
            <label>Tipe</label>
            <div className="container rounded border border-gray-300 bg-white px-2">
              <DropDownListComponent
                id="tipe-item"
                dataSource={[{ str: 'Persediaan' }, { str: 'Non Persediaan' }, { str: 'Jasa/Service' }]}
                fields={{ value: 'str', text: 'str' }}
                placeholder="--Silahkan Pilih--"
                change={(args: ChangeEventArgsDropDown) => {
                  const value: any = args.value;
                  updateState('tipe', value);
                }}
                value={masterData.tipe}
              />
            </div>
          </div>
          {/* AKTIVASI */}
          <div className="flex w-[14%] items-center gap-1">
            <label>Aktivasi</label>
            <div className="container rounded border border-gray-300 bg-white px-2">
              <DropDownListComponent
                id="aktivasi-item"
                dataSource={[{ str: 'Aktif' }, { str: 'Non Aktif' }, { str: 'Slow Moving' }]}
                fields={{ value: 'str', text: 'str' }}
                placeholder="--Silahkan Pilih--"
                change={(args: ChangeEventArgsDropDown) => {
                  const value: any = args.value;
                  updateState('status', value);
                }}
                value={masterData.status}
              />
            </div>
          </div>
          {/* STATUS */}
          <div className="flex w-[14%] items-center gap-1">
            <label>Status</label>
            <div className="container rounded border border-gray-300 bg-white px-2">
              <DropDownListComponent
                id="status-item"
                dataSource={[{ str: 'Continue' }, { str: 'Insidentil' }]}
                fields={{ value: 'str', text: 'str' }}
                placeholder="--Silahkan Pilih--"
                change={(args: ChangeEventArgsDropDown) => {
                  const value: any = args.value;
                  updateState('status_item', value);
                }}
                value={masterData.status_item}
              />
            </div>
          </div>
          {/* NO BARANG */}
          <div className="flex w-[22%] items-center">
            <label>No. Barang</label>
            <input className="ml-1.5 flex-1 rounded border border-gray-300 bg-white px-2 py-1.5" />
            <button
              className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
              style={{ height: 28, marginLeft: 0, borderRadius: 2 }}
              onClick={generateNoItem}
            >
              <FontAwesomeIcon icon={faFileInvoice} className="ml-2" width="15" height="15" />
            </button>
          </div>
          {/* NAMA BARANG */}
          <div className="flex w-[33%] items-center">
            <label>Nama Barang</label>
            <input onChange={(e) => updateState('nama_item', e.target.value)} className="ml-1.5 flex-1 rounded border border-gray-300 bg-white px-2 py-1.5" />
          </div>
        </div>

        <div className="my-4 flex items-center gap-3">
          <span>Info Produk Supplier</span>
          <hr className="flex-grow border border-gray-300" />
        </div>
        {/* ===== LOWER ===== */}
        {masterData.tipe === 'Persediaan' && (
          <div className="flex max-w-[50%] flex-col gap-0">
            {/* NO BARANG BARCODE & BARANG KONSIYANSI / Kustom 2*/}
            <div className="flex items-center justify-between">
              <div className="flex w-[400px] items-center justify-start">
                <label className="w-24">No. Barang Barcode</label>
                <input className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5" />
              </div>

              <div className="flex">
                <CheckBoxComponent
                  label="Barang Konsiyansi"
                  checked={false}
                  change={(args: ChangeEventArgsButton) => {
                    const value: any = args.checked;

                    // updateStateFilter('isKurangStok', value);
                  }}
                  style={{ borderRadius: 3, borderColor: 'gray' }}
                />
              </div>
            </div>
            {/* NAMA BARANG / Kustom 3 */}
            <div className="flex items-center">
              <label className="w-24 max-w-28">Nama Barang</label>
              <input className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5" />
            </div>
            {/* NAMA SUPPLIER */}
            <div className="mt-1 flex items-center">
              <label className="w-24 max-w-28">Nama Supplier</label>
              <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
                <input type="text" />
              </div>
              <button
                className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                style={{ height: 28, marginLeft: 0, borderRadius: 2 }}
                onClick={() => {
                  // setModalDaftarSupplier(true);
                }}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
              </button>
            </div>
          </div>
        )}
        {/* ============= TABS DATA ================= */}
        <div className="panel-tab my-2" style={{ background: '#F7F7F7', width: '100%', height: 'auto' }}>
          <TabComponent animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
            {/* Header */}
            <div className="e-tab-header">
              {['Informasi', 'Data Tambahan', 'Data Akun', 'Perhitungan Rumus', 'Catatan', 'Paket Produk', 'Alternatif Produk', 'Histori', 'Gambar Produk'].map((item, index) => (
                <div tabIndex={index} style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                  {index + 1}. {item}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="e-content mt-3">
              <div tabIndex={0}>
                <Informasi kode_entitas={kode_entitas} token={token} />
              </div>
              <div tabIndex={1}></div>
              <div tabIndex={2}></div>
            </div>
          </TabComponent>
        </div>
      </div>
      {/* ===== Dialog Grp Barang ===== */}
      <button onClick={() => console.log('ccc: ', showDialogGrp)}>cc</button>
      {showDialogGrp ? (
        <DialogComponent close={handleShowDialogGrp} target="#dialogFrmPersediaan" header="Daftar Grup Barang" visible={showDialogGrp} zIndex={1000}>
          <div>
            <div className="form-input mb-1 mr-1">
              <TextBoxComponent
                placeholder="Masukkan Nama Grup Barang..."
                showClearButton
                input={(args: ChangeEventArgsInput) => {
                  const value = args.value;
                  pencarianBarang(value, 'grp');
                }}
                floatLabelType="Never"
              />
            </div>
          </div>
          <GridComponent
            dataSource={searchGrpBarang !== '' ? filteredGrpBarang : listGrpBarang}
            locale="id"
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            width={'100%'}
            height={'285'}
            rowSelecting={(args: any) => setSelectedGrpBarang(args.data)}
            recordDoubleClick={(args: any) => handlePilihGrpBarang()}
            allowPaging={false}
            allowSorting
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_grp" headerText="Grup Barang" width="100" textAlign="Left" />
            </ColumnsDirective>
          </GridComponent>
        </DialogComponent>
      ) : null}
    </DialogComponent>
  );
};

export default DialogFrmPersediaan;

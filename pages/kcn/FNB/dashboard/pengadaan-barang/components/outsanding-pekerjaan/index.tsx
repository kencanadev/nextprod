import React, { useEffect, useRef, useState } from 'react';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

// Syncfusion
import {
  Grid,
  GridComponent,
  ColumnDirective,
  ColumnsDirective,
  Inject,
  Page,
  Edit,
  Sort,
  Filter,
  Group,
  Resize,
  Reorder,
  Selection,
  ExcelExport,
  PdfExport,
  CommandColumn,
} from '@syncfusion/ej2-react-grids';

import { motion } from 'framer-motion';
import { mockData, OPTabList } from '../../constants';
import OrderPembelian from './tabs/order-pembelian/OrderPembelian';
import PermintaanPembelian from './tabs/permintaan-pembelian/PermintaanPembelian';
import { fetchDetailData, fetchOutstandingPekerjaan, getPoHeader, getUserApp } from '../../api';
import { useRouter } from 'next/router';
import ModalBaruPp from '@/pages/kcn/ERP/purchase/pp/modal/pilihbaru';
import { usersMenu } from '@/utils/routines';
import JenisTransaksi from '@/pages/kcn/ERP/purchase/po/modal/jenisTransaksi';
import { ContextMenuComponent, MenuEventArgs, MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { OnClick_CetakFormPoTanpaHarga, OnClick_CetakFormPo, buttonApproval, buttonPembatalan } from '@/pages/kcn/ERP/purchase/po/component/fungsi';
import swal from 'sweetalert2';
import moment from 'moment';
import DialogDetailSupplier from '@/pages/kcn/ERP/master/supplier/components/DialogDetailSupplier';
import DialogBaruEditCustomer from '@/pages/kcn/ERP/master/supplier/components/DialogBaruEditSupplier';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';

const styleButton = { width: 67 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.5 + 'em', backgroundColor: '#3b3f5c' };

type OutstandingPekerjaanProps = {
  kode_entitas: string;
  token: string;
  userid: string;
};

const OutstandingPekerjaan = ({ kode_entitas, token, userid }: OutstandingPekerjaanProps) => {
  const [activeMainTab, setActiveMainTab] = useState(OPTabList[0].key);
  const [lengthData, setLengthData] = useState({
    belum_di_proses: 0,
    belum_di_terima: 0,
  });
  const [masterData, setMasterData] = useState([]);
  const [custData, setCustData] = useState([]);
  const [beliData, setBeliData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [selectedItems, setSelectedItems] = useState<any>({});
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [showDialogPp, setShowDialogPp] = useState(false);
  const [showDialogPo, setShowDialogPo] = useState(false);
  const [showDetailSupplier, setShowDetailSupplier] = useState(false);
  const [masterState, setMasterState] = useState('BARU');
  const [selectedDetailSupplierForEdit, setSelectedDetailSupplierForEdit] = useState([]);
  const [dataState, setDataState] = useState<any>([]);
  const [dataFromSupp, setDataFromSupp] = useState<any>([]);
  const [dialogBaruEditSupplier, setDialogBaruEditSupplier] = useState(false);

  const router = useRouter();
  const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';

  interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
  }
  const kode_menu = '30200'; // kode menu PO
  const [poa, setPoa] = useState(''); // akses untuk bisa approval
  const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });

  const handleRowSelected = (args: any) => {
    // console.log('argss: ', args.data);
    setDataFromSupp((prevData: any) => [args.data]);
    setDataState((prevData: any) => [args.data]);
    setSelectedItems(args.data);
  };

  const refGridGudang = useRef<GridComponent>(null);
  const refGridCustomer = useRef<GridComponent>(null);
  const refGridPembelian = useRef<GridComponent>(null);
  let cMenuCetak: ContextMenuComponent;

  const fetchData = async () => {
    const data = await fetchOutstandingPekerjaan(token, kode_entitas);
    const gudangData = data.filter((item: any) => item.id === 2 && item.kirim_langsung !== 'Y');
    const customerData = data.filter((item: any) => item.id === 2 && item.kirim_langsung === 'Y');
    const pembelianData = data.filter((item: any) => item.id === 1);

    setLengthData({
      belum_di_proses: data.filter((item: any) => item.id === 1).length,
      belum_di_terima: data.filter((item: any) => item.id === 2).length,
    });
    setMasterData(gudangData);
    setCustData(customerData);
    setBeliData(pembelianData);
    refGridGudang.current?.setProperties({ dataSource: gudangData });
    refGridGudang.current?.refresh();

    refGridCustomer.current?.setProperties({ dataSource: customerData });
    refGridCustomer.current?.refresh();

    refGridPembelian.current?.setProperties({ dataSource: pembelianData });
    refGridPembelian.current?.refresh();
  };

  const fetchDetail = async () => {
    const props = {
      entitas: kode_entitas,
      kode_dokumen: selectedItems.kode_dokumen,
      token,
    };

    const data = await fetchDetailData(props);
    setDetailData(data);
  };

  function btnPrintClick(e: any): void {
    var clientRect = (e.target as Element).getBoundingClientRect();
    cMenuCetak.open(clientRect.bottom, clientRect.left);
  }

  let menuCetakItems: MenuItemModel[] = [
    {
      iconCss: 'e-icons e-thumbnail',
      text: 'Form Surat Order Pembelian Dengan Harga',
    },
    {
      iconCss: 'e-icons e-thumbnail',
      text: 'Form Surat Order Pembelian',
    },
  ];

  function menuCetakSelect(args: MenuEventArgs) {
    if (args.item.text === 'Form Surat Order Pembelian Dengan Harga') {
      OnClick_CetakFormPo(selectedItems.kode_dokumen, selectedItems.status, kode_entitas);
    } else if (args.item.text === 'Form Surat Order Pembelian') {
      OnClick_CetakFormPoTanpaHarga(selectedItems.kode_dokumen, selectedItems.status, kode_entitas);
    }
  }

  const handleInfoDetailClick = async () => {
    console.log('dataFromSupp: ', dataFromSupp);
    // if (dataFromSupp.length > 0 && dataFromSupp.kode_dokumen.includes('PP')) return;

    if (dataFromSupp.length > 0) {
      setMasterState('DETAIL');
      setShowDetailSupplier(true);
    } else {
      withReactContent(swalToast).fire({
        icon: 'warning',
        title: '<p style="font-size:12px">Silahkan Pilih Data Supplier Terlebih Dahulu</p>',
        width: '100%',
      });
    }
  };

  const handleNavigateLink = async (tipe: string) => {
    if (!selectedItems) {
      swal.fire({
        title: 'Silahkan pilih data terlebih dahulu',
        icon: 'warning',
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    if (selectedItems?.kode_dokumen.includes('PP')) return;

    const header = await getPoHeader({ entitas: kode_entitas, kode_dokumen: selectedItems.kode_dokumen, token });

    if (tipe === 'approval' && header) {
      const result = buttonApproval(
        selectedItems.status,
        header[0].produksi,
        selectedItems.kode_dokumen,
        '',
        moment(),
        moment().endOf('month'),
        moment(),
        moment().endOf('month'),
        moment(),
        moment().endOf('month'),
        'yes',
        '',
        '',
        '',
        false,
        false,
        false,
        '',
        '',
        false
      );
      router.push({ pathname: `/kcn/ERP/purchase/po/po`, query: { str: result, tipe: 'dashboard' } });
    } else if (tipe === 'pembatalan' && header) {
      const result = buttonPembatalan(
        selectedItems.status,
        header[0].produksi,
        selectedItems.kode_dokumen,
        '',
        moment(),
        moment().endOf('month'),
        moment(),
        moment().endOf('month'),
        moment(),
        moment().endOf('month'),
        'yes',
        '',
        '',
        '',
        false,
        false,
        false,
        '',
        '',
        false
      );
      router.push({ pathname: `/kcn/ERP/purchase/po/po`, query: { str: result, tipe: 'dashboard' } });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedItems) {
      fetchDetail();
    }
  }, [selectedItems]);

  useEffect(() => {
    getUserApp(kode_entitas, userid).then((res: any) => {
      setPoa(res[0].poa);
    });

    usersMenu(kode_entitas, userid, kode_menu)
      .then((result) => {
        const { baru, edit, hapus, cetak } = result;
        setUserMenu((prevState) => ({
          ...prevState,
          baru: baru,
          edit: edit,
          hapus: hapus,
          cetak: cetak,
        }));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const gridOptions = {
    pageSettings: {
      pageSize: 25,
      pageCount: 5,
      pageSizes: ['25', '50', '75', 'All'],
    },
    selectionSettings: {
      mode: 'Row',
      type: 'Single',
    },
    allowPaging: true,
    allowSorting: true,
    allowFiltering: false,
    allowResizing: true,
    autoFit: true,
    allowReordering: true,
    rowHeight: 22,
    height: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };

  return (
    <div className="mt-1" id="main-target">
      {/* Header Tab */}
      <div className="-mt-[4px] flex h-[32px] w-full items-end gap-0 overflow-x-auto overflow-y-hidden border-x-2 border-b-2 border-gray-300">
        {OPTabList.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => setActiveMainTab(item.key)}
            layout // Memastikan perubahan ukuran smooth
            animate={{
              height: activeMainTab === item.key ? '28px' : '24px', // Tinggi berbeda
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }} // Transisi lebih smooth
            className={`whitespace-nowrap rounded-b-none rounded-t-md font-semibold transition-all ${
              activeMainTab === item.key
                ? 'bg-[#dedede] px-3 py-2 text-sm text-black' // Tab aktif lebih besar
                : 'border px-2 py-1 text-xs text-gray-500 hover:scale-100 hover:text-black' // Tab tidak aktif lebih kecil & rapat
            }`}
            whileTap={{ scale: 1.05 }} // Efek saat ditekan
          >
            {item.title}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col">
        {/* Tab Content */}
        <div className="flex h-full w-full">
          {activeMainTab === 'order_pembelian' && (
            <OrderPembelian
              gudangData={masterData}
              customerData={custData}
              refGridGudang={refGridGudang}
              refGridCustomer={refGridCustomer}
              handleRowSelected={handleRowSelected}
              selectedItems={selectedItems}
              refreshData={fetchData}
            />
          )}
          {activeMainTab === 'permintaan_pembelian' && <PermintaanPembelian data={beliData} refGrid={refGridPembelian} handleRowSelected={handleRowSelected} refreshData={fetchData} />}
        </div>

        {/* Footer */}
        <div className="h-fit w-full bg-gray-200 px-5 py-3">
          {/* Grid Detail */}
          <div className={`${isShowDetail ? 'block' : 'hidden'}`}>
            <GridComponent {...gridOptions} enableAdaptiveUI dataSource={detailData}>
              <ColumnsDirective>
                <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" width="140" />
                <ColumnDirective field="diskripsi" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" autoFit />
                <ColumnDirective field="sat_std" headerText="Satuan (Std)" headerTextAlign="Center" textAlign="Left" autoFit />
                <ColumnDirective field="qty_std" headerText="Kuantitas" format="N0" headerTextAlign="Center" textAlign="Right" autoFit />
                <ColumnDirective field="qts_sisa" headerText="Outstanding" format="N0" headerTextAlign="Center" textAlign="Right" autoFit />
                <ColumnDirective
                  field="berat"
                  headerText="Berat (Kg)"
                  format="N0"
                  headerTextAlign="Center"
                  textAlign="Right"
                  autoFit
                  template={(props: any) => {
                    return <span>{parseFloat(props.berat).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>;
                  }}
                />
              </ColumnsDirective>
            </GridComponent>
          </div>
          {/* Upper Actions */}
          <div className="flex items-center gap-1 bg-gray-300 p-2">
            {/* Checkbox */}
            <CheckBoxComponent
              label={'Tampilkan detail barang'}
              checked={isShowDetail}
              change={(args: ChangeEventArgsButton) => {
                const value: any = args.checked;
                setIsShowDetail(value);
                // updateStateFilter('isKlasifikasiProdukChecked', value);
              }}
              style={{ borderRadius: 3, borderColor: 'gray', marginRight: '10px' }}
            />

            <ButtonComponent id="btnRefresh" iconCss="e-icons e-medium e-refresh" cssClass="e-primary e-small" content="Refresh" style={{ ...styleButton, width: 'auto' }} onClick={fetchData} />
            <ButtonComponent
              id="btnNewRequest"
              iconCss="e-icons e-medium e-print-layout"
              cssClass="e-primary e-small"
              content="Permintaan Baru"
              style={{ ...styleButton, width: 'auto' }}
              onClick={() => setShowDialogPp(true)}
            />
            <ButtonComponent
              id="btnNewPO"
              disabled={userMenu.baru === 'Y' || userid === 'administrator' ? false : true}
              iconCss="e-icons e-medium e-print-layout"
              cssClass="e-primary e-small"
              content="PO Baru"
              style={{ ...styleButton, width: 'auto' }}
              onClick={() => setShowDialogPo(true)}
            />
            <ButtonComponent
              id="btnApproval"
              iconCss="e-icons e-medium e-chevron-right-fill"
              cssClass="e-primary e-small"
              content="Approval PO"
              style={{ ...styleButton, width: 'auto' }}
              disabled={poa === 'Y' || userid?.toLowerCase() === 'administrator' ? false : true}
              onClick={() => handleNavigateLink('approval')}
            />
            <ButtonComponent
              id="btnCancel"
              iconCss="e-icons e-medium e-chevron-right-fill"
              cssClass="e-primary e-small"
              content="Pembatalan PO"
              style={{ ...styleButton, width: 'auto' }}
              onClick={() => handleNavigateLink('pembatalan')}
            />
            <ContextMenuComponent
              id="cMenuCetak"
              ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
              items={menuCetakItems}
              select={menuCetakSelect}
              animationSettings={{ duration: 800, effect: 'FadeIn' }}
            />
            <ButtonComponent
              id="btnCetak"
              cssClass="e-primary e-small"
              style={{ ...styleButton, width: 75 + 'px' }}
              // disabled={disabledCetak}
              onClick={btnPrintClick}
              content="Cetak"
              iconCss="e-icons e-medium e-chevron-down"
              iconPosition="Right"
            ></ButtonComponent>
            {/* <ButtonComponent id="btnCetak" iconCss="e-icons e-medium e-print" cssClass="e-primary e-small" content="Cetak" style={{ ...styleButton, width: 'auto' }} onClick={() => {}} /> */}
          </div>
          {/* Summary */}
          <div className="mt-2 flex gap-5 bg-gray-300 p-2">
            {/* Left */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold">Summary :</span>
              </div>
              <div className="flex items-center gap-1 text-[13px]">
                <span>Permintaan Pembelian Belum Di Proses :</span>
                <span>{lengthData.belum_di_proses}</span>
              </div>
              <div className="flex items-center gap-1 text-[13px]">
                <span>Order Pembelian Barang Belum Di Terima :</span>
                <span>{lengthData.belum_di_terima}</span>
              </div>
            </div>
            {/* Right */}
            <div className="flex h-full items-start justify-start gap-1">
              <ButtonComponent
                id="btnRequest"
                iconCss="e-icons e-medium e-chevron-right-fill"
                cssClass="e-primary e-small"
                content="Permintaan"
                style={{ ...styleButton, width: 'auto' }}
                onClick={() => router.push(`/kcn/ERP/purchase/pp/spplist?tabId=${tabId}`)}
              />
              <ButtonComponent
                id="btnOrder"
                iconCss="e-icons e-medium e-chevron-right-fill"
                cssClass="e-primary e-small"
                content="Order Pembelian"
                style={{ ...styleButton, width: 'auto' }}
                onClick={() => router.push(`/kcn/ERP/purchase/po/polist?tabId=${tabId}`)}
              />
              <ButtonComponent
                id="btnStock"
                iconCss="e-icons e-medium e-chevron-right-fill"
                cssClass="e-primary e-small"
                content="Stok Aktual"
                style={{ ...styleButton, width: 'auto' }}
                onClick={() => router.push(`/kcn/ERP/inventory/informasi-stok-aktual?tabId=${tabId}`)}
              />
              <ButtonComponent
                id="btnInfoSupplier"
                iconCss="e-icons e-medium e-chevron-right-fill"
                cssClass="e-primary e-small"
                content="Info Supplier"
                style={{ ...styleButton, width: 'auto' }}
                onClick={handleInfoDetailClick}
              />
            </div>
          </div>
        </div>
      </div>
      <ModalBaruPp
        isOpen={showDialogPp}
        onClose={() => setShowDialogPp(false)}
        onSelectData={(selectedData: any) => {}}
        date1={moment()}
        date2={moment().endOf('month')}
        tipeDokumen={'ya'}
        tipeForm="dashboard"
      />
      <JenisTransaksi
        isOpen={showDialogPo}
        onClose={() => setShowDialogPo(false)}
        onSelectData={(selectedData: any) => {}}
        date1={moment()}
        date2={moment().endOf('month')}
        tipeDokumen={'yes'}
        noPOValue={''}
        namaSuppValue={''}
        namaBarangValue={''}
        isNoPOChecked={false}
        isNamaSuppChecked={false}
        isNamaBarangChecked={false}
        statusDokValue={''}
        statusAppValue={''}
        dateberlaku1={moment()}
        dateberlaku2={moment().endOf('month')}
        datekirim1={moment()}
        datekirim2={moment().endOf('month')}
        isTanggalChecked={false}
        tipeForm="dashboard"
      />
      {showDetailSupplier && (
        <DialogDetailSupplier
          dataFromSupp={dataFromSupp}
          setDataFromSupp={setDataFromSupp}
          DataState={dataState}
          isOpen={showDetailSupplier}
          onClose={() => setShowDetailSupplier(false)}
          masterState={masterState}
          setMasterState={setMasterState}
          token={token}
          entitas={kode_entitas}
          userid={userid}
          setSelectedDetailSupplierForEdit={setSelectedDetailSupplierForEdit}
          setDialogBaruEditSupplier={setDialogBaruEditSupplier}
          originalDataSource={masterData.concat(custData)}
        />
      )}
      {dialogBaruEditSupplier && (
        <DialogBaruEditCustomer
          setDataState={setDataState}
          DataState={dataState}
          isOpen={dialogBaruEditSupplier}
          onClose={() => {
            setDialogBaruEditSupplier(false);
            setMasterState('');
          }}
          refreshListData={fetchData}
          userid={userid}
          masterState={masterState}
          token={token}
          originalDataSource={masterData.concat(custData)}
          selectedDetailSupplierForEdit={selectedDetailSupplierForEdit}
          setSelectedDetailSupplierForEdit={setSelectedDetailSupplierForEdit}
          entitas={kode_entitas}
        />
      )}
    </div>
  );
};

export default OutstandingPekerjaan;

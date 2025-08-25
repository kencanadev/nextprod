import React, { useEffect, useRef, useState } from 'react';

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
  AggregatesDirective,
  AggregateDirective,
  AggregateColumnsDirective,
  AggregateColumnDirective,
  Aggregate,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { GudangList, HistoriTabList, listDokumenStok, mockData } from '../../constants';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FillFromSQL } from '@/utils/routines';
import { fetchDetailHistoryOd, fetchPrepareDataOd, fetchSettings, fetchStokOverdue } from '../../api';
import moment from 'moment';
import { motion } from 'framer-motion';
import swal from 'sweetalert2';
import Loader from '../Loader';

type DataStokOverdueProps = {
  kode_entitas: string;
  token: string;
  userid: string;
};

const styleButton = { width: 67 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.5 + 'em', backgroundColor: '#3b3f5c' };

const DataStokOverdue = ({ kode_entitas, token, userid = '' }: DataStokOverdueProps) => {
  // Master State Management
  const [data, setData] = useState([]);
  const [settings, setSettings] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [klasifikasi, setKlasifikasi] = useState([]);
  const [showDialogAction, setShowDialogAction] = useState(false);
  const [showDialogHistori, setShowDialogHistori] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [dataDetail, setDataDetail] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    entitas: kode_entitas,
    tab: 'overdueStok',
    request: 'POST',
    kode_item: '',
    kode_gudang: '',
    tgl_buat: moment().format('YYYY-MM-DD'),
    tgl_buat2: moment().format('YYYY-MM-DD'),
    tgl_followup: '',
    tgl_followup2: '',
    aksi: '',
    hasil: '',
    jenis: '',
    tampil: '',
    rencana: '',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    userid: userid.toUpperCase(),
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateFormState = (field: any, value: any) => {
    setUpdateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setUpdateForm({
      entitas: kode_entitas,
      tab: 'overdueStok',
      request: 'POST',
      kode_gudang: '',
      kode_item: '',
      tgl_buat: moment().format('YYYY-MM-DD'),
      tgl_buat2: moment().format('YYYY-MM-DD'),
      tgl_followup: '',
      tgl_followup2: '',
      aksi: '',
      hasil: '',
      jenis: '',
      tampil: '',
      rencana: '',
      tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
      userid: userid.toUpperCase(),
    });
  };

  const gridOD = useRef<GridComponent | null>(null);

  useEffect(() => {
    if (showDetail) {
      const params = {
        entitas: kode_entitas,
        param1: 'detailOverdue',
        param2: selectedItem.kode_item,
        param3: selectedItem.kode_gudang,
        param4: showDetail ? '' : 0,
        // Digunakan jika detailOverdue di params1
        param5: selectedItem.tgl_data,
        param6: selectedItem.hpp, // berat
        param7: selectedItem.stok, // stok
        param8: selectedItem.batas, // batas
        param9: selectedItem.berat, //
      };
      fetchDetailHistoryOd({ params, token }).then((res: any) => {
        const modifiedData = res.map((item: any) => ({
          ...item,
          harga_beli: Math.floor(parseFloat(item.harga_beli)),
          harga: Math.floor(parseFloat(item.harga)),
        }));
        setDataDetail(modifiedData);
      });
    }
  }, [showDetail, selectedItem]);

  const [tabDetail, setTabDetail] = useState(0);
  const [headerHistoriData, setHeaderHistorData] = useState([]);
  const [detailHistoriData, setDetailHistorData] = useState([]);

  const historiHeaderRef = useRef<GridComponent | null>(null);
  const historiDetailRef = useRef<GridComponent | null>(null);

  useEffect(() => {
    if (showDialogHistori) {
      const paramsHeader = {
        entitas: kode_entitas,
        param1: 'master',
        param2: selectedItem.kode_item,
        param3: selectedItem.kode_gudang,
        param4: tabDetail,
      };

      const paramsDetail = {
        entitas: kode_entitas,
        param1: 'detail',
        param2: selectedItem.kode_item,
        param3: selectedItem.kode_gudang,
        param4: tabDetail,
      };

      fetchDetailHistoryOd({ params: paramsHeader, token }).then((res: any) => {
        setHeaderHistorData(res);
        historiHeaderRef.current?.setProperties({ dataSource: res });
        historiHeaderRef.current?.refresh();
      });
      fetchDetailHistoryOd({ params: paramsDetail, token }).then((res: any) => {
        const modifiedData = res.map((item: any) => ({
          ...item,
          jumlah_mu: parseFloat(item.jumlah_mu),
        }));
        setDetailHistorData(modifiedData);
        historiDetailRef.current?.setProperties({ dataSource: modifiedData });
        historiDetailRef.current?.refresh();
      });
    }
  }, [showDialogHistori, tabDetail, selectedItem]);

  // Filter State Management
  const [checkedItems, setCheckedItems] = useState<any>({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [checkedGudang, setCheckedGudang] = useState<any>({
    'gd-1': 'GU',
    'gd-2': 'GD',
    'gd-3': 'GB',
  });
  const [filterData, setFilterData] = useState({
    tglDok: moment(),
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarangValue: '',
    isNamaBarangChecked: false,
    klasifikasiProdukValue: '',
    isKlasifikasiProdukChecked: false,
  });

  const updateStateFilter = (field: any, value: any) => {
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle individual checkbox changes
  const handleCheckboxChange = (id: any, kode: any) => {
    const newCheckedItems: any = { ...checkedItems };
    if (newCheckedItems[id]) {
      delete newCheckedItems[id];
    } else {
      newCheckedItems[id] = kode;
    }
    setCheckedItems(newCheckedItems);
    setIsAllSelected(Object.keys(newCheckedItems).length === kategori.length);
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Clear all selections
      setCheckedItems({});
      setIsAllSelected(false);
    } else {
      // Select all items
      const allItems: any = {};
      kategori.forEach((item: any) => {
        allItems[item.id] = item.kode;
      });
      setCheckedItems(allItems);
      setIsAllSelected(true);
    }
  };

  // Handle checkbox change gudang
  const handleCheckboxChangeGudang = (id: any, kode: any) => {
    const newCheckedGudang: any = { ...checkedGudang };
    if (newCheckedGudang[id]) {
      delete newCheckedGudang[id];
    } else {
      newCheckedGudang[id] = kode;
    }
    setCheckedGudang(newCheckedGudang);
  };

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    const params = {
      entitas: kode_entitas,
      param1: filterData.tglDok.format('YYYY-MM-DD'),
      param2: filterData.isNoBarangChecked ? filterData.noBarangValue : 'all',
      param3: filterData.isNamaBarangChecked ? filterData.namaBarangValue : 'all',
      param4: Object.values(checkedItems).join(';'),
      param5: filterData.isKlasifikasiProdukChecked ? filterData.klasifikasiProdukValue : 'all',
      param6: Object.values(checkedGudang).join(';'),
    };

    fetchStokOverdue(params, token)
      .then((res) => {
        const modifiedData = res
          .filter((item: any) => item.nama_gudang)
          .map((item: any) => ({
            ...item,
            // berat: parseFloat(item.berat) * item.stok,
            hpp: Math.floor(parseFloat(item.hpp)),
            nilai: Math.floor(item.nilai),
          }));
        setData(modifiedData);
        gridOD.current?.setProperties({ dataSource: modifiedData });
        gridOD.current?.refresh();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  };

  const fetchRequiredData = async () => {
    // Settings
    await fetchSettings(kode_entitas, token)
      .then((res) => {
        setSettings(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kategori
    await FillFromSQL(kode_entitas, 'kategori')
      .then((res) => {
        const modifiedData = res.map((item: any, idx: number) => ({ ...item, kode: item.grp, id: idx++ }));
        setKategori(modifiedData);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 7 / Klasifikasi Produk
    await FillFromSQL(kode_entitas, 'kustom7', '', token)
      .then((res) => {
        setKlasifikasi(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const [preparedData, setPreparedData] = useState<any>([]);
  const handleRecordDoubleClick = (args: any) => {
    const params = {
      entitas: kode_entitas,
      tab: 'overdueStok',
      request: 'GET',
      kode_item: args.rowData.kode_item,
      kode_gudang: args.rowData.kode_gudang,
      no_item: args.rowData.no_item,
      nama_item: args.rowData.nama_item,
      nama_gudang: args.rowData.nama_gudang,
    };
    fetchPrepareDataOd({ params, token }).then((res) => {
      updateFormState('kode_item', args.rowData.kode_item);
      updateFormState('kode_gudang', args.rowData.kode_gudang);
      updateFormState('aksi', res.aksi);
      updateFormState('hasil', res.hasil);
      updateFormState('tampil', res.tampil);
      updateFormState('tgl_followup', res.tgl_followup);
      updateFormState('jenis', res.pJenis ?? 3);
      setPreparedData(res);
    });

    setShowDialogAction(true);
  };

  const handleFollowUpBtn = () => {
    if (!selectedItem.kode_item) return;
    const params = {
      entitas: kode_entitas,
      tab: 'overdueStok',
      request: 'GET',
      kode_item: selectedItem.kode_item,
      kode_gudang: selectedItem.kode_gudang,
      no_item: selectedItem.no_item,
      nama_item: selectedItem.nama_item,
      nama_gudang: selectedItem.nama_gudang,
    };

    fetchPrepareDataOd({ params, token }).then((res) => {
      updateFormState('kode_item', selectedItem.kode_item);
      updateFormState('kode_gudang', selectedItem.kode_gudang);
      updateFormState('aksi', res.aksi);
      updateFormState('hasil', res.hasil);
      updateFormState('tampil', res.tampil);
      updateFormState('tgl_followup', res.tgl_followup);
      updateFormState('jenis', res.pJenis ?? 3);
      setPreparedData(res);
    });

    setTimeout(() => {
      setShowDialogAction(true);
    }, 500);
  };

  const handleFollowup = async () => {
    const modifiedBody = {
      ...updateForm,
      aksi: updateForm.rencana !== '' ? updateForm.rencana : updateForm.aksi,
      tgl_followup: updateForm.tgl_followup2 !== '' ? updateForm.tgl_followup2 : updateForm.tgl_followup,
      tampil: updateForm.tampil === 'Y' ? 'N' : 'Y',
    };

    // console.log(modifiedBody);
    fetchPrepareDataOd({ params: modifiedBody, token }).then((res) => {
      setShowDialogAction(false);
      fetchData();
    });
  };

  const buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Simpan',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: () => {
        handleFollowup();
      },
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: () => {
        resetForm();
        setShowDialogAction(false);
      },
    },
  ];

  useEffect(() => {
    // fetchData();
    fetchRequiredData();
  }, []);

  const handleRowSelected = (args: any) => {
    setSelectedItem(args.data);
  };

  const queryCellInfo = (args: any) => {
    const { field } = args.column;

    if (field === 'stok') {
      args.cell.style.backgroundColor = '#FEDD00';
    }
    if (field === 'overdue') {
      args.cell.style.backgroundColor = '#F97AA2';
    }
    if (field === 'nilai') {
      args.cell.style.backgroundColor = '#F97AA2';
    }
    if (field === 'tgl_followup') {
      if (args.data.tgl_followup !== '') {
        args.cell.style.backgroundColor = '#ff0000';
        args.cell.style.color = '#ffffff';
      }
    }
  };

  // Grid Config
  const gridOptions = {
    /**
     * page settings menyebabkan refresh terjadi ketika row selected.
     * jadi boleh dikomen untuk mencegah refresh ketika row selected.
     */
    pageSettings: {
      pageSize: 25,
      pageCount: 5,
      pageSizes: ['25', '50', '100', 'All'],
    },
    selectionSettings: {
      mode: 'Row',
      type: 'Single',
    },
    allowPaging: true,
    allowSorting: true,
    allowFiltering: false,
    allowResizing: true,
    // autoFit: true,
    // allowReordering: true,
    rowHeight: 22,
    height: '100%',
    width: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };
  return (
    <div className="Main h-full max-w-[calc(100vw-50px)]" id="stok-overdue">
      <div className="relative flex h-[calc(100vh-260px)]">
        {/* Filter */}
        <div
          className={`absolute z-10 hidden h-full w-[320px] max-w-full flex-none space-y-4 overflow-x-hidden p-4 xl:relative xl:block xl:h-auto`}
          style={{ background: '#dedede', borderRadius: '0px !important' }}
        >
          <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
            <div className="flex h-full flex-col gap-6 overflow-y-auto overflow-x-hidden">
              <span className="font-bold">Filter :</span>
              {/* Filter List */}
              <div>
                {/* Tgl Barang */}
                <span className="text-xs">Tanggal</span>
                <div className="form-input mb-3 mt-1 flex justify-between">
                  <DatePickerComponent
                    locale="id"
                    style={{ fontSize: '12px' }}
                    cssClass="e-custom-style"
                    //   renderDayCell={onRenderDayCell}
                    enableMask={true}
                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                    showClearButton={false}
                    format="dd-MM-yyyy"
                    value={filterData.tglDok.toDate()}
                    change={(args: ChangeEventArgsCalendar) => {
                      // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                      updateStateFilter('tglDok', moment(args.value));
                      updateStateFilter('isTglChecked', true);
                    }}
                  >
                    <Inject services={[MaskedDateTime]} />
                  </DatePickerComponent>
                </div>

                {/* No Barang */}
                <div className="flex">
                  <CheckBoxComponent
                    label="No. Barang"
                    checked={filterData.isNoBarangChecked}
                    change={(args: ChangeEventArgsButton) => {
                      const value: any = args.checked;
                      updateStateFilter('isNoBarangChecked', value);
                    }}
                    style={{ borderRadius: 3, borderColor: 'gray' }}
                  />
                </div>
                <div className="mt-1 flex justify-between">
                  <div className="container form-input">
                    <TextBoxComponent
                      placeholder=""
                      value={filterData.noBarangValue}
                      input={(args: FocusInEventArgs) => {
                        const value: any = args.value;
                        updateStateFilter('noBarangValue', value);
                        updateStateFilter('isNoBarangChecked', value.length > 0);
                      }}
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div className="mt-2 flex">
                  <CheckBoxComponent
                    label="Nama Barang"
                    checked={filterData.isNamaBarangChecked}
                    change={(args: ChangeEventArgsButton) => {
                      const value: any = args.checked;
                      updateStateFilter('isNamaBarangChecked', value);
                    }}
                    style={{ borderRadius: 3, borderColor: 'gray' }}
                  />
                </div>
                <div className="mt-1 flex justify-between">
                  <div className="container form-input">
                    <TextBoxComponent
                      placeholder=""
                      value={filterData.namaBarangValue}
                      input={(args: FocusInEventArgs) => {
                        const value: any = args.value;
                        updateStateFilter('namaBarangValue', value);
                        updateStateFilter('isNamaBarangChecked', value.length > 0);
                      }}
                    />
                  </div>
                </div>

                {/* Kategori */}
                <div className="p-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Kategori</span>
                    <button className="text-xs font-semibold text-black hover:text-gray-700" onClick={handleSelectAll}>
                      {isAllSelected ? 'Hapus Pilihan' : 'Pilih Semua'}
                    </button>
                  </div>

                  <div className="h-72 overflow-x-auto overflow-y-scroll rounded bg-gray-300 p-2">
                    {kategori.map((item: any) => (
                      <div key={item.id} className="mb-1 flex items-center">
                        <input type="checkbox" id={`checkbox-${item.id}`} checked={!!checkedItems[item.id]} onChange={() => handleCheckboxChange(item.id, item.kode)} className="cursor-pointer" />
                        <label htmlFor={`checkbox-${item.id}`} className="m-0 ml-1 cursor-pointer text-xs text-gray-900">
                          {item.grp}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Klasifikasi Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label="Klasifikasi Produk"
                      checked={filterData.isKlasifikasiProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isKlasifikasiProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={klasifikasi}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('klasifikasiProdukValue', value);
                          updateStateFilter('isKlasifikasiProdukChecked', value.length > 0);
                        }}
                        value={filterData.klasifikasiProdukValue}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkbox Gudang */}
                <div className="mt-2">
                  <span className="mb-2 text-xs font-bold">Gudang</span>
                  {GudangList.map((item) => (
                    <div key={item.id} className="mt-1 flex items-center">
                      <input type="checkbox" id={`checkbox-${item.id}`} checked={!!checkedGudang[item.id]} onChange={() => handleCheckboxChangeGudang(item.id, item.kode)} className="cursor-pointer" />
                      <label htmlFor={`checkbox-${item.id}`} className="m-0 ml-1 cursor-pointer text-xs text-gray-900">
                        {item.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button type="button" onClick={fetchData} className="btn btn-primary mt-2">
                  <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                  Refresh Data
                </button>
              </div>
            </div>
          </PerfectScrollbar>
        </div>
        {/* Table */}
        <div className="h-full flex-1 overflow-auto">
          <GridComponent {...gridOptions} rowSelected={handleRowSelected} queryCellInfo={queryCellInfo} ref={gridOD} width="100%" recordDoubleClick={handleRecordDoubleClick} dataSource={data}>
            <ColumnsDirective>
              <ColumnDirective field="nama_gudang" headerText="Nama Gudang" width="140" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="no_item" headerText="No. Barang" width="80" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_item" headerText="Nama Barang" width="150" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="tebal" format={'N'} headerText="D" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="stok" format={'N'} headerText="Stok Akhir" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="overdue" format={'N'} headerText="Overdue" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="tonase" format="N" headerText="Berat (Kg)" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="berat" visible={false} format="N" headerText="Berat (Kg)" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="hari" headerText="Umur Terlama" width="70" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="hpp" format="N" headerText="HPP" width="100" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nilai" format="N" headerText="Nilai" width="100" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="tgl_buat" headerText="Tgl. Buat" width="100" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="tgl_followup" headerText="Tgl. FollowUp" width="100" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="aksi" headerText="Rencana yang akan dilakukan" width="170" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <AggregatesDirective>
              <AggregateDirective>
                <AggregateColumnsDirective>
                  <AggregateColumnDirective field="stok" type="Sum" format="N" />
                  <AggregateColumnDirective field="overdue" type="Sum" format="N" />
                  <AggregateColumnDirective field="berat" type="Sum" format="N1" />
                </AggregateColumnsDirective>
              </AggregateDirective>
            </AggregatesDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Aggregate]} />
          </GridComponent>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex bg-[#dedede]">
        <div className="w-[385px]"></div>
        <div className="w-full py-2">
          {/* Detail Stok OD */}
          <div className={`flex flex-col ${showDetail ? 'block' : 'hidden'}`}>
            <GridComponent dataSource={dataDetail} gridLines="Both" height={120}>
              <ColumnsDirective>
                <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="tgl_masuk" type="date" format={'dd-MM-yyyy'} headerText="Tgl. Masuk" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="dok" headerText="Dok" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="no_dokumen" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="jumlah" headerText="Stok OD" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="tonase" headerText="Berat (Kg)" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="umur_stok" format="N" headerText="Umur" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="harga_beli" format="N" headerText="Harga Beli" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="harga" format="N" headerText="HPP" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="nilai" format="N" headerText="Nilai" headerTextAlign="Center" textAlign="Right" />
              </ColumnsDirective>
              <AggregatesDirective>
                <AggregateDirective>
                  <AggregateColumnsDirective>
                    <AggregateColumnDirective field="jumlah" type="Sum" format="N" />
                    <AggregateColumnDirective field="tonase" type="Sum" format="N" />
                    <AggregateColumnDirective field="nilai" type="Sum" format="N" />
                  </AggregateColumnsDirective>
                </AggregateDirective>
              </AggregatesDirective>
              <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Aggregate]} />
            </GridComponent>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {/* Buttons */}
            <ButtonComponent
              id="followupstokod"
              iconCss="e-icons e-medium e-chevron-right-fill"
              cssClass="e-primary e-small"
              content="Follow Up stok OD"
              style={{ ...styleButton, width: 'auto' }}
              onClick={handleFollowUpBtn}
            />
            <ButtonComponent
              id="historiod"
              iconCss="e-icons e-medium e-chevron-right-fill"
              cssClass="e-primary e-small"
              content="Histori penanganan stok OD"
              style={{ ...styleButton, width: 'auto' }}
              onClick={() => {
                if (!selectedItem.kode_item) {
                  swal.fire({
                    icon: 'warning',
                    title: 'Peringatan',
                    text: 'Silahkan pilih item terlebih dahulu',
                    showConfirmButton: false,
                    timer: 2000,
                  });
                  return;
                }
                setShowDialogHistori(true);
              }}
            />
            {/* Checkbox */}
            <CheckBoxComponent
              label={'Tampilkan detail stok overdue'}
              checked={showDetail}
              change={(args: ChangeEventArgsButton) => {
                const value: any = args.checked;
                // setIsCatatan(value);
                setShowDetail(value);
              }}
              style={{ borderRadius: 3, borderColor: 'gray' }}
            />
          </div>
        </div>
      </div>

      {/* Dialog Action */}
      {showDialogAction && (
        <DialogComponent
          id="dialogAction"
          target="#stok-overdue"
          header={preparedData?.Caption}
          visible={showDialogAction}
          isModal
          width={'40%'}
          height={'85%'}
          close={() => setShowDialogAction(false)}
          allowDragging
          showCloseIcon
          buttons={buttonsInputData}
        >
          <div className="flex flex-col gap-2 p-2">
            {/* tgl. buat */}
            <div className="flex items-center gap-2">
              <span className="mb-2 text-sm font-bold">Tanggal Follow Up : </span>
              <input type="date" className="rounded border border-gray-300 p-2" value={updateForm.tgl_buat} readOnly />
            </div>
            {/* tgl. followup */}
            <div className="flex items-center gap-2">
              <span className="mb-2 text-sm font-bold">Estimasi Penyelesaian : </span>
              <input
                type="date"
                className="rounded border border-gray-300 p-2"
                value={updateForm.tgl_followup}
                onChange={(e) => updateFormState('tgl_followup', e.target.value)}
                readOnly={preparedData.tampil === 'Y'}
              />
            </div>
            {/* Aksi */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">Rencana atau tindakan yang akan dilakukan :</span>
              <textarea
                name="aksi"
                id=""
                className="border border-gray-500 bg-yellow-200 text-sm text-black"
                value={updateForm.aksi}
                onChange={(e) => updateFormState('aksi', e.target.value)}
                rows={10}
                readOnly={preparedData.tampil === 'Y'}
              ></textarea>
            </div>

            {/* aksi - 2 */}
            {preparedData?.tampil === 'Y' && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold">Hasil Followup :</span>
                <textarea
                  name="aksi"
                  id=""
                  onChange={(e) => updateFormState('hasil', e.target.value)}
                  value={updateForm.hasil}
                  className="border border-gray-500 bg-blue-200 text-sm text-black"
                  rows={10}
                ></textarea>
              </div>
            )}

            {/* aksi - 3 */}
            {preparedData?.tampil === 'Y' && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-red-600 underline">Rencana atau tindakan yang akan dilakukan selanjutnya :</span>
                <div className="flex items-center gap-2">
                  <span className="mb-2 text-sm font-bold">Tanggal Follow Up selanjutnya: </span>
                  <input type="date" className="rounded border border-gray-300 p-2" value={updateForm.tgl_buat2} readOnly />
                </div>
                <div className="flex items-center gap-2">
                  <span className="mb-2 text-sm font-bold">Estimasi Penyelesaian selanjutnya : </span>
                  <input type="date" className="rounded border border-gray-300 p-2" value={updateForm.tgl_followup2} onChange={(e) => updateFormState('tgl_followup2', e.target.value)} />
                </div>
                <textarea
                  name="aksi"
                  id=""
                  className="border border-gray-500 bg-blue-200 text-sm text-black"
                  onChange={(e) => updateFormState('rencana', e.target.value)}
                  value={updateForm.rencana}
                  rows={10}
                ></textarea>
              </div>
            )}
          </div>
        </DialogComponent>
      )}

      {/* Dialog Histori */}
      {showDialogHistori && (
        <DialogComponent
          id="dialogHistori"
          target="#stok-overdue"
          header={`History follow up: ${selectedItem.nama_gudang} [${selectedItem.no_item} ${selectedItem.nama_item}]`}
          visible={showDialogHistori}
          // isModal
          width={'60%'}
          height={'95%'}
          close={() => setShowDialogHistori(false)}
          allowDragging
          showCloseIcon
        >
          <div className="flex flex-col p-2">
            {/* GRID HEADER */}
            <GridComponent locale="id" ref={historiHeaderRef} dataSource={headerHistoriData} gridLines="Both" height={220}>
              <ColumnsDirective>
                <ColumnDirective field="tgl_buat" type="date" format="dd-MM-yyyy" headerText="Tgl. Follow Up" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="tgl_followup" type="date" format="dd-MM-yyyy" headerText="Est. Penyelesaian" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="aksi" headerText="Rencana atau tindakan yang akan dilakukan" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="hasil" headerText="Hasil Follow Up" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="userid" headerText="User ID" headerTextAlign="Center" textAlign="Left" />
              </ColumnsDirective>
            </GridComponent>
            {/* GRID DETAIL */}
            <div className="-mt-3 flex h-[40px] w-full items-end gap-0 overflow-x-auto overflow-y-hidden">
              {HistoriTabList.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => setTabDetail(item.key)}
                  layout // Memastikan perubahan ukuran smooth
                  animate={{
                    height: tabDetail === item.key ? '28px' : '24px', // Tinggi berbeda
                    scale: tabDetail === item.key ? 1 : 1, // Skala lebih kecil jika tidak aktif
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }} // Transisi lebih smooth
                  className={`whitespace-nowrap rounded-b-none rounded-t-md font-semibold transition-all ${
                    tabDetail === item.key
                      ? 'bg-[#dedede] px-3 py-2 text-sm text-black' // Tab aktif lebih besar
                      : 'border px-2 py-1 text-xs text-gray-500 hover:scale-100 hover:text-black' // Tab tidak aktif lebih kecil & rapat
                  }`}
                  whileTap={{ scale: 1.05 }} // Efek saat ditekan
                >
                  {item.title}
                </motion.button>
              ))}
            </div>

            <GridComponent className="mt-3" locale="id" ref={historiDetailRef} dataSource={detailHistoriData} gridLines="Both" height={120}>
              <ColumnsDirective>
                <ColumnDirective field="tgl_fj" format="dd-MM-yyyy" type="date" headerText="Tgl. Faktur" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="tgl_trxfj" format="dd-MM-yyyy" type="date" headerText="Tgl. Diterima" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="nama_relasi" headerText="Customer" headerTextAlign="Center" textAlign="Left" />
                <ColumnDirective field="qty_std" format="N" headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" />
                <ColumnDirective field="jumlah_mu" format="N0" headerText="Nilai Penjualan" headerTextAlign="Center" textAlign="Right" />
              </ColumnsDirective>
              <AggregatesDirective>
                <AggregateDirective>
                  <AggregateColumnsDirective>
                    <AggregateColumnDirective field="qty_std" type="Sum" format="N" />
                    <AggregateColumnDirective field="jumlah_mu" type="Sum" format="N" />
                  </AggregateColumnsDirective>
                </AggregateDirective>
              </AggregatesDirective>
              <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Aggregate]} />
            </GridComponent>
          </div>
        </DialogComponent>
      )}

      {/* Loader */}
      {isLoading && <Loader />}
    </div>
  );
};

export default DataStokOverdue;

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
  Toolbar,
  CellEditArgs,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent, ChangeEventArgs } from '@syncfusion/ej2-react-dropdowns';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { faArrowsRotate, faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FillFromSQL } from '@/utils/routines';
import { fetchAnalisaStok, fetchDetailAktualStok, fetchDetailSoltSol, fetchDetailStokGudang, fetchSettings, getListGudang, updatePartialAnalisaStok } from '../../api';
import swal from 'sweetalert2';
import Draggable from 'react-draggable';
import ModalBaruPp from '@/pages/kcn/ERP/purchase/pp/modal/pilihbaru';
import JenisTransaksi from '@/pages/kcn/ERP/purchase/po/modal/jenisTransaksi';

import styles from '../../pengadaan.module.css';
import moment from 'moment';
import DialogBaruEditPersediaan from '@/pages/kcn/ERP/master/daftarPersediaan/components/dialog/DialogBaruEditPersediaan';
import DialogKartuStok from '@/pages/kcn/ERP/master/daftarPersediaan/components/dialog/DialogKartuStok';
import Loader from '../Loader';
import KartuStockGudang from '@/pages/kcn/ERP/inventory/informasi-stok-aktual/modal/KartuStockGudang';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';
type AnalisaStokProps = {
  kode_entitas: string;
  token: string;
};

const AnalisaStok = ({ kode_entitas, token }: AnalisaStokProps) => {
  // Master State Management
  const [data, setData] = useState([]);
  const [settings, setSettings] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [merek, setMerek] = useState([]);
  const [jenis, setJenis] = useState([]);
  const [golongan, setGolongan] = useState([]);
  const [klasifikasi, setKlasifikasi] = useState([]);
  const [warna, setWarna] = useState([]);
  const [motif, setMotif] = useState([]);

  const [showDialogPo, setShowDialogPo] = useState(false);
  const [showDialogPp, setShowDialogPp] = useState(false);
  const [showDialogKartuStok, setShowDialogKartuStok] = useState(false);
  const [showKartuStokGudang, setShowKartuStokGudang] = useState(false);
  const [stateStokAll, setStateStokAll] = useState({
    tanggal_awal_stok_all: moment(),
    tanggal_akhir_stok_all: moment().endOf('month'),
    no_barang_stok_all: '',
    nama_barang_stok_all: '',
    isNamaBarang: false,
  });

  const [selectedItem, setSelectedItem] = useState<any>({});
  const [isCatatan, setIsCatatan] = useState(false);

  // Filter State Management
  const [checkedItems, setCheckedItems] = useState<any>({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [filterData, setFilterData] = useState({
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarangValue: '',
    isNamaBarangChecked: false,
    kelompokProdukValue: '',
    isKelompokProdukChecked: false,
    merekValue: '',
    isMerekChecked: false,
    jenisProdukValue: '',
    isJenisProdukChecked: false,
    golonganProdukValue: '',
    isGolonganProdukChecked: false,
    klasifikasiProdukValue: '',
    isKlasifikasiProdukChecked: false,
    warnaProdukValue: '',
    isWarnaProdukChecked: false,
    motifProdukValue: '',
    isMotifProductChecked: false,
    isKurangStok: false,
    tipe: 'Persediaan',
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

  const handleRowSelected = (args: any) => {
    console.log('arssa: ', args.data);
    const newData = {
      ...args.data,
      kode_barang: args.data.kode_item,
    };
    setSelectedItem(newData);
  };

  const [showSolSotl, setShowSolSotl] = useState(false);
  const [detailSotl, setDetailSotl] = useState([]);
  const [detailStok, setDetailStok] = useState([]);
  const [detailStokGudang, setDetailStokGudang] = useState([]);
  const [showDetailStok, setShowDetailStok] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedPabrikData, setSelectedPabrikData] = useState<any>({});
  const [showDialogPersediaan, setShowDialogPersediaan] = useState(false);

  const handleRecordDoubleClick = async (args: any) => {
    if (args.column.field === 'sotl' || args.column.field === 'sol') {
      setDialogType('solsotl');
      if (args.rowData.sol === 0 && args.rowData.sotl === 0) {
        swal.fire({
          icon: 'warning',
          title: `Barang ${args.rowData.nama_item} belum ada order penjualan`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }
      const params = {
        param1: 'SOLTSOL',
        param2: args.rowData.kode_item,
        param3: args.column.field,
        entitas: kode_entitas,
      };

      await fetchDetailSoltSol({ params, token }).then((res: any) => {
        const modifiedData = res.map((item: any) => ({
          ...item,
          stok: parseFloat(item.stok),
        }));
        setDetailSotl(modifiedData);
        setShowSolSotl(true);
      });
    } else if (args.column.field === 'stok_internal' || args.column.field === 'stok_ekternal' || args.column.field === 'stok_cabang') {
      setDialogType('stok_all');
      const { stok_internal, stok_ekternal, stok_cabang, nama_item, kode_item } = args.rowData;

      if (stok_internal === 0 && args.column.field === 'stok_internal') {
        swal.fire({
          icon: 'warning',
          title: `Barang ${nama_item} stok tidak tersedia`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }

      if (stok_ekternal === 0 && args.column.field === 'stok_ekternal') {
        swal.fire({
          icon: 'warning',
          title: `Barang ${nama_item} stok tidak tersedia`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }

      if (stok_cabang === 0 && args.column.field === 'stok_cabang') {
        swal.fire({
          icon: 'warning',
          title: `Barang ${nama_item} stok tidak tersedia`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }
      const params = {
        entitas: kode_entitas,
        param1: kode_item,
        param2: moment().format('YYYY-MM-DD'),
      };

      await fetchDetailAktualStok({ params, token }).then(async (res: any) => {
        let filterData;
        if (args.column.field === 'stok_internal') {
          filterData = res.filter((item: any) => item.jenis_gudang === 'I');
        } else if (args.column.field === 'stok_ekternal') {
          filterData = res.filter((item: any) => item.jenis_gudang === 'E');
        } else if (args.column.field === 'stok_cabang') {
          filterData = res.filter((item: any) => item.jenis_gudang === 'C');
        } else {
          filterData = res;
        }

        setDetailStok(filterData);
        setShowDetailStok(true);

        const isMb = filterData[0].nama_gudang.toLowerCase().includes('customer') || filterData[0].nama_gudang.toLowerCase().includes('transit');

        const params = {
          entitas: kode_entitas,
          param1: 0,
          param2: moment(filterData[0].tanggal).format('YYYY-MM-DD'),
          param3: filterData[0].kode_gudang,
          param4: filterData[0].kode_item,
          param5: isMb ? filterData[0].nama_gudang : filterData[0].stok,
          param6: isMb ? 'MB' : 'FIFO',
        };
        await fetchDetailStokGudang({ params, token }).then((res: any) => {
          setDetailStokGudang(res);
        });
      });
    } else if (args.column.field === 'stok_pabrik') {
      setDialogType('stok_pabrik');
      if (args.rowData.stok_pabrik === 0) {
        swal.fire({
          icon: 'warning',
          title: `Barang ${args.rowData.nama_item} stok tidak tersedia`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }

      const params = {
        entitas: kode_entitas,
        param1: args.rowData.kode_item,
        param2: moment().format('YYYY-MM-DD'),
      };

      await fetchDetailAktualStok({ params, token }).then((res: any) => {
        let filterData;
        if (args.column.field === 'stok_pabrik') {
          filterData = res.filter((item: any) => item.jenis_gudang === 'P');
        } else {
          filterData = res;
        }

        setDetailStok(filterData);
        setShowDetailStok(true);

        const params = {
          entitas: kode_entitas,
          param1: 1,
          param2: moment(res.tanggal).format('YYYY-MM-DD'),
          param3: filterData[0].nama_item,
          param4: filterData[0].nama_gudang,
        };

        fetchDetailStokGudang({ params, token }).then((res: any) => {
          setDetailStokGudang(res);
        });
      });
    } else if (args.column.field === 'po') {
      setDialogType('po');
      if (args.rowData.po === 0) {
        swal.fire({
          icon: 'warning',
          title: `Barang ${args.rowData.nama_item} belum ada order pembelian`,
          showConfirmButton: false,
          timer: 2000,
          target: '#main-target',
        });
        return;
      }
      const params = {
        param1: 'PO',
        param2: args.rowData.kode_item,
        entitas: kode_entitas,
      };

      await fetchDetailSoltSol({ params, token }).then((res: any) => {
        const modifiedData = res.map((item: any) => ({
          ...item,
          stok: parseFloat(item.stok),
        }));
        setDetailSotl(modifiedData);
        setShowSolSotl(true);
      });
    } else if (args.column.field === 'nama_item') {
      setShowDialogPersediaan(true);
    }
  };

  const [listGudang, setlistGudang] = useState<any>([]);
  const getAllGudang = async () => {
    try {
      const response = await getListGudang(kode_entitas, token);
      const filteredGudang = response.sort((a: any, b: any) => a.nama_gudang.localeCompare(b.nama_gudang));

      setlistGudang(filteredGudang.filter((item: any) => item.aktif == 'Y'));
    } catch (error) {
      console.log();
    }
  };

  const getDetailStok = () => {
    const params = {
      entitas: kode_entitas,
      param1: 1,
      param2: moment(selectedPabrikData.tanggal).format('YYYY-MM-DD'),
      param3: selectedPabrikData.nama_item,
      param4: selectedPabrikData.nama_gudang,
    };

    fetchDetailStokGudang({ params, token }).then((res: any) => {
      setDetailStokGudang(res);
    });
  };

  useEffect(() => {
    if (selectedPabrikData?.nama_item) {
      getDetailStok();
    }
  }, [selectedPabrikData]);

  const analisaGridRef = useRef<GridComponent | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    // param3: filterData.isNoPbChecked ? filterData.noPbValue : 'all',
    const params = {
      entitas: kode_entitas,
      param1: 3,
      param2: filterData.isKurangStok ? 'Y' : 'N',
      param3: filterData.isNoBarangChecked ? filterData.noBarangValue : 'all',
      param4: filterData.isNamaBarangChecked ? filterData.namaBarangValue : 'all',
      param5: Object.values(checkedItems).join(';'),
      param6: filterData.isKelompokProdukChecked ? filterData.kelompokProdukValue : 'all',
      param7: filterData.isMerekChecked ? filterData.merekValue : 'all',
      param8: filterData.isJenisProdukChecked ? filterData.jenisProdukValue : 'all',
      param9: filterData.isGolonganProdukChecked ? filterData.golonganProdukValue : 'all',
      param10: filterData.isKlasifikasiProdukChecked ? filterData.klasifikasiProdukValue : 'all',
      param11: filterData.isWarnaProdukChecked ? filterData.warnaProdukValue : 'all',
      param12: filterData.isMotifProductChecked ? filterData.motifProdukValue : 'all',
      param13: filterData.tipe,
    };
    try {
      setIsLoading(true);
      const res = await fetchAnalisaStok(params, token);
      const modifiedData = res.map((item: any) => ({
        ...item,
        sol: parseFloat(item.sol),
        sotl: parseFloat(item.sotl),
      }));
      setData(modifiedData);
      analisaGridRef.current?.setProperties({ dataSource: modifiedData });
      analisaGridRef.current?.refresh();
    } catch (error) {
      console.log('error get data analisa stok: ', error);
    } finally {
      setIsLoading(false);
    }
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

    // Kelompok
    await FillFromSQL(kode_entitas, 'kelompok')
      .then((res) => {
        const modifiedData = res.map((item: any, idx: number) => ({ ...item }));
        setKelompok(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Merek
    await FillFromSQL(kode_entitas, 'merk')
      .then((res) => {
        const modifiedData = res.map((item: any, idx: number) => ({ ...item }));
        setMerek(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 9 / Jenis Produk
    await FillFromSQL(kode_entitas, 'kustom9', '', token)
      .then((res) => {
        setJenis(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 8 / Golongan Produk
    await FillFromSQL(kode_entitas, 'kustom8', '', token)
      .then((res) => {
        setGolongan(res);
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

    // Kustom 6 / Warna Produk
    await FillFromSQL(kode_entitas, 'kustom6', '', token)
      .then((res) => {
        setWarna(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 5 / Motif Produk
    await FillFromSQL(kode_entitas, 'kustom5', '', token)
      .then((res) => {
        setMotif(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const setQueryCellInfo = (args: any) => {
    if (
      args.column.field === 'stokstd_in' ||
      args.column.field === 'stokstd_pab' ||
      args.column.field === 'buffer_in' ||
      args.column.field === 'buffer_pab' ||
      args.column.field === 'bufmax_in' ||
      args.column.field === 'bufmax_pab'
    ) {
      args.cell.style.backgroundColor = '#25F300';
    }

    if (args.column.field === 'keterangan') {
      args.cell.style.backgroundColor = '#FEDD00';
    }
  };

  useEffect(() => {
    // fetchData();
    fetchRequiredData();
    getAllGudang();
  }, []);

  // Grid Config
  const gridOptions = {
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
    autoFit: true,
    allowReordering: true,
    rowHeight: 22,
    height: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };

  const cellEdit = (args: CellEditArgs) => {
    const { columnName: field } = args;
    if (field === 'stokstd_in' || field === 'stokstd_pab' || field === 'keterangan' || field === 'buffer_in' || field === 'buffer_pab' || field === 'bufmax_in' || field === 'bufmax_pab') {
      args.cancel = false;
    } else {
      args.cancel = true;
    }
  };

  const save = async (args: any) => {
    const { columnName: field } = args;

    const params = {
      entitas: kode_entitas,
      tab: 'analisaStok',
      kode_supp: args.rowData.kode_supp,
      reorder: args.rowData.reorder,
      rating: args.rowData.rating,
      estimasipo: args.rowData.estimasipo,
      stokstd_in: args.rowData.stokstd_in,
      stokstd_pab: args.rowData.stokstd_pab,
      buffer_in: args.rowData.buffer_in,
      buffer_out: args.rowData.buffer_out,
      buffer_pab: args.rowData.buffer_pab,
      bufmax_in: args.rowData.bufmax_in,
      bufmax_out: args.rowData.bufmax_out,
      bufmax_pab: args.rowData.bufmax_pab,
      minimal: args.rowData.minimal,
      minimal_out: args.rowData.minimal_out,
      minimal_pab: args.rowData.minimal_pab,
      maksimal: args.rowData.maksimal,
      maksimal_out: args.rowData.maksimal_out,
      maksimal_pab: args.rowData.maksimal_pab,
      keterangan: args.rowData.keterangan,
      userid: args.rowData.userid,
      tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
      kode_item: args.rowData.kode_item,
    };

    if (field === 'stokstd_in') {
      params.stokstd_in = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'stokstd_pab') {
      params.stokstd_pab = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'keterangan') {
      params.keterangan = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'buffer_in') {
      params.buffer_in = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'buffer_pab') {
      params.buffer_pab = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'bufmax_in') {
      params.bufmax_in = args.value;
      updatePartialAnalisaStok({ params, token });
    } else if (field === 'bufmax_pab') {
      params.bufmax_pab = args.value;
      updatePartialAnalisaStok({ params, token });
    }

    // setTimeout(() => {
    //   fetchData();
    // }, 300);
  };

  const handleActionBegin = (args: any) => {
    if (args.requestType === 'save') {
      const params = {
        entitas: kode_entitas,
        tab: 'analisaStok',
        kode_supp: args.data.kode_supp,
        reorder: args.data.reorder,
        rating: args.data.rating,
        estimasipo: args.data.estimasipo,
        stokstd_in: args.data.stokstd_in,
        stokstd_pab: args.data.stokstd_pab,
        buffer_in: args.data.buffer_in,
        buffer_out: args.data.buffer_out,
        buffer_pab: args.data.buffer_pab,
        bufmax_in: args.data.bufmax_in,
        bufmax_out: args.data.bufmax_out,
        bufmax_pab: args.data.bufmax_pab,
        minimal: args.data.minimal,
        minimal_out: args.data.minimal_out,
        minimal_pab: args.data.minimal_pab,
        maksimal: args.data.maksimal,
        maksimal_out: args.data.maksimal_out,
        maksimal_pab: args.data.maksimal_pab,
        keterangan: args.data.keterangan,
        userid: args.data.userid,
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        kode_item: args.data.kode_item,
      };
      updatePartialAnalisaStok({ params, token });
      setTimeout(() => {
        fetchData();
      }, 300);
    }
  };
  return (
    <div className="Main h-full max-w-[calc(100vw-50px)]">
      <div className="relative flex h-[calc(100vh-180px)]">
        {/* Filter */}
        <div
          className={`panel absolute z-10 block h-full w-[20%] max-w-full flex-none space-y-4 overflow-x-hidden p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto`}
          style={{ background: '#dedede' }}
        >
          <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
            <div className="flex h-full flex-col gap-6 overflow-y-auto overflow-x-hidden">
              <span className="font-bold">Filter :</span>
              {/* Filter List */}
              <div>
                <div className="mb-2">
                  <div className="flex">
                    {/* <CheckBoxComponent
                      label="Kelompok Produk"
                      checked={filterData.isKelompokProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isKelompokProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    /> */}
                    <span>Tipe</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <DropDownListComponent
                        id="tipe"
                        className="form-select"
                        dataSource={['Persediaan', 'Non Persediaan']}
                        // fields={{ value: 'kel', text: 'kel' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('tipe', value);
                        }}
                        value={filterData.tipe}
                      />
                    </div>
                  </div>
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

                {/* Kelompok Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label="Kelompok Produk"
                      checked={filterData.isKelompokProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isKelompokProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <ComboBoxComponent
                        autofill
                        showClearButton={false}
                        id="kelompok"
                        className="form-select"
                        dataSource={kelompok}
                        fields={{ value: 'kel', text: 'kel' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: any) => {
                          const value = args.value;
                          updateStateFilter('kelompokProdukValue', value);
                          updateStateFilter('isKelompokProdukChecked', value.length > 0);
                        }}
                        value={filterData.kelompokProdukValue}
                      />
                      {/* <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={kelompok}
                        fields={{ value: 'kel', text: 'kel' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('kelompokProdukValue', value);
                          updateStateFilter('isKelompokProdukChecked', value.length > 0);
                        }}
                        value={filterData.kelompokProdukValue}
                      /> */}
                    </div>
                  </div>
                </div>

                {/* Merek Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label="Merek Produk"
                      checked={filterData.isMerekChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isMerekChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <ComboBoxComponent
                        autofill
                        showClearButton={false}
                        id="merek"
                        className="form-select"
                        dataSource={merek}
                        fields={{ value: 'merk', text: 'merk' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: any) => {
                          const value = args.value;
                          updateStateFilter('merekValue', value);
                          updateStateFilter('isMerekChecked', value?.length > 0 ? true : false);
                        }}
                        value={filterData.merekValue}
                      />
                      {/* <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={merek}
                        fields={{ value: 'merk', text: 'merk' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('merekValue', value);
                          updateStateFilter('isMerekChecked', value.length > 0);
                        }}
                        value={filterData.merekValue}
                      /> */}
                    </div>
                  </div>
                </div>

                {/* Jenis Produk / Kustom 9 */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label={settings?.[0]?.['item_kustom9']}
                      checked={filterData.isJenisProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isJenisProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={jenis}
                        fields={{ value: 'str', text: 'str' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('jenisProdukValue', value);
                          updateStateFilter('isJenisProdukChecked', value.length > 0);
                        }}
                        value={filterData.jenisProdukValue}
                      />
                    </div>
                  </div>
                </div>

                {/* Golongan Produk / Kustom 8 */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label={settings?.[0]?.['item_kustom8']}
                      checked={filterData.isGolonganProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isGolonganProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={golongan}
                        fields={{ value: 'str', text: 'str' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('golonganProdukValue', value);
                          updateStateFilter('isGolonganProdukChecked', value.length > 0);
                        }}
                        value={filterData.golonganProdukValue}
                      />
                    </div>
                  </div>
                </div>

                {/* Klasifikasi Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label={settings?.[0]?.['item_kustom7']}
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
                        fields={{ value: 'str', text: 'str' }}
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

                {/* Warna Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label={settings?.[0]?.['item_kustom6']}
                      checked={filterData.isWarnaProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isWarnaProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={warna}
                        fields={{ value: 'str', text: 'str' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('warnaProdukValue', value);
                          updateStateFilter('isWarnaProdukChecked', value.length > 0 ? true : false);
                        }}
                        value={filterData.warnaProdukValue}
                      />
                    </div>
                  </div>
                </div>

                {/* Motif Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label={settings?.[0]?.['item_kustom5']}
                      checked={filterData.isMotifProductChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isMotifProductChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <ComboBoxComponent
                        autofill
                        showClearButton={false}
                        id="motifproduk"
                        className="form-select"
                        dataSource={motif}
                        fields={{ value: 'str', text: 'str' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: any) => {
                          const value = args.value;
                          updateStateFilter('motifProdukValue', value);
                          updateStateFilter('isMotifProductChecked', value.length > 0);
                        }}
                        value={filterData.motifProdukValue}
                      />
                      {/* <DropDownListComponent
                        id="statuspelunasan"
                        className="form-select"
                        dataSource={motif}
                        fields={{ value: 'str', text: 'str' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateStateFilter('motifProdukValue', value);
                          updateStateFilter('isMotifProductChecked', value.length > 0);
                        }}
                        value={filterData.motifProdukValue}
                      /> */}
                    </div>
                  </div>
                </div>

                {/* Kurang dan Stok Minimal */}
                <div className="mt-1 flex w-[calc(100%-20px)]">
                  <CheckBoxComponent
                    label="Kekurangan dan Stok Minimal memperhitungkan penjualan cabang"
                    checked={filterData.isKurangStok}
                    change={(args: ChangeEventArgsButton) => {
                      const value: any = args.checked;

                      updateStateFilter('isKurangStok', value);
                    }}
                    style={{ borderRadius: 3, borderColor: 'gray' }}
                  />
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <button type="button" onClick={fetchData} className="btn btn-primary mt-2 w-[200px]">
                  <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                  Refresh Data
                </button>
                <button type="button" onClick={() => setShowDialogPp(true)} className="btn btn-primary mt-2 w-[200px]">
                  <FontAwesomeIcon icon={faFile} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                  Permintaan Baru
                </button>
                <button type="button" onClick={() => setShowDialogPo(true)} className="btn btn-primary mt-2 w-[200px]">
                  <FontAwesomeIcon icon={faFile} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                  PO Baru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedItem.kode_item) {
                      swal.fire({
                        title: 'Silahkan pilih data terlebih dahulu',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                      });
                      return;
                    }
                    setShowDialogKartuStok(true);
                  }}
                  className="btn btn-primary mt-2 w-[200px]"
                >
                  Kartu Stok
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedItem.kode_barang) {
                      withReactContent(swalToast).fire({
                        icon: 'info',
                        title: 'Silahkan pilih data terlebih dahulu',
                        timer: 2000,
                      });
                      return;
                    }
                    setShowKartuStokGudang(true);
                  }}
                  className="btn btn-primary mt-2 w-[200px] disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  Kartu Stok Gudang
                </button>
              </div>
            </div>
          </PerfectScrollbar>
        </div>
        {/* Table */}
        <div className="flex h-full flex-1 flex-col overflow-auto">
          <GridComponent
            {...gridOptions}
            editSettings={{ allowEditing: true, mode: 'Normal' }}
            queryCellInfo={setQueryCellInfo}
            recordDoubleClick={handleRecordDoubleClick}
            rowSelected={handleRowSelected}
            width="100%"
            dataSource={data}
            // cellEdit={cellEdit}
            // cellSaved={save}
            actionBegin={handleActionBegin}
            ref={analisaGridRef}
            // toolbar={toolbarOptions}
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_item" headerText="Nama Barang" width="170" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" allowEditing={false} />
              <ColumnDirective
                headerText="Penjualan 30 HKE (R/H)"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                columns={[
                  {
                    field: 'rata_sekarang_in',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                  {
                    field: 'rata_sekarang_out',
                    format: 'N0',
                    headerText: 'Eksternal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                ]}
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'sotl',
                    format: 'N0',
                    headerText: 'Gudang',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                  {
                    field: 'sol',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                ]}
                headerText="SO Outstanding"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'qty_target',
                    format: 'N0',
                    headerText: 'Target',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                  {
                    field: 'qty_real',
                    format: 'N0',
                    headerText: 'Realisasi',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                ]}
                headerText="Penjualan"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'stokstd_in',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                  },
                  {
                    field: 'stokstd_pab',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                  },
                ]}
                headerText="Stok Minimal Standar"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'minimal',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                  {
                    field: 'minimal_pab',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                ]}
                headerText="STOK MINIMAL"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'maksimal',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                  {
                    field: 'maksimal_pab',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '70',
                    allowEditing: false,
                  },
                ]}
                headerText="STOK MAKSIMAL"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'stok_internal',
                    format: 'N2',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                    allowEditing: false,
                  },
                  {
                    field: 'stok_ekternal',
                    format: 'N2',
                    headerText: 'Eksternal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                    allowEditing: false,
                  },
                  {
                    field: 'stok_cabang',
                    format: 'N2',
                    headerText: 'Cabang',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                    allowEditing: false,
                  },
                  {
                    field: 'stok_pabrik',
                    format: 'N2',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                    allowEditing: false,
                  },
                ]}
                headerText="Jumlah Stok"
                width="140"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective field="keterangan" headerText="Catatan" width="170" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="po" format="N0" headerText="PO Outstanding" width="100" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" allowEditing={false} />
              <ColumnDirective
                field="jual_tinggi"
                format="N0"
                headerText="Penjualan/Hari Tertinggi"
                width="100"
                headerTextAlign="Center"
                textAlign="Right"
                clipMode="EllipsisWithTooltip"
                allowEditing={false}
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'buffer_in',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                  },
                  {
                    field: 'buffer_pab',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                  },
                ]}
                headerText="Buffer Stok Minimal"
                width="100"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                columns={[
                  {
                    field: 'bufmax_in',
                    format: 'N0',
                    headerText: 'Internal',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                  },
                  {
                    field: 'bufmax_pab',
                    format: 'N0',
                    headerText: 'Pabrik',
                    headerTextAlign: 'Center',
                    textAlign: 'Right',
                    width: '80',
                  },
                ]}
                headerText="Buffer Stok Maksimal"
                width="100"
                headerTextAlign="Center"
                textAlign="Center"
                clipMode="EllipsisWithTooltip"
              />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Toolbar]} />
          </GridComponent>
        </div>
        {/* style={{ background: '#dedede' }} */}
      </div>
      <div className="flex bg-[#dedede]">
        <div className="w-[20%]"></div>
        <div className=" w-[80%] py-2">
          {/* Catatan */}
          <div className={`flex flex-col ${isCatatan ? 'block' : 'hidden'}`}>
            <span className="border border-black bg-[#dedede] px-2 py-1 text-black">
              {selectedItem?.catatanMemo === null ? `Tidak ada catatan untuk item : ${selectedItem?.nama_item}` : `${selectedItem?.nama_item}`}
            </span>
            <textarea className="" value={selectedItem?.catatanMemo} readOnly rows={3}></textarea>
          </div>

          {/* Checkbox */}
          <CheckBoxComponent
            label={'Tampilkan catatan'}
            checked={isCatatan}
            change={(args: ChangeEventArgsButton) => {
              const value: any = args.checked;
              setIsCatatan(value);
              // updateStateFilter('isKlasifikasiProdukChecked', value);
            }}
            style={{ borderRadius: 3, borderColor: 'gray' }}
          />
        </div>
      </div>

      {/* Dialog SOL / SOTL */}
      {showSolSotl && (
        <Draggable>
          <div className={`${styles.modalDetailDragable}`} style={{ top: '3%', right: '2%', width: '100%', background: '#dedede' }}>
            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
              <div style={{ marginBottom: 21 }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>Detail Order Penjualan (Kirim Gudang)</span>
              </div>
              <GridComponent dataSource={detailSotl} width={'100%'} height={200} rowHeight={30} gridLines={'Both'} allowSorting={true}>
                <ColumnsDirective>
                  <ColumnDirective field="no_sp" headerText={dialogType == 'po' ? 'No. PO' : 'No. SO'} width="100" headerTextAlign="Center" textAlign="Left" />
                  <ColumnDirective field="tgl_sp" format="dd-MM-yyyy" type="date" headerText="Tanggal" width="100" headerTextAlign="Center" textAlign="Left" />
                  <ColumnDirective field="nama_relasi" headerText={dialogType == 'po' ? 'Supplier' : 'Customer'} width="100" headerTextAlign="Center" textAlign="Left" />
                  <ColumnDirective field="tgl_kirim" format="dd-MM-yyyy" type="date" headerText="Tgl. Est Dikirim" width="100" headerTextAlign="Center" textAlign="Left" />
                  <ColumnDirective field="stok" format="N" headerText="Jumlah" width="100" headerTextAlign="Center" textAlign="Right" />
                </ColumnsDirective>
                <AggregatesDirective>
                  <AggregateDirective>
                    <AggregateColumnsDirective>
                      <AggregateColumnDirective field="stok" type="Sum" />
                    </AggregateColumnsDirective>
                  </AggregateDirective>
                </AggregatesDirective>
                <Inject services={[Page, Sort, Filter, Group, Aggregate]} />
              </GridComponent>
            </div>
            <button
              className={`${styles.closeButtonDetailDragable}`}
              onClick={() => {
                setShowSolSotl(false);
              }}
            >
              <FontAwesomeIcon icon={faTimes} width="18" height="18" />
            </button>
          </div>
        </Draggable>
      )}

      {/* Dialog Stok */}
      {showDetailStok && (
        <Draggable>
          <div className={`${styles.modalDetailDragable}`} style={{ top: '3%', right: '2%', width: '100%', background: '#dedede' }}>
            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
              <div style={{ marginBottom: 21 }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>Detail Stok per Gudang</span>
              </div>
              <div className="flex">
                {/* Grid Gudang */}
                <div className="w-[30%]">
                  <GridComponent
                    rowSelected={(args: any) => setSelectedPabrikData(args.data)}
                    dataSource={detailStok}
                    width={'100%'}
                    height={200}
                    rowHeight={30}
                    gridLines={'Both'}
                    allowSorting={true}
                  >
                    <ColumnsDirective>
                      <ColumnDirective field="nama_gudang" headerText="Gudang" width={100} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="stok" format="N" headerText="Jml Stok" width={70} headerTextAlign="Center" textAlign="Right" />
                      <ColumnDirective field="hari" format="N" headerText="Umur Terlama" width={70} headerTextAlign="Center" textAlign="Right" />
                    </ColumnsDirective>
                  </GridComponent>
                </div>
                {/* Grid Item */}
                <div className="w-[70%]">
                  <GridComponent dataSource={detailStokGudang} width={'100%'} height={200} rowHeight={30} gridLines={'Both'} allowSorting={true}>
                    <ColumnsDirective>
                      <ColumnDirective field="tanggal" headerText="Tanggal" width={80} type="date" format="dd-MM-yyyy" headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="dokumen" visible={dialogType == 'stok_pabrik' ? false : true} headerText="Ref." width={50} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="noref" visible={dialogType == 'stok_pabrik' ? false : true} headerText="No. Dokumen" width={120} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="no_kontrak" headerText="No. Referensi" width={120} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="nopol" visible={dialogType == 'stok_pabrik' ? false : true} headerText="No. Kendaraan" width={100} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective
                        field="jumlah"
                        visible={dialogType == 'stok_pabrik' ? false : true}
                        headerText="Jumlah Transaksi"
                        format="N"
                        width={70}
                        headerTextAlign="Center"
                        textAlign="Right"
                      />
                      <ColumnDirective field={dialogType === 'stok_pabrik' ? 'qty_sisa' : 'kuantitas'} headerText="Sisa Stok" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
                      <ColumnDirective field="hari" visible={dialogType == 'stok_pabrik' ? false : true} headerText="Umur di gudang" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
                      <ColumnDirective field="umur_beli" headerText="Umur dari PB" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
                    </ColumnsDirective>
                  </GridComponent>
                </div>
              </div>
            </div>
            <button
              className={`${styles.closeButtonDetailDragable}`}
              onClick={() => {
                setShowDetailStok(false);
                // console.log(selectedPabrikData);
              }}
            >
              <FontAwesomeIcon icon={faTimes} width="18" height="18" />
            </button>
          </div>
        </Draggable>
      )}

      {/* Dialog Frm Persediaan */}
      {showDialogPersediaan && (
        <DialogBaruEditPersediaan
          isOpen={showDialogPersediaan}
          onClose={() => setShowDialogPersediaan(false)}
          masterState="EDIT"
          userid=""
          entitas={kode_entitas}
          token={token}
          itemId={selectedItem.kode_item}
        />
      )}

      {/* Dialog Frm PP */}
      {showDialogPp && (
        <ModalBaruPp
          isOpen={showDialogPp}
          onClose={() => setShowDialogPp(false)}
          date1={moment()}
          date2={moment().endOf('month')}
          tipeDokumen={'ya'}
          tipeForm="dashboard"
          onSelectData={(selectedData: any) => {}}
        />
      )}
      {/* Dialog Frm PO */}
      <JenisTransaksi
        isOpen={showDialogPo}
        onClose={() => setShowDialogPo(false)}
        date1={moment()}
        date2={moment().endOf('month')}
        dateberlaku1={moment()}
        dateberlaku2={moment().endOf('month')}
        datekirim1={moment()}
        datekirim2={moment().endOf('month')}
        tipeDokumen={'yes'}
        noPOValue={''}
        namaSuppValue={''}
        namaBarangValue={''}
        isNoPOChecked={false}
        isNamaSuppChecked={false}
        isNamaBarangChecked={false}
        isTanggalChecked={false}
        statusAppValue={''}
        statusDokValue={''}
        tipeForm="dashboard"
        onSelectData={(selectedData: any) => {}}
      />
      {/* Dialog Kartu Stok */}
      {showDialogKartuStok && <DialogKartuStok isOpen={showDialogKartuStok} onClose={() => setShowDialogKartuStok(false)} entitas={kode_entitas} token={token} itemId={selectedItem.kode_item} />}
      {/* Dialog Kartu Stok Gdg */}
      {showKartuStokGudang && (
        <KartuStockGudang
          visible={showKartuStokGudang}
          onClose={() => setShowKartuStokGudang(false)}
          stateStokAll={stateStokAll}
          setStateStokAll={setStateStokAll}
          listGudang={listGudang}
          selectedRow={selectedItem}
        />
      )}
      {/* Loader */}
      {isLoading && <Loader />}
    </div>
  );
};

export default AnalisaStok;

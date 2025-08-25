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
  CellEditArgs,
  AggregatesDirective,
  AggregateDirective,
  AggregateColumnsDirective,
  AggregateColumnDirective,
  Aggregate,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { listDokumenStok, mockData } from '../../constants';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fetchDetailAktualStok,
  fetchDetailHistoryOd,
  fetchDetailStokGudang,
  fetchGudangTransit,
  fetchPrepareDataOd,
  fetchSettings,
  getSettingTelegram,
  sendTelegramMessage,
  sendWhatsappMessage,
} from '../../api';
import { FillFromSQL } from '@/utils/routines';
import { headerRataHari, headerUmurStok } from './template';
import moment from 'moment';

import Draggable from 'react-draggable';

import styles from '../../pengadaan.module.css';
import DialogBaruEditPersediaan from '@/pages/kcn/ERP/master/daftarPersediaan/components/dialog/DialogBaruEditPersediaan';
import { handleKirimPesan } from '../../functions/handleKirimPesan';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';
import Swal from 'sweetalert2';

type InfoGudangTransitProps = {
  kode_entitas: string;
  token: string;
};

const InfoGudangTransit = ({ kode_entitas, token }: InfoGudangTransitProps) => {
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

  const [checkedHari, setCheckedHari] = useState({
    ch5: false,
    ch7: false,
    chUp: false,
  });

  const updateStateHari = (field: any, value: any) => {
    setCheckedHari((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [showDialogAvg, setShowDialogAvg] = useState(false);

  const gridTransitRef = useRef<GridComponent | null>(null);

  // Filter State Management
  const [filterData, setFilterData] = useState({
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarangValue: '',
    isNamaBarangChecked: false,
    kategoriProdukValue: '',
    isKategoriProdukChecked: false,
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
    kelompokTransaksiValue: '',
    isKelompokTransaksiChecked: false,
    isKurangStok: false,
  });

  const updateStateFilter = (field: any, value: any) => {
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Data
  const fetchData = async () => {
    const params = {
      entitas: kode_entitas,
      param1: filterData.isNoBarangChecked ? filterData.noBarangValue : 'all',
      param2: filterData.isNamaBarangChecked ? filterData.namaBarangValue : 'all',
      param3: filterData.isKategoriProdukChecked ? filterData.kategoriProdukValue : 'all',
      param4: filterData.isKelompokProdukChecked ? filterData.kelompokProdukValue : 'all',
      param5: filterData.isMerekChecked ? filterData.merekValue : 'all',
      param6: filterData.isJenisProdukChecked ? filterData.jenisProdukValue : 'all',
      param7: filterData.isGolonganProdukChecked ? filterData.golonganProdukValue : 'all',
      param8: filterData.isKlasifikasiProdukChecked ? filterData.klasifikasiProdukValue : 'all',
      param9: filterData.isWarnaProdukChecked ? filterData.warnaProdukValue : 'all',
      param10: filterData.isMotifProductChecked ? filterData.motifProdukValue : 'all',
    };

    const res = await fetchGudangTransit(params, token);
    setData(res);
    gridTransitRef.current?.setProperties({ dataSource: res });
    gridTransitRef.current?.refresh();
  };

  const fetchRequiredData = () => {
    // Settings
    fetchSettings(kode_entitas, token)
      .then((res) => {
        setSettings(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kategori
    FillFromSQL(kode_entitas, 'kategori')
      .then((res) => {
        setKategori(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kelompok
    FillFromSQL(kode_entitas, 'kelompok')
      .then((res) => {
        setKelompok(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Merek
    FillFromSQL(kode_entitas, 'merk')
      .then((res) => {
        setMerek(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 9 / Jenis Produk
    FillFromSQL(kode_entitas, 'kustom9', '', token)
      .then((res) => {
        setJenis(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 8 / Golongan Produk
    FillFromSQL(kode_entitas, 'kustom8', '', token)
      .then((res) => {
        setGolongan(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 7 / Klasifikasi Produk
    FillFromSQL(kode_entitas, 'kustom7', '', token)
      .then((res) => {
        setKlasifikasi(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 6 / Warna Produk
    FillFromSQL(kode_entitas, 'kustom6', '', token)
      .then((res) => {
        setWarna(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kustom 5 / Motif Produk
    FillFromSQL(kode_entitas, 'kustom5', '', token)
      .then((res) => {
        setMotif(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const [detailStok, setDetailStok] = useState([]);
  const [detailStokGudang, setDetailStokGudang] = useState([]);
  const [showDetailStok, setShowDetailStok] = useState(false);
  const [selectedPabrikData, setSelectedPabrikData] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [showDialogPersediaan, setShowDialogPersediaan] = useState(false);

  const handleRecordDoubleClick = async (args: any) => {
    const { field } = args.column;
    if (field === 'stok_utama' || field === 'stok_transit') {
      if (args.rowData.stok_utama === 0) {
        alert('cccc');
        return;
      }

      const params = {
        entitas: kode_entitas,
        param1: args.rowData.kode_item,
        param2: moment().format('YYYY-MM-DD'),
      };

      await fetchDetailAktualStok({ params, token }).then(async (res: any) => {
        let filteredData;

        if (field === 'stok_utama') {
          filteredData = res.filter((item: any) => item.jenis_gudang === 'I');
        } else if (field === 'stok_transit') {
          filteredData = res.filter((item: any) => item.nama_gudang.includes('TRANSIT'));
        }
        setDetailStok(filteredData);
        setShowDetailStok(true);

        const isMb = filteredData[0].nama_gudang.toLowerCase().includes('customer') || filteredData[0].nama_gudang.toLowerCase().includes('transit');

        const params = {
          entitas: kode_entitas,
          param1: 0,
          param2: moment(filteredData[0].tanggal).format('YYYY-MM-DD'),
          param3: filteredData[0].kode_gudang,
          param4: filteredData[0].kode_item,
          param5: isMb ? filteredData[0].nama_gudang : filteredData[0].stok,
          param6: isMb ? 'MB' : 'FIFO',
        };
        await fetchDetailStokGudang({ params, token }).then((res: any) => {
          setDetailStokGudang(res);
        });
      });
    } else if (field === 'rata') {
      console.log(args.rowData);
      if (parseFloat(args.rowData.rata) === 0) {
        return;
      }
      setShowDialogAvg(true);
    } else if (field === 'nama_item') {
      setShowDialogPersediaan(true);
    }
  };

  const handleKirimPesanClick = async () => {
    // BLOCKING JIKA TIDAK ADA YANG DI CEKLIS
    if (checkedHari.ch5 === false && checkedHari.ch7 === false && checkedHari.chUp === false) {
      withReactContent(swalToast).fire({
        icon: 'info',
        text: 'Pilih umur stok yang akan dikirim pesan.',
        timer: 2000,
      });
      return;
    }

    const askMessage = await Swal.fire({
      title: 'Apakah anda yakin ingin mengirim pesan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
      target: '#main-target',
    });

    if (!askMessage.isConfirmed) return;

    // GET DATA TOKEN TELE
    const responseTele = await getSettingTelegram({ kode_entitas, token });
    const responseWa = await fetchSettings(kode_entitas, token);

    const { wa_pesan, wa_pesan2, tele_pesan }: any = await handleKirimPesan(checkedHari, gridTransitRef, kode_entitas, token, 'transit');
    // KIRIM KE TELEGRAM KE OM
    const paramsOM = {
      chatid: responseTele[0].tele_manager,
      pesan: tele_pesan,
      key: responseTele[0].token2,
    };

    try {
      await sendTelegramMessage({ params: paramsOM, token });
    } catch (error) {
      console.error('Error sending Telegram message ke OM:', error);
    }

    // KIRIM KE TELEGRAM KE RM
    const paramsRM = {
      chatid: responseTele[0].tele_regional,
      pesan: tele_pesan,
      key: responseTele[0].token2,
    };

    try {
      const res = await sendTelegramMessage({ params: paramsRM, token });
      if (res.data.ok) {
        withReactContent(swalToast).fire({
          icon: 'success',
          text: 'Pesan berhasil dikirim.',
          timer: 2000,
        });
      }
    } catch (error) {
      console.error('Error sending Telegram message ke RM:', error);
      withReactContent(swalToast).fire({
        icon: 'error',
        text: 'Pesan gagal dikirim.',
        timer: 2000,
      });
    }

    // KIRIM KE WHATSAPP KE OM
    const bodyOM = {
      phone: responseWa[0].wa_manager,
      message: wa_pesan,
    };

    try {
      await sendWhatsappMessage({ body: bodyOM, token });
    } catch (error) {
      console.error('Error sending WhatsApp message ke OM:', error);
    }

    // KIRIM KE WHATSAPP KE RM
    const bodyRM = {
      phone: responseWa[0].wa_regional,
      message: wa_pesan,
    };
    try {
      await sendWhatsappMessage({ body: bodyRM, token });
    } catch (error) {
      console.error('Error sending WhatsApp message ke RM:', error);
    }
  };

  const cellEdit = (args: CellEditArgs) => {
    const { columnName: field } = args;

    if (field === 'hari_kirim') {
      args.cancel = false;
    } else {
      args.cancel = true;
    }
  };

  const cellSaved = (args: any) => {
    const params = {
      entitas: kode_entitas,
      request: 'gudangTransit',
      hari_kirim: args.value,
      kode_item: args.rowData.kode_item,
    };

    fetchPrepareDataOd({ params, token }).then((res) => {
      setTimeout(() => {
        fetchData();
      }, 300);
    });
  };

  const setQueryCellInfo = (args: any) => {
    if (args.column.field === 'hari_kirim') {
      args.cell.style.backgroundColor = '#2CAAF7';
    }
    if (args.column.field === 'umur_stok') {
      if (args.data.umur_stok < 5) {
        args.cell.style.backgroundColor = '#25F300';
      } else if (args.data.umur_stok > 6) {
        args.cell.style.backgroundColor = '#f87171';
      } else {
        args.cell.style.backgroundColor = '#facc15';
      }
    }
  };

  const handleRowSelected = (args: any) => {
    setSelectedItem(args.data);
  };

  const [dataAvg, setDataAvg] = useState([]);
  const gridAvgRef = useRef<GridComponent | null>(null);

  useEffect(() => {
    if (showDialogAvg) {
      const params = {
        entitas: kode_entitas,
        param1: 'averageHari',
        param2: selectedItem.kode_item,
        param3: selectedItem.kode_gudang,
      };

      fetchDetailHistoryOd({ params, token }).then((res: any) => {
        setDataAvg(res);
        gridAvgRef.current?.setProperties({ dataSource: res });
        gridAvgRef.current?.refresh();
      });
    }
  }, [showDialogAvg]);

  useEffect(() => {
    fetchData();
    fetchRequiredData();
  }, []);

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
    // allowReordering: true,
    rowHeight: 22,
    height: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };
  return (
    <div className="Main h-full max-w-[calc(100vw-50px)]" id="gudang-transit">
      <div className="relative flex h-[calc(100vh-180px)]">
        {/* Filter */}
        <div
          className={`panel absolute z-10 hidden h-full w-[20%] max-w-full flex-none space-y-4 overflow-x-hidden p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto`}
          style={{ background: '#dedede' }}
        >
          <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
            <div className="flex h-full flex-col gap-6 overflow-y-auto overflow-x-hidden">
              <span className="font-bold">Filter :</span>
              {/* Filter List */}
              <div>
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

                {/* Kategori Produk */}
                <div>
                  <div className="mt-2 flex">
                    <CheckBoxComponent
                      label="Kategori"
                      checked={filterData.isKategoriProdukChecked}
                      change={(args: ChangeEventArgsButton) => {
                        const value: any = args.checked;
                        updateStateFilter('isKategoriProdukChecked', value);
                      }}
                      style={{ borderRadius: 3, borderColor: 'gray' }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="container form-input">
                      <ComboBoxComponent
                        autofill
                        showClearButton={false}
                        id="kategori"
                        className="form-select"
                        dataSource={kategori}
                        fields={{ value: 'grp', text: 'grp' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: any) => {
                          const value = args.value;
                          updateStateFilter('kategoriProdukValue', value);
                          updateStateFilter('isKategoriProdukChecked', value?.length > 0 ? true : false);
                        }}
                        value={filterData.kategoriProdukValue}
                      />
                    </div>
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
                          updateStateFilter('isKelompokProdukChecked', value?.length > 0 ? true : false);
                        }}
                        value={filterData.kelompokProdukValue}
                      />
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
                    </div>
                  </div>
                </div>

                {/* Jenis Produk */}
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

                {/* Golongan Produk */}
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
                      <DropDownListComponent
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
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button type="button" onClick={fetchData} className="btn btn-primary mt-2">
                  <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                  Refresh Data
                </button>
              </div>

              {/* Action Umur Stok */}
              <div className="flex flex-col space-y-2">
                <div className="w-fit bg-green-400 p-1 pr-5 text-black">
                  <CheckBoxComponent
                    label={'< 5 Hari'}
                    checked={false}
                    className="bg-green-400"
                    change={(args: ChangeEventArgsButton) => {
                      // const value: any = args.checked;
                      // updateStateFilter('isMotifProductChecked', value);
                      updateStateHari('ch5', args.checked);
                    }}
                    style={{ borderRadius: 3, borderColor: 'black', backgroundColor: 'green' }}
                  />
                </div>
                <div className="w-fit bg-yellow-400 p-1 pr-3.5 text-black">
                  <CheckBoxComponent
                    label={'5 - 6 Hari'}
                    checked={false}
                    change={(args: ChangeEventArgsButton) => {
                      // const value: any = args.checked;
                      // updateStateFilter('isMotifProductChecked', value);
                      updateStateHari('ch7', args.checked);
                    }}
                    style={{ borderRadius: 3, borderColor: 'black', backgroundColor: 'yellow' }}
                  />
                </div>
                <div className="w-fit bg-red-400 p-1 pr-5 text-black">
                  <CheckBoxComponent
                    label={'> 6 Hari'}
                    checked={false}
                    change={(args: ChangeEventArgsButton) => {
                      // const value: any = args.checked;
                      // updateStateFilter('isMotifProductChecked', value);
                      updateStateHari('chUp', args.checked);
                    }}
                    style={{ borderRadius: 3, borderColor: 'black', backgroundColor: 'red' }}
                  />
                </div>

                <div className="mt-4 flex justify-start">
                  <button onClick={handleKirimPesanClick} className="mt-4 rounded-md bg-blue-800 px-3 py-1 text-white hover:bg-blue-900">
                    Kirim Pesan
                  </button>
                </div>
              </div>
            </div>
          </PerfectScrollbar>
        </div>
        {/* Table */}
        <div className="h-full flex-1 overflow-auto">
          <GridComponent
            {...gridOptions}
            width="100%"
            editSettings={{ allowEditing: true, mode: 'Batch' }}
            recordDoubleClick={handleRecordDoubleClick}
            cellEdit={cellEdit}
            cellSaved={cellSaved}
            queryCellInfo={setQueryCellInfo}
            dataSource={data}
            rowSelected={handleRowSelected}
            ref={gridTransitRef}
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_item" headerText="Nama Barang" width="140" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="stok_minimal" headerText="Stok Minimal Internal" format="N" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="stok_utama" headerText="Stok Gudang Utama" format="N0" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="stok_transit" headerText="Jml Stok Transit" format="N0" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="umur" headerText="Umur Stok" format="N0" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="hari_kirim" headerText="Lama Perjalanan" format="N0" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
              <ColumnDirective
                field="umur_stok"
                // headerText="Umur Stok Setelah Sampai dari Pabrik (hari)"
                headerTemplate={headerUmurStok}
                format="N0"
                width="140"
                headerTextAlign="Center"
                textAlign="Right"
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective field="rata" headerTemplate={headerRataHari} format="N0" width="140" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <AggregatesDirective>
              <AggregateDirective>
                <AggregateColumnsDirective>
                  <AggregateColumnDirective field="stok_minimal" type="Sum" format="N" />
                  <AggregateColumnDirective field="stok_utama" type="Sum" format="N" />
                  <AggregateColumnDirective field="stok_transit" type="Sum" format="N" />
                </AggregateColumnsDirective>
              </AggregateDirective>
            </AggregatesDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Aggregate]} />
          </GridComponent>
        </div>
      </div>

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
                      <ColumnDirective field="dokumen" headerText="Ref." width={50} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="noref" headerText="No. Dokumen" width={120} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="no_kontrak" headerText="No. Referensi" width={120} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="nopol" headerText="No. Kendaraan" width={100} headerTextAlign="Center" textAlign="Left" />
                      <ColumnDirective field="jumlah" headerText="Jumlah Transaksi" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
                      <ColumnDirective field={'kuantitas'} headerText="Sisa Stok" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
                      <ColumnDirective field="hari" headerText="Umur di gudang" format="N" width={70} headerTextAlign="Center" textAlign="Right" />
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

      {/* Dialog Avg Hari */}
      {showDialogAvg && (
        <DialogComponent
          id="dialogAvg"
          target="#gudang-transit"
          header="Detail rata-rata hari dari perhitungan"
          visible={showDialogAvg}
          isModal
          width={'70%'}
          height={'70%'}
          close={() => setShowDialogAvg(false)}
          allowDragging
          showCloseIcon
        >
          <p className="mb-1 bg-slate-600 px-2 font-bold text-slate-300">{selectedItem.nama_item}</p>
          {/* Grid Table */}
          <GridComponent dataSource={dataAvg} ref={gridAvgRef} locale="id" gridLines="Both" height={350}>
            <ColumnsDirective>
              <ColumnDirective field="tgl_mb" format="dd-MM-yyyy" type="date" headerText="Tgl. MB" headerTextAlign="Center" textAlign="Left" autoFit />
              <ColumnDirective field="supplier" headerText="Supplier (Pabrik)" headerTextAlign="Center" textAlign="Left" width={150} />
              <ColumnDirective field="ekspedisi" headerText="Ekspedisi" headerTextAlign="Center" textAlign="Left" />
              <ColumnDirective field="no_kontrak" headerText="No. Kontrak" headerTextAlign="Center" textAlign="Left" />
              <ColumnDirective field="qty_std" format="N" headerText="Jml. Stok" headerTextAlign="Center" textAlign="Right" width={70} />
              <ColumnDirective field="tgl_fbm" format="dd-MM-yyyy" type="date" headerText="Tgl. FBM" headerTextAlign="Center" textAlign="Left" autoFit />
              <ColumnDirective field="hari" format="N" headerText="Umur (hari)" headerTextAlign="Center" textAlign="Right" width={50} />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, Aggregate]} />
          </GridComponent>
        </DialogComponent>
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
    </div>
  );
};

export default InfoGudangTransit;

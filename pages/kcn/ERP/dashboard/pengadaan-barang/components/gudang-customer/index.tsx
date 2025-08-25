import React, { useEffect, useState } from 'react';

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
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { listDokumenStok, mockData } from '../../constants';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchGudangCustomer, fetchSettings, getSettingTelegram, sendTelegramMessage, sendWhatsappMessage } from '../../api';
import { FillFromSQL } from '@/utils/routines';
import DialogBaruEditPersediaan from '@/pages/kcn/ERP/master/daftarPersediaan/components/dialog/DialogBaruEditPersediaan';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';
import { handleKirimPesanCustomer } from '../../functions/handleKirimPesan';
import Swal from 'sweetalert2';

type InfoGudangCustomerProps = {
    kode_entitas: string;
    token: string;
};

const InfoGudangCustomer = ({ kode_entitas, token }: InfoGudangCustomerProps) => {
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

    const [showDialogPersediaan, setShowDialogPersediaan] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [checkedHari, setCheckedHari] = useState({
        ch30: false,
        ch90: false,
        chUp: false,
    });

    const updateStateHari = (field: any, value: any) => {
        setCheckedHari((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

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

    // Global Function
    const handleRecordDoubleClick = (args: any) => {
        if (args.column.field === 'nama_item') {
            setShowDialogPersediaan(true);
        }
    };

    const handleRowSelected = (args: any) => {
        setSelectedItem(args.data);
    };

    const handleKirimPesanClick = async () => {
        // BLOCK JIKA TIDAK ADA YANG DI CEKLIS
        if (checkedHari.ch30 === false && checkedHari.ch90 === false && checkedHari.chUp === false) {
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

        const { wa_pesan, tele_pesan }: any = await handleKirimPesanCustomer(checkedHari, data, kode_entitas, token);
        // KIRIM KE TELEGRAM OM
        const paramsOM = {
            chatid: responseTele[0].tele_manager,
            pesan: tele_pesan,
            key: responseTele[0].token2,
        };

        try {
            const res = await sendTelegramMessage({ params: paramsOM, token });
            if (res.data.ok) {
                withReactContent(swalToast).fire({
                    icon: 'success',
                    text: 'Pesan berhasil dikirim.',
                    timer: 2000,
                });
            }
        } catch (error) {
            console.error('Error sending Telegram message ke OM:', error);
            withReactContent(swalToast).fire({
                icon: 'error',
                text: 'Pesan gagal dikirim.',
                timer: 2000,
            });
        }

        // KIRIM KE TELEGRAM RM
        const bodyRM = {
            chatid: responseTele[0].tele_regional,
            pesan: tele_pesan,
            key: responseTele[0].token2,
        };

        try {
            await sendTelegramMessage({ params: bodyRM, token });
        } catch (error) {
            console.error('Error sending Telegram message ke RM:', error);
        }

        // KIRIM KE WHATSAPP OM
        const bodyOM = {
            phone: responseWa[0].wa_manager,
            pesan: wa_pesan,
        };

        try {
            await sendWhatsappMessage({ body: bodyOM, token });
        } catch (error) {
            console.error('Error sending Whatsapp message ke OM:', error);
        }

        // KIRIM KE WHATSAPP RM
        const bodyRM2 = {
            phone: responseWa[0].wa_regional,
            pesan: wa_pesan,
        };

        try {
            await sendWhatsappMessage({ body: bodyRM2, token });
        } catch (error) {
            console.error('Error sending Whatsapp message ke RM:', error);
        }
    };

    const queryCellInfo = (args: any) => {
        if (args.column.field === 'umur') {
            if (args.data.umur < 30) {
                args.cell.style.backgroundColor = '#25F300';
            } else if (args.data.umur > 90) {
                args.cell.style.backgroundColor = '#f87171';
            } else {
                args.cell.style.backgroundColor = '#facc15';
            }
        }
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

        const res = await fetchGudangCustomer(params, token);
        const sortedData = res.sort((a: any, b: any) => b.umur - a.umur);
        setData(sortedData);
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
        width: '60%',
        height: '100%',
        gridLines: 'Both',
        // loadingIndicator: { indicatorType: 'Shimmer' },
    };
    return (
        <div className="Main h-[calc(130vh-240px)] w-[calc(130vw)]">
            <div className="relative flex h-full">
                {/* Filter */}
                <div
                    className={`panel absolute z-10 hidden h-full w-[320px] max-w-full flex-none space-y-4 overflow-x-hidden p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto`}
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
                                                    updateStateFilter('isWarnaProdukChecked', value.length > 0);
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

                                {/* Kurang dan Stok Minimal */}
                                {/* <div className="mt-1 flex">
                  <CheckBoxComponent
                    label="Kekurangan dan Stok Minimal memperhitungkan penjualan cabang"
                    checked={filterData.isKurangStok}
                    change={(args: ChangeEventArgsButton) => {
                      const value: any = args.checked;

                      updateStateFilter('isKurangStok', value);
                    }}
                    style={{ borderRadius: 3, borderColor: 'gray' }}
                  />
                </div> */}
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
                                        label={'< 30 Hari'}
                                        checked={false}
                                        className="bg-green-400"
                                        change={(args: ChangeEventArgsButton) => {
                                            // const value: any = args.checked;
                                            // updateStateFilter('isMotifProductChecked', value);
                                            updateStateHari('ch30', args.checked);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'black', backgroundColor: 'green' }}
                                    />
                                </div>
                                <div className="w-fit bg-yellow-400 p-1 pr-3.5 text-black">
                                    <CheckBoxComponent
                                        label={'30 - 90 Hari'}
                                        checked={false}
                                        change={(args: ChangeEventArgsButton) => {
                                            // const value: any = args.checked;
                                            // updateStateFilter('isMotifProductChecked', value);
                                            updateStateHari('ch90', args.checked);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'black', backgroundColor: 'yellow' }}
                                    />
                                </div>
                                <div className="w-fit bg-red-400 p-1 pr-5 text-black">
                                    <CheckBoxComponent
                                        label={'> 90 Hari'}
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
                                    <button
                                        onClick={handleKirimPesanClick}
                                        className="mt-4 rounded-md bg-blue-800 px-3 py-1 text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        Kirim Pesan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PerfectScrollbar>
                </div>
                {/* Table */}
                <div className="h-full w-full flex-1 overflow-auto bg-white">
                    <GridComponent {...gridOptions} rowSelected={handleRowSelected} recordDoubleClick={handleRecordDoubleClick} dataSource={data} queryCellInfo={queryCellInfo}>
                        <ColumnsDirective>
                            <ColumnDirective field="nama_relasi" headerText="Customer" width="170" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_item" headerText="Nama Barang" width="270" autoFit headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="stok" headerText="Jumlah Stok" width="120" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective
                                field="tgl_do"
                                type={'date'}
                                format="dd-MM-yyyy"
                                headerText="Tgl. DO"
                                width="120"
                                headerTextAlign="Center"
                                textAlign="Left"
                                clipMode="EllipsisWithTooltip"
                            />
                            <ColumnDirective
                                field="tgl_fj"
                                type={'date'}
                                format="dd-MM-yyyy"
                                headerText="Tgl. Faktur"
                                width="120"
                                headerTextAlign="Center"
                                textAlign="Left"
                                clipMode="EllipsisWithTooltip"
                            />
                            <ColumnDirective field="umur" headerText="Umur Stok" width="100" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <AggregatesDirective>
                            <AggregateDirective>
                                <AggregateColumnsDirective>
                                    <AggregateColumnDirective field="stok" type="Sum" format="N" />
                                </AggregateColumnsDirective>
                            </AggregateDirective>
                        </AggregatesDirective>
                        <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn]} />
                    </GridComponent>
                </div>
            </div>
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

export default InfoGudangCustomer;

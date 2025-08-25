import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import moment from 'moment';
// import { klasifikasiSupp } from '../template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { DaftarSupplier, DaftarSupplierAll } from '../../../fa/phu/model/apiPhu';
// import DialogSupplier from '../template/dialogSupplier';
import { viewPeriode } from '@/utils/routines';
import { useSession } from '@/pages/api/sessionContext';
import { GetItem, GetListData, categoriesHutangUsahaDanSupplier, categoriesPembelian } from '../../model/api';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import {
    OnClick_CetakDaftarBeliPerKelompokBarang,
    OnClick_CetakDaftarBeliPerKelompokBarangPeriodeBerjalan,
    OnClick_CetakDaftarFakturPembelian,
    OnClick_CetakDaftarFakturPembelianOutstanding,
    OnClick_CetakDaftarFakturPembelianPerSupplier,
    OnClick_CetakDaftarMemoPengembalianBarang,
    OnClick_CetakDaftarMemoPengembalianBarangOutstanding,
    OnClick_CetakDaftarMemoPengembalianBarangPerSupplier,
    OnClick_CetakDaftarOrderPembelian,
    OnClick_CetakDaftarOrderPembelianOutstanding,
    OnClick_CetakDaftarPenerimaanBarangOutstanding,
    OnClick_CetakDaftarPenerimaanBarangPerSupplier,
    OnClick_CetakDaftarPermintaanPembelian,
    OnClick_CetakDaftarPermintaanPembelianOutstanding,
    OnClick_CetakDaftarPermintaanPembelianPerPeminta,
    OnClick_CetakDaftarRekapPembelianPerKelompokBarang,
    OnClick_CetakDaftarRincianOrderPembelian,
    OnClick_CetakDaftarRincianPermintaanPembelian,
    OnClick_CetakLaporanPembelian,
    OnClick_CetakLaporanPembelianPerItemSupplier,
    OnClick_CetakLaporanPembelianPerSupplier,
    OnClick_CetakLaporanRincianPembelianPerItem,
    OnClick_CetakRekapitulasiPenerimaanBarang,
    OnClick_CetakRincianDaftarFakturPembelian,
    OnClick_CetakRincianDaftarMemoPengembalianBarang,
    OnClick_CetakRincianDaftarPenerimaanBarang,
    showLoading1,
} from '../functional/fungsi';
import DialogSupplier from '../template/dialogSupplier';

interface DialogLaporanDetailBukuBesarProps {
    kode_entitas: any;
    visible: boolean;
    stateDataHeader: any;
    setStateDataHeader: Function;
    onClose: any;
    token: any;
}

// Fungsi debounce untuk mengurangi pemanggilan API berulang
const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};



const BaseDialog: React.FC<DialogLaporanDetailBukuBesarProps> = ({ kode_entitas, visible, stateDataHeader, setStateDataHeader, onClose, token }) => {
    const { sessionData, isLoading } = useSession();
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.nip ?? '';

    const closeModalShowBaru = () => {
        onClose();
    };

    const [stateDataFilter, setStateDataFilter] = useState({
        tglAwal: moment(), // tanggal awal
        tglAkhir: moment().endOf('month'), // tanggal akhir
        inputvalue: '',
        inputvalueKategori: '',
        inputvalueKelompok: '',
        inputvalueNoItem: '',
        inputvalueNamaItem: '',
        inputvalueSupplier: '',

        dialogSupplierVisible: false,
        klasifikasiSupp: 'Semua',
        noSupplierValue: '',
        namaSupplierValue: '',
        kodeSupplierValue: '',

        isNamaSuppChecked: false,
        noSjSupp: '',
        noPb: '',
    });
    const [dataDaftarSupplier, setDataDaftarSupplier] = useState<any[]>([]);
    const [dataDaftarNoLpb, setDataDaftarNoLpb] = useState<any[]>([]);
    const [listDataDaftarNoLpb, setListDataDaftarNoLpb] = useState<any[]>([]);
    const vRefreshData = useRef(0);

    const [listDataPeminta, setListDataPeminta] = useState<any[]>([]);
    const [listItem, setListItem] = useState<any[]>([]);
    const [listDataPemintaOriginal, setListDataPemintaOriginal] = useState<any[]>([]);
    const [listDataSupplierOriginal, setListDataSupplierOriginal] = useState<any[]>([]);
    const [listDataKategoriOriginal, setListDataKategoriOriginal] = useState<any[]>([]);
    const [listDataKelompokOriginal, setListDataKelompokOriginal] = useState<any[]>([]);
    const [listDataNoItemOriginal, setListDataNoItemOriginal] = useState<any[]>([]);
    const [listDataNamaItemOriginal, setListDataNamaItemOriginal] = useState<any[]>([]);

    const [listDataPemintaOri, setListDataPemintaOri] = useState<any[]>([]);
    const [listDataSupplierOri, setListDataSupplierOri] = useState<any[]>([]);
    const [listDataKategoriOri, setListDataKategoriOri] = useState<any[]>([]);
    const [listDataKelompokOri, setListDataKelompokOri] = useState<any[]>([]);
    const [listDataNoItemOri, setListDataNoItemOri] = useState<any[]>([]);
    const [listDataNamaItemOri, setListDataNamaItemOri] = useState<any[]>([]);

    const [selectedSingleId, setSelectedSingleId] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedSinglePeminta, setSelectedSinglePeminta] = useState<any>(); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIds, setSelectedMultipleIds] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)

    const [selectedSingleIdSupplier, setSelectedSingleIdSupplier] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedSingleSupplier, setSelectedSingleSupplier] = useState<any>(); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIdsSupplier, setSelectedMultipleIdsSupplier] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)

    const [selectedTab, setSelectedTab] = useState(1); // 1 untuk Parameter sebagai default
    const [numberList, setNumberList] = useState(
        stateDataHeader?.idCategory === 7102
            ? 1
            : stateDataHeader?.idCategory === 7106 ||
              stateDataHeader?.idCategory === 7107 ||
              stateDataHeader?.idCategory === 7109 ||
              stateDataHeader?.idCategory === 7110 ||
              stateDataHeader?.idCategory === 7111 ||
              stateDataHeader?.idCategory === 7124 ||
              stateDataHeader?.idCategory === 7125 ||
              stateDataHeader?.idCategory === 7126 ||
              stateDataHeader?.idCategory === 7127 ||
              stateDataHeader?.idCategory === 7128
            ? 6
            : 1
    );
    const [namaList, setNamaList] = useState(
        stateDataHeader?.idCategory === 7102
            ? 'Nama Peminta'
            : stateDataHeader?.idCategory === 7105 ||
              stateDataHeader?.idCategory === 7106 ||
              stateDataHeader?.idCategory === 7107 ||
              stateDataHeader?.idCategory === 7109 ||
              stateDataHeader?.idCategory === 7110 ||
              stateDataHeader?.idCategory === 7111 ||
              stateDataHeader?.idCategory === 7120 ||
              stateDataHeader?.idCategory === 7124 ||
              stateDataHeader?.idCategory === 7125 ||
              stateDataHeader?.idCategory === 7126 ||
              stateDataHeader?.idCategory === 7127 ||
              stateDataHeader?.idCategory === 7128
            ? 'Nama Supplier'
            : 'Nama Peminta'
    );
    const [visibleCount, setVisibleCount] = useState(50); // Mulai dengan 50 data
    const containerRef = useRef<HTMLDivElement>(null); // Referensi ke container scroll
    const [selectedOd, setSelectedOd] = useState('outstanding');
    const [selectedKuantitas, setSelectedKuantitas] = useState('tidakSama');
    const [grupPerDokumen, setGrupPerDokumen] = useState('ya');

    const [selectedSingleIdKategori, setSelectedSingleIdKategori] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIdsKategori, setSelectedMultipleIdsKategori] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)
    const [selectedSingleKategori, setSelectedSingleKategori] = useState<any>();

    const [selectedSingleIdKelompok, setSelectedSingleIdKelompok] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIdsKelompok, setSelectedMultipleIdsKelompok] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)
    const [selectedSingleKelompok, setSelectedSingleKelompok] = useState<any>();

    const [selectedSingleIdNoItem, setSelectedSingleIdNoItem] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIdsNoItem, setSelectedMultipleIdsNoItem] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)
    const [selectedSingleNoItem, setSelectedSingleNoItem] = useState<any>();

    const [selectedSingleIdNamaItem, setSelectedSingleIdNamaItem] = useState<number | null>(null); // Menyimpan 0-8 (hanya satu)
    const [selectedMultipleIdsNamaItem, setSelectedMultipleIdsNamaItem] = useState<number[]>([]); // Menyimpan 9 ke atas (bisa banyak)
    const [selectedSingleNamaItem, setSelectedSingleNamaItem] = useState<any>();

    // Data tambahan yang mau ditambahkan
    const tambahanData = [
        { peminta: 'Semua' },
        { peminta: 'Berisi Kata ...........(Ketik kata di bawah)' },
        { peminta: 'Tidak Berisi Kata ...........(Ketik kata di bawah)' },
        { peminta: 'Kata Yang Sama Persis ...........(Ketik kata di bawah)' },
        { peminta: 'Bukan Kata Yang Sama Persis ...........(Ketik kata di bawah)' },
        { peminta: 'Diawali Dengan ...........(Ketik kata di bawah)' },
        { peminta: 'Tidak Diawali Dengan ...........(Ketik kata di bawah)' },
        { peminta: 'Diakhiri Dengan ...........(Ketik kata di bawah)' },
        { peminta: 'Tidak Diakhiri Dengan ...........(Ketik kata di bawah)' },
    ];

    const listData = [
        { value: 'Nama Peminta', id: 1 },
        { value: 'Nama Supplier', id: 6 },
        { value: 'Kategori', id: 2 },
        { value: 'Kelompok', id: 3 },
        { value: 'No. Item', id: 4 },
        { value: 'Nama Item', id: 5 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const respItem = await GetItem(kode_entitas, token);
            setListItem(respItem);
        };
        fetchData();
    }, [kode_entitas, token]);

    useEffect(() => {
        const fetchPeriodeAndData = async () => {
            try {
                viewPeriode(kode_entitas == '99999' ? '999' : kode_entitas)
                    .then((periode) => {
                        const peride = periode.split('-')[1].split('s/d');
                        const dataPeriodeMoment = moment(peride[0].trimStart(), 'D MMMM YYYY').format('YYYY-MM-DD');

                        const dataPeriodeMomentAkhir = moment().format('YYYY-MM-DD');
                        setStateDataFilter((oldData) => ({
                            ...oldData,
                            tglAwal: moment(dataPeriodeMoment),
                            tglAkhir: stateDataHeader?.idCategory === 7121 ? moment() : moment(dataPeriodeMoment).endOf('month'),
                            tglAkhirChecbox: moment(dataPeriodeMoment).endOf('month'),
                        }));
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                await handleAPIPeminta(kode_entitas, token, numberList);
            } catch (error) {
                console.error(error);
            } finally {
            }
        };

        // Gunakan debounce untuk menghindari pemanggilan API berulang kali saat numberList berubah
        const debouncedFetch = debounce(fetchPeriodeAndData, 300);
        debouncedFetch();
    }, [kode_entitas, token, numberList]);

    const handleAPIPeminta = useCallback(
        async (kode_entitas: any, token: any, numberList: any) => {
            let respGet: any[] = [];

            if (numberList === 4 || numberList === 5) {
                respGet = listItem;
            } else {
                respGet = await GetListData(kode_entitas, token, numberList, stateDataHeader?.idCategory);
            }

            const updatedTambahanData = tambahanData.map((item, index) => ({
                id: index,
                ...item,
            }));

            const updatedData = respGet?.map((item: any, index: any) => ({
                id: index + updatedTambahanData.length,
                peminta:
                    numberList === 1
                        ? item.peminta
                        : numberList === 2
                        ? item.grp
                        : numberList === 3
                        ? item.kel
                        : numberList === 4
                        ? item.no_item
                        : numberList === 5
                        ? item.nama_item
                        : numberList === 6
                        ? item.nama_relasi
                        : null,
            }));

            setListDataPeminta([...updatedTambahanData, ...updatedData]);
            if (numberList === 1) {
                setListDataPemintaOriginal(respGet);
                setListDataPemintaOri([...updatedTambahanData, ...updatedData]);
            } else if (numberList === 2) {
                setListDataKategoriOriginal(respGet);
                setListDataKategoriOri([...updatedTambahanData, ...updatedData]);
            } else if (numberList === 3) {
                setListDataKelompokOriginal(respGet);
                setListDataKelompokOri([...updatedTambahanData, ...updatedData]);
            } else if (numberList === 4) {
                setListDataNoItemOriginal(respGet);
                setListDataNoItemOri([...updatedTambahanData, ...updatedData]);
            } else if (numberList === 5) {
                setListDataNamaItemOriginal(respGet);
                setListDataNamaItemOri([...updatedTambahanData, ...updatedData]);
            } else if (numberList === 6) {
                setListDataSupplierOriginal(respGet);
                setListDataSupplierOri([...updatedTambahanData, ...updatedData]);
            }
        },
        [listDataPemintaOriginal, listDataSupplierOriginal]
    );

    // Gunakan useMemo agar tidak menghitung ulang data setiap render
    const memoizedListDataPeminta = useMemo(() => listDataPeminta.slice(0, visibleCount), [listDataPeminta, visibleCount]);

    // Fungsi untuk menangani scroll dan menambah data jika hampir sampai bawah
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            setVisibleCount((prev) => prev + 50); // Tambah 50 data lagi saat scroll hampir ke bawah
        }
    };

    useEffect(() => {
        // Cek semua multipleIds kosong
        const isAllEmpty =
            selectedMultipleIdsKategori.length === 0 &&
            selectedMultipleIds.length === 0 &&
            selectedMultipleIdsSupplier.length === 0 &&
            selectedMultipleIdsKelompok.length === 0 &&
            selectedMultipleIdsNoItem.length === 0 &&
            selectedMultipleIdsNamaItem.length === 0;

        if (!isAllEmpty) return; // Kalau ada yang gak kosong, stop di sini

        const semuaItem = memoizedListDataPeminta.find((item) => item.peminta === 'Semua');
        if (semuaItem) {
            setSelectedSingleId(semuaItem.id);
            setSelectedSinglePeminta(semuaItem.peminta);
            setSelectedSingleIdSupplier(semuaItem.id);
            setSelectedSingleSupplier(semuaItem.peminta);
            setSelectedSingleIdKategori(semuaItem.id);
            setSelectedSingleKategori(semuaItem.peminta);
            setSelectedSingleIdKelompok(semuaItem.id);
            setSelectedSingleKelompok(semuaItem.peminta);
            setSelectedSingleIdNoItem(semuaItem.id);
            setSelectedSingleNoItem(semuaItem.peminta);
            setSelectedSingleIdNamaItem(semuaItem.id);
            setSelectedSingleNamaItem(semuaItem.peminta);
        }
    }, [
        listDataPemintaOri,
        listDataSupplierOri,
        listDataKategoriOri,
        listDataKelompokOri,
        listDataNoItemOri,
        listDataNamaItemOri,
        selectedMultipleIdsKategori,
        selectedMultipleIds,
        selectedMultipleIdsKelompok,
        selectedMultipleIdsNoItem,
        selectedMultipleIdsNamaItem,
    ]);

    const handleCheckboxChange = (id: number, peminta: any) => {
        console.log('id 12= ', id);

        if (id === 0) {
            setSelectedSingleId((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSinglePeminta(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSinglePeminta(peminta);
                    setSelectedMultipleIds([]);
                    return 0;
                }
            });

            // setSelectedSingleId(id);
            // setSelectedSinglePeminta(peminta);
            // setSelectedMultipleIds([]);
        } else if (id >= 1 && id <= 8) {
            // Jika ID antara 0-8, hanya boleh satu yang dipilih
            // setSelectedSingleId(id);
            setSelectedSingleId((prev) => (prev === id ? null : id));
            setSelectedSinglePeminta(peminta);
        } else {
            if (selectedSinglePeminta === 'Semua') {
                setSelectedSingleId(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIds((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleId(0);
                    setSelectedSinglePeminta('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const handleCheckboxChangeSupplier = (id: number, peminta: any) => {
        console.log('dasdssf = ', id, peminta);
        if (id === 0) {
            setSelectedSingleIdSupplier((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSingleSupplier(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSingleSupplier(peminta);
                    setSelectedMultipleIdsSupplier([]);
                    return 0;
                }
            });
        } else if (id >= 1 && id <= 8) {
            setSelectedSingleIdSupplier((prev) => (prev === id ? null : id));
            setSelectedSingleSupplier(peminta);
        } else {
            if (selectedSingleSupplier === 'Semua') {
                setSelectedSingleIdSupplier(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIdsSupplier((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleIdSupplier(0);
                    setSelectedSingleSupplier('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const handleCheckboxChangeKategori = (id: number, peminta: any) => {
        if (id === 0) {
            setSelectedSingleIdKategori((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSingleKategori(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSingleKategori(peminta);
                    setSelectedMultipleIdsKategori([]);
                    return 0;
                }
            });
        } else if (id >= 1 && id <= 8) {
            setSelectedSingleIdKategori((prev) => (prev === id ? null : id));
            setSelectedSingleKategori(peminta);
        } else {
            if (selectedSingleKategori === 'Semua') {
                setSelectedSingleIdKategori(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIdsKategori((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleIdKategori(0);
                    setSelectedSingleKategori('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const handleCheckboxChangeKelompok = (id: number, peminta: any) => {
        if (id === 0) {
            setSelectedSingleIdKelompok((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSingleKelompok(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSingleKelompok(peminta);
                    setSelectedMultipleIdsKelompok([]);
                    return 0;
                }
            });
        } else if (id >= 1 && id <= 8) {
            setSelectedSingleIdKelompok((prev) => (prev === id ? null : id));
            setSelectedSingleKelompok(peminta);
        } else {
            if (selectedSingleKelompok === 'Semua') {
                setSelectedSingleIdKelompok(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIdsKelompok((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleIdKelompok(0);
                    setSelectedSingleKelompok('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const handleCheckboxChangeNoItem = (id: number, peminta: any) => {
        if (id === 0) {
            setSelectedSingleIdNoItem((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSingleNoItem(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSingleNoItem(peminta);
                    setSelectedMultipleIdsNoItem([]);
                    return 0;
                }
            });
        } else if (id >= 1 && id <= 8) {
            setSelectedSingleIdNoItem((prev) => (prev === id ? null : id));
            setSelectedSingleNoItem(peminta);
        } else {
            if (selectedSingleNoItem === 'Semua') {
                setSelectedSingleIdNoItem(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIdsNoItem((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleIdNoItem(0);
                    setSelectedSingleNoItem('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const handleCheckboxChangeNamaItem = (id: number, peminta: any) => {
        if (id === 0) {
            setSelectedSingleIdNamaItem((prev) => {
                const isUnchecking = prev === 0;
                if (isUnchecking) {
                    setSelectedSingleNamaItem(''); // atau '' atau default value kamu
                    return null;
                } else {
                    setSelectedSingleNamaItem(peminta);
                    setSelectedMultipleIdsNamaItem([]);
                    return 0;
                }
            });
        } else if (id >= 1 && id <= 8) {
            setSelectedSingleIdNamaItem((prev) => (prev === id ? null : id));
            setSelectedSingleNamaItem(peminta);
        } else {
            if (selectedSingleNamaItem === 'Semua') {
                setSelectedSingleIdNamaItem(null);
            }
            // Untuk multiple selection
            setSelectedMultipleIdsNamaItem((prev) => {
                const safePrev = Array.isArray(prev) ? prev : [];
                let newSelected = safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];

                // Jika setelah update tidak ada yang terpilih, kembalikan ke ID 0
                if (newSelected.length === 0) {
                    setSelectedSingleIdNamaItem(0);
                    setSelectedSingleNamaItem('Semua'); // atau sesuai default kamu
                }

                return newSelected;
            });
        }
    };

    const showLaporan = async () => {
        const resultDataPeminta = listDataPemintaOri
            .filter((item) => selectedMultipleIds.includes(item.id))
            .map((item) => item.peminta)
            .join(',');
        const resultDataSupplier = listDataSupplierOri
            .filter((item) => selectedMultipleIds.includes(item.id))
            .map((item) => item.peminta)
            .join(',');
        const resultDatalKategori = listDataKategoriOri
            .filter((item) => selectedMultipleIdsKategori.includes(item.id))
            .map((item) => item.peminta)
            .join(',');
        const resultDataKelompok = listDataKelompokOri
            .filter((item) => selectedMultipleIdsKelompok.includes(item.id))
            .map((item) => item.peminta)
            .join(',');
        const resultDataNoItem = listDataNoItemOri
            .filter((item) => selectedMultipleIdsNoItem.includes(item.id))
            .map((item) => item.peminta)
            .join(',');
        const resultDataNamaItem = listDataNamaItemOri
            .filter((item) => selectedMultipleIdsNamaItem.includes(item.id))
            .map((item) => item.peminta)
            .join(',');

        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        const getDetail = categoriesPembelian.filter((item: any) => item.id === stateDataHeader?.idCategory)[0];

        const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
            params: {
                entitas: '*',
                param1: '',
                param2: 'frmReportIdx',
                param3: getDetail.nama_komponen,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const dataPrint = getSettingPrint.data.data;

        let allowPrint;
        if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

        const paramObject = {
            kode_entitas: kode_entitas,
            token: token,
            dataPemintaUser: selectedSingleId === 0 ? 'all' : resultDataPeminta === '' ? 'all' : resultDataPeminta,
            dataPemintaPilihan: selectedSingleId === 0 ? 'all' : stateDataFilter.inputvalue === '' ? '%' : stateDataFilter.inputvalue,
            idPemintaPilihan: selectedSingleId === 0 || selectedSingleId === null || selectedSingleId === undefined ? 'all' : selectedSingleId,

            dataKategori: selectedSingleIdKategori === 0 ? 'all' : resultDatalKategori === '' ? 'all' : resultDatalKategori,
            dataKategoriPilihan: selectedSingleIdKategori === 0 ? 'all' : stateDataFilter.inputvalueKategori === '' ? '%' : stateDataFilter.inputvalueKategori,
            idKategoriPilihan: selectedSingleIdKategori === 0 || selectedSingleIdKategori === null || selectedSingleIdKategori === undefined ? 'all' : selectedSingleIdKategori,

            dataKelompok: selectedSingleIdKelompok === 0 ? 'all' : resultDataKelompok === '' ? 'all' : resultDataKelompok,
            dataKelompokPilihan: selectedSingleIdKelompok === 0 ? 'all' : stateDataFilter.inputvalueKelompok === '' ? '%' : stateDataFilter.inputvalueKelompok,
            idKelompokPilihan: selectedSingleIdKelompok === 0 || selectedSingleIdKelompok === null || selectedSingleIdKelompok === undefined ? 'all' : selectedSingleIdKelompok,

            dataNoItem: selectedSingleIdNoItem === 0 ? 'all' : resultDataNoItem === '' ? 'all' : resultDataNoItem,
            dataNoItemPilihan: selectedSingleIdNoItem === 0 ? 'all' : stateDataFilter.inputvalueNoItem === '' ? '%' : stateDataFilter.inputvalueNoItem,
            idNoItemPilihan: selectedSingleIdNoItem === 0 || selectedSingleIdNoItem === null || selectedSingleIdNoItem === undefined ? 'all' : selectedSingleIdNoItem,

            dataNamaItem: selectedSingleIdNamaItem === 0 ? 'all' : resultDataNamaItem === '' ? 'all' : resultDataNamaItem,
            dataNamaItemPilihan: selectedSingleIdNamaItem === 0 ? 'all' : stateDataFilter.inputvalueNamaItem === '' ? '%' : stateDataFilter.inputvalueNamaItem,
            idNamaItemPilihan: selectedSingleIdNamaItem === 0 || selectedSingleIdNamaItem === null || selectedSingleIdNamaItem === undefined ? 'all' : selectedSingleIdNamaItem,

            dataSupplier: selectedSingleIdSupplier === 0 ? 'all' : resultDataSupplier === '' ? 'all' : resultDataSupplier,
            dataSupplierPilihan: selectedSingleIdSupplier === 0 ? 'all' : stateDataFilter.inputvalueSupplier === '' ? '%' : stateDataFilter.inputvalueSupplier,
            idSupplierPilihan: selectedSingleIdSupplier === 0 || selectedSingleIdSupplier === null || selectedSingleIdSupplier === undefined ? 'all' : selectedSingleIdSupplier,

            tglAwal: moment(stateDataFilter.tglAwal).format('YYYY-MM-DD'),
            tglAkhir: moment(stateDataFilter.tglAkhir).format('YYYY-MM-DD'),
            selectedOd: selectedOd === 'outstanding' ? (stateDataHeader?.idCategory === 7106 ? 'OST' : 1) : stateDataHeader?.idCategory === 7106 ? 'all' : 0,
            noSjSupp: stateDataFilter.noSjSupp === '' ? 'all' : stateDataFilter.noSjSupp,
            noPb: stateDataFilter.noPb === '' ? 'all' : stateDataFilter.noPb,
            grupPerDokumen: grupPerDokumen === 'ya' ? 1 : 0,
            kodeSupplierValue: stateDataFilter.kodeSupplierValue === '' ? 'all' : stateDataFilter.kodeSupplierValue,
            selectedKuantitas: selectedKuantitas === 'semua' ? 'all' : selectedKuantitas === 'tidakSama' ? 3 : selectedKuantitas === 'samaDengan' ? 1 : selectedKuantitas === 'lebihKecil' ? 4 : 2,
            visiblePrint: allowPrint,
        };

        console.log('paramObject = ', paramObject);

        if (stateDataHeader?.idCategory === 7101) {
            OnClick_CetakDaftarPermintaanPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7102) {
            OnClick_CetakDaftarPermintaanPembelianOutstanding(paramObject);
        } else if (stateDataHeader?.idCategory === 7103) {
            OnClick_CetakDaftarRincianPermintaanPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7104) {
            OnClick_CetakDaftarPermintaanPembelianPerPeminta(paramObject);
        } else if (stateDataHeader?.idCategory === 7105) {
            OnClick_CetakDaftarOrderPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7106) {
            OnClick_CetakDaftarOrderPembelianOutstanding(paramObject);
        } else if (stateDataHeader?.idCategory === 7107) {
            OnClick_CetakDaftarRincianOrderPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7108) {
        } else if (stateDataHeader?.idCategory === 7109) {
            OnClick_CetakRekapitulasiPenerimaanBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7110) {
            OnClick_CetakDaftarPenerimaanBarangOutstanding(paramObject);
        } else if (stateDataHeader?.idCategory === 7111) {
            OnClick_CetakRincianDaftarPenerimaanBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7112) {
            OnClick_CetakDaftarPenerimaanBarangPerSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7113) {
            OnClick_CetakDaftarMemoPengembalianBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7114) {
            OnClick_CetakDaftarMemoPengembalianBarangOutstanding(paramObject);
        } else if (stateDataHeader?.idCategory === 7115) {
            OnClick_CetakRincianDaftarMemoPengembalianBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7116) {
            OnClick_CetakDaftarMemoPengembalianBarangPerSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7117) {
            OnClick_CetakDaftarFakturPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7118) {
            OnClick_CetakDaftarFakturPembelianOutstanding(paramObject);
        } else if (stateDataHeader?.idCategory === 7119) {
            OnClick_CetakRincianDaftarFakturPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7120) {
            OnClick_CetakDaftarFakturPembelianPerSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7121) {
            OnClick_CetakDaftarBeliPerKelompokBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7122) {
            OnClick_CetakDaftarBeliPerKelompokBarangPeriodeBerjalan(paramObject);
        } else if (stateDataHeader?.idCategory === 7123) {
            OnClick_CetakDaftarRekapPembelianPerKelompokBarang(paramObject);
        } else if (stateDataHeader?.idCategory === 7124) {
            OnClick_CetakLaporanPembelianPerSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7125) {
        } else if (stateDataHeader?.idCategory === 7126) {
            OnClick_CetakLaporanRincianPembelianPerItem(paramObject);
        } else if (stateDataHeader?.idCategory === 7127) {
            OnClick_CetakLaporanPembelian(paramObject);
        } else if (stateDataHeader?.idCategory === 7128) {
            OnClick_CetakLaporanPembelianPerItemSupplier(paramObject);
        }
    };

    const onClickPilih = (id: any, value: any) => {
        setNumberList(id);
        setNamaList(value);
    };

    const handleSupplier = async () => {
        vRefreshData.current += 1;
        let respDataSuppFix: any;
        const resultDaftarSupplier: any[] = await DaftarSupplierAll(kode_entitas);
        if (stateDataFilter.klasifikasiSupp === 'Semua') {
            respDataSuppFix = resultDaftarSupplier;
        } else {
            const respDataSupp = resultDaftarSupplier.filter((item: any) => item.kelas === stateDataFilter.klasifikasiSupp);
            respDataSuppFix = respDataSupp;
        }
        setDataDaftarSupplier(respDataSuppFix);
        setStateDataFilter((prevState: any) => ({
            ...prevState,
            dialogSupplierVisible: true,
        }));
    };

    const handleNamaSupp = async (value: any) => {
        vRefreshData.current += 1;
        let respDataSuppFix: any;
        const resultDaftarSupplier: any[] = await DaftarSupplierAll(kode_entitas);
        if (stateDataFilter.klasifikasiSupp === 'Semua') {
            respDataSuppFix = resultDaftarSupplier;
        } else {
            const respDataSupp = resultDaftarSupplier.filter((item: any) => item.kelas === stateDataFilter.klasifikasiSupp);
            respDataSuppFix = respDataSupp;
        }
        setDataDaftarSupplier(respDataSuppFix);
        handleSearchDialog(value, respDataSuppFix);
        setStateDataFilter((prevState: any) => ({
            ...prevState,
            dialogSupplierVisible: true,
            searchNamaSupplier: value,
            tipeFilterOpen: 'Input',
            tipeFocusOpen: 'namaSupp',
        }));
    };

    const handleSearchDialog = (value: any, gridDaftarSupplier: any) => {
        if (gridDaftarSupplier && Array.isArray(gridDaftarSupplier)) {
            let filteredData = gridDaftarSupplier;

            if (value.trim() !== '') {
                filteredData = gridDaftarSupplier.filter((item) => item.nama_relasi.toLowerCase().startsWith(value.toLowerCase()));
            }
            setDataDaftarSupplier(filteredData);
        }
    };

    return (
        <div>
            <DialogComponent
                id="dialogBaseDialog"
                name="dialogBaseDialog"
                className="dialogBaseDialog"
                target="#main-target"
                // header="Pembayaran Hutang"
                header={() => {
                    let header: JSX.Element | string = '';
                    header = (
                        <div>
                            <div className="header-title">{stateDataHeader?.valueCategory} </div>
                        </div>
                    );

                    return header;
                }}
                visible={visible}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                enableResize={true}
                resizeHandles={['All']}
                allowDragging={true}
                showCloseIcon={true}
                width={
                    stateDataHeader?.idCategory === 7108 ||
                    stateDataHeader?.idCategory === 7112 ||
                    stateDataHeader?.idCategory === 7113 ||
                    stateDataHeader?.idCategory === 7114 ||
                    stateDataHeader?.idCategory === 7115 ||
                    stateDataHeader?.idCategory === 7116 ||
                    stateDataHeader?.idCategory === 7117 ||
                    stateDataHeader?.idCategory === 7118 ||
                    stateDataHeader?.idCategory === 7119 ||
                    stateDataHeader?.idCategory === 7121 ||
                    stateDataHeader?.idCategory === 7122 ||
                    stateDataHeader?.idCategory === 7123
                        ? '21%'
                        : '40%'
                } //"70%"
                height={
                    stateDataHeader?.idCategory === 7108 ||
                    stateDataHeader?.idCategory === 7112 ||
                    stateDataHeader?.idCategory === 7113 ||
                    stateDataHeader?.idCategory === 7114 ||
                    stateDataHeader?.idCategory === 7115 ||
                    stateDataHeader?.idCategory === 7116 ||
                    stateDataHeader?.idCategory === 7117 ||
                    stateDataHeader?.idCategory === 7118 ||
                    stateDataHeader?.idCategory === 7119 ||
                    stateDataHeader?.idCategory === 7121 ||
                    stateDataHeader?.idCategory === 7122 ||
                    stateDataHeader?.idCategory === 7123
                        ? '50%'
                        : '91%'
                }
                position={
                    stateDataHeader?.idCategory === 7108 ||
                    stateDataHeader?.idCategory === 7112 ||
                    stateDataHeader?.idCategory === 7113 ||
                    stateDataHeader?.idCategory === 7114 ||
                    stateDataHeader?.idCategory === 7115 ||
                    stateDataHeader?.idCategory === 7116 ||
                    stateDataHeader?.idCategory === 7117 ||
                    stateDataHeader?.idCategory === 7118 ||
                    stateDataHeader?.idCategory === 7119 ||
                    stateDataHeader?.idCategory === 7121 ||
                    stateDataHeader?.idCategory === 7122 ||
                    stateDataHeader?.idCategory === 7123
                        ? { X: 'center', Y: 200 }
                        : { X: 'center', Y: 50 }
                }
                style={{ position: 'fixed', maxHeight: 'none' }}
                close={closeModalShowBaru}
                // buttons={buttonInputData}
            >
                <div className="h-full w-full">
                    <div className="h-[calc(100%-50px)] ">
                        {stateDataHeader?.idCategory === 7101 || stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120 ? (
                            <div className="flex h-full w-full flex-col">
                                <div className="h-full border-[#989a9d] bg-white">
                                    {/* Tabs */}
                                    <Tab.Group>
                                        <div className="h-full border-[#989a9d] bg-white p-2">
                                            <Tab.List className="flex">
                                                <Tab
                                                    className={({ selected }) =>
                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'}`
                                                    }
                                                >
                                                    1. Filter & Parameter
                                                </Tab>
                                            </Tab.List>

                                            <Tab.Panels className="h-[calc(100%-20px)]">
                                                <Tab.Panel className="h-[calc(100%-20px)]">
                                                    {/* Sub-tabs */}
                                                    <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                                                        <div className="h-full border border-[#989a9d] p-2">
                                                            <Tab.List className="flex space-x-2">
                                                                <Tab
                                                                    className={({ selected }) =>
                                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${
                                                                            selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'
                                                                        }`
                                                                    }
                                                                >
                                                                    Filter
                                                                </Tab>
                                                                <Tab
                                                                    className={({ selected }) =>
                                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${
                                                                            selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'
                                                                        }`
                                                                    }
                                                                >
                                                                    Parameter
                                                                </Tab>
                                                            </Tab.List>

                                                            <Tab.Panels className="h-[calc(100%-50px)] border border-[#989a9d] bg-white p-4">
                                                                <Tab.Panel className="h-full">
                                                                    <div className="flex h-full space-x-2">
                                                                        {/* Bagian Kiri */}
                                                                        <div className="h-full w-1/4 border border-[#989a9d] p-2 text-sm font-bold">
                                                                            {stateDataHeader?.idCategory === 7101 ? (
                                                                                <label className="bg-[#2196f3] text-white">Nama Peminta</label>
                                                                            ) : stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120 ? (
                                                                                <label className="bg-[#2196f3] text-white">Nama Supplier</label>
                                                                            ) : null}
                                                                        </div>

                                                                        {/* Bagian Kanan */}
                                                                        <div className="h-full w-full">
                                                                            <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                {stateDataHeader?.idCategory === 7101 ? (
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">Nama Peminta</h3>
                                                                                ) : stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120 ? (
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">Nama Supplier</h3>
                                                                                ) : null}

                                                                                <div
                                                                                    ref={containerRef}
                                                                                    className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                    onScroll={handleScroll} // Tambahkan event scroll
                                                                                >
                                                                                    {memoizedListDataPeminta.map((item: any) => (
                                                                                        <>
                                                                                            <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    id={`checkbox-${item.id}`}
                                                                                                    value={item.id}
                                                                                                    // checked={selectedId === item.id}
                                                                                                    checked={
                                                                                                        item.id >= 0 && item.id <= 8
                                                                                                            ? namaList === 'Nama Peminta'
                                                                                                                ? selectedSingleId === item.id
                                                                                                                : selectedSingleIdSupplier === item.id
                                                                                                            : namaList === 'Nama Peminta'
                                                                                                            ? selectedMultipleIds.includes(item.id)
                                                                                                            : selectedMultipleIdsSupplier.includes(item.id)
                                                                                                    }
                                                                                                    onChange={() => {
                                                                                                        if (stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120) {
                                                                                                            handleCheckboxChangeSupplier(item.id, item.peminta);
                                                                                                        } else {
                                                                                                            handleCheckboxChange(item.id, item.peminta);
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                                <span>{item.peminta}</span>
                                                                                            </label>
                                                                                        </>
                                                                                    ))}
                                                                                </div>
                                                                                {selectedSingleId === 3 ? (
                                                                                    <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                        <DropDownListComponent
                                                                                            // key={`dropdown-${refreshKeyGudang1}`}
                                                                                            id="gudang12"
                                                                                            className="form-select "
                                                                                            dataSource={listDataPemintaOriginal.map((data: any) => data.peminta)}
                                                                                            placeholder="-- Silahkan Pilih Nama Peminta --"
                                                                                            change={(args: ChangeEventArgsDropDown) => {
                                                                                                const value: any = args.value;
                                                                                                if (stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120) {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalueSupplier: value,
                                                                                                    }));
                                                                                                } else {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalue: value,
                                                                                                    }));
                                                                                                }
                                                                                            }}
                                                                                            // value={selectedOptionGudang}
                                                                                        />
                                                                                    </div>
                                                                                ) : selectedSingleId === null || selectedSingleId === 0 ? null : (
                                                                                    <input
                                                                                        placeholder="Ketik Kata disini"
                                                                                        className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                        onChange={(event: any) => {
                                                                                            if (stateDataHeader?.idCategory === 7105 || stateDataHeader?.idCategory === 7120) {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalueSupplier: event.target.value,
                                                                                                }));
                                                                                            } else {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalue: event.target.value,
                                                                                                }));
                                                                                            }
                                                                                        }}
                                                                                    ></input>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Tab.Panel>
                                                                {/* Tab Parameter */}
                                                                <Tab.Panel>
                                                                    <div className="flex space-x-2">
                                                                        {/* Bagian Kanan */}
                                                                        <div className="mt-[-10px] w-3/4 p-2">
                                                                            <div className="h-[294px]  p-4 text-xs">
                                                                                <div className="flex">
                                                                                    <div className="w-[30%]">
                                                                                        <label className="mr-[5px] mt-[10px] block text-right text-sm font-medium">Dari Tanggal </label>
                                                                                    </div>
                                                                                    <div className="w-[50%]">
                                                                                        <div className="form-input mb-2 mt-1 flex h-[30px] w-[59%] justify-between px-[1px] pb-2 pl-2">
                                                                                            <DatePickerComponent
                                                                                                locale="id"
                                                                                                cssClass="e-custom-style "
                                                                                                // renderDayCell={onRenderDayCell}
                                                                                                enableMask={true}
                                                                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                                                showClearButton={false}
                                                                                                format="dd-MM-yyyy"
                                                                                                value={stateDataFilter.tglAwal.toDate()}
                                                                                                change={(args: ChangeEventArgsCalendar) => {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        tglAwal: moment(args.value),
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                <Inject services={[MaskedDateTime]} />
                                                                                            </DatePickerComponent>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex">
                                                                                    <div className="w-[30%]">
                                                                                        <label className="mr-[5px] mt-[10px] block text-right text-sm font-medium">s/d Tanggal </label>
                                                                                    </div>
                                                                                    <div className="w-[50%]">
                                                                                        <div className="form-input mb-2 mt-1 flex h-[30px] w-[59%] justify-between px-[1px] pb-2 pl-2">
                                                                                            <DatePickerComponent
                                                                                                locale="id"
                                                                                                cssClass="e-custom-style "
                                                                                                // renderDayCell={onRenderDayCell}
                                                                                                enableMask={true}
                                                                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                                                showClearButton={false}
                                                                                                format="dd-MM-yyyy"
                                                                                                value={stateDataFilter.tglAkhir.toDate()}
                                                                                                change={(args: ChangeEventArgsCalendar) => {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        tglAwal: moment(args.value),
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                <Inject services={[MaskedDateTime]} />
                                                                                            </DatePickerComponent>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <hr className="mt-[16px] w-[500px]"></hr>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Tab.Panel>
                                                            </Tab.Panels>
                                                        </div>
                                                    </Tab.Group>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </div>
                                    </Tab.Group>
                                </div>
                            </div>
                        ) : stateDataHeader?.idCategory === 7102 ||
                          stateDataHeader?.idCategory === 7103 ||
                          stateDataHeader?.idCategory === 7104 ||
                          stateDataHeader?.idCategory === 7106 ||
                          stateDataHeader?.idCategory === 7107 ||
                          stateDataHeader?.idCategory === 7109 ||
                          stateDataHeader?.idCategory === 7110 ||
                          stateDataHeader?.idCategory === 7111 ||
                          stateDataHeader?.idCategory === 7124 ||
                          stateDataHeader?.idCategory === 7125 ||
                          stateDataHeader?.idCategory === 7126 ||
                          stateDataHeader?.idCategory === 7127 ||
                          stateDataHeader?.idCategory === 7128 ? (
                            <>
                                <div className="h-full border-[#989a9d]">
                                    {/* Tabs */}
                                    <Tab.Group>
                                        <div className="h-full border-[#989a9d]  p-2">
                                            <Tab.List className="flex">
                                                <Tab
                                                    className={({ selected }) =>
                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'}`
                                                    }
                                                >
                                                    1. Filter & Parameter
                                                </Tab>
                                            </Tab.List>

                                            <Tab.Panels className="h-[calc(100%-20px)]">
                                                <Tab.Panel className="h-[calc(100%-20px)]">
                                                    {/* Sub-tabs */}
                                                    <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                                                        <div className="h-full border border-[#989a9d] p-2">
                                                            <Tab.List className="flex space-x-2">
                                                                <Tab
                                                                    className={({ selected }) =>
                                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${
                                                                            selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'
                                                                        }`
                                                                    }
                                                                >
                                                                    Filter
                                                                </Tab>
                                                                <Tab
                                                                    className={({ selected }) =>
                                                                        `rounded-t-md border border-[#989a9d] px-4 py-2 text-sm font-medium ${
                                                                            selected ? '-mb-px border-b-white bg-white font-bold' : 'bg-gray-100'
                                                                        }`
                                                                    }
                                                                >
                                                                    Parameter
                                                                </Tab>
                                                            </Tab.List>

                                                            <Tab.Panels className="h-[calc(100%-50px)] border border-[#989a9d] bg-white p-4">
                                                                <Tab.Panel className="h-full">
                                                                    <div className="flex h-full space-x-2">
                                                                        {/* Bagian Kiri */}
                                                                        <div className="h-full w-1/4 border border-[#989a9d] p-2 text-sm font-bold">
                                                                            {listData.map((item: any) => (
                                                                                <>
                                                                                    <label
                                                                                        onClick={() => onClickPilih(item.id, item.value)}
                                                                                        style={{
                                                                                            background: numberList === item.id ? '#2196f3' : 'white',
                                                                                            color: numberList === item.id ? 'white' : 'black',
                                                                                        }}
                                                                                        className="mb-[-2px] flex items-center space-x-2"
                                                                                    >
                                                                                        {stateDataHeader?.idCategory === 7106 ||
                                                                                        stateDataHeader?.idCategory === 7107 ||
                                                                                        stateDataHeader?.idCategory === 7109 ||
                                                                                        stateDataHeader?.idCategory === 7110 ||
                                                                                        stateDataHeader?.idCategory === 7111 ||
                                                                                        stateDataHeader?.idCategory === 7124 ||
                                                                                        stateDataHeader?.idCategory === 7125 ||
                                                                                        stateDataHeader?.idCategory === 7126 ||
                                                                                        stateDataHeader?.idCategory === 7127 ||
                                                                                        stateDataHeader?.idCategory === 7128 ? (
                                                                                            <span>
                                                                                                {item.id === 2 || item.id === 3 || item.id === 4 || item.id === 5 || item.id === 6 ? item.value : null}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span>
                                                                                                {item.id === 1 || item.id === 2 || item.id === 3 || item.id === 4 || item.id === 5 ? item.value : null}
                                                                                            </span>
                                                                                        )}
                                                                                    </label>
                                                                                </>
                                                                            ))}
                                                                        </div>
                                                                        {/* Bagian Kanan */}
                                                                        {namaList === 'Nama Peminta' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleId === item.id
                                                                                                                : selectedMultipleIds.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChange(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}

                                                                                            {/* {visibleCount < listDataPeminta.length && (
                                                                                <button onClick={handleLoadMore} className="mt-2 rounded border p-1 text-xs">
                                                                                    Muat Lebih Banyak
                                                                                </button>
                                                                            )} */}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleId === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataPemintaOriginal.map((data: any) => data.peminta)}
                                                                                                placeholder="-- Silahkan Pilih Nama Peminta --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalue: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleId === null || selectedSingleId === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalue: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : namaList === 'Nama Supplier' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleIdSupplier === item.id
                                                                                                                : selectedMultipleIdsSupplier.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChangeSupplier(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}

                                                                                            {/* {visibleCount < listDataPeminta.length && (
                                                                                <button onClick={handleLoadMore} className="mt-2 rounded border p-1 text-xs">
                                                                                    Muat Lebih Banyak
                                                                                </button>
                                                                            )} */}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleId === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataSupplierOriginal.map((data: any) => data.peminta)}
                                                                                                placeholder="-- Silahkan Pilih Nama Peminta --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalue: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleId === null || selectedSingleId === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalue: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : namaList === 'Kategori' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleIdKategori === item.id
                                                                                                                : selectedMultipleIdsKategori.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChangeKategori(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleIdKategori === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataKategoriOriginal.map((data: any) => data.grp)}
                                                                                                placeholder="-- Silahkan Pilih Kategori --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalueKategori: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleIdKategori === null || selectedSingleIdKategori === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalueKategori: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : namaList === 'Kelompok' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleIdKelompok === item.id
                                                                                                                : selectedMultipleIdsKelompok.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChangeKelompok(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleIdKelompok === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataKelompokOriginal.map((data: any) => data.kel)}
                                                                                                placeholder="-- Silahkan Pilih Kelompok --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalueKelompok: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleIdKelompok === null || selectedSingleIdKelompok === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalueKelompok: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : namaList === 'No. Item' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleIdNoItem === item.id
                                                                                                                : selectedMultipleIdsNoItem.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChangeNoItem(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleIdNoItem === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataNoItemOriginal.map((data: any) => data.no_item)}
                                                                                                placeholder="-- Silahkan Pilih No Item --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalueNoItem: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleIdNoItem === null || selectedSingleIdNoItem === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalueNoItem: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : namaList === 'Nama Item' ? (
                                                                            <div className="h-full w-full">
                                                                                <div className="border-[#989a9d]k mt-[-10px] h-full w-full p-2">
                                                                                    <h3 className="border-b border-[#989a9d] pb-1 text-sm font-bold text-blue-800">{namaList}</h3>
                                                                                    <div
                                                                                        ref={containerRef}
                                                                                        className="h-[calc(100%-35px)] overflow-y-auto border border-[#989a9d] p-2 text-xs"
                                                                                        onScroll={handleScroll} // Tambahkan event scroll
                                                                                    >
                                                                                        <>
                                                                                            {memoizedListDataPeminta.map((item: any) => (
                                                                                                <label key={item.id} className="mb-[1px] flex items-center space-x-2">
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={`checkbox-${item.id}`}
                                                                                                        value={item.id}
                                                                                                        checked={
                                                                                                            item.id >= 0 && item.id <= 8
                                                                                                                ? selectedSingleIdNamaItem === item.id
                                                                                                                : selectedMultipleIdsNamaItem.includes(item.id)
                                                                                                        }
                                                                                                        onChange={() => handleCheckboxChangeNamaItem(item.id, item.peminta)}
                                                                                                    />
                                                                                                    <span>{item.peminta}</span>
                                                                                                </label>
                                                                                            ))}
                                                                                        </>
                                                                                    </div>
                                                                                    {selectedSingleIdNamaItem === 3 ? (
                                                                                        <div className="mt-[5px] flex h-[31px] w-[100%] border border-[#989a9d]">
                                                                                            <DropDownListComponent
                                                                                                // key={`dropdown-${refreshKeyGudang1}`}
                                                                                                id="gudang12"
                                                                                                className="form-select "
                                                                                                dataSource={listDataNamaItemOriginal.map((data: any) => data.nama_item)}
                                                                                                placeholder="-- Silahkan Pilih Nama Item --"
                                                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                                                    const value: any = args.value;
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        inputvalueNamaItem: value,
                                                                                                    }));
                                                                                                }}
                                                                                                // value={selectedOptionGudang}
                                                                                            />
                                                                                        </div>
                                                                                    ) : selectedSingleIdNamaItem === null || selectedSingleIdNamaItem === 0 ? null : (
                                                                                        <input
                                                                                            placeholder="Ketik Kata disini"
                                                                                            className="mt-[5px] h-[31px] w-[100%] border border-[#989a9d]"
                                                                                            onChange={(event: any) => {
                                                                                                setStateDataFilter((prevState: any) => ({
                                                                                                    ...prevState,
                                                                                                    inputvalueNamaItem: event.target.value,
                                                                                                }));
                                                                                            }}
                                                                                        ></input>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                </Tab.Panel>
                                                                {/* Tab Parameter */}
                                                                <Tab.Panel>
                                                                    <div className="flex space-x-2">
                                                                        {/* Bagian Kanan */}
                                                                        <div className="mt-[-10px] w-[100%] p-2">
                                                                            <div className="h-[294px]  p-4 text-xs">
                                                                                <div className="flex">
                                                                                    <div className="w-[30%]">
                                                                                        <label className="mr-[5px] mt-[10px] block text-right text-sm font-medium">Dari Tanggal </label>
                                                                                    </div>
                                                                                    <div className="w-[50%]">
                                                                                        <div className="form-input mb-2 mt-1 flex h-[30px] w-[59%] justify-between px-[1px] pb-2 pl-2">
                                                                                            <DatePickerComponent
                                                                                                locale="id"
                                                                                                cssClass="e-custom-style "
                                                                                                // renderDayCell={onRenderDayCell}
                                                                                                enableMask={true}
                                                                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                                                showClearButton={false}
                                                                                                format="dd-MM-yyyy"
                                                                                                value={stateDataFilter.tglAwal.toDate()}
                                                                                                change={(args: ChangeEventArgsCalendar) => {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        tglAwal: moment(args.value),
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                <Inject services={[MaskedDateTime]} />
                                                                                            </DatePickerComponent>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex">
                                                                                    <div className="w-[30%]">
                                                                                        <label className="mr-[5px] mt-[10px] block text-right text-sm font-medium">s/d Tanggal </label>
                                                                                    </div>
                                                                                    <div className="w-[50%]">
                                                                                        <div className="form-input mb-2 mt-1 flex h-[30px] w-[59%] justify-between px-[1px] pb-2 pl-2">
                                                                                            <DatePickerComponent
                                                                                                locale="id"
                                                                                                cssClass="e-custom-style "
                                                                                                // renderDayCell={onRenderDayCell}
                                                                                                enableMask={true}
                                                                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                                                showClearButton={false}
                                                                                                format="dd-MM-yyyy"
                                                                                                value={stateDataFilter.tglAkhir.toDate()}
                                                                                                change={(args: ChangeEventArgsCalendar) => {
                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                        ...prevState,
                                                                                                        tglAwal: moment(args.value),
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                <Inject services={[MaskedDateTime]} />
                                                                                            </DatePickerComponent>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <hr className="mb-[20px] mt-[16px] w-[500px]"></hr>
                                                                                {stateDataHeader?.idCategory === 7102 || stateDataHeader?.idCategory === 7106 ? (
                                                                                    <div className="flex">
                                                                                        <div className="w-[70%]"></div>
                                                                                        <div className="w-[227px]">
                                                                                            <div className="relative inline-block rounded-md border border-gray-400 p-4">
                                                                                                {/* Label pada garis border */}
                                                                                                <legend className="absolute left-4 top-0 -mt-3 bg-white px-2 text-sm font-semibold">
                                                                                                    {stateDataHeader?.idCategory === 7102 ? 'Data Permintaan' : 'Data PO'}
                                                                                                </legend>
                                                                                                <div className="mt-2 flex space-x-6">
                                                                                                    <label className="flex items-center space-x-2">
                                                                                                        <input
                                                                                                            type="radio"
                                                                                                            name="request"
                                                                                                            value="semua"
                                                                                                            checked={selectedOd === 'semua'}
                                                                                                            onChange={() => setSelectedOd('semua')}
                                                                                                            className="form-radio text-blue-600"
                                                                                                        />
                                                                                                        <span>Semua</span>
                                                                                                    </label>
                                                                                                    <label className="flex items-center space-x-2">
                                                                                                        <input
                                                                                                            type="radio"
                                                                                                            name="request"
                                                                                                            value="outstanding"
                                                                                                            checked={selectedOd === 'outstanding'}
                                                                                                            onChange={() => setSelectedOd('outstanding')}
                                                                                                            className="form-radio text-blue-600"
                                                                                                        />
                                                                                                        <span>Outstanding</span>
                                                                                                    </label>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : stateDataHeader?.idCategory === 7109 ||
                                                                                  stateDataHeader?.idCategory === 7110 ||
                                                                                  stateDataHeader?.idCategory === 7124 ||
                                                                                  stateDataHeader?.idCategory === 7126 ? (
                                                                                    <>
                                                                                        <div className="flex">
                                                                                            <div className="w-[70%]">
                                                                                                <div className="mt-[100px] flex">
                                                                                                    <div style={{ width: '22%', marginTop: '8px' }}>
                                                                                                        <label className="flex items-center space-x-2">
                                                                                                            <span>No. SJ Supplier : </span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <div style={{ width: '45%' }}>
                                                                                                        <div className="mt-1 flex justify-between">
                                                                                                            <input
                                                                                                                className={` container form-input`}
                                                                                                                style={{
                                                                                                                    fontSize: 11,
                                                                                                                    // marginTop: 4,
                                                                                                                    marginLeft: 0,
                                                                                                                    borderColor: '#bfc9d4',
                                                                                                                    width: '100%',
                                                                                                                    borderRadius: 5,
                                                                                                                }}
                                                                                                                // disabled={true}
                                                                                                                // value={stateFiilterData?.noRBaValue}
                                                                                                                onChange={(event) => {
                                                                                                                    const value: any = event.target.value;
                                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                                        ...prevState,
                                                                                                                        noSjSupp: value,
                                                                                                                    }));
                                                                                                                }}
                                                                                                            ></input>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {stateDataHeader?.idCategory === 7126 ? (
                                                                                                    <div className=" flex">
                                                                                                        <div style={{ width: '22%', marginTop: '8px' }}>
                                                                                                            <label
                                                                                                                style={{ textAlign: 'right', marginRight: '10px' }}
                                                                                                                className="items-center space-x-2"
                                                                                                            >
                                                                                                                <span>No. PB : </span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                        <div style={{ width: '45%' }}>
                                                                                                            <div className="mt-1 flex justify-between">
                                                                                                                <input
                                                                                                                    className={` container form-input`}
                                                                                                                    style={{
                                                                                                                        fontSize: 11,
                                                                                                                        // marginTop: 4,
                                                                                                                        marginLeft: 0,
                                                                                                                        borderColor: '#bfc9d4',
                                                                                                                        width: '100%',
                                                                                                                        borderRadius: 5,
                                                                                                                    }}
                                                                                                                    // disabled={true}
                                                                                                                    // value={stateFiilterData?.noRBaValue}
                                                                                                                    onChange={(event) => {
                                                                                                                        const value: any = event.target.value;
                                                                                                                        setStateDataFilter((prevState: any) => ({
                                                                                                                            ...prevState,
                                                                                                                            noPb: value,
                                                                                                                        }));
                                                                                                                    }}
                                                                                                                ></input>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : null}
                                                                                            </div>

                                                                                            <div className="w-[30%]"></div>
                                                                                        </div>
                                                                                    </>
                                                                                ) : stateDataHeader?.idCategory === 7111 ? (
                                                                                    <>
                                                                                        <div className="flex">
                                                                                            <div className="w-[50%]">
                                                                                                <div className="mt-[100px] flex">
                                                                                                    <div style={{ width: '30%' }}></div>
                                                                                                    <div style={{ width: '22%', marginTop: '8px' }}>
                                                                                                        <label style={{ textAlign: 'center' }} className="items-center space-x-2">
                                                                                                            <span>No. PB : </span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <div style={{ width: '45%' }}>
                                                                                                        <div className="mt-1 flex justify-between">
                                                                                                            <input
                                                                                                                className={` container form-input`}
                                                                                                                style={{
                                                                                                                    fontSize: 11,
                                                                                                                    // marginTop: 4,
                                                                                                                    marginLeft: 0,
                                                                                                                    borderColor: '#bfc9d4',
                                                                                                                    width: '100%',
                                                                                                                    borderRadius: 5,
                                                                                                                }}
                                                                                                                // disabled={true}
                                                                                                                // value={stateFiilterData?.noRBaValue}
                                                                                                                onChange={(event) => {
                                                                                                                    const value: any = event.target.value;
                                                                                                                    setStateDataFilter((prevState: any) => ({
                                                                                                                        ...prevState,
                                                                                                                        noPb: value,
                                                                                                                    }));
                                                                                                                }}
                                                                                                            ></input>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-[50%]">
                                                                                                <div className="relative mt-[81px] inline-block w-[200px] rounded-md border border-gray-400 p-4">
                                                                                                    {/* Label pada garis border */}
                                                                                                    <legend className="absolute left-4 top-0 -mt-3 bg-white px-2 text-sm font-semibold">
                                                                                                        Grup Per Dokumen
                                                                                                    </legend>
                                                                                                    <div className="mt-2 flex space-x-6">
                                                                                                        <label className="flex items-center space-x-2">
                                                                                                            <input
                                                                                                                type="radio"
                                                                                                                name="request"
                                                                                                                value="ya"
                                                                                                                checked={grupPerDokumen === 'ya'}
                                                                                                                onChange={() => setGrupPerDokumen('ya')}
                                                                                                                className="form-radio text-blue-600"
                                                                                                            />
                                                                                                            <span>Ya</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center space-x-2">
                                                                                                            <input
                                                                                                                type="radio"
                                                                                                                name="request"
                                                                                                                value="tidak"
                                                                                                                checked={grupPerDokumen === 'tidak'}
                                                                                                                onChange={() => setGrupPerDokumen('ya')}
                                                                                                                className="form-radio text-blue-600"
                                                                                                            />
                                                                                                            <span>Tidak</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </>
                                                                                ) : stateDataHeader?.idCategory === 7127 ? (
                                                                                    <div className="flex">
                                                                                        <div className="w-[60%]"></div>
                                                                                        <div className="w-[40%]">
                                                                                            <div style={{ width: '100%' }} className="relative inline-block rounded-md border border-gray-400 p-4">
                                                                                                {/* Label pada garis border */}
                                                                                                <legend className="absolute left-4 top-0 -mt-3 bg-white px-2 text-sm font-semibold">Kuantitas</legend>
                                                                                                <div className="mt-2 flex space-x-6">
                                                                                                    <div className="flex w-[100%]">
                                                                                                        <div style={{ width: '60%' }}>
                                                                                                            <label className="flex items-center space-x-2">
                                                                                                                <input
                                                                                                                    type="radio"
                                                                                                                    name="request"
                                                                                                                    value="semua"
                                                                                                                    checked={selectedKuantitas === 'semua'}
                                                                                                                    onChange={() => setSelectedKuantitas('semua')}
                                                                                                                    className="form-radio text-blue-600"
                                                                                                                />
                                                                                                                <span>Semua</span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                        <div style={{ width: '40%' }}>
                                                                                                            <label className="flex items-center space-x-2">
                                                                                                                <input
                                                                                                                    type="radio"
                                                                                                                    name="request"
                                                                                                                    value="tidakSama"
                                                                                                                    checked={selectedKuantitas === 'tidakSama'}
                                                                                                                    onChange={() => setSelectedKuantitas('tidakSama')}
                                                                                                                    className="form-radio text-blue-600"
                                                                                                                />
                                                                                                                <span>{'<> 0'}</span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="mt-2 flex space-x-6">
                                                                                                    <div className="flex w-[100%]">
                                                                                                        <div style={{ width: '60%' }}>
                                                                                                            <label className="flex items-center space-x-2">
                                                                                                                <input
                                                                                                                    type="radio"
                                                                                                                    name="request"
                                                                                                                    value="samaDengan"
                                                                                                                    checked={selectedKuantitas === 'samaDengan'}
                                                                                                                    onChange={() => setSelectedKuantitas('samaDengan')}
                                                                                                                    className="form-radio text-blue-600"
                                                                                                                />
                                                                                                                <span>{'= 0'}</span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                        <div style={{ width: '40%' }}>
                                                                                                            <label className="flex items-center space-x-2">
                                                                                                                <input
                                                                                                                    type="radio"
                                                                                                                    name="request"
                                                                                                                    value="lebihKecil"
                                                                                                                    checked={selectedKuantitas === 'lebihKecil'}
                                                                                                                    onChange={() => setSelectedKuantitas('lebihKecil')}
                                                                                                                    className="form-radio text-blue-600"
                                                                                                                />
                                                                                                                <span>{'< 0'}</span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="mt-2 flex space-x-6">
                                                                                                    <label className="flex items-center space-x-2">
                                                                                                        <input
                                                                                                            type="radio"
                                                                                                            name="request"
                                                                                                            value="lebihBesar"
                                                                                                            checked={selectedKuantitas === 'lebihBesar'}
                                                                                                            onChange={() => setSelectedKuantitas('lebihBesar')}
                                                                                                            className="form-radio text-blue-600"
                                                                                                        />
                                                                                                        <span>{'> 0'}</span>
                                                                                                    </label>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Tab.Panel>
                                                            </Tab.Panels>
                                                        </div>
                                                    </Tab.Group>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </div>
                                    </Tab.Group>
                                </div>
                            </>
                        ) : stateDataHeader?.idCategory === 7108 || stateDataHeader?.idCategory === 7112 || stateDataHeader?.idCategory === 7116 ? (
                            <>
                                <div className="mb-3 rounded-lg border p-3" style={{ height: '350px' }}>
                                    {/* Periode Tanggal */}
                                    <h3 className="font-semibold" style={{ background: '#567295', textAlign: 'center', color: 'white' }}>
                                        Periode Tgl.
                                    </h3>

                                    <div className="flex">
                                        <div style={{ width: '45%' }}>
                                            <div className="mt-2">
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '100%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style "
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={stateDataFilter.tglAwal.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setStateDataFilter((prevState: any) => ({
                                                                ...prevState,
                                                                tglAwal: moment(args.value),
                                                            }));
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: '10%' }}>
                                            <label style={{ textAlign: 'center', marginTop: '15px' }}>s/d</label>
                                        </div>
                                        <div style={{ width: '45%' }}>
                                            <div className="mt-2">
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '100%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style "
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={stateDataFilter.tglAkhir.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setStateDataFilter((prevState: any) => ({
                                                                ...prevState,
                                                                tglAkhir: moment(args.value),
                                                            }));
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nama Supplier */}
                                    <div className="mb-3" style={{ marginTop: '5%' }}>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={stateDataFilter.isNamaSuppChecked}
                                                className="mr-2"
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    const value: any = event.target.checked;
                                                    setStateDataFilter((prevState: any) => ({
                                                        ...prevState,
                                                        isNamaSuppChecked: value,
                                                        noSupplierValue: '',
                                                        namaSupplierValue: '',
                                                        kodeSupplierValue: '',
                                                    }));
                                                }}
                                            />
                                            Nama Supplier
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                onChange={(event) => handleNamaSupp(event.target.value)}
                                                type="text"
                                                value={stateDataFilter.namaSupplierValue}
                                                className="w-full rounded border px-2 py-1"
                                                placeholder="Cari Supplier..."
                                            />
                                            <span style={{ marginTop: '-5px' }} className="absolute right-2 top-2 text-gray-800" onClick={handleSupplier}>
                                                {' '}
                                                <FontAwesomeIcon icon={faSearch} width="18" height="18" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : stateDataHeader?.idCategory === 7113 ||
                          stateDataHeader?.idCategory === 7114 ||
                          stateDataHeader?.idCategory === 7115 ||
                          stateDataHeader?.idCategory === 7117 ||
                          stateDataHeader?.idCategory === 7118 ||
                          stateDataHeader?.idCategory === 7119 ||
                          stateDataHeader?.idCategory === 7122 ||
                          stateDataHeader?.idCategory === 7123 ? (
                            <>
                                <div className="mb-3 rounded-lg border p-3" style={{ height: '350px' }}>
                                    <div className="flex">
                                        <div style={{ width: '20%', marginTop: '15px' }}>
                                            <label>
                                                <span>Periode Tgl.</span>
                                            </label>
                                        </div>
                                        <div style={{ width: '35%' }}>
                                            <div className="mt-2">
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '100%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style "
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={stateDataFilter.tglAwal.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setStateDataFilter((prevState: any) => ({
                                                                ...prevState,
                                                                tglAwal: moment(args.value),
                                                            }));
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: '10%' }}>
                                            <label style={{ textAlign: 'center', marginTop: '15px' }}>s/d</label>
                                        </div>
                                        <div style={{ width: '35%' }}>
                                            <div className="mt-2">
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '100%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style "
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={stateDataFilter.tglAkhir.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setStateDataFilter((prevState: any) => ({
                                                                ...prevState,
                                                                tglAkhir: moment(args.value),
                                                            }));
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : stateDataHeader?.idCategory === 7121 ? (
                            <>
                                <div className="mb-3 rounded-lg border p-3" style={{ height: '350px' }}>
                                    <div className="flex">
                                        <div style={{ width: '20%' }}></div>
                                        <div style={{ width: '30%', marginTop: '15px' }}>
                                            <label>
                                                <span>Sampai dengan Tgl.</span>
                                            </label>
                                        </div>
                                        <div style={{ width: '35%' }}>
                                            <div className="mt-2">
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '100%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style "
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={stateDataFilter.tglAkhir.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setStateDataFilter((prevState: any) => ({
                                                                ...prevState,
                                                                tglAkhir: moment(args.value),
                                                            }));
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: '15%' }}></div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                        {/* <div className="flex h-[50px] justify-end gap-2  border-[#989a9d] bg-gray-200 p-2">
                            <button className="rounded-md border border-[#989a9d] bg-white px-4 py-1 font-bold hover:bg-gray-300" onClick={() => showLaporan()}>
                                OK
                            </button>
                            <button className="rounded-md border border-[#989a9d] bg-white px-4 py-1 font-bold hover:bg-gray-300" onClick={closeModalShowBaru}>
                                Batal
                            </button>
                        </div> */}
                    </div>
                    <div className="flex h-[50px] justify-end gap-2  border-[#989a9d] bg-gray-200 p-2">
                        <button className="rounded-md border border-[#989a9d] bg-white px-4 py-1 font-bold hover:bg-gray-300" onClick={() => showLaporan()}>
                            OK
                        </button>
                        <button className="rounded-md border border-[#989a9d] bg-white px-4 py-1 font-bold hover:bg-gray-300" onClick={closeModalShowBaru}>
                            Batal
                        </button>
                    </div>
                </div>
            </DialogComponent>
            {/*=================================== Modal dialog untuk Daftar Supplier =============================*/}
            <DialogSupplier
                kode_entitas={kode_entitas}
                token={token}
                visible={stateDataFilter.dialogSupplierVisible}
                dataDaftarSupplier={dataDaftarSupplier}
                stateDataFilter={stateDataFilter}
                setDataDaftarSupplier={setDataDaftarSupplier}
                setStateDataFilter={setStateDataFilter}
                vRefreshData={vRefreshData.current}
            />
        </div>
    );
};

export default BaseDialog;

import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../polist.module.css';
import moment from 'moment';
import { FillFromSQL, frmNumber } from '@/utils/routines';
import { showLoading } from '@/utils/routines';
import swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { DlgHargaItemTerakhir } from '../model/api';

interface listPOProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    produksi: any;
    kode_entitas: any;
    valueNoBarang: any;
    tipeValue: any;
    valueNamaBarang: any;
    valueNoPp: any;
    nilaiTotalId: number;
    jenisBarang: any;
    vRefreshData: any;
}

const DaftarPpItem: React.FC<listPOProps> = ({
    isOpen = false,
    onClose,
    onSelectData,
    produksi,
    kode_entitas,
    valueNoBarang,
    tipeValue,
    valueNamaBarang,
    valueNoPp,
    nilaiTotalId,
    jenisBarang,
    vRefreshData,
}) => {
    const router = useRouter();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTermNoBarang, setSearchTermNoBarang] = useState('');
    const [selectedOptionKategori, setSelectedOptionKetgori] = useState<string>('');
    const [kategoriChecked, setKategoriChecked] = useState<boolean>(false);
    const [selectedOptionKelompok, setSelectedOptionKelompok] = useState<string>('');
    const [kelompokChecked, setKelompokChecked] = useState<boolean>(false);
    const [selectedOptionMerk, setSelectedOptionMerk] = useState<string>('');
    const [merkChecked, setMerkChecked] = useState<boolean>(false);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    // let dataObject: any;
    const [dataObject, setDataObject] = useState({});
    const handleSelectData = (
        idPp: any,
        noPp: string,
        noItem: string,
        diskripsi: string,
        satuan: string,
        sisa: any,
        kuantitasKg: any,
        diameter: any,
        jarakCm: any,
        kgBtg: any,
        hargaKg: any,
        kuantitasBtg: any,
        hargaBtg: any,
        qty: any,
        berat: any,
        brt: any,
        kode_pp: any,
        id_pp: any,
        kode_item: any,
        qty_asli: any,
        qty_sisa: any,
        qty_batal: any,
        kode_mu: any,
        kurs: any,
        kurs_pajak: any,
        diskon_mu: any,
        kode_pajak: any,
        include: any,
        pajak_mu: any,
        kode_dept: any,
        kontrak: any,
        kodecabang: any,
        keterangan: any,
        index: number
    ) => {
        setSelectedRowIndex(index);
        setDataObject({
            idPp,
            noPp,
            property: 'data',
            noItem,
            diskripsi,
            satuan,
            sisa,
            qty,
            kuantitasKg,
            diameter,
            jarakCm,
            kgBtg,
            hargaKg,
            kuantitasBtg,
            hargaBtg,
            berat,
            brt,
            kode_pp,
            id_pp,
            kode_item,
            qty_asli,
            qty_sisa,
            qty_batal,
            kode_mu: 'IDR',
            kurs: 1,
            kurs_pajak: 1,
            diskon_mu,
            kode_pajak,
            include,
            pajak_mu,
            kode_dept,
            kontrak,
            kodecabang,
            keterangan,
        });
    };

    const handleOKClick = () => {
        onSelectData(dataObject);
        onClose();
    };

    const [apiResponseDlgItem, setApiResponseDlgItem] = useState({
        status: false,
        message: '',
        data: [],
    });

    const [apiResponseKategori, setApiResponseKategori] = useState<any[]>([]);
    const [apiResponseKelompok, setApiResponseKelompok] = useState<any[]>([]);
    const [apiResponseMerk, setApiResponseMerk] = useState<any[]>([]);

    const currentDate = moment();
    const tanggal = currentDate.format('YYYY-MM-DD');
    console.log('vRefreshData = ', vRefreshData);

    useEffect(() => {
        const obj = {
            entitas: kode_entitas,
            where: {
                // kode_supp: ${kodeSupp},
                produksi: produksi,
                tgl: tanggal,
                kategori: '%',
                kelompok: '%',
                merk: '%',
            },
        };

        const jsonString = JSON.stringify(obj);
        const encodedString = btoa(jsonString);
        // localhost:4001/erp/dlg_detail_pp_item_filter?entitas=999&produksi=N&tgl=2025-04-28&kategori=all&kelompok=all&merk=all&tipe=Non Persediaan

        const fetchData = async () => {
            try {
                // const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_pp_item`, {
                //     params: {
                //         cmd: encodedString,
                //     },
                // });

                const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_pp_item_filter`, {
                    params: {
                        entitas: kode_entitas,
                        produksi: produksi,
                        tgl: tanggal,
                        kategori: 'all',
                        kelompok: 'all',
                        merk: 'all',
                        tipe: jenisBarang === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                    },
                });

                setApiResponseDlgItem(response1.data);
                console.log(response1.data.data);

                const kategoriApi = await FillFromSQL(kode_entitas, 'kategori', '')
                    .then((result) => {
                        setApiResponseKategori(result);
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

                const kelompokApi = await FillFromSQL(kode_entitas, 'kelompok', '')
                    .then((result) => {
                        setApiResponseKelompok(result);
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

                const merkApi = await FillFromSQL(kode_entitas, 'merk', '')
                    .then((result) => {
                        setApiResponseMerk(result);
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

        setSearchKeywordNamaBarang('');
        setSearchKeywordNoBarang('');
        setSearchKeywordNoPp('');
        setSelectedOptionKetgori('');
        setSelectedOptionKelompok('');
        setSelectedOptionMerk('');
        setKategoriChecked(false);
        setKelompokChecked(false);
        setMerkChecked(false);
    }, [produksi, tanggal, kode_entitas, vRefreshData]);

    useEffect(() => {
        console.log('Tipe Value' + tipeValue);
        if (tipeValue === 'no_barang') {
            handleSearchValueNoBarang(valueNoBarang);
            console.log('No barang' + valueNoBarang);
        }
    }, [valueNoBarang, nilaiTotalId]);

    useEffect(() => {
        console.log('Tipe Value1' + tipeValue);
        if (tipeValue === 'nama_barang') {
            handleSearchValueNamaBarang(valueNamaBarang);
            console.log('Nama barang' + valueNoBarang);
        }
    }, [valueNamaBarang, nilaiTotalId]);

    useEffect(() => {
        console.log('Tipe Value2' + tipeValue);
        if (tipeValue === 'no_spp') {
            handleSearchValueNoPp(valueNoPp);
            console.log('No PP' + valueNoPp);
        }
    }, [valueNoPp, nilaiTotalId]);

    const detailPPItem = apiResponseDlgItem.data.map((item: any) => ({
        no_pp: item.no_pp,
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        sisa: item.sisa,
        fpp_qty: item.fpp_qty,
        fpp_diameter: item.fpp_diameter,
        fpp_jarak: item.fpp_jarak,
        fpp_kg: item.fpp_kg,
        fpp_harga_kg: item.fpp_harga_kg,
        fpp_btg: item.fpp_btg,
        fpp_harga_btg: item.fpp_harga_btg,
        qty: item.qty,
        berat: item.berat,
        brt: item.brt,
        kode_pp: item.kode_pp,
        id_pp: item.id_pp,
        kode_item: item.kode_item,
        qty_asli: item.qty,
        qty_sisa: item.qty_sisa,
        qty_batal: item.qty_batal,
        kode_mu: item.kode_mu,
        kurs: item.kurs,
        kurs_pajak: item.kurs_pajak,
        diskon_mu: item.diskon_mu,
        kode_pajak: item.kode_pajak,
        include: item.include,
        pajak_mu: item.pajak_mu,
        kode_dept: item.kode_dept,
        kontrak: item.kontrak,
        kodecabang: item.kodecabang,
        keterangan: item.keterangan,
    }));

    const commonTableStyle: React.CSSProperties = {
        border: '1px solid #bbbbbb',
        padding: '8px',
        cursor: 'pointer',
        userSelect: 'none',
    };

    const tableStyle: React.CSSProperties = {
        ...commonTableStyle,
    };

    const tableStyleHeader: React.CSSProperties = {
        ...commonTableStyle,
        backgroundColor: 'rgb(94, 98, 98)',
        color: 'white',
        textAlign: 'left',
    };

    const handleKategoriChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedOptionKetgori(newValue);
        setKategoriChecked(newValue.length > 0);
    };

    const handleKelompokChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedOptionKelompok(newValue);
        setKelompokChecked(newValue.length > 0);
    };

    const handleMerkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedOptionMerk(newValue);
        setMerkChecked(newValue.length > 0);
    };

    const filteredDataNoPp = detailPPItem.filter((data) => data.no_pp.toLowerCase().includes(searchTerm.toLowerCase()) && data.no_item.toLowerCase().includes(searchTermNoBarang.toLowerCase()));

    // if (filteredDataNoPp.length === 0) {
    //     // Reset nilai pencarian
    //     setSearchTerm('');
    //     setSearchTermNoBarang('');
    // }

    const [searchKeywordNoPp, setSearchKeywordNoPp] = useState<string>('');
    const [searchKeywordNoBarang, setSearchKeywordNoBarang] = useState<string>('');
    const [searchKeywordNamaBarang, setSearchKeywordNamaBarang] = useState<string>('');
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const handleSearchNoPp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoPp(searchValue);
        const filteredData = searchDataNoPp(searchValue);
        setFilteredData(filteredData);

        const noBarangInput = document.getElementById('noBarangInput') as HTMLInputElement;
        const namaBarangInput = document.getElementById('namaBarangInput') as HTMLInputElement;

        if (noBarangInput) {
            noBarangInput.value = '';
        }
        if (namaBarangInput) {
            namaBarangInput.value = '';
        }
    };

    const handleSearchValueNoPp = (data: any) => {
        setSearchNoPpFocus(1);
        setSearchNoBarangFocus(2);
        setSearchNamaBarangFocus(3);
        const searchValue = data;
        setSearchKeywordNoPp(searchValue);
        const filteredData = searchDataNoPp(searchValue);
        setFilteredData(filteredData);

        const noBarangInput = document.getElementById('noBarangInput') as HTMLInputElement;
        const namaBarangInput = document.getElementById('namaBarangInput') as HTMLInputElement;

        if (noBarangInput) {
            noBarangInput.value = '';
        }
        if (namaBarangInput) {
            namaBarangInput.value = '';
        }
    };

    const searchDataNoPp = (keyword: any) => {
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPPItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailPPItem.filter((item) => item.no_pp.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const handleSearchNoBarang = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoBarang(searchValue);
        const filteredData = searchDataNoBarang(searchValue);
        setFilteredData(filteredData);

        const noPpInput = document.getElementById('noPpInput') as HTMLInputElement;
        const namaBarangInput = document.getElementById('namaBarangInput') as HTMLInputElement;

        if (noPpInput) {
            noPpInput.value = '';
        }
        if (namaBarangInput) {
            namaBarangInput.value = '';
        }
    };
    const handleSearchValueNoBarang = (data: any) => {
        setSearchNoPpFocus(2);
        setSearchNoBarangFocus(1);
        setSearchNamaBarangFocus(2);
        console.log('data' + data);
        const searchValue = data;
        setSearchKeywordNoBarang(searchValue);
        const filteredData = searchDataNoBarang(searchValue);
        setFilteredData(filteredData);

        const noPpInput = document.getElementById('noPpInput') as HTMLInputElement;
        const namaBarangInput = document.getElementById('namaBarangInput') as HTMLInputElement;

        if (noPpInput) {
            noPpInput.value = '';
        }
        if (namaBarangInput) {
            namaBarangInput.value = '';
        }
    };

    const searchDataNoBarang = (keyword: any) => {
        console.log('keyword' + keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPPItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            // const filteredData = detailPPItem.filter((item) => item.no_item.toLowerCase().includes(keyword.toLowerCase()));
            const filteredData = detailPPItem.filter((item) => item.no_item.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const handleSearchNamaBarang = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNamaBarang(searchValue);
        const filteredData = searchDataNamaBarang(searchValue);
        setFilteredData(filteredData);

        const noPpInput = document.getElementById('noPpInput') as HTMLInputElement;
        const noBarangInput = document.getElementById('noBarangInput') as HTMLInputElement;

        if (noPpInput) {
            noPpInput.value = '';
        }

        if (noBarangInput) {
            noBarangInput.value = '';
        }
    };

    const handleSearchValueNamaBarang = (data: any) => {
        setSearchNoPpFocus(2);
        setSearchNoBarangFocus(3);
        setSearchNamaBarangFocus(1);
        const searchValue = data;
        setSearchKeywordNamaBarang(searchValue);
        const filteredData = searchDataNamaBarang(searchValue);
        setFilteredData(filteredData);

        const noPpInput = document.getElementById('noPpInput') as HTMLInputElement;
        const noBarangInput = document.getElementById('noBarangInput') as HTMLInputElement;

        if (noPpInput) {
            noPpInput.value = '';
        }

        if (noBarangInput) {
            noBarangInput.value = '';
        }
    };

    const searchDataNamaBarang = (keyword: any) => {
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPPItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailPPItem.filter((item) => item.diskripsi.toLowerCase().startsWith(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const refreshData = async (tipe: string) => {
        // showLoading();
        // setSearchKeywordNamaBarang('');
        // setSearchKeywordNoBarang('');
        // setSearchKeywordNoPp('');

        if (tipe === 'close') {
            setKategoriChecked(false);
            setKelompokChecked(false);
            setMerkChecked(false);
            setSelectedOptionKelompok('');
            setSelectedOptionMerk('');
            setSelectedOptionKetgori('');
            setSearchKeywordNamaBarang('');
            setSearchKeywordNoBarang('');
            setSearchKeywordNoPp('');

            const obj = {
                entitas: kode_entitas,
                where: {
                    // kode_supp: ${kodeSupp},
                    produksi: produksi,
                    tgl: tanggal,
                    kategori: '%',
                    kelompok: '%',
                    merk: '%',
                },
            };

            const jsonString = JSON.stringify(obj);
            const encodedString = btoa(jsonString);

            try {
                const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_pp_item`, {
                    params: {
                        cmd: encodedString,
                    },
                });
                setApiResponseDlgItem(response1.data);
                console.log(response1.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            if (kode_entitas !== null || kode_entitas !== '') {
                try {
                    let vKategori = '%';
                    let vKelompok = '%';
                    let vMerk = '%';

                    if (kategoriChecked) {
                        vKategori = `${selectedOptionKategori}`;
                    }

                    if (kelompokChecked) {
                        vKelompok = `${selectedOptionKelompok}`;
                    }

                    if (merkChecked) {
                        vMerk = `${selectedOptionMerk}`;
                    }

                    const obj = {
                        entitas: kode_entitas,
                        where: {
                            // kode_supp: ${kodeSupp},
                            produksi: produksi,
                            tgl: tanggal,
                            kategori: vKategori,
                            kelompok: vKelompok,
                            merk: vMerk,
                        },
                    };

                    const jsonString = JSON.stringify(obj);
                    const encodedString = btoa(jsonString);

                    try {
                        const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_pp_item`, {
                            params: {
                                cmd: encodedString,
                            },
                        });
                        setApiResponseDlgItem(response1.data);
                        console.log(response1.data.data);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }

        if (kode_entitas == null || kode_entitas == '') {
            alert('Silahkan Login Kembali, Session Habis');
            setTimeout(() => {
                router.push({ pathname: '/' });
            }, 1000);
        }
        swal.close();
    };

    const handleOnClose = async () => {
        const refresh = await refreshData('close');
        onClose();
    };

    const [searchNoPpFocus, setSearchNoPpFocus] = useState(1);
    const [searchNoBarangFocus, setSearchNoBarangFocus] = useState(1);
    const [searchNamaBarangFocus, setSearchNamaBarangFocus] = useState(1);

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                {/* ... Modal Overlay ... */}
                <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] bg-[black]/60">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* ... Modal Content ... */}
                            <Dialog.Panel className={`panel my-8 rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Daftar Permintaan Pembelian (PP)</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <input
                                                type="text"
                                                placeholder="No. PP"
                                                style={{ borderColor: '#958b8b' }}
                                                className="form-input mb-3 h-[3.5vh]"
                                                id="noPpInput"
                                                defaultValue={valueNoPp}
                                                // value={searchTerm}
                                                // onChange={(e) => setSearchTerm(e.target.value)}
                                                // onClick={() => handleSearch()}
                                                onChange={handleSearchNoPp}
                                                tabIndex={searchNoPpFocus}
                                            />
                                            <div style={{ height: '35vh', marginTop: 5 }}>
                                                <div className="mt-3 flex justify-between">
                                                    <label className="flex cursor-pointer items-center">
                                                        <input type="checkbox" className="form-checkbox" checked={kategoriChecked} onChange={() => setKategoriChecked(!kategoriChecked)} />
                                                        <span>Kategori</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <select id="kategori" className="form-select" onChange={handleKategoriChange} value={selectedOptionKategori}>
                                                        <option value="" disabled hidden>
                                                            {'--Silahkan Pilih--'}
                                                        </option>
                                                        {apiResponseKategori.map((data: any) => (
                                                            <option key={data.grp} value={data.grp}>
                                                                {data.grp}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mt-3 flex justify-between">
                                                    <label className="flex cursor-pointer items-center">
                                                        <input type="checkbox" className="form-checkbox" checked={kelompokChecked} onChange={() => setKelompokChecked(!kelompokChecked)} />
                                                        <span>Kelompok Produk</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <select id="kelompok" className="form-select" onChange={handleKelompokChange} value={selectedOptionKelompok}>
                                                        <option value="" disabled hidden>
                                                            {'--Silahkan Pilih--'}
                                                        </option>
                                                        {apiResponseKelompok.map((data: any) => (
                                                            <option key={data.kel} value={data.kel}>
                                                                {data.kel}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mt-3 flex justify-between">
                                                    <label className="flex cursor-pointer items-center">
                                                        <input type="checkbox" className="form-checkbox" checked={merkChecked} onChange={() => setMerkChecked(!merkChecked)} />
                                                        <span>Merek Produk</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <select id="kategori" className="form-select" onChange={handleMerkChange} value={selectedOptionMerk}>
                                                        <option value="" disabled hidden>
                                                            {'--Silahkan Pilih--'}
                                                        </option>
                                                        {apiResponseMerk.map((data: any) => (
                                                            <option key={data.merk} value={data.merk}>
                                                                {data.merk}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex justify-center" style={{ marginTop: 12 }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary mt-2"
                                                        onClick={() => refreshData('refresh')}
                                                        style={{ backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                                    >
                                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                        Refresh Data
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex justify-between" style={{ marginTop: 12 }}>
                                                    <label className="flex cursor-pointer items-center">
                                                        <input type="checkbox" className="form-checkbox" />
                                                        <span>All Semua</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Grid Layouts */}

                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <div className={styles['grid-containerDlgDetailPpItem']}>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="No. Barang"
                                                        style={{ borderColor: '#958b8b' }}
                                                        className="form-input mb-3 h-[3.5vh]"
                                                        id="noBarangInput"
                                                        defaultValue={valueNoBarang}
                                                        // value={searchTermNoBarang}
                                                        // onChange={(e) => setSearchTermNoBarang(e.target.value)}
                                                        onChange={handleSearchNoBarang}
                                                        tabIndex={searchNoBarangFocus}
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nama Barang"
                                                        style={{ borderColor: '#958b8b' }}
                                                        className="form-input mb-3 h-[3.5vh]"
                                                        id="namaBarangInput"
                                                        defaultValue={valueNamaBarang}
                                                        // value={searchTerm}
                                                        // onChange={(e) => setSearchTerm(e.target.value)}
                                                        onChange={handleSearchNamaBarang}
                                                        tabIndex={searchNamaBarangFocus}
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...tableStyleHeader, width: '18vh', textAlign: 'center' }}>No. PP</th>
                                                            <th style={{ ...tableStyleHeader, width: '13vh', textAlign: 'center' }}>No. Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '35vh', textAlign: 'center' }}>Nama Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Satuan</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>SPP</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Sisa</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {searchKeywordNoPp !== '' || searchKeywordNoBarang !== '' || searchKeywordNamaBarang !== '' ? (
                                                            detailPPItem.length > 0 ? (
                                                                filteredData.map((item: any, index) => (
                                                                    <tr
                                                                        key={index}
                                                                        className={`hover:bg-gray-100`}
                                                                        style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                        onClick={() =>
                                                                            handleSelectData(
                                                                                item.id_pp,
                                                                                item.no_pp,
                                                                                item.no_item,
                                                                                item.diskripsi,
                                                                                item.satuan,
                                                                                item.sisa,
                                                                                item.fpp_qty,
                                                                                item.fpp_diameter,
                                                                                item.fpp_jarak,
                                                                                item.fpp_kg,
                                                                                item.fpp_harga_kg,
                                                                                item.fpp_btg,
                                                                                item.fpp_harga_btg,
                                                                                item.qty,
                                                                                item.berat,
                                                                                item.brt,
                                                                                item.kode_pp,
                                                                                item.id_pp,
                                                                                item.kode_item,
                                                                                item.qty_asli,
                                                                                item.qty_sisa,
                                                                                item.qty_batal,
                                                                                item.kode_mu,
                                                                                item.kurs,
                                                                                item.kurs_pajak,
                                                                                item.diskon_mu,
                                                                                item.kode_pajak,
                                                                                item.include,
                                                                                item.pajak_mu,
                                                                                item.kode_dept,
                                                                                item.kontrak,
                                                                                item.kodecabang,
                                                                                item.keterangan,
                                                                                index
                                                                            )
                                                                        }
                                                                        onDoubleClick={handleOKClick}
                                                                    >
                                                                        <td style={tableStyle}>{item.no_pp}</td>
                                                                        <td style={tableStyle}>{item.no_item}</td>
                                                                        <td style={tableStyle}>{item.diskripsi}</td>
                                                                        <td style={tableStyle}>{item.satuan}</td>
                                                                        <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.qty)}</td>
                                                                        <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.sisa)}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPPItem.length > 0 ? 'auto' : '20vh' }}>
                                                                        Silahkan Pilih Data Terlebih Dahulu
                                                                    </td>
                                                                </tr>
                                                            )
                                                        ) : detailPPItem.length > 0 ? (
                                                            detailPPItem.map((item: any, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className={`hover:bg-gray-100`}
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() =>
                                                                        handleSelectData(
                                                                            item.id_pp,
                                                                            item.no_pp,
                                                                            item.no_item,
                                                                            item.diskripsi,
                                                                            item.satuan,
                                                                            item.sisa,
                                                                            item.fpp_qty,
                                                                            item.fpp_diameter,
                                                                            item.fpp_jarak,
                                                                            item.fpp_kg,
                                                                            item.fpp_harga_kg,
                                                                            item.fpp_btg,
                                                                            item.fpp_harga_btg,
                                                                            item.qty,
                                                                            item.berat,
                                                                            item.brt,
                                                                            item.kode_pp,
                                                                            item.id_pp,
                                                                            item.kode_item,
                                                                            item.qty_asli,
                                                                            item.qty_sisa,
                                                                            item.qty_batal,
                                                                            item.kode_mu,
                                                                            item.kurs,
                                                                            item.kurs_pajak,
                                                                            item.diskon_mu,
                                                                            item.kode_pajak,
                                                                            item.include,
                                                                            item.pajak_mu,
                                                                            item.kode_dept,
                                                                            item.kontrak,
                                                                            item.kodecabang,
                                                                            item.keterangan,
                                                                            index
                                                                        )
                                                                    }
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>{item.no_pp}</td>
                                                                    <td style={tableStyle}>{item.no_item}</td>
                                                                    <td style={tableStyle}>{item.diskripsi}</td>
                                                                    <td style={tableStyle}>{item.satuan}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.qty)}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.sisa)}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPPItem.length > 0 ? 'auto' : '20vh' }}>
                                                                    Silahkan Pilih Data Terlebih Dahulu
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-3 flex space-x-4" style={{ marginTop: 30, marginBottom: 14 }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleOKClick}
                                            style={{ width: '8vh', height: '4vh', backgroundColor: 'rgb(59 63 92 / var(--tw-bg-opacity))', borderColor: '#e6e6e6' }}
                                        >
                                            OK
                                        </button>
                                        <button type="button" className="btn btn-outline-danger" onClick={handleOnClose} style={{ width: '8vh', height: '4vh' }}>
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DaftarPpItem;

import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../pblist.module.css';
import moment from 'moment';
import { FillFromSQL } from '@/utils/routines';
import { showLoading } from '@/utils/routines';
import swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { formatNumber, frmNumber, generateNU } from '@/utils/routines';

interface listPOProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kode_entitas: any;
    kode_supp: any;
    kontrak: any;
    // produksi: any;
    // valueNoBarang: any;
    // tipeValue: any;
    // valueNamaBarang: any;
    // valueNoPp: any;
    // nilaiTotalId: number;
}

const DaftarPOItem: React.FC<listPOProps> = ({ isOpen = false, onClose, onSelectData, kode_entitas, kode_supp, kontrak }) => {
    const router = useRouter();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    // const [kodePp, setKodePp] = useState<string>('');
    const [noPo, setNoPo] = useState<string>('');
    const [idPo, setIdPo] = useState<any>('');
    const [noItem, setNoItem] = useState<string>('');
    const [diskripsi, setDiskripsi] = useState<string>('');
    const [satuan, setSatuan] = useState<string>('');
    const [sisa, setSisa] = useState<any>('');
    const [kodegrup, setKodeGrup] = useState<any>('');
    const [kuantitasKg, setKuantitasKg] = useState<any>('');

    const [diameter, setDiameter] = useState<any>('');
    const [jarakCm, setJarakCm] = useState<any>('');
    const [kgBtg, setKgBtg] = useState<any>('');
    const [hargaKg, setHargaKg] = useState<any>('');
    const [kuantitasBtg, setKuantitasBtg] = useState<any>('');
    const [hargaBtg, setHargaBtg] = useState<any>('');
    const [berat, setBerat] = useState<any>('');
    const [qty, setQty] = useState<any>('');
    const [brt, setBrt] = useState<any>('');

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTermNoBarang, setSearchTermNoBarang] = useState('');
    const [selectedOptionKategori, setSelectedOptionKetgori] = useState<string>('');
    const [kategoriChecked, setKategoriChecked] = useState<boolean>(false);
    const [selectedOptionKelompok, setSelectedOptionKelompok] = useState<string>('');
    const [kelompokChecked, setKelompokChecked] = useState<boolean>(false);
    const [selectedOptionMerk, setSelectedOptionMerk] = useState<string>('');
    const [merkChecked, setMerkChecked] = useState<boolean>(false);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleSelectData = (
        id_sp: any,
        no_sp: string,
        // kodegrup: string,
        // nama_cabang: string,
        // no_item: string,
        // diskripsi: string,
        // satuan: string,
        // sisa: any,
        // jumlah_rp: any,
        // fpp_qty: any,
        // fpp_diameter: any,
        // fpp_jarak: any,
        // fpp_kg: any,
        // fpp_harga_kg: any,
        // fpp_btg: any,
        // fpp_harga_btg: any,
        // qty: any,
        // berat: any,
        // brt: any,
        index: number
    ) => {
        setIdPo(id_sp);
        setNoPo(no_sp);
        // setKodeGrup(kodegrup);
        // setNoItem(no_item);
        // setDiskripsi(diskripsi);
        // setSatuan(satuan);
        // setSisa(sisa);
        // setKuantitasKg(fpp_qty);
        // setDiameter(fpp_diameter);
        // setJarakCm(fpp_jarak);
        // setKgBtg(fpp_kg);
        // setHargaKg(fpp_harga_kg);
        // setKuantitasBtg(fpp_btg);
        // setHargaBtg(fpp_harga_btg);
        // setBerat(berat);
        // setQty(qty);
        // setBrt(brt);
        setSelectedRowIndex(index);
        // console.log();
    };

    const handleOKClick = () => {
        const dataObject = {
            idPo,
            noPo,
            kode_supp,
            // kodegrup,
            // property: 'data',
            // noItem,
            // diskripsi,
            // satuan,
            // sisa,
            // qty,
            // kuantitasKg,
            // diameter,
            // jarakCm,
            // kgBtg,
            // hargaKg,
            // kuantitasBtg,
            // hargaBtg,
            // berat,
            // brt,
        };
        onSelectData(dataObject);
        console.log('MODAL' + idPo);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const obj = {
                    // entitas: kode_entitas,
                    // where: {
                    //     // kode_supp: ${kodeSupp},
                    //     produksi: produksi,
                    //     tgl: tanggal,
                    //     kategori: '%',
                    //     kelompok: '%',
                    //     merk: '%',
                    // },

                    entitas: kode_entitas,
                    where: {
                        // kode_supp: `${kodeSupp}`,
                        kode_supp: `${kode_supp}`,
                        tgl_sp: `${tanggal}`,
                        no_sp: '%',
                        kontrak: `${kontrak}`,
                        id_sp: '%',
                    },
                };

                const jsonString = JSON.stringify(obj);
                const encodedString = btoa(jsonString);
                console.log(encodedString);
                const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
                    params: {
                        cmd: encodedString,
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
    }, [tanggal, kode_entitas, kode_supp, kontrak]);

    const detailPOItem = apiResponseDlgItem.data.map((item: any) => ({
        id_sp: item.id_sp,
        no_sp: item.no_sp,
        kodegrup: item.kodegrup,
        nama_cabang: item.nama_cabang,
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        sisa: item.sisa,
        jumlah_rp: item.jumlah_rp,
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

    const filteredDataNoPp = detailPOItem.filter((data) => data.no_sp.toLowerCase().includes(searchTerm.toLowerCase()) && data.no_item.toLowerCase().includes(searchTermNoBarang.toLowerCase()));

    // if (filteredDataNoPp.length === 0) {
    //     // Reset nilai pencarian
    //     setSearchTerm('');
    //     setSearchTermNoBarang('');
    // }

    const [searchKeywordNoPp, setSearchKeywordNoPp] = useState<string>('');
    const [searchKeywordNoBarang, setSearchKeywordNoBarang] = useState<string>('');
    const [searchKeywordNamaBarang, setSearchKeywordNamaBarang] = useState<string>('');
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const handleSearchNoPO = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoPp(searchValue);
        const filteredData = searchDataNoPO(searchValue);
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

    const searchDataNoPO = (keyword: any) => {
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPOItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailPOItem.filter((item) => item.no_sp.toLowerCase().includes(keyword.toLowerCase()));
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

    const searchDataNoBarang = (keyword: any) => {
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPOItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailPOItem.filter((item) => item.no_item.toLowerCase().includes(keyword.toLowerCase()));
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

    const searchDataNamaBarang = (keyword: any) => {
        console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailPOItem;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailPOItem.filter((item) => item.diskripsi.toLowerCase().includes(keyword.toLowerCase()));
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

            const obj = {
                entitas: kode_entitas,
                where: {
                    kode_supp: `${kode_supp}`,
                    tgl_sp: `${tanggal}`,
                    no_sp: '%',
                    kontrak: `${kontrak}`,
                    id_sp: '%',
                },
            };

            const jsonString = JSON.stringify(obj);
            const encodedString = btoa(jsonString);

            try {
                const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
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
                            // kode_supp: `${kodeSupp}`,
                            kode_supp: `${kode_supp}`,
                            tgl_sp: `${tanggal}`,
                            no_sp: '%',
                            kontrak: `${kontrak}`,
                            id_sp: '%',
                            grp: `${vKategori}`,
                        },
                    };

                    const jsonString = JSON.stringify(obj);
                    const encodedString = btoa(jsonString);

                    try {
                        const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
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
        // const refresh = await refreshData('close');
        onClose();
    };

    let refDiv = useRef(null);

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose} initialFocus={refDiv}>
                {/* ... Modal Overlay ... */}
                <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] bg-[black]/40">
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
                                    <div className="text-lg font-bold">Daftar Order Pembelian (PO)</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <input
                                                type="text"
                                                placeholder="No. PO"
                                                style={{ borderColor: '#958b8b' }}
                                                className="form-input mb-3 h-[3.5vh]"
                                                id="noPpInput"
                                                // defaultValue={valueNoBarang}
                                                // value={searchTerm}
                                                // onChange={(e) => setSearchTerm(e.target.value)}
                                                // onClick={() => handleSearch()}
                                                onChange={handleSearchNoPO}
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
                                                    <button type="button" className="btn btn-primary mt-2" onClick={() => refreshData('refresh')}>
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
                                                        // value={searchTermNoBarang}
                                                        // onChange={(e) => setSearchTermNoBarang(e.target.value)}
                                                        onChange={handleSearchNoBarang}
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nama Barang"
                                                        style={{ borderColor: '#958b8b' }}
                                                        className="form-input mb-3 h-[3.5vh]"
                                                        id="namaBarangInput"
                                                        // value={searchTerm}
                                                        // onChange={(e) => setSearchTerm(e.target.value)}
                                                        onChange={handleSearchNamaBarang}
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ ...tableStyleHeader, width: '18vh', textAlign: 'center' }}>No. PO</th>
                                                            <th style={{ ...tableStyleHeader, width: '13vh', textAlign: 'center' }}>PO Grup</th>
                                                            <th style={{ ...tableStyleHeader, width: '35vh', textAlign: 'center' }}>PPN Atas Nama</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>No. Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Nama Barang</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Satuan</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Qty</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Sisa</th>
                                                            <th style={{ ...tableStyleHeader, width: '8vh', textAlign: 'center' }}>Jumlah(Rp)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ cursor: 'pointer' }}>
                                                        {searchKeywordNoPp !== '' || searchKeywordNoBarang !== '' || searchKeywordNamaBarang !== '' ? (
                                                            detailPOItem.length > 0 ? (
                                                                filteredData.map((item: any, index) => (
                                                                    <tr
                                                                        key={index}
                                                                        className={`hover:bg-gray-100`}
                                                                        style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                        onClick={() =>
                                                                            handleSelectData(
                                                                                item.id_sp,
                                                                                item.no_sp,
                                                                                // item.kodegrup,
                                                                                // item.nama_cabang,
                                                                                // item.no_item,
                                                                                // item.diskripsi,
                                                                                // item.satuan,
                                                                                // item.sisa,
                                                                                // item.jumlah_rp,
                                                                                // item.fpp_qty,
                                                                                // item.fpp_diameter,
                                                                                // item.fpp_jarak,
                                                                                // item.fpp_kg,
                                                                                // item.fpp_harga_kg,
                                                                                // item.fpp_btg,
                                                                                // item.fpp_harga_btg,
                                                                                // item.qty_std,
                                                                                // item.berat,
                                                                                // item.brt,
                                                                                index
                                                                            )
                                                                        }
                                                                        onDoubleClick={handleOKClick}
                                                                    >
                                                                        <td style={tableStyle}>{item.no_sp}</td>
                                                                        <td style={tableStyle}>{item.kodegrup}</td>
                                                                        <td style={tableStyle}>{item.nama_cabang}</td>
                                                                        <td style={tableStyle}>{item.no_item}</td>
                                                                        <td style={tableStyle}>{item.diskripsi}</td>
                                                                        <td style={tableStyle}>{item.satuan}</td>
                                                                        <td style={{ ...tableStyle, textAlign: 'right' }}>{item.qty}</td>
                                                                        <td style={{ ...tableStyle, textAlign: 'right' }}>{item.sisa}</td>
                                                                        <td style={{ ...tableStyle, textAlign: 'right' }}>{item.jumlah_rp}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPOItem.length > 0 ? 'auto' : '20vh' }}>
                                                                        Silahkan Pilih Data Terlebih Dahulu
                                                                    </td>
                                                                </tr>
                                                            )
                                                        ) : detailPOItem.length > 0 ? (
                                                            detailPOItem.map((item: any, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className={`hover:bg-gray-100`}
                                                                    style={selectedRowIndex === index ? { backgroundColor: '#8495ad', color: '#ffffff' } : {}}
                                                                    onClick={() =>
                                                                        handleSelectData(
                                                                            item.id_sp,
                                                                            item.no_sp,
                                                                            // item.kodegrup,
                                                                            // item.nama_cabang,
                                                                            // item.no_item,
                                                                            // item.diskripsi,
                                                                            // item.satuan,
                                                                            // item.sisa,
                                                                            // item.jumlah_rp,
                                                                            // item.fpp_qty,
                                                                            // item.fpp_diameter,
                                                                            // item.fpp_jarak,
                                                                            // item.fpp_kg,
                                                                            // item.fpp_harga_kg,
                                                                            // item.fpp_btg,
                                                                            // item.fpp_harga_btg,
                                                                            // item.qty,
                                                                            // item.berat,
                                                                            // item.brt,
                                                                            index
                                                                        )
                                                                    }
                                                                    onDoubleClick={handleOKClick}
                                                                >
                                                                    <td style={tableStyle}>{item.no_sp}</td>
                                                                    <td style={tableStyle}>{item.kodegrup}</td>
                                                                    <td style={tableStyle}>{item.nama_cabang}</td>
                                                                    <td style={tableStyle}>{item.no_item}</td>
                                                                    <td style={tableStyle}>{item.diskripsi}</td>
                                                                    <td style={tableStyle}>{item.satuan}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.qty)}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.sisa)}</td>
                                                                    <td style={{ ...tableStyle, textAlign: 'right' }}>{frmNumber(item.jumlah_rp)}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={14} style={{ ...tableStyle, textAlign: 'center', height: detailPOItem.length > 0 ? 'auto' : '20vh' }}>
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
                                        <button type="button" className="btn btn-primary" onClick={handleOKClick} style={{ width: '8vh', height: '4vh' }} ref={refDiv}>
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

export default DaftarPOItem;

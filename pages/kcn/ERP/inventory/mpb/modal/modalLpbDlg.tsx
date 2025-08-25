import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../mpblist.module.css';
import moment from 'moment';
import { FillFromSQL } from '@/utils/routines';
import {  frmNumber } from '@/utils/routines';
import swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { overQTYAllForMPB } from '@/utils/global/fungsi';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { SpreadNumber } from '../../../fa/fpp/utils';

interface listPOProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectData: any;
    kode_entitas: any;
    kodeSupp: any;
    kodeGudang: any;
    kodeMpb: any;
    onSelectBatch: any
    // dataExisting:any;
}

const ModalDlgLpb: React.FC<listPOProps> = ({ isOpen = false, onClose, onSelectData, kode_entitas, kodeSupp, kodeGudang, kodeMpb, onSelectBatch }) => {
    const router = useRouter();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [kode_lpb, setKodeLpb] = useState<any>('');
    const [id_lpb, setid_lpb] = useState<any>('');
    const [no_lpb, setno_lpb] = useState<any>('');
    const [kode_sp, setkode_sp] = useState<any>('');
    const [id_sp, setid_sp] = useState<any>('');
    const [kode_pp, setkode_pp] = useState<any>('');
    const [id_pp, setid_pp] = useState<any>('');
    const [kode_item, setkode_item] = useState<any>('');
    const [no_item, setno_item] = useState<any>('');
    const [diskripsi, setdiskripsi] = useState<any>('');
    const [qty, setqty] = useState<any>('');
    const [satuan, setsatuan] = useState<any>('');
    const [sat_std, setsat_std] = useState<any>('');
    const [kode_mu, setkode_mu] = useState<any>('');
    const [kurs, setkurs] = useState<any>('');
    const [kurs_pajak, setkurs_pajak] = useState<any>('');
    const [harga_mu, setharga_mu] = useState<any>('');
    const [diskon, setdiskon] = useState<any>('');
    const [diskon_mu, setdiskon_mu] = useState<any>('');
    const [potongan_mu, setpotongan_mu] = useState<any>('');
    const [kode_pajak, setkode_pajak] = useState<any>('');
    const [include, setinclude] = useState<any>('');
    const [pajak, setpajak] = useState<any>('');
    const [pajak_mu, setpajak_mu] = useState<any>('');
    const [ket, setket] = useState<any>('');
    const [kode_dept, setkode_dept] = useState<any>('');
    const [kode_kerja, setkode_kerja] = useState<any>('');
    const [kode_akun_persediaan, setkode_akun_persediaan] = useState<any>('');
    const [brt, setbrt] = useState<any>('');
    const [qty_std, setqty_std] = useState<any>('');
    const [qty_sisa, setqty_sisa] = useState<any>('');
    const [berat, setberat] = useState<any>('');
    const [no_dok, setno_dok] = useState<any>('');
    const [no_sj, setno_sj] = useState<any>('');
    const [tgl_sj, settgl_sj] = useState<any>('');
    const [jumlah_rp, setjumlah_rp] = useState<any>('');
    const [jumlah_mu, setjumlah_mu] = useState<any>('');
    const [kena_pajak, setKena_pajak] = useState<any>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTermNoBarang, setSearchTermNoBarang] = useState<string>('');
    const [searchTermnamaBarang, setSearchTermNaBarang] = useState<string>('');
    const [selectedOptionKategori, setSelectedOptionKetgori] = useState<string>('');
    const [kategoriChecked, setKategoriChecked] = useState<boolean>(false);
    const [selectedOptionKelompok, setSelectedOptionKelompok] = useState<string>('');
    const [kelompokChecked, setKelompokChecked] = useState<boolean>(false);
    const [selectedOptionMerk, setSelectedOptionMerk] = useState<string>('');
    const [merkChecked, setMerkChecked] = useState<boolean>(false);
    const gridItem = useRef<Grid | any>(null)

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const handleSelectDataDlg = (
        kode_lpb: any,
        no_lpb: any,
        id_lpb: any,
        kode_sp: any,
        id_sp: any,
        kode_pp: any,
        id_pp: any,
        kode_item: any,
        no_item: any,
        diskripsi: any,
        qty: any,
        satuan: any,
        sat_std: any,
        kode_mu: any,
        kurs: any,
        kurs_pajak: any,
        harga_mu: any,
        diskon: any,
        diskon_mu: any,
        potongan_mu: any,
        kode_pajak: any,
        include: any,
        pajak: any,
        pajak_mu: any,
        ket: any,
        kode_dept: any,
        kode_kerja: any,
        kode_akun_persediaan: any,
        brt: any,
        qty_std: any,
        qty_sisa: any,
        berat: any,
        no_dok: any,
        no_sj: any,
        tgl_sj: any,
        jumlah_rp: any,
        jumlah_mu: any,
        kena_pajak: any,
        index: number
    ) => {
        setKodeLpb(kode_lpb);
        setno_lpb(no_lpb);
        setid_lpb(id_lpb);
        setkode_sp(kode_sp);
        setid_sp(id_sp);
        setkode_pp(kode_pp);
        setid_pp(id_pp);
        setkode_item(kode_item);
        setno_item(no_item);
        setdiskripsi(diskripsi);
        setqty(qty);
        setsatuan(satuan);
        setsat_std(sat_std);
        setkode_mu(kode_mu);
        setkurs(kurs);
        setkurs_pajak(kurs_pajak);
        setharga_mu(harga_mu);
        setdiskon(diskon);
        setdiskon_mu(diskon_mu);
        setpotongan_mu(potongan_mu);
        setkode_pajak(kode_pajak);
        setinclude(include);
        setpajak(pajak);
        setpajak_mu(pajak_mu);
        setket(ket);
        setkode_dept(kode_dept);
        setkode_kerja(kode_kerja);
        setkode_akun_persediaan(kode_akun_persediaan);
        setbrt(brt);
        setqty_std(qty_std);
        setqty_sisa(qty_sisa);
        setberat(berat);
        setno_dok(no_dok);
        setno_sj(no_sj);
        settgl_sj(tgl_sj);
        setjumlah_rp(jumlah_rp);
        setjumlah_mu(jumlah_mu);
        setKena_pajak(kena_pajak);
        setSelectedRowIndex(index);
    };

    const buPilihOkSingle = async(args: any) => {
        const selectedListData: any = args.rowData;

        const pushSatu : any[] = [];
      
        const dataObjectDlg = {
            kode_lpb: selectedListData.kode_lpb,
            no_lpb: selectedListData.no_lpb,
            id_lpb: selectedListData.id_lpb,
            kode_sp: selectedListData.kode_sp,
            id_sp: selectedListData.id_sp,
            kode_pp: selectedListData.kode_pp,
            id_pp: selectedListData.id_pp,
            kode_item: selectedListData.kode_item,
            no_item: selectedListData.no_item,
            diskripsi: selectedListData.diskripsi,
            qty: selectedListData.qty,
            satuan: selectedListData.satuan,
            sat_std: selectedListData.sat_std,
            kode_mu: selectedListData.kode_mu,
            kurs: selectedListData.kurs,
            kurs_pajak: selectedListData.kurs_pajak,
            harga_mu: selectedListData.harga_mu,
            diskon: selectedListData.diskon,
            diskon_mu: selectedListData.diskon_mu,
            potongan_mu: selectedListData.potongan_mu,
            kode_pajak: selectedListData.kode_pajak,
            include: selectedListData.include,
            pajak: selectedListData.pajak,
            pajak_mu: selectedListData.pajak_mu,
            ket: selectedListData.ket,
            kode_dept: selectedListData.kode_dept,
            kode_kerja: selectedListData.kode_kerja,
            kode_akun_persediaan: selectedListData.kode_akun_persediaan,
            brt: selectedListData.brt,
            qty_std: selectedListData.qty_std,
            qty_sisa: selectedListData.qty_sisa,
            berat: selectedListData.berat,
            no_dok: selectedListData.no_dok,
            no_sj: selectedListData.no_sj,
            tgl_sj: selectedListData.tgl_sj,
            jumlah_rp: selectedListData.jumlah_rp,
            jumlah_mu: selectedListData.jumlah_mu,
            kena_pajak: selectedListData.kena_pajak,
        };

        pushSatu.push(dataObjectDlg)
        console.log('dataObjectDlg 1', dataObjectDlg);
        


        await Promise.all(
            
        pushSatu.map((item) => {
            
            overQTYAllForMPB(kode_entitas, kodeGudang, selectedListData.kode_item, moment().format('YYYY-MM-DD HH:mm:ss'), kodeMpb, parseFloat(item.qty), 'mpb', 'Kuantitas MPB').then((result: any) => {
                    if (result === true) {
                        
                        
                    } else {
                        // onSelectData([item]);
                        return;
                    }
                });
            })
        ) 
        onSelectData(pushSatu)


        onClose();
    }
    const buPilihOk = async () => {
        const selectedListData: any = gridItem.current!.getSelectedRecords();
        console.log('selectedListData',selectedListData);

        const pushSatu : any[] = [];
       
       await Promise.all( selectedListData.map((item: any) => {
            const dataObjectDlg = {
                kode_lpb: item.kode_lpb,
                no_lpb: item.no_lpb,
                id_lpb: item.id_lpb,
                kode_sp: item.kode_sp,
                id_sp: item.id_sp,
                kode_pp: item.kode_pp,
                id_pp: item.id_pp,
                kode_item: item.kode_item,
                no_item: item.no_item,
                diskripsi: item.diskripsi,
                qty: item.qty,
                satuan: item.satuan,
                sat_std: item.sat_std,
                kode_mu: item.kode_mu,
                kurs: item.kurs,
                kurs_pajak: item.kurs_pajak,
                harga_mu: item.harga_mu,
                diskon: item.diskon,
                diskon_mu: item.diskon_mu,
                potongan_mu: item.potongan_mu,
                kode_pajak: item.kode_pajak,
                include: item.include,
                pajak: item.pajak,
                pajak_mu: item.pajak_mu,
                ket: item.ket,
                kode_dept: item.kode_dept,
                kode_kerja: item.kode_kerja,
                kode_akun_persediaan: item.kode_akun_persediaan,
                brt: item.brt,
                qty_std: item.qty_std,
                qty_sisa: item.qty_sisa,
                berat: item.berat,
                no_dok: item.no_dok,
                no_sj: item.no_sj,
                tgl_sj: item.tgl_sj,
                jumlah_rp: item.jumlah_rp,
                jumlah_mu: item.jumlah_mu,
                kena_pajak: item.kena_pajak,
            };

            pushSatu.push(dataObjectDlg)

        }))

        console.log('pushSatu',pushSatu);

            await Promise.all(
                
                pushSatu.map((item) => {
                    
                    overQTYAllForMPB(kode_entitas, kodeGudang, item.kode_item, moment().format('YYYY-MM-DD HH:mm:ss'), kodeMpb, SpreadNumber(item.qty), 'mpb', 'Kuantitas MPB').then((result: any) => {
                            if (result === true) {
                                console.log('kodeMpb',kodeMpb);
                                
        
                                
                            } else {
                                // onSelectData([item]);
                                return;
                            }
                        });
                    })
                ) 
                onSelectBatch(pushSatu)


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
    const tanggal = currentDate.format('YYYY-MM-DD 23:59:59');
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            //  console.log('kodeSUpp' + kodeSupp);
            //  console.log('kodeGudang' + kodeGudang);
            //   console.log('tanggal' + tanggal);
            const obj = {
                entitas: kode_entitas,
                where: `b.kode_supp = '${kodeSupp}' AND b.kode_gudang = '${kodeGudang}'`,
                having: `tgl_dok <= '${tanggal}'`,
            };

            const jsonString = JSON.stringify(obj);
            const encodedString = btoa(jsonString);
            // console.log('encodedString ' + encodedString);
            const fetchData = async () => {
                try {
                    const response1 = await axios.get(`${apiUrl}/erp/list_barang_mpb`, {
                        params: {
                            cmd: encodedString,
                        },
                    });
                    // console.log({ cmd: encodedString });
                    setApiResponseDlgItem(response1.data);
                    // console.log(encodedString);
                    //   console.log(response1.data.data);
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
            setSearchKeywordNoLpb('');
        }
    }, [tanggal, kode_entitas, apiUrl, kodeSupp, kodeGudang]);

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

    const detailLpbItemDlg = apiResponseDlgItem.data.map((item: any) => ({
        kode_lpb: item.kode_lpb,
        no_lpb: item.no_dok,
        id_lpb: item.id_lpb,
        kode_sp: item.kode_sp,
        id_sp: item.id_sp,
        kode_pp: item.kode_pp,
        id_pp: item.id_pp,
        kode_item: item.kode_item,
        no_item: item.no_item,
        diskripsi: item.diskripsi,
        qty: SpreadNumber(item.qty),
        satuan: item.satuan,
        sat_std: item.sat_std,
        kode_mu: item.kode_mu,
        kurs: item.kurs,
        kurs_pajak: item.kurs_pajak,
        harga_mu: SpreadNumber(item.harga_mu),
        diskon: item.diskon,
        diskon_mu: item.diskon_mu,
        potongan_mu: item.potongan_mu,
        kode_pajak: item.kode_pajak,
        include: item.include,
        pajak: item.pajak,
        pajak_mu: item.pajak_mu,
        ket: item.ket,
        kode_dept: item.kode_dept,
        kode_kerja: item.kode_kerja,
        kode_akun_persediaan: item.kode_akun_persediaan,
        brt: isNaN(SpreadNumber(item.brt)) ? 0 : SpreadNumber(item.brt),
        qty_std: SpreadNumber(item.qty_std),
        qty_sisa: SpreadNumber(item.qty_sisa),
        berat: isNaN(SpreadNumber(item.berat)) ? 0 : SpreadNumber(item.berat),
        no_dok: item.no_dok,
        no_sj: item.no_sj,
        tgl_sj: item.tgl_sj,
        jumlah_rp: SpreadNumber(item.jumlah_rp),
        jumlah_mu: SpreadNumber(item.jumlah_mu),
        kena_pajak: item.kena_pajak,
    }));

    const [searchKeywordNoPp, setSearchKeywordNoLpb] = useState<string>('');
    const [searchKeywordNoBarang, setSearchKeywordNoBarang] = useState<string>('');
    const [searchKeywordNamaBarang, setSearchKeywordNamaBarang] = useState<string>('');
    const [filteredData, setFilteredData] = useState<any[]>(detailLpbItemDlg);

    const handleSearchNoLpb = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeywordNoLpb(searchValue);
        const filteredData = searchDataNoLpb(searchValue);
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

    const searchDataNoLpb = (keyword: any) => {
        // console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailLpbItemDlg;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailLpbItemDlg.filter((item) => item.no_lpb.toLowerCase().includes(keyword.toLowerCase()));
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
        // console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailLpbItemDlg;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailLpbItemDlg.filter((item) => item.no_item.toLowerCase().includes(keyword.toLowerCase()));
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
        // console.log(keyword);
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return detailLpbItemDlg;
        } else {
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = detailLpbItemDlg.filter((item) => item.diskripsi.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const refreshData = async (tipe: string) => {
        // showLoading();
        // console.log(tipe)
        // if (tipe === 'close') {
        //                 const paramsList = {
        //         entitas: kode_entitas,
        //         param1: kodeSupp ? kodeSupp : 'all',
        //         param2: kodeGudang ? kodeGudang : 'all',
        //         param3: tanggal ? tanggal : 'all',
        //         param4: selectedOptionKategori ? selectedOptionKategori : 'all',
        //         param5: selectedOptionKelompok ? selectedOptionKelompok : 'all',
        //         param6: selectedOptionMerk ? selectedOptionMerk : 'all',
        //         paramLimit: '200',
        //     };
        //     try {
        //         const response1 = await axios.get(`${apiUrl}/erp/list_item_mpb_dlg`, {
        //             params: paramsList,
        //         });
        //         setApiResponseDlgItem(response1.data);
        //         // console.log(response1.data.data);
        //     } catch (error) {
        //         console.error('Error fetching data:', error);
        //     }
        // } else {
        // console.log(kode_entitas);
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vKategori = 'all';
                let vKelompok = 'all';
                let vMerk = 'all';
                if (kategoriChecked) {
                    vKategori = `${selectedOptionKategori}`;
                }
                if (kelompokChecked) {
                    vKelompok = `${selectedOptionKelompok}`;
                }
                if (merkChecked) {
                    vMerk = `${selectedOptionMerk}`;
                }
                const paramsList = {
                    entitas: kode_entitas,
                    param1: kodeSupp ? kodeSupp : 'all',
                    param2: kodeGudang ? kodeGudang : 'all',
                    // param3: tanggal ? tanggal : 'all',
                    param3: selectedOptionKategori ? selectedOptionKategori : 'all',
                    param4: selectedOptionKelompok ? selectedOptionKelompok : 'all',
                    param5: selectedOptionMerk ? selectedOptionMerk : 'all',
                    // paramLimit: '200',
                };
                // console.log(paramsList);
                try {
                    const response1 = await axios.get(`${apiUrl}/erp/list_item_mpb_dlg`, {
                        params: paramsList,
                    });
                    setApiResponseDlgItem(response1.data);
                    // console.log(response1.data.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            } catch (error) {
                console.error(error);
            }
        }
        // }

        // setKategoriChecked(false);
        // setKelompokChecked(false);
        // setMerkChecked(false);
        setSelectedOptionKelompok('');
        setSelectedOptionMerk('');
        setSelectedOptionKetgori('');

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

    // const over2QTY = async () => {
    //     let Lstok = 0;
    //     // let overQty;
    //     await oerQTY2(kode_entitas, kodeGudang, kode_item, tanggal, kodeMpb, qty)
    //         .then((result) => {
    //             if ((result = true)) {
    //                 Swal.fire({
    //                     title: 'Kuantitas untuk dikembalikan (' + qty + ')  melebihi stok yang ada (' + Lstok + ') ',
    //                     icon: 'error',
    //                 });
    //                 throw 'exit';
    //             } else 'lanjut';
    //             // Lstok = result[0].stok === '' || result[0].stok === null ? '' : result[0].stok;
    //             //  overQty = result;
    //         })
    //         .catch((error) => {
    //             console.error('Error:', error);
    //         });
    //     // if ((overQty = true)) {
    //     //     Swal.fire({
    //     //         title: 'Kuantitas untuk dikembalikan (' + qty + ')  melebihi stok yang ada (' + Lstok + ') ',
    //     //         icon: 'error',
    //     //     });
    //     //     throw 'exit';
    //     // } else ('lanjut')

    //     console.log('qty_std ' + qty_std);
    //     console.log('qty ' + qty);
    //     console.log('Lstok ' + Lstok);

    //     // if (Lstok < qty) {
    //     //     Swal.fire({
    //     //         title: 'Kuantitas untuk dikembalikan (' + qty + ')  melebihi stok yang ada (' + Lstok + ') ',
    //     //         icon: 'error',
    //     //     });
    //     //     throw 'exit';
    //     // } else {
    //     //     alert('lanjut');
    //     // }
    // };

    //  overQTY2(kode_entitas, kodeGudang, kode_item, tanggal, kodeMpb, qty);

    // oerQTY2(kode_entitas, kodeGudang, kode_item, tanggal, kodeMpb, qty).then((result) => {
    //     // if ((result = true)) {
    //     //     Swal.fire({
    //     //         title: 'Kuantitas untuk dikembalikan (' + qty + ')  melebihi stok yang ada (' + Lstok + ') ',
    //     //         icon: 'error',
    //     //     });
    //     //     throw 'exit';
    //     // } else 'lanjut';
    //     // Lstok = result[0].stok === '' || result[0].stok === null ? '' : result[0].stok;
    //     //  overQty = result;
    // });

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
                                    <div className="text-lg font-bold">Daftar Penerimaan Barang</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="table-responsive whitespace-nowrap p-3">
                                    <div className={styles['flex-container']}>
                                        <div className="panel" style={{ backgroundColor: '#e3e3e3' }}>
                                            <input type="text" placeholder="No. PB" style={{ borderColor: '#958b8b' }} className="form-input mb-3 h-[3.5vh]" id="noPB" onChange={handleSearchNoLpb} />
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
                                                        <input type="checkbox" className="form-checkbox" onChange={(e) => {
                                                        if(e.target.checked) {
                                                            let getAllIndex : number[] = Array.from({ length: gridItem.current?.dataSource?.length + 1 }, (_, i) => i);
                                                             
                                                            
                                                            gridItem.current?.selectRows(getAllIndex)
                                                        } else {
                                                            gridItem.current?.selectRows([])
                                                        }
                                                        }} />
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
                                                        onChange={handleSearchNamaBarang}
                                                    />
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto overflow-y-auto" style={{ height: '35vh', width: '90vh' }}>
                                                <GridComponent
                                                    id="gridItem"
                                                    name="gridItem"
                                                    className="gridItem"
                                                    locale="id"
                                                    dataSource={ searchKeywordNoPp !== '' || searchKeywordNoBarang !== '' || searchKeywordNamaBarang !== '' ? filteredData : detailLpbItemDlg}
                                                 
                                                //  recordDoubleClick={hanldeRecordDoubleClick}
                                                    ref={gridItem}
                                                    recordDoubleClick={buPilihOkSingle}
                                                    allowResizing={true}
                                                    selectionSettings={{ mode: 'Row', type: 'Multiple' }}
                                                    rowHeight={22}
                                                    gridLines={'Both'}
                                                    height={'280'} // Tinggi grid dalam piksel /
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective  field="no_dok" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Center" width={120} />
                                                    <ColumnDirective  field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Center" width={80} />
                                                    <ColumnDirective  field="diskripsi" headerText="Nama Barang" headerTextAlign="Center" textAlign="Center" width={150} />
                                                    <ColumnDirective  field="satuan" headerText="Satuan" headerTextAlign="Center" textAlign="Center" width={60} />
                                                    <ColumnDirective  field="qty" format={'N2'} headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width={90} />
                                                    <ColumnDirective  field="Ket" headerText="Keterangan" headerTextAlign="Center" textAlign="Center" width={130} />
                                                    <ColumnDirective  field="status" headerText="Status" headerTextAlign="Center" textAlign="Center" width={130} />
                                                    <ColumnDirective  field="no_sj" headerText="No. SJ" headerTextAlign="Center" textAlign="Center" width={110} />
                                                </ColumnsDirective>
                        
                                                <Inject services={[ Selection, CommandColumn, Toolbar, Resize]} />
                                            </GridComponent>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mr-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4"></div>

                                    <div className="mb-3 flex space-x-4" style={{ marginTop: 30, marginBottom: 14 }}>
                                        <button type="button" className="btn btn-primary" onClick={buPilihOk} style={{ width: '8vh', height: '4vh' }} ref={refDiv}>
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

export default ModalDlgLpb;

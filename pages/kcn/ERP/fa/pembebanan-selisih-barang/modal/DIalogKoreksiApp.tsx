import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { Inject } from '@syncfusion/ej2-react-grids';
import GridPS from './GridPS';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import GridPembebananKaryawan from './GridPembebananKaryawan';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { generateNU } from '@/utils/routines';
import Swal from 'sweetalert2';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { useProgress } from '@/context/ProgressContext';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

const DIalogKoreksiApp = ({
    visible,
    onClose,
    terpilih,
    masterState,
    masterData = {},
    getRps,
}: {
    visible: boolean;
    onClose: Function;
    getRps: any;
    terpilih: any;
    masterState: string;
    masterData: any;
}) => {
    const { sessionData } = useSession();
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const header =
        masterState === 'HITUNG'
            ? 'Pembebanan Selisih Barang ' + masterState
            : 'Pembebanan Selisih Barang ' +
              masterState +
              (Object.keys(masterData).length !== 0 && masterState === 'KOREKSI'
                  ? ' [ ' + masterData.no_rps + ']'
                  : parseInt(masterData.level_app) - 1 < 1
                  ? 'Level' + 1
                  : ` Level${parseInt(masterData.level_app) - 1}`);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const gridPembebananReff = useRef<any>(null);

    const [oldDataState, setOldDataState] = useState<any>([]);

    const [headerState, setHeaderState] = useState({
        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
        no_dok: '',
        keterangan: '',
    });

    const [bodyState, setBodyState] = useState({
        total_nilai_beban: '0',
        beban_karyawan: '0',
        beban_perusahaan: '0',
        total_beban_karyawan: '0',
    });
    const [isFocused, setIsFocused] = useState({
        total_nilai_beban: false,
        beban_karyawan: false,
        beban_perusahaan: false,
        total_beban_karyawan: false,
    });
    const [visibleDialogKry, setVisibleDialogKry] = useState(false);

    const [list_karyawan, setList_karyawan] = useState<any>([]);
    const [list_karyawanOri, setList_karyawanOri] = useState<any>([]);
    const gridPembebananKaryawanReff = useRef<any>(null);

    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggal_awal') {
            setHeaderState((oldData: any) => ({
                ...oldData,
                tanggal: moment(date).format('YYYY-MM-DD HH:mm:ss'),
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update filterState
        setBodyState((prev: any) => ({
            ...prev,
            [name]: value.replace(/,/g, ''),
        }));
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;

        // Update filterState
        setHeaderState((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    useEffect(() => {
        const dialogElement = document.getElementById('dialogKoreksiApp');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    const getNoDok = async () => {
        const vNoMBUtama = await generateNU(kode_entitas, '', '28', moment().format('YYYYMM'));

        setHeaderState((oldData) => ({
            ...oldData,
            no_dok: vNoMBUtama,
        }));
    };

    useEffect(() => {
        if (masterState === 'HITUNG') {
            const temp = terpilih.map((item: any) => ({
                ...item,
                nominal: SpreadNumber(item.nominal),
            }));
            console.log('masuk hitung', temp);
            gridPembebananReff.current!.setProperties({ dataSource: temp });
            gridPembebananReff.current!.refresh();
            const tempPo = temp.reduce((total: any, item: any) => {
                return total + parseInt(item.nominal);
            }, 0);

            setBodyState((oldData: any) => ({
                ...oldData,
                beban_perusahaan: String(tempPo),
                total_nilai_beban: String(tempPo),
            }));
            getNoDok();
        } else if (masterState === 'PREVIEW' || masterState === 'KOREKSI' || masterState === 'PEMBATALAN') {
            console.log('masuk preview');
            getDetailDOK(masterData.kode_rps);
        } else if (masterState.toLocaleLowerCase().startsWith('approval')) {
            console.log('masuk Approval');
            getDetailDOK(masterData.kode_rps);
        }
    }, []);

    const getDetailDOK = async (kode_rps: any) => {
        const responseTab1 = await axios.get(`${apiUrl}/erp/master_detail_rps?`, {
            params: {
                entitas: kode_entitas,
                param1: kode_rps,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('responseTab1', responseTab1);

        setHeaderState({
            no_dok: responseTab1.data.data.master.no_rps,
            tanggal: responseTab1.data.data.master.tgl_rps,
            keterangan: responseTab1.data.data.master.catatan,
        });
        const totalNilaiBeban = responseTab1.data.data.DataPS.reduce((acc: number, node: any) => {
  
                return acc + SpreadNumber(node.nominal);
        }, 0);
        setBodyState({
            total_nilai_beban: String(totalNilaiBeban),
            beban_karyawan: String(SpreadNumber(responseTab1.data.data.master.jml_beban)),
            beban_perusahaan: String(SpreadNumber(responseTab1.data.data.master.jml_perusahaan)),
            total_beban_karyawan: String(SpreadNumber(responseTab1.data.data.master.jml_beban)),
        });

        const psTemp = responseTab1.data.data.DataPS.map((item: any) => ({
            ...item,
            dok: item.dok,
            no_ps: item.no_ps,
            tgl_ps: item.tgl_ps,
            nama_gudang: item.nama_gudang,
            nama_item: item.nama_item,
            qty_std: SpreadNumber(item.qty_std),
            nominal: SpreadNumber(item.nominal),
        }));

        const detailTemp = responseTab1.data.data.detail.map((item: any) => ({
            ...item,
            nip: item.no_subledger,
            nama_kry: item.nama_subledger,
            jabatan: item.jabatan,
            beban: SpreadNumber(item.persen),
            nilai: SpreadNumber(item.nilai),
            emp_no: item.no_subledger,
            keterangan: item.catatan,
            emp_id: item.nama_subledger,
        }));
        gridPembebananReff.current.setProperties({ dataSource: psTemp });
        gridPembebananReff.current!.refresh();

        gridPembebananKaryawanReff.current.setProperties({ dataSource: detailTemp });
        gridPembebananKaryawanReff.current!.refresh();

        setOldDataState(responseTab1.data.data);

        const kirimMaster = {
            entitas: kode_entitas,
            level_app: '1',
            user_app1: null,
            tgl_app1: null,
            user_app2: null,
            tgl_app2: null,
            user_app3: null,
            tgl_app3: null,
            user_app4: null,
            tgl_app4: null,
            user_app5: null,
            tgl_app5: null,
            user_app6: null,
            tgl_app6: null,
            app: 'N',
            posting: 'N',
            user_posting: null,
            tgl_posting: null,
            user_pic: userid.toUpperCase(),
            tgl_pic: moment().format('YYYY-MM-DD HH:mm:ss'),
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
    };

    const validasiForm = () => {
        // Gabungkan semua state yang perlu divalidasi
        const allStates = {
            ...headerState,
            ...bodyState,
        };

        // Iterasi setiap properti di objek gabungan
        for (const [key, value] of Object.entries(allStates)) {
            if (value === '' || value === null || value === undefined) {
                // Tampilkan pesan error swal jika ada properti yang kosong
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    target: '#forDialogAndSwall',
                    text: `${formatString(key)} harus diisi`,
                });
                return false; // Berhenti validasi jika ada yang kosong
            }
        }

        if (gridPembebananKaryawanReff.current!.dataSource.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#forDialogAndSwall',
                text: `Data Pembebanan harus diisi`,
            });
            return false; // Berhenti validasi jika ada yang kosong
        }

        const kondisi = parseFloat(bodyState.beban_karyawan.replace(/,/g, '')) !== parseFloat(bodyState?.total_beban_karyawan.replace(/,/g, ''));
        console.log('kondisi', kondisi);

        if (parseFloat(bodyState.beban_karyawan.replace(/,/g, '')) !== parseFloat(bodyState?.total_beban_karyawan.replace(/,/g, ''))) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#forDialogAndSwall',
                text: `Beban Karyawan (${formatNumber(bodyState.beban_karyawan)}) jumlah alokasi beban (${formatNumber(bodyState?.total_beban_karyawan)})`,
            });
            return false; // Berhenti validasi jika ada yang kosong
        }

        return masterState === 'HITUNG' ? savedoc() : masterState.toLocaleLowerCase().startsWith('approval') ? appdoc() : masterState === 'POSTING' ? posting() : editdoc(); // Lolos validasi jika semua properti terisi
    };

    const appdoc = async () => {
        let kirim: any = {};
        if (masterState === 'APPROVAL#1' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '2',
                user_app1: userid.toUpperCase(),
                tgl_app1: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                detail: [...oldDataState?.detail],
            };

            console.log('app1', kirim);
        } else if (masterState === 'APPROVAL#2' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '3',
                user_app2: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_app1: moment(oldDataState.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app2: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                detail: [...oldDataState?.detail],
            };

            console.log('app2', kirim);
        } else if (masterState === 'APPROVAL#3' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '4',
                user_app3: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_app1: moment(oldDataState.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app2: moment(oldDataState.master.tgl_app2).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app3: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                detail: [...oldDataState?.detail],
            };

            console.log('app3', kirim);
        } else if (masterState === 'APPROVAL#4' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '5',
                user_app4: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_app1: moment(oldDataState.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app2: moment(oldDataState.master.tgl_app2).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app3: moment(oldDataState.master.tgl_app3).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app4: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                detail: [...oldDataState?.detail],
            };

            console.log('app4', kirim);
        } else if (masterState === 'APPROVAL#5' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '6',
                user_app5: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_app1: moment(oldDataState.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app2: moment(oldDataState.master.tgl_app2).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app3: moment(oldDataState.master.tgl_app3).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app4: moment(oldDataState.master.tgl_app4).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app5: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                detail: [...oldDataState?.detail],
            };

            console.log('app5', kirim);
        } else if (masterState === 'APPROVAL#6' && oldDataState?.master.app === 'N') {
            kirim = {
                ...oldDataState?.master,
                entitas: kode_entitas,
                level_app: '6',
                user_app6: userid.toUpperCase(),
                tgl_rps: headerState.tanggal,
                tgl_pic: headerState.tanggal,
                tgl_app1: moment(oldDataState.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app2: moment(oldDataState.master.tgl_app2).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app3: moment(oldDataState.master.tgl_app3).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app4: moment(oldDataState.master.tgl_app4).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app5: moment(oldDataState.master.tgl_app5).format('YYYY-MM-DD HH:mm:ss'),
                tgl_app6: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                app: 'Y',
                detail: [...oldDataState?.detail],
            };

            console.log('app6', kirim);
        }

        try {
            const response: any = await axios.patch(`${apiUrl}/erp/update_pembebenan_selisih_barang?`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response);

            if (response.data.status) {
                const auditReqBodySPM = {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'JR',
                    kode_dokumen: oldDataState?.master.no_rps,
                    no_dokumen: oldDataState?.master.no_rps,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'APPROVAL',
                    diskripsi: `Pembebanan selisih barang #1 nilai transaksi =  ${formatNumber(bodyState?.total_beban_karyawan)}`,
                    userid: userid,
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await getRps();
                endProgress();
                setLoadingMessage('');
                Swal.fire({
                    title: 'Berhasil APPROVAL',
                    target: '#main-target',
                    icon: 'success',
                });
                onClose();
            }
        } catch (error: any) {
            if (error) {
                console.log(error);
                endProgress();
                setLoadingMessage('');
                Swal.fire({
                    title: 'Gagal Approval',
                    text: `${error?.response?.data?.error} - ${error?.response?.data?.message}`,
                    target: '#forDialogAndSwall',
                    icon: 'warning',
                });
                return;
            }
        }
    };

    const posting = async () => {
        console.log('posting');
    };

    const savedoc = async () => {
        // lanjut savedoc
        startProgress();
        const vNoMBUtama = await generateNU(kode_entitas, '', '28', moment().format('YYYYMM'));
        const kirimMaster = {
            entitas: kode_entitas,
            no_rps: headerState.no_dok,
            tgl_rps: headerState.tanggal,
            jml_perusahaan: parseFloat(bodyState.beban_perusahaan.replace(/,/g, '')),
            jml_beban: parseFloat(bodyState?.total_beban_karyawan.replace(/,/g, '')),
            level_app: '1',
            user_app1: null,
            tgl_app1: null,
            user_app2: null,
            tgl_app2: null,
            user_app3: null,
            tgl_app3: null,
            user_app4: null,
            tgl_app4: null,
            user_app5: null,
            tgl_app5: null,
            user_app6: null,
            tgl_app6: null,
            app: 'N',
            posting: 'N',
            user_posting: null,
            tgl_posting: null,
            catatan: headerState.keterangan,
            user_pic: userid.toUpperCase(),
            tgl_pic: moment().format('YYYY-MM-DD HH:mm:ss'),
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        };

        const detail = gridPembebananKaryawanReff.current!.dataSource.map((item: any, index: number) => ({
            id_rps: index + 1,
            kode_subledger: item.kode_subledger,
            no_subledger: item.nip,
            nama_subledger: item.nama_kry,
            jabatan: item.jabatan,
            persen: item.beban,
            nilai: item.nilai,
            catatan: item.keterangan,
        }));

        const detailPS = gridPembebananReff.current!.dataSource.map((item: any, index: number) => ({
            kode_ps: item.kode_ps,
            id_ps: item.id_ps,
        }));

        const kirim = {
            ...kirimMaster,
            detail: [...detail],
            detail_ps: [...detailPS],
        };

        console.log('kirim', kirim);

        try {
            const response: any = await axios.post(`${apiUrl}/erp/simpan_proses_pembenahan_selisih_barang?`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response);

            if (response.data.status) {
                await generateNU(kode_entitas, vNoMBUtama, '28', moment().format('YYYYMM'));
                const auditReqBodySPM = {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'JR',
                    kode_dokumen: response.data.data?.kodo_dokumen,
                    no_dokumen: vNoMBUtama,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'NEW',
                    diskripsi: `Pembebanan selisih barang #1 nilai transaksi =  ${formatNumber(bodyState?.total_beban_karyawan)}`,
                    userid: userid,
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await getRps();
                endProgress();
                Swal.fire({
                    title: 'Berhasil Simpan',
                    target: '#main-target',
                    icon: 'success',
                });
                onClose();
            }
        } catch (error: any) {
            if (error) {
                console.log(error);
                endProgress();
                Swal.fire({
                    title: 'Gagal Simpan',
                    text: `${error?.response?.data?.error} - ${error?.response?.data?.message}`,
                    target: '#forDialogAndSwall',
                    icon: 'warning',
                });
                return;
            }
        }
    };

    const editdoc = async () => {
        console.log('masuk edit');
        startProgress();

        try {
            const kirimMaster = {
                entitas: kode_entitas,
                no_rps: headerState.no_dok,
                tgl_rps: moment(headerState.tanggal).format('YYYY-MM-DD HH:mm:ss'),
                jml_perusahaan: parseFloat(bodyState.beban_perusahaan.replace(/,/g, '')),
                jml_beban: parseFloat(bodyState?.total_beban_karyawan.replace(/,/g, '')),
                level_app: oldDataState.master.level_app,
                user_app1: null,
                tgl_app1: null,
                user_app2: null,
                tgl_app2: null,
                user_app3: null,
                tgl_app3: null,
                user_app4: null,
                tgl_app4: null,
                user_app5: null,
                tgl_app5: null,
                user_app6: null,
                tgl_app6: null,
                app: 'N',
                posting: 'N',
                user_posting: null,
                tgl_posting: null,
                catatan: headerState.keterangan,
                user_pic: oldDataState.master.user_pic,
                tgl_pic: moment(oldDataState.master.tgl_pic).format('YYYY-MM-DD HH:mm:ss'),
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            };

            console.log('gridPembebananKaryawanReff.current!.dataSource.', gridPembebananKaryawanReff.current!.dataSource);

            const detail = gridPembebananKaryawanReff.current!.dataSource.map((item: any, index: number) => ({
                kode_rps: oldDataState?.master?.kode_rps,
                id_rps: index + 1,
                kode_subledger: item.kode_subledger,
                no_subledger: item.nip,
                nama_subledger: item.nama_kry,
                jabatan: item.jabatan,
                persen: item.beban,
                nilai: item.nilai,
                catatan: item.keterangan,
            }));

            const kirim = {
                ...kirimMaster,
                kode_rps: oldDataState?.master?.kode_rps,
                entitas: kode_entitas,
                detail: [...detail],
            };
            console.log('token', token);

            const response: any = await axios.patch(`${apiUrl}/erp/update_pembebenan_selisih_barang?`, kirim, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('response', response);

            if (response.data.status) {
                const auditReqBodySPM = {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'JR',
                    kode_dokumen: oldDataState?.master.no_rps,
                    no_dokumen: oldDataState?.master.no_rps,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'EDIT',
                    diskripsi: `Pembebanan selisih barang #1 nilai transaksi =  ${formatNumber(bodyState?.total_beban_karyawan)}`,
                    userid: userid,
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await getRps();
                endProgress();
                setLoadingMessage('');
                Swal.fire({
                    title: 'Berhasil Koreksi',
                    target: '#main-target',
                    icon: 'success',
                });
                onClose();
            }
        } catch (error: any) {
            if (error) {
                console.log(error);
                endProgress();
                setLoadingMessage('');
                Swal.fire({
                    title: 'Gagal Koreksi',
                    text: `${error?.response?.data?.error} - ${error?.response?.data?.message}`,
                    target: '#forDialogAndSwall',
                    icon: 'warning',
                });
                return;
            }
        }
    };

    const getKaryawan = async () => {
        try {
            const response = await axios.post(`http://10.10.1.109/api/v1/hris/list_employee_dlg?param1=all&param2=all&param3=all&param4=all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setList_karyawan(response.data.data);
            setList_karyawanOri(response.data.data)
        } catch (error) {}
    };

    useEffect(() => {
        getKaryawan();
    }, []);

    const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIsFocused((prev: any) => ({
            ...prev,
            [name]: true,
        }));
        e.target.select();
    };

    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIsFocused((prev: any) => ({
            ...prev,
            [name]: false,
        }));
        if (bodyState.beban_karyawan === '') {
            setBodyState((oldData) => ({
                ...oldData,
                beban_perusahaan: String(parseFloat(oldData.total_nilai_beban.replace(/,/g, '')) - 0),
            }));
        } else {
            setBodyState((oldData) => ({
                ...oldData,
                beban_perusahaan: String(parseFloat(oldData.total_nilai_beban.replace(/,/g, '')) - parseFloat(oldData.beban_karyawan.replace(/,/g, ''))),
            }));
        }
    };
    const formatNumber = (num: string) => {
        if (!num) return ''; // Jika kosong, kembalikan string kosong
        const parsedNumber = parseFloat(num.replace(/,/g, ''));
        if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
        return parsedNumber.toLocaleString('en-US');
    };
    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)?.toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const hiddenNol = (val: string) => {
        if (val == '0') {
            return String('');
        } else {
            return String(val);
        }
    };
    const convertStringTuNol = (val: any) => {
        if (val === '' || val === null || isNaN(val)) {
            return String('0');
        } else {
            return String(val);
        }
    };
    return (
        <DialogComponent
            id="dialogKoreksiApp"
            isModal={true}
            width="93%"
            height="100%"
            visible={visible}
            close={() => onClose()}
            header={header}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="flex h-full w-full flex-col" id="forDialogAndSwall">
                <GlobalProgressBar />
                <div className="h-[15%] w-full">
                    <div className="h-full w-full">
                        <table border={1} cellSpacing={1} className="h-full" style={{ height: '100%' }}>
                            <tr>
                                <th className="w-[15%] bg-[#5A759F] text-white">Tanggal</th>
                                <th className="w-[15%] bg-[#5A759F] text-white">No Dokumen</th>
                                <th className="w-[70%] bg-[#5A759F] text-white">Keterangan</th>
                            </tr>
                            <tr>
                                <td className="border">
                                    <DatePickerComponent
                                        locale="id"
                                        cssClass="e-custom-style"
                                        enableMask={true}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        width={180}
                                        value={moment(headerState.tanggal).toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            handleTgl(args.value, 'tanggal_awal');
                                        }}
                                        style={{
                                            width: '100%',
                                            marginLeft: 5
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </td>
                                <td className="border">
                                    <input
                                        type="text"
                                        id="no_dok"
                                        className="w-full rounded-sm border border-gray-400 bg-gray-300 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="No Dokumen"
                                        name="no_dok"
                                        readOnly
                                        value={headerState.no_dok}
                                        onChange={handleInputChange}
                                        style={{ height: '100%' }}
                                    />
                                </td>
                                <td className="border p-0">
                                    <textarea
                                        id="simple-textarea"
                                        className="m-0 h-full w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Tuliskan Keterangan"
                                        name="keterangan"
                                        readOnly={masterState === 'PREVIEW' || masterState?.toLowerCase().startsWith('approval')}
                                        rows={3}
                                        value={headerState.keterangan}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className="flex h-[30%] w-full flex-col justify-between">
                    <GridPS gridPembebananReff={gridPembebananReff} />
                    <div className="flex h-[38px] items-center gap-2  bg-[#5A8C9F] px-2 text-white">
                        <h2 className="bold text-lg">Sumary</h2>
                        <div className="flex h-[80%] items-center">
                            <span className="w-[150px]">{formatString('total_nilai_beban')} :</span>
                            <input
                                type="text"
                                id="total_nilai_beban"
                                className={`w-full rounded-sm border border-gray-400 bg-gray-300 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    isFocused.total_nilai_beban === true ? 'text-left' : 'text-right'
                                } `}
                                placeholder={formatString('total_nilai_beban')}
                                name="total_nilai_beban"
                                readOnly
                                value={isFocused.total_nilai_beban ? hiddenNol(bodyState.total_nilai_beban) : formatNumber(hiddenNol(bodyState.total_nilai_beban))} // Format hanya saat blur
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                style={{ height: '100%' }}
                            />
                        </div>

                        <div className="flex h-[80%] items-center">
                            <span className="w-[150px]">{formatString('beban_karyawan')} :</span>
                            <div className="flex h-full">
                                <input
                                    type="text"
                                    id="beban_karyawan"
                                    className={`w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                        isFocused.beban_karyawan === true ? 'text-left' : 'text-right'
                                    } `}
                                    placeholder={formatString('beban_karyawan')}
                                    name="beban_karyawan"
                                    value={isFocused.beban_karyawan ? hiddenNol(bodyState.beban_karyawan) : formatNumber(hiddenNol(bodyState.beban_karyawan))} // Format hanya saat blur
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    readOnly={masterState !== 'HITUNG' && masterState !== 'KOREKSI'}
                                    style={{ height: '100%' }}
                                />
                                <button
                                    className="flex h-full items-center bg-[#5A759F] px-2 text-lg text-white"
                                    onClick={() => {
                                        setBodyState((oldData) => ({
                                            ...oldData,
                                            beban_karyawan: String(oldData.total_nilai_beban),
                                            beban_perusahaan: '0',
                                        }));
                                    }}
                                >
                                    <FaArrowLeft />
                                </button>
                            </div>
                        </div>

                        <div className="flex h-[80%] items-center">
                            <span className="w-[150px]">{formatString('beban_perusahaan')} :</span>
                            <input
                                type="text"
                                id="beban_perusahaan"
                                className={`w-full rounded-sm border border-gray-400 bg-gray-300 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    isFocused.beban_perusahaan === true ? 'text-left' : 'text-right'
                                } `}
                                placeholder={formatString('beban_perusahaan')}
                                name="beban_perusahaan"
                                readOnly
                                value={isFocused.beban_perusahaan ? hiddenNol(bodyState.beban_perusahaan) : formatNumber(hiddenNol(bodyState.beban_perusahaan))} // Format hanya saat blur
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                style={{ height: '100%' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="z-40 h-[35%] w-full">
                    <GridPembebananKaryawan
                        bodyState={bodyState}
                        setBodyState={setBodyState}
                        isFocused={isFocused}
                        masterState={masterState}
                        setIsFocused={setIsFocused}
                        gridPembebanan={gridPembebananKaryawanReff}
                        list_karyawan={list_karyawan}
                        visibleDialogKry={visibleDialogKry}
                        setVisibleDialogKry={setVisibleDialogKry}
                        setList_karyawan={setList_karyawan}
list_karyawanOri={list_karyawanOri}
                    />
                </div>
                <div className="flex h-[13%] gap-1 pt-5">
                    <p>Riwayat Approval :</p>
                    <div className="w-64">
                        <p>
                            1.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app1 ?? ''} - ${oldDataState?.master?.tgl_app1 ? moment(oldDataState?.master?.tgl_app1).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                        <p>
                            2.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app2 ?? ''} - ${oldDataState?.master?.tgl_app2 ? moment(oldDataState?.master?.tgl_app2).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                        <p>
                            3.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app3 ?? ''} - ${oldDataState?.master?.tgl_app3 ? moment(oldDataState?.master?.tgl_app3).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                    </div>
                    <div>
                        <p>
                            4.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app4 ?? ''} - ${oldDataState?.master?.tgl_app4 ? moment(oldDataState?.master?.tgl_app4).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                        <p>
                            5.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app5 ?? ''} - ${oldDataState?.master?.tgl_app5 ? moment(oldDataState?.master?.tgl_app5).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                        <p>
                            6.{' '}
                            {masterState !== 'HITUNG'
                                ? `${oldDataState?.master?.user_app6 ?? ''} - ${oldDataState?.master?.tgl_app6 ? moment(oldDataState?.master?.tgl_app6).format('YYYY-MM-DD HH:mm:ss') : ''}`
                                : ''}
                        </p>
                    </div>
                </div>
                <div className="flex h-[7%] items-center justify-end gap-2">
                    {masterState !== 'PREVIEW' && (
                        <ButtonComponent type="submit" onClick={validasiForm}>
                            {masterState}
                        </ButtonComponent>
                    )}
                    <ButtonComponent type="submit" onClick={() => onClose()}>
                        Tutup
                    </ButtonComponent>
                </div>
            </div>
        </DialogComponent>
    );
};

export default DIalogKoreksiApp;

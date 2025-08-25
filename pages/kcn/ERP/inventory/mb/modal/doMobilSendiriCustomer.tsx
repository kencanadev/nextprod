import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import styles from './mbstyle.module.css';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Tab, TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import { formatNumber, frmNumber, generateNU, FillFromSQL, FirstDayInPeriod, tanpaKoma, fetchPreferensi, overQTYAll, HitungBeratToleransi, generateNUDivisi } from '@/utils/routines';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import axios from 'axios';
import stylesTtb from '../mblist.module.css';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import { DataManager } from '@syncfusion/ej2-data';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { SpreadNumber } from '../../../fa/fpp/utils';
import { useSession } from '@/pages/api/sessionContext';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
L10n.load(idIDLocalization);

interface dialogMutasiBarangAntarGudang {
    userid: string;
    kode_entitas: any;
    isOpen: boolean;
    onClose: () => void;
    kode_user: any;
    status_edit: boolean;
    fbm_kode_group: any;
    kode_mb_edit: any;
    jenisDO: any;
    onRefresh: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
let gridMBList: Grid | any;
let gridMBList2: Grid | any;
let gridMBList3: Grid | any;
let gridMBList4: Grid | any;
let gridJURNALList: Grid | any;
let gridJURNALList2: Grid | any;
let gridJURNALList3: Grid | any;
let gridJURNALList4: Grid | any;
let gridAkunJurnalList: Grid | any;
let statusNolJurnal: string;

const DOMobilSendiriCustomer: React.FC<dialogMutasiBarangAntarGudang> = ({ userid, kode_entitas, isOpen, onClose, kode_user, status_edit, fbm_kode_group, kode_mb_edit, jenisDO, onRefresh }) => {
    const router = useRouter();
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const { sessionData, isLoading } = useSession();
    const nipUser = sessionData?.nip ?? '';
    const token = sessionData?.token ?? '';
    const [listGudang, setListGudang] = useState([]);
    const [listGudangPabrik, setListGudangPabrik] = useState([]);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [listPengemudi, setListPengemudi] = useState([]);
    const [listVia, setApiResponseVia] = useState([]); // default
    const [searchNoItem, setSearchNoItem] = useState('');
    const [searchNamaItem, setSearchNamaItem] = useState('');
    const [searchNoItemKontrak, setSearchNoItemKontrak] = useState('');
    const [searchNamaItemKontrak, setSearchNamaItemKontrak] = useState('');
    const [searchNoSupp, setSearchNoSupp] = useState('');
    const [searchNamaSupp, setSearchNamaSupp] = useState('');
    const [searchNoSO, setSearchNoSO] = useState('');
    const [searchNamaRelasiSO, setSearchNamaRelasiSO] = useState('');
    const [searchAlamatKirimSO, setSearchAlamatKirimSO] = useState('');
    const [searchNoCust, setSearchNoCust] = useState('');
    const [searchNamaCust, setSearchNamaCust] = useState('');
    const [searchNamaSales, setSearchNamaSales] = useState('');
    const [modalDaftarBarang, setModalDaftarBarang] = useState(false);
    const [modalDaftarBarangPBKontrak, setModalDaftarBarangPBKontrak] = useState(false);
    const [selectedBarang, setSelectedBarang] = useState<any>('');
    const [stokAsliSO, setStokAsliSO] = useState<any>([]);
    const [stokAsliSO2, setStokAsliSO2] = useState<any>([]);
    const [stokAsliSO3, setStokAsliSO3] = useState<any>([]);
    const [stokAsliSO4, setStokAsliSO4] = useState<any>([]);
    const [tokenRedis, setTokenRedis] = useState<string>('');

    const [modalCustRow, setModalCustRow] = useState(false);
    const [modalListSO, setModalListSO] = useState(false);
    const [modalSupplierRow, setModalSupplierRow] = useState(false);

    const [listDaftarBarang, setDaftarBarang] = useState([]);
    const [listDaftarBarangPBKontrak, setDaftarBarangPBKontrak] = useState([]);
    const [dsDaftarCustomer, setDsDaftarCustomer] = useState<any[]>([]);
    const [listDaftarSupplier, setListDataSupplier] = useState<any[]>([]);
    const [listDaftarSO, setListDataSO] = useState<any[]>([]);
    const [listAkunJurnal, setListAkunJurnal] = useState<any[]>([]); // pake let

    const [indexDataJurnal, setIndexDataJurnal] = useState('');
    const [modalAkunJurnal, setModalAkunJurnal] = useState(false);
    const [selectedAkunJurnal, setSelectedAkunJurnal] = useState<any>('');
    const [searchNoAkun, setSearchNoAkun] = useState('');
    const [searchNamaAkun, setSearchNamaAkun] = useState('');

    //HEADER
    const gridRefCust = useRef<any>(null);
    const [NoMB, setNoMB] = useState<any>('');
    const [NoMB2, setNoMB2] = useState<any>('');
    const [NoMB3, setNoMB3] = useState<any>('');
    const [NoMB4, setNoMB4] = useState<any>('');
    const [kontrakValue, setBarangKontrak] = useState<any>('');
    const [kontrakValue2, setBarangKontrak2] = useState<any>('');
    const [kontrakValue3, setBarangKontrak3] = useState<any>('');
    const [kontrakValue4, setBarangKontrak4] = useState<any>('');
    const [selectedGudang, setSelectedGudang] = useState<any>('');
    const [selectedGudang2, setSelectedGudang2] = useState<any>('');
    const [selectedGudang3, setSelectedGudang3] = useState<any>('');
    const [selectedGudang4, setSelectedGudang4] = useState<any>('');
    const [selectedSupplier, setSelectedSupplier] = useState<any>('');
    const [selectedSupplier2, setSelectedSupplier2] = useState<any>('');
    const [selectedSupplier3, setSelectedSupplier3] = useState<any>('');
    const [selectedSupplier4, setSelectedSupplier4] = useState<any>('');
    const [UpdateDetail, setUpdateDetail] = useState<any>(false); //blocking jurnal
    const [UpdateDetail2, setUpdateDetail2] = useState<any>(false);
    const [UpdateDetail3, setUpdateDetail3] = useState<any>(false);
    const [UpdateDetail4, setUpdateDetail4] = useState<any>(false);
    const [totalBerat, setTotalBerat] = useState<any>(0);
    const [totalBerat2, setTotalBerat2] = useState<any>(0);
    const [totalBerat3, setTotalBerat3] = useState<any>(0);
    const [totalBerat4, setTotalBerat4] = useState<any>(0);
    const [totalNettoRP, setTotalNettoRP] = useState<any>(0);
    const [totalNettoRP2, setTotalNettoRP2] = useState<any>(0);
    const [totalNettoRP3, setTotalNettoRP3] = useState<any>(0);
    const [totalNettoRP4, setTotalNettoRP4] = useState<any>(0);
    const [totalDebit, setTotalDebit] = useState<any>(0);
    const [totalDebit2, setTotalDebit2] = useState<any>(0);
    const [totalDebit3, setTotalDebit3] = useState<any>(0);
    const [totalDebit4, setTotalDebit4] = useState<any>(0);
    const [totalKredit, setTotalKredit] = useState<any>(0);
    const [totalKredit2, setTotalKredit2] = useState<any>(0);
    const [totalKredit3, setTotalKredit3] = useState<any>(0);
    const [totalKredit4, setTotalKredit4] = useState<any>(0);
    // multiple grid perlu state
    const [dataBarang, setDataBarang] = useState<any>({ nodes: [] });
    const [dataBarang2, setDataBarang2] = useState<any>({ nodes: [] });
    const [dataBarang3, setDataBarang3] = useState<any>({ nodes: [] });
    const [dataBarang4, setDataBarang4] = useState<any>({ nodes: [] });
    const [dataJurnal, setDataJurnal] = useState<any>({ nodes: [] });
    const [dataJurnal2, setDataJurnal2] = useState<any>({ nodes: [] });
    const [dataJurnal3, setDataJurnal3] = useState<any>({ nodes: [] });
    const [dataJurnal4, setDataJurnal4] = useState<any>({ nodes: [] });

    const [selectedJenisKirim, setJenisKirim] = useState<any>(
        jenisDO === 'KG' ? { kode_jenis_kirim: 'KG', nama_jenis_kirim: 'Kirim Gudang' } : { kode_jenis_kirim: 'KL', nama_jenis_kirim: 'Kirim Langsung' }
    );
    const [selectedToleransi, setSelectedToleransi] = useState<any>(0.0);
    const [selectedPengemudi, setSelectedPengemudi] = useState<any>('');
    const [modalFor, setModalFor] = useState<any>('');
    const [selectedGudangTujuan, setSelectedGudangTujuan] = useState<any>({ nama_gudang: null, kode_gudang: null });
    const [keterangan, setKeterangan] = useState<any>(null);
    const [noReff, setNoReff] = useState<any>(null);
    const [Via, setSelectedVia] = useState<any>(null);
    const [noKendaraan, setNoKendaraan] = useState<any>(null);
    const [alamatPengiriman, setAlamatPengiriman] = useState<any>(null);
    const [selectedCust, setSelectedCust] = useState<any>({ kode_cust: null });
    const [selectedJenisMobil, setJenisMobil] = useState<any>(null);
    const [selectedDataSO, setSelectedDataSO] = useState<any>(null);
    const [selectedNoSO, setSelectedNoSO] = useState<any>('');

    //EDIT
    const [kodeMB, setKodeMB] = useState<any>('');
    const [kodeMB2, setKodeMB2] = useState<any>('');
    const [kodeMB3, setKodeMB3] = useState<any>('');
    const [kodeMB4, setKodeMB4] = useState<any>('');
    const [tglMB, setTgl_MB] = useState<any>('');
    const [tglValuta, setTgl_Valuta] = useState<any>(moment().format('YYYY-MM-DD HH:mm:ss'));
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [tambah, setTambah] = useState(false);
    const [edit, setEdit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedHead, setSelectedHead] = useState('DO-1');
    const [selectedTab, setSelectedTab] = useState<any>('Barang');

    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3500,
        showClass: {
            popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
        },
        hideClass: {
            popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
        },
    });

    const myAlert = (text: any) => {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: `<p style="font-size:12px">${text}</p>`,
            width: '100%',
            target: '#dialogMBList',
        });
    };

    // DETAIL
    useEffect(() => {
        const Async = async () => {
            await FillFromSQL(kode_entitas, 'gudang', kode_user)
                .then((result: any) => {
                    setListGudang(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

                const respToken = await axios.get(`${apiUrl}/erp/token_uuid`, {});

                const responseToken = respToken.data.token;
                setTokenRedis(responseToken);
            await FillFromSQL(kode_entitas, 'gudang_pabrik', kode_user)
                .then((result: any) => {
                    console.log(result);
                    setListGudangPabrik(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            await FillFromSQL(kode_entitas, 'departemen')
                .then((result: any) => {
                    const modifiedData = result.map((item: any) => ({
                        ...item,
                        dept_ku: item.no_dept_dept + ' - ' + item.nama_dept,
                        dept_ku2: item.kode_dept + '*' + item.no_dept_dept + ' - ' + item.nama_dept,
                    }));
                    setListDepartemen(modifiedData);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            FillFromSQL(kode_entitas, 'pengemudi')
                .then((result: any) => {
                    setListPengemudi(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            const viaPengiriman = await axios.get(`${apiUrl}/erp/list_ekspedisi`, {
                params: {
                    entitas: kode_entitas,
                },
            });
            const apiVia = viaPengiriman.data.data;
            const transformedData_getvia = apiVia.map((item: any) => ({
                via: item.ekspedisi,
            }));
            setApiResponseVia(transformedData_getvia);

            //EDIT
            if (status_edit) {
                const listMBGroup = await axios.get(`${apiUrl}/erp/get_fbm_kode_group_mb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: fbm_kode_group, // FBM_KODE_GROUP
                    },
                });
                for (let i = 0; i < listMBGroup.data.data.length; i++) {
                    const kode_mb = listMBGroup.data.data[i].kode_mb;
                    const listHeaderDetail = await axios.get(`${apiUrl}/erp/master_detail_mb?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: kode_mb,
                        },
                    });
                    if (listHeaderDetail.data.status === true) {
                        const dataEdit = listHeaderDetail.data.data[0];
                        // DO-1
                        if (i === 0) {
                            //SUPER HEADER
                            setTgl_MB(moment(dataEdit.tgl_mb).format('YYYY-MM-DD HH:mm:ss'));
                            setTgl_Valuta(moment(dataEdit.tgl_valuta).format('YYYY-MM-DD HH:mm:ss'));
                            setSelectedGudangTujuan({ nama_gudang: dataEdit.gudang_tujuan, kode_gudang: dataEdit.kode_tujuan });
                            setKeterangan(dataEdit.keterangan);
                            setNoReff(dataEdit.no_reff);
                            setSelectedPengemudi(dataEdit.pengemudi);
                            if (jenisDO == 'KL') {
                                setSelectedCust({ kode_cust: dataEdit.kode_cust, nama_relasi: dataEdit.nama_relasi });
                                setSelectedNoSO(dataEdit.fbm_no_so);
                            }
                            // setSelectedCust({ kode_cust: dataEdit.kode_cust, nama_relasi: dataEdit.nama_relasi });
                            setNoKendaraan(dataEdit.nopol);
                            setSelectedVia(dataEdit.via);
                            setJenisMobil(dataEdit.jenis_mobil);
                            setSelectedToleransi(parseFloat(dataEdit.toleransi));
                            setAlamatPengiriman(dataEdit.alamat_kirim);
                            setJenisKirim({ kode_jenis_kirim: dataEdit.jenis_kirim });
                            //HEADER
                            setKodeMB(dataEdit.kode_mb);
                            setNoMB(dataEdit.no_mb);
                            setSelectedGudang({ nama_gudang: dataEdit.gudang_asal, kode_gudang: dataEdit.kode_gudang });
                            setSelectedSupplier({ kode_supp: dataEdit.kode_supp, nama_relasi: dataEdit.nama_supplier });
                            setBarangKontrak(dataEdit.kontrak === 'Y' ? 'Kontrak' : 'Non Kontrak');
                            // DETAIL
                            const modifiedDetail = dataEdit.detailMB.map((item: any) => ({
                                ...item,
                                no_barang: item.no_item,
                                nama_barang: item.nama_item,
                                berat: parseFloat(item.bobot) * parseFloat(item.qty_std),
                                berat_satuan: parseFloat(item.bobot), // ambil dari bobot
                            }));
                            setDataBarang({ nodes: modifiedDetail });

                            const totalBerat = modifiedDetail.reduce((total: any, item: any) => {
                                return total + item.berat;
                            }, 0);

                            const totalNettoRP = modifiedDetail.reduce((total: any, item: any) => {
                                return total + parseFloat(item.jumlah_rp);
                            }, 0);
                            setTotalBerat(totalBerat);
                            setTotalNettoRP(totalNettoRP);
                            //DETAIL JURNAL
                            const detailJurnal = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                                params: {
                                    entitas: kode_entitas,
                                    param1: kode_mb,
                                },
                            });
                            const modifiedDetailJurnal = detailJurnal.data.data.map((item: any) => ({
                                ...item,
                                debet_rp: parseFloat(item.debet_rp),
                                kredit_rp: parseFloat(item.kredit_rp),
                                jumlah_rp: parseFloat(item.jumlah_rp),
                                jumlah_mu: parseFloat(item.jumlah_mu),
                            }));
                            setDataJurnal({ nodes: modifiedDetailJurnal });
                            //DO-2
                        } else if (i === 1) {
                            console.log(dataEdit.no_mb);
                            console.log(dataEdit);
                            //HEADER
                            setKodeMB2(dataEdit.kode_mb);
                            setNoMB2(dataEdit.no_mb);
                            setSelectedGudang2({ nama_gudang: dataEdit.gudang_asal, kode_gudang: dataEdit.kode_gudang });
                            setSelectedSupplier2({ kode_supp: dataEdit.kode_supp, nama_relasi: dataEdit.nama_supplier });
                            setBarangKontrak2(dataEdit.kontrak === 'Y' ? 'Kontrak' : 'Non Kontrak');
                            // DETAIL
                            const modifiedDetail2 = dataEdit.detailMB.map((item: any) => ({
                                ...item,
                                no_barang: item.no_item,
                                nama_barang: item.nama_item,
                                berat: parseFloat(item.bobot) * parseFloat(item.qty_std),
                                berat_satuan: parseFloat(item.bobot), // ambil dari bobot
                            }));
                            setDataBarang2({ nodes: modifiedDetail2 });

                            const totalBerat2 = modifiedDetail2.reduce((total: any, item: any) => {
                                return total + item.berat;
                            }, 0);

                            const totalNettoRP2 = modifiedDetail2.reduce((total: any, item: any) => {
                                return total + parseFloat(item.jumlah_rp);
                            }, 0);
                            setTotalBerat2(totalBerat2);
                            setTotalNettoRP2(totalNettoRP2);
                            //DETAIL JURNAL
                            const detailJurnal2 = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                                params: {
                                    entitas: kode_entitas,
                                    param1: kode_mb,
                                },
                            });
                            const modifiedDetailJurnal2 = detailJurnal2.data.data.map((item: any) => ({
                                ...item,
                                debet_rp: parseFloat(item.debet_rp),
                                kredit_rp: parseFloat(item.kredit_rp),
                                jumlah_rp: parseFloat(item.jumlah_rp),
                                jumlah_mu: parseFloat(item.jumlah_mu),
                            }));
                            setDataJurnal2({ nodes: modifiedDetailJurnal2 });
                            //DO-3
                        } else if (i === 2) {
                            console.log(dataEdit.no_mb);
                            console.log(dataEdit);
                            //HEADER
                            setKodeMB3(dataEdit.kode_mb);
                            setNoMB3(dataEdit.no_mb);
                            setSelectedGudang3({ nama_gudang: dataEdit.gudang_asal, kode_gudang: dataEdit.kode_gudang });
                            setSelectedSupplier3({ kode_supp: dataEdit.kode_supp, nama_relasi: dataEdit.nama_supplier });
                            setBarangKontrak3(dataEdit.kontrak === 'Y' ? 'Kontrak' : 'Non Kontrak');
                            // DETAIL
                            const modifiedDetail3 = dataEdit.detailMB.map((item: any) => ({
                                ...item,
                                no_barang: item.no_item,
                                nama_barang: item.nama_item,
                                berat: parseFloat(item.bobot) * parseFloat(item.qty_std),
                                berat_satuan: parseFloat(item.bobot), // ambil dari bobot
                            }));
                            setDataBarang3({ nodes: modifiedDetail3 });

                            const totalBerat3 = modifiedDetail3.reduce((total: any, item: any) => {
                                return total + item.berat;
                            }, 0);

                            const totalNettoRP3 = modifiedDetail3.reduce((total: any, item: any) => {
                                return total + parseFloat(item.jumlah_rp);
                            }, 0);
                            setTotalBerat3(totalBerat3);
                            setTotalNettoRP3(totalNettoRP3);
                            //DETAIL JURNAL
                            const detailJurnal3 = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                                params: {
                                    entitas: kode_entitas,
                                    param1: kode_mb,
                                },
                            });
                            const modifiedDetailJurnal3 = detailJurnal3.data.data.map((item: any) => ({
                                ...item,
                                debet_rp: parseFloat(item.debet_rp),
                                kredit_rp: parseFloat(item.kredit_rp),
                                jumlah_rp: parseFloat(item.jumlah_rp),
                                jumlah_mu: parseFloat(item.jumlah_mu),
                            }));
                            setDataJurnal3({ nodes: modifiedDetailJurnal3 });
                            // DO-4
                        } else if (i === 3) {
                            console.log(dataEdit.no_mb);
                            console.log(dataEdit);
                            //HEADER
                            setKodeMB4(dataEdit.kode_mb);
                            setNoMB4(dataEdit.no_mb);
                            setSelectedGudang4({ nama_gudang: dataEdit.gudang_asal, kode_gudang: dataEdit.kode_gudang });
                            setSelectedSupplier4({ kode_supp: dataEdit.kode_supp, nama_relasi: dataEdit.nama_supplier });
                            setBarangKontrak4(dataEdit.kontrak === 'Y' ? 'Kontrak' : 'Non Kontrak');
                            // DETAIL
                            const modifiedDetail4 = dataEdit.detailMB.map((item: any) => ({
                                ...item,
                                no_barang: item.no_item,
                                nama_barang: item.nama_item,
                                berat: parseFloat(item.bobot) * parseFloat(item.qty_std),
                                berat_satuan: parseFloat(item.bobot), // ambil dari bobot
                            }));
                            setDataBarang4({ nodes: modifiedDetail4 });

                            const totalBerat4 = modifiedDetail4.reduce((total: any, item: any) => {
                                return total + item.berat;
                            }, 0);

                            const totalNettoRP4 = modifiedDetail4.reduce((total: any, item: any) => {
                                return total + parseFloat(item.jumlah_rp);
                            }, 0);
                            setTotalBerat4(totalBerat4);
                            setTotalNettoRP4(totalNettoRP4);
                            //DETAIL JURNAL
                            const detailJurnal4 = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                                params: {
                                    entitas: kode_entitas,
                                    param1: kode_mb,
                                },
                            });
                            const modifiedDetailJurnal4 = detailJurnal4.data.data.map((item: any) => ({
                                ...item,
                                debet_rp: parseFloat(item.debet_rp),
                                kredit_rp: parseFloat(item.kredit_rp),
                                jumlah_rp: parseFloat(item.jumlah_rp),
                                jumlah_mu: parseFloat(item.jumlah_mu),
                            }));
                            setDataJurnal4({ nodes: modifiedDetailJurnal4 });
                        }
                    } else {
                        console.log('gagal');
                        // tambah disini hanya ambil 1 dengan kode mb batal saja 1
                    }
                }
            } else {
                generateNU(kode_entitas, '', '23', moment().format('YYYYMM'))
                    .then((result) => {
                        console.log(result);
                        setNoMB(result);
                        setNoMB2(result.slice(0, -2) + (parseInt(result.slice(-2)) + 1).toString().padStart(2, '0'));
                        setNoMB3(result.slice(0, -2) + (parseInt(result.slice(-2)) + 2).toString().padStart(2, '0'));
                        setNoMB4(result.slice(0, -2) + (parseInt(result.slice(-2)) + 3).toString().padStart(2, '0'));
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        };
        Async();
    }, []);

    // ITEM
    useEffect(() => {
        const refreshDaftarBarang = async () => {
            console.log('DIEKSE');
            if (jenisDO === 'KG') {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_barang_mb?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: `%${searchNoItem}`,
                            param2: `%${searchNamaItem}`,
                            param3: '25',
                        },
                    });
                    const result = response.data;

                    if (result.status) {
                        setDaftarBarang(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
                // KIRIM LANGSUNG
            } else {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_barang_non_kontrak?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: selectedNoSO,
                            param2: 'all',
                            param3: 'all',
                        },
                    });
                    const result = response.data;

                    if (result.status) {
                        setDaftarBarang(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        const refreshDaftarBarangPBKontrak = async () => {
            console.log('DIEKSE2');
            if (selectedHead === 'DO-1') {
                var gudangHead = selectedGudang.kode_gudang;
            } else if (selectedHead === 'DO-2') {
                var gudangHead = selectedGudang2.kode_gudang;
            } else if (selectedHead === 'DO-3') {
                var gudangHead = selectedGudang3.kode_gudang;
            } else if (selectedHead === 'DO-4') {
                var gudangHead = selectedGudang4.kode_gudang;
            }
            console.log(gudangHead);
            if (jenisDO === 'KG') {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_detail_item_kontrak_dlg_mblkg?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: gudangHead,
                        },
                    });
                    const result = response.data;

                    if (result.status) {
                        setDaftarBarangPBKontrak(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }

                // KIRIM LANGSUNG
            } else {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_barang_kontrak?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: gudangHead,
                            param2: selectedNoSO,
                        },
                    });
                    const result = response.data;
                    console.log({ entitas: kode_entitas, param1: gudangHead, param2: selectedNoSO });
                    console.log(result.data);

                    if (result.status) {
                        setDaftarBarangPBKontrak(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };
        refreshDaftarBarang();
        refreshDaftarBarangPBKontrak();
    }, [searchNoItem, searchNamaItem, searchNoItemKontrak, searchNamaItemKontrak, selectedGudang, selectedGudang2, selectedGudang3, selectedGudang4]);

    //SUPPLIER
    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/m_supplier`, {
                    params: { entitas: kode_entitas },
                });
                const responseListSupp = response.data.data;

                const lowerCaseSearchNoSupp = searchNoSupp.toLowerCase();
                const lowerCaseSearchNamaSupp = searchNamaSupp.toLowerCase();

                const filteredList = responseListSupp.filter(
                    (item: any) => item.no_supp.toLowerCase().includes(lowerCaseSearchNoSupp) && item.nama_relasi.toLowerCase().includes(lowerCaseSearchNamaSupp)
                );

                const finalFilteredList = searchNoSupp === '' && searchNamaSupp === '' ? responseListSupp : filteredList;

                setListDataSupplier((prevList) => {
                    if (JSON.stringify(prevList) !== JSON.stringify(finalFilteredList)) {
                        return finalFilteredList;
                    }
                    return prevList;
                });
            } catch (error) {
                console.log(error);
            }
        };

        fetchSupplierData();
    }, [apiUrl, kode_entitas, searchNoSupp, searchNamaSupp]);

    //AKUN JURNAL
    useEffect(() => {
        const fetchSupplierDataJurnal = async () => {
            try {
                const responseAkunJurnal = await axios.get(`${apiUrl}/erp/akun_jurnal`, {
                    params: { entitas: kode_entitas },
                });

                const responseListAkun = responseAkunJurnal.data.data;

                const lowerCaseSearchNoAkun = searchNoAkun.toLowerCase();
                const lowerCaseSearchNamaAkun = searchNamaAkun.toLowerCase();

                const finalFilteredListAkun = responseListAkun.filter(
                    (item: any) => item.no_akun.toLowerCase().includes(lowerCaseSearchNoAkun) && item.nama_akun.toLowerCase().includes(lowerCaseSearchNamaAkun)
                );

                const listToSet = searchNoAkun === '' && searchNamaAkun === '' ? responseListAkun : finalFilteredListAkun;
                // setListAkunJurnal((prevList) => {
                //     if (JSON.stringify(prevList) !== JSON.stringify(listToSet)) {
                //         return listToSet;
                //     }
                //     return prevList;
                // });
                gridAkunJurnalList.dataSource = listToSet;
            } catch (error) {
                console.log(error);
            }
        };

        fetchSupplierDataJurnal();
    }, [searchNoAkun, searchNamaAkun]);

    // CUSTOMER
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const ListCustFilter = async (kode_entitas: string, param1: string, param2: string, param3: string) => {
                    const response = await axios.get(`${apiUrl}/erp/list_cust_so?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: param1,
                            param2: param2,
                            param3: param3,
                        },
                    });
                    const result = response.data;
                    return result;
                };
                const response = await ListCustFilter(kode_entitas, searchNamaCust, searchNoCust, searchNamaSales);

                if (response.status) {
                    // setDsDaftarCustomer(response.data);
                    if (gridRefCust.current) {
                        console.log('customerrrrr ter eksekusi', response.data);
                        gridRefCust.current.setProperties(response.data);
                        gridRefCust.current.refresh();
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchCustomerData();
    }, [searchNoCust, searchNamaCust, searchNamaSales]);

    //ORDER PENJUALAN // SO
    useEffect(() => {
        const fetchNoSOData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/list_so_kirim_langsung_mb`, {
                    params: { entitas: kode_entitas, param1: 'all', param2: 'all', param3: 'all' },
                });
                const responseListSO = response.data.data;

                const lowerCaseSearchNoSO = searchNoSO.toLowerCase();
                const lowerCaseSearchNama = searchNamaRelasiSO.toLowerCase();
                const lowerCaseSearchAlamat = searchAlamatKirimSO.toLowerCase();

                const filteredList = responseListSO.filter(
                    (item: any) =>
                        String(item.no_dok).toLowerCase().includes(lowerCaseSearchNoSO) &&
                        String(item.nama_relasi).toLowerCase().includes(lowerCaseSearchNama) &&
                        String(item.alamat).toLowerCase().includes(lowerCaseSearchAlamat)
                );

                const finalFilteredList = searchNoSO === '' && searchNamaRelasiSO === '' && searchAlamatKirimSO === '' ? responseListSO : filteredList;

                setListDataSO((prevList) => {
                    if (JSON.stringify(prevList) !== JSON.stringify(finalFilteredList)) {
                        return finalFilteredList;
                    }
                    return prevList;
                });
            } catch (error) {
                console.log(error);
            }
        };

        fetchNoSOData();
    }, [apiUrl, kode_entitas, searchNoSO, searchNamaRelasiSO, searchAlamatKirimSO]);

    const dialogClose = () => {
        onClose();
    };

    const getFromModalBarang = async () => {
        await handleDetail_EndEdit();
        handleDetail_Add('selected');
        setModalDaftarBarang(false);
        setModalDaftarBarangPBKontrak(false);
    };

    const getFromModalSO = async () => {
        setAlamatPengiriman(selectedDataSO.alamat);
        setSelectedCust({ kode_cust: selectedDataSO.kode_cust, nama_relasi: selectedDataSO.nama_relasi });
        setSelectedNoSO(selectedDataSO.no_dok);
    };

    const overQTYAllForMB = async (kode_entitas: string, kodeGudang: string, kodeItem: string, tgl: string, kode_dokumen: string, qty: any, jenis: any, jenisWarning: any, target: any = '') => {
        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        let Lskip_persediaan;

        try {
            const result = await fetchPreferensi(kode_entitas, `${apiUrl}/erp/preferensi?`);
            Lskip_persediaan = result[0]?.skip_persediaan || '';

            console.log('Lskip_persediaan = ', Lskip_persediaan);

            if (Lskip_persediaan === 'N') {
                const response = await axios.get(`${apiUrl}/erp/qty_stock_all`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeItem,
                        param2: tgl,
                        param3: kodeGudang,
                        param4: kode_dokumen,
                        param5: jenis,
                    },
                });

                const responseData = response.data.data;
                console.log('responseData[0].stok = ', responseData[0]?.stok, parseFloat(qty));

                if (responseData[0]?.stok < parseFloat(qty)) {
                    const swalResult = await swal.fire({
                        title: 'Warning',
                        text: `${jenisWarning} (${qty}) melebihi stok yang ada (${responseData[0].stok}).`,
                        icon: 'warning',
                        target,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        showCancelButton: true,
                    });

                    if (swalResult.isConfirmed) {
                        console.log('User menekan OK');
                        return true; // Mengembalikan nilai yang sesuai
                    } else {
                        console.log('User menekan Cancel');
                        return true;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    //DONE MULTIPLE
    const handleDetail_Add = async (jenis: any) => {
        await handleDetail_EndEdit();
        if (selectedHead === 'DO-1') {
            var totalLine = gridMBList!.dataSource.length;
            var isNoBarangNotEmpty = gridMBList!.dataSource.every((item: any) => item.no_barang !== '');
        } else if (selectedHead === 'DO-2') {
            var totalLine = gridMBList2.dataSource.length;
            var isNoBarangNotEmpty = gridMBList2.dataSource.every((item: any) => item.no_barang !== '');
        } else if (selectedHead === 'DO-3') {
            var totalLine = gridMBList3.dataSource.length;
            var isNoBarangNotEmpty = gridMBList3.dataSource.every((item: any) => item.no_barang !== '');
        } else if (selectedHead === 'DO-4') {
            var totalLine = gridMBList4.dataSource.length;
            var isNoBarangNotEmpty = gridMBList4.dataSource.every((item: any) => item.no_barang !== '');
        }
        if (jenis === 'selected') {
            if (selectedHead === 'DO-1') {
                var gudangHead = selectedGudang.kode_gudang;
            } else if (selectedHead === 'DO-2') {
                var gudangHead = selectedGudang2.kode_gudang;
            } else if (selectedHead === 'DO-3') {
                var gudangHead = selectedGudang3.kode_gudang;
            } else if (selectedHead === 'DO-4') {
                var gudangHead = selectedGudang4.kode_gudang;
            }
            // buat blocking saat menambah barang dari modal
            const response = await axios.get(`${apiUrl}/erp/qty_stock_all?`, {
                params: {
                    entitas: kode_entitas,
                    param1: selectedBarang.kode_item,
                    param2: moment().format('YYYY-MM-DD HH:mm:ss'),
                    param3: gudangHead,
                    param4: '',
                    param5: 'mb', // mb
                },
            });
            const responseData = response.data.data[0];
            const Stok = responseData.stok;
            console.log(Stok);

            overQTYAllForMB(kode_entitas, gudangHead, selectedBarang.kode_item, moment().format('YYYY-MM-DD HH:mm:ss'), '', 1, 'mb', 'Kuantitas barang', '#dialogMBList').then(async (result) => {
                if (result === true) {
                    console.log('tidak lolos');
                    document.getElementById('gridMBList')?.focus();
                    myAlert(`Item : ${selectedBarang.no_item} - ${selectedBarang.nama_item} \nKuantitas barang (1) melebihi stok digudang asal (${Stok})`);
                } else {
                    console.log('lolos');
                    // hpp_
                    try {
                        const response = await axios.get(`${apiUrl}/erp/hpp_ps?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: selectedBarang.kode_item,
                                param2: moment().format('YYYY-MM-DD HH:mm:ss'),
                                param3: gudangHead,
                            },
                        });
                        const result = response.data.data;
                        const harga_hpp = result[0].hpp !== undefined ? result[0].hpp : 0;
                        console.log('Be hpp', response.data.data);
                        const responserumus = await axios.get(`${apiUrl}/erp/get_rumus_berat?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: selectedBarang.kode_item,
                            },
                        });
                        const resultrumus = responserumus.data.data[0];
                        const beratSatu = await HitungBeratToleransi(resultrumus.tebal, resultrumus.lebar, resultrumus.panjang, selectedBarang.berat, 0.1, resultrumus.rumus_berat);
                        HitungBeratToleransi(resultrumus.tebal, resultrumus.lebar, resultrumus.panjang, selectedBarang.berat, selectedToleransi, resultrumus.rumus_berat).then((result) => {
                            console.log(result);
                            console.log(kontrakValue);
                            console.log(selectedBarang.stok);
                            console.log('selectedBarang', selectedBarang, result);

                            const berat_toleransi = result;
                            const createDetailBarangBaru = (selectedBarang: any, kontrakValue: any, harga_hpp: any, totalLine: any, berat_toleransi: any) => {
                                if (jenisDO === 'KG') {
                                    var qty = kontrakValue === 'Kontrak' ? selectedBarang.stok : 1;
                                    var stok_awal = kontrakValue === 'Kontrak' ? selectedBarang.stok : 0;
                                    //KL
                                } else {
                                    var qty = selectedBarang.stok_kontrak < selectedBarang.stok ? selectedBarang.stok_kontrak:selectedBarang.stok;
                                    var stok_awal = selectedBarang.stok_kontrak < selectedBarang.stok ? selectedBarang.stok_kontrak:selectedBarang.stok;
                                }
                                const no_kontrak = kontrakValue === 'Kontrak' ? selectedBarang.no_kontrak : '';
                                const temp = {
                                    kode_mb: '',
                                    id_std: totalLine,
                                    id_mb: totalLine,
                                    kode_pmb: null,
                                    id_pmb: null,
                                    kode_item: selectedBarang.kode_item,
                                    no_barang: selectedBarang.no_item,
                                    nama_barang: selectedBarang.nama_item,
                                    satuan: selectedBarang.satuan,
                                    qty: qty,
                                    stok_awal: stok_awal,
                                    sat_std: selectedBarang.satuan,
                                    qty_std: qty,
                                    harga_rp: harga_hpp,
                                    jumlah_rp: qty * harga_hpp,
                                    berat: qty * beratSatu,
                                    berat_satuan: beratSatu,
                                    hpp: harga_hpp,
                                    no_kontrak: no_kontrak,
                                    kode_fpb: null,
                                    id_fpb: null,
                                    export: null,
                                    no_refkontrak: null,
                                    fbm_id_so: jenisDO !== 'KG' ? selectedBarang.id_so : null,
                                    fbm_kode_so: jenisDO !== 'KG' ? selectedBarang.kode_so : null,
                                    nota: null,
                                    berat_cetak: 0.0,
                                    no_mbref: null,
                                    berat_toleransi: qty * berat_toleransi,
                                    berat_toleransi_satuan: berat_toleransi,
                                };
                                console.log('tmep hpp', temp, selectedBarang);

                                return temp;
                            };

                            let detailBarangBaru;

                            if (selectedHead === 'DO-1') {
                                detailBarangBaru = createDetailBarangBaru(selectedBarang, kontrakValue, harga_hpp, totalLine, berat_toleransi);
                                gridMBList!.dataSource[selectedRowIndex] = detailBarangBaru;
                                gridMBList!.refresh();
                            } else if (selectedHead === 'DO-2') {
                                detailBarangBaru = createDetailBarangBaru(selectedBarang, kontrakValue2, harga_hpp, totalLine, berat_toleransi);
                                gridMBList2.dataSource[selectedRowIndex] = detailBarangBaru;
                                gridMBList2.refresh();
                            } else if (selectedHead === 'DO-3') {
                                detailBarangBaru = createDetailBarangBaru(selectedBarang, kontrakValue3, harga_hpp, totalLine, berat_toleransi);
                                gridMBList3.dataSource[selectedRowIndex] = detailBarangBaru;
                                gridMBList3.refresh();
                            } else if (selectedHead === 'DO-4') {
                                detailBarangBaru = createDetailBarangBaru(selectedBarang, kontrakValue4, harga_hpp, totalLine, berat_toleransi);
                                gridMBList4.dataSource[selectedRowIndex] = detailBarangBaru;
                                gridMBList4.refresh();
                            }
                            setTambah(true);

                            return;
                        });
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            });
        } else if ((totalLine === 0 && jenis === 'new') || (isNoBarangNotEmpty && jenis === 'new')) {
            if (jenisDO === 'KL') {
                if (!selectedNoSO) {
                    myAlert('Silahkan pilih No. SO kirim Langsung terlebih dulu.');
                    return;
                }
            }

            if ((selectedHead === 'DO-1' && kontrakValue === '') || (selectedHead === 'DO-1' && selectedGudang === '')) {
                myAlert(`Silahkan pilih gudang asal & barang kontrak terlebih dulu. DO-1`);
                return;
            } else if ((selectedHead === 'DO-2' && kontrakValue2 === '') || (selectedHead === 'DO-2' && selectedGudang2 === '')) {
                myAlert(`Silahkan pilih gudang asal & barang kontrak terlebih dulu. DO-2`);
                return;
            } else if ((selectedHead === 'DO-3' && kontrakValue3 === '') || (selectedHead === 'DO-3' && selectedGudang3 === '')) {
                myAlert(`Silahkan pilih gudang asal & barang kontrak terlebih dulu. DO-3`);
                return;
            } else if ((selectedHead === 'DO-4' && kontrakValue4 === '') || (selectedHead === 'DO-4' && selectedGudang4 === '')) {
                myAlert(`Silahkan pilih gudang asal & barang kontrak terlebih dulu. DO-4`);
                return;
            }

            console.log(selectedHead);
            console.log('A');
            const detailBarangBaru = {
                kode_mb: '',
                id_std: totalLine + 1,
                id_mb: totalLine + 1,
                kode_pmb: null,
                id_pmb: null,
                kode_item: '',
                no_barang: '',
                nama_barang: '',
                satuan: '',
                qty: 0.0,
                sat_std: '',
                qty_std: '',
                harga_rp: '',
                jumlah_rp: '',
                berat: 0.0,
                berat_satuan: 0.0,
                hpp: '',
                no_kontrak: null,
                kode_fpb: null,
                id_fpb: null,
                export: null,
                no_refkontrak: null,
                fbm_id_so: null,
                fbm_kode_so: null,
                nota: null,
                berat_cetak: 0.0,
                no_mbref: null,
                berat_toleransi: 0.0,
                berat_toleransi_satuan: 0.0,
            };
            if (selectedHead === 'DO-1') {
                gridMBList!.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList!.startEdit(totalLine);
                }, 200);
            } else if (selectedHead === 'DO-2') {
                gridMBList2.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList2.startEdit(totalLine);
                }, 200);
            } else if (selectedHead === 'DO-3') {
                gridMBList3.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList3.startEdit(totalLine);
                }, 200);
            } else if (selectedHead === 'DO-4') {
                gridMBList4.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList4.startEdit(totalLine);
                }, 200);
            }
            setTambah(true);
        } else {
            document.getElementById('gridMBList')?.focus();
            myAlert(`Silahkan melengkapi data barang sebelum menambah data baru.`);
        }
    };

    // TIDAK DIGUNDAKAN
    const handleDetail_Edit = () => {
        console.log(gridMBList);
        const selectedRowIndex = gridMBList!.selectedRowIndex;
        setSelectedRowIndex(selectedRowIndex);
        console.log(selectedRowIndex);

        if (selectedRowIndex > -1) {
            gridMBList!.startEdit(selectedRowIndex);
            console.log(selectedRowIndex);
        } else {
            myAlert(`Silahkan pilih data barang terlebih dahulu.`);
        }
    };

    // TIDAK DIGUNAKAN
    const handleDetail_Edit_Jurnal = () => {
        console.log(gridJURNALList);
        const selectedRowIndex = gridJURNALList.selectedRowIndex;
        // setSelectedRowIndex(selectedRowIndex);
        // console.log(selectedRowIndex);

        if (selectedRowIndex > -1) {
            gridJURNALList.startEdit(selectedRowIndex);
            console.log(selectedRowIndex);
        } else {
            myAlert(`Silahkan pilih data jurnal terlebih dahulu.`);
        }
    };

    const handleDetail_EndEdit = async () => {
        if (selectedHead === 'DO-1') {
            gridMBList!.endEdit();
        } else if (selectedHead === 'DO-2') {
            gridMBList2.endEdit();
        } else if (selectedHead === 'DO-3') {
            gridMBList3.endEdit();
        } else if (selectedHead === 'DO-4') {
            gridMBList4.endEdit();
        }
    };

    const rowSelectingDetailBarang = (args: any) => {
        setSelectedRowIndex(args.rowIndex);
        console.log(args.rowIndex);
    };

    // DONE MULTIPLE
    const actionBeginDetailBarang = async (args: any) => {
        console.log('BEGIN :' + args.requestType);
    };

    // DONE MULTIPLE
    const actionCompleteDetailBarang = async (args: any) => {
        if (selectedHead === 'DO-1') {
            switch (args.requestType) {
                case 'save':
                    if (tambah === false) {
                        //blocking untuk item kontrak
                        if (gridMBList!.dataSource.length > 0 && kontrakValue === 'Kontrak') {
                            if (gridMBList!.dataSource[selectedRowIndex].qty > gridMBList!.dataSource[selectedRowIndex].stok_awal) {
                                myAlert(
                                    `Item : ${args.data.no_barang} - ${args.data.nama_barang} \nKuantitas barang (${frmNumber(args.data.qty)}) melebihi stok digudang asal (${frmNumber(
                                        gridMBList!.dataSource[selectedRowIndex].stok_awal
                                    )})`
                                );
                                gridMBList!.dataSource[selectedRowIndex] = { ...args.data, qty: gridMBList!.dataSource[selectedRowIndex].stok_awal };
                                gridMBList!.refresh();
                                // KALKULASI;
                                kalkulasi();
                                setUpdateDetail(true);
                                // OFF blocking disini
                            } else {
                                const editedData = args.data;
                                gridMBList!.dataSource[selectedRowIndex] = editedData;
                                gridMBList!.refresh();
                                // KALKULASI
                                kalkulasi();
                                setUpdateDetail(true);
                            }
                        } else {
                            //non kontrak
                            const editedData = args.data;
                            gridMBList!.dataSource[selectedRowIndex] = editedData;
                            gridMBList!.refresh();
                            // KALKULASI
                            kalkulasi();
                            setUpdateDetail(true);
                        }
                    } else if (edit) {
                        // KALKULASI 2
                        kalkulasi();
                        gridMBList!.refresh();
                        setUpdateDetail(true);
                    }
                    break;
                case 'beginEdit':
                    setTambah(false);
                    setEdit(true);
                    break;
                case 'delete':
                    gridMBList!.dataSource.forEach((item: any, index: any) => {
                        item.id_mb = index + 1;
                    });
                    gridMBList!.refresh();
                    break;
                case 'refresh':
                    // refreshDaftarBarangPBKontrak();
                    kalkulasi();
                    setTambah(false);
                    setEdit(false);
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-2') {
            switch (args.requestType) {
                case 'save':
                    if (tambah === false) {
                        //blocking untuk item kontrak
                        if (gridMBList2.dataSource.length > 0 && kontrakValue2 === 'Kontrak') {
                            if (gridMBList2.dataSource[selectedRowIndex].qty > gridMBList2.dataSource[selectedRowIndex].stok_awal) {
                                myAlert(
                                    `Item : ${args.data.no_barang} - ${args.data.nama_barang} \nKuantitas barang (${frmNumber(args.data.qty)}) melebihi stok digudang asal (${frmNumber(
                                        gridMBList2.dataSource[selectedRowIndex].stok_awal
                                    )})`
                                );
                                gridMBList2.dataSource[selectedRowIndex] = { ...args.data, qty: gridMBList2.dataSource[selectedRowIndex].stok_awal };
                                gridMBList2.refresh();
                                // KALKULASI;
                                kalkulasi();
                                setUpdateDetail2(true);
                                // OFF blocking disini
                            } else {
                                const editedData = args.data;
                                gridMBList2.dataSource[selectedRowIndex] = editedData;
                                gridMBList2.refresh();
                                // KALKULASI
                                kalkulasi();
                                setUpdateDetail2(true);
                            }
                        } else {
                            //non kontrak
                            const editedData = args.data;
                            gridMBList2.dataSource[selectedRowIndex] = editedData;
                            gridMBList2.refresh();
                            // KALKULASI
                            kalkulasi();
                            setUpdateDetail2(true);
                        }
                    } else if (edit) {
                        // KALKULASI 2
                        kalkulasi();
                        gridMBList2.refresh();
                        setUpdateDetail2(true);
                    }
                    break;
                case 'beginEdit':
                    setTambah(false);
                    setEdit(true);
                    break;
                case 'delete':
                    gridMBList2.dataSource.forEach((item: any, index: any) => {
                        item.id_mb = index + 1;
                    });
                    gridMBList2.refresh();
                    break;
                case 'refresh':
                    // refreshDaftarBarangPBKontrak();
                    kalkulasi();
                    setTambah(false);
                    setEdit(false);
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-3') {
            switch (args.requestType) {
                case 'save':
                    if (tambah === false) {
                        //blocking untuk item kontrak
                        if (gridMBList3.dataSource.length > 0 && kontrakValue2 === 'Kontrak') {
                            if (gridMBList3.dataSource[selectedRowIndex].qty > gridMBList3.dataSource[selectedRowIndex].stok_awal) {
                                myAlert(
                                    `Item : ${args.data.no_barang} - ${args.data.nama_barang} \nKuantitas barang (${frmNumber(args.data.qty)}) melebihi stok digudang asal (${frmNumber(
                                        gridMBList3.dataSource[selectedRowIndex].stok_awal
                                    )})`
                                );
                                gridMBList3.dataSource[selectedRowIndex] = { ...args.data, qty: gridMBList3.dataSource[selectedRowIndex].stok_awal };
                                gridMBList3.refresh();
                                // KALKULASI;
                                kalkulasi();
                                setUpdateDetail3(true);
                                // OFF blocking disini
                            } else {
                                const editedData = args.data;
                                gridMBList3.dataSource[selectedRowIndex] = editedData;
                                gridMBList3.refresh();
                                // KALKULASI
                                kalkulasi();
                                setUpdateDetail3(true);
                            }
                        } else {
                            //non kontrak
                            const editedData = args.data;
                            gridMBList3.dataSource[selectedRowIndex] = editedData;
                            gridMBList3.refresh();
                            // KALKULASI
                            kalkulasi();
                            setUpdateDetail3(true);
                        }
                    } else if (edit) {
                        // KALKULASI 3
                        kalkulasi();
                        gridMBList3.refresh();
                        setUpdateDetail3(true);
                    }
                    break;
                case 'beginEdit':
                    setTambah(false);
                    setEdit(true);
                    break;
                case 'delete':
                    gridMBList3.dataSource.forEach((item: any, index: any) => {
                        item.id_mb = index + 1;
                    });
                    gridMBList3.refresh();
                    break;
                case 'refresh':
                    // refreshDaftarBarangPBKontrak();
                    kalkulasi();
                    setTambah(false);
                    setEdit(false);
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-4') {
            switch (args.requestType) {
                case 'save':
                    if (tambah === false) {
                        //blocking untuk item kontrak
                        if (gridMBList4.dataSource.length > 0 && kontrakValue2 === 'Kontrak') {
                            if (gridMBList4.dataSource[selectedRowIndex].qty > gridMBList4.dataSource[selectedRowIndex].stok_awal) {
                                myAlert(
                                    `Item : ${args.data.no_barang} - ${args.data.nama_barang} \nKuantitas barang (${frmNumber(args.data.qty)}) melebihi stok digudang asal (${frmNumber(
                                        gridMBList4.dataSource[selectedRowIndex].stok_awal
                                    )})`
                                );
                                gridMBList4.dataSource[selectedRowIndex] = { ...args.data, qty: gridMBList4.dataSource[selectedRowIndex].stok_awal };
                                gridMBList4.refresh();
                                // KALKULASI;
                                kalkulasi();
                                setUpdateDetail4(true);
                                // OFF blocking disini
                            } else {
                                const editedData = args.data;
                                gridMBList4.dataSource[selectedRowIndex] = editedData;
                                gridMBList4.refresh();
                                // KALKULASI
                                kalkulasi();
                                setUpdateDetail4(true);
                            }
                        } else {
                            //non kontrak
                            const editedData = args.data;
                            gridMBList4.dataSource[selectedRowIndex] = editedData;
                            gridMBList4.refresh();
                            // KALKULASI
                            kalkulasi();
                            setUpdateDetail4(true);
                        }
                    } else if (edit) {
                        // KALKULASI 4
                        kalkulasi();
                        gridMBList4.refresh();
                        setUpdateDetail4(true);
                    }
                    break;
                case 'beginEdit':
                    setTambah(false);
                    setEdit(true);
                    break;
                case 'delete':
                    gridMBList4.dataSource.forEach((item: any, index: any) => {
                        item.id_mb = index + 1;
                    });
                    gridMBList4.refresh();
                    break;
                case 'refresh':
                    // refreshDaftarBarangPBKontrak();
                    kalkulasi();
                    setTambah(false);
                    setEdit(false);
                    break;
                default:
                    break;
            }
        }
        console.log('COMPLETED :' + args.requestType);
    };

    const actionBeginDetailJurnal = async (args: any) => {
        if (args.requestType === 'beginEdit') {
            console.log(args);
            console.log('Debit:', args.rowData.debet_rp);
            console.log('Kredit:', args.rowData.kredit_rp);
            if (args.rowData.debet_rp === 0) {
                console.log('masuk sini');
                statusNolJurnal = 'Debit';
            } else if (args.rowData.kredit_rp === 0) {
                statusNolJurnal = 'Kredit';
                console.log('masuk sini2');
            }
        }
    };

    //DONE MULTIPLE
    const actionCompleteDetailJurnal = async (args: any) => {
        if (selectedHead === 'DO-1') {
            switch (args.requestType) {
                case 'save':
                    let editedData;
                    console.log(statusNolJurnal);
                    if (statusNolJurnal === 'Debit' && gridJURNALList.dataSource[args.rowIndex].debet_rp !== 0) {
                        editedData = { ...args.data, kredit_rp: 0 };
                        gridJURNALList.dataSource[args.rowIndex] = editedData;
                    } else if (statusNolJurnal === 'Kredit' && gridJURNALList.dataSource[args.rowIndex].kredit_rp !== 0) {
                        editedData = { ...args.data, debet_rp: 0 };
                        gridJURNALList.dataSource[args.rowIndex] = editedData;
                    }
                    kalkulasiJurnal();
                    gridJURNALList.refresh();
                    break;
                case 'beginEdit':
                    console.log('EDIT');
                    break;
                case 'delete':
                    break;
                case 'refresh':
                    console.log('REFRESH');
                    kalkulasiJurnal();
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-2') {
            switch (args.requestType) {
                case 'save':
                    let editedData;
                    console.log(statusNolJurnal);
                    if (statusNolJurnal === 'Debit' && gridJURNALList2.dataSource[args.rowIndex].debet_rp !== 0) {
                        editedData = { ...args.data, kredit_rp: 0 };
                        gridJURNALList2.dataSource[args.rowIndex] = editedData;
                    } else if (statusNolJurnal === 'Kredit' && gridJURNALList2.dataSource[args.rowIndex].kredit_rp !== 0) {
                        editedData = { ...args.data, debet_rp: 0 };
                        gridJURNALList2.dataSource[args.rowIndex] = editedData;
                    }
                    kalkulasiJurnal();
                    gridJURNALList2.refresh();
                    break;
                case 'beginEdit':
                    console.log('EDIT');
                    break;
                case 'delete':
                    break;
                case 'refresh':
                    console.log('REFRESH');
                    kalkulasiJurnal();
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-3') {
            switch (args.requestType) {
                case 'save':
                    let editedData;
                    console.log(statusNolJurnal);
                    if (statusNolJurnal === 'Debit' && gridJURNALList3.dataSource[args.rowIndex].debet_rp !== 0) {
                        editedData = { ...args.data, kredit_rp: 0 };
                        gridJURNALList3.dataSource[args.rowIndex] = editedData;
                    } else if (statusNolJurnal === 'Kredit' && gridJURNALList3.dataSource[args.rowIndex].kredit_rp !== 0) {
                        editedData = { ...args.data, debet_rp: 0 };
                        gridJURNALList3.dataSource[args.rowIndex] = editedData;
                    }
                    kalkulasiJurnal();
                    gridJURNALList3.refresh();
                    break;
                case 'beginEdit':
                    console.log('EDIT');
                    break;
                case 'delete':
                    break;
                case 'refresh':
                    console.log('REFRESH');
                    kalkulasiJurnal();
                    break;
                default:
                    break;
            }
        } else if (selectedHead === 'DO-4') {
            switch (args.requestType) {
                case 'save':
                    let editedData;
                    console.log(statusNolJurnal);
                    if (statusNolJurnal === 'Debit' && gridJURNALList4.dataSource[args.rowIndex].debet_rp !== 0) {
                        editedData = { ...args.data, kredit_rp: 0 };
                        gridJURNALList4.dataSource[args.rowIndex] = editedData;
                    } else if (statusNolJurnal === 'Kredit' && gridJURNALList4.dataSource[args.rowIndex].kredit_rp !== 0) {
                        editedData = { ...args.data, debet_rp: 0 };
                        gridJURNALList4.dataSource[args.rowIndex] = editedData;
                    }
                    kalkulasiJurnal();
                    gridJURNALList4.refresh();
                    break;
                case 'beginEdit':
                    console.log('EDIT');
                    break;
                case 'delete':
                    break;
                case 'refresh':
                    console.log('REFRESH');
                    kalkulasiJurnal();
                    break;
                default:
                    break;
            }
        }
        console.log('COMPLETED :' + args.requestType);
    };

    //DONE MULTIPLE
    const kalkulasi = () => {
        if (status_edit == true) {
            console.log('hanya kalkulasi berat_toleransi');
            if (selectedHead === 'DO-1') {
                Promise.all(
                    gridMBList!.dataSource.map(async (item: any) => {
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang({ nodes: gridMBList!.dataSource });
                });
            } else if (selectedHead === 'DO-2') {
                Promise.all(
                    gridMBList2.dataSource.map(async (item: any) => {
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang2({ nodes: gridMBList2.dataSource });
                });
            } else if (selectedHead === 'DO-3') {
                Promise.all(
                    gridMBList3.dataSource.map(async (item: any) => {
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang3({ nodes: gridMBList3.dataSource });
                });
            } else if (selectedHead === 'DO-4') {
                Promise.all(
                    gridMBList4.dataSource.map(async (item: any) => {
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang4({ nodes: gridMBList4.dataSource });
                });
            }
        } else {
            if (selectedHead === 'DO-1') {
                Promise.all(
                    gridMBList!.dataSource.map(async (item: any) => {
                        console.log('item grid', item);

                        item.berat = SpreadNumber(item.qty * item.berat_satuan * 100) / 100;
                        console.log('berat', SpreadNumber(item.qty * item.berat_satuan * 100) / 100);
                        item.jumlah_rp = item.qty * item.harga_rp;
                        console.log('jumlah_rp', `qty ${item.qty} harga ${item.harga_rp}`, item.qty * item.harga_rp);

                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList!.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList!.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);
                    setTotalBerat(totalBerat);
                    setTotalNettoRP(totalNettoRP);
                    console.log('DIEKSE', gridMBList!.dataSource);
                    setDataBarang({ nodes: gridMBList!.dataSource });
                });
            } else if (selectedHead === 'DO-2') {
                Promise.all(
                    gridMBList2.dataSource.map(async (item: any) => {
                        item.berat = SpreadNumber(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);
                    setTotalBerat2(totalBerat); // 2
                    setTotalNettoRP2(totalNettoRP); // 2
                    console.log('DIEKSE');
                    setDataBarang2({ nodes: gridMBList2.dataSource });
                });
            } else if (selectedHead === 'DO-3') {
                Promise.all(
                    gridMBList3.dataSource.map(async (item: any) => {
                        item.berat = SpreadNumber(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);
                    setTotalBerat3(totalBerat); // 2
                    setTotalNettoRP3(totalNettoRP); // 2
                    console.log('DIEKSE');
                    setDataBarang3({ nodes: gridMBList3.dataSource });
                });
            } else if (selectedHead === 'DO-4') {
                Promise.all(
                    gridMBList4.dataSource.map(async (item: any) => {
                        item.berat = SpreadNumber(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = SpreadNumber(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);
                    setTotalBerat4(totalBerat); // 2
                    setTotalNettoRP4(totalNettoRP); // 2
                    console.log('DIEKSE');
                    setDataBarang4({ nodes: gridMBList4.dataSource });
                });
            }
        }
    };

    //DONE MULTIPLE
    const kalkulasiJurnal = () => {
        console.log('diekse');
        if (selectedHead === 'DO-1') {
            Promise.all(
                gridJURNALList.dataSource.map(async (item: any) => {
                    item.jumlah_mu = item.debet_rp + item.kredit_rp;
                    item.jumlah_rp = item.debet_rp + item.kredit_rp;
                })
            ).then(() => {
                const totalDebit = gridJURNALList.dataSource.reduce((total: any, item: any) => {
                    return total + item.debet_rp;
                }, 0);
                const totalKredit = gridJURNALList.dataSource.reduce((total: any, item: any) => {
                    return total + item.kredit_rp;
                }, 0);
                setTotalDebit(totalDebit);
                setTotalKredit(totalKredit);
                setDataJurnal({ nodes: gridJURNALList.dataSource });
            });
        } else if (selectedHead === 'DO-2') {
            Promise.all(
                gridJURNALList2.dataSource.map(async (item: any) => {
                    item.jumlah_mu = item.debet_rp + item.kredit_rp;
                    item.jumlah_rp = item.debet_rp + item.kredit_rp;
                })
            ).then(() => {
                const totalDebit = gridJURNALList2.dataSource.reduce((total: any, item: any) => {
                    return total + item.debet_rp;
                }, 0);
                const totalKredit = gridJURNALList2.dataSource.reduce((total: any, item: any) => {
                    return total + item.kredit_rp;
                }, 0);
                setTotalDebit2(totalDebit);
                setTotalKredit2(totalKredit);
                setDataJurnal2({ nodes: gridJURNALList2.dataSource });
            });
        } else if (selectedHead === 'DO-3') {
            Promise.all(
                gridJURNALList3.dataSource.map(async (item: any) => {
                    item.jumlah_mu = item.debet_rp + item.kredit_rp;
                    item.jumlah_rp = item.debet_rp + item.kredit_rp;
                })
            ).then(() => {
                const totalDebit = gridJURNALList3.dataSource.reduce((total: any, item: any) => {
                    return total + item.debet_rp;
                }, 0);
                const totalKredit = gridJURNALList3.dataSource.reduce((total: any, item: any) => {
                    return total + item.kredit_rp;
                }, 0);
                setTotalDebit3(totalDebit);
                setTotalKredit3(totalKredit);
                setDataJurnal3({ nodes: gridJURNALList3.dataSource });
            });
        } else if (selectedHead === 'DO-4') {
            Promise.all(
                gridJURNALList4.dataSource.map(async (item: any) => {
                    item.jumlah_mu = item.debet_rp + item.kredit_rp;
                    item.jumlah_rp = item.debet_rp + item.kredit_rp;
                })
            ).then(() => {
                const totalDebit = gridJURNALList4.dataSource.reduce((total: any, item: any) => {
                    return total + item.debet_rp;
                }, 0);
                const totalKredit = gridJURNALList4.dataSource.reduce((total: any, item: any) => {
                    return total + item.kredit_rp;
                }, 0);
                setTotalDebit4(totalDebit);
                setTotalKredit4(totalKredit);
                setDataJurnal4({ nodes: gridJURNALList4.dataSource });
            });
        }
    };

    const getBeratToleransi = async (toleransi: any): Promise<number[]> => {
        console.log(toleransi);
        const promises = gridMBList!.dataSource.map(async (item: any) => {
            const response = await axios.get(`${apiUrl}/erp/get_rumus_berat?`, {
                params: {
                    entitas: kode_entitas,
                    param1: item.kode_item,
                },
            });
            console.log(response.data.data[0]);
            const hasil = response.data.data[0];
            const result = await HitungBeratToleransi(hasil.tebal, hasil.lebar, hasil.panjang, item.berat, toleransi, hasil.rumus_berat);
            return result;
        });

        return Promise.all(promises);
    };

    const getBeratToleransi2 = async (toleransi: any): Promise<number[]> => {
        try {
            console.log(toleransi);
            if (!Array.isArray(gridMBList2.dataSource) || gridMBList2.dataSource.length === 0) {
                return [];
            }

            const promises = gridMBList2.dataSource.map(async (item: any) => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/get_rumus_berat`, {
                        params: {
                            entitas: kode_entitas,
                            param1: item.kode_item,
                        },
                    });

                    const hasil = response.data.data[0];

                    console.log(hasil);

                    const result = await HitungBeratToleransi(hasil.tebal, hasil.lebar, hasil.panjang, item.berat, toleransi, hasil.rumus_berat);

                    return result;
                } catch (error) {
                    console.error(`Error processing item ${item.kode_item}:`, error);
                    return null;
                }
            });
            const results = await Promise.all(promises);
            return results.filter((result) => result !== null);
        } catch (error) {
            console.error('Error in getBeratToleransi2:', error);
            return [];
        }
    };

    const getBeratToleransi3 = async (toleransi: any): Promise<number[]> => {
        try {
            console.log(toleransi);
            if (!Array.isArray(gridMBList3.dataSource) || gridMBList3.dataSource.length === 0) {
                return [];
            }

            const promises = gridMBList3.dataSource.map(async (item: any) => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/get_rumus_berat`, {
                        params: {
                            entitas: kode_entitas,
                            param1: item.kode_item,
                        },
                    });

                    const hasil = response.data.data[0];

                    console.log(hasil);

                    const result = await HitungBeratToleransi(hasil.tebal, hasil.lebar, hasil.panjang, item.berat, toleransi, hasil.rumus_berat);

                    return result;
                } catch (error) {
                    console.error(`Error processing item ${item.kode_item}:`, error);
                    return null;
                }
            });
            const results = await Promise.all(promises);
            return results.filter((result) => result !== null);
        } catch (error) {
            console.error('Error in getBeratToleransi3:', error);
            return [];
        }
    };

    const getBeratToleransi4 = async (toleransi: any): Promise<number[]> => {
        try {
            console.log(toleransi);
            if (!Array.isArray(gridMBList4.dataSource) || gridMBList4.dataSource.length === 0) {
                return [];
            }

            const promises = gridMBList4.dataSource.map(async (item: any) => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/get_rumus_berat`, {
                        params: {
                            entitas: kode_entitas,
                            param1: item.kode_item,
                        },
                    });

                    const hasil = response.data.data[0];

                    console.log(hasil);

                    const result = await HitungBeratToleransi(hasil.tebal, hasil.lebar, hasil.panjang, item.berat, toleransi, hasil.rumus_berat);

                    return result;
                } catch (error) {
                    console.error(`Error processing item ${item.kode_item}:`, error);
                    return null;
                }
            });
            const results = await Promise.all(promises);
            return results.filter((result) => result !== null);
        } catch (error) {
            console.error('Error in getBeratToleransi4:', error);
            return [];
        }
    };

    //Toleransi TAB
    useEffect(() => {
        // perhitungan saat tab diselect
        // tambah recalc di save doc cek ulang berat toleransi masing masing detail
        console.log(selectedToleransi);
        if (selectedHead === 'DO-1') {
            if (gridMBList && gridMBList!.dataSource) {
                getBeratToleransi(selectedToleransi)
                    .then((result) => {
                        console.log(result);
                        for (let i = 0; i < result.length; i++) {
                            if (gridMBList && gridMBList!.dataSource && gridMBList!.dataSource[i]) {
                                gridMBList!.dataSource[i] = { ...gridMBList!.dataSource[i], berat_toleransi_satuan: result[i] };
                                kalkulasi();
                                gridMBList!.refresh();
                            } else {
                                console.log(`Invalid at index ${i}`);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching berat toleransi:', error);
                    });
            } else {
                console.log('null List 1');
            }
        }

        if (selectedHead === 'DO-2') {
            if (gridMBList2 && gridMBList2.dataSource) {
                getBeratToleransi2(selectedToleransi)
                    .then((result) => {
                        console.log(result);
                        for (let i = 0; i < result.length; i++) {
                            if (gridMBList2 && gridMBList2.dataSource && gridMBList2.dataSource[i]) {
                                gridMBList2.dataSource[i] = { ...gridMBList2.dataSource[i], berat_toleransi_satuan: result[i] };
                                kalkulasi();
                                gridMBList2.refresh();
                            } else {
                                console.log(`Invalid at index ${i}`);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching berat toleransi:', error);
                    });
            } else {
                console.log('null List 2');
            }
        }
        if (selectedHead === 'DO-3') {
            if (gridMBList3 && gridMBList3.dataSource) {
                getBeratToleransi3(selectedToleransi)
                    .then((result) => {
                        console.log(result);
                        for (let i = 0; i < result.length; i++) {
                            if (gridMBList3 && gridMBList3.dataSource && gridMBList3.dataSource[i]) {
                                gridMBList3.dataSource[i] = { ...gridMBList3.dataSource[i], berat_toleransi_satuan: result[i] };
                                kalkulasi();
                                gridMBList3.refresh();
                            } else {
                                console.log(`Invalid at index ${i}`);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching berat toleransi:', error);
                    });
            } else {
                console.log('null List 3');
            }
        }
        if (selectedHead === 'DO-4') {
            if (gridMBList4 && gridMBList4.dataSource) {
                getBeratToleransi4(selectedToleransi)
                    .then((result) => {
                        console.log(result);
                        for (let i = 0; i < result.length; i++) {
                            if (gridMBList4 && gridMBList4.dataSource && gridMBList4.dataSource[i]) {
                                gridMBList4.dataSource[i] = { ...gridMBList4.dataSource[i], berat_toleransi_satuan: result[i] };
                                kalkulasi();
                                gridMBList4.refresh();
                            } else {
                                console.log(`Invalid at index ${i}`);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching berat toleransi:', error);
                    });
            } else {
                console.log('null List 4');
            }
        }
    }, [selectedHead, selectedToleransi]);

    //DONE MULTIPLE
    const DetailBarangDelete = () => {
        withReactContent(Swal)
            .fire({
                // icon: 'warning',
                html: `Hapus data barang baris ${selectedRowIndex + 1}?`,
                width: '15%',
                target: '#dialogMBList',
                showCancelButton: true,
                confirmButtonText: '<p style="font-size:10px">Ya</p>',
                cancelButtonText: '<p style="font-size:10px">Tidak</p>',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    console.log(selectedRowIndex);
                    if (selectedHead === 'DO-1') {
                        gridMBList!.dataSource.splice(selectedRowIndex, 1);
                        gridMBList!.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList!.refresh();
                    } else if (selectedHead === 'DO-2') {
                        gridMBList2.dataSource.splice(selectedRowIndex, 1);
                        gridMBList2.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList2.refresh();
                    } else if (selectedHead === 'DO-3') {
                        gridMBList3.dataSource.splice(selectedRowIndex, 1);
                        gridMBList3.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList3.refresh();
                    } else if (selectedHead === 'DO-4') {
                        gridMBList4.dataSource.splice(selectedRowIndex, 1);
                        gridMBList4.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList4.refresh();
                    }
                } else {
                    console.log('cancel');
                }
            });
    };

    //DONE MULTIPLE
    const DetailBarangDeleteAll = (jenis: any) => {
        if (jenis === 'tanpakonfirmasi') {
            if (selectedHead === 'DO-1') {
                gridMBList!.dataSource.splice(0, gridMBList!.dataSource.length);
                gridMBList!.refresh();
            } else if (selectedHead === 'DO-2') {
                gridMBList2.dataSource.splice(0, gridMBList2.dataSource.length);
                gridMBList2.refresh();
            } else if (selectedHead === 'DO-3') {
                gridMBList3.dataSource.splice(0, gridMBList3.dataSource.length);
                gridMBList3.refresh();
            } else if (selectedHead === 'DO-4') {
                gridMBList4.dataSource.splice(0, gridMBList4.dataSource.length);
                gridMBList4.refresh();
            }
        } else {
            withReactContent(Swal)
                .fire({
                    // icon: 'warning',
                    html: 'Hapus semua data barang?',
                    width: '15%',
                    target: '#dialogMBList',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        if (selectedHead === 'DO-1') {
                            gridMBList!.dataSource.splice(0, gridMBList!.dataSource.length);
                            gridMBList!.refresh();
                        } else if (selectedHead === 'DO-2') {
                            gridMBList2.dataSource.splice(0, gridMBList2.dataSource.length);
                            gridMBList2.refresh();
                        } else if (selectedHead === 'DO-3') {
                            gridMBList3.dataSource.splice(0, gridMBList3.dataSource.length);
                            gridMBList3.refresh();
                        } else if (selectedHead === 'DO-4') {
                            gridMBList4.dataSource.splice(0, gridMBList4.dataSource.length);
                            gridMBList4.refresh();
                        }
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    //DONE MULTIPLE
    const DetailBarangDeleteAllJurnal = () => {
        withReactContent(Swal)
            .fire({
                // icon: 'warning',
                html: 'Hapus semua data jurnal?',
                width: '15%',
                target: '#dialogMBList',
                showCancelButton: true,
                confirmButtonText: '<p style="font-size:10px">Ya</p>',
                cancelButtonText: '<p style="font-size:10px">Tidak</p>',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    if (selectedHead === 'DO-1') {
                        gridJURNALList.dataSource = [];
                    } else if (selectedHead === 'DO-2') {
                        gridJURNALList2.dataSource = [];
                    } else if (selectedHead === 'DO-3') {
                        gridJURNALList3.dataSource = [];
                    } else if (selectedHead === 'DO-4') {
                        gridJURNALList4.dataSource = [];
                    }
                } else {
                    console.log('cancel');
                }
            });
    };

    //KEYBOARD
    useEffect(() => {
        if (status_edit !== true) {
            const handleKeyPress = (event: KeyboardEvent) => {
                console.log(selectedTab);
                if (selectedHead === 'DO-1') {
                    if (selectedTab === 'Barang') {
                        if (event.key === 'Insert') {
                            handleDetail_Add('new');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAll('confirm');
                        } else if (event.key === 'Enter') {
                            gridMBList!.endEdit();
                        }
                    } else if (selectedTab === 'Jurnal') {
                        if (event.key === 'Insert') {
                            console.log('Insert key pressed');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAllJurnal();
                        } else if (event.key === 'Enter') {
                            gridJURNALList.endEdit();
                        }
                    }
                } else if (selectedHead === 'DO-2') {
                    if (selectedTab === 'Barang') {
                        if (event.key === 'Insert') {
                            handleDetail_Add('new');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAll('confirm');
                        } else if (event.key === 'Enter') {
                            gridMBList2.endEdit();
                        }
                    } else if (selectedTab === 'Jurnal') {
                        if (event.key === 'Insert') {
                            console.log('Insert key pressed');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAllJurnal();
                        } else if (event.key === 'Enter') {
                            gridJURNALList2.endEdit();
                        }
                    }
                } else if (selectedHead === 'DO-3') {
                    if (selectedTab === 'Barang') {
                        if (event.key === 'Insert') {
                            handleDetail_Add('new');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAll('confirm');
                        } else if (event.key === 'Enter') {
                            gridMBList3.endEdit();
                        }
                    } else if (selectedTab === 'Jurnal') {
                        if (event.key === 'Insert') {
                            console.log('Insert key pressed');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAllJurnal();
                        } else if (event.key === 'Enter') {
                            gridJURNALList3.endEdit();
                        }
                    }
                } else if (selectedHead === 'DO-4') {
                    if (selectedTab === 'Barang') {
                        if (event.key === 'Insert') {
                            handleDetail_Add('new');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAll('confirm');
                        } else if (event.key === 'Enter') {
                            gridMBList4.endEdit();
                        }
                    } else if (selectedTab === 'Jurnal') {
                        if (event.key === 'Insert') {
                            console.log('Insert key pressed');
                        } else if (event.key === 'Delete') {
                            DetailBarangDeleteAllJurnal();
                        } else if (event.key === 'Enter') {
                            gridJURNALList4.endEdit();
                        }
                    }
                }
            };

            document.addEventListener('keydown', handleKeyPress);

            return () => {
                document.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, []);

    //================ Editing template untuk kolom grid detail barang ==================
    const editTemplateMasterItem_No = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.no_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (selectedHead === 'DO-1') {
                                        if (kontrakValue === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-2') {
                                        if (kontrakValue2 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-3') {
                                        if (kontrakValue3 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-4') {
                                        if (kontrakValue4 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    }
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateMasterItem_Nama = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (selectedHead === 'DO-1') {
                                        if (kontrakValue === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-2') {
                                        if (kontrakValue2 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-3') {
                                        if (kontrakValue3 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    } else if (selectedHead === 'DO-4') {
                                        if (kontrakValue4 === 'Kontrak') {
                                            console.log('ini untuk modal kontrak');
                                            setModalDaftarBarangPBKontrak(true);
                                        } else {
                                            console.log('Non Kontrak');
                                            setModalDaftarBarang(true);
                                        }
                                    }
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateSubLedger = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    console.log('ICO only');
                                    // setModalDaftarBarang(true);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateDepartemen = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                {/* <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.departemen} readOnly={true} showClearButton={false} /> */}
                <DropDownListComponent
                    id="dept"
                    name="dept"
                    dataSource={listDepartemen}
                    fields={{ value: 'dept_ku2', text: `dept_ku` }}
                    floatLabelType="Never"
                    placeholder={args.departemen}
                    onChange={(e: any) => {
                        // console.log(e);
                        gridJURNALList.dataSource[args.index] = { ...gridJURNALList.dataSource[args.index], kode_dept: e.value.split(/\*/)[0], departemen: e.value.split(/\*/)[1] };
                        gridJURNALList.refresh();
                        // console.log(gridJURNALList.dataSource[args.index]);
                    }}
                />
            </div>
        );
    };

    //BELUM
    const editTemplateMasterItem_No_Akun = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.no_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    setModalAkunJurnal(true);
                                    console.log(args.index);
                                    setIndexDataJurnal(args.index);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateMasterItem_Nama_Akun = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.nama_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    setModalAkunJurnal(true);
                                    console.log(args.index);
                                    setIndexDataJurnal(args.index);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };
    // END BELUM

    const templateNoAkun = (args: any) => {
        return <div style={{ fontWeight: args.header === 'Y' ? 'bold' : 'normal' }}>{args.no_akun}</div>;
    };

    const templateNamaAkun = (args: any) => {
        return <div style={{ fontWeight: args.header === 'Y' ? 'bold' : 'normal' }}>{args.nama_akun}</div>;
    };

    //DONE MULTIPLE
    const autoJurnal = async () => {
        try {
            const result = await fetchPreferensi(kode_entitas, apiUrl); // dari detail ada
            console.log(result[0].kode_akun_persediaan);
            const AkunPersediaan = await axios.get(`${apiUrl}/erp/akun_jurnal_by_id?`, {
                params: {
                    entitas: kode_entitas,
                    param1: result[0].kode_akun_persediaan,
                    param2: 'all',
                    param3: 'all',
                },
            });
            const resAkunPersediaan = AkunPersediaan.data.data[0];
            let adaLbeih = 'true';
            if (selectedHead === 'DO-1') {
                var blockingJurnal = gridMBList!.dataSource.length === 0 || gridMBList!.dataSource.some((item: any) => !item.no_barang.trim());
                Promise.all(
                    gridMBList!.dataSource.map((item: any) => {
                        const temp = stokAsliSO.filter((items: any) => items.kode === item.kode_item)[0];
                        console.log('itemmmmmmm', item, temp, stokAsliSO, jenisDO);
                        if (jenisDO !== 'KG' && item.qty > temp.stok) {
                            myAlert(`Barang ${item.nama_barang} melebihi stok SO ${temp.stok}`);
                            adaLbeih = 'false';
                        }
                    })
                );

                if (adaLbeih == 'false') {
                    return;
                }
            } else if (selectedHead === 'DO-2') {
                var blockingJurnal = gridMBList2.dataSource.length === 0 || gridMBList2.dataSource.some((item: any) => !item.no_barang.trim());
                Promise.all(
                    gridMBList2!.dataSource.map((item: any) => {
                        const temp = stokAsliSO2.filter((items: any) => items.kode === item.kode_item)[0];
                        console.log('itemmmmmmm', item, temp, stokAsliSO2, jenisDO);
                        if (jenisDO !== 'KG' && item.qty > temp.stok) {
                            myAlert(`Barang ${item.nama_barang} melebihi stok SO ${temp.stok}`);
                            adaLbeih = 'false';
                        }
                    })
                );

                if (adaLbeih == 'false') {
                    return;
                }
            } else if (selectedHead === 'DO-3') {
                var blockingJurnal = gridMBList3.dataSource.length === 0 || gridMBList3.dataSource.some((item: any) => !item.no_barang.trim());

                Promise.all(
                    gridMBList3!.dataSource.map((item: any) => {
                        const temp = stokAsliSO3.filter((items: any) => items.kode === item.kode_item)[0];
                        console.log('itemmmmmmm', item, temp, stokAsliSO3, jenisDO);
                        if (jenisDO !== 'KG' && item.qty > temp.stok) {
                            myAlert(`Barang ${item.nama_barang} melebihi stok SO ${temp.stok}`);
                            adaLbeih = 'false';
                        }
                    })
                );

                if (adaLbeih == 'false') {
                    return;
                }
            } else if (selectedHead === 'DO-4') {
                var blockingJurnal = gridMBList4.dataSource.length === 0 || gridMBList4.dataSource.some((item: any) => !item.no_barang.trim());

                Promise.all(
                    gridMBList4!.dataSource.map((item: any) => {
                        const temp = stokAsliSO4.filter((items: any) => items.kode === item.kode_item)[0];
                        console.log('itemmmmmmm', item, temp, stokAsliSO4, jenisDO);
                        if (jenisDO !== 'KG' && item.qty > temp.stok) {
                            myAlert(`Barang ${item.nama_barang} melebihi stok SO ${temp.stok}`);
                            adaLbeih = 'false';
                        }
                    })
                );

                if (adaLbeih == 'false') {
                    return;
                }
            }

            if (blockingJurnal) {
                document.getElementById('gridMBList')?.focus();
                myAlert(`Silahkan isi data barang terlebih dulu.`);
            } else {
                let totNettoRP = 0;
                let namaGudang;
                if (selectedHead === 'DO-1') {
                    totNettoRP = parseFloat(totalNettoRP.toFixed(2));
                    namaGudang = selectedGudang.nama_gudang;
                } else if (selectedHead === 'DO-2') {
                    totNettoRP = parseFloat(totalNettoRP2.toFixed(2));
                    namaGudang = selectedGudang2.nama_gudang;
                } else if (selectedHead === 'DO-3') {
                    totNettoRP = parseFloat(totalNettoRP3.toFixed(2));
                    namaGudang = selectedGudang3.nama_gudang;
                } else if (selectedHead === 'DO-4') {
                    totNettoRP = parseFloat(totalNettoRP4.toFixed(2));
                    namaGudang = selectedGudang4.nama_gudang;
                }
                const json = {
                    kode_dokumen: '',
                    id_dokumen: 1,
                    dokumen: 'MB',
                    tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: resAkunPersediaan.kode_akun,
                    no_akun: resAkunPersediaan.no_akun,
                    nama_akun: resAkunPersediaan.nama_akun,
                    tipe: resAkunPersediaan.tipe,
                    kode_subledger: null,
                    kurs: 1.0,
                    debet_rp: totNettoRP,
                    kredit_rp: 0,
                    jumlah_rp: totNettoRP,
                    jumlah_mu: totNettoRP,
                    catatan: `Mutasi barang dari gudang ${namaGudang}`,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0.0,
                    kode_dept: null,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                };
                const json2 = {
                    kode_dokumen: '',
                    id_dokumen: 2,
                    dokumen: 'MB',
                    tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: resAkunPersediaan.kode_akun,
                    no_akun: resAkunPersediaan.no_akun,
                    nama_akun: resAkunPersediaan.nama_akun,
                    tipe: resAkunPersediaan.tipe,
                    kode_subledger: null,
                    kurs: 1.0,
                    debet_rp: 0,
                    kredit_rp: totNettoRP,
                    jumlah_rp: totNettoRP * -1,
                    jumlah_mu: totNettoRP * -1,
                    catatan: `Mutasi barang ke gudang ${selectedGudangTujuan.nama_gudang}`,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0.0,
                    kode_dept: null,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                };

                const combinedArray = [];

                combinedArray.push(json);
                combinedArray.push(json2);
                if (selectedHead === 'DO-1') {
                    gridJURNALList.dataSource = combinedArray;
                    gridJURNALList.refresh();
                } else if (selectedHead === 'DO-2') {
                    gridJURNALList2.dataSource = combinedArray;
                    gridJURNALList2.refresh();
                } else if (selectedHead === 'DO-3') {
                    gridJURNALList3.dataSource = combinedArray;
                    gridJURNALList3.refresh();
                } else if (selectedHead === 'DO-4') {
                    gridJURNALList4.dataSource = combinedArray;
                    gridJURNALList4.refresh();
                }
                if (selectedHead === 'DO-1') {
                    setUpdateDetail(false);
                } else if (selectedHead === 'DO-2') {
                    setUpdateDetail2(false);
                } else if (selectedHead === 'DO-3') {
                    setUpdateDetail3(false);
                } else if (selectedHead === 'DO-4') {
                    setUpdateDetail4(false);
                }
            }
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
        }
    };

    const recalcToleransi = async (nodes: any[], kode_entitas: string, selectedToleransi: any) => {
        if (nodes.length > 0) {
            const modifiedDetailJson = await Promise.all(
                nodes.map(async (item: any) => {
                    const responserumus = await axios.get(`${apiUrl}/erp/get_rumus_berat`, {
                        params: {
                            entitas: kode_entitas,
                            param1: item.kode_item,
                        },
                    });
                    const resultrumus = responserumus.data.data[0];
                    const berat_toleransi = await HitungBeratToleransi(resultrumus.tebal, resultrumus.lebar, resultrumus.panjang, item.berat, selectedToleransi, resultrumus.rumus_berat);
                    return {
                        ...item,
                        qty_std: item.qty,
                        berat_toleransi: SpreadNumber(item.qty * berat_toleransi * 100) / 100,
                        berat_toleransi_satuan: berat_toleransi,
                    };
                })
            );
            console.log(modifiedDetailJson);
            return modifiedDetailJson;
        }
        return [];
    };

    const saveDoc = async (alertAllowAppDate: any) => {
        startProgress()
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            const formatPeriode = moment(periode).format('YYYY-MM-DD');
            let modifiedDetailJson1: any[] = [];
            // =====BLOCKING SAVE DO-1=====
            if (dataBarang.nodes.length > 0) {
                const noKontrakArray = dataBarang.nodes.map((node: any) => node.no_kontrak);
                const hasDuplicates = noKontrakArray.some((no_kontrak: any, index: any) => noKontrakArray.indexOf(no_kontrak) !== index);
                // BARANG BELUM DIISI
                if (dataBarang.nodes.every((item: any) => item.no_barang === '')) {
                    myAlert(`Data barang belum diisi DO-1`);
                    // GUDANG SAMA
                } else if (selectedGudang.kode_gudang === selectedGudangTujuan.kode_gudang) {
                    myAlert(`Gudang asal dan Gudang tujuan tidak boleh sama DO-1`);
                    return;
                    // SELISIH JURNAL
                } else if (UpdateDetail) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-1`);
                    return;
                } else if (totalDebit - totalKredit !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-1`);
                    return;
                } else if (hasDuplicates && kontrakValue === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-1`);
                    return;
                } else {
                    // hitung ulang toleransi untuk masing item
                    modifiedDetailJson1 = await recalcToleransi(dataBarang.nodes, kode_entitas, selectedToleransi);
                    console.log(modifiedDetailJson1);
                }
            }

            let modifiedDetailJson2: any[] = [];
            // =====BLOCKING SAVE DO-2=====
            if (dataBarang2.nodes.length > 0) {
                const noKontrakArray = dataBarang2.nodes.map((node: any) => node.no_kontrak);
                const hasDuplicates = noKontrakArray.some((no_kontrak: any, index: any) => noKontrakArray.indexOf(no_kontrak) !== index);
                // BARANG BELUM DIISI
                if (dataBarang2.nodes.every((item: any) => item.no_barang === '')) {
                    myAlert(`Data barang belum diisi DO-2.`);
                    // GUDANG SAMA
                } else if (selectedGudang2.kode_gudang === selectedGudangTujuan.kode_gudang) {
                    myAlert(`Gudang asal dan Gudang tujuan tidak boleh sama DO-2.`);
                    return;
                    // SELISIH JURNAL
                } else if (UpdateDetail2) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-2`);
                    return;
                } else if (totalDebit2 - totalKredit2 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-2`);
                    return;
                } else if (hasDuplicates && kontrakValue2 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-2`);
                    return;
                } else {
                    modifiedDetailJson2 = await recalcToleransi(dataBarang2.nodes, kode_entitas, selectedToleransi);
                    console.log(modifiedDetailJson2);
                }
            }

            let modifiedDetailJson3: any[] = [];
            // =====BLOCKING SAVE DO-3=====
            if (dataBarang3.nodes.length > 0) {
                const noKontrakArray = dataBarang3.nodes.map((node: any) => node.no_kontrak);
                const hasDuplicates = noKontrakArray.some((no_kontrak: any, index: any) => noKontrakArray.indexOf(no_kontrak) !== index);
                // BARANG BELUM DIISI
                if (dataBarang3.nodes.every((item: any) => item.no_barang === '')) {
                    myAlert(`Data barang belum diisi DO-3.`);
                    // GUDANG SAMA
                } else if (selectedGudang3.kode_gudang === selectedGudangTujuan.kode_gudang) {
                    myAlert(`Gudang asal dan Gudang tujuan tidak boleh sama DO-3.`);
                    return;
                    // SELISIH JURNAL
                } else if (UpdateDetail3) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-3`);
                    return;
                } else if (totalDebit3 - totalKredit3 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-3`);
                    return;
                } else if (hasDuplicates && kontrakValue3 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-3`);
                    return;
                } else {
                    modifiedDetailJson3 = await recalcToleransi(dataBarang3.nodes, kode_entitas, selectedToleransi);
                    console.log(modifiedDetailJson3);
                }
            }

            let modifiedDetailJson4: any[] = [];
            // =====BLOCKING SAVE DO-4=====
            if (dataBarang4.nodes.length > 0) {
                const noKontrakArray = dataBarang4.nodes.map((node: any) => node.no_kontrak);
                const hasDuplicates = noKontrakArray.some((no_kontrak: any, index: any) => noKontrakArray.indexOf(no_kontrak) !== index);
                // BARANG BELUM DIISI
                if (dataBarang4.nodes.every((item: any) => item.no_barang === '')) {
                    myAlert(`Data barang belum diisi DO-4.`);
                    // GUDANG SAMA
                } else if (selectedGudang4.kode_gudang === selectedGudangTujuan.kode_gudang) {
                    myAlert(`Gudang asal dan Gudang tujuan tidak boleh sama DO-4.`);
                    return;
                    // SELISIH JURNAL
                } else if (UpdateDetail4) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-4`);
                    return;
                } else if (totalDebit4 - totalKredit4 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-4`);
                    return;
                } else if (hasDuplicates && kontrakValue4 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-4`);
                    return;
                } else {
                    modifiedDetailJson4 = await recalcToleransi(dataBarang4.nodes, kode_entitas, selectedToleransi);
                    console.log(modifiedDetailJson4);
                }
            }

            if (dataBarang.nodes.length === 0) {
                myAlert(`Data barang belum diisi DO-1`);
            } else if (!Via) {
                myAlert(`Silahkan pilih Via (Ekspedisi) terlebih dulu.`);
            } else if (!noKendaraan) {
                myAlert(`Silahkan isi No. Kendaraan terlebih dulu.`);
            } else if (!selectedJenisMobil) {
                myAlert(`Silahkan pilih Jenis Mobil terlebih dulu.`);
            } else if (!selectedToleransi) {
                myAlert(`Silahkan pilih Toleransi terlebih dulu.`);
                //PEDIODE AKUNTANSI
            } else if (moment().format('YYYY-MM-DD') < formatPeriode) {
                myAlert(`Tanggal transaksi tidak dalam periode akuntansi.`);
            } else if (alertAllowAppDate) {
                const confirmMessage = `Tgl. Dokumen lebih kecil dari hari ini, transaksi mutasi barang dilanjutkan.`;
                if (!confirm(confirmMessage)) {
                    return;
                } else {
                    saveDoc(false); // dizinkan
                }
            } else {
                if (isSaving) return; // Menghindari double input
                setIsSaving(true);
                //tutup proses edit berjalan
                // handleDetail_EndEdit();

                let defaultNoMB: any;
                let defaultNoMB2: any;
                let defaultNoMB3: any;
                let defaultNoMB4: any;
                if (status_edit !== true) {
                    const fromAPI = await generateNU(kode_entitas, '', '23', moment().format('YYYYMM'));
                    defaultNoMB = fromAPI;
                    defaultNoMB2 = fromAPI.slice(0, -2) + (parseInt(fromAPI.slice(-2)) + 1).toString().padStart(2, '0');
                    defaultNoMB3 = fromAPI.slice(0, -2) + (parseInt(fromAPI.slice(-2)) + 2).toString().padStart(2, '0');
                    defaultNoMB4 = fromAPI.slice(0, -2) + (parseInt(fromAPI.slice(-2)) + 3).toString().padStart(2, '0');
                    console.log(defaultNoMB);
                } else {
                    defaultNoMB = NoMB;
                    defaultNoMB2 = NoMB2;
                    defaultNoMB3 = NoMB3;
                    defaultNoMB4 = NoMB4;
                    console.log(defaultNoMB);
                }
                // =============================OLD==================================================
                // ==============LOLOS DO-1================
                //?Detail Barang
                const modifiedDetailJsonDO1: any = modifiedDetailJson1.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO1 = dataJurnal.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                }));

                //?Header Detail & Jurnal
                const JSON = {
                    // entitas: kode_entitas,
                    kode_mb: status_edit == true ? kodeMB : '',
                    // no_mb: NoMB,
                    no_mb: defaultNoMB,
                    tgl_mb: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_valuta: tglValuta,
                    kode_gudang: selectedGudang.kode_gudang,
                    kode_tujuan: selectedGudangTujuan.kode_gudang,
                    netto_rp: totalNettoRP,
                    total_berat: totalBerat,
                    keterangan: keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    persediaan: 'Persediaan',
                    no_reff: noReff,
                    kode_supp: selectedSupplier.kode_supp === undefined ? null : selectedSupplier.kode_supp,
                    kode_cust: selectedCust.kode_cust,
                    nopol: noKendaraan,
                    via: Via,
                    alamat_kirim: alamatPengiriman,
                    kontrak: kontrakValue === 'Kontrak' ? 'Y' : 'N',
                    status_export: null,
                    kode_gudang_cabang: null,
                    nama_gudang_cabang: null,
                    fdo: null,
                    ekspedisi: 'Y', // MKG default Y // MB N
                    toleransi: selectedToleransi,
                    harga_eks: 0.0,
                    harga_tambahan: 0.0,
                    jenis_mobil: selectedJenisMobil, //MKG // MB default null
                    jenis_kirim: selectedJenisKirim.kode_jenis_kirim, // MB default null
                    fbm: null,
                    fbm_no_so: jenisDO === 'KG' ? null : selectedNoSO,
                    fbm_kode_group: status_edit ? fbm_kode_group : null, // MB default //MKB diisi dibackend
                    fbm_no_group: 1, //MKG  //MB default
                    finalisasi: 'N',
                    pengajuan: 0,
                    approval: 'N',
                    tgl_finalisasi: null,
                    tgl_pengajuan: null,
                    tgl_update_app: null,
                    user_pengajuan: null,
                    user_approval: null,
                    jenis_mb: jenisDO === 'KG' ? 'MKG' : 'MKL', // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO1,
                    jurnal: modifiedDetailJurnalDO1,
                    SPM: {},
                    SJ: {},
                };
                // otomatisan 1

                const geSOMaster = await axios.get(`${apiUrl}/erp/list_so?entitas=${kode_entitas}&param1=${selectedNoSO}&param2=all&param3=all&param4=all&param5=all&param6=all&param7=all&param8=all&param9=all&param10=all&param11=all&param12=all&param13=all&param14=all&param15=all&param16=all&param17=25`);
                const dataSOMaster = geSOMaster.data.data[0]
                if (jenisDO !== 'KG' && dataBarang.nodes.length > 0) {
                    const kodeDevAll = selectedNoSO.substring(0, 2); // "SA"
                    const noSPM1 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    const noSJ1 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);

                    const spmM1: any = {};
                    spmM1.entitas = kode_entitas;
                    spmM1.no_do = noSPM1;
                    spmM1.tgl_do = moment().format('YYYY-MM-DD');
                    spmM1.tgl_kirim = JSON.tgl_valuta;
                    spmM1.kode_cust = JSON.kode_cust;
                    spmM1.alamat_kirim = JSON.alamat_kirim;
                    spmM1.via = JSON.via;
                    spmM1.fob = 'Dikirim';
                    spmM1.pengemudi = JSON.pengemudi;
                    spmM1.nopol = JSON.nopol;
                    spmM1.total_berat = totalBerat;
                    spmM1.keterangan = `[AUTO SPM FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON.no_mb} - ${JSON.keterangan}`;
                    spmM1.status = 'Tertutup';
                    spmM1.userid = userid;
                    spmM1.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    spmM1.kode_gudang = JSON.kode_tujuan;
                    spmM1.kode_kirim = null;
                    spmM1.kode_jual = kodeDevAll;
                    spmM1.keterangan_batal = null;
                    spmM1.nota = null;
                    spmM1.fdo = null;
                    spmM1.cetak_tunai = dataSOMaster.cetak_tunai;
                    spmM1.jenis_transaksi = 'Non Tunai';

                    const DetailSPM1 = [];
                    let TotalSPM1 = 0;
                    for (let index = 0; index < modifiedDetailJsonDO1.length; index++) {
                        const tempppp = await axios.get(
                            `${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${modifiedDetailJsonDO1[index].fbm_kode_so}&param2=${modifiedDetailJsonDO1[index].fbm_id_so}`
                        );
                        const quTempDetail: any = tempppp.data.data[0];
                        const tempSPM1: any = {};
                        tempSPM1.kode_so = modifiedDetailJsonDO1[index].fbm_kode_so;
                        tempSPM1.id_do = index + 1;
                        tempSPM1.id_so = modifiedDetailJsonDO1[index].fbm_id_so;
                        tempSPM1.no_so = quTempDetail.no_so;
                        tempSPM1.tgl_so = quTempDetail.tgl_so;

                        tempSPM1.tgl_bpb = quTempDetail.tgl_bpb;

                        tempSPM1.no_item = modifiedDetailJsonDO1[index].no_item;
                        tempSPM1.kode_item = modifiedDetailJsonDO1[index].kode_item;
                        tempSPM1.diskripsi = modifiedDetailJsonDO1[index].nama_barang;
                        tempSPM1.nama_cetak = quTempDetail.nama_cetak;

                        tempSPM1.satuan = modifiedDetailJsonDO1[index].sat_std;
                        tempSPM1.sat_std = modifiedDetailJsonDO1[index].sat_std;

                        tempSPM1.kode_mu = quTempDetail.kode_mu;
                        tempSPM1.kurs = quTempDetail.kurs;
                        tempSPM1.kurs_pajak = quTempDetail.kurs_pajak;
                        tempSPM1.harga_mu = quTempDetail.harga_mu;
                        tempSPM1.diskon = quTempDetail.diskon;
                        tempSPM1.diskon_mu = "";
                        tempSPM1.potongan_mu = quTempDetail.potongan_mu;
                        tempSPM1.kode_pajak = quTempDetail.kode_pajak;
                        tempSPM1.pajak_mu = 0;
                        tempSPM1.pajak = quTempDetail.pajak;
                        tempSPM1.jumlah_rp = 0;
                        tempSPM1.jumlah_mu = 0;
                        tempSPM1.include = 'N';
                        tempSPM1.berat = modifiedDetailJsonDO1[index].berat;
                        tempSPM1.tgl_jatuh_tempo = moment(quTempDetail.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');
                        if (quTempDetail.kode_dept == '') {
                            tempSPM1.kode_dept = '';
                        } else {
                            tempSPM1.kode_dept = quTempDetail.kode_dept;
                        }
                        if (quTempDetail.kode_kerja == '') {
                            tempSPM1.kode_kerja = '';
                        } else {
                            tempSPM1.kode_kerja = quTempDetail.kode_kerja;
                        }

                        tempSPM1.qty = modifiedDetailJsonDO1[index].qty_std;
                        tempSPM1.qty_sisa = modifiedDetailJsonDO1[index].qty_std;
                        tempSPM1.sisa = modifiedDetailJsonDO1[index].qty_std;
                        tempSPM1.qty_std = modifiedDetailJsonDO1[index].qty_std;

                        if (String(modifiedDetailJsonDO1[index].satuan) !== String(modifiedDetailJsonDO1[index].sat_std)) {
                            tempSPM1.satuan = tempSPM1.satuan;
                            // tempSPM1.qty = tempSPM1.satuan; KonvQty
                        }
                        TotalSPM1 += SpreadNumber(modifiedDetailJsonDO1[index].brt);
                        DetailSPM1.push(tempSPM1);
                    }

                    spmM1.total_berat = totalBerat;

                    const sjM1: any = {};
                    sjM1.entitas = kode_entitas;
                    sjM1.no_sj = noSJ1;
                    sjM1.tgl_sj = moment(JSON.tgl_mb).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
                    sjM1.no_reff = null;
                    sjM1.kode_gudang = JSON.kode_cust;
                    sjM1.kode_cust = JSON.kode_tujuan;
                    sjM1.alamat_kirim = JSON.alamat_kirim;
                    sjM1.via = JSON.via;
                    sjM1.fob = 'Dikirim';
                    sjM1.pengemudi = JSON.pengemudi;
                    sjM1.nopol = JSON.nopol;
                    sjM1.total_rp = 0;
                    sjM1.total_diskon_rp = 0;
                    sjM1.total_pajak_rp = 0;
                    sjM1.netto_rp = 0;
                    sjM1.total_berat = totalBerat;
                    sjM1.keterangan = `[AUTO SJ FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON.no_mb} - ${JSON.keterangan}`;
                    sjM1.status = 'Terbuka';
                    sjM1.userid = userid;
                    sjM1.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    sjM1.dokumen = null;
                    sjM1.kode_jual = kodeDevAll;
                    sjM1.kirim = null;
                    sjM1.nota = null;
                    sjM1.fdo = null;
                    sjM1.tgl_trxsj = JSON.tgl_valuta;
                    sjM1.cetak_tunai = dataSOMaster.cetak_tunai;
                    const DetailSJ1 = [];
                    let nNetto = 0;
                    let nBerat = 0;
                    for (let index = 0; index < DetailSPM1.length; index++) {
                        // const tempppp = await axios.get(`${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${DetailSPM1[index].fbm_kode_so}&param2=${DetailSPM1[index].fbm_id_so}`);
                        // const quTempDetail : any = tempppp.data.data[0]
                        const tempSJ1: any = {};
                        tempSJ1.id_sj = index + 1;
                        //                   showmessage('tempSJ1.kode_sj '+tempSJ1.kode_s );
                        tempSJ1.kode_do = 'oto'; //quDDOkode_d ;
                        tempSJ1.id_do = index + 1;
                        tempSJ1.kode_so = DetailSPM1[index].kode_so;
                        tempSJ1.id_so = DetailSPM1[index].id_so;

                        tempSJ1.kode_item = DetailSPM1[index].kode_item;
                        tempSJ1.diskripsi = DetailSPM1[index].nama_cetak;
                        tempSJ1.satuan = DetailSPM1[index].satuan;

                        tempSJ1.qty = DetailSPM1[index].qty;
                        tempSJ1.sat_std = DetailSPM1[index].sat_std;
                        tempSJ1.qty_std = DetailSPM1[index].qty_std;
                        tempSJ1.qty_sisa = DetailSPM1[index].qty_sisa;

                        tempSJ1.qty_retur = 0;
                        tempSJ1.kode_mu = DetailSPM1[index].kode_mu;
                        tempSJ1.kurs = DetailSPM1[index].kurs;
                        tempSJ1.kurs_pajak = DetailSPM1[index].kurs_pajak;
                        tempSJ1.harga_mu = DetailSPM1[index].harga_mu;
                        const response = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: DetailSPM1[index].kode_item,
                                param2: sjM1.tgl_sj, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: sjM1.kode_gudang,
                            },
                        });

                        const responseData = response.data.data;
                        let nilaiHpp = responseData.hpp;
                        tempSJ1.hpp = nilaiHpp;
                        tempSJ1.diskon = '';
                        tempSJ1.diskon_mu = 0;
                        tempSJ1.potongan_mu = 0;
                        tempSJ1.kode_pajak = DetailSPM1[index].kode_paja;
                        tempSJ1.pajak = 0;
                        tempSJ1.include = DetailSPM1[index].include;
                        tempSJ1.pajak_mu = 0;

                        tempSJ1.jumlah_mu = SpreadNumber(tempSJ1.harga_mu) * SpreadNumber(tempSJ1.qty);
                        tempSJ1.jumlah_rp = SpreadNumber(tempSJ1.jumlah_mu);

                        tempSJ1.kode_dept = DetailSPM1[index].kode_dept;
                        tempSJ1.kode_kerja = null;
                        tempSJ1.diskon_dok_mu = 0;
                        tempSJ1.kirim_mu = 0;

                        //                  if quMasterFBMEXPno_mb<>'' then
                        tempSJ1.no_mbref = JSON.no_mb;
                        tempSJ1.no_kontrak = null;
                        tempSJ1.no_lpb = null;
                        tempSJ1.kode_pajak = null;

                        if (tempSJ1.kode_dept === '') tempSJ1.kode_dept = '';
                        if (tempSJ1.kode_kerja === '') tempSJ1.kode_kerja = '';

                        nNetto += SpreadNumber(tempSJ1.jumlah_rp);
                        nBerat += SpreadNumber(DetailSPM1[index].berat) * SpreadNumber(tempSJ1.qty);

                        DetailSJ1.push(tempSJ1);
                    }

                    sjM1.total_rp = nNetto;
                    sjM1.netto_rp = nNetto;
                    sjM1.total_berat = totalBerat;

                    let TotalHPP = 0;

                    for (let i = 0; i < DetailSJ1.length; i++) {
                        TotalHPP += SpreadNumber(DetailSJ1[i].hpp) * SpreadNumber(DetailSJ1[i].qty_std);
                    }

                    const JSJD1: any = {};

                    const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const responseSettingData = responseSetting.data.data[0];

                    JSJD1.kode_dokumen = sjM1.kode_s;
                    JSJD1.id_dokumen = 1;
                    JSJD1.dokumen = 'SJ';
                    JSJD1.tgl_dokumen = sjM1.tgl_sj; //dtTglMb.Date;//sjM1.tgl_sj;
                    JSJD1.kode_akun = responseSettingData.kode_akun_hpp;
                    JSJD1.kode_subledger = '';
                    JSJD1.kurs = 1;
                    JSJD1.debet_rp = TotalHPP;
                    JSJD1.kredit_rp = 0;
                    JSJD1.jumlah_rp = SpreadNumber(JSJD1.debet_rp);
                    JSJD1.jumlah_mu = SpreadNumber(JSJD1.debet_rp) / SpreadNumber(JSJD1.kurs);
                    JSJD1.catatan = '[AUTO-JU FROM MBDO1-MKL] Harga Pokok Surat Jalan No: ' + sjM1.no_sj;
                    JSJD1.no_warkat = '';
                    JSJD1.tgl_valuta = sjM1.tgl_sj; //dtTglMb.Date;//sjM1.tgl_sj;
                    JSJD1.persen = 0;
                    JSJD1.kode_dept = '';
                    JSJD1.kode_kerja = '';
                    JSJD1.approval = 'N';
                    JSJD1.posting = 'N';
                    JSJD1.rekonsiliasi = 'N';
                    JSJD1.tgl_rekonsil = '';
                    JSJD1.userid = sjM1.userid;
                    JSJD1.tgl_update = JSON.tgl_mb; //MbsjM1.tgl_update;
                    JSJD1.audit = '';
                    JSJD1.kode_kry = '';
                    JSJD1.kode_jual = sjM1.kode_jual;
                    JSJD1.no_kontrak_um = null;

                    const JSJK1: any = {};

                    JSJK1.kode_dokumen = 'oto';
                    JSJK1.id_dokumen = 2;
                    JSJK1.dokumen = 'SJ';
                    JSJK1.tgl_dokumen = sjM1.tgl_sj;
                    JSJK1.kode_akun = responseSettingData.kode_akun_persediaan;
                    JSJK1.kode_subledger = '';
                    JSJK1.kurs = 1;
                    JSJK1.debet_rp = 0;
                    JSJK1.kredit_rp = TotalHPP;
                    JSJK1.jumlah_rp = SpreadNumber(JSJK1.kredit_rp) * -1;
                    JSJK1.jumlah_mu = (SpreadNumber(JSJK1.kredit_rp) / SpreadNumber(JSJK1.kurs)) * -1;
                    JSJK1.catatan = '[AUTO-JU FROM MBDO1-MKL] Persediaan Surat Jalan No: ' + sjM1.no_sj;
                    JSJK1.no_warkat = '';
                    JSJK1.tgl_valuta = sjM1.tgl_sj; //dtTglMb.Date;//sjM1.tgl_sj;
                    JSJK1.persen = 0;
                    JSJK1.kode_dept = '';
                    JSJK1.kode_kerja = '';
                    JSJK1.approval = 'N';
                    JSJK1.posting = 'N';
                    JSJK1.rekonsiliasi = 'N';
                    JSJK1.tgl_rekonsil = '';
                    JSJK1.userid = sjM1.userid;
                    JSJK1.tgl_update = JSON.tgl_mb; //sjM1.tgl_update;
                    JSJK1.audit = '';
                    JSJK1.kode_kry = '';
                    JSJK1.kode_jual = sjM1.kode_jual;
                    JSJK1.no_kontrak_um = null;

                    JSON.SPM = {
                        ...spmM1,
                        detail: DetailSPM1,
                    };

                    JSON.SJ = {
                        ...sjM1,
                        detail: DetailSJ1,
                        jurnal: [JSJD1, JSJK1],
                    };

                    //?Detail Jurnal
                    await generateNUDivisi(kode_entitas, noSPM1, kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    await generateNUDivisi(kode_entitas, noSJ1, kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                }
                // ==============END LOLOS DO-1================

                // ==============LOLOS DO-2================
                //?Detail Barang
                const modifiedDetailJurnalDO2 = dataJurnal2.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                }));
                const modifiedDetailJsonDO2: any = modifiedDetailJson2.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                }));

                //?Header Detail & Jurnal
                const JSON2 = {
                    // entitas: kode_entitas,
                    kode_mb: status_edit == true ? kodeMB2 : '',
                    // no_mb: status_edit == true ? NoMB2 : NoMB.slice(0, -2) + (parseInt(NoMB.slice(-2)) + 1).toString().padStart(2, '0'),
                    no_mb: defaultNoMB2,
                    tgl_mb: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_valuta: tglValuta,
                    kode_gudang: selectedGudang2.kode_gudang,
                    kode_tujuan: selectedGudangTujuan.kode_gudang,
                    netto_rp: totalNettoRP2,
                    total_berat: totalBerat2,
                    keterangan: keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    persediaan: 'Persediaan',
                    no_reff: noReff,
                    kode_supp: selectedSupplier2.kode_supp === undefined ? null : selectedSupplier2.kode_supp,
                    kode_cust: selectedCust.kode_cust,
                    nopol: noKendaraan,
                    via: Via,
                    alamat_kirim: alamatPengiriman,
                    kontrak: kontrakValue2 === 'Kontrak' ? 'Y' : 'N',
                    status_export: null,
                    kode_gudang_cabang: null,
                    nama_gudang_cabang: null,
                    fdo: null,
                    ekspedisi: 'Y', // MKG default Y // MB N
                    toleransi: selectedToleransi,
                    harga_eks: 0.0,
                    harga_tambahan: 0.0,
                    jenis_mobil: selectedJenisMobil, //MKG // MB default null
                    jenis_kirim: selectedJenisKirim.kode_jenis_kirim, // MB default null
                    fbm: null,
                    fbm_no_so: jenisDO === 'KG' ? null : selectedNoSO,
                    fbm_kode_group: status_edit ? fbm_kode_group : null, // MB default //MKB diisi dibackend
                    fbm_no_group: 2, //MKG  //MB default
                    finalisasi: 'N',
                    pengajuan: 0,
                    approval: 'N',
                    tgl_finalisasi: null,
                    tgl_pengajuan: null,
                    tgl_update_app: null,
                    user_pengajuan: null,
                    user_approval: null,
                    jenis_mb: jenisDO === 'KG' ? 'MKG' : 'MKL', // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO2,
                    jurnal: modifiedDetailJurnalDO2,
                    SPM: {},
                    SJ: {},
                };
                // otomatisan 2
                if (jenisDO !== 'KG' && dataBarang2.nodes.length > 0) {
                    const kodeDevAll = selectedNoSO.substring(0, 2); // "SA"
                    const noSPM2 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    const noSJ2 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);

                    const spmM2: any = {};
                    spmM2.entitas = kode_entitas;
                    spmM2.no_do = noSPM2;
                    spmM2.tgl_do = moment().format('YYYY-MM-DD');
                    spmM2.tgl_kirim = JSON2.tgl_valuta;
                    spmM2.kode_cust = JSON2.kode_cust;
                    spmM2.alamat_kirim = JSON2.alamat_kirim;
                    spmM2.via = JSON2.via;
                    spmM2.fob = 'Dikirim';
                    spmM2.pengemudi = JSON2.pengemudi;
                    spmM2.nopol = JSON2.nopol;
                    spmM2.total_berat = totalBerat2;
                    spmM2.keterangan = `[AUTO SPM FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON2.no_mb} - ${JSON2.keterangan}`;
                    spmM2.status = 'Tertutup';
                    spmM2.userid = userid;
                    spmM2.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    spmM2.kode_gudang = JSON2.kode_tujuan;
                    spmM2.kode_kirim = null;
                    spmM2.kode_jual = kodeDevAll;
                    spmM2.keterangan_batal = null;
                    spmM2.nota = null;
                    spmM2.fdo = null;
                    spmM2.cetak_tunai = dataSOMaster.cetak_tunai;
                    spmM2.jenis_transaksi = 'Non Tunai';

                    const DetailSPM2 = [];
                    let TotalSPM2 = 0;
                    for (let index = 0; index < modifiedDetailJsonDO2.length; index++) {
                        const tempppp = await axios.get(
                            `${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${modifiedDetailJsonDO2[index].fbm_kode_so}&param2=${modifiedDetailJsonDO2[index].fbm_id_so}`
                        );
                        const quTempDetail: any = tempppp.data.data[0];
                        const tempSPM2: any = {};
                        tempSPM2.kode_so = modifiedDetailJsonDO2[index].fbm_kode_so;
                        tempSPM2.id_do = index + 1;
                        tempSPM2.id_so = modifiedDetailJsonDO2[index].fbm_id_so;
                        tempSPM2.no_so = quTempDetail.no_so;
                        tempSPM2.tgl_so = quTempDetail.tgl_so;

                        tempSPM2.tgl_bpb = quTempDetail.tgl_bpb;

                        tempSPM2.no_item = modifiedDetailJsonDO2[index].no_item;
                        tempSPM2.kode_item = modifiedDetailJsonDO2[index].kode_item;
                        tempSPM2.diskripsi = modifiedDetailJsonDO2[index].nama_barang;
                        tempSPM2.nama_cetak = quTempDetail.nama_cetak;

                        tempSPM2.satuan = modifiedDetailJsonDO2[index].sat_std;
                        tempSPM2.sat_std = modifiedDetailJsonDO2[index].sat_std;

                        tempSPM2.kode_mu = quTempDetail.kode_mu;
                        tempSPM2.kurs = quTempDetail.kurs;
                        tempSPM2.kurs_pajak = quTempDetail.kurs_pajak;
                        tempSPM2.harga_mu = quTempDetail.harga_mu;
                        tempSPM2.diskon = quTempDetail.diskon;
                        tempSPM2.diskon_mu = "";
                        tempSPM2.potongan_mu = quTempDetail.potongan_mu;
                        tempSPM2.kode_pajak = quTempDetail.kode_pajak;
                        tempSPM2.pajak_mu = 0;
                        tempSPM2.pajak = quTempDetail.pajak;
                        tempSPM2.jumlah_rp = 0;
                        tempSPM2.jumlah_mu = 0;
                        tempSPM2.include = 'N';
                        tempSPM2.berat = modifiedDetailJsonDO2[index].berat;
                        tempSPM2.tgl_jatuh_tempo = moment(quTempDetail.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');
                        if (quTempDetail.kode_dept == '') {
                            tempSPM2.kode_dept = '';
                        } else {
                            tempSPM2.kode_dept = quTempDetail.kode_dept;
                        }
                        if (quTempDetail.kode_kerja == '') {
                            tempSPM2.kode_kerja = '';
                        } else {
                            tempSPM2.kode_kerja = quTempDetail.kode_kerja;
                        }

                        tempSPM2.qty = modifiedDetailJsonDO2[index].qty_std;
                        tempSPM2.qty_sisa = modifiedDetailJsonDO2[index].qty_std;
                        tempSPM2.sisa = modifiedDetailJsonDO2[index].qty_std;
                        tempSPM2.qty_std = modifiedDetailJsonDO2[index].qty_std;

                        if (String(modifiedDetailJsonDO2[index].satuan) !== String(modifiedDetailJsonDO2[index].sat_std)) {
                            tempSPM2.satuan = tempSPM2.satuan;
                            // tempSPM2.qty = tempSPM2.satuan; KonvQty
                        }
                        TotalSPM2 += SpreadNumber(modifiedDetailJsonDO2[index].brt);
                        DetailSPM2.push(tempSPM2);
                    }

                    spmM2.total_berat = totalBerat2;

                    const sjM2: any = {};
                    sjM2.entitas = kode_entitas;
                    sjM2.no_sj = noSJ2;
                    sjM2.tgl_sj = moment(JSON2.tgl_mb).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
                    sjM2.no_reff = null;
                    sjM2.kode_gudang = JSON2.kode_cust;
                    sjM2.kode_cust = JSON2.kode_tujuan;
                    sjM2.alamat_kirim = JSON2.alamat_kirim;
                    sjM2.via = JSON2.via;
                    sjM2.fob = 'Dikirim';
                    sjM2.pengemudi = JSON2.pengemudi;
                    sjM2.nopol = JSON2.nopol;
                    sjM2.total_rp = 0;
                    sjM2.total_diskon_rp = 0;
                    sjM2.total_pajak_rp = 0;
                    sjM2.netto_rp = 0;
                    sjM2.total_berat =totalBerat2 ;
                    sjM2.keterangan = `[AUTO SJ FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON2.no_mb} - ${JSON2.keterangan}`;
                    sjM2.status = 'Terbuka';
                    sjM2.userid = userid;
                    sjM2.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    sjM2.dokumen = null;
                    sjM2.kode_jual = kodeDevAll;
                    sjM2.kirim = null;
                    sjM2.nota = null;
                    sjM2.fdo = null;
                    sjM2.tgl_trxsj = JSON2.tgl_valuta;
                    sjM2.cetak_tunai = dataSOMaster.cetak_tunai;
                    const DetailSJ1 = [];
                    let nNetto = 0;
                    let nBerat = 0;
                    for (let index = 0; index < DetailSPM2.length; index++) {
                        // const tempppp = await axios.get(`${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${DetailSPM2[index].fbm_kode_so}&param2=${DetailSPM2[index].fbm_id_so}`);
                        // const quTempDetail : any = tempppp.data.data[0]
                        const tempSJ2: any = {};
                        tempSJ2.id_sj = index + 1;
                        //                   showmessage('tempSJ2.kode_sj '+tempSJ2.kode_s );
                        tempSJ2.kode_do = 'oto'; //quDDOkode_d ;
                        tempSJ2.id_do = index + 1;
                        tempSJ2.kode_so = DetailSPM2[index].kode_so;
                        tempSJ2.id_so = DetailSPM2[index].id_so;

                        tempSJ2.kode_item = DetailSPM2[index].kode_item;
                        tempSJ2.diskripsi = DetailSPM2[index].nama_cetak;
                        tempSJ2.satuan = DetailSPM2[index].satuan;

                        tempSJ2.qty = DetailSPM2[index].qty;
                        tempSJ2.sat_std = DetailSPM2[index].sat_std;
                        tempSJ2.qty_std = DetailSPM2[index].qty_std;
                        tempSJ2.qty_sisa = DetailSPM2[index].qty_sisa;

                        tempSJ2.qty_retur = 0;
                        tempSJ2.kode_mu = DetailSPM2[index].kode_mu;
                        tempSJ2.kurs = DetailSPM2[index].kurs;
                        tempSJ2.kurs_pajak = DetailSPM2[index].kurs_pajak;
                        tempSJ2.harga_mu = DetailSPM2[index].harga_mu;
                        const response = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: DetailSPM2[index].kode_item,
                                param2: sjM2.tgl_sj, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: sjM2.kode_gudang,
                            },
                        });

                        const responseData = response.data.data;
                        let nilaiHpp = responseData.hpp;
                        tempSJ2.hpp = nilaiHpp;
                        tempSJ2.diskon = '';
                        tempSJ2.diskon_mu = 0;
                        tempSJ2.potongan_mu = 0;
                        tempSJ2.kode_pajak = DetailSPM2[index].kode_paja;
                        tempSJ2.pajak = 0;
                        tempSJ2.include = DetailSPM2[index].include;
                        tempSJ2.pajak_mu = 0;

                        tempSJ2.jumlah_mu = SpreadNumber(tempSJ2.harga_mu) * SpreadNumber(tempSJ2.qty);
                        tempSJ2.jumlah_rp = SpreadNumber(tempSJ2.jumlah_mu);

                        tempSJ2.kode_dept = DetailSPM2[index].kode_dept;
                        tempSJ2.kode_kerja = null;
                        tempSJ2.diskon_dok_mu = 0;
                        tempSJ2.kirim_mu = 0;

                        //                  if quMasterFBMEXPno_mb<>'' then
                        tempSJ2.no_mbref = JSON2.no_mb;
                        tempSJ2.no_kontrak = null;
                        tempSJ2.no_lpb = null;
                        tempSJ2.kode_pajak = null;

                        if (tempSJ2.kode_dept === '') tempSJ2.kode_dept = '';
                        if (tempSJ2.kode_kerja === '') tempSJ2.kode_kerja = '';

                        nNetto += SpreadNumber(tempSJ2.jumlah_rp);
                        nBerat += SpreadNumber(DetailSPM2[index].berat) * SpreadNumber(tempSJ2.qty);

                        DetailSJ1.push(tempSJ2);
                    }

                    sjM2.total_rp = nNetto;
                    sjM2.netto_rp = nNetto;
                    sjM2.total_berat = totalBerat2;

                    let TotalHPP = 0;

                    for (let i = 0; i < DetailSJ1.length; i++) {
                        TotalHPP += SpreadNumber(DetailSJ1[i].hpp) * SpreadNumber(DetailSJ1[i].qty_std);
                    }

                    const JSJD2: any = {};

                    const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const responseSettingData = responseSetting.data.data[0];

                    JSJD2.kode_dokumen = sjM2.kode_s;
                    JSJD2.id_dokumen = 1;
                    JSJD2.dokumen = 'SJ';
                    JSJD2.tgl_dokumen = sjM2.tgl_sj; //dtTglMb.Date;//sjM2.tgl_sj;
                    JSJD2.kode_akun = responseSettingData.kode_akun_hpp;
                    JSJD2.kode_subledger = '';
                    JSJD2.kurs = 1;
                    JSJD2.debet_rp = TotalHPP;
                    JSJD2.kredit_rp = 0;
                    JSJD2.jumlah_rp = SpreadNumber(JSJD2.debet_rp);
                    JSJD2.jumlah_mu = SpreadNumber(JSJD2.debet_rp) / SpreadNumber(JSJD2.kurs);
                    JSJD2.catatan = '[AUTO-JU FROM MBDO1-MKL] Harga Pokok Surat Jalan No: ' + sjM2.no_s;
                    JSJD2.no_warkat = '';
                    JSJD2.tgl_valuta = sjM2.tgl_sj; //dtTglMb.Date;//sjM2.tgl_sj;
                    JSJD2.persen = 0;
                    JSJD2.kode_dept = '';
                    JSJD2.kode_kerja = '';
                    JSJD2.approval = 'N';
                    JSJD2.posting = 'N';
                    JSJD2.rekonsiliasi = 'N';
                    JSJD2.tgl_rekonsil = '';
                    JSJD2.userid = sjM2.userid;
                    JSJD2.tgl_update = JSON2.tgl_mb; //MbsjM2.tgl_update;
                    JSJD2.audit = '';
                    JSJD2.kode_kry = '';
                    JSJD2.kode_jual = sjM2.kode_jual;
                    JSJD2.no_kontrak_um = null;

                    const JSJK2: any = {};

                    JSJK2.kode_dokumen = 'oto';
                    JSJK2.id_dokumen = 2;
                    JSJK2.dokumen = 'SJ';
                    JSJK2.tgl_dokumen = sjM2.tgl_sj;
                    JSJK2.kode_akun = responseSettingData.kode_akun_persediaan;
                    JSJK2.kode_subledger = '';
                    JSJK2.kurs = 1;
                    JSJK2.debet_rp = 0;
                    JSJK2.kredit_rp = TotalHPP;
                    JSJK2.jumlah_rp = SpreadNumber(JSJK2.kredit_rp) * -1;
                    JSJK2.jumlah_mu = (SpreadNumber(JSJK2.kredit_rp) / SpreadNumber(JSJK2.kurs)) * -1;
                    JSJK2.catatan = '[AUTO-JU FROM MBDO1-MKL] Persediaan Surat Jalan No: ' + sjM2.no_sj;
                    JSJK2.no_warkat = '';
                    JSJK2.tgl_valuta = sjM2.tgl_sj; //dtTglMb.Date;//sjM2.tgl_sj;
                    JSJK2.persen = 0;
                    JSJK2.kode_dept = '';
                    JSJK2.kode_kerja = '';
                    JSJK2.approval = 'N';
                    JSJK2.posting = 'N';
                    JSJK2.rekonsiliasi = 'N';
                    JSJK2.tgl_rekonsil = '';
                    JSJK2.userid = sjM2.userid;
                    JSJK2.tgl_update = JSON2.tgl_mb; //sjM2.tgl_update;
                    JSJK2.audit = '';
                    JSJK2.kode_kry = '';
                    JSJK2.kode_jual = sjM2.kode_jual;
                    JSJK2.no_kontrak_um = null;

                    JSON2.SPM = {
                        ...spmM2,
                        detail: DetailSPM2,
                    };

                    JSON2.SJ = {
                        ...sjM2,
                        detail: DetailSJ1,
                        jurnal: [JSJD2, JSJK2],
                    };

                    //?Detail Jurnal
                    await generateNUDivisi(kode_entitas, noSPM2, kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    await generateNUDivisi(kode_entitas, noSJ2, kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                }
                // ==============END LOLOS DO-2================

                // ==============LOLOS DO-3================
                //?Detail Barang
                const modifiedDetailJsonDO3: any = modifiedDetailJson3.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO3 = dataJurnal3.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                }));

                //?Header Detail & Jurnal
                const JSON3 = {
                    // entitas: kode_entitas,
                    kode_mb: status_edit == true ? kodeMB3 : '',
                    // no_mb: status_edit == true ? NoMB3 : NoMB.slice(0, -2) + (parseInt(NoMB.slice(-2)) + 2).toString().padStart(2, '0'),
                    no_mb: defaultNoMB3,
                    tgl_mb: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_valuta: tglValuta,
                    kode_gudang: selectedGudang3.kode_gudang,
                    kode_tujuan: selectedGudangTujuan.kode_gudang,
                    netto_rp: totalNettoRP3,
                    total_berat: totalBerat3,
                    keterangan: keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    persediaan: 'Persediaan',
                    no_reff: noReff,
                    kode_supp: selectedSupplier3.kode_supp === undefined ? null : selectedSupplier3.kode_supp,
                    kode_cust: selectedCust.kode_cust,
                    nopol: noKendaraan,
                    via: Via,
                    alamat_kirim: alamatPengiriman,
                    kontrak: kontrakValue3 === 'Kontrak' ? 'Y' : 'N',
                    status_export: null,
                    kode_gudang_cabang: null,
                    nama_gudang_cabang: null,
                    fdo: null,
                    ekspedisi: 'Y', // MKG default Y // MB N
                    toleransi: selectedToleransi,
                    harga_eks: 0.0,
                    harga_tambahan: 0.0,
                    jenis_mobil: selectedJenisMobil, //MKG // MB default null
                    jenis_kirim: selectedJenisKirim.kode_jenis_kirim, // MB default null
                    fbm: null,
                    fbm_no_so: jenisDO === 'KG' ? null : selectedNoSO,
                    fbm_kode_group: status_edit ? fbm_kode_group : null, // MB default //MKB diisi dibackend
                    fbm_no_group: 3, //MKG  //MB default
                    finalisasi: 'N',
                    pengajuan: 0,
                    approval: 'N',
                    tgl_finalisasi: null,
                    tgl_pengajuan: null,
                    tgl_update_app: null,
                    user_pengajuan: null,
                    user_approval: null,
                    jenis_mb: jenisDO === 'KG' ? 'MKG' : 'MKL', // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO3,
                    jurnal: modifiedDetailJurnalDO3,
                    SPM: {},
                    SJ: {},
                };
                // otomatisan 3
                if (jenisDO !== 'KG' && dataBarang3.nodes.length > 0) {
                    const kodeDevAll = selectedNoSO.substring(0, 2); // "SA"
                    const noSPM3 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    const noSJ3 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);

                    const spmM3: any = {};
                    spmM3.entitas = kode_entitas;
                    spmM3.no_do = noSPM3;
                    spmM3.tgl_do = moment().format('YYYY-MM-DD');
                    spmM3.tgl_kirim = JSON3.tgl_valuta;
                    spmM3.kode_cust = JSON3.kode_cust;
                    spmM3.alamat_kirim = JSON3.alamat_kirim;
                    spmM3.via = JSON3.via;
                    spmM3.fob = 'Dikirim';
                    spmM3.pengemudi = JSON3.pengemudi;
                    spmM3.nopol = JSON3.nopol;
                    spmM3.total_berat = totalBerat3;
                    spmM3.keterangan = `[AUTO SPM FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON3.no_mb} - ${JSON3.keterangan}`;
                    spmM3.status = 'Tertutup';
                    spmM3.userid = userid;
                    spmM3.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    spmM3.kode_gudang = JSON3.kode_tujuan;
                    spmM3.kode_kirim = null;
                    spmM3.kode_jual = kodeDevAll;
                    spmM3.keterangan_batal = null;
                    spmM3.nota = null;
                    spmM3.fdo = null;
                    spmM3.cetak_tunai = dataSOMaster.cetak_tunai;
                    spmM3.jenis_transaksi = 'Non Tunai';

                    const DetailSPM3 = [];
                    let TotalSPM3 = 0;
                    for (let index = 0; index < modifiedDetailJsonDO3.length; index++) {
                        const tempppp = await axios.get(
                            `${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${modifiedDetailJsonDO3[index].fbm_kode_so}&param2=${modifiedDetailJsonDO3[index].fbm_id_so}`
                        );
                        const quTempDetail: any = tempppp.data.data[0];
                        const tempSPM3: any = {};
                        tempSPM3.kode_so = modifiedDetailJsonDO3[index].fbm_kode_so;
                        tempSPM3.id_do = index + 1;
                        tempSPM3.id_so = modifiedDetailJsonDO3[index].fbm_id_so;
                        tempSPM3.no_so = quTempDetail.no_so;
                        tempSPM3.tgl_so = quTempDetail.tgl_so;

                        tempSPM3.tgl_bpb = quTempDetail.tgl_bpb;

                        tempSPM3.no_item = modifiedDetailJsonDO3[index].no_item;
                        tempSPM3.kode_item = modifiedDetailJsonDO3[index].kode_item;
                        tempSPM3.diskripsi = modifiedDetailJsonDO3[index].nama_barang;
                        tempSPM3.nama_cetak = quTempDetail.nama_cetak;

                        tempSPM3.satuan = modifiedDetailJsonDO3[index].sat_std;
                        tempSPM3.sat_std = modifiedDetailJsonDO3[index].sat_std;

                        tempSPM3.kode_mu = quTempDetail.kode_mu;
                        tempSPM3.kurs = quTempDetail.kurs;
                        tempSPM3.kurs_pajak = quTempDetail.kurs_pajak;
                        tempSPM3.harga_mu = quTempDetail.harga_mu;
                        tempSPM3.diskon = quTempDetail.diskon;
                        tempSPM3.diskon_mu = "";
                        tempSPM3.potongan_mu = quTempDetail.potongan_mu;
                        tempSPM3.kode_pajak = quTempDetail.kode_pajak;
                        tempSPM3.pajak_mu = 0;
                        tempSPM3.pajak = quTempDetail.pajak;
                        tempSPM3.jumlah_rp = 0;
                        tempSPM3.jumlah_mu = 0;
                        tempSPM3.include = 'N';
                        tempSPM3.berat = modifiedDetailJsonDO3[index].berat;
                        tempSPM3.tgl_jatuh_tempo = moment(quTempDetail.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');
                        if (quTempDetail.kode_dept == '') {
                            tempSPM3.kode_dept = '';
                        } else {
                            tempSPM3.kode_dept = quTempDetail.kode_dept;
                        }
                        if (quTempDetail.kode_kerja == '') {
                            tempSPM3.kode_kerja = '';
                        } else {
                            tempSPM3.kode_kerja = quTempDetail.kode_kerja;
                        }

                        tempSPM3.qty = modifiedDetailJsonDO3[index].qty_std;
                        tempSPM3.qty_sisa = modifiedDetailJsonDO3[index].qty_std;
                        tempSPM3.sisa = modifiedDetailJsonDO3[index].qty_std;
                        tempSPM3.qty_std = modifiedDetailJsonDO3[index].qty_std;

                        if (String(modifiedDetailJsonDO3[index].satuan) !== String(modifiedDetailJsonDO3[index].sat_std)) {
                            tempSPM3.satuan = tempSPM3.satuan;
                            // tempSPM3.qty = tempSPM3.satuan; KonvQty
                        }
                        TotalSPM3 += SpreadNumber(modifiedDetailJsonDO3[index].brt);
                        DetailSPM3.push(tempSPM3);
                    }

                    spmM3.total_berat = totalBerat3;

                    const sjM3: any = {};
                    sjM3.entitas = kode_entitas;
                    sjM3.no_sj = noSJ3;
                    sjM3.tgl_sj = moment(JSON3.tgl_mb).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
                    sjM3.no_reff = null;
                    sjM3.kode_gudang = JSON3.kode_cust;
                    sjM3.kode_cust = JSON3.kode_tujuan;
                    sjM3.alamat_kirim = JSON3.alamat_kirim;
                    sjM3.via = JSON3.via;
                    sjM3.fob = 'Dikirim';
                    sjM3.pengemudi = JSON3.pengemudi;
                    sjM3.nopol = JSON3.nopol;
                    sjM3.total_rp = 0;
                    sjM3.total_diskon_rp = 0;
                    sjM3.total_pajak_rp = 0;
                    sjM3.netto_rp = 0;
                    sjM3.total_berat = totalBerat3;
                    sjM3.keterangan = `[AUTO SJ FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON3.no_mb} - ${JSON3.keterangan}`;
                    sjM3.status = 'Terbuka';
                    sjM3.userid = userid;
                    sjM3.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    sjM3.dokumen = null;
                    sjM3.kode_jual = kodeDevAll;
                    sjM3.kirim = null;
                    sjM3.nota = null;
                    sjM3.fdo = null;
                    sjM3.tgl_trxsj = JSON3.tgl_valuta;
                    sjM3.cetak_tunai = dataSOMaster.cetak_tunai;
                    const DetailSJ1 = [];
                    let nNetto = 0;
                    let nBerat = 0;
                    for (let index = 0; index < DetailSPM3.length; index++) {
                        // const tempppp = await axios.get(`${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${DetailSPM3[index].fbm_kode_so}&param2=${DetailSPM3[index].fbm_id_so}`);
                        // const quTempDetail : any = tempppp.data.data[0]
                        const tempSJ3: any = {};
                        tempSJ3.id_sj = index + 1;
                        //                   showmessage('tempSJ3.kode_sj '+tempSJ3.kode_s );
                        tempSJ3.kode_do = 'oto'; //quDDOkode_d ;
                        tempSJ3.id_do = index + 1;
                        tempSJ3.kode_so = DetailSPM3[index].kode_so;
                        tempSJ3.id_so = DetailSPM3[index].id_so;

                        tempSJ3.kode_item = DetailSPM3[index].kode_item;
                        tempSJ3.diskripsi = DetailSPM3[index].nama_cetak;
                        tempSJ3.satuan = DetailSPM3[index].satuan;

                        tempSJ3.qty = DetailSPM3[index].qty;
                        tempSJ3.sat_std = DetailSPM3[index].sat_std;
                        tempSJ3.qty_std = DetailSPM3[index].qty_std;
                        tempSJ3.qty_sisa = DetailSPM3[index].qty_sisa;

                        tempSJ3.qty_retur = 0;
                        tempSJ3.kode_mu = DetailSPM3[index].kode_mu;
                        tempSJ3.kurs = DetailSPM3[index].kurs;
                        tempSJ3.kurs_pajak = DetailSPM3[index].kurs_pajak;
                        tempSJ3.harga_mu = DetailSPM3[index].harga_mu;
                        const response = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: DetailSPM3[index].kode_item,
                                param2: sjM3.tgl_sj, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: sjM3.kode_gudang,
                            },
                        });

                        const responseData = response.data.data;
                        let nilaiHpp = responseData.hpp;
                        tempSJ3.hpp = nilaiHpp;
                        tempSJ3.diskon = '';
                        tempSJ3.diskon_mu = 0;
                        tempSJ3.potongan_mu = 0;
                        tempSJ3.kode_pajak = DetailSPM3[index].kode_paja;
                        tempSJ3.pajak = 0;
                        tempSJ3.include = DetailSPM3[index].include;
                        tempSJ3.pajak_mu = 0;

                        tempSJ3.jumlah_mu = SpreadNumber(tempSJ3.harga_mu) * SpreadNumber(tempSJ3.qty);
                        tempSJ3.jumlah_rp = SpreadNumber(tempSJ3.jumlah_mu);

                        tempSJ3.kode_dept = DetailSPM3[index].kode_dept;
                        tempSJ3.kode_kerja = null;
                        tempSJ3.diskon_dok_mu = 0;
                        tempSJ3.kirim_mu = 0;

                        //                  if quMasterFBMEXPno_mb<>'' then
                        tempSJ3.no_mbref = JSON3.no_mb;
                        tempSJ3.no_kontrak = null;
                        tempSJ3.no_lpb = null;
                        tempSJ3.kode_pajak = null;

                        if (tempSJ3.kode_dept === '') tempSJ3.kode_dept = '';
                        if (tempSJ3.kode_kerja === '') tempSJ3.kode_kerja = '';

                        nNetto += SpreadNumber(tempSJ3.jumlah_rp);
                        nBerat += SpreadNumber(DetailSPM3[index].berat) * SpreadNumber(tempSJ3.qty);

                        DetailSJ1.push(tempSJ3);
                    }

                    sjM3.total_rp = nNetto;
                    sjM3.netto_rp = nNetto;
                    sjM3.total_berat = totalBerat3;

                    let TotalHPP = 0;

                    for (let i = 0; i < DetailSJ1.length; i++) {
                        TotalHPP += SpreadNumber(DetailSJ1[i].hpp) * SpreadNumber(DetailSJ1[i].qty_std);
                    }

                    const JSJD3: any = {};

                    const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const responseSettingData = responseSetting.data.data[0];

                    JSJD3.kode_dokumen = sjM3.kode_s;
                    JSJD3.id_dokumen = 1;
                    JSJD3.dokumen = 'SJ';
                    JSJD3.tgl_dokumen = sjM3.tgl_sj; //dtTglMb.Date;//sjM3.tgl_sj;
                    JSJD3.kode_akun = responseSettingData.kode_akun_hpp;
                    JSJD3.kode_subledger = '';
                    JSJD3.kurs = 1;
                    JSJD3.debet_rp = TotalHPP;
                    JSJD3.kredit_rp = 0;
                    JSJD3.jumlah_rp = SpreadNumber(JSJD3.debet_rp);
                    JSJD3.jumlah_mu = SpreadNumber(JSJD3.debet_rp) / SpreadNumber(JSJD3.kurs);
                    JSJD3.catatan = '[AUTO-JU FROM MBDO1-MKL] Harga Pokok Surat Jalan No: ' + sjM3.no_s;
                    JSJD3.no_warkat = '';
                    JSJD3.tgl_valuta = sjM3.tgl_sj; //dtTglMb.Date;//sjM3.tgl_sj;
                    JSJD3.persen = 0;
                    JSJD3.kode_dept = '';
                    JSJD3.kode_kerja = '';
                    JSJD3.approval = 'N';
                    JSJD3.posting = 'N';
                    JSJD3.rekonsiliasi = 'N';
                    JSJD3.tgl_rekonsil = '';
                    JSJD3.userid = sjM3.userid;
                    JSJD3.tgl_update = JSON3.tgl_mb; //MbsjM3.tgl_update;
                    JSJD3.audit = '';
                    JSJD3.kode_kry = '';
                    JSJD3.kode_jual = sjM3.kode_jual;
                    JSJD3.no_kontrak_um = null;

                    const JSJK3: any = {};

                    JSJK3.kode_dokumen = 'oto';
                    JSJK3.id_dokumen = 2;
                    JSJK3.dokumen = 'SJ';
                    JSJK3.tgl_dokumen = sjM3.tgl_sj;
                    JSJK3.kode_akun = responseSettingData.kode_akun_persediaan;
                    JSJK3.kode_subledger = '';
                    JSJK3.kurs = 1;
                    JSJK3.debet_rp = 0;
                    JSJK3.kredit_rp = TotalHPP;
                    JSJK3.jumlah_rp = SpreadNumber(JSJK3.kredit_rp) * -1;
                    JSJK3.jumlah_mu = (SpreadNumber(JSJK3.kredit_rp) / SpreadNumber(JSJK3.kurs)) * -1;
                    JSJK3.catatan = '[AUTO-JU FROM MBDO1-MKL] Persediaan Surat Jalan No: ' + sjM3.no_sj;
                    JSJK3.no_warkat = '';
                    JSJK3.tgl_valuta = sjM3.tgl_sj; //dtTglMb.Date;//sjM3.tgl_sj;
                    JSJK3.persen = 0;
                    JSJK3.kode_dept = '';
                    JSJK3.kode_kerja = '';
                    JSJK3.approval = 'N';
                    JSJK3.posting = 'N';
                    JSJK3.rekonsiliasi = 'N';
                    JSJK3.tgl_rekonsil = '';
                    JSJK3.userid = sjM3.userid;
                    JSJK3.tgl_update = JSON3.tgl_mb; //sjM3.tgl_update;
                    JSJK3.audit = '';
                    JSJK3.kode_kry = '';
                    JSJK3.kode_jual = sjM3.kode_jual;
                    JSJK3.no_kontrak_um = null;

                    JSON3.SPM = {
                        ...spmM3,
                        detail: DetailSPM3,
                    };

                    JSON3.SJ = {
                        ...sjM3,
                        detail: DetailSJ1,
                        jurnal: [JSJD3, JSJK3],
                    };

                    //?Detail Jurnal
                    await generateNUDivisi(kode_entitas, noSPM3, kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    await generateNUDivisi(kode_entitas, noSJ3, kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                }
                // ==============END LOLOS DO-3================

                // ==============LOLOS DO-4================
                //?Detail Barang
                const modifiedDetailJsonDO4: any = modifiedDetailJson4.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                }));

                //?Detail Jurnal
                const modifiedDetailJurnalDO4 = dataJurnal4.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                }));

                //?Header Detail & Jurnal
                const JSON4 = {
                    // entitas: kode_entitas,
                    kode_mb: status_edit == true ? kodeMB4 : '',
                    // no_mb: status_edit == true ? NoMB4 : NoMB.slice(0, -2) + (parseInt(NoMB.slice(-2)) + 3).toString().padStart(2, '0'),
                    no_mb: defaultNoMB4,
                    tgl_mb: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_valuta: tglValuta,
                    kode_gudang: selectedGudang4.kode_gudang,
                    kode_tujuan: selectedGudangTujuan.kode_gudang,
                    netto_rp: totalNettoRP4,
                    total_berat: totalBerat4,
                    keterangan: keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    persediaan: 'Persediaan',
                    no_reff: noReff,
                    kode_supp: selectedSupplier4.kode_supp === undefined ? null : selectedSupplier4.kode_supp,
                    kode_cust: selectedCust.kode_cust,
                    nopol: noKendaraan,
                    via: Via,
                    alamat_kirim: alamatPengiriman,
                    kontrak: kontrakValue4 === 'Kontrak' ? 'Y' : 'N',
                    status_export: null,
                    kode_gudang_cabang: null,
                    nama_gudang_cabang: null,
                    fdo: null,
                    ekspedisi: 'Y', // MKG default Y // MB N
                    toleransi: selectedToleransi,
                    harga_eks: 0.0,
                    harga_tambahan: 0.0,
                    jenis_mobil: selectedJenisMobil, //MKG // MB default null
                    jenis_kirim: selectedJenisKirim.kode_jenis_kirim, // MB default null
                    fbm: null,
                    fbm_no_so: jenisDO === 'KG' ? null : selectedNoSO,
                    fbm_kode_group: status_edit ? fbm_kode_group : null, // MB default //MKB diisi dibackend
                    fbm_no_group: 4, //MKG  //MB default
                    finalisasi: 'N',
                    pengajuan: 0,
                    approval: 'N',
                    tgl_finalisasi: null,
                    tgl_pengajuan: null,
                    tgl_update_app: null,
                    user_pengajuan: null,
                    user_approval: null,
                    jenis_mb: jenisDO === 'KG' ? 'MKG' : 'MKL', // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO4,
                    jurnal: modifiedDetailJurnalDO4,
                    SPM: {},
SJ: {},
                };

                // otomatisan 4
                if (jenisDO !== 'KG' && dataBarang4.nodes.length > 0) {
                    const kodeDevAll = selectedNoSO.substring(0, 2); // "SA"
                    const noSPM4 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    const noSJ4 = await generateNUDivisi(kode_entitas, '', kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);

                    const spmM4: any = {};
                    spmM4.entitas = kode_entitas;
                    spmM4.no_do = noSPM4;
                    spmM4.tgl_do = moment().format('YYYY-MM-DD');
                    spmM4.tgl_kirim = JSON4.tgl_valuta;
                    spmM4.kode_cust = JSON4.kode_cust;
                    spmM4.alamat_kirim = JSON4.alamat_kirim;
                    spmM4.via = JSON4.via;
                    spmM4.fob = 'Dikirim';
                    spmM4.pengemudi = JSON4.pengemudi;
                    spmM4.nopol = JSON4.nopol;
                    spmM4.total_berat = totalBerat4;
                    spmM4.keterangan = `[AUTO SPM FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON4.no_mb} - ${JSON4.keterangan}`;
                    spmM4.status = 'Tertutup';
                    spmM4.userid = userid;
                    spmM4.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    spmM4.kode_gudang = JSON4.kode_tujuan;
                    spmM4.kode_kirim = null;
                    spmM4.kode_jual = kodeDevAll;
                    spmM4.keterangan_batal = null;
                    spmM4.nota = null;
                    spmM4.fdo = null;
                    spmM4.cetak_tunai = dataSOMaster.cetak_tunai;
                    spmM4.jenis_transaksi = 'Non Tunai';

                    const DetailSPM4 = [];
                    let TotalSPM4 = 0;
                    for (let index = 0; index < modifiedDetailJsonDO4.length; index++) {
                        const tempppp = await axios.get(
                            `${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${modifiedDetailJsonDO4[index].fbm_kode_so}&param2=${modifiedDetailJsonDO4[index].fbm_id_so}`
                        );
                        const quTempDetail: any = tempppp.data.data[0];
                        const tempSPM4: any = {};
                        tempSPM4.kode_so = modifiedDetailJsonDO4[index].fbm_kode_so;
                        tempSPM4.id_do = index + 1;
                        tempSPM4.id_so = modifiedDetailJsonDO4[index].fbm_id_so;
                        tempSPM4.no_so = quTempDetail.no_so;
                        tempSPM4.tgl_so = quTempDetail.tgl_so;

                        tempSPM4.tgl_bpb = quTempDetail.tgl_bpb;

                        tempSPM4.no_item = modifiedDetailJsonDO4[index].no_item;
                        tempSPM4.kode_item = modifiedDetailJsonDO4[index].kode_item;
                        tempSPM4.diskripsi = modifiedDetailJsonDO4[index].nama_barang;
                        tempSPM4.nama_cetak = quTempDetail.nama_cetak;

                        tempSPM4.satuan = modifiedDetailJsonDO4[index].sat_std;
                        tempSPM4.sat_std = modifiedDetailJsonDO4[index].sat_std;

                        tempSPM4.kode_mu = quTempDetail.kode_mu;
                        tempSPM4.kurs = quTempDetail.kurs;
                        tempSPM4.kurs_pajak = quTempDetail.kurs_pajak;
                        tempSPM4.harga_mu = quTempDetail.harga_mu;
                        tempSPM4.diskon = quTempDetail.diskon;
                        tempSPM4.diskon_mu = "";
                        tempSPM4.potongan_mu = quTempDetail.potongan_mu;
                        tempSPM4.kode_pajak = quTempDetail.kode_pajak;
                        tempSPM4.pajak_mu = 0;
                        tempSPM4.pajak = quTempDetail.pajak;
                        tempSPM4.jumlah_rp = 0;
                        tempSPM4.jumlah_mu = 0;
                        tempSPM4.include = 'N';
                        tempSPM4.berat = modifiedDetailJsonDO4[index].berat;
                        tempSPM4.tgl_jatuh_tempo = moment(quTempDetail.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');
                        if (quTempDetail.kode_dept == '') {
                            tempSPM4.kode_dept = '';
                        } else {
                            tempSPM4.kode_dept = quTempDetail.kode_dept;
                        }
                        if (quTempDetail.kode_kerja == '') {
                            tempSPM4.kode_kerja = '';
                        } else {
                            tempSPM4.kode_kerja = quTempDetail.kode_kerja;
                        }

                        tempSPM4.qty = modifiedDetailJsonDO4[index].qty_std;
                        tempSPM4.qty_sisa = modifiedDetailJsonDO4[index].qty_std;
                        tempSPM4.sisa = modifiedDetailJsonDO4[index].qty_std;
                        tempSPM4.qty_std = modifiedDetailJsonDO4[index].qty_std;

                        if (String(modifiedDetailJsonDO4[index].satuan) !== String(modifiedDetailJsonDO4[index].sat_std)) {
                            tempSPM4.satuan = tempSPM4.satuan;
                            // tempSPM4.qty = tempSPM4.satuan; KonvQty
                        }
                        TotalSPM4 += SpreadNumber(modifiedDetailJsonDO4[index].brt);
                        DetailSPM4.push(tempSPM4);
                    }

                    spmM4.total_berat = totalBerat4;

                    const sjM4: any = {};
                    sjM4.entitas = kode_entitas;
                    sjM4.no_sj = noSJ4;
                    sjM4.tgl_sj = moment(JSON4.tgl_mb).add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
                    sjM4.no_reff = null;
                    sjM4.kode_gudang = JSON4.kode_cust;
                    sjM4.kode_cust = JSON4.kode_tujuan;
                    sjM4.alamat_kirim = JSON4.alamat_kirim;
                    sjM4.via = JSON4.via;
                    sjM4.fob = 'Dikirim';
                    sjM4.pengemudi = JSON4.pengemudi;
                    sjM4.nopol = JSON4.nopol;
                    sjM4.total_rp = 0;
                    sjM4.total_diskon_rp = 0;
                    sjM4.total_pajak_rp = 0;
                    sjM4.netto_rp = 0;
                    sjM4.total_berat = totalBerat4;
                    sjM4.keterangan = `[AUTO SJ FROM MB-MBLKL-1] - Reff MB DO-1 Mobil Sendiri / Customer Langsung No: ${JSON4.no_mb} - ${JSON4.keterangan}`;
                    sjM4.status = 'Terbuka';
                    sjM4.userid = userid;
                    sjM4.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    sjM4.dokumen = null;
                    sjM4.kode_jual = kodeDevAll;
                    sjM4.kirim = null;
                    sjM4.nota = null;
                    sjM4.fdo = null;
                    sjM4.tgl_trxsj = JSON4.tgl_valuta;
                    sjM4.cetak_tunai = dataSOMaster.cetak_tunai;
                    const DetailSJ4 = [];
                    let nNetto = 0;
                    let nBerat = 0;
                    for (let index = 0; index < DetailSPM4.length; index++) {
                        // const tempppp = await axios.get(`${apiUrl}/erp/detail_so_mb_kirim_langsung?entitas=${kode_entitas}&param1=${DetailSPM4[index].fbm_kode_so}&param2=${DetailSPM4[index].fbm_id_so}`);
                        // const quTempDetail : any = tempppp.data.data[0]
                        const tempSJ4: any = {};
                        tempSJ4.id_sj = index + 1;
                        //                   showmessage('tempSJ4.kode_sj '+tempSJ4.kode_s );
                        tempSJ4.kode_do = 'oto'; //quDDOkode_d ;
                        tempSJ4.id_do = index + 1;
                        tempSJ4.kode_so = DetailSPM4[index].kode_so;
                        tempSJ4.id_so = DetailSPM4[index].id_so;

                        tempSJ4.kode_item = DetailSPM4[index].kode_item;
                        tempSJ4.diskripsi = DetailSPM4[index].nama_cetak;
                        tempSJ4.satuan = DetailSPM4[index].satuan;

                        tempSJ4.qty = DetailSPM4[index].qty;
                        tempSJ4.sat_std = DetailSPM4[index].sat_std;
                        tempSJ4.qty_std = DetailSPM4[index].qty_std;
                        tempSJ4.qty_sisa = DetailSPM4[index].qty_sisa;

                        tempSJ4.qty_retur = 0;
                        tempSJ4.kode_mu = DetailSPM4[index].kode_mu;
                        tempSJ4.kurs = DetailSPM4[index].kurs;
                        tempSJ4.kurs_pajak = DetailSPM4[index].kurs_pajak;
                        tempSJ4.harga_mu = DetailSPM4[index].harga_mu;
                        const response = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: DetailSPM4[index].kode_item,
                                param2: sjM4.tgl_sj, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: sjM4.kode_gudang,
                            },
                        });

                        const responseData = response.data.data;
                        let nilaiHpp = responseData.hpp;
                        tempSJ4.hpp = nilaiHpp;
                        tempSJ4.diskon = '';
                        tempSJ4.diskon_mu = 0;
                        tempSJ4.potongan_mu = 0;
                        tempSJ4.kode_pajak = DetailSPM4[index].kode_paja;
                        tempSJ4.pajak = 0;
                        tempSJ4.include = DetailSPM4[index].include;
                        tempSJ4.pajak_mu = 0;

                        tempSJ4.jumlah_mu = SpreadNumber(tempSJ4.harga_mu) * SpreadNumber(tempSJ4.qty);
                        tempSJ4.jumlah_rp = SpreadNumber(tempSJ4.jumlah_mu);

                        tempSJ4.kode_dept = DetailSPM4[index].kode_dept;
                        tempSJ4.kode_kerja = null;
                        tempSJ4.diskon_dok_mu = 0;
                        tempSJ4.kirim_mu = 0;

                        //                  if quMasterFBMEXPno_mb<>'' then
                        tempSJ4.no_mbref = JSON4.no_mb;
                        tempSJ4.no_kontrak = null;
                        tempSJ4.no_lpb = null;
                        tempSJ4.kode_pajak = null;

                        if (tempSJ4.kode_dept === '') tempSJ4.kode_dept = '';
                        if (tempSJ4.kode_kerja === '') tempSJ4.kode_kerja = '';

                        nNetto += SpreadNumber(tempSJ4.jumlah_rp);
                        nBerat += SpreadNumber(DetailSPM4[index].berat) * SpreadNumber(tempSJ4.qty);

                        DetailSJ4.push(tempSJ4);
                    }

                    sjM4.total_rp = nNetto;
                    sjM4.netto_rp = nNetto;
                    sjM4.total_berat = totalBerat4;

                    let TotalHPP = 0;

                    for (let i = 0; i < DetailSJ4.length; i++) {
                        TotalHPP += SpreadNumber(DetailSJ4[i].hpp) * SpreadNumber(DetailSJ4[i].qty_std);
                    }

                    const JSJD4: any = {};

                    const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            entitas: kode_entitas,
                        },
                    });
                    const responseSettingData = responseSetting.data.data[0];

                    JSJD4.kode_dokumen = sjM4.kode_s;
                    JSJD4.id_dokumen = 1;
                    JSJD4.dokumen = 'SJ';
                    JSJD4.tgl_dokumen = sjM4.tgl_sj; //dtTglMb.Date;//sjM4.tgl_sj;
                    JSJD4.kode_akun = responseSettingData.kode_akun_hpp;
                    JSJD4.kode_subledger = '';
                    JSJD4.kurs = 1;
                    JSJD4.debet_rp = TotalHPP;
                    JSJD4.kredit_rp = 0;
                    JSJD4.jumlah_rp = SpreadNumber(JSJD4.debet_rp);
                    JSJD4.jumlah_mu = SpreadNumber(JSJD4.debet_rp) / SpreadNumber(JSJD4.kurs);
                    JSJD4.catatan = '[AUTO-JU FROM MBDO1-MKL] Harga Pokok Surat Jalan No: ' + sjM4.no_s;
                    JSJD4.no_warkat = '';
                    JSJD4.tgl_valuta = sjM4.tgl_sj; //dtTglMb.Date;//sjM4.tgl_sj;
                    JSJD4.persen = 0;
                    JSJD4.kode_dept = '';
                    JSJD4.kode_kerja = '';
                    JSJD4.approval = 'N';
                    JSJD4.posting = 'N';
                    JSJD4.rekonsiliasi = 'N';
                    JSJD4.tgl_rekonsil = '';
                    JSJD4.userid = sjM4.userid;
                    JSJD4.tgl_update = JSON4.tgl_mb; //MbsjM4.tgl_update;
                    JSJD4.audit = '';
                    JSJD4.kode_kry = '';
                    JSJD4.kode_jual = sjM4.kode_jual;
                    JSJD4.no_kontrak_um = null;

                    const JSJK4: any = {};

                    JSJK4.kode_dokumen = 'oto';
                    JSJK4.id_dokumen = 2;
                    JSJK4.dokumen = 'SJ';
                    JSJK4.tgl_dokumen = sjM4.tgl_sj;
                    JSJK4.kode_akun = responseSettingData.kode_akun_persediaan;
                    JSJK4.kode_subledger = '';
                    JSJK4.kurs = 1;
                    JSJK4.debet_rp = 0;
                    JSJK4.kredit_rp = TotalHPP;
                    JSJK4.jumlah_rp = SpreadNumber(JSJK4.kredit_rp) * -1;
                    JSJK4.jumlah_mu = (SpreadNumber(JSJK4.kredit_rp) / SpreadNumber(JSJK4.kurs)) * -1;
                    JSJK4.catatan = '[AUTO-JU FROM MBDO1-MKL] Persediaan Surat Jalan No: ' + sjM4.no_sj;
                    JSJK4.no_warkat = '';
                    JSJK4.tgl_valuta = sjM4.tgl_sj; //dtTglMb.Date;//sjM4.tgl_sj;
                    JSJK4.persen = 0;
                    JSJK4.kode_dept = '';
                    JSJK4.kode_kerja = '';
                    JSJK4.approval = 'N';
                    JSJK4.posting = 'N';
                    JSJK4.rekonsiliasi = 'N';
                    JSJK4.tgl_rekonsil = '';
                    JSJK4.userid = sjM4.userid;
                    JSJK4.tgl_update = JSON4.tgl_mb; //sjM4.tgl_update;
                    JSJK4.audit = '';
                    JSJK4.kode_kry = '';
                    JSJK4.kode_jual = sjM4.kode_jual;
                    JSJK4.no_kontrak_um = null;

                    JSON4.SPM = {
                        ...spmM4,
                        detail: DetailSPM4,
                    };

                    JSON4.SJ = {
                        ...sjM4,
                        detail: DetailSJ4,
                        jurnal: [JSJD4, JSJK4],
                    };

                    //?Detail Jurnal
                    await generateNUDivisi(kode_entitas, noSPM4, kodeDevAll, '11', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                    await generateNUDivisi(kode_entitas, noSJ4, kodeDevAll, '12', moment().format('YYYYMM'), moment().format('YYMM') + kodeDevAll);
                }
                // ==============END LOLOS DO-3================

                const jsonMULTIPLE: any = {
                    entitas: kode_entitas,
                    pembatalan: 'N',
                    token: tokenRedis,
                    header: [],
                };

                if (dataBarang.nodes.length > 0) {
                    jsonMULTIPLE.header.push(JSON);
                }
                if (dataBarang2.nodes.length > 0) {
                    jsonMULTIPLE.header.push(JSON2);
                }
                if (dataBarang3.nodes.length > 0) {
                    jsonMULTIPLE.header.push(JSON3);
                }
                if (dataBarang4.nodes.length > 0) {
                    jsonMULTIPLE.header.push(JSON4);
                }
                console.log('JSONSIMPAN', JSON);
                console.log('MULTIPLE', jsonMULTIPLE);
                // =============================END OLD==================================================
                // =============START SAVING==================
                if (status_edit == true) {
                    var responseAPI = await axios.patch(`${apiUrl}/erp/update_mb`, jsonMULTIPLE);
                } else {
                    if (jenisDO !== 'KG') {
                        console.log('MASUK KG');
                    }
                    var responseAPI = await axios.post(`${apiUrl}/erp/simpan_mb`, jsonMULTIPLE);
                }
                if (responseAPI.data.status === true) {
                    //Counter cek berdasarkan data yang terisi
                    const DO1 = dataBarang.nodes.length;
                    const DO2 = dataBarang2.nodes.length;
                    const DO3 = dataBarang3.nodes.length;
                    const DO4 = dataBarang4.nodes.length;
                    const DOs = [DO1, DO2, DO3, DO4];
                    const NoMBs = [NoMB, NoMB2, NoMB3, NoMB4];
                    const totalNettoRPs = [totalNettoRP, totalNettoRP2, totalNettoRP2, totalNettoRP2];
                    if (status_edit !== true) {
                        for (let i = 0; i < DOs.length; i++) {
                            if (DOs[i] > 0) {
                                await generateNU(kode_entitas, NoMBs[i], '23', moment().format('YYYYMM'));
                            }
                        }
                    }
                    const kodeDokumen = responseAPI.data.data;
                    for (let i = 0; i < kodeDokumen.length; i++) {
                        console.log(kodeDokumen[i]);
                        //AUDIT buat menjadi sesuai jumlah header
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'MB',
                            kode_dokumen: status_edit == true ? kodeMB : kodeDokumen[i],
                            no_dokumen: NoMBs[i],
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: status_edit == true ? 'EDIT' : 'NEW',
                            diskripsi: `MB item = ${DOs[i]}  nilai transaksi ${totalNettoRPs[i].toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        const simpanCetakTTD = await axios.post(`${apiUrl}/erp/simpan_cetakttd`, {
                            entitas: kode_entitas,
                            kode_dokumen: kodeDokumen[i],
                            nip1: nipUser,
                            nip2: null,
                            nip3: null,
                            nip4: null,
                            nip5: null,
                            nip6: null,
                        });
                    }
                    withReactContent(swal)
                        .fire({
                            title: ``,
                            html:
                                status_edit == true
                                    ? '<p style="font-size:12px">Perubahan Data Mutasi Barang berhasil disimpan</p>'
                                    : '<p style="font-size:12px">Data Mutasi Barang berhasil disimpan</p>',
                            target: '#main-target',
                            icon: 'success',
                            width: '350px',
                            heightAuto: true,
                            showConfirmButton: false,
                            timer: 1500,
                        })
                        .then(() => {
                            onRefresh();
                            onClose();
                        });
                } else {
                    withReactContent(swal).fire({
                        title: ``,
                        html: status_edit == true ? '<p style="font-size:12px">Perubahan Data Mutasi Barang gagal disimpan</p>' : '<p style="font-size:12px">Data Mutasi Barang gagal disimpan</p>',
                        target: '#dialogMBList',
                        icon: 'error',
                        width: '350px',
                        heightAuto: true,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
                //=================END SAVING===============================
            }
        } catch (error) {
            withReactContent(swal).fire({
                title: ``,
                html: status_edit == true ? '<p style="font-size:12px">Perubahan Data Mutasi Barang gagal disimpan</p>' : '<p style="font-size:12px">Data Mutasi Barang gagal disimpan</p>',
                target: '#dialogMBList',
                icon: 'error',
                width: '350px',
                heightAuto: true,
                showConfirmButton: false,
                timer: 1500,
            });
            console.log('error mb', error);
        } finally {
            endProgress();
            setIsSaving(false); // Setelah proses penyimpanan selesai
        }
    };

    useEffect(() => {
        const dialogElement = document.getElementById('dialogMBList');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    return (
        <DialogComponent
            id="dialogMBList"
            isModal={true}
            width="95%"
            height="70%"
            visible={isOpen}
            close={() => {
                console.log('closeDialog');
                //hapus
                dialogClose();
                gridMBList!.dataSource.splice(0, gridMBList!.dataSource.length);
                gridMBList!.refresh();
            }}
            header={
                jenisDO === 'KG'
                    ? status_edit === false
                        ? 'DO Mobil Sendiri / Customer *Kirim Gudang'
                        : 'DO Mobil Sendiri / Customer *Kirim Gudang (EDIT)'
                    : status_edit === false
                    ? 'DO Mobil Sendiri / Customer *Kirim Langsung'
                    : 'DO Mobil Sendiri / Customer *Kirim Langsung (EDIT)'
            }
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            // target="#main-target"
            enableResize={true}
        >
            <div style={{ minWidth: '70%', overflow: 'auto' }}>
                <GlobalProgressBar />
                <div>
                    <div>
                        {/* ===============  HEADER ATAS ========================   */}
                        <div className="mb-1" style={{ padding: 10, marginTop: -5 }}>
                            <div className="panel-tabel" style={{ width: jenisDO === 'KG' ? '70%' : '88%' }}>
                                <table className={styles.table} style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Tanggal</th>
                                            <th style={{ width: '10%' }}>Tgl Pengambilan</th>
                                            <th style={{ width: '13%' }}>No. MB</th>
                                            <th style={{ width: '13%' }}>Jenis Kirim</th>
                                            <th style={{ width: '18%' }}>Gudang Tujuan</th>
                                            {jenisDO === 'KL' ? (
                                                <>
                                                    <th style={{ width: '15%' }}>No. SO Kirim Langsung</th>
                                                    <th style={{ width: '13%' }}>Pengemudi</th>
                                                </>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <DatePickerComponent
                                                    style={{ fontSize: '12px', height: '10px', textAlign: 'center' }}
                                                    locale="id"
                                                    cssClass="e-custom-style"
                                                    placeholder="Tgl. PP"
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={status_edit ? tglMB : new Date()} // Menggunakan objek Date untuk menetapkan nilai awal
                                                    readOnly
                                                    disabled
                                                >
                                                    {/* <Inject services={[MaskedDateTime]} /> */}
                                                </DatePickerComponent>
                                            </td>
                                            <td>
                                                <DatePickerComponent
                                                    style={{ fontSize: '12px', height: '10px', textAlign: 'center' }}
                                                    locale="id"
                                                    cssClass="e-custom-style"
                                                    placeholder="Tgl. PP"
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={tglValuta} // Menggunakan objek Date untuk menetapkan nilai awal
                                                    onChange={(e: any) => setTgl_Valuta(moment(e.value).format('YYYY-MM-DD HH:mm:ss'))}
                                                    // readOnly
                                                    allowEdit={false}
                                                >
                                                    {/* <Inject services={[MaskedDateTime]} /> */}
                                                </DatePickerComponent>
                                            </td>
                                            <td>
                                                <div className="container">
                                                    <TextBoxComponent style={{ fontSize: '12px', textAlign: 'center' }} placeholder="No. MB" value={NoMB} readonly />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex">
                                                    <DropDownListComponent
                                                        style={{ fontSize: '12px' }}
                                                        id="jenisKirim"
                                                        className="form-select"
                                                        dataSource={[jenisDO === 'KG' ? { value: 'KG', nama_jenis_kirim: 'Kirim Gudang' } : { value: 'KL', nama_jenis_kirim: 'Kirim Langsung' }]}
                                                        fields={{ value: 'nama_jenis_kirim' }}
                                                        value={selectedJenisKirim.nama_jenis_kirim}
                                                        // placeholder={status_edit == true ? selectedGudang.nama_gudang : '-- Silahkan pilih jenis kirim --'}
                                                        select={(e) => {
                                                            console.log(e.itemData.value);
                                                            setJenisKirim({ kode_jenis_kirim: e.itemData.value, nama_jenis_kirim: e.itemData.nama_jenis_kirim });
                                                            handleDetail_EndEdit();
                                                        }}
                                                        readonly={status_edit == true ? true : false}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex">
                                                    <DropDownListComponent
                                                        style={{ fontSize: '12px' }}
                                                        id="gudang"
                                                        className="form-select"
                                                        dataSource={listGudang.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                        fields={{ value: 'value' }}
                                                        value={selectedGudangTujuan.nama_gudang}
                                                        placeholder={status_edit == true ? selectedGudangTujuan.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                        select={(e) => {
                                                            console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            setSelectedGudangTujuan({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            handleDetail_EndEdit();
                                                        }}
                                                        readonly={status_edit == true ? true : false}
                                                    />
                                                </div>
                                            </td>
                                            {jenisDO === 'KL' ? (
                                                <>
                                                    <td>
                                                        <div style={{ position: 'relative' }}>
                                                            <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedNoSO} readOnly={true} />
                                                            <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                                <FontAwesomeIcon
                                                                    icon={faMagnifyingGlass}
                                                                    className="ml-2"
                                                                    width="15"
                                                                    height="15"
                                                                    onClick={() => {
                                                                        if (status_edit !== true) {
                                                                            setModalListSO(true);
                                                                        }
                                                                    }}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex">
                                                            <DropDownListComponent
                                                                style={{ fontSize: '12px' }}
                                                                id="gudang"
                                                                className="form-select"
                                                                dataSource={listPengemudi.map((data: any) => ({ value: data.pengemudi }))}
                                                                fields={{ value: 'value' }}
                                                                value={selectedPengemudi}
                                                                placeholder={status_edit == true ? selectedPengemudi : '-- Silahkan pilih pengemudi --'}
                                                                select={(e) => {
                                                                    setSelectedPengemudi(e.itemData.value);
                                                                }}
                                                                readonly={status_edit == true ? true : false}
                                                            />
                                                        </div>
                                                    </td>
                                                </>
                                            ) : null}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* FULL BODY */}
                        <div className="panel-tab" style={{ background: '#f0f0f0', width: '100%', height: '420px', marginTop: -5, borderRadius: 10 }}>
                            <div>
                                {/* =============== SUPER TAB ========================   */}
                                <div className="e-tab-header" style={{ display: 'flex', marginBottom: 0, marginTop: -20, padding: 10 }}>
                                    {/* DO-1 */}
                                    <div
                                        tabIndex={0}
                                        onClick={() => setSelectedHead('DO-1')}
                                        style={{
                                            marginTop: 10,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            borderBottom: selectedHead === 'DO-1' ? '2px solid grey' : '2px solid transparent',
                                        }}
                                    >
                                        DO-1
                                    </div>
                                    {/* DO-2 */}
                                    <div
                                        tabIndex={1}
                                        onClick={() => setSelectedHead('DO-2')}
                                        style={{
                                            marginTop: 10,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            borderBottom: selectedHead === 'DO-2' ? '2px solid grey' : '3px solid transparent',
                                        }}
                                    >
                                        DO-2
                                    </div>
                                    {/* DO-3 */}
                                    <div
                                        tabIndex={2}
                                        onClick={() => setSelectedHead('DO-3')}
                                        style={{
                                            marginTop: 10,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            borderBottom: selectedHead === 'DO-3' ? '2px solid grey' : '3px solid transparent',
                                        }}
                                    >
                                        DO-3
                                    </div>
                                    {/* DO-4 */}
                                    <div
                                        tabIndex={3}
                                        onClick={() => setSelectedHead('DO-4')}
                                        style={{
                                            marginTop: 10,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '10px 20px',
                                            cursor: 'pointer',
                                            borderBottom: selectedHead === 'DO-4' ? '2px solid grey' : '3px solid transparent',
                                        }}
                                    >
                                        DO-4
                                    </div>
                                </div>
                                {/* =============== END SUPER TAB ========================   */}
                                {/* HEAD 1 DO-1 */}
                                {selectedHead === 'DO-1' && (
                                    <TabComponent
                                        // ref={(t) => (tabTtbList = t)}
                                        selectedItem={0}
                                        animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                        height="100%"
                                    >
                                        <div className="e-tab-header" style={{ display: 'flex', marginTop: -15 }}>
                                            <div
                                                onClick={() => setSelectedTab('Barang')}
                                                tabIndex={0}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Data Barang
                                            </div>
                                            <div
                                                onClick={() => setSelectedTab('Jurnal')}
                                                tabIndex={1}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Jurnal
                                            </div>
                                        </div>

                                        {/*===================== Content menampilkan data barang =======================*/}
                                        <div className="e-content">
                                            {/* //DATA BARANG */}
                                            <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                {/* //ASD */}
                                                {/* <div style={{ float: 'right', marginTop: -110, fontWeight: 'bold' }}>{NoMB}</div> */}
                                                <table className={styles.table} style={{ width: '60%', float: 'right', marginTop: -68, backgroundColor: 'white', borderRadius: 6 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '20%' }}>Gudang Asal</th>
                                                            <th style={{ width: '25%' }}>Dari Supplier</th>
                                                            <th style={{ width: '15%' }}>Barang Kontrak</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="gudangAsal1"
                                                                        className="form-select"
                                                                        dataSource={listGudangPabrik.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                                        fields={{ value: 'value' }}
                                                                        value={selectedGudang.nama_gudang}
                                                                        placeholder={'-- Silahkan pilih gudang asal --'}
                                                                        select={(e) => {
                                                                            if (selectedHead === 'DO-1' && gridMBList!.dataSource.length > 0) {
                                                                                DetailBarangDeleteAll('tanpakonfirmasi');
                                                                            } else {
                                                                                console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                setSelectedGudang({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                handleDetail_EndEdit();
                                                                                gridMBList!.refresh();
                                                                            }
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedSupplier.nama_relasi} readOnly={true} />
                                                                    <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                            className="ml-2"
                                                                            width="15"
                                                                            height="15"
                                                                            onClick={() => {
                                                                                if (status_edit !== true) {
                                                                                    setModalSupplierRow(true);
                                                                                    setModalFor('DO1');
                                                                                }
                                                                            }}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="barangkontrak"
                                                                        className="form-select"
                                                                        dataSource={[{ value: 'Kontrak' }, { value: 'Non Kontrak' }]}
                                                                        fields={{ value: 'value' }}
                                                                        value={kontrakValue}
                                                                        // placeholder={status_edit == true ? selectedGudang2.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                                        select={(e) => {
                                                                            console.log(e.itemData.value);
                                                                            setBarangKontrak(e.itemData.value);
                                                                            gridMBList!.dataSource.splice(0, gridMBList!.dataSource.length);
                                                                            handleDetail_EndEdit();
                                                                            gridMBList!.refresh();
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <TooltipComponent
                                                    // ref={(t) => (tooltipDetailBarang = t)}
                                                    // beforeRender={beforeRenderDetailBarang}
                                                    openDelay={1000}
                                                    target=".e-headertext"
                                                >
                                                    <GridComponent
                                                        id="gridMBList"
                                                        name="gridMBList"
                                                        className="gridMBList"
                                                        locale="id"
                                                        ref={(g) => (gridMBList = g)}
                                                        dataSource={dataBarang.nodes}
                                                        editSettings={{
                                                            allowAdding: status_edit == true ? false : true,
                                                            allowEditing: status_edit == true ? false : true,
                                                            // allowDeleting: status_edit == true ? false : true,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailBarang}
                                                        actionComplete={actionCompleteDetailBarang}
                                                        rowSelecting={rowSelectingDetailBarang}
                                                        created={() => {}}
                                                        allowKeyboard={false}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective field="id_std" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="170"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="350"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                            <ColumnDirective
                                                                field="satuan"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Satuan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="qty"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kuantitas"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="berat"
                                                                format="N2"
                                                                headerText="Berat (Kg)"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="berat_toleransi"
                                                                format="N2"
                                                                headerText="Berat Toleransi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                                // editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll2">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buAdd1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-primary e-small"
                                                                                        iconCss="e-icons e-small e-plus"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                        onClick={() => {
                                                                                            handleDetail_Add('new');
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDelete1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-warning e-small"
                                                                                        iconCss="e-icons e-small e-trash"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDelete();
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAll('confirm');
                                                                                            console.log('diklkik');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ float: 'right', marginTop: -25 }}>
                                                                                <b>Total Berat : {frmNumber(totalBerat.toFixed(2))}</b>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', minHeight: 60, marginTop: 5 }}>
                                                            <textarea value={keterangan} className="h-full w-full text-xs" onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* //JURNAL */}
                                            <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                <ButtonComponent
                                                    id="autojurnal"
                                                    content="AutoJurnal"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-refresh"
                                                    disabled={status_edit == true ? true : false}
                                                    style={{ float: 'right', width: '110px', marginTop: -40, marginRight: 2, backgroundColor: status_edit == true ? '#dedede' : '#3b3f5c' }}
                                                    onClick={() => {
                                                        autoJurnal();
                                                    }}
                                                />
                                                <TooltipComponent
                                                    // ref={(t) => (tooltipDetailBarang = t)}
                                                    // beforeRender={beforeRenderDetailBarang}
                                                    openDelay={1000}
                                                    target=".e-headertext"
                                                >
                                                    <GridComponent
                                                        id="gridJURNALList"
                                                        name="gridJURNALList"
                                                        className="gridJURNALList"
                                                        locale="id"
                                                        ref={(j) => (gridJURNALList = j)} // UBAH SESUAI JURNAL
                                                        dataSource={dataJurnal.nodes}
                                                        // editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }}
                                                        editSettings={{
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: false,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailJurnal}
                                                        actionComplete={actionCompleteDetailJurnal}
                                                        // rowSelecting={rowSelectingDetailBarang}
                                                        created={() => {}}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                field="id_dokumen"
                                                                type="number"
                                                                isPrimaryKey={true}
                                                                headerText="ID"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="30"
                                                            />
                                                            <ColumnDirective
                                                                field="no_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="debet_rp"
                                                                // editTemplate={editTemplateDebit}
                                                                format="N2"
                                                                headerText="Debet"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="kredit_rp"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kredit"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="catatan"
                                                                headerText="Keterangan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="referensi"
                                                                headerText="Subsidiary Ledger"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateSubLedger}
                                                            />
                                                            <ColumnDirective
                                                                field="departemen"
                                                                headerText="Departemen"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateDepartemen}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd2">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit2">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete2">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {/* {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAllJurnal();
                                                                                            console.log('diklkik jurnal');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )} */}
                                                                            <div style={{ float: 'right' }}>
                                                                                <table>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Total Db/Kr :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit)}</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalKredit)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Selisih :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit - totalKredit)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div style={{ marginTop: 40 }}>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabComponent>
                                )}
                                {/* HEAD 2 DO-2 */}
                                {selectedHead === 'DO-2' && (
                                    <TabComponent
                                        // ref={(t) => (tabTtbList = t)}
                                        selectedItem={0}
                                        animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                        height="100%"
                                    >
                                        <div className="e-tab-header" style={{ display: 'flex', marginTop: -15 }}>
                                            <div
                                                onClick={() => setSelectedTab('Barang')}
                                                tabIndex={0}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Data Barang
                                            </div>
                                            <div
                                                onClick={() => setSelectedTab('Jurnal')}
                                                tabIndex={1}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Jurnal
                                            </div>
                                        </div>

                                        {/*===================== Content menampilkan data barang =======================*/}
                                        <div className="e-content">
                                            {/* //DATA BARANG */}
                                            <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                {/* //ASD */}
                                                <div style={{ float: 'right', marginTop: -110, fontWeight: 'bold' }}>{NoMB2}</div>
                                                <table className={styles.table} style={{ width: '60%', float: 'right', marginTop: -68, backgroundColor: 'white', borderRadius: 6 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '20%' }}>Gudang Asal</th>
                                                            <th style={{ width: '25%' }}>Dari Supplier</th>
                                                            <th style={{ width: '15%' }}>Barang Kontrak</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="gudangAsal2"
                                                                        className="form-select"
                                                                        dataSource={listGudangPabrik.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                                        fields={{ value: 'value' }}
                                                                        value={selectedGudang2.nama_gudang}
                                                                        placeholder={'-- Silahkan pilih gudang asal --'}
                                                                        select={(e) => {
                                                                            if (selectedHead === 'DO-2' && gridMBList2.dataSource.length > 0) {
                                                                                DetailBarangDeleteAll('tanpakonfirmasi');
                                                                            } else {
                                                                                console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                setSelectedGudang2({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                handleDetail_EndEdit();
                                                                                gridMBList2.refresh();
                                                                            }
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedSupplier2.nama_relasi} readOnly={true} />
                                                                    <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                            className="ml-2"
                                                                            width="15"
                                                                            height="15"
                                                                            onClick={() => {
                                                                                if (status_edit !== true) {
                                                                                    setModalSupplierRow(true);
                                                                                    setModalFor('DO2');
                                                                                }
                                                                            }}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="barangkontrak2"
                                                                        className="form-select"
                                                                        dataSource={[{ value: 'Kontrak' }, { value: 'Non Kontrak' }]}
                                                                        fields={{ value: 'value' }}
                                                                        value={kontrakValue2}
                                                                        // placeholder={status_edit == true ? selectedGudang2.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                                        select={(e) => {
                                                                            console.log(e.itemData.value);
                                                                            setBarangKontrak2(e.itemData.value);
                                                                            gridMBList2.dataSource.splice(0, gridMBList2.dataSource.length);
                                                                            handleDetail_EndEdit();
                                                                            gridMBList2.refresh();
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <TooltipComponent openDelay={1000} target=".e-headertext">
                                                    <GridComponent
                                                        id="gridMBList2"
                                                        name="gridMBList2"
                                                        className="gridMBList2"
                                                        locale="id"
                                                        ref={(g) => (gridMBList2 = g)}
                                                        dataSource={dataBarang2.nodes}
                                                        editSettings={{
                                                            allowAdding: status_edit == true ? false : true,
                                                            allowEditing: status_edit == true ? false : true,
                                                            allowDeleting: status_edit == true ? false : true,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailBarang}
                                                        actionComplete={actionCompleteDetailBarang}
                                                        rowSelecting={rowSelectingDetailBarang}
                                                        created={() => {}}
                                                        allowKeyboard={false}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective field="id_std" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="170"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="350"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                            <ColumnDirective
                                                                field="satuan"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Satuan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="qty"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kuantitas"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="berat"
                                                                format="N2"
                                                                headerText="Berat (Kg)"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="berat_toleransi"
                                                                format="N2"
                                                                headerText="Berat Toleransi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll2">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buAdd12"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-primary e-small"
                                                                                        iconCss="e-icons e-small e-plus"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                        onClick={() => {
                                                                                            handleDetail_Add('new');
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDelete1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-warning e-small"
                                                                                        iconCss="e-icons e-small e-trash"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDelete();
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAll('confirm');
                                                                                            console.log('diklkik');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ float: 'right', marginTop: -25 }}>
                                                                                <b>Total Berat : {frmNumber(totalBerat2.toFixed(2))}</b>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* //JURNAL */}
                                            <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                <ButtonComponent
                                                    id="autojurnal"
                                                    content="AutoJurnal"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-refresh"
                                                    disabled={status_edit == true ? true : false}
                                                    style={{ float: 'right', width: '110px', marginTop: -40, marginRight: 2, backgroundColor: status_edit == true ? '#dedede' : '#3b3f5c' }}
                                                    onClick={() => {
                                                        autoJurnal();
                                                    }}
                                                />
                                                <TooltipComponent
                                                    // ref={(t) => (tooltipDetailBarang = t)}
                                                    // beforeRender={beforeRenderDetailBarang}
                                                    openDelay={1000}
                                                    target=".e-headertext"
                                                >
                                                    <GridComponent
                                                        id="gridJURNALList2"
                                                        name="gridJURNALList2"
                                                        className="gridJURNALList2"
                                                        locale="id"
                                                        ref={(j) => (gridJURNALList2 = j)} // UBAH SESUAI JURNAL
                                                        dataSource={dataJurnal2.nodes}
                                                        editSettings={{
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: false,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailJurnal}
                                                        actionComplete={actionCompleteDetailJurnal}
                                                        created={() => {}}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                field="id_dokumen"
                                                                type="number"
                                                                isPrimaryKey={true}
                                                                headerText="ID"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="30"
                                                            />
                                                            <ColumnDirective
                                                                field="no_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="debet_rp"
                                                                // editTemplate={editTemplateDebit}
                                                                format="N2"
                                                                headerText="Debet"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="kredit_rp"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kredit"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="catatan"
                                                                headerText="Keterangan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="referensi"
                                                                headerText="Subsidiary Ledger"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateSubLedger}
                                                            />
                                                            <ColumnDirective
                                                                field="departemen"
                                                                headerText="Departemen"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateDepartemen}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd2">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit2">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete2">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {/* {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAllJurnal();
                                                                                            console.log('diklkik jurnal');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )} */}
                                                                            <div style={{ float: 'right' }}>
                                                                                <table>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Total Db/Kr :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit2)}</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalKredit2)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Selisih :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit2 - totalKredit2)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div style={{ marginTop: 40 }}>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabComponent>
                                )}
                                {/* HEAD 3 DO-3 */}
                                {selectedHead === 'DO-3' && (
                                    <TabComponent
                                        // ref={(t) => (tabTtbList = t)}
                                        selectedItem={0}
                                        animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                        height="100%"
                                    >
                                        <div className="e-tab-header" style={{ display: 'flex', marginTop: -15 }}>
                                            <div
                                                onClick={() => setSelectedTab('Barang')}
                                                tabIndex={0}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Data Barang
                                            </div>
                                            <div
                                                onClick={() => setSelectedTab('Jurnal')}
                                                tabIndex={1}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Jurnal
                                            </div>
                                        </div>

                                        {/*===================== Content menampilkan data barang =======================*/}
                                        <div className="e-content">
                                            {/* //DATA BARANG */}
                                            <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                {/* //ASD */}
                                                <div style={{ float: 'right', marginTop: -110, fontWeight: 'bold' }}>{NoMB3}</div>
                                                <table className={styles.table} style={{ width: '60%', float: 'right', marginTop: -68, backgroundColor: 'white', borderRadius: 6 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '20%' }}>Gudang Asal</th>
                                                            <th style={{ width: '25%' }}>Dari Supplier</th>
                                                            <th style={{ width: '15%' }}>Barang Kontrak</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="gudangAsal3"
                                                                        className="form-select"
                                                                        dataSource={listGudangPabrik.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                                        fields={{ value: 'value' }}
                                                                        value={selectedGudang3.nama_gudang}
                                                                        placeholder={'-- Silahkan pilih gudang asal --'}
                                                                        select={(e) => {
                                                                            if (selectedHead === 'DO-3' && gridMBList3.dataSource.length > 0) {
                                                                                DetailBarangDeleteAll('tanpakonfirmasi');
                                                                            } else {
                                                                                console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                setSelectedGudang3({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                handleDetail_EndEdit();
                                                                                gridMBList3.refresh();
                                                                            }
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedSupplier3.nama_relasi} readOnly={true} />
                                                                    <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                            className="ml-2"
                                                                            width="15"
                                                                            height="15"
                                                                            onClick={() => {
                                                                                if (status_edit !== true) {
                                                                                    setModalSupplierRow(true);
                                                                                    setModalFor('DO3');
                                                                                }
                                                                            }}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="barangkontrak3"
                                                                        className="form-select"
                                                                        dataSource={[{ value: 'Kontrak' }, { value: 'Non Kontrak' }]}
                                                                        fields={{ value: 'value' }}
                                                                        value={kontrakValue3}
                                                                        // placeholder={status_edit == true ? selectedGudang2.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                                        select={(e) => {
                                                                            console.log(e.itemData.value);
                                                                            setBarangKontrak3(e.itemData.value);
                                                                            gridMBList3.dataSource.splice(0, gridMBList3.dataSource.length);
                                                                            handleDetail_EndEdit();
                                                                            gridMBList3.refresh();
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <TooltipComponent openDelay={1000} target=".e-headertext">
                                                    <GridComponent
                                                        id="gridMBList3"
                                                        name="gridMBList3"
                                                        className="gridMBList3"
                                                        locale="id"
                                                        ref={(g) => (gridMBList3 = g)}
                                                        dataSource={dataBarang3.nodes}
                                                        editSettings={{
                                                            allowAdding: status_edit == true ? false : true,
                                                            allowEditing: status_edit == true ? false : true,
                                                            allowDeleting: status_edit == true ? false : true,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailBarang}
                                                        actionComplete={actionCompleteDetailBarang}
                                                        rowSelecting={rowSelectingDetailBarang}
                                                        created={() => {}}
                                                        allowKeyboard={false}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective field="id_std" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="170"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="350"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                            <ColumnDirective
                                                                field="satuan"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Satuan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="qty"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kuantitas"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="berat"
                                                                format="N2"
                                                                headerText="Berat (Kg)"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="berat_toleransi"
                                                                format="N2"
                                                                headerText="Berat Toleransi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll2">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buAdd13"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-primary e-small"
                                                                                        iconCss="e-icons e-small e-plus"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                        onClick={() => {
                                                                                            handleDetail_Add('new');
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDelete1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-warning e-small"
                                                                                        iconCss="e-icons e-small e-trash"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDelete();
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAll('confirm');
                                                                                            console.log('diklkik');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ float: 'right', marginTop: -25 }}>
                                                                                <b>Total Berat : {frmNumber(totalBerat3.toFixed(2))}</b>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* //JURNAL */}
                                            <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                <ButtonComponent
                                                    id="autojurnal"
                                                    content="AutoJurnal"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-refresh"
                                                    disabled={status_edit == true ? true : false}
                                                    style={{ float: 'right', width: '110px', marginTop: -40, marginRight: 2, backgroundColor: status_edit == true ? '#dedede' : '#3b3f5c' }}
                                                    onClick={() => {
                                                        autoJurnal();
                                                    }}
                                                />
                                                <TooltipComponent
                                                    // ref={(t) => (tooltipDetailBarang = t)}
                                                    // beforeRender={beforeRenderDetailBarang}
                                                    openDelay={1000}
                                                    target=".e-headertext"
                                                >
                                                    <GridComponent
                                                        id="gridJURNALList3"
                                                        name="gridJURNALList3"
                                                        className="gridJURNALList3"
                                                        locale="id"
                                                        ref={(j) => (gridJURNALList3 = j)} // UBAH SESUAI JURNAL
                                                        dataSource={dataJurnal3.nodes}
                                                        editSettings={{
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: false,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailJurnal}
                                                        actionComplete={actionCompleteDetailJurnal}
                                                        created={() => {}}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                field="id_dokumen"
                                                                type="number"
                                                                isPrimaryKey={true}
                                                                headerText="ID"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="30"
                                                            />
                                                            <ColumnDirective
                                                                field="no_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="debet_rp"
                                                                // editTemplate={editTemplateDebit}
                                                                format="N2"
                                                                headerText="Debet"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="kredit_rp"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kredit"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="catatan"
                                                                headerText="Keterangan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="referensi"
                                                                headerText="Subsidiary Ledger"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateSubLedger}
                                                            />
                                                            <ColumnDirective
                                                                field="departemen"
                                                                headerText="Departemen"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateDepartemen}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd2">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit2">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete2">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {/* {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAllJurnal();
                                                                                            console.log('diklkik jurnal');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )} */}
                                                                            <div style={{ float: 'right' }}>
                                                                                <table>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Total Db/Kr :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit3)}</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalKredit3)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Selisih :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit3 - totalKredit3)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div style={{ marginTop: 40 }}>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabComponent>
                                )}
                                {/* HEAD 4 DO-4 */}
                                {selectedHead === 'DO-4' && (
                                    <TabComponent
                                        // ref={(t) => (tabTtbList = t)}
                                        selectedItem={0}
                                        animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                        height="100%"
                                    >
                                        <div className="e-tab-header" style={{ display: 'flex', marginTop: -15 }}>
                                            <div
                                                onClick={() => setSelectedTab('Barang')}
                                                tabIndex={0}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Data Barang
                                            </div>
                                            <div
                                                onClick={() => setSelectedTab('Jurnal')}
                                                tabIndex={1}
                                                style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                            >
                                                Jurnal
                                            </div>
                                        </div>

                                        {/*===================== Content menampilkan data barang =======================*/}
                                        <div className="e-content">
                                            {/* //DATA BARANG */}
                                            <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                {/* //ASD */}
                                                <div style={{ float: 'right', marginTop: -110, fontWeight: 'bold' }}>{NoMB4}</div>
                                                <table className={styles.table} style={{ width: '60%', float: 'right', marginTop: -68, backgroundColor: 'white', borderRadius: 6 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '20%' }}>Gudang Asal</th>
                                                            <th style={{ width: '25%' }}>Dari Supplier</th>
                                                            <th style={{ width: '15%' }}>Barang Kontrak</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="gudangAsal4"
                                                                        className="form-select"
                                                                        dataSource={listGudangPabrik.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                                        fields={{ value: 'value' }}
                                                                        value={selectedGudang4.nama_gudang}
                                                                        placeholder={'-- Silahkan pilih gudang asal --'}
                                                                        select={(e) => {
                                                                            if (selectedHead === 'DO-4' && gridMBList4.dataSource.length > 0) {
                                                                                DetailBarangDeleteAll('tanpakonfirmasi');
                                                                            } else {
                                                                                console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                setSelectedGudang4({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                handleDetail_EndEdit();
                                                                                gridMBList4.refresh();
                                                                            }
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedSupplier4.nama_relasi} readOnly={true} />
                                                                    <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                                        <FontAwesomeIcon
                                                                            icon={faMagnifyingGlass}
                                                                            className="ml-2"
                                                                            width="15"
                                                                            height="15"
                                                                            onClick={() => {
                                                                                if (status_edit !== true) {
                                                                                    setModalSupplierRow(true);
                                                                                    setModalFor('DO4');
                                                                                }
                                                                            }}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex">
                                                                    <DropDownListComponent
                                                                        style={{ fontSize: '12px' }}
                                                                        id="barangkontrak3"
                                                                        className="form-select"
                                                                        dataSource={[{ value: 'Kontrak' }, { value: 'Non Kontrak' }]}
                                                                        fields={{ value: 'value' }}
                                                                        value={kontrakValue4}
                                                                        // placeholder={status_edit == true ? selectedGudang2.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                                        select={(e) => {
                                                                            console.log(e.itemData.value);
                                                                            setBarangKontrak4(e.itemData.value);
                                                                            gridMBList4.dataSource.splice(0, gridMBList4.dataSource.length);
                                                                            handleDetail_EndEdit();
                                                                            gridMBList4.refresh();
                                                                        }}
                                                                        readonly={status_edit == true ? true : false}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <TooltipComponent openDelay={1000} target=".e-headertext">
                                                    <GridComponent
                                                        id="gridMBList4"
                                                        name="gridMBList4"
                                                        className="gridMBList4"
                                                        locale="id"
                                                        ref={(g) => (gridMBList4 = g)}
                                                        dataSource={dataBarang4.nodes}
                                                        editSettings={{
                                                            allowAdding: status_edit == true ? false : true,
                                                            allowEditing: status_edit == true ? false : true,
                                                            allowDeleting: status_edit == true ? false : true,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailBarang}
                                                        actionComplete={actionCompleteDetailBarang}
                                                        rowSelecting={rowSelectingDetailBarang}
                                                        created={() => {}}
                                                        allowKeyboard={false}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective field="id_std" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="170"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="350"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                            <ColumnDirective
                                                                field="satuan"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Satuan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="qty"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kuantitas"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="berat"
                                                                format="N2"
                                                                headerText="Berat (Kg)"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="berat_toleransi"
                                                                format="N2"
                                                                headerText="Berat Toleransi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // editTemplate={editTemplateMasterItem_Nama}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll2">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buAdd14"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-primary e-small"
                                                                                        iconCss="e-icons e-small e-plus"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                        onClick={() => {
                                                                                            handleDetail_Add('new');
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDelete1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-warning e-small"
                                                                                        iconCss="e-icons e-small e-trash"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDelete();
                                                                                        }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAll('confirm');
                                                                                            console.log('diklkik');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ float: 'right', marginTop: -25 }}>
                                                                                <b>Total Berat : {frmNumber(totalBerat4.toFixed(2))}</b>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* //JURNAL */}
                                            <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                <ButtonComponent
                                                    id="autojurnal"
                                                    content="AutoJurnal"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-refresh"
                                                    disabled={status_edit == true ? true : false}
                                                    style={{ float: 'right', width: '110px', marginTop: -40, marginRight: 2, backgroundColor: status_edit == true ? '#dedede' : '#3b3f5c' }}
                                                    onClick={() => {
                                                        autoJurnal();
                                                    }}
                                                />
                                                <TooltipComponent
                                                    // ref={(t) => (tooltipDetailBarang = t)}
                                                    // beforeRender={beforeRenderDetailBarang}
                                                    openDelay={1000}
                                                    target=".e-headertext"
                                                >
                                                    <GridComponent
                                                        id="gridJURNALList4"
                                                        name="gridJURNALList4"
                                                        className="gridJURNALList4"
                                                        locale="id"
                                                        ref={(j) => (gridJURNALList4 = j)} // UBAH SESUAI JURNAL
                                                        dataSource={dataJurnal4.nodes}
                                                        editSettings={{
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: false,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        height={170} //170 barang jadi 150 barang produksi
                                                        gridLines={'Both'}
                                                        actionBegin={actionBeginDetailJurnal}
                                                        actionComplete={actionCompleteDetailJurnal}
                                                        created={() => {}}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                field="id_dokumen"
                                                                type="number"
                                                                isPrimaryKey={true}
                                                                headerText="ID"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="30"
                                                            />
                                                            <ColumnDirective
                                                                field="no_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_akun"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Akun"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_Nama_Akun}
                                                            />
                                                            <ColumnDirective
                                                                field="debet_rp"
                                                                // editTemplate={editTemplateDebit}
                                                                format="N2"
                                                                headerText="Debet"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="kredit_rp"
                                                                format="N2"
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Kredit"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="120"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                            <ColumnDirective
                                                                field="catatan"
                                                                headerText="Keterangan"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="235"
                                                                clipMode="EllipsisWithTooltip"
                                                                // allowEditing={false}
                                                            />
                                                            <ColumnDirective
                                                                field="referensi"
                                                                headerText="Subsidiary Ledger"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateSubLedger}
                                                            />
                                                            <ColumnDirective
                                                                field="departemen"
                                                                headerText="Departemen"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="150"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateDepartemen}
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                    </GridComponent>
                                                </TooltipComponent>
                                                <div style={{ padding: 5 }} className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd2">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit2">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete2">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            {/* {status_edit == true ? (
                                                                                <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                            ) : (
                                                                                <div className="mt-1 flex">
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll2"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                        onClick={() => {
                                                                                            DetailBarangDeleteAllJurnal();
                                                                                            console.log('diklkik jurnal');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )} */}
                                                                            <div style={{ float: 'right' }}>
                                                                                <table>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Total Db/Kr :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit4)}</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalKredit4)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                                <b>Selisih :</b>
                                                                                            </td>
                                                                                            <td style={{ fontSize: 11 }}>
                                                                                                <b>{frmNumber(totalDebit4 - totalKredit4)}</b>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div style={{ marginTop: 40 }}>
                                                        <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                            <b>Keterangan :</b>
                                                        </p>
                                                        <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                            <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabComponent>
                                )}
                            </div>
                        </div>

                        {/* =============== HEADER FOOTER ========================   */}
                        {/* Data refensi untuk pengambilan barang ke Supplier */}
                        <div style={{ marginTop: 0, padding: 10 }} className="mb-1">
                            <div className="panel-tabel" style={{ width: '100%' }}>
                                <table className={styles.table} style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%', fontWeight: `bold`, color: `black` }}>No. Referensi</th>
                                            <th style={{ width: '15%', fontWeight: `bold`, color: `black` }}>Via</th>
                                            <th style={{ width: '8%', fontWeight: `bold`, color: `black` }}>No. Kendaraan</th>
                                            <th style={{ width: '12%', fontWeight: `bold`, color: `black` }}>Jenis Mobil</th>
                                            <th style={{ width: '55%', fontWeight: `bold`, color: `black` }}>Alamat Pengiriman Barang</th>
                                        </tr>
                                    </thead>
                                    <tr>
                                        {/* no reff */}
                                        <td style={{ border: '1px solid grey' }}>
                                            <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={noReff} onChange={(e) => setNoReff(e.target.value)} />
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                        </td>
                                        {/* via (Eksepedisi) */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey' }}>
                                            {/* <input style={{ height: 30, width: '100%' }} type="text" /> */}
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                            <div className="flex">
                                                <DropDownListComponent
                                                    style={{ fontSize: '12px' }}
                                                    id="gudangAsal"
                                                    className="form-select"
                                                    // dataSource={listVia.map((data: any) => data.via)}
                                                    // dataSource={listVia.map((data: any) => ({ value: data.via }))}
                                                    dataSource={[{ value: 'ARMADA CUSTOMER' }, { value: 'ARMADA KENCANA' }, { value: 'ARMADA PABRIK' }]}
                                                    fields={{ value: 'value' }}
                                                    value={Via}
                                                    placeholder={status_edit == true ? Via : '-- Silahkan pilih --'}
                                                    select={(e) => {
                                                        console.log(e.itemData.value);
                                                        setSelectedVia(e.itemData.value);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        {/* no kendaraan */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey', color: 'black' }}>
                                            <input style={{ height: 10, width: '100%' }} type="text" value={noKendaraan} onChange={(e) => setNoKendaraan(e.target.value)} />
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                        </td>
                                        {/* jenis mobil */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey', color: 'black' }}>
                                            {/* <input style={{ height: 10, width: '100%' }} type="text" value={noKendaraan} onChange={(e) => setNoKendaraan(e.target.value)} /> */}
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                            <div className="flex">
                                                <DropDownListComponent
                                                    style={{ fontSize: '12px' }}
                                                    id="jenisMobil"
                                                    className="form-select"
                                                    // dataSource={listVia.map((data: any) => data.via)}
                                                    // dataSource={listVia.map((data: any) => ({ value: data.via }))}
                                                    dataSource={[{ value: 'TRAILER' }, { value: 'TRONTON' }, { value: 'COLT DIESEL' }, { value: 'CONTAINER' }]}
                                                    fields={{ value: 'value' }}
                                                    value={selectedJenisMobil}
                                                    placeholder={status_edit == true ? selectedJenisMobil : '-- Silahkan pilih --'}
                                                    select={(e) => {
                                                        console.log(e.itemData.value);
                                                        setJenisMobil(e.itemData.value);
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        {/* alamat */}
                                        <td rowSpan={5} style={{ textAlign: 'center', padding: 0, position: 'relative', border: '1px solid grey', borderBottomRightRadius: 5 }}>
                                            <textarea
                                                rows={1}
                                                style={{ height: 50, width: '100%', boxSizing: 'border-box', resize: 'none', color: 'black', marginTop: 2 }}
                                                value={alamatPengiriman}
                                                onChange={(e) => setAlamatPengiriman(e.target.value)}
                                            ></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        {jenisDO === 'KL' ? (
                                            <>
                                                <th colSpan={2} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Customer
                                                </th>
                                                <th colSpan={2} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Toleransi
                                                </th>
                                            </>
                                        ) : (
                                            <th colSpan={4} style={{ fontWeight: `bold`, color: `black` }}>
                                                Toleransi
                                            </th>
                                        )}
                                    </tr>
                                    <tr>
                                        {jenisDO === 'KL' ? (
                                            <>
                                                <td colSpan={2} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedCust.nama_relasi} readOnly={true} />
                                                        <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                            <FontAwesomeIcon
                                                                icon={faMagnifyingGlass}
                                                                className="ml-2"
                                                                width="15"
                                                                height="15"
                                                                onClick={() => {
                                                                    if (status_edit !== true) {
                                                                        setModalCustRow(true);
                                                                    }
                                                                }}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td colSpan={2} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                                    <div className="flex">
                                                        <DropDownListComponent
                                                            style={{ fontSize: '12px' }}
                                                            id="toleransi"
                                                            className="form-select"
                                                            dataSource={[{ value: 0.1 }, { value: 0.2 }, { value: 0.25 }, { value: 0.3 }]}
                                                            fields={{ value: 'value' }}
                                                            value={selectedToleransi}
                                                            placeholder={status_edit == true ? selectedToleransi : '-- Silahkan pilih --'}
                                                            select={(e) => {
                                                                console.log(e.itemData.value);
                                                                setSelectedToleransi(e.itemData.value);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <td colSpan={4} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                                <div className="flex">
                                                    <DropDownListComponent
                                                        style={{ fontSize: '12px' }}
                                                        id="toleransi"
                                                        className="form-select"
                                                        dataSource={[{ value: 0.1 }, { value: 0.2 }, { value: 0.25 }, { value: 0.3 }]}
                                                        fields={{ value: 'value' }}
                                                        value={selectedToleransi}
                                                        placeholder={status_edit == true ? selectedToleransi : '-- Silahkan pilih --'}
                                                        select={(e) => {
                                                            console.log(e.itemData.value);
                                                            setSelectedToleransi(e.itemData.value);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                </table>
                            </div>
                        </div>
                        {/* =============== END FOOTER ========================   */}
                    </div>
                </div>
                {/* =================  Tombol action dokumen ==================== */}
                <div
                    style={{
                        // backgroundColor: '#F2FDF8',
                        // position: 'absolute',
                        bottom: 0,
                        right: -20,
                        borderBottomLeftRadius: '6px',
                        borderBottomRightRadius: '6px',
                        width: '100%',
                        height: '55px',
                        display: 'inline-block',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                    }}
                >
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 3.2 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            dialogClose();
                            gridMBList!.dataSource.splice(0, gridMBList!.dataSource.length);
                            gridMBList!.refresh();
                        }}
                    />
                    {jenisDO !== 'KL' || status_edit != true ? (
                        <ButtonComponent
                            id="buSimpanDokumen18"
                            content="Simpan"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                const isPastDate = moment(tglMB).isBefore(moment(), 'day'); // cek lebih kecil dari hari ini
                                if (status_edit) {
                                    saveDoc(isPastDate);
                                } else {
                                    saveDoc(false); // baru
                                }
                            }}
                        />
                    ) : null}
                </div>
                {/* ================= End Tombol action dokumen ==================== */}

                {/* MODAL DAFTAR BARANG */}
                <DialogComponent
                    // ref={(d) => (gridDaftarBarang = d)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Barang'}
                    visible={modalDaftarBarang}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="420"
                    height="444"
                    // buttons={buttonDaftarBarangJadi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalDaftarBarang(false);
                        console.log('closeDialog');
                        setSearchNoItem('');
                        setSearchNamaItem('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '120px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoItem1"
                            name="searchNoItem1"
                            className="searchNoItem1"
                            placeholder="<No. Item>"
                            showClearButton={true}
                            value={searchNoItem}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaItem1')[0] as HTMLFormElement).value = '';
                                setSearchNamaItem('');
                                const value: any = args.value;
                                setSearchNoItem(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '270px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaItem1"
                            name="searchNamaItem1"
                            className="searchNamaItem1"
                            placeholder="<Nama Item>"
                            showClearButton={true}
                            value={searchNamaItem}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoItem1')[0] as HTMLFormElement).value = '';
                                setSearchNoItem('');
                                const value: any = args.value;
                                setSearchNamaItem(value);
                            }}
                        />
                    </div>
                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        // ref={(g) => (gridDaftarBarang = g)}
                        dataSource={listDaftarBarang}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log('args', args.data);
                            if (jenisDO !== 'KG') {
                                if (selectedHead === 'DO-1') {
                                    setStokAsliSO((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-2') {
                                    setStokAsliSO2((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-3') {
                                    setStokAsliSO3((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-4') {
                                    setStokAsliSO4((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                }
                            }

                            setSelectedBarang(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            getFromModalBarang();
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_item" headerText="No. Item" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_item" headerText="Nama Item" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => setModalDaftarBarang(false)}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen12"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => getFromModalBarang()}
                    />
                </DialogComponent>
                {/* END MODAL DAFTAR BARANG */}

                {/* MODAL DAFTAR BARANG PB KONTRAK PABRIK*/}
                <DialogComponent
                    // ref={(d) => (gridDaftarBarang = d)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar PB Kontrak Pabrik'}
                    visible={modalDaftarBarangPBKontrak}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="600"
                    height="444"
                    // buttons={buttonDaftarBarangJadi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalDaftarBarangPBKontrak(false);
                        console.log('closeDialog');
                        setSearchNoItemKontrak('');
                        setSearchNamaItemKontrak('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '120px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoItem1Kontrak"
                            name="searchNoItem1Kontrak"
                            className="searchNoItem1Kontrak"
                            placeholder="<No. Item>"
                            showClearButton={true}
                            value={searchNoItemKontrak}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaItem1Kontrak')[0] as HTMLFormElement).value = '';
                                setSearchNamaItemKontrak('');
                                const value: any = args.value;
                                setSearchNoItemKontrak(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '270px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaItem1Kontrak"
                            name="searchNamaItem1Kontrak"
                            className="searchNamaItem1Kontrak"
                            placeholder="<Nama Item>"
                            showClearButton={true}
                            value={searchNamaItemKontrak}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoItem1Kontrak')[0] as HTMLFormElement).value = '';
                                setSearchNoItemKontrak('');
                                const value: any = args.value;
                                setSearchNamaItemKontrak(value);
                            }}
                        />
                    </div>
                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        // ref={(g) => (gridDaftarBarang = g)}
                        dataSource={listDaftarBarangPBKontrak}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log('stokkkk', args.data);
                            setSelectedBarang(args.data);
                            if (jenisDO !== 'KG') {
                                if (selectedHead === 'DO-1') {
                                    setStokAsliSO((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-2') {
                                    setStokAsliSO2((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-3') {
                                    setStokAsliSO3((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                } else if (selectedHead === 'DO-4') {
                                    setStokAsliSO4((old: any) => [...old, { kode: args.data.kode_item, stok: args.data.stok }]);
                                }
                            }
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            getFromModalBarang();
                        }}
                        allowResizing={true}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_item" headerText="No. Item" headerTextAlign="Center" textAlign="Left" width="50" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_item" headerText="Nama Item" headerTextAlign="Center" textAlign="Left" width="110" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="no_kontrak" headerText="No. Kontrak" headerTextAlign="Center" textAlign="Left" width="110" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective format="N2" field="stok_kontrak" headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width="50" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective format="N2" field="stok" headerText="Sisa SO" headerTextAlign="Center" textAlign="Right" width="50" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="umur_beli" headerText="Umur" headerTextAlign="Center" textAlign="Right" width="40" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => setModalDaftarBarangPBKontrak(false)}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen13"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => getFromModalBarang()}
                    />
                </DialogComponent>
                {/* END MODAL DAFTAR BARANG PB KONTRAK PABRIK */}

                {/* MODAL CUSTOMER */}

                <DialogComponent
                    id="dialogDaftarCustomer"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Customer'}
                    visible={modalCustRow}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="84%"
                    height="84%"
                    enableResize={true}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalCustRow(false);
                        setSearchNoCust('');
                        setSearchNamaCust('');
                        setSearchNamaSales('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '105px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="noCust"
                            name="noCust"
                            className="noCust"
                            placeholder="<No. Cust>"
                            showClearButton={true}
                            value={searchNoCust}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('namaCust')[0] as HTMLFormElement).value = '';
                                setSearchNamaCust('');
                                (document.getElementsByName('namaSales')[0] as HTMLFormElement).value = '';
                                setSearchNamaSales('');
                                const value: any = args.value;
                                setSearchNoCust(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '310px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="namaCust"
                            name="namaCust"
                            className="namaCust"
                            placeholder="<Nama Customer>"
                            showClearButton={true}
                            value={searchNamaCust}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('noCust')[0] as HTMLFormElement).value = '';
                                setSearchNoCust('');
                                (document.getElementsByName('namaSales')[0] as HTMLFormElement).value = '';
                                setSearchNamaSales('');
                                const value: any = args.value;
                                setSearchNamaCust(value);
                            }}
                        />
                    </div>

                    <div className="form-input mb-1" style={{ width: '305px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="namaSales"
                            name="namaSales"
                            className="namaSales"
                            placeholder="<Nama Salesman>"
                            showClearButton={true}
                            value={searchNamaSales}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('namaCust')[0] as HTMLFormElement).value = '';
                                setSearchNamaCust('');
                                (document.getElementsByName('noCust')[0] as HTMLFormElement).value = '';
                                setSearchNoCust('');
                                const value: any = args.value;
                                setSearchNamaSales(value);
                            }}
                        />
                    </div>

                    <GridComponent
                        id="gridDaftarCustomer"
                        locale="id"
                        // dataSource={dsDaftarCustomer}
                        ref={gridRefCust}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'342'}
                        gridLines={'Both'}
                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedCust(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            console.log(args.rowData);
                            const selectedItems = args.rowData;
                            setSelectedCust(selectedItems);
                            setAlamatPengiriman(selectedItems.alamat_kirim1);
                            if (selectedItems.kode_cust === selectedCust.kode_cust) {
                                setModalCustRow(false);
                            } else {
                                setModalCustRow(false);
                                setSelectedNoSO('');
                            }
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_cust" headerText="No. Customer" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="alamat_kirim1" headerText="Alamat" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_salesman" headerText="Salesman" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="status_warna" headerText="Info Detail" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <div className="mt-4 flex items-center justify-between">
                        <div className={stylesTtb['custom-box-wrapper']}>
                            <div className={stylesTtb['custom-box-aktif']}></div>
                            <div className={stylesTtb['box-text']}>Aktif</div>
                            <div className={stylesTtb['custom-box-non-aktif']}></div>
                            <div className={stylesTtb['box-text']}>Non Aktif</div>
                            <div className={stylesTtb['custom-box-bl']}></div>
                            <div className={stylesTtb['box-text']}>BlackList-G</div>
                            <div className={stylesTtb['custom-box-noo']}></div>
                            <div className={stylesTtb['box-text']}>New Open Outlet</div>
                            <div className={stylesTtb['custom-box-batal-noo']}></div>
                            <div className={stylesTtb['box-text']}>Batal NOO</div>
                            <div className={stylesTtb['custom-box-tidak-digarap']}></div>
                            <div className={stylesTtb['box-text']}>Tidak Digarap</div>
                        </div>
                    </div>
                    <div className="flex" style={{ justifyContent: 'flex-end', padding: 10, marginTop: 10 }}>
                        <ButtonComponent
                            id="buSimpanDokumen14"
                            content="Pilih"
                            cssClass="e-primary e-small"
                            style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                if (selectedCust) {
                                    setAlamatPengiriman(selectedCust.alamat_kirim1);
                                    setModalCustRow(false);
                                    setSelectedNoSO('');
                                } else {
                                    alert('Silahkan pilih customer terlebih dulu');
                                }
                            }}
                        />
                        <ButtonComponent
                            id="buBatalDokumen1"
                            content="Batal"
                            cssClass="e-primary e-small"
                            style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                setModalCustRow(false);
                                setSelectedCust({ kode_cust: null, nama_relasi: '' });
                                setAlamatPengiriman('');
                                setSelectedNoSO('');
                            }}
                        />
                    </div>
                </DialogComponent>

                {/* END MODAL CUSTOMER */}

                {/* MODAL DAFTAR SUPPLIER */}
                <DialogComponent
                    // ref={(s) => (gridDaftarSupplier = s)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Supplier'}
                    visible={modalSupplierRow}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="420"
                    height="444"
                    // buttons={buttonDaftarBarangJadi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalSupplierRow(false);
                        setSearchNoSupp('');
                        setSearchNamaSupp('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '120px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoSupp"
                            name="searchNoSupp"
                            className="searchNoSupp"
                            placeholder="<No. Supplier>"
                            showClearButton={true}
                            value={searchNoSupp}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaSupp')[0] as HTMLFormElement).value = '';
                                setSearchNamaSupp('');
                                const value: any = args.value;
                                setSearchNoSupp(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '250px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaSupp"
                            name="searchNamaSupp"
                            className="searchNamaSupp"
                            placeholder="<Nama>"
                            showClearButton={true}
                            value={searchNamaSupp}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoSupp')[0] as HTMLFormElement).value = '';
                                setSearchNoSupp('');
                                const value: any = args.value;
                                setSearchNamaSupp(value);
                            }}
                        />
                    </div>

                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        // ref={(g) => (gridDaftarBarang = g)}
                        dataSource={listDaftarSupplier}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            if (modalFor === 'DO1') {
                                setSelectedSupplier(args.data);
                            } else if (modalFor === 'DO2') {
                                setSelectedSupplier2(args.data);
                            } else if (modalFor === 'DO3') {
                                setSelectedSupplier3(args.data);
                            } else if (modalFor === 'DO4') {
                                setSelectedSupplier4(args.data);
                            }
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            if (modalFor === 'DO1') {
                                setSelectedSupplier(selectedItems);
                            } else if (modalFor === 'DO2') {
                                setSelectedSupplier2(selectedItems);
                            } else if (modalFor === 'DO3') {
                                setSelectedSupplier3(selectedItems);
                            } else if (modalFor === 'DO4') {
                                setSelectedSupplier4(selectedItems);
                            }
                            setModalSupplierRow(false);
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_supp" headerText="No. Supplier" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="kode_mu" headerText="MU" headerTextAlign="Center" textAlign="Left" width="40" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_relasi" headerText="Nama" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            setModalSupplierRow(false);
                            setSelectedSupplier({ nama_relasi: '' });
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen15"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedSupplier) {
                                setModalSupplierRow(false);
                            } else {
                                alert('Silahkan pilih supplier terlebih dulu');
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL SUUPLIER */}

                {/* MODAL AKUN JURNAL */}
                <DialogComponent
                    // id="dialogDaftarAkunJurnal"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Akun Jurnal'}
                    visible={modalAkunJurnal}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="425"
                    height="450"
                    // buttons={buttonDaftarAkunKredit}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalAkunJurnal(false);
                        setSearchNoAkun('');
                        setSearchNamaAkun('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '150px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoAkun"
                            name="searchNoAkun"
                            className="searchNoAkun"
                            placeholder="<No. Akun>"
                            showClearButton={true}
                            value={searchNoAkun}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaAkun')[0] as HTMLFormElement).value = '';
                                setSearchNamaAkun('');
                                const value: any = args.value;
                                setSearchNoAkun(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1" style={{ width: '250px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaAkun"
                            name="searchNamaAkun"
                            className="searchNamaAkun"
                            placeholder="<Nama Akun>"
                            showClearButton={true}
                            value={searchNamaAkun}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoAkun')[0] as HTMLFormElement).value = '';
                                setSearchNoAkun('');
                                const value: any = args.value;
                                setSearchNamaAkun(value);
                            }}
                        />
                    </div>
                    <GridComponent
                        // id="gridDaftarAkunKredit"
                        locale="id"
                        ref={(g: any) => (gridAkunJurnalList = g)}
                        // dataSource={listAkunJurnal}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'267'}
                        gridLines={'Both'}
                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedAkunJurnal(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            if (args.rowData.header === 'Y') {
                                setModalAkunJurnal(false);
                                myAlert(`No. Akun ${args.rowData.no_akun} adalah akun induk tidak bisa digunakan untuk transaksi.`);
                            } else {
                                const selectedItems = args.rowData;
                                console.log(selectedItems);
                                setSelectedAkunJurnal(selectedItems);
                                setModalAkunJurnal(false);
                                if (selectedHead === 'DO-1') {
                                    const editedData = {
                                        ...gridJURNALList.dataSource[indexDataJurnal],
                                        kode_akun: selectedItems.kode_akun,
                                        no_akun: selectedItems.no_akun,
                                        nama_akun: selectedItems.nama_akun,
                                        tipe: selectedItems.tipe,
                                    };
                                    gridJURNALList.dataSource[indexDataJurnal] = editedData;
                                    gridJURNALList.refresh();
                                } else if (selectedHead === 'DO-2') {
                                    const editedData = {
                                        ...gridJURNALList2.dataSource[indexDataJurnal],
                                        kode_akun: selectedItems.kode_akun,
                                        no_akun: selectedItems.no_akun,
                                        nama_akun: selectedItems.nama_akun,
                                        tipe: selectedItems.tipe,
                                    };
                                    gridJURNALList2.dataSource[indexDataJurnal] = editedData;
                                    gridJURNALList2.refresh();
                                } else if (selectedHead === 'DO-3') {
                                    const editedData = {
                                        ...gridJURNALList3.dataSource[indexDataJurnal],
                                        kode_akun: selectedItems.kode_akun,
                                        no_akun: selectedItems.no_akun,
                                        nama_akun: selectedItems.nama_akun,
                                        tipe: selectedItems.tipe,
                                    };
                                    gridJURNALList3.dataSource[indexDataJurnal] = editedData;
                                    gridJURNALList3.refresh();
                                } else if (selectedHead === 'DO-4') {
                                    const editedData = {
                                        ...gridJURNALList4.dataSource[indexDataJurnal],
                                        kode_akun: selectedItems.kode_akun,
                                        no_akun: selectedItems.no_akun,
                                        nama_akun: selectedItems.nama_akun,
                                        tipe: selectedItems.tipe,
                                    };
                                    gridJURNALList4.dataSource[indexDataJurnal] = editedData;
                                    gridJURNALList4.refresh();
                                }
                            }
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective
                                // template={(args: any) => TemplateNoAkun(args)}
                                field="no_akun"
                                headerText="No. Akun"
                                headerTextAlign="Center"
                                textAlign="Left"
                                width="30"
                                clipMode="EllipsisWithTooltip"
                                // template={templateNoAkun}
                            />
                            <ColumnDirective
                                // template={(args: any) => TemplateNamaAkun(args)}
                                field="nama_akun"
                                headerText="Keterangan"
                                headerTextAlign="Center"
                                textAlign="Left"
                                width="60"
                                clipMode="EllipsisWithTooltip"
                                template={templateNamaAkun}
                            />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            setModalAkunJurnal(false);
                            setSearchNoAkun('');
                            setSearchNamaAkun('');
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen16"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedAkunJurnal) {
                                console.log(selectedAkunJurnal);
                                setModalAkunJurnal(false);
                                if (selectedAkunJurnal.header === 'Y') {
                                    myAlert(`No. Akun ${selectedAkunJurnal.no_akun} adalah akun induk tidak bisa digunakan untuk transaksi.`);
                                } else {
                                    if (selectedHead === 'DO-1') {
                                        const editedData = {
                                            ...gridJURNALList.dataSource[indexDataJurnal],
                                            kode_akun: selectedAkunJurnal.kode_akun,
                                            no_akun: selectedAkunJurnal.no_akun,
                                            nama_akun: selectedAkunJurnal.nama_akun,
                                            tipe: selectedAkunJurnal.tipe,
                                        };
                                        gridJURNALList.dataSource[indexDataJurnal] = editedData;
                                        gridJURNALList.refresh();
                                    } else if (selectedHead === 'DO-2') {
                                        const editedData = {
                                            ...gridJURNALList2.dataSource[indexDataJurnal],
                                            kode_akun: selectedAkunJurnal.kode_akun,
                                            no_akun: selectedAkunJurnal.no_akun,
                                            nama_akun: selectedAkunJurnal.nama_akun,
                                            tipe: selectedAkunJurnal.tipe,
                                        };
                                        gridJURNALList2.dataSource[indexDataJurnal] = editedData;
                                        gridJURNALList2.refresh();
                                    } else if (selectedHead === 'DO-3') {
                                        const editedData = {
                                            ...gridJURNALList3.dataSource[indexDataJurnal],
                                            kode_akun: selectedAkunJurnal.kode_akun,
                                            no_akun: selectedAkunJurnal.no_akun,
                                            nama_akun: selectedAkunJurnal.nama_akun,
                                            tipe: selectedAkunJurnal.tipe,
                                        };
                                        gridJURNALList3.dataSource[indexDataJurnal] = editedData;
                                        gridJURNALList3.refresh();
                                    } else if (selectedHead === 'DO-4') {
                                        const editedData = {
                                            ...gridJURNALList4.dataSource[indexDataJurnal],
                                            kode_akun: selectedAkunJurnal.kode_akun,
                                            no_akun: selectedAkunJurnal.no_akun,
                                            nama_akun: selectedAkunJurnal.nama_akun,
                                            tipe: selectedAkunJurnal.tipe,
                                        };
                                        gridJURNALList4.dataSource[indexDataJurnal] = editedData;
                                        gridJURNALList4.refresh();
                                    }
                                }
                            } else {
                                myAlert(`Silahkan pilih akun terlebih dulu.`);
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL AKUN JURNAL */}

                {/* MODAL DAFTAR SO */}
                <DialogComponent
                    // ref={(s) => (gridDaftarSupplier = s)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Order Penjualan (SO)'}
                    visible={modalListSO}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="800"
                    height="444"
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalListSO(false);
                        setSearchNoSO('');
                        setSearchNamaRelasiSO('');
                        setSearchAlamatKirimSO('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '170px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoSO"
                            name="searchNoSO"
                            className="searchNoSO"
                            placeholder="<No. SO>"
                            showClearButton={true}
                            value={searchNoSO}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaRelasiSO')[0] as HTMLFormElement).value = '';
                                (document.getElementsByName('searchAlamatKirimSO')[0] as HTMLFormElement).value = '';
                                setSearchNamaRelasiSO('');
                                setSearchAlamatKirimSO('');
                                const value: any = args.value;
                                setSearchNoSO(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '300px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaRelasiSO"
                            name="searchNamaRelasiSO"
                            className="searchNamaRelasiSO"
                            placeholder="<Nama>"
                            showClearButton={true}
                            value={searchNamaRelasiSO}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoSO')[0] as HTMLFormElement).value = '';
                                (document.getElementsByName('searchAlamatKirimSO')[0] as HTMLFormElement).value = '';
                                setSearchNoSO('');
                                setSearchAlamatKirimSO('');
                                const value: any = args.value;
                                setSearchNamaRelasiSO(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '300px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchAlamatKirimSO"
                            name="searchAlamatKirimSO"
                            className="searchAlamatKirimSO"
                            placeholder="<Alamat>"
                            showClearButton={true}
                            value={searchAlamatKirimSO}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoSO')[0] as HTMLFormElement).value = '';
                                (document.getElementsByName('searchNamaRelasiSO')[0] as HTMLFormElement).value = '';
                                setSearchNoSO('');
                                setSearchNamaRelasiSO('');
                                const value: any = args.value;
                                setSearchAlamatKirimSO(value);
                            }}
                        />
                    </div>

                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        // ref={(g) => (gridDaftarBarang = g)}
                        allowResizing={true}
                        dataSource={listDaftarSO}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedDataSO(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            console.log(selectedItems);
                            setSelectedDataSO(selectedItems);
                            getFromModalSO();
                            setModalListSO(false);
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_dok" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="120" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="tgl_dok" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="tgl_bpb" headerText="Tanggal BPB" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_relasi" headerText="Nama" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="alamat" headerText="Alamat" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="tgl_dikirim" headerText="Estimasi Tgl. Dikirim" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="kota_kirim" headerText="Kota Tujuan" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective format="N2" field="tonase" headerText="Total Sisa Berat" headerTextAlign="Center" textAlign="Right" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_sales" headerText="Salesman" headerTextAlign="Center" textAlign="Left" width="120" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            setModalListSO(false);
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen17"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedDataSO) {
                                getFromModalSO();
                                setModalListSO(false);
                            } else {
                                alert('Silahkan pilih SO terlebih dulu');
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL SO */}
            </div>
        </DialogComponent>
    );
};

export default DOMobilSendiriCustomer;

import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import styles from './mbstyle.module.css';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes, faKey } from '@fortawesome/free-solid-svg-icons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Tab, TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import { formatNumber, frmNumber, generateNU, FillFromSQL, FirstDayInPeriod, tanpaKoma, fetchPreferensi, overQTYAll, HitungBeratToleransi } from '@/utils/routines';
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
import { cekDataDiDatabase } from '@/utils/global/fungsi';
import { useSession } from '@/pages/api/sessionContext';
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

const DOPabrikEkspedisi: React.FC<dialogMutasiBarangAntarGudang> = ({ userid, kode_entitas, isOpen, onClose, kode_user, status_edit, fbm_kode_group, kode_mb_edit, jenisDO, onRefresh }) => {

    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const nipUser = sessionData?.nip ?? '';
    const token = sessionData?.token ?? '';
    const [listGudang, setListGudang] = useState([]);
    const [listGudangPabrik, setListGudangPabrik] = useState([]);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [listPengemudi, setListPengemudi] = useState([]);
    const [listVia, setApiResponseVia] = useState([]); // default
    const [listDaftarBarang, setDaftarBarang] = useState([]);
    const [listDaftarBarangPBKontrak, setDaftarBarangPBKontrak] = useState([]);
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

    const [modalCustRow, setModalCustRow] = useState(false);
    const [dsDaftarCustomer, setDsDaftarCustomer] = useState<any[]>([]);
    const [modalListSO, setModalListSO] = useState(false);
    const [modalSupplierRow, setModalSupplierRow] = useState(false);
    const [modalHargaEkspedisi, setModalHargaEkspedisi] = useState(false);
    const [modalOtorisasi, setModalOtorisasi] = useState(false);
    const [listDaftarSupplier, setListDataSupplier] = useState<any[]>([]);
    const [listDataHargaEkspedisi, setListDataHargaEkspedisi] = useState<any[]>([]);
    const [listDaftarSO, setListDataSO] = useState<any[]>([]);

    const [indexDataJurnal, setIndexDataJurnal] = useState('');
    const [modalAkunJurnal, setModalAkunJurnal] = useState(false);
    const [listAkunJurnal, setListAkunJurnal] = useState<any[]>([]); // pake let
    const [selectedAkunJurnal, setSelectedAkunJurnal] = useState<any>('');
    const [searchNoAkun, setSearchNoAkun] = useState('');
    const [searchNamaAkun, setSearchNamaAkun] = useState('');
    const [selectedHargaEkspedisi, setSelectedHargaEkspedisi] = useState<any>('');
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [skipAuth, setSkipAuth] = useState(false);

    //HEADER
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
    const [dataBarang, setDataBarang] = useState<any>({ nodes: [] });
    const [dataBarang2, setDataBarang2] = useState<any>({ nodes: [] });
    const [dataBarang3, setDataBarang3] = useState<any>({ nodes: [] });
    const [dataBarang4, setDataBarang4] = useState<any>({ nodes: [] });
    const [dataJurnal, setDataJurnal] = useState<any>({ nodes: [] });
    const [dataJurnal2, setDataJurnal2] = useState<any>({ nodes: [] });
    const [dataJurnal3, setDataJurnal3] = useState<any>({ nodes: [] });
    const [dataJurnal4, setDataJurnal4] = useState<any>({ nodes: [] });

    const [totalBeratBesi, setTotalBeratBesi] = useState<any>(0);
    const [totalBeratBesi2, setTotalBeratBesi2] = useState<any>(0);
    const [totalBeratBesi3, setTotalBeratBesi3] = useState<any>(0);
    const [totalBeratBesi4, setTotalBeratBesi4] = useState<any>(0);

    const [totalBeratNonBesi, setTotalBeratNonBesi] = useState<any>(0);
    const [totalBeratNonBesi2, setTotalBeratNonBesi2] = useState<any>(0);
    const [totalBeratNonBesi3, setTotalBeratNonBesi3] = useState<any>(0);
    const [totalBeratNonBesi4, setTotalBeratNonBesi4] = useState<any>(0);

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
    const [originalDataBrangPBKontrak, setOriginalDataBrangPBKontrak] = useState([]);

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

    const HandleSearchNoAkun = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarAkunKredit: any) => {
        const searchValue = event;
        setSearchNoItemKontrak(searchValue);

        const filteredData = searchDataNoAkun(searchValue, dataDaftarAkunKredit);

        console.log('filteredData', filteredData, event);

        setStateDataArray(filteredData);
    };

    const searchDataNoAkun = (keyword: any, dataDaftarAkunKredit: any) => {
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return dataDaftarAkunKredit;
        } else {
            // let s = 'ssss'
            // s.startsWith
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = dataDaftarAkunKredit.filter((item: any) => item.no_item.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
    };

    const HandleSearchNamaItem = (event: any, setStateDataHeader: Function, setStateDataArray: Function, dataDaftarAkunKredit: any) => {
        const searchValue = event;
        setSearchNamaItemKontrak(searchValue);

        const filteredData = searchDataNamaItem(searchValue, dataDaftarAkunKredit);

        console.log('filteredData', filteredData, event);

        setStateDataArray(filteredData);
    };

    const searchDataNamaItem = (keyword: any, dataDaftarAkunKredit: any) => {
        // Jika keyword kosong, kembalikan semua data
        if (keyword === '') {
            return dataDaftarAkunKredit;
        } else {
            // let s = 'ssss'
            // s.startsWith
            // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
            const filteredData = dataDaftarAkunKredit.filter((item: any) => item.nama_item.toLowerCase().includes(keyword.toLowerCase()));
            return filteredData;
        }
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
            // const viaPengiriman = await FillFromSQL(kode_entitas, 'pengiriman via', kode_user)
            //     .then((result) => {
            //         setApiResponseVia(result);
            //     })
            //     .catch((error) => {
            //         console.error('Error:', error);
            //     });
            const response = await axios.get(`${apiUrl}/erp/list_ekspedisi`, {
                params: {
                    entitas: kode_entitas,
                },
            });
            const responseVia = response.data.data;
            // console.log(responseVia);
            const transformedData_getvia = responseVia.map((item: any) => ({
                via: item.ekspedisi,
            }));
            setApiResponseVia(transformedData_getvia);

            console.log(transformedData_getvia);

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
                            setSelectedHargaEkspedisi({ harga: dataEdit.harga_eks, harga_tambahan: dataEdit.harga_tambahan, min_tonase: dataEdit.min_tonase, max_tonase: dataEdit.max_tonase });
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
                                berat_cetak: parseFloat(item.berat_cetak),
                                berat_satuan: parseFloat(item.bobot),
                            }));

                            const TOTBERATBESI1 = modifiedDetail.reduce((total: any, item: any) => {
                                return total + item.beratbesi1 * item.qty;
                            }, 0);

                            const TOTBERATNONBESI = modifiedDetail.reduce((total: any, item: any) => {
                                return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                            }, 0);

                            setTotalBeratBesi(TOTBERATBESI1);
                            setTotalBeratNonBesi(TOTBERATNONBESI);
                            console.log('modifiedDetail', modifiedDetail);

                            // gridMBList.dataSource = modifiedDetail;
                            setDataBarang({ nodes: modifiedDetail });
                            gridMBList.setProperties({ dataSource: modifiedDetail });
                            gridMBList.refresh();
                            console.log(modifiedDetail);
                            // ===========================================

                            const totalBerat = modifiedDetail.reduce((total: any, item: any) => {
                                return total + item.berat;
                            }, 0);

                            const totalNettoRP = modifiedDetail.reduce((total: any, item: any) => {
                                return total + parseFloat(item.jumlah_rp);
                            }, 0);

                            //SAAT EDIT BERAT BESI1 dan NONBESI belum dimasukan
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
                                berat_cetak: parseFloat(item.berat_cetak),
                                berat_satuan: parseFloat(item.bobot),
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
                                berat_cetak: parseFloat(item.berat_cetak),
                                berat_satuan: parseFloat(item.bobot),
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
                                berat_cetak: parseFloat(item.berat_cetak),
                                berat_satuan: parseFloat(item.bobot),
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
                    if (searchNoItemKontrak == '' && searchNamaItemKontrak == '') {
                        const response = await axios.get(`${apiUrl}/erp/list_detail_item_kontrak_dlg_mblkg?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: gudangHead,
                            },
                        });
                        const result = response.data;

                        if (result.status) {
                            setDaftarBarangPBKontrak(result.data);
                            setOriginalDataBrangPBKontrak(result.data);
                        }
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
                    setDsDaftarCustomer(response.data);
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

    //HARGA EKSPEDISI
    useEffect(() => {
        const fetchHargaEkspedisiData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/harga_ekspedisi`, {
                    params: {
                        entitas: kode_entitas,
                        param1: selectedJenisKirim.kode_jenis_kirim,
                        param2: Via === null ? 'all' : Via,
                        param3: selectedJenisMobil === null ? 'all' : selectedJenisMobil,
                    },
                });
                const responseListHargaEks = response.data.data;
                const modifiedResponse = responseListHargaEks.map((item: any) => ({
                    ...item,
                    harga: parseFloat(item.harga),
                    harga_tambahan: parseFloat(item.harga_tambahan),
                }));
                console.log(modifiedResponse);
                setListDataHargaEkspedisi(modifiedResponse);
            } catch (error) {
                console.log(error);
            }
        };

        fetchHargaEkspedisiData();
    }, [Via, selectedJenisMobil]);

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

    //DONE MULTIPLE
    const handleDetail_Add = async (jenis: any) => {
        await handleDetail_EndEdit();
        if (selectedHead === 'DO-1') {
            var totalLine = gridMBList.dataSource.length;
            var isNoBarangNotEmpty = gridMBList.dataSource.every((item: any) => item.no_barang !== '');
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

            overQTYAll(kode_entitas, gudangHead, selectedBarang.kode_item, moment().format('YYYY-MM-DD HH:mm:ss'), '', 1, 'mb', 'Kuantitas barang', '#dialogMBList').then(async (result) => {
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
                                param2: 'all',
                                param3: gudangHead,
                            },
                        });
                        const result = response.data.data;
                        const harga_hpp = result[0].hpp !== undefined ? result[0].hpp : 0;
                        console.log('B');
                        const responserumus = await axios.get(`${apiUrl}/erp/get_rumus_berat?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: selectedBarang.kode_item,
                            },
                        });
                        const resultrumus = responserumus.data.data[0];
                        HitungBeratToleransi(resultrumus.tebal, resultrumus.lebar, resultrumus.panjang, selectedBarang.berat, selectedToleransi, resultrumus.rumus_berat).then((result) => {
                            console.log(result);
                            console.log(kontrakValue);
                            console.log(selectedBarang.stok);
                            const berat_toleransi = result;
                            const createDetailBarangBaru = (selectedBarang: any, kontrakValue: any, harga_hpp: any, totalLine: any, berat_toleransi: any) => {
                                if (jenisDO === 'KG') {
                                    var qty = kontrakValue === 'Kontrak' ? selectedBarang.stok : 1;
                                    //KL
                                } else {
                                    var qty = selectedBarang.stok_kontrak < selectedBarang.stok ? selectedBarang.stok_kontrak:selectedBarang.stok;
                                    var stok_awal = selectedBarang.stok_kontrak < selectedBarang.stok ? selectedBarang.stok_kontrak:selectedBarang.stok;
                                }
                                const no_kontrak = kontrakValue === 'Kontrak' ? selectedBarang.no_kontrak : '';
                                console.log(selectedBarang);
                                return {
                                    kode_mb: '',
                                    id_mb: totalLine,
                                    kode_pmb: null,
                                    id_pmb: null,
                                    kode_item: selectedBarang.kode_item,
                                    no_barang: selectedBarang.no_item,
                                    nama_barang: selectedBarang.nama_item,
                                    satuan: selectedBarang.satuan,
                                    qty: qty,
                                    sat_std: selectedBarang.satuan,
                                    qty_std: qty,
                                    harga_rp: parseFloat(harga_hpp),
                                    jumlah_rp: qty * harga_hpp,
                                    berat: qty * selectedBarang.berat,
                                    berat_satuan: parseFloat(selectedBarang.berat),
                                    hpp: parseFloat(harga_hpp),
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
                                    beratbesi1: parseFloat(selectedBarang.harga1),
                                    beratbesi2: parseFloat(selectedBarang.harga2),
                                    beratnonbesi: parseFloat(selectedBarang.harga3),
                                    jenis_produk: selectedBarang.satuan3,
                                };
                            };

                            let detailBarangBaru;

                            if (selectedHead === 'DO-1') {
                                detailBarangBaru = createDetailBarangBaru(selectedBarang, kontrakValue, harga_hpp, totalLine, berat_toleransi);
                                gridMBList.dataSource[selectedRowIndex] = detailBarangBaru;
                                gridMBList.refresh();
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

            console.log('A');
            const detailBarangBaru = {
                kode_mb: '',
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
                gridMBList.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList.startEdit(totalLine);
                }, 200);
                setTambah(true);
            } else if (selectedHead === 'DO-2') {
                gridMBList2.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList2.startEdit(totalLine);
                }, 200);
                setTambah(true);
            } else if (selectedHead === 'DO-3') {
                gridMBList3.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList3.startEdit(totalLine);
                }, 200);
                setTambah(true);
            } else if (selectedHead === 'DO-4') {
                gridMBList4.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList4.startEdit(totalLine);
                }, 200);
                setTambah(true);
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
        const selectedRowIndex = gridMBList.selectedRowIndex;
        setSelectedRowIndex(selectedRowIndex);
        console.log(selectedRowIndex);

        if (selectedRowIndex > -1) {
            gridMBList.startEdit(selectedRowIndex);
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
            gridMBList.endEdit();
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
                        if (gridMBList.dataSource.length > 0 && kontrakValue === 'Kontrak') {
                            if (gridMBList.dataSource[selectedRowIndex].qty > gridMBList.dataSource[selectedRowIndex].stok_awal) {
                                myAlert(
                                    `Item : ${args.data.no_barang} - ${args.data.nama_barang} \nKuantitas barang (${frmNumber(args.data.qty)}) melebihi stok digudang asal (${frmNumber(
                                        gridMBList.dataSource[selectedRowIndex].stok_awal
                                    )})`
                                );
                                gridMBList.dataSource[selectedRowIndex] = { ...args.data, qty: gridMBList.dataSource[selectedRowIndex].stok_awal };
                                gridMBList.refresh();
                                // KALKULASI;
                                kalkulasi();
                                setUpdateDetail(true);
                                // OFF blocking disini
                            } else {
                                const editedData = args.data;
                                gridMBList.dataSource[selectedRowIndex] = editedData;
                                gridMBList.refresh();
                                // KALKULASI
                                kalkulasi();
                                setUpdateDetail(true);
                            }
                        } else {
                            //non kontrak
                            const editedData = args.data;
                            gridMBList.dataSource[selectedRowIndex] = editedData;
                            gridMBList.refresh();
                            // KALKULASI
                            kalkulasi();
                            setUpdateDetail(true);
                        }
                        //blocking berat cetak ekspedisi
                        if (gridMBList.dataSource[selectedRowIndex].berat_cetak > gridMBList.dataSource[selectedRowIndex].berat_toleransi) {
                            myAlert(`Berat cetak ekspedisi tidak sesuai ketentuan. DO-1`);
                            gridMBList.dataSource[selectedRowIndex].berat_cetak = 0.0;
                        }
                    } else if (edit) {
                        // KALKULASI 2
                        kalkulasi();
                        gridMBList.refresh();
                        setUpdateDetail(true);
                    }
                    break;
                case 'beginEdit':
                    setTambah(false);
                    setEdit(true);
                    break;
                case 'delete':
                    gridMBList.dataSource.forEach((item: any, index: any) => {
                        item.id_mb = index + 1;
                    });
                    gridMBList.refresh();
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
                        //blocking berat cetak ekspedisi
                        if (gridMBList2.dataSource[selectedRowIndex].berat_cetak > gridMBList2.dataSource[selectedRowIndex].berat_toleransi) {
                            myAlert(`Berat cetak ekspedisi tidak sesuai ketentuan. DO-2`);
                            gridMBList2.dataSource[selectedRowIndex].berat_cetak = 0.0;
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
                        //blocking berat cetak ekspedisi
                        if (gridMBList3.dataSource[selectedRowIndex].berat_cetak > gridMBList3.dataSource[selectedRowIndex].berat_toleransi) {
                            myAlert(`Berat cetak ekspedisi tidak sesuai ketentuan. DO-3`);
                            gridMBList3.dataSource[selectedRowIndex].berat_cetak = 0.0;
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
                        //blocking berat cetak ekspedisi
                        if (gridMBList4.dataSource[selectedRowIndex].berat_cetak > gridMBList4.dataSource[selectedRowIndex].berat_toleransi) {
                            myAlert(`Berat cetak ekspedisi tidak sesuai ketentuan. DO-4`);
                            gridMBList4.dataSource[selectedRowIndex].berat_cetak = 0.0;
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
                    gridMBList.dataSource.map(async (item: any) => {
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang({ nodes: gridMBList.dataSource });
                });
            } else if (selectedHead === 'DO-2') {
                Promise.all(
                    gridMBList2.dataSource.map(async (item: any) => {
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang2({ nodes: gridMBList2.dataSource });
                });
            } else if (selectedHead === 'DO-3') {
                Promise.all(
                    gridMBList3.dataSource.map(async (item: any) => {
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang3({ nodes: gridMBList3.dataSource });
                });
            } else if (selectedHead === 'DO-4') {
                Promise.all(
                    gridMBList4.dataSource.map(async (item: any) => {
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    console.log('DIEKSE');
                    setDataBarang4({ nodes: gridMBList4.dataSource });
                });
            }
        } else {
            if (selectedHead === 'DO-1') {
                Promise.all(
                    gridMBList.dataSource.map(async (item: any) => {
                        item.berat = Math.round(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);

                    const TOTBERATBESI1 = gridMBList.dataSource.reduce((total: any, item: any) => {
                        return total + item.beratbesi1 * item.qty;
                    }, 0);

                    const TOTBERATNONBESI = gridMBList.dataSource.reduce((total: any, item: any) => {
                        return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                    }, 0);

                    setTotalBerat(totalBerat);
                    setTotalNettoRP(totalNettoRP);

                    setTotalBeratBesi(TOTBERATBESI1);
                    setTotalBeratNonBesi(TOTBERATNONBESI);
                    setDataBarang({ nodes: gridMBList.dataSource });
                });
            } else if (selectedHead === 'DO-2') {
                Promise.all(
                    gridMBList2.dataSource.map(async (item: any) => {
                        item.berat = Math.round(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);

                    const TOTBERATBESI1 = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + item.beratbesi1 * item.qty;
                    }, 0);

                    const TOTBERATNONBESI = gridMBList2.dataSource.reduce((total: any, item: any) => {
                        return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                    }, 0);

                    setTotalBerat2(totalBerat); // 2
                    setTotalNettoRP2(totalNettoRP); // 2\

                    setTotalBeratBesi2(TOTBERATBESI1);
                    setTotalBeratNonBesi2(TOTBERATNONBESI);
                    console.log('DIEKSE');
                    setDataBarang2({ nodes: gridMBList2.dataSource });
                });
            } else if (selectedHead === 'DO-3') {
                Promise.all(
                    gridMBList3.dataSource.map(async (item: any) => {
                        item.berat = Math.round(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);

                    const TOTBERATBESI1 = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + item.beratbesi1 * item.qty;
                    }, 0);

                    const TOTBERATNONBESI = gridMBList3.dataSource.reduce((total: any, item: any) => {
                        return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                    }, 0);

                    setTotalBerat3(totalBerat); // 2
                    setTotalNettoRP3(totalNettoRP); // 2
                    console.log('DIEKSE');
                    setTotalBeratBesi3(TOTBERATBESI1);
                    setTotalBeratNonBesi3(TOTBERATNONBESI);
                    setDataBarang3({ nodes: gridMBList3.dataSource });
                });
            } else if (selectedHead === 'DO-4') {
                Promise.all(
                    gridMBList4.dataSource.map(async (item: any) => {
                        item.berat = Math.round(item.qty * item.berat_satuan * 100) / 100;
                        item.jumlah_rp = item.qty * item.harga_rp;
                        item.berat_toleransi = Math.round(item.qty * item.berat_toleransi_satuan * 100) / 100;
                    })
                ).then(() => {
                    const totalBerat = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + item.jumlah_rp;
                    }, 0);

                    const TOTBERATBESI1 = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + item.beratbesi1 * item.qty;
                    }, 0);

                    const TOTBERATNONBESI = gridMBList4.dataSource.reduce((total: any, item: any) => {
                        return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                    }, 0);

                    setTotalBerat4(totalBerat); // 2
                    setTotalNettoRP4(totalNettoRP); // 2
                    console.log('DIEKSE');
                    setTotalBeratBesi4(TOTBERATBESI1);
                    setTotalBeratNonBesi4(TOTBERATNONBESI);
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
        const promises = gridMBList.dataSource.map(async (item: any) => {
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

    useEffect(() => {
        // perhitungan saat tab diselect
        // tambah recalc di save doc cek ulang berat toleransi masing masing detail
        console.log(selectedToleransi);
        if (selectedHead === 'DO-1') {
            if (gridMBList && gridMBList.dataSource) {
                getBeratToleransi(selectedToleransi)
                    .then((result) => {
                        console.log(result);
                        for (let i = 0; i < result.length; i++) {
                            if (gridMBList && gridMBList.dataSource && gridMBList.dataSource[i]) {
                                gridMBList.dataSource[i] = { ...gridMBList.dataSource[i], berat_toleransi_satuan: result[i] };
                                kalkulasi();
                                gridMBList.refresh();
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
                        gridMBList.dataSource.splice(selectedRowIndex, 1);
                        gridMBList.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList.refresh();
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
                gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                gridMBList.refresh();
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
                            gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                            gridMBList.refresh();
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
                            gridMBList.endEdit();
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
                        <TextBoxComponent id="no_item1" name="no_item1" className="no_item1" value={args.no_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="no_item_2"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (!status_edit) {
                                        // baru untuk pabrik bisa edit berak cetak
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
                        <TextBoxComponent id="nama_item1" name="nama_item1" className="nama_item1" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="nama_item1_2"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (!status_edit) {
                                        // baru
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
                        <TextBoxComponent id="subledger" name="subledger" className="subledger" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="subledger_2"
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

    const editTemplateMasterItem_No_Akun = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_akun" name="no_akun" className="no_akun" value={args.no_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="no_akun1"
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
                        <TextBoxComponent id="nama_akun" name="nama_akun" className="nama_akun" value={args.nama_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="nama_akun2"
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

    const beratCetakTemplate = (props: any) => {
        return props.berat_cetak === 0.0 || props.berat_cetak === '0.0000' ? '' : props.berat_cetak;
    };

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
            if (selectedHead === 'DO-1') {
                var blockingJurnal = gridMBList.dataSource.length === 0 || gridMBList.dataSource.some((item: any) => !item.no_barang.trim());
            } else if (selectedHead === 'DO-2') {
                var blockingJurnal = gridMBList2.dataSource.length === 0 || gridMBList2.dataSource.some((item: any) => !item.no_barang.trim());
            } else if (selectedHead === 'DO-3') {
                var blockingJurnal = gridMBList3.dataSource.length === 0 || gridMBList3.dataSource.some((item: any) => !item.no_barang.trim());
            } else if (selectedHead === 'DO-4') {
                var blockingJurnal = gridMBList4.dataSource.length === 0 || gridMBList4.dataSource.some((item: any) => !item.no_barang.trim());
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
                        berat_toleransi: Math.round(item.qty * berat_toleransi * 100) / 100,
                        berat_toleransi_satuan: berat_toleransi,
                    };
                })
            );
            console.log(modifiedDetailJson);
            return modifiedDetailJson;
        }
        return [];
    };

    const saveDoc = async (Auth: any, alertAllowAppDate: any) => {
        // console.log('allNoKontrakArray',kontrakValue);

        
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            const formatPeriode = moment(periode).format('YYYY-MM-DD');

            // ==============nodes kontrak all =====================
            const allNodes = [
                ...(dataBarang.nodes.length > 0 ? dataBarang.nodes : []),
                ...(dataBarang2.nodes.length > 0 ? dataBarang2.nodes : []),
                ...(dataBarang3.nodes.length > 0 ? dataBarang3.nodes : []),
                ...(dataBarang4.nodes.length > 0 ? dataBarang4.nodes : []),
            ];

            const TotalSemuaBesi = allNodes.reduce((total: any, item: any) => {
                                return total + item.beratbesi1 * item.qty;
                            }, 0);

                            const TotalSemuaNonBesi = allNodes.reduce((total: any, item: any) => {
                                return total + (item.jenis_produk === 'BESI' ? 0 : item.beratnonbesi);
                            }, 0);

//                             return console.log('kesemuaaah',TotalSemuaBesi,
// TotalSemuaNonBesi )
            const allNoKontrakArray = allNodes.map((node: any) => node.no_kontrak);
            const allHasDuplicates = allNoKontrakArray.some((no_kontrak: any, index: any) => {
                return no_kontrak !== '' && allNoKontrakArray.indexOf(no_kontrak) !== index;
            });
            // ==============end nodes kontrak all =====================

            if(kontrakValue !== 'Non Kontrak') {

                if (allHasDuplicates) {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen.`);
                    return;
                }
            } else if (kontrakValue2 !== 'Non Kontrak') {
                if (allHasDuplicates) {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen.`);
                    return;
                }
            } else if (kontrakValue3 !== 'Non Kontrak') {
                if (allHasDuplicates) {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen.`);
                    return;
                }
            } else if (kontrakValue4 !== 'Non Kontrak') {
                if (allHasDuplicates) {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen.`);
                    return;
                }
            }
            if (alertAllowAppDate) {
                const confirmMessage = `Tgl. Dokumen lebih kecil dari hari ini, transaksi mutasi barang dilanjutkan.`;
                if (!confirm(confirmMessage)) {
                    return;
                } else {
                    saveDoc(false, false);
                }
                return;
            }

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
                } else if (UpdateDetail && !status_edit) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-1`);
                    return;
                } else if (totalDebit - totalKredit !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-1`);
                    return;
                } else if (hasDuplicates && kontrakValue === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-1`);
                    return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi < selectedHargaEkspedisi.min_tonase) {
                    const confirmMessage = `Berat Tonase ${frmNumber(TotalSemuaBesi + TotalSemuaNonBesi)} lebih kecil dari minimal tonase ${frmNumber(
                        selectedHargaEkspedisi.min_tonase
                    )}. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-1?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
                    return;
                    //jika hasil login di modal true maka lanjutkan, jika salah maka berhenti atau return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi > selectedHargaEkspedisi.max_tonase) {
                    const confirmMessage = `Berat Tonase ${TotalSemuaBesi + TotalSemuaNonBesi} lebih besar dari maximal tonase ${
                        selectedHargaEkspedisi.max_tonase
                    }. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-1?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
                } else {
                    console.log(totalBeratBesi);
                    selectedHargaEkspedisi.max_tonase;
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
                } else if (UpdateDetail2 && !status_edit) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-2`);
                    return;
                } else if (totalDebit2 - totalKredit2 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-2`);
                    return;
                } else if (hasDuplicates && kontrakValue2 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-2`);
                    return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi < selectedHargaEkspedisi.min_tonase) {
                    const confirmMessage = `Berat Tonase ${frmNumber(TotalSemuaBesi + TotalSemuaNonBesi)} lebih kecil dari minimal tonase ${frmNumber(
                        selectedHargaEkspedisi.min_tonase
                    )}. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-2?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
                    return;
                    //jika hasil login di modal true maka lanjutkan, jika salah maka berhenti atau return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi > selectedHargaEkspedisi.max_tonase) {
                    const confirmMessage = `Berat Tonase ${TotalSemuaBesi + TotalSemuaNonBesi} lebih besar dari maximal tonase ${
                        selectedHargaEkspedisi.max_tonase
                    }. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-2?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
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
                } else if (UpdateDetail3 && !status_edit) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-3`);
                    return;
                } else if (totalDebit3 - totalKredit3 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-3`);
                    return;
                } else if (hasDuplicates && kontrakValue3 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-3`);
                    return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi < selectedHargaEkspedisi.min_tonase) {
                    const confirmMessage = `Berat Tonase ${frmNumber(TotalSemuaBesi + TotalSemuaNonBesi)} lebih kecil dari minimal tonase ${frmNumber(
                        selectedHargaEkspedisi.min_tonase
                    )}. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-3?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
                    return;
                    //jika hasil login di modal true maka lanjutkan, jika salah maka berhenti atau return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi > selectedHargaEkspedisi.max_tonase) {
                    const confirmMessage = `Berat Tonase ${TotalSemuaBesi + TotalSemuaNonBesi} lebih besar dari maximal tonase ${
                        selectedHargaEkspedisi.max_tonase
                    }. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-3?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
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
                } else if (UpdateDetail4 && !status_edit) {
                    myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal. DO-4`);
                    return;
                } else if (totalDebit4 - totalKredit4 !== 0) {
                    myAlert(`Jurnal masih ada selisih. DO-4`);
                    return;
                } else if (hasDuplicates && kontrakValue4 === 'Kontrak') {
                    myAlert(`Terdapat No. Kontrak yang sama dalam satu dokumen. DO-4`);
                    return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi < selectedHargaEkspedisi.min_tonase) {
                    const confirmMessage = `Berat Tonase ${frmNumber(TotalSemuaBesi + TotalSemuaNonBesi)} lebih kecil dari minimal tonase ${frmNumber(
                        selectedHargaEkspedisi.min_tonase
                    )}. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-4?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
                    return;
                    //jika hasil login di modal true maka lanjutkan, jika salah maka berhenti atau return;
                } else if (!Auth && TotalSemuaBesi + TotalSemuaNonBesi > selectedHargaEkspedisi.max_tonase) {
                    const confirmMessage = `Berat Tonase ${TotalSemuaBesi + TotalSemuaNonBesi} lebih besar dari maximal tonase ${
                        selectedHargaEkspedisi.max_tonase
                    }. \nApakah transaksi akan dilanjutkan dengan proses otorisasi DO-4?`;
                    if (!Auth) {
                        if (!confirm(confirmMessage)) {
                            return;
                        }
                    }
                    console.log('LANJUT');
                    setModalOtorisasi(true);
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
            } else if (!selectedHargaEkspedisi) {
                myAlert(`Silahkan pilih Harga Ekspedisi terlebih dulu.`);
            } else if (!selectedToleransi) {
                myAlert(`Silahkan pilih Toleransi terlebih dulu.`);
                //PEDIODE AKUNTANSI
            } else if (moment().format('YYYY-MM-DD') < formatPeriode) {
                myAlert(`Tanggal transaksi tidak dalam periode akuntansi.`);
            } else {
                console.log('LOLOS');

                // ========START SAVING =====================================
                if (isSaving) return; // Menghindari double input
                setIsSaving(true);

                let defaultNoMB: any;
                let defaultNoMB2: any;
                let defaultNoMB3: any;
                let defaultNoMB4: any;
                // NoMB masuk
                const cekDataTtb = await cekDataDiDatabase(kode_entitas, 'tb_m_mb', 'no_mb', NoMB, token);
                if (cekDataTtb) {
                    // jsonData.no_ttb = defaultNoTtb;
                    await generateNU(kode_entitas, NoMB, '23', moment().format('YYYYMM'));
                }
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

                // ==============LOLOS DO-1================
                //?Detail Barang
                const modifiedDetailJsonDO1: any = modifiedDetailJson1.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                    id_pmb: item.id_pmb === null ? 0 : item.id_pmb,
                    id_fpb: item.id_fpb === null ? 0 : item.id_fpb,
                    fbm_id_so: item.fbm_id_so === null ? 0 : item.fbm_id_so,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO1 = dataJurnal.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    jumlah_rp: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
                    jumlah_mu: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
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
                    harga_eks: selectedHargaEkspedisi.harga,
                    harga_tambahan: selectedHargaEkspedisi.harga_tambahan,
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
                    jenis_mb: jenisDO, // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO1,
                    jurnal: modifiedDetailJurnalDO1,
                };
                // ==============END LOLOS DO-1================

                // ==============LOLOS DO-2================
                //?Detail Barang
                const modifiedDetailJsonDO2: any = modifiedDetailJson2.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                    id_pmb: item.id_pmb === null ? 0 : item.id_pmb,
                    id_fpb: item.id_fpb === null ? 0 : item.id_fpb,
                    fbm_id_so: item.fbm_id_so === null ? 0 : item.fbm_id_so,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO2 = dataJurnal2.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    jumlah_rp: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
                    jumlah_mu: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
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
                    harga_eks: selectedHargaEkspedisi.harga,
                    harga_tambahan: selectedHargaEkspedisi.harga_tambahan,
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
                    jenis_mb: jenisDO, // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO2,
                    jurnal: modifiedDetailJurnalDO2,
                };
                // ==============END LOLOS DO-2================

                // ==============LOLOS DO-3================
                //?Detail Barang
                const modifiedDetailJsonDO3: any = modifiedDetailJson3.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                    id_pmb: item.id_pmb === null ? 0 : item.id_pmb,
                    id_fpb: item.id_fpb === null ? 0 : item.id_fpb,
                    fbm_id_so: item.fbm_id_so === null ? 0 : item.fbm_id_so,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO3 = dataJurnal3.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    jumlah_rp: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
                    jumlah_mu: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
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
                    harga_eks: selectedHargaEkspedisi.harga,
                    harga_tambahan: selectedHargaEkspedisi.harga_tambahan,
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
                    jenis_mb: jenisDO, // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO3,
                    jurnal: modifiedDetailJurnalDO3,
                };
                // ==============END LOLOS DO-3================

                // ==============LOLOS DO-4================
                //?Detail Barang
                const modifiedDetailJsonDO4: any = modifiedDetailJson4.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                    id_pmb: item.id_pmb === null ? 0 : item.id_pmb,
                    id_fpb: item.id_fpb === null ? 0 : item.id_fpb,
                    fbm_id_so: item.fbm_id_so === null ? 0 : item.fbm_id_so,
                }));
                console.log('sampe sini');

                //?Detail Jurnal
                const modifiedDetailJurnalDO4 = dataJurnal4.nodes.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    jumlah_rp: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
                    jumlah_mu: Math.abs(SpreadNumber(item.kredit_rp)) > 0 ? Math.abs(SpreadNumber(item.kredit_rp)) * -1 : SpreadNumber(item.debet_rp),
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
                    harga_eks: selectedHargaEkspedisi.harga,
                    harga_tambahan: selectedHargaEkspedisi.harga_tambahan,
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
                    jenis_mb: jenisDO, // kirim gudang //MB untuk MB
                    pengemudi: selectedPengemudi,
                    do_kode_sj: '',
                    detail: modifiedDetailJsonDO4,
                    jurnal: modifiedDetailJurnalDO4,
                };
                // ==============END LOLOS DO-4================

                const jsonMULTIPLE: any = {
                    entitas: kode_entitas,
                    pembatalan: 'N',
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
                if (status_edit == true) {
                    //EDIT API
                    console.log(JSON);
                    var responseAPI = await axios.patch(`${apiUrl}/erp/update_mb`, jsonMULTIPLE);
                } else {
                    //SAVE API
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
                                                    "entitas": kode_entitas,
                                                    "kode_dokumen": kodeDokumen[i],
                                                    "nip1": nipUser,
                                                    "nip2": null,
                                                    "nip3": null,
                                                    "nip4": null,
                                                    "nip5": null,
                                                    "nip6": null
                                                });
                        console.log(auditResponse, 'auditResponse');
                    }
                    withReactContent(swal)
                        .fire({
                            title: ``,
                            html:
                                status_edit == true
                                    ? '<p style="font-size:12px">Perubahan Data Mutasi Barang berhasil disimpan</p>'
                                    : '<p style="font-size:12px">Data Mutasi Barang berhasil disimpan</p>',
                            target: '#dialogMBList',
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
                // ======== END START SAVING =====================================
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
        } finally {
            setIsSaving(false); // Setelah proses penyimpanan selesai
        }
    };

    const handleOtorisasiUserFDO1 = async (user: any, pass: any) => {
        const resetState = () => {
            setUser('');
            setPass('');
            setModalOtorisasi(false);
        };

        const showAlert = (message: any) => {
            myAlert(message);
            resetState();
            return false;
        };

        try {
            const loginResponse = await axios.get(`${apiUrl}/erp/login`, {
                params: { entitas: kode_entitas, user, pwd: pass },
            });

            if (loginResponse.data.status && loginResponse.data.data.length > 0) {
                const { userid } = loginResponse.data.data[0];
                const approvalResponse = await axios.get(`${apiUrl}/erp/users_app`, {
                    params: { entitas: kode_entitas, param1: userid },
                });

                const { fdo_app1, fdo_app2, kode_user } = approvalResponse.data.data[0];
                if (fdo_app1 === 'Y' || fdo_app2 === 'Y' || kode_user === 'ADMIN') {
                    resetState();
                    saveDoc(true, false);
                    return true;
                } else {
                    return showAlert('Anda harus mempunyai hak approval.');
                }
            } else {
                return showAlert('User atau password salah.');
            }
        } catch (error) {
            return showAlert('Terjadi kesalahan saat melakukan proses login.');
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
            height="80%"
            visible={isOpen}
            close={() => {
                console.log('closeDialog');
                //hapus
                dialogClose();
                gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                gridMBList.refresh();
            }}
            header={
                jenisDO === 'KG'
                    ? status_edit === false
                        ? 'DO Pabrik Ekspedisi *Kirim Gudang'
                        : 'DO Pabrik Ekspedisi *Kirim Gudang (EDIT)'
                    : status_edit === false
                    ? 'DO Pabrik Ekspedisi *Kirim Langsung'
                    : 'DO Pabrik Ekspedisi *Kirim Langsung (EDIT)'
            }
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            // target="#main-target"
            enableResize={true}
        >
            <div style={{ minWidth: '70%', overflow: 'auto' }} id="target-modal">
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
                                                    {/* <th style={{ width: '13%' }}>Pengemudi</th> */}
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
                                                    {/* <td>
                                                        <div className="flex">
                                                            <DropDownListComponent
                                                                style={{ fontSize: '12px' }}
                                                                id="gudang"
                                                                className="form-select"
                                                                dataSource={listPengemudi.map((data: any) => ({ value: data.pengemudi }))}
                                                                fields={{ value: 'value' }}
                                                                placeholder={status_edit == true ? selectedPengemudi : '-- Silahkan pilih pengemudi --'}
                                                                select={(e) => {
                                                                    setSelectedPengemudi(e.itemData.value);
                                                                }}
                                                                readonly={status_edit == true ? true : false}
                                                            />
                                                        </div>
                                                    </td> */}
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
                                                                            if (selectedHead === 'DO-1' && gridMBList.dataSource.length > 0) {
                                                                                DetailBarangDeleteAll('tanpakonfirmasi');
                                                                            } else {
                                                                                console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                setSelectedGudang({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                                                handleDetail_EndEdit();
                                                                                gridMBList.refresh();
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
                                                                            gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                                                                            handleDetail_EndEdit();
                                                                            gridMBList.refresh();
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
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: true,
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
                                                            <ColumnDirective field="id_mb" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="155"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="295"
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
                                                                allowEditing={status_edit ? false : true}
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
                                                                field="berat_cetak"
                                                                format="N2"
                                                                headerText="Berat Cetak Ekspedisi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={true}
                                                                template={beratCetakTemplate}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="210"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
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
                                                    <textarea value={keterangan} className='w-full h-full text-xs' rows={3} onChange={(e: any) => setKeterangan(e.target.value)} />
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
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: true,
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
                                                            <ColumnDirective field="id_mb" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="155"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="295"
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
                                                                allowEditing={status_edit ? false : true}
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
                                                                field="berat_cetak"
                                                                format="N2"
                                                                headerText="Berat Cetak Ekspedisi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={true}
                                                                template={beratCetakTemplate}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="210"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
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
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: true,
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
                                                            <ColumnDirective field="id_mb" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="155"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="295"
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
                                                                allowEditing={status_edit ? false : true}
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
                                                                field="berat_cetak"
                                                                format="N2"
                                                                headerText="Berat Cetak Ekspedisi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={true}
                                                                template={beratCetakTemplate}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="210"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
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
                                                            // allowEditing: status_edit == true ? false : true,
                                                            allowEditing: true,
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
                                                            <ColumnDirective field="id_mb" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                            <ColumnDirective
                                                                field="no_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="155"
                                                                clipMode="EllipsisWithTooltip"
                                                                editTemplate={editTemplateMasterItem_No}
                                                            />
                                                            <ColumnDirective
                                                                field="nama_barang"
                                                                // isPrimaryKey={true}
                                                                headerText="Nama Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="295"
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
                                                                allowEditing={status_edit ? false : true}
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
                                                                field="berat_cetak"
                                                                format="N2"
                                                                headerText="Berat Cetak Ekspedisi"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={true}
                                                                template={beratCetakTemplate}
                                                            />
                                                            <ColumnDirective
                                                                field="no_kontrak"
                                                                headerText="No. Kontrak Pabrik / Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="210"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
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
                                                            //  allowEditing: status_edit == true ? false : true,
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
                                            <th style={{ width: '12%', fontWeight: `bold`, color: `black` }}>Harga Eks</th>
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
                                                    dataSource={listVia.map((data: any) => ({ value: data.via }))}
                                                    // dataSource={[{ value: 'ARMADA CUSTOMER' }, { value: 'ARMADA KENCANA' }, { value: 'ARMADA PABRIK' }]}
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
                                        {/* harga eks */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey', color: 'black' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    style={{ height: 30, width: '100%', color: 'black' }}
                                                    type="text"
                                                    value={!selectedHargaEkspedisi ? '' : frmNumber(selectedHargaEkspedisi.harga)}
                                                    readOnly={true}
                                                />
                                                <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                    <FontAwesomeIcon
                                                        icon={faMagnifyingGlass}
                                                        className="ml-2"
                                                        width="15"
                                                        height="15"
                                                        onClick={() => {
                                                            //tambah blocking via dan jenis mobil
                                                            if (status_edit !== true) {
                                                                if (!Via) {
                                                                    myAlert('Silahkan pilih via ekspedisi terlebih dulu.');
                                                                } else if (!selectedJenisMobil) {
                                                                    myAlert('Silahkan pilih jenis mobil terlebih dulu.');
                                                                } else {
                                                                    setModalHargaEkspedisi(true);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </button>
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
                                                <th colSpan={3} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Customer
                                                </th>
                                                <th colSpan={1} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Toleransi
                                                </th>
                                                <th colSpan={1} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Harga Tambahan
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th colSpan={3} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Toleransi
                                                </th>
                                                <th colSpan={2} style={{ fontWeight: `bold`, color: `black` }}>
                                                    Harga Tambahan
                                                </th>
                                            </>
                                        )}
                                    </tr>
                                    <tr>
                                        {jenisDO === 'KL' ? (
                                            <>
                                                <td colSpan={3} style={{ textAlign: 'left', border: '1px solid grey' }}>
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
                                                <td colSpan={1} style={{ textAlign: 'left', border: '1px solid grey' }}>
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
                                                <td colSpan={1} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            style={{ height: 30, width: '100%', color: 'black' }}
                                                            type="text"
                                                            value={!selectedHargaEkspedisi ? '' : frmNumber(selectedHargaEkspedisi.harga_tambahan)}
                                                            readOnly={true}
                                                        />
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td colSpan={3} style={{ textAlign: 'left', border: '1px solid grey' }}>
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
                                                <td colSpan={2} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            style={{ height: 30, width: '100%', color: 'black' }}
                                                            type="text"
                                                            value={!selectedHargaEkspedisi ? '' : frmNumber(selectedHargaEkspedisi.harga_tambahan)}
                                                            readOnly={true}
                                                        />
                                                    </div>
                                                </td>
                                            </>
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
                            // gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                            // gridMBList.refresh();
                        }}
                    />
                    {/* {jenisDO !== 'KL' || status_edit != true ? ( */}
                    <ButtonComponent
                        id="buSimpanDokumen18"
                        content="Simpan"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            const isPastDate = moment(tglMB).isBefore(moment(), 'day'); // cek lebih kecil dari hari ini
                            if (status_edit) {
                                saveDoc(false, isPastDate);
                            } else {
                                saveDoc(false, false); // baru
                            }
                        }}
                    />
                    {/* ) : null} */}
                </div>
                {/* ================= End Tombol action dokumen ==================== */}

                {/* MODAL DAFTAR BARANG */}
                {modalDaftarBarang && (
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
                                console.log(args.data);
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
                )}
                {/* END MODAL DAFTAR BARANG */}

                {/* MODAL DAFTAR BARANG PB KONTRAK PABRIK*/}
                {modalDaftarBarangPBKontrak && (
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
                                    // setSearchNamaItemKontrak('');
                                    // const value: any = args.value;
                                    // setSearchNoItemKontrak(value);
                                    HandleSearchNoAkun(args.value, setSearchNoItemKontrak, setDaftarBarangPBKontrak, originalDataBrangPBKontrak);
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
                                    HandleSearchNamaItem(args.value, setSearchNamaItemKontrak, setDaftarBarangPBKontrak, originalDataBrangPBKontrak);
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
                                console.log(args.data);
                                setSelectedBarang(args.data);
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
                )}
                {/* END MODAL DAFTAR BARANG PB KONTRAK PABRIK */}

                {/* MODAL CUSTOMER */}
                {modalCustRow && (
                    <DialogComponent
                        id="dialogDaftarCustomer"
                        target="#target-modal"
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
                            dataSource={dsDaftarCustomer}
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
                )}
                {/* END MODAL CUSTOMER */}

                {/* MODAL DAFTAR SUPPLIER */}
                {modalSupplierRow && (
                    <DialogComponent
                        // ref={(s) => (gridDaftarSupplier = s)}
                        // id="dialogDaftarBarangJadi"
                        target="#target-modal"
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
                )}
                {/* END MODAL SUUPLIER */}

                {/* MODAL AKUN JURNAL */}
                {modalAkunJurnal && (
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
                            // gridLines={'Both'}
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
                )}
                {/* END MODAL AKUN JURNAL */}

                {/* MODAL DAFTAR SO */}
                {modalListSO && (
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
                )}
                {/* END MODAL SO */}

                {/* MODAL HARGA EKSEDISI */}
                {modalHargaEkspedisi && (
                    <DialogComponent
                        // ref={(s) => (gridDaftarSupplier = s)}
                        // id="dialogDaftarBarangJadi"
                        target="#dialogMBList"
                        style={{ position: 'fixed' }}
                        header={`Daftar Harga Ekspedisi - ${Via}`}
                        visible={modalHargaEkspedisi}
                        isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        enableResize={true}
                        //resizeHandles={['All']}
                        allowDragging={true}
                        showCloseIcon={true}
                        width="850"
                        height="444"
                        // buttons={buttonDaftarBarangJadi}
                        position={{ X: 'center', Y: 'center' }}
                        close={() => {
                            setModalHargaEkspedisi(false);
                        }}
                        closeOnEscape={true}
                    >
                        <GridComponent
                            // id="gridDaftarBarangJadi"
                            locale="id"
                            style={{ width: '100%', height: '78%' }}
                            // ref={(g) => (gridDaftarBarang = g)}
                            dataSource={listDataHargaEkspedisi}
                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                            rowHeight={22}
                            width={'100%'}
                            height={'316'}
                            allowResizing={true}
                            rowSelecting={(args: any) => {
                                console.log(args.data);
                                setSelectedHargaEkspedisi(args.data);
                            }}
                            recordDoubleClick={(args: any) => {
                                const selectedItems = args.rowData;
                                setSelectedHargaEkspedisi(selectedItems);
                                setModalHargaEkspedisi(false);
                            }}
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="nama_jarak" headerText="Nama Jarak" headerTextAlign="Center" textAlign="Left" width="170" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="jenis_mobil" headerText="Jenis Mobil" headerTextAlign="Center" textAlign="Left" width="60" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="kirim" headerText="Jenis Kirim" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective format="N2" field="harga" headerText="Harga" headerTextAlign="Center" textAlign="Right" width="60" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective format="N2" field="harga_tambahan" headerText="Harga Tambahan" headerTextAlign="Center" textAlign="Right" width="60" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective format="N2" field="max_tonase" headerText="Max Tonase (Kg)" headerTextAlign="Center" textAlign="Right" width="60" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective format="N2" field="min_tonase" headerText="Min Tonase (Kg)" headerTextAlign="Center" textAlign="Right" width="60" clipMode="EllipsisWithTooltip" />
                            </ColumnsDirective>
                            <Inject services={[Selection]} />
                        </GridComponent>
                        <ButtonComponent
                            id="buBatalDokumen1"
                            content="Batal"
                            cssClass="e-primary e-small"
                            // iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 50, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                setModalHargaEkspedisi(false);
                                setSelectedHargaEkspedisi('');
                            }}
                        />
                        <ButtonComponent
                            id="buSimpanDokumen15"
                            content="Pilih"
                            cssClass="e-primary e-small"
                            // iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 50, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                if (selectedHargaEkspedisi) {
                                    setModalHargaEkspedisi(false);
                                } else {
                                    myAlert('Silahkan pilih Harga terlebih dulu');
                                }
                            }}
                        />
                    </DialogComponent>
                )}
                {/* END MODAL HARGA EKSPEDISI */}

                {/* MODAL OTORISASI USER */}
                {modalOtorisasi && (
                    <DialogComponent
                        target="#dialogMBList"
                        style={{ position: 'fixed' }}
                        header={`Otorisasi User`}
                        visible={modalOtorisasi}
                        isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        enableResize={true}
                        allowDragging={true}
                        showCloseIcon={true}
                        width="350"
                        height="300"
                        position={{ X: 'center', Y: 'center' }}
                        close={() => setModalOtorisasi(false)}
                        closeOnEscape={true}
                    >
                        <div style={{ padding: '10px' }}>
                            {/* <FontAwesomeIcon size="2x" icon={faKey} style={{ marginBottom: 10 }} /> */}
                            <div style={{ marginBottom: 10, marginTop: -10, fontWeight: 'bold', fontSize: 12 }}>
                                <div>Berat Tonase &lt; Berat Min. Tonase Ekspedisi</div>
                            </div>
                            <div style={{ marginBottom: '20px', padding: '10px', display: 'flex', flexDirection: 'column', borderRadius: '5px', border: '1px solid #ccc' }}>
                                <label htmlFor="userid" style={{ marginBottom: '5px' }}>
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    id="userid"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    style={{ width: '100%', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                                />
                                <label htmlFor="userid" style={{ marginBottom: '5px' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    style={{ width: '100%', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginTop: -10, color: 'red', fontSize: 10, marginLeft: 5 }}>
                                <div>Anda harus mempunya hak App FDO1.</div>
                                <div>Silahkan masukan User dan Password Anda.</div>
                            </div>
                        </div>
                        <ButtonComponent
                            id="buBatalDokumen1"
                            content="Batal"
                            cssClass="e-primary e-small"
                            style={{ float: 'right', width: '90px', marginTop: 10, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                setModalOtorisasi(false);
                                setUser('');
                                setPass('');
                            }}
                        />
                        <ButtonComponent
                            id="buSimpanDokumen15"
                            content="OK"
                            cssClass="e-primary e-small"
                            style={{ float: 'right', width: '90px', marginTop: 10, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            type="submit"
                            onClick={() => handleOtorisasiUserFDO1(user, pass)}
                        />
                    </DialogComponent>
                )}
                {/* END MODAL OTORISASI USER */}
            </div>
        </DialogComponent>
    );
};

export default DOPabrikEkspedisi;

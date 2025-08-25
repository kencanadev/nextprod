import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IRootState } from '../../store';
import { toggleLocale, toggleTheme, toggleSidebar, toggleRTL, setPageTitle } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faRoadLock } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
    faUserLock,
    faKey,
    faBuilding,
    faCog,
    faUserCog,
    faInbox,
    faUser,
    faDiagramProject,
    faTableList,
    faUserTie,
    faCircleCheck,
    faClipboardCheck,
    faCommentSms,
    faRepeat,
    faArrowRightFromBracket,
    faFileLines,
    faCartShopping,
    faWarehouse,
    faScaleBalanced,
    faDiceD6,
    faTableCellsLarge,
    faHome,
} from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import PilihPraModal from '../../pages/kcn/ERP/inventory/pb/modal/pilihprapb';
import { useSession } from '@/pages/api/sessionContext';
import DaftarLibur from '@/pages/kcn/ERP/master/daftar-libur';
import PengemudiDialog from '@/pages/kcn/ERP/master/Pengemudi';
import FrmDepartemen from '@/pages/kcn/ERP/master/departemen';
import DaftarPropinsiKota from '@/pages/kcn/ERP/master/daftar-propinsi-kota';
import KecamatanKelurahanDialog from '@/pages/kcn/ERP/master/daftar-kecamatan-kelurahan';
import DaftarDivisiPenjualanPage from '@/pages/kcn/ERP/master/daftar-divisi-penjualan';
import BankDialog from '@/pages/kcn/ERP/master/daftar-bank';
import DaftarAlasan from '@/pages/kcn/ERP/daftar-alasan';
import AnggaranAkun from '@/pages/kcn/ERP/master/anggaranAkun';

const Header: any = () => {
    const router = useRouter();
    const { sessionData, isLoading, logout } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const nama_user = sessionData?.nama_user ?? '';
    const tipe = sessionData?.tipe ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';

    if (isLoading) {
        return;
    }
    let baseUrl: any;
    useEffect(() => {
        dispatch(setPageTitle(kode_entitas));
    });

    if (tipe === 'ERP') {
        baseUrl = '/kcn/ERP';
    } else if (tipe === 'FNB') {
        baseUrl = '/kcn/FNB';
    }

    type Permission = {
        kode_menu: any;
        create: boolean;
        edit: boolean;
        delete: boolean;
        cetak: boolean;
    };

    type UserAccess = {
        user: any;
        permissions: Permission[];
    }[];

    const [userAccess, setUserAccess] = useState<UserAccess>([]);
    const [daftarLiburDlg, setDaftarLiburDlg] = useState(false);
    const [pengemudiDialog, setPengemudiDialog] = useState(false);
    const [departemenDialog, setDepartemenDialog] = useState(false);
    const [daftarPropinsiKota, setDaftarPropinsiKota] = useState(false);
    const [kecamatanKelurahanDlg, setKecamatanKelurahanDlg] = useState(false);
        const [daftarDivisiPenjualan, setDaftarDivisiPenjualan] = useState(false);
    const [bankDlg, setBankDlg] = useState(false);
    const [daftarAlasan, setDaftarAlasan] = useState(false);
    const [anggaranAkunDialog, setAnggaranAkunDialog] = useState(false);

    //console.log(userAccess, 'userAccess');
    //console.log(kode_user, 'kode_user');

    // //Pakai API Local
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:4001/erp/menu_user?entitas=999');
    //             const processedData = response.data.data.reduce((acc: any, item: any) => {
    //                 const existingUser = acc.find((data: any) => data.user === item.kode_user);
    //                 const permission = {
    //                     kode_menu: item.kode_menu,
    //                     create: item.baru === 'Y',
    //                     edit: item.edit === 'Y',
    //                     delete: item.hapus === 'Y',
    //                     cetak: item.cetak === 'Y',
    //                 };
    //                 if (existingUser) {
    //                     existingUser.permissions.push(permission);
    //                 } else {
    //                     acc.push({
    //                         user: item.kode_user,
    //                         permissions: [permission],
    //                     });
    //                 }
    //                 return acc;
    //             }, []);
    //             setUserAccess(processedData);
    //         } catch (error) {
    //             console.error('Error fetching data', error);
    //         }
    //     };
    //     fetchData();
    // }, []);

    //Pakai API Server
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    useEffect(() => {
        const fetchData = async () => {
            if (kode_entitas) {
                try {
                    const kodeUser = userid.toUpperCase() === 'ADMINISTRATOR' ? 'all' : kode_user;
                    const response = await axios.get(`${apiUrl}/erp/user_menu_header?entitas=${kode_entitas}&kode=${kodeUser}`);
                    const processedData = response.data.data.reduce((acc: any, item: any) => {
                        const existingUser = acc.find((data: any) => data.user === item.kode_user);
                        const permission = {
                            kode_menu: item.kode_menu,
                            create: item.baru === 'Y',
                            edit: item.edit === 'Y',
                            delete: item.hapus === 'Y',
                            cetak: item.cetak === 'Y',
                        };
                        if (existingUser) {
                            existingUser.permissions.push(permission);
                        } else {
                            acc.push({
                                user: item.kode_user,
                                permissions: [permission],
                            });
                        }
                        return acc;
                    }, []);
                    console.log('processedData = ', processedData);
                    setUserAccess(processedData);
                } catch (error) {
                    console.error('Error fetching data', error);
                }
            }
        };
        fetchData();
    }, [kode_user]);

    // const navigateToLink = (kode_menu: string, kode_user: string) => {
    //     const user = userAccess.find((user) => user.user === kode_user);
    //     if (user) {
    //         const userPermissions = user.permissions.find((permission: Permission) => permission.kode_menu === kode_menu);
    //         if (userPermissions && userPermissions.kode_menu === '21401') {
    //             router.push({
    //                 pathname: '/kcn/ERP/master/gudang/listGudang',
    //                 query: { userPermissions: JSON.stringify(userPermissions) },
    //             });
    //         }
    //     }
    // };

    const navigateToLink = (kode_menu: string, kode_user: string, fullPath: any) => {
        const user = userAccess.find((user) => user.user === kode_user);
        //pemeliharaan
        if (user) {
            const userPermissions = user.permissions.find((permission: Permission) => permission.kode_menu === kode_menu);
            if (
                //kelompok 2
                (userPermissions && userPermissions.kode_menu === '20100') ||
                (userPermissions && userPermissions.kode_menu === '20201') ||
                // Group 20200
                // (userPermissions && userPermissions.kode_menu === '20202') ||
                // (userPermissions && userPermissions.kode_menu === '20203') ||
                // (userPermissions && userPermissions.kode_menu === '20204') ||
                (userPermissions && userPermissions.kode_menu === '20300') ||
                // (userPermissions && userPermissions.kode_menu === '20400') ||
                // Group 20500
                // (userPermissions && userPermissions.kode_menu === '20501') ||
                // (userPermissions && userPermissions.kode_menu === '20502') ||
                // (userPermissions && userPermissions.kode_menu === '20503') ||
                // (userPermissions && userPermissions.kode_menu === '20504') ||
                // (userPermissions && userPermissions.kode_menu === '20505') ||
                // (userPermissions && userPermissions.kode_menu === '20506') ||
                // (userPermissions && userPermissions.kode_menu === '20507') ||
                (userPermissions && userPermissions.kode_menu === '20600') ||
                // (userPermissions && userPermissions.kode_menu === '20700') ||
                (userPermissions && userPermissions.kode_menu === '20800') ||
                // (userPermissions && userPermissions.kode_menu === '20900') ||
                // (userPermissions && userPermissions.kode_menu === '21000') ||
                (userPermissions && userPermissions.kode_menu === '21100') ||
                (userPermissions && userPermissions.kode_menu === '21200') ||
                // Group 21300
                // (userPermissions && userPermissions.kode_menu === '21301') ||
                // (userPermissions && userPermissions.kode_menu === '21302') ||
                // (userPermissions && userPermissions.kode_menu === '21303') ||
                // (userPermissions && userPermissions.kode_menu === '21304') ||
                // (userPermissions && userPermissions.kode_menu === '21307') ||
                // Group 21400
                (userPermissions && userPermissions.kode_menu === '21401') ||
                // (userPermissions && userPermissions.kode_menu === '21402') ||
                (userPermissions && userPermissions.kode_menu === '21403') ||
                (userPermissions && userPermissions.kode_menu === '21404') ||
                (userPermissions && userPermissions.kode_menu === '21405') ||
                (userPermissions && userPermissions.kode_menu === '21406') ||
                // (userPermissions && userPermissions.kode_menu === '21407') ||
                // (userPermissions && userPermissions.kode_menu === '21408') ||
                // (userPermissions && userPermissions.kode_menu === '21409') ||
                // (userPermissions && userPermissions.kode_menu === '21410') ||
                // (userPermissions && userPermissions.kode_menu === '21411') ||
                // (userPermissions && userPermissions.kode_menu === '21412') ||
                // (userPermissions && userPermissions.kode_menu === '21413') ||
                // (userPermissions && userPermissions.kode_menu === '21414') ||
                // (userPermissions && userPermissions.kode_menu === '21415') ||
                // (userPermissions && userPermissions.kode_menu === '21416') ||
                // (userPermissions && userPermissions.kode_menu === '21417') ||
                // (userPermissions && userPermissions.kode_menu === '21418') ||
                // (userPermissions && userPermissions.kode_menu === '21419') ||
                // (userPermissions && userPermissions.kode_menu === '21420') ||
                // (userPermissions && userPermissions.kode_menu === '21430') ||
                (userPermissions && userPermissions.kode_menu === '21500') ||
                // (userPermissions && userPermissions.kode_menu === '21600') ||
                // (userPermissions && userPermissions.kode_menu === '21605') ||
                // Group 21700
                // (userPermissions && userPermissions.kode_menu === '21701') ||
                // (userPermissions && userPermissions.kode_menu === '21702') ||
                // (userPermissions && userPermissions.kode_menu === '21703') ||
                // (userPermissions && userPermissions.kode_menu === '21704') ||
                // (userPermissions && userPermissions.kode_menu === '21800') ||
                //kelompok 3
                (userPermissions && userPermissions.kode_menu === '30100') ||
                (userPermissions && userPermissions.kode_menu === '30200') ||
                (userPermissions && userPermissions.kode_menu === '30300') ||
                (userPermissions && userPermissions.kode_menu === '30400') ||
                (userPermissions && userPermissions.kode_menu === '30500') ||
                // (userPermissions && userPermissions.kode_menu === '30600') ||
                // (userPermissions && userPermissions.kode_menu === '30700') ||
                (userPermissions && userPermissions.kode_menu === '30800') ||
                (userPermissions && userPermissions.kode_menu === '30900') ||
                // Group 31100
                (userPermissions && userPermissions.kode_menu === '31101') ||
                (userPermissions && userPermissions.kode_menu === '31102') ||
                (userPermissions && userPermissions.kode_menu === '31103') ||
                (userPermissions && userPermissions.kode_menu === '31104') ||
                (userPermissions && userPermissions.kode_menu === '31105') ||
                (userPermissions && userPermissions.kode_menu === '31106') ||
                // Group 31200
                (userPermissions && userPermissions.kode_menu === '31201') ||
                (userPermissions && userPermissions.kode_menu === '31202') ||
                (userPermissions && userPermissions.kode_menu === '31203') ||
                (userPermissions && userPermissions.kode_menu === '31204') ||
                (userPermissions && userPermissions.kode_menu === '31300') ||
                (userPermissions && userPermissions.kode_menu === '31400') ||
                (userPermissions && userPermissions.kode_menu === '31500') ||
                (userPermissions && userPermissions.kode_menu === '31600') ||
                (userPermissions && userPermissions.kode_menu === '31700') ||
                (userPermissions && userPermissions.kode_menu === '31800') ||
                //kelmopok 4
                (userPermissions && userPermissions.kode_menu === '40100') ||
                (userPermissions && userPermissions.kode_menu === '40200') ||
                (userPermissions && userPermissions.kode_menu === '40300') ||
                (userPermissions && userPermissions.kode_menu === '40400') ||
                (userPermissions && userPermissions.kode_menu === '40500') ||
                (userPermissions && userPermissions.kode_menu === '40600') ||
                (userPermissions && userPermissions.kode_menu === '40700') ||
                (userPermissions && userPermissions.kode_menu === '40800') ||
                (userPermissions && userPermissions.kode_menu === '40900') ||
                // (userPermissions && userPermissions.kode_menu === '41000') ||
                // (userPermissions && userPermissions.kode_menu === '41100') ||
                // // Group 41200
                // (userPermissions && userPermissions.kode_menu === '41201') ||
                // (userPermissions && userPermissions.kode_menu === '41202') ||
                // (userPermissions && userPermissions.kode_menu === '41203') ||
                // (userPermissions && userPermissions.kode_menu === '41204') ||
                // Group 41300
                // (userPermissions && userPermissions.kode_menu === '41301') ||
                (userPermissions && userPermissions.kode_menu === '41302') ||
                (userPermissions && userPermissions.kode_menu === '41400') ||
                // kelompok 5
                (userPermissions && userPermissions.kode_menu === '50100') ||
                (userPermissions && userPermissions.kode_menu === '50200') ||
                (userPermissions && userPermissions.kode_menu === '50300') ||
                // (userPermissions && userPermissions.kode_menu === '50400') ||
                (userPermissions && userPermissions.kode_menu === '50500') ||
                // (userPermissions && userPermissions.kode_menu === '50501') ||
                // // Group 50600
                // (userPermissions && userPermissions.kode_menu === '50601') ||
                // (userPermissions && userPermissions.kode_menu === '50602') ||
                // (userPermissions && userPermissions.kode_menu === '50603') ||
                // (userPermissions && userPermissions.kode_menu === '50604') ||
                // (userPermissions && userPermissions.kode_menu === '50605') ||
                // (userPermissions && userPermissions.kode_menu === '50606') ||
                (userPermissions && userPermissions.kode_menu === '50700') ||
                // Group 50701
                (userPermissions && userPermissions.kode_menu === '50701') ||
                // (userPermissions && userPermissions.kode_menu === '50702') ||
                (userPermissions && userPermissions.kode_menu === '50703') ||
                // (userPermissions && userPermissions.kode_menu === '50704') ||
                // (userPermissions && userPermissions.kode_menu === '50705') ||
                // (userPermissions && userPermissions.kode_menu === '50706') ||
                // (userPermissions && userPermissions.kode_menu === '50707') ||
                // (userPermissions && userPermissions.kode_menu === '50708') ||
                // (userPermissions && userPermissions.kode_menu === '50709') ||
                // (userPermissions && userPermissions.kode_menu === '50710') ||
                // (userPermissions && userPermissions.kode_menu === '50800') ||
                // (userPermissions && userPermissions.kode_menu === '50900') ||
                // (userPermissions && userPermissions.kode_menu === '51000') ||
                // (userPermissions && userPermissions.kode_menu === '51100') ||
                //kelompok 6
                // Group 60100
                (userPermissions && userPermissions.kode_menu === '60101') ||
                (userPermissions && userPermissions.kode_menu === '60102') ||
                (userPermissions && userPermissions.kode_menu === '60103') ||
                // (userPermissions && userPermissions.kode_menu === '60104') ||
                // Group 60200
                (userPermissions && userPermissions.kode_menu === '60201') ||
                (userPermissions && userPermissions.kode_menu === '60202') ||
                (userPermissions && userPermissions.kode_menu === '60203') ||
                (userPermissions && userPermissions.kode_menu === '60204') ||
                (userPermissions && userPermissions.kode_menu === '60205') ||
                (userPermissions && userPermissions.kode_menu === '60206') ||
                (userPermissions && userPermissions.kode_menu === '60207') ||
                (userPermissions && userPermissions.kode_menu === '60210') ||
                // Group 60300
                (userPermissions && userPermissions.kode_menu === '60301') ||
                (userPermissions && userPermissions.kode_menu === '60302') ||
                (userPermissions && userPermissions.kode_menu === '60303') ||
                // (userPermissions && userPermissions.kode_menu === '60304') ||
                // (userPermissions && userPermissions.kode_menu === '60305') ||
                // (userPermissions && userPermissions.kode_menu === '60306') ||
                // Group 60400
                (userPermissions && userPermissions.kode_menu === '60401') ||
                (userPermissions && userPermissions.kode_menu === '60402') ||
                (userPermissions && userPermissions.kode_menu === '60403') ||
                (userPermissions && userPermissions.kode_menu === '60404') ||
                (userPermissions && userPermissions.kode_menu === '60405') ||
                (userPermissions && userPermissions.kode_menu === '60406') ||
                // Group 60500
                (userPermissions && userPermissions.kode_menu === '60501') ||
                (userPermissions && userPermissions.kode_menu === '60502') ||
                // (userPermissions && userPermissions.kode_menu === '60503') ||
                // (userPermissions && userPermissions.kode_menu === '60504') ||
                (userPermissions && userPermissions.kode_menu === '60505') ||
                // Group 60600
                (userPermissions && userPermissions.kode_menu === '60601') ||
                (userPermissions && userPermissions.kode_menu === '60602') ||
                // (userPermissions && userPermissions.kode_menu === '60603') ||
                // (userPermissions && userPermissions.kode_menu === '60604') ||
                (userPermissions && userPermissions.kode_menu === '60605') ||
                //kelompok 7
                // Group 70100
                (userPermissions && userPermissions.kode_menu === '70100') ||
                // (userPermissions && userPermissions.kode_menu === '70101') ||
                // (userPermissions && userPermissions.kode_menu === '70102') ||
                // (userPermissions && userPermissions.kode_menu === '70103') ||
                // (userPermissions && userPermissions.kode_menu === '70104') ||
                // (userPermissions && userPermissions.kode_menu === '70105') ||
                // (userPermissions && userPermissions.kode_menu === '70106') ||
                // (userPermissions && userPermissions.kode_menu === '70107') ||
                // (userPermissions && userPermissions.kode_menu === '70108') ||
                // (userPermissions && userPermissions.kode_menu === '70109') ||
                // (userPermissions && userPermissions.kode_menu === '70110') ||
                // (userPermissions && userPermissions.kode_menu === '70111') ||
                // (userPermissions && userPermissions.kode_menu === '70112') ||
                // (userPermissions && userPermissions.kode_menu === '70113') ||
                // (userPermissions && userPermissions.kode_menu === '70114') ||
                // (userPermissions && userPermissions.kode_menu === '70115') ||
                // (userPermissions && userPermissions.kode_menu === '70116') ||
                // (userPermissions && userPermissions.kode_menu === '70117') ||
                // (userPermissions && userPermissions.kode_menu === '70118') ||
                // (userPermissions && userPermissions.kode_menu === '70119') ||
                // (userPermissions && userPermissions.kode_menu === '70120') ||
                // (userPermissions && userPermissions.kode_menu === '70121') ||
                // (userPermissions && userPermissions.kode_menu === '70122') ||
                // (userPermissions && userPermissions.kode_menu === '70123') ||
                // (userPermissions && userPermissions.kode_menu === '70124') ||
                // (userPermissions && userPermissions.kode_menu === '70125') ||
                // (userPermissions && userPermissions.kode_menu === '70126') ||
                // (userPermissions && userPermissions.kode_menu === '70127') ||
                // (userPermissions && userPermissions.kode_menu === '70128') ||
                // Group 70200
                (userPermissions && userPermissions.kode_menu === '70200') ||
                // (userPermissions && userPermissions.kode_menu === '70201') ||
                // (userPermissions && userPermissions.kode_menu === '70202') ||
                // (userPermissions && userPermissions.kode_menu === '70203') ||
                // (userPermissions && userPermissions.kode_menu === '70204') ||
                // (userPermissions && userPermissions.kode_menu === '70205') ||
                // (userPermissions && userPermissions.kode_menu === '70206') ||
                // (userPermissions && userPermissions.kode_menu === '70207') ||
                // (userPermissions && userPermissions.kode_menu === '70208') ||
                // (userPermissions && userPermissions.kode_menu === '70209') ||
                // // Group 70300
                // (userPermissions && userPermissions.kode_menu === '70300') ||
                // (userPermissions && userPermissions.kode_menu === '70301') ||
                // (userPermissions && userPermissions.kode_menu === '70302') ||
                // (userPermissions && userPermissions.kode_menu === '70303') ||
                // (userPermissions && userPermissions.kode_menu === '70304') ||
                // (userPermissions && userPermissions.kode_menu === '70305') ||
                // (userPermissions && userPermissions.kode_menu === '70306') ||
                // (userPermissions && userPermissions.kode_menu === '70307') ||
                // (userPermissions && userPermissions.kode_menu === '70308') ||
                // (userPermissions && userPermissions.kode_menu === '70309') ||
                // (userPermissions && userPermissions.kode_menu === '70310') ||
                // (userPermissions && userPermissions.kode_menu === '70311') ||
                // (userPermissions && userPermissions.kode_menu === '70312') ||
                // (userPermissions && userPermissions.kode_menu === '70313') ||
                // (userPermissions && userPermissions.kode_menu === '70314') ||
                // (userPermissions && userPermissions.kode_menu === '70315') ||
                // (userPermissions && userPermissions.kode_menu === '70316') ||
                // (userPermissions && userPermissions.kode_menu === '70317') ||
                // (userPermissions && userPermissions.kode_menu === '70318') ||
                // (userPermissions && userPermissions.kode_menu === '70319') ||
                // (userPermissions && userPermissions.kode_menu === '70320') ||
                // (userPermissions && userPermissions.kode_menu === '70321') ||
                // (userPermissions && userPermissions.kode_menu === '70322') ||
                // (userPermissions && userPermissions.kode_menu === '70323') ||
                // (userPermissions && userPermissions.kode_menu === '70324') ||
                // // Group 70400
                // (userPermissions && userPermissions.kode_menu === '70400') ||
                // (userPermissions && userPermissions.kode_menu === '70401') ||
                // (userPermissions && userPermissions.kode_menu === '70402') ||
                // (userPermissions && userPermissions.kode_menu === '70403') ||
                // (userPermissions && userPermissions.kode_menu === '70404') ||
                // (userPermissions && userPermissions.kode_menu === '70405') ||
                // (userPermissions && userPermissions.kode_menu === '70406') ||
                // (userPermissions && userPermissions.kode_menu === '70407') ||
                // (userPermissions && userPermissions.kode_menu === '70408') ||
                // (userPermissions && userPermissions.kode_menu === '70409') ||
                // (userPermissions && userPermissions.kode_menu === '70410') ||
                // (userPermissions && userPermissions.kode_menu === '70411') ||
                // (userPermissions && userPermissions.kode_menu === '70412') ||
                // (userPermissions && userPermissions.kode_menu === '70413') ||
                // (userPermissions && userPermissions.kode_menu === '70414') ||
                // (userPermissions && userPermissions.kode_menu === '70415') ||
                // (userPermissions && userPermissions.kode_menu === '70416') ||
                // (userPermissions && userPermissions.kode_menu === '70417') ||
                // (userPermissions && userPermissions.kode_menu === '70418') ||
                // Group 70500
                (userPermissions && userPermissions.kode_menu === '70500') ||
                // (userPermissions && userPermissions.kode_menu === '70501') ||
                // (userPermissions && userPermissions.kode_menu === '70502') ||
                // (userPermissions && userPermissions.kode_menu === '70503') ||
                // (userPermissions && userPermissions.kode_menu === '70504') ||
                // (userPermissions && userPermissions.kode_menu === '70505') ||
                // Group 70600
                (userPermissions && userPermissions.kode_menu === '70600') ||
                // (userPermissions && userPermissions.kode_menu === '70601') ||
                // (userPermissions && userPermissions.kode_menu === '70602') ||
                // (userPermissions && userPermissions.kode_menu === '70603') ||
                // (userPermissions && userPermissions.kode_menu === '70604') ||
                // (userPermissions && userPermissions.kode_menu === '70605') ||
                // (userPermissions && userPermissions.kode_menu === '70606') ||
                // (userPermissions && userPermissions.kode_menu === '70607') ||
                // (userPermissions && userPermissions.kode_menu === '70608') ||
                // // Group 70700
                // (userPermissions && userPermissions.kode_menu === '70700') ||
                // (userPermissions && userPermissions.kode_menu === '70701') ||
                // (userPermissions && userPermissions.kode_menu === '70702') ||
                // (userPermissions && userPermissions.kode_menu === '70703') ||
                // (userPermissions && userPermissions.kode_menu === '70704') ||
                // (userPermissions && userPermissions.kode_menu === '70705') ||
                // (userPermissions && userPermissions.kode_menu === '70706') ||
                // (userPermissions && userPermissions.kode_menu === '70707') ||
                // (userPermissions && userPermissions.kode_menu === '70708') ||
                // (userPermissions && userPermissions.kode_menu === '70709') ||
                // (userPermissions && userPermissions.kode_menu === '70710') ||
                // (userPermissions && userPermissions.kode_menu === '70711') ||
                // (userPermissions && userPermissions.kode_menu === '70712') ||
                // (userPermissions && userPermissions.kode_menu === '70713') ||
                // (userPermissions && userPermissions.kode_menu === '70714') ||
                // (userPermissions && userPermissions.kode_menu === '70715') ||
                // (userPermissions && userPermissions.kode_menu === '70716') ||
                // // Group 70800
                // (userPermissions && userPermissions.kode_menu === '70800') ||
                // (userPermissions && userPermissions.kode_menu === '70801') ||
                // (userPermissions && userPermissions.kode_menu === '70802') ||
                // (userPermissions && userPermissions.kode_menu === '70803') ||
                // (userPermissions && userPermissions.kode_menu === '70804') ||
                // (userPermissions && userPermissions.kode_menu === '70805') ||
                // (userPermissions && userPermissions.kode_menu === '70806') ||
                // (userPermissions && userPermissions.kode_menu === '70807') ||
                // (userPermissions && userPermissions.kode_menu === '70808') ||
                // (userPermissions && userPermissions.kode_menu === '70809') ||
                // (userPermissions && userPermissions.kode_menu === '70810') ||
                // (userPermissions && userPermissions.kode_menu === '70811') ||
                // (userPermissions && userPermissions.kode_menu === '70812') ||
                // (userPermissions && userPermissions.kode_menu === '70813') ||
                // (userPermissions && userPermissions.kode_menu === '70814') ||
                // (userPermissions && userPermissions.kode_menu === '70815') ||
                // (userPermissions && userPermissions.kode_menu === '70816') ||
                // (userPermissions && userPermissions.kode_menu === '70817') ||
                // (userPermissions && userPermissions.kode_menu === '70818') ||
                // (userPermissions && userPermissions.kode_menu === '70819') ||
                // (userPermissions && userPermissions.kode_menu === '70820') ||
                // (userPermissions && userPermissions.kode_menu === '70821') ||
                // (userPermissions && userPermissions.kode_menu === '70822') ||
                // (userPermissions && userPermissions.kode_menu === '70823') ||
                // (userPermissions && userPermissions.kode_menu === '70824') ||
                // (userPermissions && userPermissions.kode_menu === '70825') ||
                // (userPermissions && userPermissions.kode_menu === '70826') ||
                // (userPermissions && userPermissions.kode_menu === '70827') ||
                // (userPermissions && userPermissions.kode_menu === '70828') ||
                // (userPermissions && userPermissions.kode_menu === '70829') ||
                // // Group 70900
                // (userPermissions && userPermissions.kode_menu === '70900') ||
                // (userPermissions && userPermissions.kode_menu === '70901') ||
                // (userPermissions && userPermissions.kode_menu === '70902') ||
                // (userPermissions && userPermissions.kode_menu === '70903') ||
                // (userPermissions && userPermissions.kode_menu === '70904') ||
                // (userPermissions && userPermissions.kode_menu === '70905') ||
                // (userPermissions && userPermissions.kode_menu === '70906') ||
                // (userPermissions && userPermissions.kode_menu === '70907') ||
                // (userPermissions && userPermissions.kode_menu === '70908') ||
                // (userPermissions && userPermissions.kode_menu === '70909') ||
                // (userPermissions && userPermissions.kode_menu === '70910') ||
                // (userPermissions && userPermissions.kode_menu === '70911') ||
                // (userPermissions && userPermissions.kode_menu === '70912') ||
                // (userPermissions && userPermissions.kode_menu === '70913') ||
                // (userPermissions && userPermissions.kode_menu === '70914') ||
                // (userPermissions && userPermissions.kode_menu === '70915') ||
                // (userPermissions && userPermissions.kode_menu === '70916') ||
                // (userPermissions && userPermissions.kode_menu === '70917') ||
                // (userPermissions && userPermissions.kode_menu === '70918') ||
                // (userPermissions && userPermissions.kode_menu === '70919') ||
                // (userPermissions && userPermissions.kode_menu === '70920') ||
                // // kelompok 8
                // (userPermissions && userPermissions.kode_menu === '80601') ||
                // (userPermissions && userPermissions.kode_menu === '80602') ||
                // (userPermissions && userPermissions.kode_menu === '80603') ||
                // (userPermissions && userPermissions.kode_menu === '80604') ||
                (userPermissions && userPermissions.kode_menu === '80100') ||
                // (userPermissions && userPermissions.kode_menu === '80200') ||
                // Group 80300
                (userPermissions && userPermissions.kode_menu === '80301') ||
                (userPermissions && userPermissions.kode_menu === '80400') ||
                (userPermissions && userPermissions.kode_menu === '80500') ||
                (userPermissions && userPermissions.kode_menu === '80700') ||
                // (userPermissions && userPermissions.kode_menu === '80800') ||
                // (userPermissions && userPermissions.kode_menu === '80900') ||
                (userPermissions && userPermissions.kode_menu === '81000') ||
                // Group 81090
                (userPermissions && userPermissions.kode_menu === '81091') ||
                (userPermissions && userPermissions.kode_menu === '81092') ||
                (userPermissions && userPermissions.kode_menu === '81093') ||
                (userPermissions && userPermissions.kode_menu === '81094') ||
                (userPermissions && userPermissions.kode_menu === '81095') ||
                (userPermissions && userPermissions.kode_menu === '81096') ||
                (userPermissions && userPermissions.kode_menu === '81097') ||
                (userPermissions && userPermissions.kode_menu === '81098') ||
                // // Group 81100
                // (userPermissions && userPermissions.kode_menu === '81101') ||
                // (userPermissions && userPermissions.kode_menu === '81102') ||
                // (userPermissions && userPermissions.kode_menu === '81103') ||
                // (userPermissions && userPermissions.kode_menu === '81104') ||
                // (userPermissions && userPermissions.kode_menu === '81105') ||
                // (userPermissions && userPermissions.kode_menu === '81106') ||
                // (userPermissions && userPermissions.kode_menu === '81107') ||
                // (userPermissions && userPermissions.kode_menu === '81108') ||
                // (userPermissions && userPermissions.kode_menu === '81190') ||
                // Group 81200
                (userPermissions && userPermissions.kode_menu === '81201') ||
                (userPermissions && userPermissions.kode_menu === '81202') ||
                (userPermissions && userPermissions.kode_menu === '81203') ||
                (userPermissions && userPermissions.kode_menu === '81204') ||
                (userPermissions && userPermissions.kode_menu === '81205') ||
                (userPermissions && userPermissions.kode_menu === '81206') ||
                // // Group 81300
                // (userPermissions && userPermissions.kode_menu === '81301') ||
                // (userPermissions && userPermissions.kode_menu === '81302') ||
                // (userPermissions && userPermissions.kode_menu === '81303') ||
                // (userPermissions && userPermissions.kode_menu === '81304') ||
                // (userPermissions && userPermissions.kode_menu === '81305') ||
                // (userPermissions && userPermissions.kode_menu === '81306') ||
                // (userPermissions && userPermissions.kode_menu === '81500') ||
                // (userPermissions && userPermissions.kode_menu === '81600') ||
                // Group 81700
                (userPermissions && userPermissions.kode_menu === '81701') ||
                (userPermissions && userPermissions.kode_menu === '81702') ||
                // (userPermissions && userPermissions.kode_menu === '81800') ||
                // Group 81900
                (userPermissions && userPermissions.kode_menu === '81901') ||
                (userPermissions && userPermissions.kode_menu === '81902') ||
                // (userPermissions && userPermissions.kode_menu === '81903') ||
                // (userPermissions && userPermissions.kode_menu === '81904') ||
                // (userPermissions && userPermissions.kode_menu === '81905') ||
                //kelompok 9
                // // Group 90100
                // (userPermissions && userPermissions.kode_menu === '90100') ||
                // (userPermissions && userPermissions.kode_menu === '90101') ||
                // (userPermissions && userPermissions.kode_menu === '90102') ||
                // // Group 90200
                // (userPermissions && userPermissions.kode_menu === '90200') ||
                // (userPermissions && userPermissions.kode_menu === '90201') ||
                // Group 90300
                (userPermissions && userPermissions.kode_menu === '90301') ||
                (userPermissions && userPermissions.kode_menu === '90302') ||
                (userPermissions && userPermissions.kode_menu === '90303') ||
                // Group 90400
                (userPermissions && userPermissions.kode_menu === '90401') ||
                (userPermissions && userPermissions.kode_menu === '90402') ||
                // // Group 90500
                // (userPermissions && userPermissions.kode_menu === '90501') ||
                // (userPermissions && userPermissions.kode_menu === '90502') ||
                // Group 90600
                (userPermissions && userPermissions.kode_menu === '90601') ||
                (userPermissions && userPermissions.kode_menu === '90602') ||
                (userPermissions && userPermissions.kode_menu === '90603') ||
                (userPermissions && userPermissions.kode_menu === '90604') ||
                // // Group 90700
                // (userPermissions && userPermissions.kode_menu === '90700') ||
                // Group 90800
                (userPermissions && userPermissions.kode_menu === '90801') ||
                // (userPermissions && userPermissions.kode_menu === '90802') ||
                // (userPermissions && userPermissions.kode_menu === '90803') ||
                (userPermissions && userPermissions.kode_menu === '90804') ||
                (userPermissions && userPermissions.kode_menu === '90805') ||
                // Group 90900
                (userPermissions && userPermissions.kode_menu === '90900') ||
                (userPermissions && userPermissions.kode_menu === '91000') ||
                (userPermissions && userPermissions.kode_menu === '91100') ||
                (userPermissions && userPermissions.kode_menu === '91200') ||
                (userPermissions && userPermissions.kode_menu === '92000') ||
                (userPermissions && userPermissions.kode_menu === '92001')
            ) {
                // router.push({
                //     pathname: pathName,
                //     // query: { userPermissions: JSON.stringify(userPermissions) },
                // });

                const [pathnameOnly, queryString] = fullPath.split('?');
                const query: Record<string, string> = {};

                if (queryString) {
                    const params = new URLSearchParams(queryString);
                    params.forEach((value, key) => {
                        query[key] = value;
                    });
                }

                if (router.pathname !== pathnameOnly || JSON.stringify(router.query) !== JSON.stringify(query)) {
                    router.push({
                        pathname: pathnameOnly,
                        query,
                    });
                }
            }
            if (userPermissions && userPermissions.kode_menu === '21401') {
                router.push({
                    pathname: '/kcn/ERP/master/gudang/listGudang',
                    query: { userPermissions: JSON.stringify(userPermissions) },
                });
            }

            if (userPermissions && userPermissions.kode_menu === '21415') {
                setDaftarLiburDlg(true);
            }

            if (userPermissions && userPermissions.kode_menu === '21407') {
                setPengemudiDialog(true);
            }
            if (userPermissions && userPermissions.kode_menu === '20700') {
                setAnggaranAkunDialog(true);
            }
            // TODO: JUAN
            if (userPermissions && userPermissions.kode_menu === '21409') {
                setBankDlg(true);
            }
            if (userPermissions && userPermissions.kode_menu === '21600') {
                setDaftarDivisiPenjualan(true);
            }
            if (userPermissions && userPermissions.kode_menu === '21416') {
                setDaftarAlasan(true);
            }
            if (userPermissions && userPermissions.kode_menu === '20900') {
                setDepartemenDialog(true);
            }
            if (userPermissions && userPermissions.kode_menu === '21417') {
                setDaftarPropinsiKota(true);
            }
            if (userPermissions && userPermissions.kode_menu === '21418') {
                setKecamatanKelurahanDlg(true);
            }

            if (userPermissions && userPermissions.kode_menu === '60211') {
                router.push({
                    pathname: '/kcn/ERP/fa/reimburse/reimburselist',
                    query: { userPermissions: JSON.stringify(userPermissions) },
                });
            }
            if (userPermissions && userPermissions.kode_menu === '21900') {
                router.push({
                    pathname: '/kcn/ERP/master/kelolausermobile/kelolaUserMobile',
                    query: { userPermissions: JSON.stringify(userPermissions) },
                });
            }
            if (userPermissions && userPermissions.kode_menu === '10600') {
                router.push({
                    pathname: '/kcn/ERP/master/administrasiPengguna/administrasiPengguna',
                    query: { userPermissions: JSON.stringify(userPermissions) },
                });
            }
        }
    };

    // const [data, setData] = useState([]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:4001/erp/menu_user?entitas=999');
    //             setData(response.data);
    //         } catch (error) {
    //             console.error('Error fetching data', error);
    //         }
    //     };
    //     fetchData();
    // }, []);

    // console.log(data, 'data');

    //Pakai Data Dummy
    // const userAccess: UserAccess = [
    //     {
    //         user: 'ADMIN',
    //         permissions: [
    //             { kode_menu: '21401', create: false, edit: false, delete: true, cetak: true },
    //             { kode_menu: '21402', create: false, edit: false, delete: true, cetak: true },
    //         ],
    //     },
    // ];

    // const navigateToLink = (kode_menu: any, kode_user: any) => {
    //     const user = userAccess.find((user) => user.user === kode_user);
    //     if (user) {
    //         const userPermissions = user.permissions.find((permission: Permission) => permission.kode_menu === kode_menu);
    //         if (userPermissions && userPermissions.kode_menu === '21401') {
    //             router.push({
    //                 pathname: '/ERP/gudang/listGudang',
    //                 query: { userPermissions: JSON.stringify(userPermissions) },
    //             });
    //         } else if (userPermissions && userPermissions.kode_menu === '21402') {
    //             router.push({
    //                 pathname: '/ERP/sales/kelolaUserMobile',
    //                 query: { userPermissions: JSON.stringify(userPermissions) },
    //             });
    //         }
    //     }
    // };

    const [baru, setBaru] = useState(false);
    const [baruSelected, setbaruSelected] = useState();

    const handleSelectedData = (selectedData: any) => {
        setbaruSelected(selectedData);
    };

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [router.pathname]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState('');
    useEffect(() => {
        setLocale(localStorage.getItem('i18nextLng') || themeConfig.locale);
    }, []);
    const dispatch = useDispatch();

    function createMarkup(messages: any) {
        return { __html: messages };
    }
    const [messages, setMessages] = useState([
        {
            id: 1,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
            title: 'Congratulations!',
            message: 'Your OS has been updated.',
            time: '1hr',
        },
        {
            id: 2,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
            title: 'Did you know?',
            message: 'You can switch between artboards.',
            time: '2hr',
        },
        {
            id: 3,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
            title: 'Something went wrong!',
            message: 'Send Reposrt',
            time: '2days',
        },
        {
            id: 4,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
            title: 'Warning',
            message: 'Your password strength is low.',
            time: '5days',
        },
    ]);

    const removeMessage = (value: number) => {
        setMessages(messages.filter((user) => user.id !== value));
    };

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            profile: 'user-profile.jpeg',
            message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
            time: '45 min ago',
        },
        {
            id: 2,
            profile: 'profile-34.jpeg',
            message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
            time: '9h Ago',
        },
        {
            id: 3,
            profile: 'profile-16.jpeg',
            message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
            time: '9h Ago',
        },
    ]);

    const removeNotification = (value: number) => {
        setNotifications(notifications.filter((user) => user.id !== value));
    };

    const [search, setSearch] = useState(false);

    const { t, i18n } = useTranslation();

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between lg:hidden ltr:mr-2 rtl:ml-2">
                        <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.png" alt="logo" />
                        <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 dark:text-white-light md:inline ltr:ml-1.5 rtl:mr-1.5">
                            {tipe === 'ERP' ? 'NEXT' : 'NEXT FNB'}
                        </span>
                        {/* <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.png" alt="logo" />
                            <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">NEXT</span>
                        </Link> */}
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden ltr:ml-2 rtl:mr-2"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="hidden sm:block ltr:mr-2 rtl:ml-2">
                        <ul className="flex items-center space-x-2 dark:text-[#d0d2d6] rtl:space-x-reverse">
                            {/* <li>
                                <Link href="/apps/calendar" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                        <path opacity="0.5" d="M7 4V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M17 4V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M2 9H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </Link>
                            </li> */}
                            {/* <li>
                                <Link href="/apps/todolist" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            opacity="0.5"
                                            d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            opacity="0.5"
                                            d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                </Link>
                            </li> */}
                            {/* <li>
                                <Link href="/apps/chat" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle r="3" transform="matrix(-1 0 0 1 19 5)" stroke="currentColor" strokeWidth="1.5" />
                                        <path
                                            opacity="0.5"
                                            d="M14 2.20004C13.3538 2.06886 12.6849 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 11.3151 21.9311 10.6462 21.8 10"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </Link>
                            </li> */}
                        </ul>
                    </div>
                    <div className="flex items-center space-x-1.5 dark:text-[#d0d2d6] sm:flex-1 lg:space-x-2 ltr:ml-auto ltr:sm:ml-0 rtl:mr-auto rtl:space-x-reverse sm:rtl:mr-0">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
                            <form
                                className={`${search && '!block'} absolute inset-x-0 top-1/2 z-10 mx-4 hidden -translate-y-1/2 sm:relative sm:top-0 sm:mx-0 sm:block sm:translate-y-0`}
                                onSubmit={() => setSearch(false)}
                            >
                                {/* <div className="relative">
                                    <input
                                        type="text"
                                        className="peer form-input bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4"
                                        placeholder="Search..."
                                    />
                                    <button type="button" className="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                        <svg className="mx-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                                            <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                    <button type="button" className="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden" onClick={() => setSearch(false)}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div> */}
                            </form>
                            <button
                                type="button"
                                onClick={() => setSearch(!search)}
                                className="search_btn rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 dark:bg-dark/40 dark:hover:bg-dark/60 sm:hidden"
                            >
                                <svg className="mx-auto h-4.5 w-4.5 dark:text-[#d0d2d6]" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                                    <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        {/* <div>
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('dark'))}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('system'))}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </button>
                            )}
                            {themeConfig.theme === 'system' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'system' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3 9C3 6.17157 3 4.75736 3.87868 3.87868C4.75736 3 6.17157 3 9 3H15C17.8284 3 19.2426 3 20.1213 3.87868C21 4.75736 21 6.17157 21 9V14C21 15.8856 21 16.8284 20.4142 17.4142C19.8284 18 18.8856 18 17 18H7C5.11438 18 4.17157 18 3.58579 17.4142C3 16.8284 3 15.8856 3 14V9Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                        <path opacity="0.5" d="M22 21H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <path opacity="0.5" d="M15 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div> */}
                        {/* <div className="dropdown shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                button={flag && <img className="h-5 w-5 rounded-full object-cover" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
                            >
                                <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    {themeConfig.languageList.map((item: any) => {
                                        return (
                                            <li key={item.code}>
                                                <button
                                                    type="button"
                                                    className={`flex w-full hover:text-primary ${i18n.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                    onClick={() => {
                                                        dispatch(toggleLocale(item.code));
                                                        i18n.changeLanguage(item.code);
                                                        setLocale(item.code);
                                                    }}
                                                >
                                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                                    <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Dropdown>
                        </div> */}
                        {/* <div className="dropdown shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                button={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M22 10C22.0185 10.7271 22 11.0542 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H13"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M6 8L8.1589 9.79908C9.99553 11.3296 10.9139 12.0949 12 12.0949C13.0861 12.0949 14.0045 11.3296 15.8411 9.79908"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <circle cx="19" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                }
                            >
                                <ul className="w-[300px] !py-0 text-xs text-dark dark:text-white-dark sm:w-[375px]">
                                    <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                                        <div className="relative !h-[68px] w-full overflow-hidden rounded-t-md p-5 text-white hover:!bg-transparent">
                                            <div className="bg- absolute inset-0 h-full w-full bg-[url(/assets/images/menu-heade.jpg)] bg-cover bg-center bg-no-repeat"></div>
                                            <h4 className="relative z-10 text-lg font-semibold">Messages</h4>
                                        </div>
                                    </li>
                                    {messages.length > 0 ? (
                                        <>
                                            <li onClick={(e) => e.stopPropagation()}>
                                                {messages.map((message) => {
                                                    return (
                                                        <div key={message.id} className="flex items-center px-5 py-3">
                                                            <div dangerouslySetInnerHTML={createMarkup(message.image)}></div>
                                                            <span className="px-3 dark:text-gray-500">
                                                                <div className="text-sm font-semibold dark:text-white-light/90">{message.title}</div>
                                                                <div>{message.message}</div>
                                                            </span>
                                                            <span className="whitespace-pre rounded bg-white-dark/20 px-1 font-semibold text-dark/60 ltr:ml-auto ltr:mr-2 rtl:ml-2 rtl:mr-auto dark:text-white-dark">
                                                                {message.time}
                                                            </span>
                                                            <button type="button" className="text-neutral-300 hover:text-danger" onClick={() => removeMessage(message.id)}>
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                                    <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </li>
                                            <li className="mt-5 border-t border-white-light text-center dark:border-white/10">
                                                <button type="button" className="group !h-[48px] justify-center !py-4 font-semibold text-primary dark:text-gray-400">
                                                    <span className="group-hover:underline ltr:mr-1 rtl:ml-1">VIEW ALL ACTIVITIES</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 transition duration-300 group-hover:translate-x-1 ltr:ml-1 rtl:mr-1"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                                    </svg>
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                                            <button type="button" className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                <div className="mx-auto mb-4 rounded-full text-white ring-4 ring-primary/30">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="40"
                                                        height="40"
                                                        viewBox="0 0 24 24"
                                                        fill="#a9abb6"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="feather feather-info rounded-full bg-primary"
                                                    >
                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                    </svg>
                                                </div>
                                                No data available.
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div> */}
                        {/* <div className="dropdown shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                button={
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M19.0001 9.7041V9C19.0001 5.13401 15.8661 2 12.0001 2C8.13407 2 5.00006 5.13401 5.00006 9V9.7041C5.00006 10.5491 4.74995 11.3752 4.28123 12.0783L3.13263 13.8012C2.08349 15.3749 2.88442 17.5139 4.70913 18.0116C9.48258 19.3134 14.5175 19.3134 19.291 18.0116C21.1157 17.5139 21.9166 15.3749 20.8675 13.8012L19.7189 12.0783C19.2502 11.3752 19.0001 10.5491 19.0001 9.7041Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <path d="M7.5 19C8.15503 20.7478 9.92246 22 12 22C14.0775 22 15.845 20.7478 16.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M12 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
                                            <span className="absolute -top-[3px] inline-flex h-full w-full animate-ping rounded-full bg-success/50 opacity-75 ltr:-left-[3px] rtl:-right-[3px]"></span>
                                            <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-success"></span>
                                        </span>
                                    </span>
                                }
                            >
                                <ul className="w-[300px] divide-y !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[350px]">
                                    <li onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between px-4 py-2 font-semibold">
                                            <h4 className="text-lg">Notification</h4>
                                            {notifications.length ? <span className="badge bg-primary/80">{notifications.length}New</span> : ''}
                                        </div>
                                    </li>
                                    {notifications.length > 0 ? (
                                        <>
                                            {notifications.map((notification) => {
                                                return (
                                                    <li key={notification.id} className="dark:text-white-light/90" onClick={(e) => e.stopPropagation()}>
                                                        <div className="group flex items-center px-4 py-2">
                                                            <div className="grid place-content-center rounded">
                                                                <div className="relative h-12 w-12">
                                                                    <img className="h-12 w-12 rounded-full object-cover" alt="profile" src={`/assets/images/${notification.profile}`} />
                                                                    <span className="absolute bottom-0 right-[6px] block h-2 w-2 rounded-full bg-success"></span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-auto ltr:pl-3 rtl:pr-3">
                                                                <div className="ltr:pr-3 rtl:pl-3">
                                                                    <h6
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: notification.message,
                                                                        }}
                                                                    ></h6>
                                                                    <span className="block text-xs font-normal dark:text-gray-500">{notification.time}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="text-neutral-300 opacity-0 hover:text-danger group-hover:opacity-100 ltr:ml-auto rtl:mr-auto"
                                                                    onClick={() => removeNotification(notification.id)}
                                                                >
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                                        <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                            <li>
                                                <div className="p-4">
                                                    <button className="btn btn-primary btn-small block w-full">Read All Notifications</button>
                                                </div>
                                            </li>
                                        </>
                                    ) : (
                                        <li onClick={(e) => e.stopPropagation()}>
                                            <button type="button" className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                <div className="mx-auto mb-4 rounded-full ring-4 ring-primary/30">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="40"
                                                        height="40"
                                                        viewBox="0 0 24 24"
                                                        fill="#a9abb6"
                                                        stroke="#ffffff"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="feather feather-info rounded-full bg-primary"
                                                    >
                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                    </svg>
                                                </div>
                                                No data available.
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div> */}
                        <div className="flex font-semibold text-dark">
                            {tipe === 'CRM' && (
                                <Link href="/kcn/CRM/chat/notif">
                                    <FontAwesomeIcon icon={faBell} style={{ marginRight: '0.5rem' }} width="18" height="18" />
                                </Link>
                            )}
                            {userid.toLocaleUpperCase()} - {kode_entitas}
                        </div>
                        <div className="dropdownProfil flex shrink-0">
                            <Dropdown
                                offset={[0, 2]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group block"
                                // button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.jpeg" alt="userProfile" />}
                                button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/userImageProfil.png" alt="userProfile" />}
                            >
                                <ul className="w-[220px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            {/* <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/user-profile.jpeg" alt="userProfile" /> */}
                                            <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/userImageProfil.png" alt="logo" />
                                            <div className="truncate ltr:pl-3 rtl:pr-3">
                                                <h4 className="text-base">
                                                    {nama_user}
                                                    {/* <span className="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span> */}
                                                </h4>
                                                {/* <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"> */}
                                                <h4 className="text-base">
                                                    {/* User@gmail.com */}
                                                    {nip}
                                                </h4>
                                            </div>
                                        </div>
                                    </li>
                                    {/* <li>
                                        <Link href="/users/profile" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faUser} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Profile
                                        </Link>
                                    </li> */}
                                    {/* <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faInbox} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Inbox
                                        </Link>
                                    </li> */}
                                    {/* <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faUserLock} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Lock Screen
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faKey} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Ganti Password
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faBuilding} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Informasi Perusahaan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faCog} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Setting Aplikasi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faUserCog} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Administrasi Pengguna Aplikasi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faUserTie} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Template User Jabatan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Online Approval
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faClipboardCheck} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Audit Trial
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faCommentSms} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Log SMS
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faWhatsapp} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            WhatsApp Blast
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faRepeat} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Restart Aplikasi
                                        </Link>
                                    </li> */}
                                    <li>
                                        <Link href={`${baseUrl}/main/main?tabId=${tabId}`} className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faHome} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Home
                                        </Link>
                                    </li>
                                    {userid.toUpperCase() === 'ADMINISTRATOR' && (

                                    <li>
                                        <Link href={`${baseUrl}/main/logger?tabId=${tabId}`} className="dark:hover:text-white">
                                            <FontAwesomeIcon icon={faRoadLock} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Logs
                                        </Link>
                                    </li>
                                    )}
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        {/* <Link href="/" className="!py-2 text-danger"> 
                                         <FontAwesomeIcon icon={faArrowRightFromBracket} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Sign Out 
                                        </Link> */}

                                        <button className="!py-2 text-danger" type="button" onClick={logout}>
                                            <FontAwesomeIcon icon={faArrowRightFromBracket} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* horizontal menu */}
                {tipe === 'ERP' || tipe === 'FNB' ? (
                    <ul
                        className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-5 py-1.5 font-semibold text-black dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-0.5 xl:space-x-0.5 rtl:space-x-reverse"
                        style={{ background: '#cbcbcb' }}
                    >
                        {/* KELOMPOK 2 */}
                        {/* <li className="menu nav-item relative"> */}

                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '10600',
                                            '20000',
                                            '20100',
                                            '20200',
                                            '20201',
                                            '20202',
                                            '20203',
                                            '20204',
                                            '20300',
                                            '20400',
                                            '20500',
                                            '20501',
                                            '20502',
                                            '20503',
                                            '20504',
                                            '20505',
                                            '20506',
                                            '20507',
                                            '20600',
                                            '20700',
                                            '20800',
                                            '20900',
                                            '21000',
                                            '21100',
                                            '21200',
                                            '21300',
                                            '21301',
                                            '21302',
                                            '21303',
                                            '21304',
                                            '21307',
                                            '21400',
                                            '21401',
                                            '21402',
                                            '21403',
                                            '21404',
                                            '21405',
                                            '21406',
                                            '21407',
                                            '21408',
                                            '21409',
                                            '21410',
                                            '21411',
                                            '21412',
                                            '21413',
                                            '21414',
                                            '21415',
                                            '21416',
                                            '21417',
                                            '21418',
                                            '21419',
                                            '21420',
                                            '21430',
                                            '21500',
                                            '21600',
                                            '21605',
                                            '21700',
                                            '21701',
                                            '21702',
                                            '21703',
                                            '21704',
                                            '21800',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Pemeliharaan')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li>
                                    {/* <Link href="/kcn/ERP/master/administrasiPengguna/administrasiPengguna">{t('Administrasi Pengguna Aplikasi')}</Link> */}
                                    {/* <Link href={`${baseUrl}/master/administrasiPengguna/administrasiPengguna`}>{t('Administrasi Pengguna Aplikasi')}</Link> */}
                                    {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '10600') && (
                                        <button onClick={() => navigateToLink('10600', kode_user, `${baseUrl}/master/administrasiPengguna/administrasiPengguna?tabId=${tabId}`)}>
                                            {t('Administrasi Pengguna Aplikasi')}
                                        </button>
                                    )}
                                </li>
                                <li>
                                    {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '20100') && (
                                        <button onClick={() => navigateToLink('20100', kode_user, `${baseUrl}/master/daftarRelasi/daftarRelasi?tabId=${tabId}`)}>{t('Daftar Relasi')}</button>
                                    )}
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['20201', '20202', '20203', '20204'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Customer')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '20201', label: 'Daftar Customer', pathName: `${baseUrl}/master/daftarCustomer/daftarCustomer?tabId=${tabId}` },
                                            { code: '20202', label: 'History Peralihan Customer', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20203', label: 'History Membership Customer', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20204', label: 'Pengajuan Aktivasi dan Open Blacklist', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '20300', label: 'Supplier', pathName: `${baseUrl}/master/supplier/supplier/?tabId=${tabId}` },
                                    { code: '20400', label: 'Salesman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['20501', '20502', '20503', '20504', '20505', '20506', '20507'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Produk dan Insentif')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '20501', label: 'Setting Batas Bayar dan Pembelian Produk', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20502', label: 'Setting Pendapan Insentif', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20503', label: 'Setting Target Distribusi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20504', label: 'Setting Target Penagihan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20505', label: 'Setting Model Insentif', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20506', label: 'Setting Denda dan Potongan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '20507', label: 'Setting Minimal Target Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li className={`${submenu.code === '20506' ? 'border-t border-white-light dark:border-white-light/10' : ''}`} key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {kode_entitas === '898' &&
                                (userid.toUpperCase() === 'ADMINISTRATOR' || userid.toUpperCase() === 'ASTERIA' || userid.toUpperCase() === 'JASMINE A' || userid.toUpperCase() === 'TESI') ? (
                                    <li>
                                        <Link href={`${baseUrl}/master/kelolausermobile/kelolaUserMobile?tabId=${tabId}`}>{t('Kelola User Mobile')}</Link>
                                    </li>
                                ) : null}
                                {[
                                    { code: '20600', label: 'Daftar Akun', pathName: `${baseUrl}/master/daftar-akun?tabId=${tabId}` },
                                    // { code: '21900', label: 'Kelola User Mobile', pathName: `${baseUrl}/master/kelolausermobile/kelolaUserMobile?tabId=${tabId}` },
                                    { code: '20700', label: 'Anggaran Akun', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '20800', label: 'Akun Pembantu (Subledgerr)', pathName: `${baseUrl}/master/akun-subledger?tabId=${tabId}` },
                                    { code: '20900', label: 'Departemen', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    // { code: '21000', label: 'Kegiatan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '21100', label: 'Aktiva Tetap (Asset)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '21200', label: 'Daftar Persediaan', pathName: `${baseUrl}/master/daftarPersediaan/daftarPersediaan?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['21301', '21302', '21303', '21304', '21307'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Daftar Harga')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '21301', label: 'Harga Pembelian Per Item', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21302', label: 'Harga Pembelian Per Supplier', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21303', label: 'Harga Penjualan Per Item', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21304', label: 'Harga Penjualan Per Customer', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21307', label: 'Harga Ekspedisi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li
                                                className={`${submenu.code === '21303' || submenu.code === '21307' ? 'border-t border-white-light dark:border-white-light/10' : ''}`}
                                                key={submenu.code}
                                            >
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                [
                                                    '21401',
                                                    '21402',
                                                    '21403',
                                                    '21404',
                                                    '21405',
                                                    '21406',
                                                    '21407',
                                                    '21408',
                                                    '21409',
                                                    '21410',
                                                    '21411',
                                                    '21412',
                                                    '21413',
                                                    '21414',
                                                    '21415',
                                                    '21416',
                                                    '21417',
                                                    '21418',
                                                    '21419',
                                                    '21420',
                                                    '21430',
                                                ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Daftar Lainnya')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul
                                        className="absolute top-[-400px] z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]"
                                        style={{ maxHeight: '80vh', overflow: 'auto' }}
                                    ></ul>
                                    <ul
                                        className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]"
                                        style={{ maxHeight: '40vh', overflow: 'auto' }}
                                    >
                                        {[
                                            { code: '21401', label: 'Gudang', pathName: `${baseUrl}/master/gudang/listGudang?tabId=${tabId}` },
                                            { code: '21402', label: 'Kurs Mata Uang', pathName: `${baseUrl}/master/daftar-kurs-mata-uang?tabId=${tabId}` },
                                            { code: '21403', label: 'Pajak', pathName: `${baseUrl}/master/daftar-pajak?tabId=${tabId}` },
                                            { code: '21404', label: 'Termin Pembayaran', pathName: `${baseUrl}/master/daftar-termin-pembayaran?tabId=${tabId}` },
                                            { code: '21405', label: 'Rayon (Wilayah Penjualan)', pathName: `${baseUrl}/master/rayon/RayonList?tabId=${tabId}` },
                                            { code: '21406', label: 'Kendaraan', pathName: `${baseUrl}/master/kendaraan/KendaraanListMaster?tabId=${tabId}` },
                                            { code: '21407', label: 'Pengemudi (Sopir)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21408', label: 'Via Pengiriman (Ekspedisi)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21409', label: 'Bank', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            // { code: '21410', label: 'Area dan Biaya Pengiriman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21411', label: 'Diskon Tonase', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21412', label: 'Kategori', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21413', label: 'Kelompok Produk', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21414', label: 'Merek Produk', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21415', label: 'Hari Libur', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21416', label: 'Alasan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21417', label: 'Propinsi dan Kota', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21418', label: 'Kecamatan dan Kelurahan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21419', label: 'Data Legalitas Ekspedisi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21420', label: 'Klasifikasi Plafond Maksimal', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            // { code: '21430', label: 'Wilayah dan Biaya Kirim', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li
                                                className={`${submenu.code === '21412' || submenu.code === '21415' ? 'border-t border-white-light dark:border-white-light/10' : ''}`}
                                                key={submenu.code}
                                            >
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '21500', label: 'Daftar Karyawan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '21600', label: 'Daftar Divisi Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '21605', label: 'Daftar Bank Semua Entitas', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li className={`${submenu.code === '21605' ? 'border-t border-white-light dark:border-white-light/10' : ''}`} key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['21701', '21702', '21703', '21704'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Proses Periodik')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '21701', label: 'Proses Kalkulasi Biaya Persediaan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21702', label: 'Proses Tutup Buku Akhir Periode', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21703', label: 'Perubahan Periode Akuntansi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '21704', label: 'Proses Tutup Tahun', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '21800') && (
                                    <button onClick={() => navigateToLink('21800', kode_user, `${baseUrl}/blankPage/blankPage?tabId=${tabId}`)}>{t('Proses Tutup penjualan Tunai (POS)')}</button>
                                )}
                            </ul>
                        </li>
                        {/* kumpulan dialog */}
                        {anggaranAkunDialog && <AnggaranAkun isOpen={anggaranAkunDialog} onClose={() => setAnggaranAkunDialog(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {daftarLiburDlg && <DaftarLibur isOpen={daftarLiburDlg} onClose={() => setDaftarLiburDlg(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {pengemudiDialog && <PengemudiDialog isOpen={pengemudiDialog} onClose={() => setPengemudiDialog(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {departemenDialog && <FrmDepartemen isOpen={departemenDialog} onClose={() => setDepartemenDialog(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {bankDlg && <BankDialog isOpen={bankDlg} onClose={() => setBankDlg(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {daftarPropinsiKota && <DaftarPropinsiKota isOpen={daftarPropinsiKota} onClose={() => setDaftarPropinsiKota(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {daftarAlasan && <DaftarAlasan isOpen={daftarAlasan} onClose={() => setDaftarAlasan(false)} entitas={kode_entitas} token={token} userid={userid} />}
                        {kecamatanKelurahanDlg && (
                            <KecamatanKelurahanDialog isOpen={kecamatanKelurahanDlg} onClose={() => setKecamatanKelurahanDlg(false)} entitas={kode_entitas} token={token} userid={userid} />
                        )}
                        {daftarDivisiPenjualan && (
                                    <DaftarDivisiPenjualanPage isOpen={daftarDivisiPenjualan} onClose={() => setDaftarDivisiPenjualan(false)} entitas={kode_entitas} token={token} userid={userid} />
                                )}
                        {/* KELOMPOK 3 */}
                        {/* <li className="menu nav-item relative"> */}
                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '30000',
                                            '30100',
                                            '30200',
                                            '30300',
                                            '30400',
                                            '30500',
                                            '30600',
                                            '30700',
                                            '30800',
                                            '30900',
                                            '31100',
                                            '31101',
                                            '31102',
                                            '31103',
                                            '31104',
                                            '31105',
                                            '31106',
                                            '31200',
                                            '31201',
                                            '31202',
                                            '31203',
                                            '31204',
                                            '31300',
                                            '31400',
                                            '31500',
                                            '31600',
                                            '31700',
                                            '31800',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faDiceD6} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Pengadaan')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {[
                                    { code: '30100', label: 'Permintaan Pembelian (PP)', pathName: `${baseUrl}/purchase/pp/spplist?tabId=${tabId}` },
                                    { code: '30200', label: 'Order Pembelian (PO)', pathName: `${baseUrl}/purchase/po/polist?tabId=${tabId}` },
                                    { code: '30400', label: 'Faktur Pembelian (FB)', pathName: `${baseUrl}/purchase/fb/fblist?tabId=${tabId}` },
                                    { code: '30800', label: 'Form Pengadaan Barang (FPB)', pathName: `${baseUrl}/antarCabang/fpb/fpbList?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['30900'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Form Pembelian Antar Cabang (FPAC)')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '30900', label: 'FPAC (Kontrak)', pathName: `${baseUrl}/antarCabang/fpacKontrak/fpacList?tabId=${tabId}` },
                                            { code: '30900', label: 'FPAC (Non Kontrak)', pathName: `${baseUrl}/antarCabang/fpacNonKontrak/fpacList?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '31800', label: 'Pra Permintaan Pembelian (Pra PP)', pathName: `${baseUrl}/inventory/prapp/frmPraPp?tabId=${tabId}` },
                                    { code: '31300', label: 'Form Delivery Order (FDO)', pathName: `${baseUrl}/logistik/fdo?tabId=${tabId}` },
                                    { code: '31700', label: 'Form Pengajuan Mutasi Barang (FPMB)', pathName: `${baseUrl}/logistik/fpmb/fpmbList?tabId=${tabId}` },
                                    { code: '31400', label: 'Form Barang Masuk (FBM)', pathName: `${baseUrl}/purchase/fbm/fbmlist?tabId=${tabId}` },
                                    { code: '31600', label: 'Realisasi Berita Acara (RBA)', pathName: `${baseUrl}/inventory/realisasi-berita-acara/listRba?tabId=${tabId}` },
                                    { code: '31500', label: 'Realisasi Pembayaran Ekspedisi (RPE)', pathName: `${baseUrl}/inventory/rpe/rpelist?tabId=${tabId}` },
                                    { code: '30700', label: 'Analisa Pembelian', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '30600', label: 'Informasi Detail Supplier', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li className={`${submenu.code === '30700' ? 'border-t border-white-light dark:border-white-light/10' : ''}`} key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                {/* <li>
                                    <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Surat Pengambilan Barang (SPB)')}</Link>
                                </li>
                                <li className="border-t border-white-light dark:border-white-light/10">
                                    <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Target Pembelian ')}</Link>
                                </li> */}

                                {/* <li className="relative">
                                    <button type="button">
                                        {t('Administrasi Pengadaan Barang')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        <li>
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Daftar Barang')}</Link>
                                        </li>
                                        <li>
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Daftar Kantor')}</Link>
                                        </li>
                                        <li>
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Daftar Pabrik')}</Link>
                                        </li>
                                        <li className="border-t border-white-light dark:border-white-light/10">
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Memo Permintaan Cabang (MPC)')}</Link>
                                        </li>
                                        <li>
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Order Pembelian Terbuka (POT)')}</Link>
                                        </li>
                                        <li>
                                            <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Realisasi Permintaan Cabang (RPC)')}</Link>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Laporan Administrasi Pengadaan')}</Link>
                                </li> */}
                            </ul>
                        </li>

                        {/* KELOMPOK 4 */}
                        {/* <li className="menu nav-item relative"> */}
                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '40000',
                                            '40100',
                                            '40200',
                                            '40300',
                                            '40400',
                                            '40500',
                                            '40600',
                                            '40700',
                                            '40800',
                                            '40900',
                                            '41000',
                                            '41100',
                                            '41200',
                                            '41201',
                                            '41202',
                                            '41203',
                                            '41204',
                                            '41300',
                                            '41301',
                                            '41302',
                                            '41400',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faWarehouse} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Persediaan')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {/* <li>
                                    <Link
                                        href={`${baseUrl}/inventory/pb/pblist?tabId=${tabId}`}
                                        // onClick={() => setBaru(true)}
                                    >
                                        {t('Penerimaaan Barang (PB)')}
                                    </Link>
                                    <PilihPraModal isOpen={baru} onClose={() => setBaru(false)} onSelectData={(selectedData: any) => handleSelectedData(selectedData)} />
                                </li> */}
                                {[
                                    { code: '40100', label: 'Penerimaan Barang (PB)', pathName: `${baseUrl}/inventory/pb/pblist?tabId=${tabId}` },
                                    { code: '40400', label: 'Memo Pengembalian Barang (MPB)', pathName: `${baseUrl}/inventory/mpb/mpblist?tabId=${tabId}` },
                                    { code: '40700', label: 'Mutasi Barang (MB)', pathName: `${baseUrl}/inventory/mb/mblist?tabId=${tabId}` },
                                    { code: '40800', label: 'Penyesuaian dan Rebuild Stok (PS)', pathName: `${baseUrl}/inventory/ps/pslist?tabId=${tabId}` },
                                    { code: '40500', label: 'Surat Jalan (SJ)', pathName: `${baseUrl}/inventory/sj/sjlist?tabId=${tabId}` },
                                    { code: '40600', label: 'Tanda Terima Barang (TTB)', pathName: `${baseUrl}/inventory/ttb/ttblist?tabId=${tabId}` },
                                    { code: '40900', label: 'Informasi stok aktual', pathName: `${baseUrl}/inventory/informasi-stok-aktual?tabId=${tabId}` },
                                    { code: '41000', label: 'Analisa Mutasi persediaan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '41100', label: 'Analisa Aktifitas Pengiriman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li
                                        className={`${
                                            submenu.code === '40700' || submenu.code === '40500' || submenu.code === '40900' ? 'border-t border-white-light dark:border-white-light/10' : ''
                                        }`}
                                        key={submenu.code}
                                    >
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['41301', '41302'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Stok Opname')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '41301', label: 'Dashboard Stok Opname', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '41302', label: 'Jadwal dan Hasil Stok Opname', pathName: `${baseUrl}/inventory/stok-opname/jadwal-dan-hasil?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['41201', '41202', '41203', '41204'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Kartu Stok Gudang')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '41201', label: 'Lokasi Barang', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '41202', label: 'Mutasi Barang', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '41203', label: 'Analisa Mutasi Barang', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '41204', label: 'Stok dan Harga Jual Aktual...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '41400') && (
                                    <button onClick={() => navigateToLink('41400', kode_user, `${baseUrl}/inventory/data-besi-kompetitor?tabId=${tabId}`)}>{t('Data Besi Kompetitor')}</button>
                                )}

                                {/* <li>
                                    <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Kerusakan Barang (KB)')}</Link>
                                </li>
                                <li>
                                    <Link href={`${baseUrl}/blankPage/blankPage`}>{t('Perubahan Status Barang (PSB)')}</Link>
                                </li>
                              */}
                            </ul>
                        </li>

                        {/* KELOMPOK 5 */}
                        {/* <li className="menu nav-item relative"> */}
                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '50000',
                                            '50100',
                                            '50200',
                                            '50300',
                                            '50400',
                                            '50500',
                                            '50501',
                                            '50600',
                                            '50601',
                                            '50602',
                                            '50603',
                                            '50604',
                                            '50605',
                                            '50606',
                                            '50700',
                                            '50701',
                                            '50702',
                                            '50703',
                                            '50704',
                                            '50705',
                                            '50706',
                                            '50707',
                                            '50708',
                                            '50709',
                                            '50710',
                                            '50800',
                                            '50900',
                                            '51000',
                                            '51100',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faCartShopping} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Penjualan')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {[
                                    { code: '50100', label: 'Order Penjualan (SO)', pathName: `${baseUrl}/sales/so/solist?tabId=${tabId}` },
                                    { code: '50200', label: 'Surat Perintah Muat (SPM) - (DO)', pathName: `${baseUrl}/sales/spm/spmlist?tabId=${tabId}` },
                                    { code: '50300', label: 'Faktur Penjualan Kredit (FPK)', pathName: `${baseUrl}/sales/fj/fjlist?tabId=${tabId}` },
                                    { code: '50400', label: 'Faktur Penjualan Tunai (FPT) -(POS)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '50500', label: 'Memo Kredit (MK) - (Retur Penjualan Tunai)', pathName: `${baseUrl}/sales/mk/mkList?tabId=${tabId}` },
                                    { code: '50501', label: 'Memo Potongan Penjualan (MPP)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li className={`${submenu.code === '50300' ? 'border-t border-white-light dark:border-white-light/10' : ''}`} key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['50601', '50602', '50603', '50604', '50605', '50606'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Target Penjualan')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '50601', label: 'Target Global Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50602', label: 'Target Detail Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50603', label: 'Target Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50604', label: 'Target vs Realisasi (Per Bulan)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50605', label: 'Target vs Realisasi (Per Kuartal)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50606', label: 'Target Data View', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li className={`${submenu.code === '50603' ? 'border-t border-white-light dark:border-white-light/10' : ''}`} key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['50701', '50702', '50703', '50704', '50705', '50706', '50707', '50708', '50709', '50710'].some((code) =>
                                                    user.permissions.some((permission) => permission.kode_menu === code)
                                                )
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Performa Salesman')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[380px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '50701', label: 'Rencana Kunjungan Salesman (RKS)', pathName: `${baseUrl}/sales/performa_salesman/rks/rksList?tabId=${tabId}` },
                                            { code: '50702', label: 'Hasil Kunjungan Salesman (HKS)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50703', label: 'Informasi Detail Salesman...', pathName: `${baseUrl}/sales/performa_salesman/informasi_detail_salesman?tabId=${tabId}` },
                                            { code: '50704', label: 'Monitoring RKS dan HKS...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50705', label: 'Tanda Terima dan Opname Faktur...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50706', label: 'Approval Insentif Bonus Salesman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50707', label: 'Approval Insentif Bonus Salesman (Konsolidasi)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50708', label: 'Approval Uang Saku', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50709', label: 'Approval Pencairan Uang Saku (Konsolidasi)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '50710', label: 'Monitoring Uang Saku', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li
                                                className={`${submenu.code === '50703' || submenu.code === '50706' ? 'border-t border-white-light dark:border-white-light/10' : ''}`}
                                                key={submenu.code}
                                            >
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '50800', label: 'Informasi Detail Customer', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '50900', label: 'Analisa Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '51000', label: 'Analisa Channel Healthiness', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '51100', label: 'Analisa Aktifitas Transaksi Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                        {/* KELOMPOK 6 */}
                        {/* <li className="menu nav-item relative"> */}
                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '60000',
                                            '60100',
                                            '60101',
                                            '60102',
                                            '60103',
                                            '60104',
                                            '60200',
                                            '60201',
                                            '60202',
                                            '60203',
                                            '60204',
                                            '60205',
                                            '60206',
                                            '60207',
                                            '60210',
                                            '60300',
                                            '60301',
                                            '60302',
                                            '60303',
                                            '60304',
                                            '60305',
                                            '60306',
                                            '60400',
                                            '60401',
                                            '60402',
                                            '60403',
                                            '60404',
                                            '60405',
                                            '60406',
                                            '60500',
                                            '60501',
                                            '60502',
                                            '60503',
                                            '60504',
                                            '60505',
                                            '60600',
                                            '60601',
                                            '60602',
                                            '60603',
                                            '60604',
                                            '60605',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faScaleBalanced} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Finance Accounting')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['60101', '60102', '60103', '60104'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Penjurnalan')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60101', label: 'Jurnal Umum (JU)', pathName: `${baseUrl}/fa/ju/julist?tabId=${tabId}` },
                                            { code: '60102', label: 'Pengeluaran Lain (BK)', pathName: `${baseUrl}/fa/bkk/frmPraBkkList?tabId=${tabId}}` },
                                            { code: '60103', label: 'Pemasukan Lain (BM)', pathName: `${baseUrl}/fa/bm/bmlist?tabId=${tabId}` },
                                            { code: '60104', label: 'Jurnal HRIS Via API...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['60201', '60202', '60203', '60204', '60205', '60206', '60207', '60210', '60211'].some((code) =>
                                                    user.permissions.some((permission) => permission.kode_menu === code)
                                                )
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Pembayaran dan Penerimaan')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60201', label: 'Pembayaran Hutang (PHU)', pathName: `${baseUrl}/fa/phu/phulist?tabId=${tabId}` },
                                            { code: '60202', label: 'Penerimaan Piutang (PPI)', pathName: `${baseUrl}/fa/ppi/ppilist?tabId=${tabId}` },
                                            // { code: '60203', label: 'Pembayaran Hutang Ekspedisi (PHE)', pathName:  },
                                            { code: '60211', label: 'Reimbursement HRIS', pathName: `${baseUrl}/fa/reimburse/reimburselist?tabId=${tabId}` },
                                            { code: '60204', label: 'Form Pengajuan Pembayaran (FPP)', pathName: `${baseUrl}/fa/fpp/fpplist?tabId=${tabId}` },
                                            { code: '60205', label: 'Daftar Bukti Tanda Terima Pembayaran (TTP)', pathName: `${baseUrl}/fa/daftar-bukti-ttp?tabId=${tabId}` },
                                            { code: '60206', label: 'Proses posting TTP...', pathName: `${baseUrl}/fa/posting-ttp?tabId=${tabId}` },
                                            { code: '60207', label: 'Pembayaran Uang Muka', pathName: `${baseUrl}/fa/pembayaran-uang-muka?tabId=${tabId}` },
                                            { code: '60210', label: 'Konsolidasi PHE', pathName: `${baseUrl}/fa/konsolidasi-phe?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                        {kode_entitas === '898' &&
                                        (userid.toUpperCase() === 'ADMINISTRATOR' ||
                                            userid.toUpperCase() === 'JASMINE A' ||
                                            userid.toUpperCase() === 'MIRAWATI' ||
                                            userid.toUpperCase() === 'CHODIJAH P' ||
                                            userid.toUpperCase() === 'ARNI ELSA') ? (
                                            <li>
                                                <Link href={`${baseUrl}/fa/reimburse/reimburselist?tabId=${tabId}`}>{t('Reimbursement HRIS')}</Link>
                                            </li>
                                        ) : null}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['60301', '60302', '60303', '60304', '60305', '60306'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Pembukuan')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60301', label: 'Buku Besar...', pathName: `${baseUrl}/fa/buku-besar?tabId=${tabId}` },
                                            { code: '60302', label: 'Buku Subledger...', pathName: `${baseUrl}/fa/buku-subledger?tabId=${tabId}` },
                                            { code: '60303', label: 'Rekap dan Detail Mutasi Subledger', pathName: `${baseUrl}/fa/rekap-dan-detail-mutasi-subledger?tabId=${tabId}` },
                                            { code: '60304', label: 'Buku Mutasi Kas dan Bank', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '60305', label: 'Buku Mutasi Hutang (AP)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '60306', label: 'Buku Mutasi Piutang (AR)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['60401', '60402', '60403', '60404', '60405', '60406'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Analisa')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60401', label: 'Analisa Hutang (AP)...', pathName: `${baseUrl}/fa/analisa/analisa-hutang?tabId=${tabId}` },
                                            { code: '60402', label: 'Analisa Pembayaran Hutang', pathName: `${baseUrl}/fa/analisa/analisa-pembayaran-hutang/AnalisaPembayaranHutang?tabId=${tabId}` },
                                            { code: '60403', label: 'Analisa Piutang (AR)...', pathName: `${baseUrl}/fa/analisa/analisa-piutang?tabId=${tabId}` },
                                            { code: '60404', label: 'Analisa Piutang Overdue', pathName: `${baseUrl}/fa/analisa/analisa-piutang-overdue/AnalisaPiutangOverdue?tabId=${tabId}` },
                                            {
                                                code: '60405',
                                                label: 'Analisa Penerimaan Piutang (Hasil Penagihan)',
                                                pathName: `${baseUrl}/fa/analisa/analisa-penerimaan-piutang/AnalisaPenerimaanPiutang?tabId=${tabId}`,
                                            },
                                            { code: '60406', label: 'Analisa Beban Perusahaan', pathName: `${baseUrl}/fa/analisa/analisa-pembebanan-perusahaan/AnalisaBebanPerusahaan?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['60501', '60502', '60503', '60504', '60505'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Bank')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60501', label: 'Mutasi Bank Via API...', pathName: `${baseUrl}/fa/mutasi-bank?tabId=${tabId}` },
                                            { code: '60502', label: 'Komparasi Saldo Akhir Sistem dan API Bank', pathName: `${baseUrl}/fa/komparasi-saldo/KomparasiSaldoList?tabId=${tabId}` },
                                            { code: '60503', label: 'Rekonsiliasi Bank', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '60504', label: 'Buku Bank...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '60505', label: 'Transaksi Bank', pathName: `${baseUrl}/fa/transaksi-bank?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['60601', '60602', '60603', '60604', '60605'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Lainnya')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                                        {[
                                            { code: '60601', label: 'Kas Opname (Cash Count)...', pathName: `${baseUrl}/fa/cash-count/CashCountList?tabId=${tabId}` },
                                            { code: '60602', label: 'History Jurnal Transaksi...', pathName: `${baseUrl}/fa/history-jurnal-transaksi?tabId=${tabId}` },
                                            { code: '60603', label: 'Informasi Keuangan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            // { code: '60604', label: 'Target Rasio Rugi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}`},
                                            { code: '60605', label: 'Pembebanan Selisih Barang...', pathName: `${baseUrl}/fa/pembebanan-selisih-barang?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        {/* KELOMPOK 7 */}
                        {/* <li className="menu nav-item relative"> */}

                        <li
                            className={`menu nav-item relative ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '70000',
                                            '70100',
                                            '70101',
                                            '70102',
                                            '70103',
                                            '70104',
                                            '70105',
                                            '70106',
                                            '70107',
                                            '70108',
                                            '70109',
                                            '70110',
                                            '70111',
                                            '70112',
                                            '70113',
                                            '70114',
                                            '70115',
                                            '70116',
                                            '70117',
                                            '70118',
                                            '70119',
                                            '70120',
                                            '70121',
                                            '70122',
                                            '70123',
                                            '70124',
                                            '70125',
                                            '70126',
                                            '70127',
                                            '70128',
                                            '70200',
                                            '70201',
                                            '70202',
                                            '70203',
                                            '70204',
                                            '70205',
                                            '70206',
                                            '70207',
                                            '70208',
                                            '70209',
                                            '70300',
                                            '70301',
                                            '70302',
                                            '70303',
                                            '70304',
                                            '70305',
                                            '70306',
                                            '70307',
                                            '70308',
                                            '70309',
                                            '70310',
                                            '70311',
                                            '70312',
                                            '70313',
                                            '70314',
                                            '70315',
                                            '70316',
                                            '70317',
                                            '70318',
                                            '70319',
                                            '70320',
                                            '70321',
                                            '70322',
                                            '70323',
                                            '70324',
                                            '70400',
                                            '70401',
                                            '70402',
                                            '70403',
                                            '70404',
                                            '70405',
                                            '70406',
                                            '70407',
                                            '70408',
                                            '70409',
                                            '70410',
                                            '70411',
                                            '70412',
                                            '70413',
                                            '70414',
                                            '70415',
                                            '70416',
                                            '70417',
                                            '70418',
                                            '70500',
                                            '70501',
                                            '70502',
                                            '70503',
                                            '70504',
                                            '70600',
                                            '70601',
                                            '70602',
                                            '70603',
                                            '70604',
                                            '70605',
                                            '70606',
                                            '70607',
                                            '70700',
                                            '70701',
                                            '70702',
                                            '70703',
                                            '70704',
                                            '70705',
                                            '70706',
                                            '70707',
                                            '70708',
                                            '70709',
                                            '70710',
                                            '70711',
                                            '70712',
                                            '70713',
                                            '70714',
                                            '70715',
                                            '70716',
                                            '70800',
                                            '70801',
                                            '70802',
                                            '70803',
                                            '70804',
                                            '70805',
                                            '70806',
                                            '70807',
                                            '70808',
                                            '70809',
                                            '70810',
                                            '70811',
                                            '70812',
                                            '70813',
                                            '70814',
                                            '70815',
                                            '70816',
                                            '70817',
                                            '70818',
                                            '70819',
                                            '70820',
                                            '70821',
                                            '70822',
                                            '70823',
                                            '70824',
                                            '70825',
                                            '70826',
                                            '70827',
                                            '70828',
                                            '70829',
                                            '70900',
                                            '70901',
                                            '70902',
                                            '70903',
                                            '70904',
                                            '70905',
                                            '70906',
                                            '70907',
                                            '70908',
                                            '70909',
                                            '70910',
                                            '70911',
                                            '70912',
                                            '70913',
                                            '70914',
                                            '70915',
                                            '70916',
                                            '70917',
                                            '70918',
                                            '70919',
                                            '70920',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : ''
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faFileLines} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Laporan')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {[
                                    { code: '70100', label: 'Pembelian', pathName: `${baseUrl}/report?tipe=70100&tabId=${tabId}` },
                                    { code: '70200', label: 'Hutang Usaha dan Supplier', pathName: `${baseUrl}/report?tipe=70200&tabId=${tabId}` },
                                    { code: '70300', label: 'Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '70400', label: 'Piutang Usaha dan Customer', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '70500', label: 'Buku Besar', pathName: `${baseUrl}/report?tipe=70500&tabId=${tabId}` },
                                    { code: '70600', label: 'Laporan Keuangan', pathName: `${baseUrl}/report?tipe=70600&tabId=${tabId}` },
                                    { code: '70700', label: 'Persediaan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '70800', label: 'Performa Salesman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '70900', label: 'Laporan Lainnya', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                        {/* KELOMPOK 8 */}
                        {/* <li className="menu nav-item relative"> */}
                        <li
                            className={`menu nav-item relative ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '80000',
                                            '80100',
                                            '80200',
                                            '80300',
                                            '80301',
                                            '80400',
                                            '80500',
                                            '80600',
                                            '80601',
                                            '80602',
                                            '80603',
                                            '80604',
                                            '80700',
                                            '80800',
                                            '80900',
                                            '81000',
                                            '81090',
                                            '81091',
                                            '81092',
                                            '81093',
                                            '81094',
                                            '81095',
                                            '81096',
                                            '81097',
                                            '81098',
                                            '81100',
                                            '81101',
                                            '81102',
                                            '81103',
                                            '81104',
                                            '81105',
                                            '81106',
                                            '81107',
                                            '81108',
                                            '81190',
                                            '81200',
                                            '81201',
                                            '81202',
                                            '81203',
                                            '81204',
                                            '81205',
                                            '81206',
                                            '81300',
                                            '81301',
                                            '81302',
                                            '81303',
                                            '81304',
                                            '81305',
                                            '81306',
                                            '81500',
                                            '81600',
                                            '81700',
                                            '81701',
                                            '81702',
                                            '81800',
                                            '81900',
                                            '81901',
                                            '81902',
                                            '81903',
                                            '81904',
                                            '81905',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : ''
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableList} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Dashboard')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {[
                                    { code: '80100', label: 'Pengadaan', pathName: `${baseUrl}/dashboard/pengadaan-barang?tabId=${tabId}` },
                                    { code: '80200', label: 'Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '80300', label: 'Logistik', pathName: `${baseUrl}/dashboard/logistik/MainPage?tabId=${tabId}` },
                                    { code: '80301', label: 'Stok', pathName: `${baseUrl}/dashboard/stok?tabId=${tabId}` },
                                    { code: '80400', label: 'Hutang Dagang (AP)', pathName: `${baseUrl}/dashboard/reminder-ap/MainPage?tabId=${tabId}` },
                                    { code: '80500', label: 'Piutang Dagang (AR)', pathName: `${baseUrl}/dashboard/analisa-ar-dashboard/MainPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['80601', '80602', '80603', '80604'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Reporting')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '80601', label: 'Followup Penanganan Piutang (AR)...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '80602', label: 'Check Data Penerimaan Piutang...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '80603', label: 'Check Data Faktur Lunas...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '80604', label: 'Buku Lunas...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '80700', label: 'Biaya Operasional Kendaraan', pathName: `${baseUrl}/dashboard/biaya-operasional-kendaraan/BokList?tipe=70500&tabId=${tabId}` },
                                    { code: '80800', label: 'Aktifitas Operasional kendaraan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '80900', label: 'Surat Izin Jalan (Karyawan dan Kendaraan)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '81000', label: 'Monitor PB dan Dokumen Asli', pathName: `${baseUrl}/dashboard/mpda?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['81101', '81102', '81103', '81104', '81105', '81106', '81107', '81108'].some((code) =>
                                                    user.permissions.some((permission) => permission.kode_menu === code)
                                                )
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('KPI Operasional Manager')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '81101', label: 'Dashboard KPI OM', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81102', label: 'Realisasi Penjualan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81103', label: 'Stok Overdue', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81104', label: 'AR Overdue', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81105', label: 'Penggunaan Kendaraan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81106', label: 'Team Bawahan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81107', label: 'Laba Rugi', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81108', label: 'Beban Operasional', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '81190') && (
                                    <button onClick={() => navigateToLink('81190', kode_user, `${baseUrl}/blankPage/blankPage?tabId=${tabId}`)}>{t('KPI Supervisor')}</button>
                                )}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['81201', '81202', '81203', '81204', '81205', '81206'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('KPI Salesman')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '81201', label: 'Dashboard KPI Supervisor', pathName: `${baseUrl}/kpi/sales/kpiDashSupervisor?tabId=${tabId}` },
                                            { code: '81202', label: 'Dashboard KPI Salesman', pathName: `${baseUrl}/kpi/sales/kpiDashSalesman?tabId=${tabId}` },
                                            { code: '81203', label: 'Realisasi Penjualan', pathName: `${baseUrl}/kpi/sales/kpiJual?tabId=${tabId}` },
                                            { code: '81204', label: 'Realisasi Kunjungan', pathName: `${baseUrl}/kpi/sales/kpiKunjung?tabId=${tabId}` },
                                            { code: '81205', label: 'Realisasi Efektif Call', pathName: `${baseUrl}/kpi/sales/kpiCall?tabId=${tabId}` },
                                            { code: '81206', label: 'AR Overdue', pathName: `${baseUrl}/kpi/sales/kpiPiutangOD?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['81301', '81302', '81303', '81304', '81305', '81306'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('KPI Gudang')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '81301', label: 'Dashboard KPI Gudang', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81302', label: 'Hitung dan Rencek', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81303', label: 'Gudang Transit', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81304', label: 'Ketepatan Kirim Laporan Opname', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81305', label: 'Kesesuaian Stok Opname', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81306', label: 'Penggunaan Kendaraan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '81500', label: 'Klaim Barang Kurang (DPP) - BA)', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '81600', label: 'Komparasi Budget Tahunan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['81701', '81702'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Stok Overdue')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '81701', label: 'Dashboard Stok Overdue', pathName: `${baseUrl}/dashboard/stok-overdue?tabId=${tabId}` },
                                            { code: '81702', label: 'Rekapitulasi Stok Overdue', pathName: `${baseUrl}/dashboard/stok-overdue-rekapitulasi?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '81800') && (
                                    <button onClick={() => navigateToLink('81800', kode_user, `${baseUrl}/blankPage/blankPage?tabId=${tabId}`)}>{t('Pre Order Cabang')}</button>
                                )}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user &&
                                                ['81901', '81902', '81903', '81904', '81905'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Standar Harga Jual')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul
                                        className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]"
                                        style={{ maxHeight: '12vh', overflow: 'auto' }}
                                    >
                                        {[
                                            {
                                                code: '81901',
                                                label: 'Perhitungan Dasar Harga Jual Minimal',
                                                pathName: `${baseUrl}/dashboard/standar-harga-jual/perhitungan-dasar-harga-jual-minimal?tabId=${tabId}`,
                                            },
                                            {
                                                code: '81902',
                                                label: 'Simulator Harga Minimal Standar...',
                                                pathName: `${baseUrl}/dashboard/standar-harga-jual/simulasi-harga/SimulasiHarga?tabid=${tabId}`,
                                            },
                                            { code: '81903', label: 'Price List Per Customer...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81904', label: 'Price List General...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '81905', label: 'List Sket dan Berat Item...', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li
                            className={` ${
                                !userAccess.some(
                                    (user) =>
                                        user.user === kode_user &&
                                        [
                                            '90000',
                                            '90100',
                                            '90101',
                                            '90102',
                                            '90200',
                                            '90201',
                                            '90300',
                                            '90301',
                                            '90302',
                                            '90303',
                                            '90400',
                                            '90401',
                                            '90402',
                                            '90500',
                                            '90501',
                                            '90502',
                                            '90600',
                                            '90601',
                                            '90602',
                                            '90603',
                                            '90604',
                                            '90700',
                                            '90800',
                                            '90801',
                                            '90802',
                                            '90803',
                                            '90804',
                                            '90805',
                                            '90900',
                                            '91000',
                                            '91100',
                                            '91200',
                                            '92000',
                                            '92001',
                                        ].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                )
                                    ? 'hidden'
                                    : 'menu nav-item relative'
                            }`}
                        >
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faDiagramProject} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Konsolidasi')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <ul className="sub-menu">
                                {[
                                    { code: '90100', label: 'Keuangan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                    { code: '90200', label: 'Pembelian', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) => user.user === kode_user && ['90301', '90302', '90303'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Logistik')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '90301', label: 'Info Gudang Konsolidasi', pathName: `${baseUrl}/konsolidasi/logistik/info-gudang-konsolidasi?tabId=${tabId}` },
                                            {
                                                code: '90302',
                                                label: 'Pengiriman Barang Pabrik dan Tonase',
                                                pathName: `${baseUrl}/konsolidasi/logistik/pengiriman-barang-pabrik-dan-tonase?tabId=${tabId}`,
                                            },
                                            { code: '90303', label: 'Konsolidasi Hitung dan Rencek', pathName: `${baseUrl}/konsolidasi/logistik/konsolidasi-hitung-dan-rencek?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['90401', '90402'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('PO Outstanding')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '90401', label: 'Daftar PO Outstanding', pathName: `${baseUrl}/konsolidasi/po_outstanding/daftar_po/DaftarPoKonsol?tabId=${tabId}` },
                                            { code: '90402', label: 'Breakdown PO Outstanding', pathName: `${baseUrl}/konsolidasi/po_outstanding/po_breakdown/DaftarPoBreakDown?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['90501', '90502'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Target dan Realisasi Penjualan')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '90501', label: 'Realisasi Per Bulan', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '90502', label: 'Realisasi Per Kuartal', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some(
                                            (user) =>
                                                user.user === kode_user && ['90601', '90602', '90603', '90604'].some((code) => user.permissions.some((permission) => permission.kode_menu === code))
                                        )
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Stok')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '90601', label: 'Stok Konsolidasi', pathName: `${baseUrl}/konsolidasi/stok/stok-konsolidasi?tabId=${tabId}` },
                                            { code: '90602', label: 'Analisa Stok Konsolidasi', pathName: `${baseUrl}/konsolidasi/stok/analisa-stok-konsolidasi?tabId=${tabId}` },
                                            { code: '90603', label: 'Rekapitulasi Harian Mutasi Barang', pathName: `${baseUrl}/konsolidasi/stok/rekapitulasi-harian-mutasi?tabId=${tabId}` },
                                            { code: '90604', label: 'Jadwal dan Hasil Stok Opname...', pathName: `${baseUrl}/konsolidasi/stok/jadwal-dan-hasil-stok?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {userAccess.find((user) => user.user === kode_user)?.permissions.some((permission) => permission.kode_menu === '90700') && (
                                    <button onClick={() => navigateToLink('90700', kode_user, `${baseUrl}/blankPage/blankPage?tabId=${tabId}`)}>{t('Re-Order Point')}</button>
                                )}
                                <li
                                    className={`menu nav-item relative ${
                                        !userAccess.some((user) => user.user === kode_user && ['90802', '90803'].some((code) => user.permissions.some((permission) => permission.kode_menu === code)))
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <button type="button">
                                        {t('Rangking KPI')}
                                        <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-180">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <ul className="absolute top-0 z-[10] hidden min-w-[320px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:right-[100%] rtl:left-[95%]">
                                        {[
                                            { code: '90802', label: 'KPI Operasional Manager', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                            { code: '90803', label: 'KPI Salesman', pathName: `${baseUrl}/blankPage/blankPage?tabId=${tabId}` },
                                        ].map((submenu) => (
                                            <li key={submenu.code}>
                                                {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                                    <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                {[
                                    { code: '90900', label: 'Klaim Barang Kurang (DPP) - BA', pathName: `${baseUrl}/konsolidasi/klaim-barang-kurang/KlaimBarangKurangKons?tabId=${tabId}` },
                                    { code: '91000', label: 'Laporan Keuangan', pathName: `${baseUrl}/konsolidasi/laporan-keuangan?tabId=${tabId}` },
                                    { code: '91100', label: 'Realisasi Pembayaran Ekspedisi (RPE)', pathName: `${baseUrl}/konsolidasi/realisasi-pembayaran/RpeKonsol?tabId=${tabId}` },
                                    { code: '91200', label: 'Realisasi Berita Acara (RBA)', pathName: `${baseUrl}/konsolidasi/realisasi-berita-acara?tabId=${tabId}` },
                                    { code: '92000', label: 'Data Besi Kompetitor', pathName: `${baseUrl}/konsolidasi/data-besi-kompetitor-konsol/DakomListKonsol?tabId=${tabId}` },
                                    { code: '92001', label: 'Informasi Daftar Customer', pathName: `${baseUrl}/konsolidasi/informasi-daftar-customer?tabId=${tabId}` },
                                ].map((submenu) => (
                                    <li key={submenu.code}>
                                        {userAccess.some((user) => user.user === kode_user && user.permissions.some((permission) => permission.kode_menu === submenu.code)) && (
                                            <button onClick={() => navigateToLink(submenu.code, kode_user, submenu.pathName)}>{t(submenu.label)}</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                ) : null}
                {tipe === 'CRM' && (
                    <ul
                        className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-5 py-1.5 font-semibold text-black dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-0.5 xl:space-x-0.5 rtl:space-x-reverse"
                        style={{ background: '#cbcbcb' }}
                    >
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faDiceD6} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Dashboard')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    {/* <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" /> */}
                                    <FontAwesomeIcon icon={faDiceD6} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Sales')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    {/* <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" /> */}
                                    <FontAwesomeIcon icon={faFileLines} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Report')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    {/* <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" /> */}
                                    <FontAwesomeIcon icon={faTableList} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Master')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>

                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faEnvelope} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    {/* <span className="px-1">{t('Message')}</span> */}
                                    <li>
                                        <Link href="/kcn/CRM/messages">{t('Message')}</Link>
                                    </li>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>

                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    {/* <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" /> */}
                                    <FontAwesomeIcon icon={faDiagramProject} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Help')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                    </ul>
                )}

                {tipe === 'HRD' && (
                    <ul
                        className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-5 py-1.5 font-semibold text-black dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-0.5 xl:space-x-0.5 rtl:space-x-reverse"
                        style={{ background: '#cbcbcb' }}
                    >
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Dashboard')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Master')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    {/* <span className="px-1">{t('Message')}</span> */}
                                    <li>
                                        <Link href="/kcn/CRM/chat">{t('Message')}</Link>
                                    </li>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                        <li className="menu nav-item relative">
                            <button type="button" className="nav-link">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTableCellsLarge} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    <span className="px-1">{t('Help')}</span>
                                </div>
                                <div className="right_arrow">
                                    <svg className="rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </header>
    );
};

export default Header;

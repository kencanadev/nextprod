import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import 'flatpickr/dist/flatpickr.css';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-calendars/styles/material.css';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import { FaCamera, FaCreativeCommonsNd, FaGlobe, FaMailBulk, FaSearch } from 'react-icons/fa';
import DialogRelasiForSupplier from './DialogRelasiForSupplier';
import { RelasiInterface } from './interfaceSupplier';
import { Tab } from '@syncfusion/ej2/navigations';
import axios from 'axios';
import { FillFromSQL } from '@/utils/routines';
import Swal from 'sweetalert2';
import JSZip from 'jszip';
import { dataURLtoFile, downloadBase64Image, resetFilePendukung } from '../function/functionSupp';
import { useRouter } from 'next/router';
import moment from 'moment';
import GridRekeningTemp from './GridRekeningTemp';
import GridItemTemp from './GridItemTemp';
import { Query } from '@syncfusion/ej2-data';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
interface dialogBaruEditProps {
    isOpen: boolean;
    onClose: any;
    setDataState: Function;
    DataState: any;
    masterState: any;
    token: any;
    entitas: any;
    userid: any;
    selectedDetailSupplierForEdit: any;
    setSelectedDetailSupplierForEdit: Function;
    originalDataSource: any;
    refreshListData: any;
}
interface DataStateProps {
    kode_cust: string;
    kode_relasi: string;
    no_cust: string;
}
function DialogBaruEditCustomer({
    isOpen,
    onClose,
    setDataState,
    DataState,
    masterState,
    token,
    entitas,
    userid,
    selectedDetailSupplierForEdit,
    setSelectedDetailSupplierForEdit,
    originalDataSource,
    refreshListData,
}: dialogBaruEditProps) {
    // console.log('MASTER STATE : ', masterState);

    const router = useRouter();
    const { norelasi, isRedirectFromSupp, nomor_supplier } = router.query;
    const masterStateUrl = router.query.masterState;
    const gridRekeningSupplier = useRef<any>(null);
    const gridBarangSupplier = useRef<any>(null);

    const [parameter, setParameter] = React.useState<DataStateProps[]>([]);
    const [kode_supplier, setKode_supplier] = React.useState(null);
    const [noCustomerState, setNoCustomerState] = React.useState('');
    const [klarifikasi, setKlarifikasi] = React.useState(true);
    const [selectedRelasi, setSetselectedRelasi] = React.useState<RelasiInterface[]>([]);

    const [listGudang, setListGudang] = React.useState([]);
    const [listSupplierEdit, setListSupplierEdit] = React.useState([]);

    const [isYCek, setIsYCek] = React.useState(false);
    const [isNCek, setIsNCek] = React.useState(false);

    // hidden
    const [kode_relasi, setKode_relasi] = React.useState('');
    const [noSupp, setNoSupp] = React.useState('');
    const [isActive, setIsActive] = React.useState(true);
    const [isFabric, setIsFabric] = React.useState(false);
    const [barangState, setBarangState] = React.useState<[] | any>([]);
    const [barangStateList, setBarangStateList] = React.useState<any[]>([]);
    const [bankState, setBankState] = React.useState([]);
    const [nama_supplier, setNama_supplier] = React.useState('');

    // form tab informasi
    const [alamat, setAlamat] = React.useState('');
    const [alamat2, setAlamat2] = React.useState('');
    const [kodePos, setKodePos] = React.useState('');
    const [kota, setKota] = React.useState('');
    const [provinsi, setProvinsi] = React.useState('');
    const [negara, setNegara] = React.useState('');
    const [NPWP, setNPWP] = React.useState('');
    const [siup, setSiup] = React.useState('');
    const [personal, setPersonal] = React.useState('');
    const [KTP, setKTP] = React.useState('');
    const [SIM, setSIM] = React.useState('');
    const [telp1, setTelp1] = React.useState('');
    const [telp2, setTelp2] = React.useState('');
    const [hp1, setHp1] = React.useState('');
    const [hp2, setHp2] = React.useState('');
    const [Facemile, setFacemile] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [website, setWebsite] = React.useState('');
    const [default_gudang, setDefault_gudang] = React.useState<any>('');
    const [dsMataUang, setDsMataUang] = React.useState([]);
    const [dsAkunHutang, setDsAkunHutang] = React.useState([]);
    const [dsPajak, setDsPajak] = React.useState([]);
    const [dsTermin, setDsTermin] = React.useState([]);
    const [dsJenisVendor, setDsJenisVendor] = React.useState<[] | any>([]);
    // console.log('TOkEN : ', token);
    // image modal
    const [currentImage, setCurrentImage] = React.useState<string | null>(null);
    const [isZoomed, setIsZoomed] = React.useState(false);
    const [zoomLevel, setZoomLevel] = React.useState<number>(1); // Zoom level state
    const [zoomPosition, setZoomPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [translate, setTranslate] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const zoomRef = useRef<HTMLImageElement | null>(null);

    //form tab pembelian
    const [akunHutang, setAkunHutang] = React.useState('');
    const [akunHutangKode, setAkunHutangKode] = React.useState('');
    const [mataUang, setMataUang] = React.useState('IDR');
    const [Termin, setTermin] = React.useState('');
    const [Plafond, setPlafond] = React.useState('');

    // catatan
    const [Catatan, setCatatan] = React.useState('');

    // pembelian
    const [kode_pajak, setKode_pajak] = React.useState('N');
    const [klasifikasi_supplier, setKlasifikasi_supplier] = React.useState('A');
    const [filePendukungList, setFilePendukungList] = React.useState([]);
    const [onEditItem, setOnEditItem] = React.useState(false);

    // Nama Lainya supplier
    const [nama_alias, setNama_alias] = React.useState<string>('');
    const [nama_singkat, setNama_singkat] = React.useState<string>('');
    const [alamatAlias, setAlamatAlias] = React.useState<string>('');
    const [alamatAlias2, setAlamatAlias2] = React.useState<string>('');
    const [kelompok_supplier, setKelompok_supplier] = React.useState('A');

    // usereff validasi
    const terminReff = useRef<HTMLInputElement>(null);
    const noSuppReff = useRef<HTMLInputElement>(null);
    const pajakReff = useRef<HTMLSelectElement>(null);
    const akunHutangReff = useRef<HTMLInputElement>(null);
    const mataUangReff = useRef<HTMLSelectElement>(null);
    const [isOpenLightBox, setOpenLightBox] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [kodeSupp_edit, setKodeSuppEdit] = React.useState('');
    const [query, setQuery] = useState('');

    const [isLoading, setIsLoading] = React.useState(false);

    // useState file pendukung
    const [uploadedFiles, setUploadedFiles] = React.useState<{ [key: string]: File | null | any }>(resetFilePendukung());
    const [tabUploadActive, setTabUploadActive] = React.useState<String | any>(0);
    const [deleteFilePendukung, setDeleteFilePendukung] = React.useState<[] | any>([]);
    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    // console.log('filePendukungList : ', filePendukungList);

    const formatCurrency = (value: string | number | any) => {
        if (!value) return ''; // Jika nilai tidak ada, kembalikan string kosong
        const cleanedValue = value.replace(/[^\d]/g, '');
        const valueReturn = new Intl.NumberFormat('id-ID').format(cleanedValue);
        let retIfNol = valueReturn === '0' ? '' : valueReturn;
        return valueReturn === 'NaN' ? '' : valueReturn;
    };

    const getMataUang = async () => {
        await FillFromSQL(entitas, 'mu', null, token)
            .then((result) => {
                setDsMataUang(result);
                // alert(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const getJenisVendor = async () => {
        await FillFromSQL(entitas, 'jenis_vendor', null, token)
            .then((result) => {
                setDsJenisVendor(result);
                // alert(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const getPajak = async () => {
        await FillFromSQL(entitas, 'pajak', null, token)
            .then((result) => {
                setDsPajak(result);
                // alert(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const getTermin = async () => {
        await FillFromSQL(entitas, 'termin', null, token)
            .then((result) => {
                setDsTermin(result);
                // alert(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const getAkunHutang = async () => {
        const responseGudang = await axios.get(`${apiUrl}/erp/akun_hutang_supplier?`, {
            params: {
                entitas: entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setDsAkunHutang(responseGudang.data.data);
    };

    const convertToNumber = (str: any) => {
        // Menghapus titik dari string
        const number = parseFloat(str.replace(/\./g, ''));

        // Mengembalikan angka dengan empat desimal
        return number.toFixed(4);
    };

    const getOneDetailSupplier = async (kodeSupp_editParam: string = '') => {
        console.log('NAVI EDIT CALL TERPANGGIL', kodeSupp_editParam);
        console.log('selectedDetailSupplierForEdit : ', selectedDetailSupplierForEdit);
        let params = null;
        if (kodeSupp_edit !== '' || kodeSupp_editParam !== '') {
            params = {
                entitas: entitas,
                param1: kodeSupp_edit === '' ? kodeSupp_editParam : kodeSupp_edit,
            };
        }

        if (masterState === 'EDIT' || masterStateUrl === 'EDIT') {
            const response = await axios.get(`${apiUrl}/erp/detail_supplier?`, {
                params:
                    params === null
                        ? {
                              entitas: entitas,
                              param1: selectedDetailSupplierForEdit.length !== 0 ? selectedDetailSupplierForEdit?.master?.kode_supp : DataState?.kode_supp,
                              // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                          }
                        : params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const responseData: SupplierData | any = response.data.data;

            console.log('GET ONE SUPPLIER NO RELASI : ', responseData);

            setListSupplierEdit(responseData);

            if (response.data.data.aktif === 'Y') {
                setIsActive(true);
            } else {
                setIsActive(false);
            }

            // setIsActive();
            setKode_supplier(responseData?.master?.kode_supp);
            setAlamat(responseData?.master?.alamat);
            setAlamat2(responseData?.master?.alamat2);
            setKodePos(responseData?.master?.kodepos);
            setKota(responseData?.master?.kota);
            setProvinsi(responseData?.master?.propinsi);
            setNegara(responseData?.master?.negara);
            setNPWP(responseData?.master?.npwp);
            setSiup(responseData?.master?.siup);
            setPersonal(responseData?.master?.personal);
            setKTP(responseData?.master?.ktp);
            setSIM(responseData?.master?.sim);
            setTelp1(responseData?.master?.telp);
            setTelp2(responseData?.master?.telp2);
            setHp1(responseData?.master?.hp);
            setHp2(responseData?.master?.hp2);
            setFacemile(responseData?.master?.fax);
            setEmail(responseData?.master?.email);
            setWebsite(responseData?.master?.website);
            setKode_relasi(responseData?.master?.kode_relasi);
            setNama_alias(responseData?.master?.alias_nama);
            setAlamatAlias(responseData?.master?.alias_alamat);
            setAlamatAlias2(responseData?.master?.alias_alamat2);
            setNoSupp(responseData?.master?.no_supp);
            setSelectedDate(responseData?.master?.tgl_supp);
            setAkunHutangKode(responseData?.master?.kode_akun_hutang);
            setAkunHutang(responseData?.master?.kode_akun_hutang);
            setMataUang(responseData?.master?.kode_mu);
            setTermin(responseData?.master?.kode_termin);
            setDefault_gudang(responseData?.master?.kode_gudang);
            let tempPlafond = responseData?.master?.plafond.split('.')[0];
            setPlafond(responseData?.master?.plafond === '0' || responseData?.master?.plafond === null || responseData?.master?.plafond === '' ? '0' : formatCurrency(tempPlafond));
            setKode_pajak(responseData?.master?.kode_pajak);
            setBarangState(responseData?.item !== undefined ? responseData?.item : []);
            setBankState(responseData?.rekening !== undefined ? responseData?.rekening : []);
            setSetselectedRelasi([]);
            setCatatan(responseData?.master?.catatan);
            setNama_singkat(responseData?.master?.singkat);
            setNama_supplier(responseData?.master?.nama_relasi);
            setKelompok_supplier(responseData?.master?.kelas_barang);
            setKlasifikasi_supplier(responseData?.master?.kelas);
            setOnEditItem(responseData?.rekening.length !== 0 ? true : false);
            gridRekeningSupplier.current!.dataSource =
                responseData?.rekening.length !== 0
                    ? responseData?.rekening
                    : [
                          {
                              nama_bank: '',
                              no_rekening: '',
                              nama_rekening: '',
                              aktif: 'Y',
                              tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                              userid: userid,
                              pkp: 'N',
                          },
                      ];

            if (responseData?.master?.aktif === 'Y') {
                setIsActive(true);
            }
            if (responseData?.master?.jenis_pabrik === 'Y') {
                setIsFabric(true);
            }

            let temp: any = [];
            responseData?.item.map((item: any) => temp.push(item.nama_jenis_supp));
            setBarangStateList([...temp]);

            if (responseData?.kategori[0]?.jenis_pajak === '0') {
                setIsYCek(true);
            }
            if (responseData?.kategori[0]?.jenis_pajak === '1') {
                setIsNCek(true);
            }
            if (responseData?.kategori[0]?.jenis_pajak === '2') {
                setIsYCek(true);
                setIsNCek(true);
            }

            try {
                let params = null;
                if (kodeSupp_edit !== '' || kodeSupp_editParam !== '') {
                    params = {
                        entitas: entitas,
                        nama_zip: `IMG_${kodeSupp_edit === '' ? kodeSupp_editParam : kodeSupp_edit}.zip`,
                    };
                }
                const resFilePendukung = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                    params:
                        params === null
                            ? {
                                  entitas: entitas,
                                  nama_zip: `IMG_${selectedDetailSupplierForEdit.length !== 0 ? selectedDetailSupplierForEdit?.master?.kode_supp : DataState?.kode_supp}.zip`,
                                  // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                              }
                            : params,
                });

                if (resFilePendukung.data.status === true) {
                    console.log('FILE PENDUKUNG LIST step 1', resFilePendukung);

                    setFilePendukungList(resFilePendukung.data.images);
                    let params = null;
                    if (kodeSupp_edit !== '' || kodeSupp_editParam !== '') {
                        params = {
                            entitas: entitas,
                            param1: kodeSupp_edit === '' ? kodeSupp_editParam : kodeSupp_edit,
                        };
                    }
                    const resTbImages = await axios.get(`${apiUrl}/erp/load_images`, {
                        params:
                            params === null
                                ? {
                                      entitas: entitas,
                                      param1: selectedDetailSupplierForEdit.length !== 0 ? selectedDetailSupplierForEdit?.master?.kode_supp : DataState?.kode_supp,
                                      // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                                  }
                                : params,
                    });
                    const jsonData = [];
                    if (resTbImages.data.status === true) {
                        console.log('FILE PENDUKUNG LIST step 2', kodeSupp_edit);
                        resTbImages.data.data.map((item: any) => {
                            console.log('FILE PENDUKUNG LIST step 3:', { item }, resFilePendukung.data.images);
                            const filterFilePendukung = resFilePendukung.data.images.filter((extractZipEach: any) => extractZipEach.fileName === item.filegambar);
                            console.log('FILE PENDUKUNG LIST Step last :  ', filterFilePendukung[0].imageUrl);
                            // const imageUrl = filterFilePendukung[0].imageUrl;
                            // const fileName = filterFilePendukung[0].fileName;
                            fetch(filterFilePendukung[0].imageUrl)
                                .then((res) => res.blob())
                                .then((blob) => {
                                    const file = new File([blob], item.filegambar, { type: 'image/jpg' });
                                    setUploadedFiles((prevFiles) => ({
                                        ...prevFiles,
                                        [item.id_dokumen]: {
                                            renamedFile: file,
                                            fileUrl: filterFilePendukung[0].imageUrl,
                                            tabIndex: item.id_dokumen,
                                        },
                                    }));
                                });

                            // setUploadedFiles((prevFiles) => ({
                            //     ...prevFiles,
                            //     [item.id_dokumenn] : {}
                            // }));
                        });
                    }
                }
            } catch (error) {
                console.log('ERROR SAAT GET FILE PENDUKUNG :', error);
            }
        } else {
            return;
        }
    };
    const handleOpenModal = (fileUrl: string) => {
        setCurrentImage(fileUrl);
        setOpenLightBox(true);
    };

    const handleCloseModal = () => {
        setOpenLightBox(false);
        setCurrentImage(null);
        setIsZoomed(false);
        setZoomPosition({ x: 0, y: 0 });
        setTranslate({ x: 0, y: 0 });
        setZoomLevel(1); // Reset zoom level on close
    };

    const handleZoom = useCallback(
        (e: React.MouseEvent<HTMLImageElement>) => {
            if (isZoomed) {
                // Reset zoom and drag state
                setIsZoomed(false);
                setZoomPosition({ x: 0, y: 0 });
                setTranslate({ x: 0, y: 0 });
                setZoomLevel(1);
            } else {
                const { clientX, clientY } = e;
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();

                // Calculate click position relative to the image
                const x = ((clientX - left) / width) * 100;
                const y = ((clientY - top) / height) * 100;

                setZoomPosition({ x, y });
                setIsZoomed(true);
                setZoomLevel(2); // Start zoom level
            }
        },
        [isZoomed]
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!isZoomed || !zoomRef.current) return;

        // Calculate the translation position for dragging
        const movementX = e.movementX;
        const movementY = e.movementY;

        setTranslate((prev) => ({
            x: prev.x + movementX,
            y: prev.y + movementY,
        }));
    };

    const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
        if (!isZoomed) return;

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoomLevel = Math.min(Math.max(zoomLevel + delta, 1), 5); // Restrict zoom level between 1 and 5

        setZoomLevel(newZoomLevel);
    };
    React.useEffect(() => {
        if (masterState === 'BARU') {
            setAlamat(selectedRelasi[0]?.alamat);
            setAlamat2(selectedRelasi[0]?.alamat2);
            setKodePos(selectedRelasi[0]?.kodepos);
            setKota(selectedRelasi[0]?.kota);
            setProvinsi(selectedRelasi[0]?.propinsi);
            setNegara(selectedRelasi[0]?.negara);
            setNPWP(selectedRelasi[0]?.npwp);
            setSiup(selectedRelasi[0]?.siup);
            setPersonal(selectedRelasi[0]?.personal);
            setKTP(selectedRelasi[0]?.ktp);
            setSIM(selectedRelasi[0]?.sim);
            setTelp1(selectedRelasi[0]?.telp);
            setTelp2(selectedRelasi[0]?.telp2);
            setHp1(selectedRelasi[0]?.hp);
            setHp2(selectedRelasi[0]?.hp2);
            setFacemile(selectedRelasi[0]?.fax);
            setEmail(selectedRelasi[0]?.email);
            setWebsite(selectedRelasi[0]?.website);
            setKode_relasi(selectedRelasi[0]?.kode_relasi);
            setNama_alias(selectedRelasi[0]?.nama_relasi);
            setAlamatAlias(selectedRelasi[0]?.alamat);
            setAlamatAlias2(selectedRelasi[0]?.alamat2);
            setNama_supplier(selectedRelasi[0]?.nama_relasi);
        }
    }, [selectedRelasi]);

    const navigationBaruHandle = async (norelasi: any) => {
        const responseHeader = await axios.get(`${apiUrl}/erp/master_daftar_relasi?`, {
            params: {
                entitas: entitas,
                param1: norelasi,
                param2: 'all',
                param3: 'all',
                paramLimit: 1,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const responseDataHeader = responseHeader.data.data[0];
        setAlamat(responseDataHeader?.alamat);
        setAlamat2(responseDataHeader?.alamat2);
        setKodePos(responseDataHeader?.kodepos);
        setKota(responseDataHeader?.kota);
        setProvinsi(responseDataHeader?.propinsi);
        setNegara(responseDataHeader?.negara);
        setNPWP(responseDataHeader?.npwp);
        setSiup(responseDataHeader?.siup);
        setPersonal(responseDataHeader?.personal);
        setKTP(responseDataHeader?.ktp);
        setSIM(responseDataHeader?.sim);
        setTelp1(responseDataHeader?.telp);
        setTelp2(responseDataHeader?.telp2);
        setHp1(responseDataHeader?.hp);
        setHp2(responseDataHeader?.hp2);
        setFacemile(responseDataHeader?.fax);
        setEmail(responseDataHeader?.email);
        setWebsite(responseDataHeader?.website);
        setKode_relasi(responseDataHeader?.kode_relasi);
        setNama_alias(responseDataHeader?.nama_relasi);
        setAlamatAlias(responseDataHeader?.alamat);
        setAlamatAlias2(responseDataHeader?.alamat2);
        setNama_supplier(responseDataHeader?.nama_relasi);
    };

    const navigationEditHandle = async (nomor_supplier: any) => {
        // console.log('NAVI EDIT CALL');

        const response = await axios.get(`${apiUrl}/erp/list_supplier?`, {
            params: {
                entitas: entitas,
                param1: 'all',
                param2: 'all',
                param3: 'all',
                param4: nomor_supplier,
                param5: 'all',
                param6: 'all',
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const responseData = response.data.data[0];
        // console.log('GET ONE SUPPLIER NO RELASI : ', responseData);
        setKodeSuppEdit(responseData?.kode_supp);

        await getOneDetailSupplier(responseData?.kode_supp);
    };

    React.useEffect(() => {
        if (norelasi || masterStateUrl || nomor_supplier) {
            if (masterStateUrl === 'BARU') {
                navigationBaruHandle(norelasi);
            } else if (masterStateUrl === 'EDIT') {
                navigationEditHandle(nomor_supplier);
            }
        } else if (isRedirectFromSupp) {
            setDialogVisibilityForDialogRelasiSupplier(true);
        }
    }, [norelasi, masterStateUrl, isRedirectFromSupp]);

    // UseState untuk Header Dialog
    function formatDate(date: Date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            time = d.getHours();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-') + ' ' + time;
    }

    // console.log("KODE_RELASI : ",kode_relasi);

    let dateNow = moment(new Date()).format('DD-MM-YYYY');
    const [selectedDate, setSelectedDate] = React.useState<Date | null | String | any>(dateNow);
    const [visibilityForDialogRelasiSupplier, setDialogVisibilityForDialogRelasiSupplier] = React.useState(false);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    React.useEffect(() => {
        setParameter([DataState]);
    }, [DataState, noCustomerState]);
    let buttonInputData: ButtonPropsModel[];
    const closeDialogBaruEdit = () => {
        resetForm();
        router.push(
            {
                pathname: router.pathname,
                query: { tabId }, // Hanya simpan tabId
            },
            undefined,
            { shallow: true }
        );
        setKodeSuppEdit('');
        getKodeSupplier();
        onClose();
        // setTimeout(() => {
        // }, 500);
    };

    const handleUpdateData = async () => {
        if (noSupp === '' || noSupp === null) {
            noSuppReff.current?.focus();
            return Swal.fire({
                title: 'Nomor Supplier tidak boleh kosong',
                text: 'Pastikan field nomor supplier terisi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (Termin === '' || Termin === null) {
            terminReff.current?.focus();
            return Swal.fire({
                title: 'Termin tidak boleh kosong',
                text: 'Pastikan formulir Termin terisi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (isNaN(parseFloat(convertToNumber(Plafond)))) {
            return Swal.fire({
                title: 'Plafond tidak boleh kosong',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (kelompok_supplier === '' || kelompok_supplier === null) {
            return Swal.fire({
                title: 'Pilih kelompok supplier terlebih dahulu',
                text: 'Pilih kelompok supplier di tab lain-lain',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (mataUang === '' || mataUang === null) {
            mataUangReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Mata Uang terlebih dahulu',
                text: 'Pilih Mata Uang di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }
        if (akunHutang === '' || akunHutang === null) {
            akunHutangReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Akun Hutang terlebih dahulu',
                text: 'Pilih Akun Hutang di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (kode_pajak === '' || kode_pajak === null) {
            pajakReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Pajak Pembelian terlebih dahulu',
                text: 'Pilih Pajak Pembelian di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (klasifikasi_supplier === '' || klasifikasi_supplier === null) {
            return Swal.fire({
                title: 'Pilih Klasifikasi supplier terlebih dahulu',
                text: 'Pilih Klasifikasi supplier di tab informasi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        let remapRekening;

        let remapItemV1: any, rempaItemV2: any;
        if (kelompok_supplier === 'V') {
            // barangState.map((item: any,index : number) => kategori[0].k1 = item.)
            remapItemV1 = [...gridBarangSupplier.current!.dataSource];
            remapItemV1.forEach((item: any) => {
                const matchingJenis = dsJenisVendor.find((jenis: any) => jenis.nama_jenis_supp.toLowerCase() === item.nama_jenis_supp.toLowerCase());
                if (matchingJenis) {
                    item.kode_jenis = matchingJenis.kode_jenis;
                    item.kode_supp = kode_supplier;
                }
            });

            rempaItemV2 = remapItemV1.filter((item: any) => {
                // Pastikan item adalah object, bukan array (pada kasus array nested di index kedua)
                if (Array.isArray(item)) return true;

                // Hanya simpan elemen yang ukuran tidak kosong dan harga tidak null
                return item.ukuran !== '' && item.harga !== null;
            });
        }
        // remapsini
        remapRekening = gridRekeningSupplier.current!.dataSource.map((item: any) => ({
            ...item,
            kode_supp: kode_supplier,
        }));

        let jenis_pajak;
        if (isYCek) {
            jenis_pajak = 0;
        }
        if (isNCek) {
            jenis_pajak = 1;
        }
        if (isYCek && isNCek) {
            jenis_pajak = 2;
        }
        if (isYCek === false && isNCek === false) {
            jenis_pajak = null;
        }
        let kategori = [
            {
                k1: 'N',
                k2: 'N',
                k3: 'N',
                k4: 'N',
                k5: 'N',
                k6: 'N',
                k7: 'N',
                k8: 'N',
                k9: 'N',
                k10: 'N',
                k11: 'N',
                k12: 'N',
                k13: 'N',
                k14: 'N',
                k15: 'N',
                k16: 'N',
                k17: 'N',
                k18: 'N',
                k19: 'N',
                k20: 'N',
                jenis_pajak: jenis_pajak,
                userid: userid.toUpperCase(),
            },
        ];

        barangState.forEach((item: any) => {
            // Check if kode_jenis is 2
            if (item.kode_jenis === 1) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k1 = 'Y';
            } else if (item.kode_jenis === 2) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k2 = 'Y';
            } else if (item.kode_jenis === 3) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k3 = 'Y';
            } else if (item.kode_jenis === 4) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k4 = 'Y';
            } else if (item.kode_jenis === 5) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k5 = 'Y';
            } else if (item.kode_jenis === 6) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k6 = 'Y';
            } else if (item.kode_jenis === 7) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k7 = 'Y';
            } else if (item.kode_jenis === 8) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k8 = 'Y';
            } else if (item.kode_jenis === 9) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k9 = 'Y';
            } else if (item.kode_jenis === 10) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k10 = 'Y';
            } else if (item.kode_jenis === 12) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k12 = 'Y';
            } else if (item.kode_jenis === 13) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k13 = 'Y';
            } else if (item.kode_jenis === 14) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k14 = 'Y';
            } else if (item.kode_jenis === 15) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k15 = 'Y';
            }
        });

        console.log('INPUTAN KATEGORI Update', kategori);
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD HH:mm:ss');
        const data = {
            entitas: entitas,
            kode_supp: kode_supplier,
            kode_relasi: kode_relasi,
            no_supp: noSupp,
            aktif: isActive ? 'Y' : 'N',
            tgl_supp: formattedDate,
            kode_akun_hutang: akunHutangKode,
            kode_termin: Termin,
            kode_mu: mataUang,
            tipe: 'LOKAL',
            diskon_def: 0,
            kode_pajak,
            tipe_pajak: '1',
            catatan: Catatan,
            userid: userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_akun_beban: akunHutang,
            beban_dikirim: '0',
            beban_diambil: '0',
            plafond: isNaN(parseFloat(convertToNumber(Plafond))) ? 0 : convertToNumber(Plafond),
            kode_gudang: default_gudang,
            alias_nama: nama_alias,
            alias_alamat: alamatAlias,
            alias_alamat2: alamatAlias2,
            singkat: nama_singkat,
            kelas: klasifikasi_supplier,
            jenis_pabrik: isFabric ? 'Y' : 'N',
            kelas_barang: kelompok_supplier,
            item: kelompok_supplier === 'V' ? remapItemV1 : [],
            rekening: remapRekening,
            nama_relasi: nama_supplier,
            kategori: kelompok_supplier === 'V' ? kategori : [],
        };

        console.log('Inputan update: ', data, kode_relasi);

        try {
            const response = await axios.patch(`${apiUrl}/erp/update_supplier`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Response supplier update : ', response);
            if (response.status === 201) {
                // await axios.
                await handleUploadZip(kode_supplier);
                const auditReqBodySPM = {
                    entitas: entitas,
                    kode_audit: null,
                    dokumen: 'SP',
                    kode_dokumen: data.kode_supp,
                    no_dokumen: data.no_supp,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'EDIT',
                    diskripsi: `Supplier Edit = [ ${data.no_supp} ] - ${nama_supplier}`,
                    userid: userid,
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await Swal.fire({
                    title: 'Edit Supplier Berhasil',
                    icon: 'success',
                    target: '#main-target',
                    timer: 3000,
                });
                resetForm();
                await refreshListData();
                onClose();
                return;
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Edit Supplier Gagal',
                text: 'Error karena : ' + error?.response?.data?.serverMessage + ' ',
                icon: 'error',
                target: '#DialogBaruEdit',
                timer: 3000,
            });
            console.log('EDIT SUPPLIER ERROR :', error);
            return;
        }
    };

    const saveDialogSupplier = async () => {
        if (selectedRelasi[0]?.nama_relasi === undefined || selectedRelasi[0]?.nama_relasi === '') {
            return Swal.fire({
                title: 'Pilih terlebih dahulu nama supplier nya',
                text: 'Pastikan pilih relasi nya terlebih dahulu',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (noSupp === '' || noSupp === null) {
            noSuppReff.current?.focus();
            return Swal.fire({
                title: 'Nomor Supplier tidak boleh kosong',
                text: 'Pastikan field nomor supplier terisi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (Termin === '' || Termin === null) {
            terminReff.current?.focus();
            return Swal.fire({
                title: 'Termin tidak boleh kosong',
                text: 'Pastikan formulir Termin terisi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (kelompok_supplier === '' || kelompok_supplier === null) {
            return Swal.fire({
                title: 'Pilih kelompok supplier terlebih dahulu',
                text: 'Pilih kelompok supplier di tab lain-lain',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (mataUang === '' || mataUang === null) {
            mataUangReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Mata Uang terlebih dahulu',
                text: 'Pilih Mata Uang di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }
        if (akunHutang === '' || akunHutang === null) {
            akunHutangReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Akun Hutang terlebih dahulu',
                text: 'Pilih Akun Hutang di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (kode_pajak === '' || kode_pajak === null) {
            pajakReff.current?.focus();
            return Swal.fire({
                title: 'Pilih Pajak Pembelian terlebih dahulu',
                text: 'Pilih Pajak Pembelian di tab pembelian',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }

        if (klasifikasi_supplier === '' || klasifikasi_supplier === null) {
            return Swal.fire({
                title: 'Pilih Klasifikasi supplier terlebih dahulu',
                text: 'Pilih Klasifikasi supplier di tab informasi',
                icon: 'warning',
                target: '#DialogBaruEdit',
            });
        }
        let jenis_pajak;
        if (isYCek) {
            jenis_pajak = 0;
        }
        if (isNCek) {
            jenis_pajak = 1;
        }
        if (isYCek && isNCek) {
            jenis_pajak = 2;
        }
        if (isYCek === false && isNCek === false) {
            jenis_pajak = null;
        }
        let kategori = [
            {
                k1: 'N',
                k2: 'N',
                k3: 'N',
                k4: 'N',
                k5: 'N',
                k6: 'N',
                k7: 'N',
                k8: 'N',
                k9: 'N',
                k10: 'N',
                k11: 'N',
                k12: 'N',
                k13: 'N',
                k14: 'N',
                k15: 'N',
                k16: 'N',
                k17: 'N',
                k18: 'N',
                k19: 'N',
                k20: 'N',
                jenis_pajak: jenis_pajak,
                userid: userid.toUpperCase(),
            },
        ];

        barangState.forEach((item: any) => {
            // Check if kode_jenis is 2
            if (item.kode_jenis === 1) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k1 = 'Y';
            } else if (item.kode_jenis === 2) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k2 = 'Y';
            } else if (item.kode_jenis === 3) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k3 = 'Y';
            } else if (item.kode_jenis === 4) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k4 = 'Y';
            } else if (item.kode_jenis === 5) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k5 = 'Y';
            } else if (item.kode_jenis === 6) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k6 = 'Y';
            } else if (item.kode_jenis === 7) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k7 = 'Y';
            } else if (item.kode_jenis === 8) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k8 = 'Y';
            } else if (item.kode_jenis === 9) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k9 = 'Y';
            } else if (item.kode_jenis === 10) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k10 = 'Y';
            } else if (item.kode_jenis === 12) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k12 = 'Y';
            } else if (item.kode_jenis === 13) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k13 = 'Y';
            } else if (item.kode_jenis === 14) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k14 = 'Y';
            } else if (item.kode_jenis === 15) {
                // Update the corresponding key in kategori to "Y"
                kategori[0].k15 = 'Y';
            }
        });

        console.log('INPUTAN KATEGORI ', kategori);
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD HH:mm:ss');
        let remapItemV1: any, rempaItemV2: any;
        if (kelompok_supplier === 'V') {
            // barangState.map((item: any,index : number) => kategori[0].k1 = item.)
            remapItemV1 = [...gridBarangSupplier.current!.dataSource];
            remapItemV1.forEach((item: any) => {
                const matchingJenis = dsJenisVendor.find((jenis: any) => jenis.nama_jenis_supp.toLowerCase() === item.nama_jenis_supp.toLowerCase());
                if (matchingJenis) {
                    item.kode_jenis = matchingJenis.kode_jenis;
                }
            });

            rempaItemV2 = remapItemV1.filter((item: any) => {
                // Pastikan item adalah object, bukan array (pada kasus array nested di index kedua)
                if (Array.isArray(item)) return true;

                // Hanya simpan elemen yang ukuran tidak kosong dan harga tidak null
                return item.ukuran !== '' && item.harga !== null;
            });
        }
        const data = {
            entitas: entitas,
            kode_relasi,
            no_supp: noSupp,
            aktif: isActive ? 'Y' : 'N',
            tgl_supp: formattedDate === 'Invalid date' ? moment().format('YYYY-MM-DD HH:mm:ss') : formattedDate,
            kode_akun_hutang: akunHutangKode,
            kode_termin: Termin,
            kode_mu: mataUang,
            tipe: 'LOKAL',
            diskon_def: 0,
            kode_pajak,
            tipe_pajak: '1',
            catatan: Catatan,
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_akun_beban: akunHutang,
            beban_dikirim: '0',
            beban_diambil: '0',
            plafond: convertToNumber(Plafond),
            kode_gudang: default_gudang,
            alias_nama: nama_alias,
            alias_alamat: alamatAlias,
            alias_alamat2: alamatAlias2,
            singkat: nama_singkat,
            kelas: klasifikasi_supplier,
            jenis_pabrik: isFabric ? 'Y' : 'N',
            kelas_barang: kelompok_supplier,
            item: kelompok_supplier === 'V' ? remapItemV1 : [],
            rekening: gridRekeningSupplier.current!.dataSource,
            kategori: kelompok_supplier === 'V' ? kategori : [],
        };

        console.log('Inputan Savedoc: ', data);

        try {
            const response = await axios.post(`${apiUrl}/erp/simpan_supplier`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Response supplier savedoc: ', response);
            if (response.status === 201) {
                await handleUploadZip(response.data.kode_dokumen);
                const auditReqBodySPM = {
                    entitas: entitas,
                    kode_audit: null,
                    dokumen: 'SP',
                    kode_dokumen: response.data.kode_dokumen,
                    no_dokumen: data.no_supp,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'NEW',
                    diskripsi: `Supplier baru = [ ${data.no_supp} ] - ${nama_supplier}`,
                    userid: userid,
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                };
                await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBodySPM);
                await Swal.fire({
                    title: 'Tambah Supplier Berhasil',
                    icon: 'success',
                    target: '#main-target',
                    timer: 3000,
                });
                resetForm();
                await refreshListData();
                onClose();
                return;
            }
        } catch (error: any) {
            await Swal.fire({
                title: 'Tambah Supplier Gagal',
                text: 'Error karena : ' + error?.response?.data?.serverMessage + ' ',
                icon: 'error',
                target: '#DialogBaruEdit',
                timer: 3000,
            });
            console.log('ERROR savedoc ', error);
            return;
        }
    };

    const resetForm = () => {
        setAlamat('');
        setNama_supplier('');
        setAlamat2('');
        setKodePos('');
        setKota('');
        setProvinsi('');
        setNegara('');
        setNPWP('');
        setSiup('');
        setPersonal('');
        setKTP('');
        setSIM('');
        setTelp1('');
        setTelp2('');
        setHp1('');
        setHp2('');
        setFacemile('');
        setEmail('');
        setWebsite('');
        setKode_relasi('');
        setNama_alias('');
        setAlamatAlias('');
        setAlamatAlias2('');
        setNoSupp('');
        setSelectedDate(dateNow);
        setAkunHutangKode('');
        setAkunHutang('');
        setMataUang('');
        setTermin('');
        setPlafond('');
        setKode_pajak('');
        setBarangState([]);
        setBarangState([]);
        setSetselectedRelasi([]);
        setCatatan('');
        setNama_singkat('');
        setListSupplierEdit([]);
        setSelectedDetailSupplierForEdit([]);
        setDataState([]);
        setBankState([]);
        setUploadedFiles(resetFilePendukung());
        setDataState([]);
        setBarangStateList([]);
        setKlasifikasi_supplier('A');
        setKelompok_supplier('A');
        setTabUploadActive(0);
        setIsNCek(false);
        setIsYCek(false);
        setIsActive(true);
        setIsFabric(false);
        gridRekeningSupplier.current!.dataSource = [
            {
                nama_bank: '',
                no_rekening: '',
                nama_rekening: '',
                aktif: 'Y',
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                userid: userid,
                pkp: 'N',
            },
        ];
    };

    // console.log('Barang State List : ', barangStateList);

    buttonInputData = [
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: masterState === 'BARU' ? saveDialogSupplier : handleUpdateData,
        },
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: closeDialogBaruEdit,
        },
    ];

    // console.log(masterState);

    const styleButton = {
        width: 100 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };
    const styleButtonFilePendukung = {
        width: 125 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const onFiltering = (args: any) => {
        let query = new Query();
        query = args.text !== '' ? query.where('Country', 'startswith', args.text, true) : query;
        args.updateData(listGudang, query);
    };

    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    let tabDialogRelasi: Tab | any;
    let tabDialogFilePendukung: Tab | any;

    // variabel untuk upload gambar di file pendukung
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: { target: { files: any[] } } | any) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'image/jpeg') {
            const file = event.target.files[0];
            if (file) {
                // Generate a datetime string
                const now = new Date();
                const year = now.getFullYear().toString().slice(-2); // Last 2 digits of the year
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');

                const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;

                // Create a new file name with the datetime string and original file extension
                const extension = file.name.split('.').pop();
                const newFileName = `${dateTimeString}.${extension}`;

                // Use a File constructor to create a new file object with the new name
                const renamedFile = new File([file], 'SP' + newFileName, { type: file.type });

                const reader = new FileReader();
                reader.readAsDataURL(renamedFile);
                reader.onloadend = () => {
                    const temp = uploadedFiles;
                    let currentTab = tabUploadActive;
                    temp[parseInt(tabUploadActive + 1)] = { renamedFile, fileUrl: reader.result as string, tabIndex: parseInt(tabUploadActive + 1) };
                    console.log('Upload file hapus : ', temp);
                    setTabUploadActive(-1);
                    setTimeout(() => {
                        setTabUploadActive(currentTab);
                    }, 100);
                    setUploadedFiles(temp);
                    // setUploadedFiles((prevFiles) => ({
                    //     ...prevFiles,
                    //     [tabUploadActive + 1]: { renamedFile, fileUrl: reader.result as string, tabIndex: tabUploadActive + 1 },
                    // }));
                };
            }
        } else {
            alert('Please upload a JPG file.');
        }
        // Reset the input value to allow re-upload of the same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // console.log('UPLOAD FILE CHANGE: ', uploadedFiles);

    const handleChangeKlasifikasi = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== 'e') {
            setKlasifikasi_supplier(event.target.value);
            setKelompok_supplier('A');
        }
    };

    const handleChangeKelompok = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('KELOMPOK KELAS BARANG : ', event.target.value);
        if (klasifikasi_supplier === 'E' && event.target.value !== 'V') {
            setKelompok_supplier(event.target.value);
            setKlasifikasi_supplier('A');
            return;
        }

        setKelompok_supplier(event.target.value);
    };

    const handleKlassEKelompokE = () => {
        setKlasifikasi_supplier('E');
        setKelompok_supplier('V');
    };

    const clickTabIndex = (event: any) => {
        const tabIndex = event.currentTarget.tabIndex;
        setTabUploadActive(tabIndex);
        // console.log('Tab index clicked:', tabIndex);
        //
        // e-item e-toolbar-item e-active
    };

    // console.log({ selectedRelasi });
    const getGudang = async () => {
        const responseGudang = await axios.get(`${apiUrl}/erp/master_gudang?`, {
            params: {
                entitas: entitas,
            },
        });

        const sortGudang = responseGudang.data.data.sort((a: any, b: any) => a.nama_gudang.localeCompare(b.nama_gudang));

        // const mod = sortGudang.map((item: any) => ({
        //     value: item.kode_gudang,
        //     label: item.nama_gudang,

        // }))

        setListGudang(sortGudang);
        // console.log('RESPONSE GUDANG : ', responseGudang);
    };

    const getKodeSupplier = async () => {
        const responseGudang = await axios.get(`${apiUrl}/erp/generate_no_supplier?`, {
            params: {
                entitas: entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setNoSupp(responseGudang.data.data);

        if (masterState === 'BARU') {
            const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    entitas: entitas,
                },
            });
            setAkunHutang(responseSetting.data.data[0].no_hutang);
            setAkunHutangKode(responseSetting.data.data[0].kode_akun_hutang);
        }
    };

    const handleDeleteFilePendukungOne = () => {
        Swal.fire({
            title: 'Yakin hapus File Pendukung urutan ke ' + parseInt(tabUploadActive + 1),
            text: 'Tekan ya jia yakin!',
            icon: 'warning',
            target: '#DialogBaruEdit',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya hapus!',
        }).then((result) => {
            if (result.isConfirmed) {
                const temp = uploadedFiles;
                temp[parseInt(tabUploadActive + 1)] = { renamedFile: null, fileUrl: null, tabIndex: parseInt(tabUploadActive + 1) };
                console.log('Upload file hapus : ', temp);
                setDeleteFilePendukung([...deleteFilePendukung, tabUploadActive + 1]);

                setUploadedFiles(temp);
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'File pendukung ' + parseInt(tabUploadActive + 1),
                    icon: 'success',
                    target: '#DialogBaruEdit',
                });
            }
        });
    };
    const handleBersihkanSemua = () => {
        Swal.fire({
            title: 'Hapus Semua gambar',
            text: 'Tekan ya jia yakin!',
            icon: 'warning',
            target: '#DialogBaruEdit',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya hapus!',
        }).then((result) => {
            if (result.isConfirmed) {
                const temp = Object.values(uploadedFiles).filter((item) => item.renamedFile !== null);
                let tempIndexForDelete: any = [];
                temp.map((item) => tempIndexForDelete.push(item.tabIndex));

                console.log('Upload file hapus : ', tempIndexForDelete);
                setDeleteFilePendukung([...tempIndexForDelete]);

                setUploadedFiles(resetFilePendukung());
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'File pendukung ',
                    icon: 'success',
                    target: '#DialogBaruEdit',
                });
            }
        });
    };

    useEffect(() => {
            const dialogElement = document.getElementById('DialogBaruEdit');
            if (dialogElement) {
                dialogElement.style.maxHeight = 'none';
                dialogElement.style.maxWidth = 'none';
            }
        }, []);

    useEffect(() => {
        getKodeSupplier();
        getMataUang();
        getGudang();
        getPajak();
        getTermin();
        getAkunHutang();
        getJenisVendor();
    }, [masterState]);

    useEffect(() => {
        if (masterState === 'EDIT') {
            resetForm();
            getOneDetailSupplier();
        }
    }, [masterState, kodeSupp_edit]);
    // useEffect(() => {
    //     if(kodeSupp_edit !== "") {

    //     }
    // }, [kodeSupp_edit]);

    const handleForCurrency = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        setPlafond(formatCurrency(rawValue)); // Set nilai input dengan format currency
    };

    const handleUploadZip = async (kode_dokumen: any) => {
        // console.log('MASUK HANDLE UPLOAD :', Object.keys(uploadedFiles).length);

        const formData = new FormData();
        const jsonData = [];
        const zip = new JSZip();
        let namaFileImage: any;

        if (masterState === 'EDIT' && deleteFilePendukung.length > 0) {
            try {
                const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                    params: {
                        entitas: entitas,
                        param1: selectedDetailSupplierForEdit.length !== 0 ? selectedDetailSupplierForEdit?.master?.kode_supp : DataState?.kode_supp,
                        param2: `${deleteFilePendukung},999`, // Sesuaikan dengan data yang diperlukan untuk menghapus
                    },
                });
                console.log('Response dari penghapusan file pendukung:', response.data);
            } catch (error: any) {
                await Swal.fire({
                    title: 'Upload gambar gagal karena',
                    text: 'Error karena : ' + error?.response?.data?.serverMessage + ' ',
                    icon: 'error',
                    target: '#DialogBaruEdit',
                    timer: 3000,
                });
                console.error('Error saat menghapus file pendukung:', error);
                return;
            }
        }

        for (let index = 1; index <= Object.keys(uploadedFiles).length; index++) {
            // console.log('MASUK INDEX : ', index);
            if (uploadedFiles[index]?.renamedFile === null || uploadedFiles[index] === undefined) {
                console.log('UPLOAD KELUAR DI INDEX ', index);

                continue;
            }

            const fileWithTabIdx = uploadedFiles[index];
            // console.log('upload fileWithTabIdx : ', uploadedFiles[index]?.renamedFile?.name);

            const file = fileWithTabIdx.file;
            const tabIdx = fileWithTabIdx.tabIndex;

            // formData.append(`nama_file_image`, selectedFile !== 'update' ? `SP${uploadedFiles[index]?.fileName}.${fileExtension}` : fileGambar);
            const fileNameWithExtension = masterState !== 'BARU' ? `${uploadedFiles[index]?.renamedFile?.name}` : `${uploadedFiles[index]?.renamedFile?.name}`;
            namaFileImage = fileNameWithExtension;

            // console.log('dasdad = ', uploadedFiles[index]?.renamedFile?.name);
            const arrayBuffer = await new Response(uploadedFiles.renamedFile).arrayBuffer();
            // Menambahkan file ke dalam zip dengan ekstensi yang sesuai
            const base64Content = uploadedFiles[index]?.fileUrl.split(',')[1];
            zip.file(fileNameWithExtension, base64Content, { base64: true });

            if (tabIdx !== -1) {
                const jsonEntry = {
                    entitas,
                    kode_dokumen: kode_dokumen,
                    id_dokumen: String(tabIdx),
                    dokumen: 'SP',
                    filegambar: fileNameWithExtension,
                    fileoriginal: fileNameWithExtension,
                };
                jsonData.push(jsonEntry);
            }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Tambahkan blob ZIP ke FormData
        formData.append('myimage', zipBlob, `IMG_${kode_dokumen}.zip`);

        // Tambahkan informasi tambahan ke FormData
        formData.append('nama_file_image', `IMG_${kode_dokumen}.zip`);
        formData.append('kode_dokumen', '');

        // Tentukan nilai tabIdx yang benar, mungkin dengan memperhitungkan logika Anda
        let tabIdx = Object.keys(uploadedFiles).length > 0 ? uploadedFiles[1].tabIndex + 1 : 0;
        formData.append('id_dokumen', tabIdx);
        formData.append('dokumen', 'SP');

        formData.append('ets', entitas);

        // console.log('FormData Contents:');
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }
        // console.log('upload JsonInput = ', jsonData);

        if (Object.keys(uploadedFiles).length > 0) {
            try {
                // Lakukan unggah menggunakan Axios
                const response = await axios.post(`${apiUrl}/upload`, formData);

                // console.log('UPLOAD PER IMAGE : ', response);

                // Proses respon dari server
                let jsonSimpan;

                if (Array.isArray(response.data.nama_file_image)) {
                    jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => {
                        return {
                            entitas,
                            kode_dokumen: kode_dokumen,
                            id_dokumen: response.data.id_dokumen[index],
                            dokumen: 'SP',
                            filegambar: namaFile,
                            fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                        };
                    });
                } else {
                    jsonSimpan = {
                        entitas,
                        kode_dokumen: kode_dokumen,
                        id_dokumen: '999',
                        dokumen: 'SP',
                        filegambar: response.data.nama_file_image,
                        fileoriginal: response.data.filesinfo,
                    };
                }

                if (response.data.status === true) {
                    // if (selectedFile !== 'update') {
                    await axios
                        .post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan)
                        .then((response) => {})
                        .catch((error) => {
                            console.error('Error simpan tbimages:', error);
                        });

                    await axios
                        .post(`${apiUrl}/erp/simpan_tbimages`, jsonData)
                        .then((response) => {})
                        .catch((error) => {
                            console.error('Error:', error);
                        });

                    // }
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // console.log('DS Mata uang : ', dsMataUang);
    // console.log('DS PAJAK : ', dsPajak);
    // console.log('DS Termin : ', dsTermin);
    // console.log('DS Akun Hutang : ', dsAkunHutang);
    // console.log('DS Akun Hutang : ', dsAkunHutang);
    console.log('DS Jenis Vendor : ', dsJenisVendor);
    // console.log('BarangState : ', barangState);
    // console.log('Bank State : ', bankState);
    // console.log('Klasifikasi : ', klasifikasi_supplier);
    // console.log('Kelompok : ', kelompok_supplier);

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setOpenLightBox(true);
    };

    const handleMailto = () => {
        if (email) {
            window.location.href = `mailto:${email}`;
        } else {
            Swal.fire({
                title: 'Email tidak valid?',
                text: 'Pastikan email relasi valid?',
                target: '#DialogBaruEdit',
                icon: 'warning',
            });
        }
    };

    const handleWebsite = () => {
        if (website) {
            // Tambahkan http/https jika tidak ada
            const formattedWebsite = website.startsWith('http://') || website.startsWith('https://') ? website : `http://${website}`;
            window.open(formattedWebsite, '_blank');
        } else {
            Swal.fire({
                title: 'Website tidak valid?',
                text: 'Pastikan Website relasi valid?',
                target: '#DialogBaruEdit',
                icon: 'warning',
            });
        }
    };

    return (
        <DialogComponent
            id="DialogBaruEdit"
            name="DialogBaruEdit"
            className="DialogBaruEdit"
            target="#main-target"
            header={() => {
                const header = masterState === 'EDIT' ? DataState[0]?.nama_relasi : 'BARU';
                return header;
            }}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="95%" //"70%"
            height="95%"
            position={{ X: 40, Y: 14 }}
            style={{ position: 'fixed' }}
            close={() => {
                closeDialogBaruEdit;
            }}
            // buttons={buttonInputData}
            allowDragging={true}
            closeOnEscape={true}
            open={(args: any) => {
                args.preventFocus = true;
            }}
        >
            <div className="flex h-full w-full flex-col">
                <style></style>
                <div className="flex h-[calc(100%-25px)] w-full flex-col border ">
                    <div className="w-full md:w-[70%] lg:w-[50%] h-[100px] border">
                        <table className="font-bold">
                            <tr>
                                <td className="w-28">No. Registrasi</td>
                                <td>&nbsp;&nbsp; {kode_relasi} </td>
                            </tr>
                            <tr>
                                <td>Nama</td>
                                <td>
                                    <div className=" flex items-center">
                                        <input
                                            type="text"
                                            id="nama_supplier"
                                            className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Nama Supplier"
                                            name="nama_supplier"
                                            readOnly
                                            onChange={(e: any) => setNama_supplier(e.target.value)}
                                            value={nama_supplier}
                                            style={{ height: '3vh' }}
                                        />
                                        <button
                                            type="button"
                                            className="flex items-center justify-center rounded-sm bg-blue-600 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            style={{ height: '3vh' }}
                                            onClick={() => setDialogVisibilityForDialogRelasiSupplier(true)}
                                        >
                                            <FaSearch />
                                        </button>

                                        <DialogRelasiForSupplier
                                            originalDataSource={originalDataSource}
                                            masterState={masterState}
                                            setKodeSuppEdit={setKodeSuppEdit}
                                            setSetselectedRelasi={setSetselectedRelasi}
                                            setKode_supplier={setKode_supplier}
                                            setDialogVisibilityForDialogRelasiSupplier={setDialogVisibilityForDialogRelasiSupplier}
                                            visibilityForDialogRelasiSupplier={visibilityForDialogRelasiSupplier}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>No. Supplier</td>
                                <td>
                                    <div className=" flex items-center">
                                        <input
                                            type="text"
                                            id="NoSupp"
                                            className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Nomor Supplier"
                                            name="NoSupp"
                                            value={noSupp}
                                            ref={noSuppReff}
                                            onChange={(e) => setNoSupp(e.target.value)}
                                            style={{ height: '3vh' }}
                                        />
                                        <button
                                            type="button"
                                            className="flex items-center justify-center rounded-sm bg-blue-600 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            style={{ height: '3vh' }}
                                            onClick={getKodeSupplier}
                                        >
                                            <FaCreativeCommonsNd />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td className="grid grid-cols-3 items-center gap-1">
                                    <div className="flex">
                                        <input
                                            type="checkbox"
                                            name="non_aktif"
                                            id="aktifY"
                                            className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            onChange={() => {
                                                setIsActive(!isActive);
                                            }}
                                            checked={!isActive}
                                            style={{
                                                borderColor: '#ffffff',
                                            }}
                                        />
                                        <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                            Non Aktif
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="mr-1 w-full text-xs" style={{ marginBottom: -2 }}>
                                            Suplier sejak tgl
                                        </label>
                                        <DatePickerComponent
                                            placeholder="Select a date"
                                            value={selectedDate}
                                            onChange={(e: { value: Date }) => handleDateChange(e.value as Date)}
                                            format="dd-MM-yyyy"
                                            width={200}
                                            className="rounded-sm border border-gray-300 "
                                        />
                                    </div>
                                    <div className="flex">
                                        <input
                                            type="checkbox"
                                            name="aktifState"
                                            id="jenis_pabrik"
                                            className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            onChange={(event) => {
                                                setIsFabric(!isFabric);
                                            }}
                                            checked={isFabric}
                                            style={{
                                                borderColor: '#ffffff',
                                            }}
                                        />
                                        <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                            Jenis Pabrik
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <hr />
                    <div className="panel-tab " style={{ background: '#fff', width: '100%' }}>
                        <TabComponent ref={(t) => (tabDialogRelasi = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                            <div className="e-tab-header">
                                <div tabIndex={0}>Informasi</div>
                                <div tabIndex={1}>Pembelian</div>
                                <div tabIndex={2}>Catatan</div>
                                <div tabIndex={3}>Lain-Lain</div>
                                <div tabIndex={4}>Rekening Bank</div>
                                <div tabIndex={5}>File Pendukung</div>
                            </div>

                            <div className="e-content">
                                {/* Tab Infromasi Di bawah ini */}
                                <div className="h-full w-full overflow-y-auto">
                                    <div className="grid h-full w-full grid-cols-1 gap-2 p-5 lg:grid-cols-2">
                                        <div className="flex flex-col">
                                            {/* Form Isian Alamat */}
                                            <div className="w- flex">
                                                <button
                                                    className="mr-2  flex h-5 items-center justify-center rounded-md bg-slate-600 px-4 py-2 text-white"
                                                    onClick={() => {
                                                        const targetUrl = '/kcn/ERP/master/daftarRelasi/daftarRelasi';
                                                        const queryParams = {
                                                            tabId: tabId,
                                                            norelasi: kode_relasi,
                                                            masterState: masterState,
                                                            nomor_supplier: '',
                                                        };

                                                        if (masterState === 'EDIT') {
                                                            queryParams.nomor_supplier = noSupp;
                                                        }

                                                        if (kode_relasi === '' || kode_relasi === undefined) {
                                                            return;
                                                        }

                                                        // Redirect ke URL dengan parameter
                                                        router.push({
                                                            pathname: targetUrl,
                                                            query: queryParams,
                                                        });
                                                    }}
                                                >
                                                    <span className="text-xs">Update</span>
                                                </button>
                                                <table>
                                                    <tr>
                                                        <td>
                                                            <label className="mr-2 block text-xs font-semibold">Alamat</label>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Alamat cnth:(Jl. xxx. xxx)"
                                                                style={{ height: '3vh' }}
                                                                name="alamat1"
                                                                readOnly
                                                                onChange={(e) => setAlamat(e.target.value)}
                                                                value={alamat}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Alamat 2"
                                                                style={{ height: '3vh' }}
                                                                name="alamat2"
                                                                readOnly
                                                                onChange={(e) => setAlamat2(e.target.value)}
                                                                value={alamat2}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="mr-3 text-xs font-bold" htmlFor="kodePos">
                                                                Kode Pos
                                                            </label>
                                                        </td>
                                                        <td className="flex gap-2">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    id="kodePos"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Kode Pos"
                                                                    style={{ height: '3vh' }}
                                                                    name="kodepos"
                                                                    readOnly
                                                                    onChange={(e) => setKodePos(e.target.value)}
                                                                    value={kodePos}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="mr-2 text-xs font-bold" htmlFor="kodePos">
                                                                    Kota
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id="kota"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Kota"
                                                                    style={{ height: '3vh' }}
                                                                    name="kota"
                                                                    readOnly
                                                                    onChange={(e) => setKota(e.target.value)}
                                                                    value={kota}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="mr-2 text-xs font-bold" htmlFor="kodePos">
                                                                    Provinsi
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id="Provinsi"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Provinsi"
                                                                    style={{ height: '3vh' }}
                                                                    name="propinsi"
                                                                    readOnly
                                                                    onChange={(e) => setProvinsi(e.target.value)}
                                                                    value={provinsi}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="mr-2 block text-xs font-semibold">Negara</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 items-center gap-2">
                                                            <input
                                                                type="text"
                                                                id="negara"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder=""
                                                                style={{ height: '3vh' }}
                                                                name="negara"
                                                                readOnly
                                                                onChange={(e) => setNegara(e.target.value)}
                                                                value={negara}
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">No. NPWP</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '3vh' }}
                                                                    name="npwp"
                                                                    readOnly
                                                                    onChange={(e) => setNPWP(e.target.value)}
                                                                    value={NPWP}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">No. Siup</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 items-center gap-2">
                                                            <input
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="No. SIUP"
                                                                style={{ height: '3vh' }}
                                                                name="siup"
                                                                readOnly
                                                                onChange={(e) => setSiup(e.target.value)}
                                                                value={siup}
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">Personal</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Personal"
                                                                    style={{ height: '3vh' }}
                                                                    name="personal"
                                                                    readOnly
                                                                    onChange={(e) => setPersonal(e.target.value)}
                                                                    value={personal}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">No. KTP</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 items-center gap-2">
                                                            <input
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="KTP"
                                                                style={{ height: '3vh' }}
                                                                name="ktp"
                                                                readOnly
                                                                onChange={(e) => setKTP(e.target.value)}
                                                                value={KTP}
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">No. SIM</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Sim"
                                                                    style={{ height: '3vh' }}
                                                                    name="sim"
                                                                    readOnly
                                                                    onChange={(e) => setSIM(e.target.value)}
                                                                    value={SIM}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">No. Tlp 1</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 gap-2">
                                                            <div className="flex ">
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '3vh' }}
                                                                    name="telp"
                                                                    readOnly
                                                                    onChange={(e) => setTelp1(e.target.value)}
                                                                    value={telp1}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">No. Tlp 2</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '3vh' }}
                                                                    name="telp2"
                                                                    readOnly
                                                                    onChange={(e) => setTelp2(e.target.value)}
                                                                    value={telp2}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">No. Hp</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 gap-2">
                                                            <div className="flex ">
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '3vh' }}
                                                                    name="telp"
                                                                    readOnly
                                                                    onChange={(e) => setHp1(e.target.value)}
                                                                    value={hp1}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">WhatsApp</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '3vh' }}
                                                                    name="telp2"
                                                                    readOnly
                                                                    onChange={(e) => setHp2(e.target.value)}
                                                                    value={hp2}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Facemile</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 gap-2">
                                                            <div className="flex ">
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Facemile"
                                                                    style={{ height: '3vh' }}
                                                                    name="email"
                                                                    readOnly
                                                                    onChange={(e) => setFacemile(e.target.value)}
                                                                    value={Facemile}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">Email</label>
                                                                <div className="flex w-full items-center">
                                                                    <input
                                                                        type="email"
                                                                        id="email"
                                                                        className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                        placeholder="Nomor Supplier"
                                                                        name="email"
                                                                        value={email}
                                                                        onChange={(e) => setEmail(e.target.value)}
                                                                        style={{ height: '3vh' }}
                                                                        readOnly
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-center justify-center rounded-sm bg-red-600 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        style={{ height: '3vh' }}
                                                                        onClick={handleMailto}
                                                                    >
                                                                        <FaMailBulk />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* <tr>
                                                    <td>
                                                        <label className="block text-xs font-semibold">Email</label>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            id="namaUserMobile"
                                                            className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            placeholder="Email"
                                                            style={{ height: '3vh' }}
                                                            name="email"
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            value={email}
                                                        />
                                                    </td>
                                                </tr> */}
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Website</label>
                                                        </td>
                                                        <td>
                                                            <div className="flex w-full items-center">
                                                                <input
                                                                    type="text"
                                                                    id="website"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Nomor Supplier"
                                                                    name="website"
                                                                    value={website}
                                                                    onChange={(e) => setWebsite(e.target.value)}
                                                                    style={{ height: '3vh' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center justify-center rounded-sm bg-green-600 px-4 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    style={{ height: '3vh' }}
                                                                    onClick={handleWebsite}
                                                                >
                                                                    <FaGlobe />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Default Gudang</label>
                                                        </td>
                                                        <td>
                                                            {/* <select
                                                                value={default_gudang}
                                                                name="default_gudang"
                                                                onChange={(e) => setDefault_gudang(e.target.value)}
                                                                style={{ height: '3vh' }}
                                                                className="optio block w-full rounded-sm border border-gray-300 bg-gray-50 p-0 text-[12px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            >
                                                                <option value="" disabled selected>
                                                                    Default Gudang
                                                                </option>
                                                                {listGudang.length !== 0 &&
                                                                    listGudang.map((item: any) => (
                                                                        <option key={item.kode_gudang} value={item.kode_gudang}>
                                                                            {item.nama_gudang}
                                                                        </option>
                                                                    ))}
                                                            </select> */}
                                                            <DropDownListComponent
                                                                id="ddlelement"
                                                                popupHeight="250px"
                                                                fields={{ text: 'nama_gudang', value: 'kode_gudang' }}
                                                                filtering={onFiltering}
                                                                allowFiltering={true}
                                                                value={default_gudang}
                                                                dataSource={listGudang}
                                                                placeholder="Pilih Gudang"
                                                                onChange={(event: any) => setDefault_gudang(event.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '3vh',
                                                                    borderRadius: '0.125rem', // rounded-sm
                                                                    border: '1px solid #9ca3af', // border-gray-400
                                                                    backgroundColor: '#f9fafb', // bg-gray-50
                                                                    padding: '', // p-2
                                                                    fontSize: '0.75rem', // text-xs
                                                                    color: '#1f2937', // text-gray-900
                                                                    outline: 'none',
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <p className="text-md text-center text-red-500">*UNTUK SUPPLIER / VENDOR NON PERSEDIAN, PASTIKAN KLASIFIKASI KELAS YANG DIPILIH ADALAH KELAS E*</p>
                                        </div>

                                        <div className="border p-3">
                                            <div className="grid grid-cols-2">
                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Kebutuhan Rumah Tangga'}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                        checked={barangStateList?.includes('Kebutuhan Rumah Tangga')}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Kebutuhan Rumah Tangga
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Sewa Gudang / Kantor'}
                                                        checked={barangStateList?.includes('Sewa Gudang / Kantor')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Sewa Gudang / Kantor
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'ATK'}
                                                        checked={barangStateList?.includes('ATK')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        ATK
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Beli Gudang / Kantor'}
                                                        checked={barangStateList?.includes('Beli Gudang / Kantor')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Beli Gudang / Kantor
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Pembelian Kendaraan'}
                                                        checked={barangStateList?.includes('Pembelian Kendaraan')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Pembelian Kendaraan
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Asset - Elektronik'}
                                                        checked={barangStateList?.includes('Asset - Elektronik')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Asset - Elektronik
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Perlengkapan Kantor'}
                                                        checked={barangStateList?.includes('Perlengkapan Kantor')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Perlengkapan Kantor
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Asset - Furniture'}
                                                        checked={barangStateList?.includes('Asset - Furniture')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Asset - Furniture
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Perlengkapan Umum / Gudaang'}
                                                        checked={barangStateList?.includes('Perlengkapan Umum / Gudaang')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Perlengkapan Umum / Gudang
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Air'}
                                                        checked={barangStateList?.includes('Air')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Air
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Pemeliharaan Bangunan'}
                                                        checked={barangStateList?.includes('Pemeliharaan Bangunan')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Pemeliharaan Bangunan
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Internet'}
                                                        checked={barangStateList?.includes('Internet')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Internet
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Pemeliharaan Peralatan Kantor'}
                                                        checked={barangStateList?.includes('Pemeliharaan Peralatan Kantor')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Pemeliharaan Peralatan Kantor
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Telepon'}
                                                        checked={barangStateList?.includes('Telepon')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Telepon
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'Listrik'}
                                                        checked={barangStateList?.includes('Listrik')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        Listrik
                                                    </label>
                                                </div>

                                                <div className="mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {}}
                                                        value={'BPJS'}
                                                        checked={barangStateList?.includes('BPJS')}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        BPJS
                                                    </label>
                                                </div>
                                            </div>

                                            <hr />
                                            <div className="mt-5 grid grid-cols-2">
                                                <table className="ms-10 w-[40%]">
                                                    <tr>
                                                        <td>OPSI</td>
                                                        <td className="mb-2 flex gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="aktifState"
                                                                id="aktifY"
                                                                className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                onChange={(event) => setIsYCek(!isYCek)}
                                                                value={'Y'}
                                                                checked={isYCek}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                            />
                                                            <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                                Y
                                                            </label>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td className="mb-2 flex gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="aktifState"
                                                                id="aktifY"
                                                                className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                onChange={(event) => setIsNCek(!isNCek)}
                                                                value={'N'}
                                                                checked={isNCek}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                            />
                                                            <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                                N
                                                            </label>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td className="mb-2 flex gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name="aktifState"
                                                                id="aktifY"
                                                                className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                onChange={(event) => {
                                                                    let y = isYCek === false ? true : false;
                                                                    let n = isNCek === false ? true : false;
                                                                    setIsYCek(y);
                                                                    setIsNCek(n);
                                                                }}
                                                                value={'N/A'}
                                                                checked={isYCek && isNCek}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                            />
                                                            <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                                N / A
                                                            </label>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <div className="jus mb-2 flex gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="aktifState"
                                                        id="aktifY"
                                                        className="h-3 w-3 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                        onChange={(event) => {
                                                            setKelompok_supplier('A');
                                                            setKlasifikasi_supplier('E');
                                                        }}
                                                        value={'kelas_vendor'}
                                                        checked={kelompok_supplier === 'A' && klasifikasi_supplier === 'E'}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                    />
                                                    <label className="ml-1 text-xs" style={{ marginBottom: -2 }}>
                                                        AKTIFKAN KELAS VENDOR (E)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Tab Pembelian */}
                                <div className="h-full w-full overflow-y-auto" id="target">
                                    <div className="grid h-full w-full grid-cols-1 gap-2 p-5 lg:grid-cols-2">
                                        <div className="border p-3">
                                            <h3 className="mb-3">Akun, Mata Uang, Termin Pembayaran, Dll</h3>

                                            <div className="mb-1 w-full">
                                                <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Akun Hutang
                                                </label>
                                                <div className="flex  gap-1">
                                                    <input
                                                        name="Akun Hutang"
                                                        value={akunHutang}
                                                        type="text"
                                                        ref={akunHutangReff}
                                                        readOnly
                                                        id="kode_pos"
                                                        className="block w-[30%] rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                        placeholder="Cth: 401513"
                                                    />

                                                    <select
                                                        value={akunHutangKode}
                                                        onChange={(e) => {
                                                            const selectedOption = e.target.options[e.target.selectedIndex]; // Ambil option yang dipilih
                                                            const kodeAkun: any = e.target.value; // Ambil kode akun dari data-kode
                                                            const noAkun: any = selectedOption.getAttribute('data-no_akun'); // Ambil value (no_akun)

                                                            console.log('Kode Akun:', kodeAkun, 'No Akun:', noAkun);

                                                            setAkunHutangKode(kodeAkun); // Simpan kode akun
                                                            setAkunHutang(noAkun); // Simpan nomor akun
                                                        }}
                                                        className="block flex-grow rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    >
                                                        <option value="" disabled>
                                                            Pilih Akun Hutang
                                                        </option>
                                                        {dsAkunHutang.length !== 0 &&
                                                            dsAkunHutang.map((item: any) => (
                                                                <option key={item.kode_akun} data-kode={item.kode_akun} data-no_akun={item.no_akun} value={item.kode_akun}>
                                                                    {item.nama_akun}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-1 grid w-full grid-cols-2 gap-1">
                                                <div>
                                                    <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                        Mata Uang
                                                    </label>
                                                    <select
                                                        value={mataUang}
                                                        ref={mataUangReff}
                                                        onChange={(e) => setMataUang(e.target.value)}
                                                        className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    >
                                                        <option value={''} disabled={true}>
                                                            Pilih Mata uang
                                                        </option>
                                                        {dsMataUang.length !== 0 &&
                                                            dsMataUang.map((item: any) => (
                                                                <option value={item?.kode_mu} key={item?.kode_mu}>
                                                                    {item?.kode_mu}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                        Termin
                                                    </label>
                                                    <select
                                                        value={Termin}
                                                        onChange={(e) => setTermin(e.target.value)}
                                                        name="kelurahan"
                                                        className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    >
                                                        <option value={''} disabled={true}>
                                                            Pilih Termin
                                                        </option>
                                                        {dsTermin.length !== 0 &&
                                                            dsTermin.map((item: any) => (
                                                                <option value={item?.kode_termin} key={item?.kode_termin}>
                                                                    {item?.nama_termin}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Plafond Debet
                                                </label>
                                                <input
                                                    value={Plafond}
                                                    onChange={handleForCurrency}
                                                    name="kodepos"
                                                    type="text"
                                                    id="kode_pos"
                                                    className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 401513"
                                                />
                                            </div>
                                            <div className=" mt-2 border p-2">
                                                <h3>Pembelian</h3>
                                                <div className="mb-1 w-full">
                                                    <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                        Pajak Pembelian
                                                    </label>
                                                    <select
                                                        value={kode_pajak}
                                                        ref={pajakReff}
                                                        onChange={(e) => setKode_pajak(e.target.value)}
                                                        className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-[10px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    >
                                                        <option value={''}>Pilih Kode pajak</option>
                                                        {dsPajak.length !== 0 &&
                                                            dsPajak.map((item: any) => (
                                                                <option value={item?.kode_pajak} key={item?.kode_pajak}>
                                                                    {item?.kode_pajak} - {item?.catatan}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>

                                                <div className="">
                                                    <label htmlFor="kode_pos" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                        Klasifikasi Supplier
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                                                            <input
                                                                type="radio"
                                                                id="nama_klasifikasi_rb"
                                                                name="nama_klasifikasi_rb"
                                                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                checked={klasifikasi_supplier === 'A'}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                value={'A'}
                                                                onChange={handleChangeKlasifikasi}
                                                            />
                                                            <span>A</span>
                                                        </label>
                                                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                                                            <input
                                                                type="radio"
                                                                id="nama_klasifikasi_rb"
                                                                name="nama_klasifikasi_rb"
                                                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                checked={klasifikasi_supplier === 'B'}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                value={'B'}
                                                                onChange={handleChangeKlasifikasi}
                                                            />
                                                            <span>B</span>
                                                        </label>
                                                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                                                            <input
                                                                type="radio"
                                                                id="nama_klasifikasi_rb"
                                                                name="nama_klasifikasi_rb"
                                                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                checked={klasifikasi_supplier === 'C'}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                value={'C'}
                                                                onChange={handleChangeKlasifikasi}
                                                            />
                                                            <span>C</span>
                                                        </label>
                                                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                                                            <input
                                                                type="radio"
                                                                id="nama_klasifikasi_rb"
                                                                name="nama_klasifikasi_rb"
                                                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                checked={klasifikasi_supplier === 'D'}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                value={'D'}
                                                                onChange={handleChangeKlasifikasi}
                                                            />
                                                            <span>D</span>
                                                        </label>
                                                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs" onClick={() => setKlasifikasi_supplier('E')}>
                                                            <input
                                                                type="radio"
                                                                id="nama_klasifikasi_rb"
                                                                name="nama_klasifikasi_rb"
                                                                className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                                checked={klasifikasi_supplier === 'E'}
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                value={'E'}
                                                                onChange={handleKlassEKelompokE}
                                                            />
                                                            <span>E</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className=" border p-3">
                                            <h3 className="mb-1">
                                                Data Barang {klasifikasi_supplier !== 'E' && <span className="text-orange-400">Untuk mengaktifkan data barang aktifkan kelompok supplier vendor</span>}
                                            </h3>
                                            {klasifikasi_supplier === 'E' && (
                                                <div className={`flex h-full w-full flex-col justify-between py-3`}>
                                                    <GridItemTemp
                                                        onEditItem={onEditItem}
                                                        gridBarangSupplier={gridBarangSupplier}
                                                        userId={userid}
                                                        masterState={masterState}
                                                        barangState={barangState}
                                                        setBarangState={setBarangState}
                                                        dsJenisVendor={dsJenisVendor}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Tab Catatan */} 
                                <div className="mb-3 overflow-y-auto">
                                    <textarea
                                        id="simple-textarea"
                                        className="h-full w-full rounded-sm border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Tuliskan Catatan"
                                        rows={8}
                                        value={Catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                    ></textarea>
                                </div>
                                {/* Tab Lain - Lain */}
                                <div className=" m-3 overflow-y-auto" >
                                    <h3 className="">Nama Lainya untuk cetak PO dan SPB:</h3>
                                    <div className="flex flex-col gap-2 p-3">
                                        <table className="w-full md:w-[80%] lg:w-[50%]">
                                            <tr>
                                                <td className="text-right ">Nama Suplier</td>
                                                <td className="pl-2">
                                                    <input
                                                        type="text"
                                                        id="nama_alias"
                                                        className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                        placeholder=""
                                                        name="nama_alias"
                                                        style={{ height: '3vh' }}
                                                        value={nama_alias}
                                                        onChange={(e) => setNama_alias(e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-right ">Alamat</td>
                                                <td className="pl-2">
                                                    <input
                                                        type="text"
                                                        id="alamatAlias"
                                                        name="alamatAlias"
                                                        className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                        placeholder=""
                                                        style={{ height: '3vh' }}
                                                        value={alamatAlias}
                                                        onChange={(e) => setAlamatAlias(e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="pl-2">
                                                    <input
                                                        type="text"
                                                        id="alamatAlias2"
                                                        name="alamatAlias2"
                                                        className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                        placeholder=""
                                                        style={{ height: '3vh' }}
                                                        value={alamatAlias2}
                                                        onChange={(e) => setAlamatAlias2(e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-right">Nama Singkat</td>
                                                <td className="pl-2">
                                                    <input
                                                        type="text"
                                                        id="nama_singkat"
                                                        name="nama_singkat"
                                                        className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                        placeholder=""
                                                        style={{ height: '3vh' }}
                                                        value={nama_singkat}
                                                        onChange={(e) => setNama_singkat(e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-right ">Kelompok Supplier</td>
                                                <td className="flex flex-col pl-2">
                                                    <label className="mt-3 flex cursor-pointer items-center gap-3 text-xs">
                                                        <input
                                                            type="radio"
                                                            id="nama_kelompok_supplier"
                                                            name="nama_kelompok_supplier"
                                                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                            checked={kelompok_supplier === 'B'}
                                                            value={'B'}
                                                            onChange={handleChangeKelompok}
                                                        />
                                                        <span>Besi</span>
                                                    </label>
                                                    <label className="mt-3 flex cursor-pointer items-center gap-3 text-xs">
                                                        <input
                                                            type="radio"
                                                            id="nama_kelompok_supplier"
                                                            name="nama_kelompok_supplier"
                                                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                            checked={kelompok_supplier === 'N'}
                                                            value={'N'}
                                                            onChange={handleChangeKelompok}
                                                        />
                                                        <span>Non Besi</span>
                                                    </label>
                                                    <label className="mt-3 flex cursor-pointer items-center gap-3 text-xs">
                                                        <input
                                                            type="radio"
                                                            id="nama_kelompok_supplier"
                                                            name="nama_kelompok_supplier"
                                                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                            checked={kelompok_supplier === 'A'}
                                                            value={'A'}
                                                            onChange={handleChangeKelompok}
                                                        />
                                                        <span>Besi dan Non Besi</span>
                                                    </label>
                                                    <label className="mt-3 flex cursor-pointer items-center gap-3 text-xs">
                                                        <input
                                                            type="radio"
                                                            id="nama_kelompok_supplier"
                                                            name="nama_kelompok_supplier"
                                                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                            style={{
                                                                borderColor: '#ffffff',
                                                            }}
                                                            checked={klasifikasi_supplier === 'E'}
                                                            value={'V'}
                                                            onChange={handleKlassEKelompokE}
                                                        />
                                                        <span>Non Persediaan (Vendor - Kelas E)</span>
                                                    </label>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                                {/* Tab Rekening */}
                                <div className="">
                                    <GridRekeningTemp gridRekeningSupplier={gridRekeningSupplier} userId={userid} masterState={masterState} bankState={bankState} setBankState={setBankState} />
                                </div>
                                {/* File Pendukungan */}
                                <div className="h-full w-full gap-1 ">
                                    <div className="panel-tab dsd float-start flex h-full min-h-[500px] w-full flex-wrap md:w-[75%]" style={{ background: '#fff' }}>
                                        {/* <TabComponent ref={(t) => (tabDialogFilePendukung = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                            
                                        </TabComponent> */}
                                        <div className="flex h-8 w-full  border">
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 0 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={0}
                                            >
                                                1
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 1 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={1}
                                            >
                                                2
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 2 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={2}
                                            >
                                                3
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 3 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={3}
                                            >
                                                4
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 4 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={4}
                                            >
                                                5
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 5 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={5}
                                            >
                                                6
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 6 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={6}
                                            >
                                                7
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 7 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={7}
                                            >
                                                8
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 8 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={8}
                                            >
                                                9
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 9 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={9}
                                            >
                                                10
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 10 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={10}
                                            >
                                                11
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 11 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={11}
                                            >
                                                12
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 12 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={12}
                                            >
                                                13
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 13 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={13}
                                            >
                                                14
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 14 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={14}
                                            >
                                                15
                                            </div>
                                        </div>
                                        <div className="h-full w-full">
                                            <div className={`h-full w-full `}>
                                                {uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl === null ? (
                                                    <div className="flex h-full w-full items-center justify-center ">Gambar belum ada untuk tab {parseInt(tabUploadActive + 1)}</div>
                                                ) : (
                                                    <img
                                                        src={uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl}
                                                        alt={`File pendukung urutan ${parseInt(tabUploadActive + 1)}`}
                                                        className="h-auto max-w-xs border border-gray-300"
                                                        onClick={() => handleOpenModal(uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl)}
                                                    />
                                                )}
                                                {isOpenLightBox && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                                                        <div className="relative">
                                                            <button className="fixed right-4 top-4 text-4xl font-bold text-white" onClick={handleCloseModal}>
                                                                &times;
                                                            </button>
                                                            <img
                                                                ref={zoomRef}
                                                                src={currentImage as string}
                                                                alt="Enlarged"
                                                                onClick={handleZoom}
                                                                onMouseMove={handleMouseMove}
                                                                onWheel={handleWheel} // Enable zoom in/out on wheel scroll
                                                                className={`max-h-full max-w-full transition-transform duration-200 ${isZoomed ? 'cursor-grabbing' : 'cursor-zoom-in'}`}
                                                                style={{
                                                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                                    transform: `scale(${zoomLevel}) translate(${translate.x}px, ${translate.y}px)`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/*  */}
                                            {/* <div>
                                                <img src={uploadedFiles[14 + 1]?.fileUrl} alt={`File pendukung urutan ${14 + +1}`} className="h-auto max-w-xs border border-gray-300" />
                                            </div> */}
                                        </div>
                                    </div>
                                    <div className="flex h-[250px] min-w-[200px] flex-col items-center justify-center rounded border px-5 shadow">
                                        {/* <ButtonComponent onClick={handleClick} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                            Scanner
                                        </ButtonComponent> */}
                                        <ButtonComponent onClick={handleClick} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                            File
                                        </ButtonComponent>
                                        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        <ButtonComponent onClick={handleDeleteFilePendukungOne} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                            Bersihkan Gambar
                                        </ButtonComponent>
                                        <ButtonComponent onClick={handleBersihkanSemua} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                            Bersihkan Semua
                                        </ButtonComponent>
                                        <ButtonComponent
                                            onClick={() => {
                                                uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl === null
                                                    ? null
                                                    : downloadBase64Image(uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl, uploadedFiles[parseInt(tabUploadActive + 1)]?.renamedFile.name);
                                            }}
                                            id="btnFile"
                                            type="button"
                                            cssClass="e-primary e-small"
                                            style={styleButtonFilePendukung}
                                        >
                                            Simpan Ke File
                                        </ButtonComponent>
                                        <ButtonComponent
                                            onClick={() => {
                                                uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl === null ? null : handleOpenModal(uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl);
                                            }}
                                            id="btnFile"
                                            type="button"
                                            cssClass="e-primary e-small flex"
                                            style={styleButtonFilePendukung}
                                        >
                                            <span className="flex h-full w-full items-center justify-center gap-2">
                                                <FaCamera /> Preview
                                            </span>
                                        </ButtonComponent>
                                    </div>
                                </div>
                            </div>
                        </TabComponent>
                    </div>
                </div>
                <div className="flex justify-end gap-2 h-[25px]">
                    <button
                        className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={masterState === 'BARU' ? saveDialogSupplier : handleUpdateData}
                    >
                        Simpan
                    </button>
                    <button
                        className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={closeDialogBaruEdit}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}

export default DialogBaruEditCustomer;

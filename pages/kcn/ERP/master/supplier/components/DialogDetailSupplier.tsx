import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { FaArrowRight, FaCamera, FaSearch } from 'react-icons/fa';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tab } from '@syncfusion/ej2/navigations';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-calendars/styles/material.css';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import DialogSupplierForDetail from './DialogSupplierForDetail';
import GridDetailRekening from './GridDetailRekening';
import axios from 'axios';
import styles from '../supplier.module.css';
import { FileUploadDummy, resetFilePendukung } from '../function/functionSupp';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';

interface dialogDetailSupplier {
    isOpen: boolean;
    onClose: any;
    DataState: any;
    masterState: any;
    token: any;
    entitas: any;
    userid: string;
    setSelectedDetailSupplierForEdit: Function;
    setDialogBaruEditSupplier: Function;
    setMasterState: Function;
    dataFromSupp: any;
    originalDataSource: any;
    setDataFromSupp: Function;
}

// dataFromSupp={dataFromSupp}
//                 setDataFromSupp={setDataFromSupp}
//                 DataState={dataState}
//                 isOpen={dialogDetailSupplier}
//                 onClose={() => {
//                     setDialogDetailSupplier(false);
//                 }}
//                 masterState={masterState}
//                 setMasterState={setMasterState}
//                 token={token}
//                 entitas={kode_entitas}
//                 userid={userid}
//                 setSelectedDetailSupplierForEdit={setSelectedDetailSupplierForEdit}
//                 setDialogBaruEditSupplier={setDialogBaruEditSupplier}
//                 originalDataSource={originalDataSource}

function DialogDetailSupplier({
    isOpen,
    onClose,
    masterState,
    token,
    entitas,
    setSelectedDetailSupplierForEdit,
    setDialogBaruEditSupplier,
    setMasterState,
    dataFromSupp,
    originalDataSource,
    setDataFromSupp,
}: dialogDetailSupplier) {
    let buttonInputDataDetailSupplier: ButtonPropsModel[];
    const closeDialogBaruEdit = () => {
        // setTimeout(() => {
        //     setUploadedFiles(resetFilePendukung());
        //     setSetselectedSupplier([]);
        // }, 5000);
        setDataFromSupp([]);
        // onClose();
    };
    let tabDialogRelasi: Tab | any;
    let tabDialogFilePendukung: Tab | any;
    const styleButtonFilePendukung = {
        width: 125 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const formatCurrency = (value: string | number) => {
        if (!value) return ''; // Jika nilai tidak ada, kembalikan string kosong
        const valueReturn = new Intl.NumberFormat().format(Number(value.toString()));
        let retIfNol = valueReturn === '0' ? '' : valueReturn;
        return valueReturn === 'NaN' ? '' : valueReturn;
    };

    const [tabUploadActive, setTabUploadActive] = React.useState<String | any>(0);
    const [selectedSupplier, setSetselectedSupplier] = useState<SupplierData | any>([]);
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null | any }>(FileUploadDummy);
    const [dialogVisibleeReportBayar, setDialogVisibleReportBayar] = useState<boolean>(false);
    const [dialogVisibleeHutangSupp, setDialogVisibleHutangSupp] = useState<boolean>(false);
    const [isOpenLightBox, setOpenLightBox] = React.useState(false);
    const [onCurentReport, setOnCurentReport] = React.useState('');

    const [currentImage, setCurrentImage] = React.useState<string | null>(null);
    const [isZoomed, setIsZoomed] = React.useState(false);
    const [zoomLevel, setZoomLevel] = React.useState<number>(1); // Zoom level state
    const [zoomPosition, setZoomPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [translate, setTranslate] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const zoomRef = useRef<HTMLImageElement | null>(null);

    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3000,
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
    // console.log('DETAIL uploadedFiles : ', uploadedFiles);

    const OnClick_CetakHutang = () => {
        if (entitas === '') {
            // swal.fire({
            //     title: 'Pilih Data terlebih dahulu.',
            //     icon: 'error',
            // });
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px;color:white;">Silahkan pilih data TTB terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Hutang Supplier | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/daftar_hutang?entitas=${entitas}&param1=${selectedSupplier?.master?.kode_supp}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

        let win = window.open(
            '',
            '_blank',
            `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
        );

        if (win) {
            let link = win.document.createElement('link');
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = '/favicon.png';
            win.document.getElementsByTagName('head')[0].appendChild(link);
            win.document.write(iframe);
        } else {
            console.error('Window failed to open.');
        }
    };

    const OnClick_CetakHistoryBayar = () => {
        if (entitas === '') {
            // swal.fire({
            //     title: 'Pilih Data terlebih dahulu.',
            //     icon: 'error',
            // });
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px;color:white;">Silahkan pilih data TTB terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>History Bayar Supplier | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/history_bayar?entitas=${entitas}&param1=${selectedSupplier?.master?.no_supp}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

        let win = window.open(
            '',
            '_blank',
            `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
        );

        if (win) {
            let link = win.document.createElement('link');
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = '/favicon.png';
            win.document.getElementsByTagName('head')[0].appendChild(link);
            win.document.write(iframe);
        } else {
            console.error('Window failed to open.');
        }
    };

    const handleDialogCloseReportBayar = () => {
        setOnCurentReport('');

        setDialogVisibleReportBayar(false);
    };
    const handleButtonClickHutangSupp = () => {
        setOnCurentReport('HUTANG');
        setDialogVisibleHutangSupp(true);
    };

    const handleDialogCloseHutangSupp = () => {
        setOnCurentReport('');

        setDialogVisibleHutangSupp(false);
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
    const dataFromSuppHandle = async (no_supp: any = null) => {
        // setUploadedFiles(resetFilePendukung());
        // await setTimeout(() => {
        //     setSetselectedSupplier([]);
        //     setUploadedFiles(resetFilePendukung());
        // }, 300);

        if (no_supp !== null) {
            setTimeout(() => {
                setSetselectedSupplier([]);
                setUploadedFiles(resetFilePendukung());
            }, 300);
        }
        const response = await axios.get(`${apiUrl}/erp/detail_supplier?`, {
            params: {
                entitas: entitas,
                param1: no_supp === null ? dataFromSupp?.kode_supp : no_supp,
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const responseData = response.data.data;
        console.log('DETAIL RESPONSE : ', responseData);

        try {
            const resFilePendukung = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                params: {
                    entitas: entitas,
                    nama_zip: `IMG_${response.data.data.master.kode_supp}.zip`,
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
            });

            if (resFilePendukung.data.status === true) {
                // console.log('FILE PENDUKUNG LIST step 1');

                const resTbImages = await axios.get(`${apiUrl}/erp/load_images`, {
                    params: {
                        entitas: entitas,
                        param1: response.data.data.master.kode_supp,
                        // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                    },
                });
                // console.log('DETAIL RES LOAD IMAGES : ', resTbImages);

                const jsonData = [];
                if (resTbImages.data.status === true) {
                    // console.log('FILE PENDUKUNG LIST step 2');
                    resTbImages.data.data.map((item: any) => {
                        // console.log('FILE PENDUKUNG LIST step 3:', { item }, resFilePendukung.data.images);
                        const filterFilePendukung = resFilePendukung.data.images.filter((extractZipEach: any) => extractZipEach.fileName === item.filegambar);
                        // console.log('FILE PENDUKUNG LIST Step last :  ', filterFilePendukung[0].imageUrl);
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

        setTimeout(() => {
            setSetselectedSupplier(responseData);
        }, 1000);
    };

    // console.log('DATA FROM SUPP : ', selectedSupplier);

    useEffect(() => {
        if (dataFromSupp.length !== 0) {
            // setTimeout(() => {
            //     setSetselectedSupplier([]);
            //     setUploadedFiles(resetFilePendukung());
            // }, 300);
            dataFromSuppHandle();
        } else {
            onClose();
        }
    }, [dataFromSupp]);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const clickTabIndex = (event: any) => {
        const tabIndex = event.currentTarget.tabIndex;
        setTabUploadActive(tabIndex);
        // console.log('Tab index clicked:', tabIndex);
        //
        // e-item e-toolbar-item e-active
    };
    const refreshHandle = async () => {
        await dataFromSuppHandle(selectedSupplier?.master?.kode_supp);
    };
    const [visibilityForDialogRelasiSupplierForDetail, setVisibilityForDialogSupplierForDetail] = useState(false);
    buttonInputDataDetailSupplier = [
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: closeDialogBaruEdit,
        },
        {
            buttonModel: {
                content: 'Refresh',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: refreshHandle,
        },
        {
            buttonModel: {
                content: 'Edit Data',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: () => {
                setSelectedDetailSupplierForEdit(selectedSupplier);
                setMasterState('EDIT');
                onClose();
                setDialogBaruEditSupplier(true);
            },
        },
        {
            buttonModel: {
                content: 'Detail Hutang',
                cssClass: 'e-danger e-small',

                // isPrimary: true,
            },
            isFlat: false,
            click: OnClick_CetakHutang,
        },
        {
            buttonModel: {
                content: 'History Bayar',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: OnClick_CetakHistoryBayar,
        },
    ];

    // console.log('SELECTED SUPPLIER : ', selectedSupplier);

    return (
        <DialogComponent
            id="DialogDetailEdit"
            name="DialogDetailEdit"
            className="DialogBaruEdit"
            target="#main-target"
            header={() => {
                const header = masterState;
                return header;
            }}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="95%" //"70%"
            height="100%"
            position={{ X: 40, Y: 14 }}
            style={{ position: 'fixed' }}
            close={() => {
                closeDialogBaruEdit;
            }}
            allowDragging={true}
            closeOnEscape={true}
            // buttons={buttonInputDataDetailSupplier}
            open={(args: any) => {
                args.preventFocus = true;
            }}
        >
            <div className="h-full w-full flex-col overflow-auto">
                <div className="h-[95%] w-full overflow-auto">
                    <div className="w-full md:w-[70%] lg:w-[50%]">
                        <div className="flex">
                            <label className="mr-2 block text-xs font-semibold">Supplier</label>
                            <input
                                type="text"
                                id="namaUserMobile"
                                className="mb-1 w-[50%] rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                placeholder="Kode Supplier"
                                style={{ height: '4vh' }}
                                value={selectedSupplier?.master?.no_supp}
                                name="alamat1"
                            />
                            <input
                                type="text"
                                id="namaUserMobile"
                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                placeholder="Nama Supplier"
                                name="nama_supplier"
                                readOnly
                                value={selectedSupplier?.master?.nama_relasi}
                                style={{ height: '4vh' }}
                            />
                            <button
                                type="button"
                                className="flex items-center justify-center rounded-sm bg-blue-600 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ height: '4vh' }}
                                onClick={() => {
                                    setVisibilityForDialogSupplierForDetail(true);
                                }}
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                    <DialogSupplierForDetail
                        visibilityForDialogRelasiSupplierForDetail={visibilityForDialogRelasiSupplierForDetail}
                        setDialogVisibilityForDialogRelasiSupplierForDetail={setVisibilityForDialogSupplierForDetail}
                        setSelectedSupplier={setSetselectedSupplier}
                        dataFromSuppHandle={dataFromSuppHandle}
                        originalDataSource={originalDataSource}
                    />
                    <hr />
                    <div className="panel-tab" style={{ background: '#fff', width: '100%', height: 'auto' }}>
                        <TabComponent ref={(t: any) => (tabDialogRelasi = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                            <div className="e-tab-header">
                                <div tabIndex={0}>Informasi</div>
                                <div tabIndex={1}>Catetan</div>
                                <div tabIndex={2}>Lain-Lain</div>
                                <div tabIndex={3}>Rekening Bang</div>
                                <div tabIndex={4}>File Pendukung</div>
                            </div>
                            <div className="e-content">
                                <div className="h-full w-full">
                                    <form action="">
                                        <div className="grid h-full w-full grid-cols-1 gap-2 p-5 lg:grid-cols-2">
                                            <div className="">
                                                {/* Form Isian Alamat */}
                                                <table>
                                                    <tr>
                                                        <td>
                                                            <label className="mr-2 block text-xs font-semibold">Alamat</label>
                                                        </td>
                                                        <td>
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Alamat cnth:(Jl. xxx. xxx)"
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.alamat}
                                                                name="alamat1"
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td>
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Alamat 2"
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.alamat2}
                                                                name="alamat2"
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
                                                                    readOnly
                                                                    type="text"
                                                                    id="kodePos"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Kode Pos"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.kodepos}
                                                                    name="kodepos"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="mr-2 text-xs font-bold" htmlFor="kodePos">
                                                                    Kota
                                                                </label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="kota"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Kota"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.kota}
                                                                    name="kota"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="mr-2 text-xs font-bold" htmlFor="kodePos">
                                                                    Provinsi
                                                                </label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="Provinsi"
                                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Provinsi"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.propinsi}
                                                                    name="propinsi"
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
                                                                readOnly
                                                                type="text"
                                                                id="negara"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder=""
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.negara}
                                                                name="negara"
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">No. NPWP</label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.npwp}
                                                                    name="npwp"
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
                                                                readOnly
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="No. SIUP"
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.siup}
                                                                name="siup"
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">Personal</label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Personal"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.personal}
                                                                    name="personal"
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
                                                                readOnly
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="KTP"
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.ktp}
                                                                name="ktp"
                                                            />
                                                            <div className="flex items-center">
                                                                <label className="block w-24 text-xs font-semibold">No. SIM</label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Sim"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.sim}
                                                                    name="sim"
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
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.telp}
                                                                    name="telp"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">No. Tlp 2</label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.telp2}
                                                                    name="telp2"
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
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.hp}
                                                                    name="telp"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">WhatsApp</label>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.hp2}
                                                                    name="telp2"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Facemile</label>
                                                        </td>
                                                        <td className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Facemile"
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.fax}
                                                                    name="email"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <label className="w-24 text-xs font-semibold">Email</label>
                                                                <input
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder="Email"
                                                                    readOnly
                                                                    style={{ height: '3vh' }}
                                                                    name="email"
                                                                    value={selectedSupplier?.master?.email === null ? '' : selectedSupplier?.master?.email}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Website</label>
                                                        </td>
                                                        <td>
                                                            <input
                                                                readOnly
                                                                type="text"
                                                                id="namaUserMobile"
                                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder=""
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.website}
                                                                name="website"
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="block text-xs font-semibold">Default Gudang</label>
                                                        </td>
                                                        <td>
                                                            <input // Menetapkan nilai default atau string kosong jika null
                                                                name="default_gudang"
                                                                type="text"
                                                                readOnly
                                                                style={{ height: '4vh' }}
                                                                value={selectedSupplier?.master?.kode_gudang}
                                                                className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-[9px] text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            />
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>

                                            <div className="flex flex-wrap gap-2 border p-3">
                                                <div className="w-full border p-3">
                                                    <h2 className="mb-2">[Tipe, Termin, Diskon]</h2>
                                                    <table>
                                                        <tr className="w-[200px]">
                                                            <td>
                                                                <label className="text-xs font-semibold">Tipe Supplier</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.tipe}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label className="text-xs font-semibold">Termin</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    value={selectedSupplier?.master?.nama_termin}
                                                                    style={{ height: '4vh' }}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label className="text-xs font-semibold">Diskon Beli (%)</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={selectedSupplier?.master?.diskon_def}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <div className="w-full border p-3">
                                                    <h2 className="mb-2">[Plafond, Hutang, Outstanding Pesanan]</h2>
                                                    <table>
                                                        <tr className="mb-2">
                                                            <td>
                                                                <label className="text-xs font-semibold">Plafond Debet</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={formatCurrency(selectedSupplier?.master?.plafond)}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label className="text-xs font-semibold">Hutang Supplier</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={formatCurrency(selectedSupplier?.master?.hutang_supplier)}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label className="text-xs font-semibold">Hutang Warkat</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={formatCurrency(selectedSupplier?.master?.hutang_Bg)}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="w-[200px]">
                                                                <label className="text-xs font-semibold">Pesanan Yang Disetujui</label>
                                                            </td>
                                                            <td className="flex gap-2">
                                                                {/* {selectedSupplier?.master?.sp_outstanding === 0 && (
                                                                    <button type="button" className="flex bg-slate-500 p-1 text-white">
                                                                        <FaArrowRight />
                                                                    </button>
                                                                )} */}
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={formatCurrency(selectedSupplier?.master?.sp_outstanding)}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <hr />
                                                        <tr>
                                                            <td>
                                                                <label className="text-xs font-semibold">Sisa Plafond Debet</label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    readOnly
                                                                    type="text"
                                                                    id="namaUserMobile"
                                                                    className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                    placeholder=""
                                                                    style={{ height: '4vh' }}
                                                                    value={formatCurrency(selectedSupplier?.master?.sisa)}
                                                                    name="website"
                                                                />
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="h-full w-full">
                                    <textarea
                                        readOnly
                                        id="simple-textarea"
                                        className="h-full w-full rounded-sm border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Tuliskan Catatan"
                                        value={selectedSupplier?.master?.catatan === null ? '' : selectedSupplier?.master?.catatan}
                                        rows={8}
                                    ></textarea>
                                </div>
                                <div className="h-full w-full">
                                    <table className="w-full md:w-[80%] lg:w-[50%]">
                                        <tr>
                                            <td className="text-right ">Nama Suplier</td>
                                            <td className="pl-2">
                                                <input
                                                    readOnly
                                                    type="text"
                                                    id="namaUserMobile"
                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder=""
                                                    style={{ height: '3vh' }}
                                                    value={selectedSupplier?.master?.alias_nama === null ? '' : selectedSupplier?.master?.alias_nama}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-right ">Alamat</td>
                                            <td className="pl-2">
                                                <input
                                                    readOnly
                                                    type="text"
                                                    id="namaUserMobile"
                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder=""
                                                    style={{ height: '3vh' }}
                                                    value={selectedSupplier?.master?.alias_alamat === null ? '' : selectedSupplier?.master?.alias_alamat}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td className="pl-2">
                                                <input
                                                    readOnly
                                                    type="text"
                                                    id="namaUserMobile"
                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder=""
                                                    value={selectedSupplier?.master?.alias_alamat2 === null ? '' : selectedSupplier?.master?.alias_alamat2}
                                                    style={{ height: '3vh' }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-right ">Nama Singkatan</td>
                                            <td className="pl-2">
                                                <input
                                                    readOnly
                                                    type="text"
                                                    id="namaUserMobile"
                                                    className="mb-1 w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder=""
                                                    value={selectedSupplier?.master?.singkat === null ? '' : selectedSupplier?.master?.singkat}
                                                    style={{ height: '3vh' }}
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="h-full w-full">
                                    <GridDetailRekening data={selectedSupplier?.rekening} />
                                </div>

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
                <div className="flex w-full flex-grow items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={OnClick_CetakHutang}
                        >
                            Detail Hutang
                        </button>
                        <button
                            className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={OnClick_CetakHistoryBayar}
                        >
                            Detail History bayar
                        </button>
                        <button
                            className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                setSelectedDetailSupplierForEdit(selectedSupplier);
                                setMasterState('EDIT');
                                onClose();
                                setDialogBaruEditSupplier(true);
                            }}
                        >
                            Edit Data
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={refreshHandle}
                        >
                            Refresh
                        </button>
                        <button
                            className="box-border   rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={closeDialogBaruEdit}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </DialogComponent>
    );
}

export default DialogDetailSupplier;

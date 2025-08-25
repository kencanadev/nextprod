import React, { useEffect, useState, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import moment from 'moment';
import { klasifikasiSupp } from '../template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { DaftarSupplier, DaftarSupplierAll } from '../../../fa/phu/model/apiPhu';
import DialogSupplier from '../template/dialogSupplier';
import {
    OnClick_CetakDaftarHutangDagangSupplier,
    OnClick_CetakDaftarPengakuanHutangDagangSupplier,
    OnClick_CetakDetailHutangSupplierByUmur,
    OnClick_CetakDetailHutangSupplierWarkatByUmur,
    OnClick_CetakDetailHutangWarkatByUmur,
    OnClick_CetakRekapitulasiHutangSupplierByUmur,
    OnClick_CetakRekapitulasiHutangSupplierWarkatByUmur,
    OnClick_CetakRekapitulasiHutangWarkatByUmur,
} from '../functional/fungsi';
import { viewPeriode } from '@/utils/routines';
import { useSession } from '@/pages/api/sessionContext';
import { categoriesHutangUsahaDanSupplier } from '../../model/api';
import axios from 'axios';

interface DialogLaporanDetailBukuBesarProps {
    kode_entitas: any;
    visible: boolean;
    stateDataHeader: any;
    setStateDataHeader: Function;
    onClose: any;
    token: any;
}

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
        tglAkhirChecbox: moment(),
        tglRekapitulasi: moment(),
        tglDetail: moment(),

        //
        priodetgl: 'antara',
        klasifikasiSupp: 'Semua',
        isNamaSuppChecked: false,
        isUtangJatuhTempoChecked: false,
        dialogSupplierVisible: false,
        noSupplierValue: '',
        namaSupplierValue: '',
        kodeSupplierValue: '',

        searchNoSupplier: '',
        searchNamaSupplier: '',
        plagNamaPenerimaan: false,
        tipeFilterOpen: 'Input',
        tipeFocusOpen: 'namaSupp',
    });
    const [dataDaftarSupplier, setDataDaftarSupplier] = useState<any[]>([]);
    const [dataDaftarNoLpb, setDataDaftarNoLpb] = useState<any[]>([]);
    const [listDataDaftarNoLpb, setListDataDaftarNoLpb] = useState<any[]>([]);
    const vRefreshData = useRef(0);

    useEffect(() => {
        const async = async () => {
            viewPeriode(kode_entitas == '99999' ? '999' : kode_entitas)
                .then((periode) => {
                    const peride = periode.split('-')[1].split('s/d');
                    const dataPeriodeMoment = moment(peride[0].trimStart(), 'D MMMM YYYY').format('YYYY-MM-DD');

                    const dataPeriodeMomentAkhir = moment().format('YYYY-MM-DD');
                    setStateDataFilter((oldData) => ({
                        ...oldData,
                        tglAwal: moment(dataPeriodeMoment),
                        tglAkhir: moment(dataPeriodeMoment).endOf('month'),
                        tglAkhirChecbox: moment(dataPeriodeMoment).endOf('month'),
                    }));
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        async();
    }, []);

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

    const showLaporan = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        const getDetail : any = categoriesHutangUsahaDanSupplier.filter((item: any) => item.id === stateDataHeader?.idCategory)[0];
        console.log('getDetail = ', getDetail);

        const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
            params: {
                entitas: '*',
                param1: '',
                param2: 'frmReportIdx',
                param3: getDetail?.nama_komponen,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const dataPrint = getSettingPrint.data.data;
        console.log('dataPrint = ', dataPrint, dataPrint?.length);

        let allowPrint;
        if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

        const paramObject = {
            kode_entitas: kode_entitas,
            token: token,
            antara: stateDataFilter.priodetgl === 'antara' ? 0 : 1,
            tgl_awal: stateDataFilter.priodetgl === 'antara' ? moment(stateDataFilter.tglAwal).format('YYYY-MM-DD') : '2000-01-01',
            tgl_akhir: moment(stateDataFilter.tglAkhir).format('YYYY-MM-DD'),
            klasifikasiSupp: stateDataFilter.klasifikasiSupp === 'Semua' ? 'all' : stateDataFilter.klasifikasiSupp,
            namaSupp: stateDataFilter.kodeSupplierValue === '' ? 'all' : stateDataFilter.kodeSupplierValue,
            jatuhTempo: stateDataFilter.isUtangJatuhTempoChecked === true ? 1 : 'all',
            tglRekapitulasi: moment(stateDataFilter.tglRekapitulasi).format('YYYY-MM-DD'),
            tglDetail: moment(stateDataFilter.tglDetail).format('YYYY-MM-DD'),
            dataNoLpb: listDataDaftarNoLpb.length > 0 ? listDataDaftarNoLpb.join(',') : 'all',
            // visiblePrint: userid.toUpperCase() === 'ADMINISTRATOR' ? true : false,
            visiblePrint: allowPrint,
        };

        if (stateDataHeader?.idCategory === 7202) {
            OnClick_CetakDaftarHutangDagangSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7203) {
            OnClick_CetakDaftarPengakuanHutangDagangSupplier(paramObject);
        } else if (stateDataHeader?.idCategory === 7204) {
            OnClick_CetakRekapitulasiHutangSupplierByUmur(paramObject);
        } else if (stateDataHeader?.idCategory === 7205) {
            OnClick_CetakRekapitulasiHutangWarkatByUmur(paramObject);
        } else if (stateDataHeader?.idCategory === 7206) {
            OnClick_CetakRekapitulasiHutangSupplierWarkatByUmur(paramObject);
        } else if (stateDataHeader?.idCategory === 7207) {
            OnClick_CetakDetailHutangSupplierByUmur(paramObject);
        } else if (stateDataHeader?.idCategory === 7208) {
            OnClick_CetakDetailHutangWarkatByUmur(paramObject);
        } else if (stateDataHeader?.idCategory === 7209) {
            OnClick_CetakDetailHutangSupplierWarkatByUmur(paramObject);
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
                            <div className="header-title">Laporan {stateDataHeader?.valueCategory} </div>
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
                width="21%" //"70%"
                height="50%"
                position={{ X: 'center', Y: 200 }}
                style={{ position: 'fixed' }}
                close={closeModalShowBaru}
                // buttons={buttonInputData}
            >
                {stateDataHeader?.idCategory === 7202 ? (
                    <>
                        <div className="mb-3 rounded-lg border p-3">
                            {/* Periode Tanggal */}
                            <div className="mb-3 rounded-lg border p-3">
                                <h3 className="font-semibold">Periode Tgl.</h3>
                                <div className="mt-2">
                                    <label className="flex items-center">
                                        <input
                                            id="antara"
                                            type="radio"
                                            checked={stateDataFilter.priodetgl === 'antara'}
                                            name="periode"
                                            className="mr-2"
                                            onChange={(event: any) =>
                                                setStateDataFilter((prevState: any) => ({
                                                    ...prevState,
                                                    priodetgl: event.target.id,
                                                    tglAkhir: stateDataFilter.tglAkhirChecbox,
                                                }))
                                            }
                                        />
                                        Antara
                                        {stateDataFilter.priodetgl === 'antara' ? (
                                            <div className="form-input mt-1 flex justify-between" style={{ marginLeft: '133px', width: '44%', height: '30px', padding: '0px 1px 8px 10px' }}>
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
                                        ) : (
                                            <div className=" mt-1 flex justify-between" style={{ marginLeft: '133px', width: '44%', height: '30px', padding: '0px 1px 8px 10px' }}></div>
                                        )}
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <label className="flex items-center">
                                        <input
                                            id="sampaiDengan"
                                            type="radio"
                                            checked={stateDataFilter.priodetgl === 'sampaiDengan'}
                                            name="periode"
                                            className="mr-2"
                                            onChange={(event: any) =>
                                                setStateDataFilter((prevState: any) => ({
                                                    ...prevState,
                                                    priodetgl: event.target.id,
                                                    tglAkhir: moment(),
                                                }))
                                            }
                                        />
                                        Sampai Dengan
                                        <div className="form-input mt-1 flex justify-between" style={{ marginLeft: '88px', width: '44%', height: '30px', padding: '0px 1px 8px 10px' }}>
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
                                    </label>
                                </div>
                            </div>

                            {/* Klasifikasi Supplier */}
                            <div className="mb-3">
                                <h3 className="font-semibold">Klasifikasi Supplier</h3>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {klasifikasiSupp.map((item) => (
                                        <label key={item.id} className="flex items-center">
                                            <input
                                                id={item.id}
                                                type="radio"
                                                name="supplier"
                                                value={item.value}
                                                className="mr-2"
                                                checked={stateDataFilter.klasifikasiSupp === item.value}
                                                onChange={(event: any) =>
                                                    setStateDataFilter((prevState: any) => ({
                                                        ...prevState,
                                                        klasifikasiSupp: event.target.id,
                                                    }))
                                                }
                                            />
                                            {item.value}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Nama Supplier */}
                            <div className="mb-3">
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
                                    <span className="absolute right-2 top-2 text-gray-800" onClick={handleSupplier}>
                                        {' '}
                                        <FontAwesomeIcon icon={faSearch} width="18" height="18" />
                                    </span>
                                </div>
                            </div>

                            {/* Utang Jatuh Tempo */}
                            <div className="mb-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={stateDataFilter.isUtangJatuhTempoChecked}
                                        className="mr-2"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            const value: any = event.target.checked;
                                            setStateDataFilter((prevState: any) => ({
                                                ...prevState,
                                                isUtangJatuhTempoChecked: value,
                                            }));
                                        }}
                                    />
                                    Utang Jatuh Tempo
                                </label>
                            </div>
                        </div>
                    </>
                ) : stateDataHeader?.idCategory === 7203 ? (
                    <div className="mb-3 rounded-lg border p-3" style={{ height: '370px' }}>
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
                                <span className="absolute right-2 top-2 text-gray-800" onClick={handleSupplier}>
                                    {' '}
                                    <FontAwesomeIcon icon={faSearch} width="18" height="18" />
                                </span>
                            </div>
                        </div>

                        {/* No. Penerimaan */}
                        <div className="mb-3" style={{ marginTop: '2%' }}>
                            <label className="flex items-center">No. Penerimaan</label>
                            <div
                                className="mb-3 rounded-lg border p-3"
                                style={{
                                    background: 'white',
                                    borderRadius: '2px',
                                    height: '191px',
                                    overflowY: 'auto', // Tambahkan ini agar bisa di-scroll
                                }}
                            >
                                {stateDataFilter.plagNamaPenerimaan === true ? (
                                    <>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="all-entitas"
                                                checked={listDataDaftarNoLpb.length === 0 && dataDaftarNoLpb.length > 0}
                                                onChange={() => {
                                                    if (listDataDaftarNoLpb.length === 0) {
                                                        // Jika tidak ada yang tercentang, biarkan checkbox "Pilih Semua" tetap tercentang
                                                        setListDataDaftarNoLpb([]);
                                                    } else {
                                                        // Jika ada yang tercentang, kosongkan semua
                                                        setListDataDaftarNoLpb([]);
                                                    }
                                                }}
                                            />
                                            <label style={{ marginLeft: '5px' }} htmlFor={`all-entitas`} className="m-0 text-xs text-gray-900">
                                                {`Pilih Semua`}
                                            </label>
                                        </label>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {' '}
                                            {/* Tambahkan div ini untuk memastikan scroll hanya pada daftar */}
                                            {dataDaftarNoLpb.map((item: any) => (
                                                <div key={item.no_lpb} className="mb-0.5 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`checkbox-${item.no_lpb}`}
                                                        value={item.no_lpb}
                                                        checked={listDataDaftarNoLpb.includes(item.no_lpb)}
                                                        onChange={() => {
                                                            setListDataDaftarNoLpb((prevSelectedEntitas: any) => {
                                                                if (prevSelectedEntitas.includes(item.no_lpb)) {
                                                                    return prevSelectedEntitas.filter((item1: any) => item1 !== item.no_lpb);
                                                                } else {
                                                                    return [...prevSelectedEntitas, item.no_lpb];
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    <label style={{ marginLeft: '5px' }} htmlFor={`checkbox-${item.no_lpb}`} className="m-0 text-xs text-gray-900">
                                                        {`${item.no_lpb}`}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : stateDataHeader?.idCategory === 7204 || stateDataHeader?.idCategory === 7205 || stateDataHeader?.idCategory === 7206 ? (
                    <div className="mb-3 rounded-lg border p-3" style={{ height: '370px' }}>
                        {/* Periode Tanggal */}
                        <h3 className="font-semibold">Periode Tgl.</h3>

                        <div className="mt-2">
                            <label className="flex items-center">
                                Sampai Dengan Tanggal.
                                <div className="form-input mt-1 flex justify-between" style={{ marginLeft: '88px', width: '41%', height: '30px', padding: '0px 1px 8px 10px' }}>
                                    <DatePickerComponent
                                        locale="id"
                                        cssClass="e-custom-style "
                                        // renderDayCell={onRenderDayCell}
                                        enableMask={true}
                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        value={stateDataFilter.tglRekapitulasi.toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            setStateDataFilter((prevState: any) => ({
                                                ...prevState,
                                                tglRekapitulasi: moment(args.value),
                                            }));
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </div>
                            </label>
                        </div>
                    </div>
                ) : stateDataHeader?.idCategory === 7207 || stateDataHeader?.idCategory === 7208 || stateDataHeader?.idCategory === 7209 ? (
                    <div className="mb-3 rounded-lg border p-3" style={{ height: '370px' }}>
                        {/* Periode Tanggal */}
                        <h3 className="font-semibold" style={{ background: '#567295', textAlign: 'center', color: 'white' }}>
                            Tanggal Perhitungan.
                        </h3>

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
                                    value={stateDataFilter.tglDetail.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        setStateDataFilter((prevState: any) => ({
                                            ...prevState,
                                            tglDetail: moment(args.value),
                                        }));
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>

                        {/* Nama Supplier */}
                        <div className="mb-3" style={{ marginTop: '21%' }}>
                            <div className="relative mt-1">
                                <input
                                    onChange={(event) => handleNamaSupp(event.target.value)}
                                    type="text"
                                    value={stateDataFilter.namaSupplierValue}
                                    className="w-full rounded border px-2 py-1"
                                    placeholder="Cari Supplier..."
                                />
                                <span className="absolute right-2 top-2 text-gray-800" onClick={handleSupplier}>
                                    {' '}
                                    <FontAwesomeIcon icon={faSearch} width="18" height="18" />
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}
                <div
                    style={{
                        backgroundColor: '#F2FDF8',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        borderBottomLeftRadius: '6px',
                        borderBottomRightRadius: '6px',
                        width: '100%',
                        height: '45px',
                        display: 'inline-block',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                    }}
                >
                    <ButtonComponent
                        id="buBatal"
                        content="Batal"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '74px', marginTop: 1 + 'em', marginRight: 2.2 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={closeModalShowBaru}
                    />
                    <ButtonComponent
                        id="buSimpan"
                        content="OK"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-check"
                        style={{ float: 'right', width: '74px', marginTop: 1 + 'em', marginRight: 1.3 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={() => showLaporan()}
                    />
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
                setDataDaftarNoLpb={setDataDaftarNoLpb}
                setListDataDaftarNoLpb={setListDataDaftarNoLpb}
            />
        </div>
    );
};

export default BaseDialog;

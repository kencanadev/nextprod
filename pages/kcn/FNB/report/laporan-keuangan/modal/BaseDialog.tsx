import React, { useEffect, useState } from 'react';

import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { cash_flow, laba_rugi_komparasi, laba_rugi_komparasi_selisih, laba_rugi_standar, lr_devisi_penjualan, neraca_komparasi, neraca_std, PrintData, rpNeracaSkontro } from '../utils';
import axios from 'axios';
import { FirstDayInPeriod, viewPeriode } from '@/utils/routines';
import { categoriesHutangUsahaDanSupplier, categoriesLaporanKeuangan } from '../../model/api';
import { useSession } from '@/pages/api/sessionContext';

interface BaseDialogProps {
    tipe: number;
    title: string;
    isOpen: boolean;
    kode_entitas: string;
    token: string;
    detailApiMenu: any;
    onClose: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const divisiData = [
    { kode: 'AC', nama: 'Antar Cabang' },
    { kode: 'BS', nama: 'Besi' },
    { kode: 'KA', nama: 'Kantor' },
    { kode: 'NB', nama: 'Non Besi' },
];

const BaseDialog: React.FC<BaseDialogProps> = ({ detailApiMenu, tipe, title, isOpen, kode_entitas, token, onClose }) => {
    const { sessionData } = useSession();
    const userid = sessionData?.userid ?? '';
    const [isPeriodeTgl, setIsPeriodeTgl] = useState(false);
    const [periodeTgl, setPeriodeTgl] = useState('');
    const [isSaldoChecked, setIsSaldoChecked] = useState(false);
    const [masterDate, setMasterDate] = useState({
        tglAwal: moment(),
        tglAkhir: moment(),
    });
    const [radioValue, setRadioValue] = useState('Tampilkan Th. Berjalan');
    const [kodeDivisi, setKodeDivisi] = useState('KA');
    const [divisi, setDivisi] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const updateStateDate = (field: any, value: any) => {
        setMasterDate((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const getPeriod = async () => {
        // const period = await viewPeriode(kode_entitas);
        const period = await FirstDayInPeriod(kode_entitas);
        const awalPeriod = moment(period);
        const akhirPeriod = moment(period).add(1, 'month').subtract(1, 'day');
        updateStateDate('tglAwal', awalPeriod);
        updateStateDate('tglAkhir', akhirPeriod);
    };

    useEffect(() => {
        getPeriod();
    }, []);

    useEffect(() => {
        const fetchDivisi = async () => {
            axios
                .get(`${apiUrl}/erp/master_divisi`, {
                    params: {
                        entitas: kode_entitas,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res: any) => {
                    const data = res.data.data;
                    const filteredData = data.filter((item: any) => item.id !== '1');
                    setDivisi(filteredData);
                });
        };

        fetchDivisi();
    }, []);

    async function handlePrint() {
        let responseApi;
        let objHeader = {};
        let isLandscape = false;

        if (tipe == 7601) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/neraca_standar`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //         param2: isSaldoChecked ? 1 : 0,
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                console.log('getDetail', getDetail);

                const allowPrint = true;
                const params = `entitas=${kode_entitas}&param1=${moment(masterDate.tglAkhir.format('YYYY-MM-DD')).format('YYYY-MM-DD')}&param2=${
                    isSaldoChecked ? 1 : 0
                }&token=${token}&allowPrint=${allowPrint}`;
                neraca_std(params);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            isLandscape = false;
            objHeader = {
                kode_entitas,
                title: 'Neraca Standar',
                periode: masterDate.tglAkhir.format('DD MMMM YYYY'),
            };
        } else if (tipe == 7602) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/neraca_skontro`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //         param2: isSaldoChecked ? 1 : 0,
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                console.log('getDetail', getDetail);

                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: getDetail.nama_komponen,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }


                const params = `entitas=${kode_entitas}&param1=${masterDate.tglAkhir.format('YYYY-MM-DD')}&param2=${isSaldoChecked ? 1 : 0}&token=${token}&allowPrint=${allowPrint}`;
                rpNeracaSkontro(params);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            isLandscape = true;
            objHeader = {
                kode_entitas,
                title: 'Neraca',
                periode: masterDate.tglAkhir.format('DD MMMM YYYY'),
            };
        } else if (tipe == 7603) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/laba_rugi_standar`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: masterDate.tglAwal.format('YYYY-MM-DD'),
                //         param2: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //         param3: 0,
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: getDetail.nama_komponen,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

                const params = `entitas=${kode_entitas}&param1=${moment(masterDate.tglAwal.format('YYYY-MM-DD')).format('YYYY-MM-DD')}&param2=${masterDate.tglAkhir.format('YYYY-MM-DD')}&param3=${
                    isSaldoChecked ? 1 : 0
                }&token=${token}&allowPrint=${allowPrint}`;
                laba_rugi_standar(params);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            objHeader = {
                kode_entitas,
                title: 'LAPORAN LABA RUGI STANDAR',
                periode: 'PERIODE TGL. ' + masterDate.tglAwal.format('DD-MM-YYYY') + ' S/D ' + masterDate.tglAkhir.format('DD-MM-YYYY'),
            };
        } else if (tipe == 7604) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/cash_flow`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: masterDate.tglAwal.format('YYYY-MM-DD'),
                //         param2: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: getDetail.nama_komponen,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

                const params = `entitas=${kode_entitas}&param1=${masterDate.tglAkhir.format('YYYY-MM-DD')}&param2=${isSaldoChecked ? 1 : 0}&token=${token}&allowPrint=${allowPrint}`;
                cash_flow(params);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            objHeader = {
                kode_entitas: kode_entitas == '999' ? 'Training' : kode_entitas,
                title: 'Laporan Arus Kas',
                periode: `Periode tgl. ${masterDate.tglAwal.format('DD MMMM YYYY')} s/d ${masterDate.tglAkhir.format('DD MMMM YYYY')}`,
            };
        } else if (tipe == 7605) {
            try {
                setIsLoading(true);
                const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        entitas: kode_entitas,
                    },
                });

                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: getDetail.nama_komponen,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }


                const params = `entitas=${kode_entitas}&param1=${moment(masterDate.tglAkhir).format('YYYY-MM-DD')}&param2=${isSaldoChecked ? 1 : 0}&param3=${
                    responseSetting.data.data[0].no_rl_berjalan
                }&token=${token}&allowPrint=${allowPrint}`;
                console.log('params', params);
                

                neraca_komparasi(params);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/neraca_komparasi`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //         param2: isSaldoChecked ? 1 : 0,
                //         param3: responseSetting.data.data[0].no_rl_berjalan,
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            objHeader = {
                kode_entitas,
                title: 'LAPORAN NERACA KOMPARASI',
                periode: masterDate.tglAkhir.format('DD MMMM YYYY'),
            };
        } else if (tipe == 7606) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/lrkomparasi`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: radioValue == 'Tampilkan Th. Berjalan' ? 0 : 1,
                //         param2: isSaldoChecked ? 1 : 0,
                //         param3: masterDate.tglAwal.format('YYYY-MM-DD'),
                //         param4: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: radioValue == 'Tampilkan Th. Berjalan' ? getDetail.nama_komponen.split(',')[0] : getDetail.nama_komponen.split(',')[1] ,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

                const param = `entitas=${kode_entitas}&param1=${radioValue == 'Tampilkan Th. Berjalan' ? 0 : 1}&param2=${isSaldoChecked ? 1 : 0}&param3=${masterDate.tglAwal.format(
                    'YYYY-MM-DD'
                )}&param4=${masterDate.tglAkhir.format('YYYY-MM-DD')}&token=${token}&allowPrint=${allowPrint}`;
                if (radioValue == 'Tampilkan Th. Berjalan') {
                    laba_rugi_komparasi(param);
                } else {
                    laba_rugi_komparasi_selisih(param);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            objHeader = {
                kode_entitas: kode_entitas == '999' ? 'Training' : kode_entitas,
                title: 'Laba Rugi Komparasi',
                periode: `Periode tgl. ${masterDate.tglAwal.format('DD MMMM YYYY')} s/d ${masterDate.tglAkhir.format('DD MMMM YYYY')}`,
                tipe: radioValue == 'Tampilkan Th. Berjalan' ? 0 : 1,
                tampilSaldo: isSaldoChecked ? true : false,
            };
        } else if (tipe == 7608) {
            try {
                setIsLoading(true);
                // responseApi = await axios.get(`${apiUrl}/erp/laporan/keuangan/labarugi_divisi_penjualan`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: '2025-01-01',
                //         param2: '2025-01-31',
                //         // param1: masterDate.tglAwal.format('YYYY-MM-DD'),
                //         // param2: masterDate.tglAkhir.format('YYYY-MM-DD'),
                //         param3: kodeDivisi.toUpperCase(),
                //         param4: isSaldoChecked ? 1 : 0,
                //     },
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const getDetail = categoriesLaporanKeuangan.filter((item: any) => item.id === tipe)[0];
                const getSettingPrint = await axios.get(`${apiUrl}/erp/get_setting_printer`, {
                    params: {
                        entitas: '*',
                        param1: '',
                        param2: 'frmReportIdx',
                        param3: getDetail.nama_komponen,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const dataPrint = getSettingPrint.data.data;

                let allowPrint;
                if (userid.toUpperCase() === 'ADMINISTRATOR' || dataPrint?.length === 0 || dataPrint[0]?.cetak_printer === 'Y') {
            allowPrint = true;
        } else {
            allowPrint = false;
        }

                if (userid.toUpperCase() === 'ADMINISTRATOR') {
                    allowPrint = true;
                } else {
                    allowPrint = false;
                }
                const param = `entitas=${kode_entitas}&param1=${masterDate.tglAwal.format('YYYY-MM-DD')}&param2=${masterDate.tglAkhir.format('YYYY-MM-DD')}&param3=${kodeDivisi.toUpperCase()}&param4=${
                    isSaldoChecked ? 1 : 0
                }&token=${token}&allowPrint=${allowPrint}`;
                lr_devisi_penjualan(param);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
            objHeader = {
                kode_entitas: kode_entitas == '999' ? 'Training' : kode_entitas,
                title: 'Laporan Laba Rugi Divisi Penjualan',
                periode: `${kodeDivisi} - Periode tgl. ${masterDate.tglAwal.format('DD MMMM YYYY')} s/d ${masterDate.tglAkhir.format('DD MMMM YYYY')}`,
            };
        }

        // PrintData(responseApi?.data.data, objHeader, tipe, isLandscape);
    }

    useEffect(() => {
        if (tipe === 7603 || tipe === 7604 || tipe === 7606 || tipe === 7608) {
            //   periodeTgl = 'Periode Tgl.';
            setPeriodeTgl('Periode Tgl.');
            setIsPeriodeTgl(true);
        } else {
            //   periodeTgl = 'Sampai dengan tanggal';
            setPeriodeTgl('Sampai dengan tanggal');
            setIsPeriodeTgl(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (tipe === 7603) {
            viewPeriode(kode_entitas == '99999' ? '999' : kode_entitas)
                .then((periode) => {
                    const peride = periode.split('-')[1].split('s/d');
                    const dataPeriodeMoment = moment(peride[0].trimStart(), 'D MMMM YYYY').format('YYYY-MM-DD');

                    const dataPeriodeMomentAkhir = moment().format('YYYY-MM-DD');
                    setMasterDate((oldData) => ({
                        ...oldData,
                        tglAwal: moment(dataPeriodeMoment),
                        tglAkhir: moment(dataPeriodeMoment).endOf('month'),
                    }));
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [isOpen]);

    // Button
    const buttonsBaseDialog: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: isLoading ? 'Loading...' : 'Ok',
                cssClass: 'e-primary e-small',
                disabled: isLoading,
            },
            isFlat: false,
            click: handlePrint,
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
                disabled: isLoading,
            },
            isFlat: false,
            click: () => {
                onClose();
            },
        },
    ];
    return (
        <DialogComponent
            id="baseDialog"
            isModal
            width="600px"
            height="300px"
            position={{ X: 'center', Y: 'center' }}
            visible={isOpen}
            close={() => {
                onClose();
            }}
            header={title}
            showCloseIcon
            target={'#main-target'}
            closeOnEscape
            allowDragging
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            buttons={buttonsBaseDialog}
        >
            <div className="px-3 py-1">
                {/* Periode Tgl. */}
                <div className="flex items-center gap-2">
                    <label className={`${isPeriodeTgl ? 'w-20' : 'w-36'}`}>{periodeTgl}</label>
                    <div className="flex items-center gap-2">
                        {tipe === 7605 || tipe === 7601 || tipe === 7602 ? (
                            <div className="form-input mt-1 flex justify-between">
                                <DatePickerComponent
                                    locale="id"
                                    style={{ fontSize: '12px' }}
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={masterDate.tglAkhir.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        updateStateDate('tglAkhir', moment(args.value));
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        ) : (
                            <div className="form-input mt-1 flex justify-between">
                                <DatePickerComponent
                                    locale="id"
                                    style={{ fontSize: '12px' }}
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={masterDate.tglAwal.toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        updateStateDate('tglAwal', moment(args.value));
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        )}

                        {isPeriodeTgl && (
                            <>
                                <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                <div className="form-input mt-1 flex justify-between">
                                    <DatePickerComponent
                                        locale="id"
                                        style={{ fontSize: '12px' }}
                                        cssClass="e-custom-style"
                                        //   renderDayCell={onRenderDayCell}
                                        enableMask={true}
                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        value={masterDate.tglAkhir.toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            updateStateDate('tglAkhir', moment(args.value));
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Checkbox  */}
                {tipe !== 7604 && (
                    <div className="mt-3 flex items-center gap-2">
                        <input type="checkbox" id="checkbox" name="checkbox" checked={isSaldoChecked} onChange={(e) => setIsSaldoChecked(e.target.checked)} />
                        <label htmlFor="checkbox" className="m-0">
                            Termasuk Saldo Nol
                        </label>
                    </div>
                )}

                {/* Radio */}
                {tipe === 7606 && (
                    <div className="relative mt-5 flex flex-col gap-1 border border-dotted border-black/70 p-4">
                        <span className="absolute -top-2 left-4 bg-white px-2 text-black">Pilihan</span>
                        {['Tampilkan Th. Berjalan', 'Tampilkan Selisih +/-'].map((option) => (
                            <label key={option} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="lunas"
                                    value={option}
                                    checked={radioValue === option}
                                    // onChange={(e) => updateStateFilter('lunas', e.currentTarget.value)}
                                    onChange={(e) => setRadioValue(e.currentTarget.value)}
                                    className="form-radio"
                                />
                                <span className="ml-1">{option}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Divisi */}
                {tipe === 7608 && (
                    <div className="mt-5 flex flex-col gap-1">
                        <label>Divisi Penjualan</label>
                        <select value={kodeDivisi} className="rounded border border-black/50 p-2" name="" id="" onChange={(e) => setKodeDivisi(e.target.value)}>
                            {divisi.map((item: any) => (
                                <option key={item.kode_jual} value={item.kode_jual}>
                                    {item.kode_jual} - {item.nama_jual}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </DialogComponent>
    );
};

export default BaseDialog;

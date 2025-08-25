import React, { useEffect, useRef, useState } from 'react';
import GridPiutang from '../piutang/GridPiutang';
import { useRouter } from 'next/router';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import { SpreadNumber } from '../../../fa/fpp/utils';
import GridAR from './GridAR';
import GridAP from './GridAP';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

const dataUmur = [0, 15, 30, 45, 60, 75, 90, 120];

const TabSelisihARAP = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [footerData, setFooterData] = useState({
        estimasi_atas: 0,
        count_atas: 0,
        estimasi_tengah: 0,
        count_tengah: 0,
        estimasi_bawah: 0,
    });
    const [date, setDate] = useState(moment());
    const [minimalPiutang, setMinimalPiutang] = useState(75);
    const gridAR = useRef<any>(null);
    const gridAP = useRef<any>(null);

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    const refreshHanlde = async () => {
        const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                entitas: kode_entitas,
            },
        });
        console.log('responseSetting ar ap', responseSetting);

        const response = await axios.get(`${apiUrl}/erp/selisih_ar_ap_dashboard`, {
            params: {
                entitas: kode_entitas,
                param1: moment(date).format('YYYY-MM-DD'),
                param2: minimalPiutang,
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const modap: any = response.data.data.ap.map((item: any) => ({
            ...item,
            sisa_hutang: SpreadNumber(item.sisa_hutang),
        }));

        const modar: any = response.data.data.ar.map((item: any) => ({
            ...item,
            sisa_piutang: SpreadNumber(item.sisa_piutang),
        }));
        // console.log();
        const total = modap.reduce(function (a: any, b: any) {
            return a + b.sisa_hutang;
        }, 0);
        const total1 = modar.reduce(function (a: any, b: any) {
            return a + b.sisa_piutang;
        }, 0);
        setFooterData({
            estimasi_atas: SpreadNumber(total),
            count_atas: modap.length,
            estimasi_tengah: SpreadNumber(total1),
            count_tengah: modar.length,
            estimasi_bawah: SpreadNumber(total1 - total),
        });
        // const dataSJ = response.data.data.filter((item: any) => item.id === 0);
        // const dataTTB = response.data.data.filter((item: any) => item.id === 1);

        gridAR.current.setProperties({ dataSource: modar });
        gridAP.current.setProperties({ dataSource: modap });
        console.log('response ar ap', response.data.data, modap, modar);
    };

    function formatNumber(num: any) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    useEffect(() => {
        if (kode_entitas) {
            refreshHanlde();
        }
    }, [kode_entitas]);
    return (
        <div className="h-full w-full flex-col bg-[#dedede] p-1">
            <div className="flex h-full w-full flex-grow flex-col overflow-x-auto rounded-md bg-white">
                <div className={`flex h-[85%] w-full flex-col overflow-x-auto px-2 py-1`}>
                    <div className={` flex h-[240px] w-full  overflow-x-auto px-2 py-1`}>
                        <GridAR gridAR={gridAR} />
                    </div>
                    <div className={` flex h-[240px] w-full  overflow-x-auto px-2 py-1`}>
                        <GridAP gridAP={gridAP} />
                    </div>
                    <div className={`flex w-full flex-grow px-2 py-0.5`}>{/* <GridPiutang /> */}</div>
                </div>
                <div className={`flex w-full flex-grow px-2 py-1`}>
                    <div className="flex w-[60%]  flex-col ">
                        <p className=" font-bold">Sumary :</p>
                        <p className=" ">
                            Estimasi Jumlah piutang yg bisa ditagih dikurangi BD &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{' '}
                            <b>
                                {formatNumber(footerData.estimasi_tengah)} = {footerData.count_tengah} Faktur{' '}
                            </b>
                        </p>
                        <p className=" ">
                            Estimasi jumlah hutang jatuh tempo yang harus dibayar :{' '}
                            <b>
                                {formatNumber(footerData.estimasi_atas)} = {footerData.count_atas} Faktur{' '}
                            </b>
                        </p>
                        <p>
                            Selisih Penerimaan piutang dan pembayaran hutang &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{' '}
                            <b className={` font-bold ${footerData.estimasi_bawah < 0 ? 'text-red-400' : ''}`}>
                                {footerData.estimasi_bawah < 0 ? '( ' + formatNumber(Math.abs(footerData.estimasi_bawah)) + ' )' : formatNumber(Math.abs(footerData.estimasi_bawah))}{' '}
                            </b>
                        </p>
                    </div>
                    <div className="flex flex-grow flex-col ">
                        <div className=" font-bold">Parameter &nbsp;:</div>
                        <div className=" flex items-center">
                            Tanggal Valuta &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                            <span className="ml-2 flex h-[33px] w-[120px] items-center rounded border bg-white pl-2">
                                <DatePickerComponent
                                    locale="id"
                                    cssClass="e-custom-style"
                                    enableMask={true}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    width={180}
                                    value={moment(date).toDate()}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        setDate(moment(args.value));
                                    }}
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </span>
                        </div>
                        <div className="flex items-center ">
                            Minimal umur faktur piutang :{' '}
                            <select
                                name="kode_akun"
                                value={minimalPiutang}
                                onChange={(e: any) => setMinimalPiutang(e.target.value)}
                                className="ml-2 w-[120px] rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="" disabled>
                                    Pilh umur
                                </option>

                                {dataUmur.map((item: any) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <button className="ml-2 rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshHanlde}>
                                🔄️ Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabSelisihARAP;

import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { useSession } from '@/pages/api/sessionContext';

L10n.load(idIDLocalization);
enableRipple(true);

const KartuStockAll = ({ visible, onClose, stateStokAll, setStateStokAll, selectedRow }: { visible: boolean; onClose: any; stateStokAll: any; setStateStokAll: any; selectedRow: any }) => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const getStockAll = async () => {
        console.log('selectedRow?.kode_fk', selectedRow?.kode_fk);

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Kartu Stok ALL | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./informasi-stok-aktual/report/kartu_stock_all?entitas=${kode_entitas}&param1=${0}&param2=${moment(stateStokAll?.tanggal_awal_stok_all).format(
            'YYYY-MM-DD'
        )}&param3=${moment(stateStokAll?.tanggal_akhir_stok_all).format('YYYY-MM-DD')}&param4=${stateStokAll?.isNamaBarang ? 'Y' : 'N'}&param5=${' '}&param6=${
            selectedRow?.kode_barang
        }&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
    return (
        <DialogComponent
            id="dialogListKendaraan"
            isModal={true}
            width={350}
            height={300}
            header={'Kartu Persediaan all'}
            visible={visible}
            close={onClose}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="h-full w-full flex-col">
                <div className="flex h-[75%] w-full flex-col gap-2">
                    <div className="flex w-full gap-2">
                        <div className="flex flex-col">
                            <label className="mb-1 flex items-center  text-xs">Tanggal Awal</label>
                            <div className="flex w-full items-center gap-2">
                                <span className="flex h-[35px] w-[120px] items-center rounded border bg-white pl-2">
                                    <DatePickerComponent
                                        locale="id"
                                        cssClass="e-custom-style"
                                        enableMask={true}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        width={180}
                                        value={stateStokAll?.tanggal_awal_stok_all.toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            setStateStokAll((prevState: any) => ({
                                                ...prevState,
                                                tanggal_awal_stok_all: moment(args.value),
                                            }));
                                        }}
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-1 flex items-center gap-2 text-xs">Tanggal Akhir</label>
                            <div className="flex w-full items-center">
                                <span className="flex h-[35px] w-[120px] items-center rounded border bg-white pl-2">
                                    <DatePickerComponent
                                        locale="id"
                                        cssClass="e-custom-style"
                                        enableMask={true}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        width={180}
                                        value={stateStokAll?.tanggal_akhir_stok_all.toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            setStateStokAll((prevState: any) => ({
                                                ...prevState,
                                                tanggal_akhir_stok_all: moment(args.value),
                                            }));
                                        }}
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <p>No Barang :</p>
                        <p>{selectedRow?.no_item}</p>
                    </div>
                    <div className="w-full">
                        <p>Nama Barang :</p>
                        <p>{selectedRow?.nama_item}</p>
                    </div>
                </div>
                <div className="h-[10%] w-full">
                    <div className="mb-1 flex w-full flex-col items-start">
                        <label className="mb-1 flex items-center gap-2 text-xs text-blue-500">
                            <input
                                type="checkbox"
                                checked={stateStokAll?.isNamaBarang}
                                onChange={(e) =>
                                    setStateStokAll((prev: any) => ({
                                        ...prev,
                                        isNamaBarang: !prev.isNamaBarang,
                                    }))
                                }
                            />{' '}
                            Nama Barang = Cetak SJ / Fakur
                        </label>
                    </div>
                </div>
                <div className="flex h-[15%] w-full justify-end gap-2 pb-2 pr-2">
                    <ButtonComponent type="submit" onClick={getStockAll}>
                        <u>O</u>K
                    </ButtonComponent>
                    <ButtonComponent type="submit" onClick={onClose}>
                        <u>B</u>atal
                    </ButtonComponent>
                </div>
            </div>
        </DialogComponent>
    );
};

export default KartuStockAll;

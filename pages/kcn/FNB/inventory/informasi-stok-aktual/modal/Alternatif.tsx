import React, { useEffect, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';

L10n.load(idIDLocalization);
enableRipple(true);

const Alternatif = ({ visible, onClose, selectedRow }: { visible: boolean; onClose: any; selectedRow: any }) => {
    const { sessionData, isLoading } = useSession();
    const gridDaftarBarang = useRef<any>(null);
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const getDaftarStok = async () => {
        const response = await axios.get(`${apiUrl}/erp/daftar_paket_dan_alternatif_actual_stock?`, {
            params: {
                entitas: kode_entitas,
                param1: moment().format('YYYY-MM-DDD'),
                param2: selectedRow.kode_barang,
                param3: 'ALTERNATIF',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('response paket', response);

        gridDaftarBarang.current.dataSource = response.data.data;
    };
    useEffect(() => {
        if (Object.keys(selectedRow).length !== 0) {
            getDaftarStok();
        }
    }, [selectedRow]);
    return (
        <DialogComponent
            id="dialogAlternatif"
            isModal={true}
            width={500}
            height={500}
            header={'Daftar Alternatif ' + selectedRow?.nama_item}
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
                <div className="flex h-[93%] w-full flex-col gap-2">
                    <GridComponent
                        id="gridDaftarBarang"
                        name="gridDaftarBarang"
                        className="gridDaftarBarang"
                        locale="id"
                        //  dataSource={dialogListPengemudi}
                        //  rowSelecting={handleSelect}
                        //  recordDoubleClick={hanldeRecordDoubleClick}
                        ref={gridDaftarBarang}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        gridLines={'Both'}
                        height={'280'} // Tinggi grid dalam piksel /
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" width={110} />
                            <ColumnDirective field="nama_item" headerText="Nama. Barang" headerTextAlign="Center" textAlign="Left" width={160} />
                        </ColumnsDirective>

                        <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                    </GridComponent>
                </div>
                <div className="flex h-[8%] w-full justify-end gap-2 pb-2 pr-2">
                    <ButtonComponent type="submit" onClick={onClose}>
                        <u>Tu</u>tup
                    </ButtonComponent>
                </div>
            </div>
        </DialogComponent>
    );
};

export default Alternatif;

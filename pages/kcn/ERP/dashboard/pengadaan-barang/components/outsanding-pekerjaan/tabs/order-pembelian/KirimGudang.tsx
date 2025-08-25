import React, { useEffect, useState } from 'react';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';

// Syncfusion
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    ExcelExport,
    PdfExport,
    CommandColumn,
    CellEditArgs,
    QueryCellInfoEventArgs,
} from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import moment from 'moment';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { useSession } from '@/pages/api/sessionContext';
import swal from 'sweetalert2';
import { getPoHeader, postDateOT } from '../../../../api';
import { useRouter } from 'next/router';
import { buttonUbah } from '@/pages/kcn/ERP/purchase/po/component/fungsi';
L10n.load(idIDLocalization);
enableRipple(true);

const TanggalTemplate = (props: any, refreshData: any) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const { kode_dokumen, status_kirim, no_sjpabrik, tgl_sjpabrik, tgl_sjfax, nota } = props;

    const updateData = async (date: any) => {
        const body = {
            entitas: kode_entitas,
            kode_dokumen,
            tgl_kirim: moment(date).format('YYYY-MM-DD'),
            status_kirim,
            no_sjpabrik,
            tgl_sjpabrik: tgl_sjpabrik === null ? null : moment(tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
            tgl_sjfax: tgl_sjfax === null ? null : moment(tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
            nota,
        };
        try {
            const res = await postDateOT(body, token);

            if (res!.status === 200) {
                refreshData();
                swal.fire({
                    icon: 'success',
                    title: 'Berhasil ubah data.',
                    target: '#main-target',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            swal.fire({
                icon: 'error',
                title: 'Gagal ubah data.',
                target: '#main-target',
                timer: 2000,
                showConfirmButton: false,
            });
            console.error('Error updating data: ', error);
        }
    };

    const color = props.status_app === 'Disetujui' ? 'green' : props.status_app === 'Baru' ? 'blue' : 'black';
    return (
        <div className="flex items-center justify-between  h-[20px]">
            <DatePickerComponent
                locale="id"
                style={{ fontSize: '8px', padding: '0 !important', color: color }}
                cssClass="e-custom-style"
                // renderDayCell={onRenderDayCell}
                enableMask={true}
                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                showClearButton={false}
                format="dd-MM-yyyy"
                value={props.tgl_kirim}
                // onBlur={() => alert('Kirim Data')}
                change={(args: ChangeEventArgsCalendar) => {
                    // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                    updateData(args.value);
                }}
            >
                <Inject services={[MaskedDateTime]} />
            </DatePickerComponent>
        </div>
    );
};

const KirimGudang = ({ data, handleRowSelected, refreshData, refGrid, selectedItems }: { data: any; handleRowSelected: any; refreshData: any; refGrid: any; selectedItems: any }) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';

    const router = useRouter();

    const handleRecordDoubleClick = async (args: any) => {
        const { field } = args.column;
        const header = await getPoHeader({ entitas: kode_entitas, kode_dokumen: selectedItems.kode_dokumen, token });

        if (field === 'nota' || field === 'tgl_kirim') {
            return;
        }

        if (header) {
            const result = buttonUbah(
                header[0].kontrak,
                header[0].produksi,
                header[0].kode_sp,
                'Persediaan',
                moment(),
                moment().endOf('month'),
                moment(),
                moment().endOf('month'),
                moment(),
                moment().endOf('month'),
                'yes',
                '',
                '',
                '',
                false,
                false,
                false,
                '',
                '',
                false
            );
            router.push({ pathname: `/kcn/ERP/purchase/po/po`, query: { str: result, tipe: 'dashboard' } });
        }
    };

    const cellEdit = (args: CellEditArgs) => {
        const { columnName: field } = args;

        if (field === 'nota') {
            args.cancel = false;
        } else {
            args.cancel = true;
        }
    };

    const cellSaved = async (args: any) => {
        const { kode_dokumen, tgl_kirim, status_kirim, no_sjpabrik, tgl_sjpabrik, tgl_sjfax } = args.rowData;
        const params = {
            entitas: kode_entitas,
            kode_dokumen,
            tgl_kirim: moment(tgl_kirim).format('YYYY-MM-DD'),
            status_kirim,
            no_sjpabrik,
            tgl_sjpabrik: tgl_sjpabrik === null ? null : moment(tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
            tgl_sjfax: tgl_sjfax === null ? null : moment(tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
            nota: args.value,
        };

        try {
            const res = await postDateOT(params, token);

            if (res!.status === 200) {
                refreshData();
                swal.fire({
                    icon: 'success',
                    title: 'Berhasil ubah data.',
                    target: '#main-target',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            swal.fire({
                icon: 'error',
                title: 'Gagal ubah data.',
                target: '#main-target',
                timer: 2000,
                showConfirmButton: false,
            });
            console.error('Error updating data: ', error);
        }
    };

    const queryCellInfo = (args: any) => {
        if (args.data.status_app === 'Disetujui') {
            args.cell.style.color = 'green';
        } else if (args.data.status_app === 'Baru') {
            args.cell.style.color = 'blue';
        }
    };

    // Grid configuration
    const gridOptions = {
        /**
         * page settings menyebabkan refresh terjadi ketika row selected.
         * jadi boleh dikomen untuk mencegah refresh ketika row selected.
         */
        pageSettings: {
            pageSize: 25,
            pageCount: 5,
            pageSizes: ['25', '50', '75', 'All'],
        },
        selectionSettings: {
            mode: 'Row',
            type: 'Single',
        },
        allowPaging: true,
        allowSorting: true,
        allowFiltering: false,
        allowResizing: true,
        // autoFit: true,
        allowReordering: true,
        rowHeight: 22,
        height: '100%',
        width: '100%',
        gridLines: 'Both',
        // loadingIndicator: { indicatorType: 'Shimmer' },
    };
    return (
        <div className="h-[calc(125vh-460px)] w-[calc(130vw)]">
            <GridComponent
                {...gridOptions}
                ref={refGrid}
                editSettings={{ allowEditing: true, mode: 'Batch' }}
                cellEdit={cellEdit}
                cellSaved={cellSaved}
                enableAdaptiveUI
                recordDoubleClick={handleRecordDoubleClick}
                rowSelected={handleRowSelected}
                dataSource={data}
                queryCellInfo={queryCellInfo}
                autoFit
            >
                <ColumnsDirective>
                    <ColumnDirective field="no_dok" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="tgl" format={'dd-MM-yyyy'} type="date" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective
                        field="tgl_kirim"
                        format={'dd-MM-yyyy'}
                        type="date"
                        headerText="Est. Tgl Dikirim"
                        headerTextAlign="Center"
                        textAlign="Left"
                        width="100"
                        clipMode="EllipsisWithTooltip"
                        template={(props: any) => TanggalTemplate(props, refreshData)}
                    />
                    <ColumnDirective field="nama_supp" headerText="Supplier" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective
                        columns={[
                            {
                                field: 'status',
                                headerText: 'Dokumen',
                                headerTextAlign: 'Center',
                                textAlign: 'Center',
                                width: '80',
                            },
                            {
                                field: 'status_app',
                                headerText: 'Approval',
                                headerTextAlign: 'Center',
                                textAlign: 'Center',
                                width: '80',
                            },
                        ]}
                        headerText="Status"
                        headerTextAlign="Center"
                        textAlign="Center"
                        width="100"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective
                        field="od"
                        headerText="Overdue (hari)"
                        headerTextAlign="Center"
                        textAlign="Center"
                        width="100"
                        clipMode="EllipsisWithTooltip"
                        template={(props: any) => {
                            return <span>{props.od < 0 ? `(${Math.abs(props.od).toLocaleString('en-US')})` : parseFloat(props.od).toLocaleString('en-US')}</span>;
                        }}
                    />
                    <ColumnDirective field="nota" headerText="Catatan" headerTextAlign="Center" textAlign="Left" width="250" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>
                <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn]} />
            </GridComponent>
        </div>
    );
};

export default KirimGudang;

import React, { useState } from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import axios from 'axios';
import Swal from 'sweetalert2';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em', padding: 5 }}>
        {value1}
        <div>{value2}</div>
    </div>
);

const editOptions = { allowEditing: true, allowAdding: true, allowDeleting: true, showConfirmDialog: false, mode: 'Batch' };

const GridWarkat = ({ gridPPI, getSelectedRow, setModalAkun, token, kode_entitas }: { gridPPI: any; getSelectedRow: any; setModalAkun: any; token: any; kode_entitas: any }) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const templateTombolTTD = (args: any) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '11px' }}>
                    {args.filegambar !== '' ? (
                        <input
                            readOnly={true}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                borderRadius: '5px', // Atur sesuai dengan kebutuhan
                                fontSize: '11px', // Sesuaikan ukuran font
                            }}
                            value={args.nama_akun}
                        />
                    ) : null}
                </div>
                <div onClick={() => setModalAkun(true)}>
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} width="18" height="18" />
                </div>
            </div>
        );
    };

    const save = async (args: any) => {
        gridPPI.current.editModule.batchSave();
        try {
            if (args.name === 'cellSaved' && args.value !== null) {
                const test = moment(args.value).format('YYYY-MM-DD HH:mm:ss');
                console.log('args ke save ke edit', test);
                const dataKirim = {
                    entitas: kode_entitas,
                    tgl_setorgiro: moment(args.value).format('YYYY-MM-DD'),
                    kode_akun_debet: args.rowData.kode_akun_debet,
                    kode_dokumen: args.rowData.kode_dokumen,
                };
                const response: any = await axios.patch(`${apiUrl}/erp/update_warkat_dashboard_ar?`, dataKirim, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.status === true) {
                    return Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        target: '#main-target',
                        timer: 1500,
                        text: `Simpan Data Berhasil`,
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    const created = () => {
        gridPPI.current.getContentTable().addEventListener('click', (args: any) => {
            if (args.target.classList.contains('e-rowcell')) {
                gridPPI.current.editModule.editCell(parseInt(args.target.getAttribute('index')), gridPPI.current.getColumnByIndex(parseInt(args.target.getAttribute('data-colindex'))).field);
            }
        });
        gridPPI.current.element.addEventListener('keydown', (e: any) => {
            var closesttd = e.target.closest('td');
            if (e.keyCode === 39 && !isNullOrUndefined(closesttd.nextSibling)) {
                editACell(closesttd.nextSibling);
            }
            if (
                e.keyCode === 37 &&
                !isNullOrUndefined(closesttd.previousSibling) &&
                !gridPPI.current.getColumnByIndex(parseInt(closesttd.previousSibling.getAttribute('data-colindex'))).isPrimaryKey
            ) {
                editACell(closesttd.previousSibling);
            }
            if (e.keyCode === 40 && !isNullOrUndefined(closesttd.closest('tr').nextSibling)) {
                editACell(closesttd.closest('tr').nextSibling.querySelectorAll('td')[parseInt(closesttd.getAttribute('data-colindex'))]);
            }
            if (e.keyCode === 38 && !isNullOrUndefined(closesttd.closest('tr').previousSibling)) {
                editACell(closesttd.closest('tr').previousSibling.querySelectorAll('td')[parseInt(closesttd.getAttribute('data-colindex'))]);
            }
        });
    };
    const editACell = (args: any) => {
        gridPPI.current.editModule.editCell(parseInt(args.getAttribute('index')), gridPPI.current.getColumnByIndex(parseInt(args.getAttribute('data-colindex'))).field);
    };
    return (
        <GridComponent
            id="gridPiutang"
            locale="id"
            // dataSource={listHistory}
            height={400}
            width={'100%'}
            ref={gridPPI}
            editSettings={editOptions}
            enableHover={false}
            created={created}
            rowHeight={23}
            gridLines="Both"
            cellSaved={save}
            rowSelected={getSelectedRow}
            queryCellInfo={(args) => {
                if(parseInt(args.data.od) < 2) {
                    args.cell.style.color = 'green';
                } else if (parseInt(args.data.od) >= 2 && parseInt(args.data.od) <= 7) {
                    args.cell.style.color = 'red';
                } else {
                    args.cell.style.color = 'maroon';
                }
                if(parseInt(args.data.tempo) == 0) {
                    args.cell.style.backgroundColor = 'red'; //merah
                    args.cell.style.color = 'yellow';
                }
            }}
            // created={created}
        >
            <ColumnsDirective>
                <ColumnDirective allowEditing={false} field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    isPrimaryKey={true}
                    field="no_dokumen"
                    headerText="No Dokumen"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="115"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_dokumen"
                    type="date"
                    format={formatDateYM}
                    headerText="Tanggal"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_valuta"
                    type="date"
                    format={formatDateYM}
                    headerText="Tgl. Valuta"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="od"
                    headerText="Overdue (Hari)"
                    headerTemplate={() => headerNewLine('Overdue', '(Hari)')}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective allowEditing={false} field="no_warkat" headerText="No. Warkat" headerTextAlign="Center" textAlign="Left" width="180" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="sisa" format={'N2'} headerText="Status" headerTextAlign="Center" textAlign="Right" width="110" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="jns" headerText="Dokumen" headerTextAlign="Center" textAlign="Center" width="65" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    field="tgl_setorgiro"
                    headerText="Tanggal Setor Warkat"
                    headerTemplate={() => headerNewLine('Tanggal', 'Setor Warkat')}
                    editType="datepickeredit"
                    type="date"
                    format={formatDateYM}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="160"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="nama_akun"
                    headerText="Disetor ke Kas/Bank"
                    headerTemplate={() => headerNewLine('Disetor ke', 'Kas/Bank')}
                    headerTextAlign="Center"
                    textAlign="Left"
                    width="140"
                    clipMode="EllipsisWithTooltip"
                    template={templateTombolTTD}
                />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Resize]} />
        </GridComponent>
    );
};

export default GridWarkat;

// <ColumnsDirective>
//                 <ColumnDirective allowEditing={false} field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
//                 <ColumnDirective allowEditing={false} field="no_dokumen" headerText="No Dokumen" headerTextAlign="Center" textAlign="Center" width="115" clipMode="EllipsisWithTooltip" />
//                 <ColumnDirective
//                     allowEditing={false}
//                     field="tgl_dokumen"
//                     type="date"
//                     format={formatDateYM}
//                     headerText="Tanggal"
//                     headerTextAlign="Center"
//                     textAlign="Center"
//                     width="80"
//                     clipMode="EllipsisWithTooltip"
//                 />
//                 <ColumnDirective
//                     allowEditing={false}
//                     field="tgl_valuta"
//                     type="date"
//                     format={formatDateYM}
//                     headerText="Tgl. Valuta"
//                     headerTextAlign="Center"
//                     textAlign="Center"
//                     width="80"
//                     clipMode="EllipsisWithTooltip"
//                 />
//                 <ColumnDirective
//                     allowEditing={false}
//                     field="od"
//                     headerText="Overdue (Hari)"
//                     headerTemplate={() => headerNewLine('Overdue', '(Hari)')}
//                     headerTextAlign="Center"
//                     textAlign="Center"
//                     width="80"
//                     clipMode="EllipsisWithTooltip"
//                 />
//                 <ColumnDirective allowEditing={false} field="no_warkat" headerText="No. Warkat" headerTextAlign="Center" textAlign="Left" width="180" clipMode="EllipsisWithTooltip" />
//                 <ColumnDirective allowEditing={false} field="sisa" format={'N2'} headerText="Status" headerTextAlign="Center" textAlign="Right" width="110" clipMode="EllipsisWithTooltip" />
//                 <ColumnDirective allowEditing={false} field="jns" headerText="Dokumen" headerTextAlign="Center" textAlign="Center" width="65" clipMode="EllipsisWithTooltip" />
//                 <ColumnDirective
//                     field="tgl_setorgiro"
//                     headerText="Tanggal Setor Warkat"
//                     headerTemplate={() => headerNewLine('Tanggal', 'Setor Warkat')}
//                     editType="datepickeredit"
//                     type="date"
//                     format={formatDateYM}
//                     headerTextAlign="Center"
//                     textAlign="Center"
//                     width="160"
//                     clipMode="EllipsisWithTooltip"
//                 />
//                 <ColumnDirective
//                     allowEditing={false}
//                     field="nama_akun"
//                     headerText="Disetor ke Kas/Bank"
//                     headerTemplate={() => headerNewLine('Disetor ke', 'Kas/Bank')}
//                     headerTextAlign="Center"
//                     textAlign="Left"
//                     width="140"
//                     clipMode="EllipsisWithTooltip"
//                     template={templateTombolTTD}
//                 />
//             </ColumnsDirective>

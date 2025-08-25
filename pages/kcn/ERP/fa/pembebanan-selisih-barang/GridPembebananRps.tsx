import React from 'react';
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
    rowSelected,
} from '@syncfusion/ej2-react-grids';

const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const appTemplate = (args: any) => {
    return <div className="text-center">{args.app === 'Y' ? '✔️' : ''}</div>;
};
const postingTemplate = (args: any) => {
    return <div className="text-center">{args.posting === 'Y' ? '✔️' : ''}</div>;
};
const GridPembebananRps = ({
    GridPembebananRpsReff,
    dsTab1,
    setSelectedRowBeban,
    recordDoubleClick,
}: {
    GridPembebananRpsReff: any;
    dsTab1: any;
    setSelectedRowBeban: any;
    recordDoubleClick: any;
}) => {
    const selectedRowHandle = (args: any) => {
        setSelectedRowBeban(args.data);
    };

    const handleRowDataBound = (args: any) => {
        const rowData = args.data as any; // Cast data sebagai any atau tipe yang tepat

        // Contoh kondisi: jika nilai kolom "status" adalah "Pending"
        if (rowData.app === null) {
            args.row.style.backgroundColor = '#FFE2E2'; // Warna merah muda
        }
    };

    return (
        <GridComponent
            id="GridPembebananRps"
            locale="id"
            // dataSource={dsTab1}
            height={'100%'}
            pageSettings={{
                pageSize: 25,
                pageCount: 5,
                pageSizes: ['25', '50', '100', 'All'],
            }}
            ref={GridPembebananRpsReff}
            rowSelected={selectedRowHandle}
            recordDoubleClick={recordDoubleClick}
            allowPaging={true}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowReordering={true}
            allowSorting={true}
            rowHeight={23}
            rowDataBound={handleRowDataBound}
            // ref={gridCashCount}
        >
            <ColumnsDirective>
                <ColumnDirective field="no_rps" width="115" headerText="No.Dokumen" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="tgl_rps" type="date" format={formatDateYM} headerText="Tanggal" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="jml_beban" width="130" format={'N2'} headerText="Jumlah Beban" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    columns={[
                        {
                            field: 'user_pic',
                            headerText: 'PIC',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            width: 110,
                            clipMode: 'EllipsisWithTooltip', // Terapkan template di sini,
                            // headerTemplate: () => headerColor('Harga Exp', 'Navy'),
                        },
                        {
                            field: 'tgl_rps',
                            headerText: 'Tanggal',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            type: 'date',
                            format: formatDateYM,
                            width: 100,
                            clipMode: 'EllipsisWithTooltip',

                            // headerTemplate: () => headerColor('Harga Non Kontrak', 'Navy'),
                        },
                    ]}
                    headerText="Pengajuan"
                    textAlign="Center"
                    // headerTemplate={() => headerColor('Harga', 'Navy')}
                />
                <ColumnDirective
                    columns={[
                        {
                            field: 'app',
                            headerText: 'Full',
                            format: 'N2',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            width: 40,
                            template: appTemplate,
                            clipMode: 'EllipsisWithTooltip', // Terapkan template di sini,
                            // headerTemplate: () => headerColor('Harga Exp', 'Navy'),
                        },
                        {
                            field: 'status_app',
                            headerText: 'Level',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            format: 'N2',
                            width: 50,
                            clipMode: 'EllipsisWithTooltip',

                            // headerTemplate: () => headerColor('Harga Non Kontrak', 'Navy'),
                        },
                    ]}
                    headerText="Approval"
                    textAlign="Center"
                    // headerTemplate={() => headerColor('Harga', 'Navy')}
                />
                <ColumnDirective
                    columns={[
                        {
                            field: 'posting',
                            headerText: 'Posted',
                            format: 'N2',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            template: postingTemplate,
                            width: 40,
                            clipMode: 'EllipsisWithTooltip', // Terapkan template di sini,
                            // headerTemplate: () => headerColor('Harga Exp', 'Navy'),
                        },
                        {
                            field: 'user_posting',
                            headerText: 'PIC',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            format: 'N2',
                            width: 100,
                            clipMode: 'EllipsisWithTooltip',

                            // headerTemplate: () => headerColor('Harga Non Kontrak', 'Navy'),
                        },
                        {
                            field: 'tgl_posting',
                            headerText: 'Tanggal',
                            headerTextAlign: 'Center',
                            type: 'date',
                            format: formatDateYM,
                            width: 100,
                            clipMode: 'EllipsisWithTooltip',

                            // headerTemplate: () => headerColor('Harga Non Kontrak', 'Navy'),
                        },
                        {
                            field: 'no_dokumen',
                            headerText: 'No. jurnal',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            format: 'N2',
                            width: 120,
                            clipMode: 'EllipsisWithTooltip',

                            // headerTemplate: () => headerColor('Harga Non Kontrak', 'Navy'),
                        },
                    ]}
                    headerText="Penjurnalan"
                    textAlign="Center"
                    // headerTemplate={() => headerColor('Harga', 'Navy')}
                />
                <ColumnDirective
                    columns={[
                        {
                            field: 'userid',
                            headerText: 'PIC',
                            format: 'N2',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            width: 100,
                            clipMode: 'EllipsisWithTooltip',
                        },
                        {
                            field: 'tgl_update',
                            headerText: 'Tanggal',
                            headerTextAlign: 'Center',
                            textAlign: 'Left',
                            type: 'date',
                            format: formatDate,
                            width: 120,
                            clipMode: 'EllipsisWithTooltip',
                        },
                    ]}
                    headerText="Update Dokumen Terakhir"
                    textAlign="Center"
                    // headerTemplate={() => headerColor('Harga', 'Navy')}
                />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
        </GridComponent>
    );
};

export default GridPembebananRps;

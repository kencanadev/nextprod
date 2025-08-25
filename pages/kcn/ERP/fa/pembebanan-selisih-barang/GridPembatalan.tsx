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

const GridPembatalan = ({ gridPembatalanReff }: { gridPembatalanReff: any }) => {
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
    const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };

    const formatNumber = (num: string) => {
        if (!num) return ''; // Jika kosong, kembalikan string kosong
        const parsedNumber = parseFloat(num.replace(/,/g, ''));
        if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
        return parsedNumber.toLocaleString('en-US');
    };
    const minusValueAccessor = (field: string, data: any, column: any) => {
        return data[field] < 0 ? `(${formatNumber(String(data[field] * -1))})` : formatNumber(String(data[field])); // If the value is 0, return empty string
    };

    const customizeCell = (args: any) => {
        if (args.column.field === 'qty_std') {
            if (args.data.qty_std < 0) {
                args.cell.classList.add('bg-red-400');
            }
        } else if (args!.column.field === 'nominal') {
            if (args.data.nominal < 0) {
                args.cell.classList.add('bg-red-400');
            }
        }
    };
    return (
        <GridComponent
            id="gridListCashCount"
            locale="id"
            // dataSource={list_kas_opname}
            height={'100%'}
            pageSettings={{
                pageSize: 25,
                pageCount: 5,
                pageSizes: ['25', '50', '100', 'All'],
            }}
            ref={gridPembatalanReff}
            // rowSelected={selectedRowHandle}
            // recordDoubleClick={recordDoubleClick}
            allowPaging={true}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowReordering={true}
            allowSorting={true}
            rowHeight={23}
            // rowDataBound={rowDataBound}
            queryCellInfo={customizeCell}
            // ref={gridCashCount}
        >
            <ColumnsDirective>
                <ColumnDirective field="dok" width="80" headerText="Dok. Sumber" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="no_ps" width="100" headerText="No. PS" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="tgl_ps" width="80" type="date" format={formatDateYM} headerText="Tanggal" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_gudang" width="80" headerText="Gudang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_item" width="130" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="qty_std" valueAccessor={minusValueAccessor} width="50" headerText="Qty" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nominal" valueAccessor={minusValueAccessor} width="100" headerText="Nilai (Rp)" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="alasan" width="130" headerText="Alasan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="batal_alasan" width="130" headerText="Alasan Batal" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="batal_userid" width="80" headerText="User Batal" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    field="batal_tanggal"
                    type="date"
                    format={formatDate}
                    width="120"
                    headerText="Tanggal Batal"
                    headerTextAlign="Center"
                    textAlign="Left"
                    clipMode="EllipsisWithTooltip"
                />
            </ColumnsDirective>
        </GridComponent>
    );
};

export default GridPembatalan;

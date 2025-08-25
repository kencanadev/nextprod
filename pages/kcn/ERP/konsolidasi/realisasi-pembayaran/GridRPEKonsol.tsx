import React from 'react';
import {
    Grid,
    AggregatesDirective,
    AggregateDirective,
    AggregateColumnsDirective,
    AggregateColumnDirective,
    Aggregate,
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
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';

const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

const GridRPEKonsol = ({ gridListDataRef, selectedRowHanlde }: { gridListDataRef: any; selectedRowHanlde: any }) => {
    return (
        <GridComponent
            id="gridListData"
            locale="id"
            // ref={(g) => (gridListData = g)}
            ref={gridListDataRef}
            allowExcelExport={true}
            allowPdfExport={true}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            allowPaging={true}
            allowSorting={true}
            allowFiltering={false}
            allowResizing={true}
            autoFit={true}
            allowReordering={true}
            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
            rowHeight={22}
            width={'100%'}
            height={'100%'}
            gridLines={'Both'}
            rowSelected={selectedRowHanlde}
            // loadingIndicator={{ indicatorType: 'Shimmer' }}
            // queryCellInfo={QueryCellInfoListData}
            // rowDataBound={RowDataBoundListData}
            // rowSelected={handleRowSelected}
            // recordDoubleClick={handleRowDoubleClicked}
            // rowSelecting={(args) => {
            //     if (args.data !== undefined) {
            //         setDataDetailDokTtb((prevState: any) => ({
            //             ...prevState,
            //             no_ttb: args.data.no_ttb,
            //             tgl_ttb: args.data.tgl_ttb,
            //         }));
            //     }
            // }}
            // dataBound={() => {
            //     if (gridListDataRef.current) {
            //         gridListDataRef.current?.selectRow(rowIdxListData.current);
            //     }
            // }}
        >
            <ColumnsDirective>
                <ColumnDirective
                    field="entitas"
                    headerText="Entitas"
                    headerTextAlign="Center"
                    textAlign="Center"
                    //autoFit
                    freeze="Left"
                    width="80"
                    clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                />
                <ColumnDirective
                    field="no_rpe"
                    headerText="No. RPE"
                    headerTextAlign="Center"
                    textAlign="Center"
                    //autoFit
                    width="110"
                    clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                />
                <ColumnDirective
                    field="tgl_rpe"
                    headerText="Tgl. Rpe"
                    headerTextAlign="Center"
                    textAlign="Center"
                    //autoFit
                    width="100"
                    clipMode="EllipsisWithTooltip"
                    type="date"
                    format={formatDate}
                />
                <ColumnDirective
                    field="via"
                    headerText="Ekspedisi"
                    headerTextAlign="Center"
                    textAlign="Left"
                    //autoFit
                    width="250"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="no_reff"
                    headerText="No. Faktur Eks"
                    headerTextAlign="Center"
                    textAlign="Left"
                    //autoFit
                    width="150"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="netto_mu"
                    headerText="Total Klaim"
                    headerTextAlign="Center"
                    textAlign="Right"
                    format={'N2'}
                    //autoFit
                    width="115"
                    clipMode="EllipsisWithTooltip"
                    // template={(args: any) => frmNumber(args.netto_mu)}
                />

                <ColumnDirective
                    field="total_berat"
                    headerText="Total Berat"
                    headerTextAlign="Center"
                    textAlign="Right"
                    format={'N2'}
                    //autoFit
                    width="115"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="total_klaim_ekspedisi"
                    headerText="Nilai Klaim"
                    headerTextAlign="Center"
                    textAlign="Right"
                    format={'N2'}
                    //autoFit
                    width="115"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="bayar_mu"
                    headerText="Total Bayar"
                    headerTextAlign="Center"
                    textAlign="Right"
                    format={'N2'}
                    //autoFit
                    width="115"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="status"
                    headerText="Status"
                    headerTextAlign="Center"
                    textAlign="Center"
                    //autoFit
                    width="100"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="status_app"
                    headerText="Approval"
                    headerTextAlign="Center"
                    textAlign="Center"
                    //autoFit
                    width="100"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="no_dokumen"
                    headerText="No. Jurnal"
                    headerTextAlign="Center"
                    textAlign="Left"
                    //autoFit
                    width="110"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="no_dokumen_rev"
                    headerText="No. Jurnal Rev"
                    headerTextAlign="Center"
                    textAlign="Left"
                    //autoFit
                    width="110"
                    clipMode="EllipsisWithTooltip"
                />
            </ColumnsDirective>
            <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
        </GridComponent>
    );
};

export default GridRPEKonsol;

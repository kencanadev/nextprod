import React from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';

const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em', padding: 5 }}>
        {value1}
        <div>{value2}</div>
    </div>
);

const pageSet: any = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
};
const GridPiutang = ({ gridPiutang, token }: { gridPiutang: any; token: any }) => {
    return (
        <GridComponent
            id="gridPiutang"
            locale="id"
            // dataSource={listHistory}
            height={400}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowSorting={true}
            enableAdaptiveUI={true}
            ref={gridPiutang}
            rowHeight={23}
            autoFit={true}
            enableHover={false}
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
            allowPaging={true}
            pageSettings={pageSet}

        >
            <ColumnsDirective>
                <ColumnDirective allowEditing={false} field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="no_fj" headerText="No, Faktur" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_fj"
                    type="date"
                    format={formatDateYM}
                    headerText="Tgl. Kirim"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_trxfj"
                    type="date"
                    format={formatDateYM}
                    headerText="Tgl. Kirim"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_trxfj"
                    type="date"
                    format={formatDateYM}
                    headerText="Tgl. Kirim"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="umur"
                    headerText="Umur (Hari)"
                    headerTemplate={() => headerNewLine('Umur', '(Hari)')}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="65"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="od"
                    headerTemplate={() => headerNewLine('Overdue', '(Hari)')}
                    headerText="Overdue (Hari)"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="65"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective allowEditing={false} field="nama_termin" headerText="Termin" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="sisa" headerText="Jumlah (MU)" format={'N2'} headerTextAlign="Center" textAlign="Right" width="120" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="nama_sales" headerText="Salesman" headerTextAlign="Center" textAlign="Center" width="150" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Resize]} />
        </GridComponent>
    );
};

export default GridPiutang;

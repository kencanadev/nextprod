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

const zeroValueAccessor = (field: string, data: any, column: any) => {
  return data[field] === 0 ? '' : data[field]; // If the value is 0, return empty string
};

const settingGrid = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
};

const GridListSaldo = ({gridSaldo}: {gridSaldo: any}) => {
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const customizeCell = (args: any) => {
        if (args.column.field === "balance") {
            
          if (args.data.balance >= 0) {
            args.cell.classList.add('bg-yellow-200');
          } 
        } else if (args!.column.field === "saldo_akhir") {
            
            if (args.data.saldo_akhir) {
              args.cell.classList.add('bg-yellow-200');
            } 
          } else if (args!.column.field === "selisih") {
            if (args.data.selisih) {
                args.cell.classList.add('bg-yellow-400');
              } 
          }
      }

      const handleRowDataBound = (args: any) => {
        const rowData = args.data as any; // Cast data sebagai any atau tipe yang tepat

        // Contoh kondisi: jika nilai kolom "status" adalah "Pending"
        if (rowData.selisih === null) {
            args.row.style.backgroundColor = '#FFE2E2'; // Warna merah muda
        } 
    };

    const formatNumber = (num: string) => {
      if(num == '0') return '';
        if (!num) return ''; // Jika kosong, kembalikan string kosong
        const parsedNumber = parseFloat(num.replace(/,/g, ''));
        if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
        return parsedNumber.toLocaleString('en-US');
    };

    const minusValueAccessor = (field: string, data: any, column: any) => {
        return data[field] < 0 ? `(${formatNumber(String(data[field] * -1))})` :  data[field] == 0 ? '' : formatNumber(String(data[field])); // If the value is 0, return empty string
    };
    const handleZeroValue = (field: string, data: any) => {
        return data[field] === 0 ? '' : formatNumber(String(data[field]));
    };
  return (
    <GridComponent
        id="gridListData"
        locale="id"
        // dataSource={bokList}
        height={'60vh'}
        queryCellInfo={customizeCell}
        // rowSelected={handleSelect}
        rowDataBound={handleRowDataBound}
        // recordDoubleClick={handleRecordDoubleClick}
        allowPaging={true}
        gridLines="Both"
        allowResizing={true}
        allowSorting={true}
        ref={gridSaldo}
        pageSettings={settingGrid}
rowHeight={23}
    >
        <ColumnsDirective>
            <ColumnDirective field="valuta" format={formatDate} type={'date'} headerText="Tgl. Transaksi" headerTextAlign="Center" textAlign="Center" width="80" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="bank_name" width="110" headerText="Bank" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="kode_akun" headerText="No. Rekening" headerTextAlign="Center" textAlign="Left" width="110" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="account_name" headerText="Nama Pemilik" headerTextAlign="Center" textAlign="Left" width="110" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="balance"  valueAccessor={handleZeroValue}  headerText="Saldo Akhir API" headerTextAlign="Center" textAlign="Right" width="110" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="no_akun" headerText="No. Akun" headerTextAlign="Center" textAlign="Left" format="N2" width="80" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="nama_akun" headerText="Nama Akun" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="saldo_akhir"  valueAccessor={handleZeroValue}  headerText="Saldo Akhir Sistem" headerTextAlign="Center" textAlign="Right" width="100" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="selisih" valueAccessor={minusValueAccessor} headerText="Selisih" headerTextAlign="Center" textAlign="Right" width="100" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="aktif" headerText="Aktif" headerTextAlign="Center" textAlign="Center" width="40" clipMode="EllipsisWithTooltip" />
           
        </ColumnsDirective>
        <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
    </GridComponent>
  )
}

export default GridListSaldo
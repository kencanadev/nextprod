import React from 'react';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';

type PersediaanTableProps = {
  data: any;
  gridListData?: any;
  rowSelectingListData?: (args: any) => void;
  queryCellInfoListData?: (args: any) => void;
  rowIdxListData?: any;
  showEditRecord?: any;
  children: React.ReactNode;
};

const PersediaanTable = ({ data, gridListData, rowSelectingListData, queryCellInfoListData, rowIdxListData, showEditRecord, children }: PersediaanTableProps) => {
  let menuHeaderItems: MenuItemModel[] = [
    {
      iconCss: 'e-icons e-print',
      text: 'Cetak ke printer',
    },
    {
      iconCss: 'e-icons',
      text: 'Export ke file',
      items: [
        { iconCss: 'e-icons e-export-pdf', text: 'PDF' },
        { iconCss: 'e-icons e-export-excel', text: 'XLSX' },
        { iconCss: 'e-icons e-export-csv', text: 'CSV' },
      ],
    },
  ];

  function menuHeaderSelect(args: MenuEventArgs) {
    if (args.item.text === 'Cetak ke printer') {
      gridListData.print();
    } else if (args.item.text === 'PDF') {
      gridListData.showSpinner();
      gridListData.pdfExport();
    } else if (args.item.text === 'XLSX') {
      gridListData.showSpinner();
      gridListData.excelExport();
    } else if (args.item.text === 'CSV') {
      gridListData.showSpinner();
      gridListData.csvExport();
    }
  }

  //======== Tooltip Header Table ========
  let tooltipListData: Tooltip | any;
  const columnListData: Object = {
    'No. Barang': 'Nomor Barang',
    'Nama Barang': 'Nama Barang',
    'Grup Barang': 'Grup Barang',
    Tipe: 'Tipe Barang',
    Kategori: 'Kategori Barang',
    'Kelompok Produk': 'Kelompok Produk',
    'Merek Produk': 'Merek Produk',
    Satuan: 'Satuan',
    Berat: 'Berat',
    Diameter: 'Diameter',
    Aktivasi: 'Aktivasi',
    Status: 'Status',
    UID: 'UID',
  };
  const beforeRenderListData = (args: TooltipEventArgs) => {
    const description = (columnListData as any)[(args as any).target.innerText];
    if (description) {
      tooltipListData.content = description;
    }
  };

  return (
    <div className="panel-data overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
      <TooltipComponent opensOn="Hover" openDelay={1000} beforeRender={beforeRenderListData} target=".e-headertext" ref={(t) => (tooltipListData = t)}>
        {children}
      </TooltipComponent>
      {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
      <ContextMenuComponent
        id="contextmenu"
        target=".e-gridheader"
        items={menuHeaderItems}
        select={menuHeaderSelect}
        animationSettings={{
          duration: 800,
          effect: 'FadeIn',
        }}
      />
    </div>
  );
};

export default PersediaanTable;

import React, { useEffect, useState } from 'react';

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
} from '@syncfusion/ej2-react-grids';
import { mockData } from '../../../../constants';
import { useSession } from '@/pages/api/sessionContext';
import { getPpHeader } from '../../../../api';
import { useRouter } from 'next/router';

const PermintaanPembelian = ({ data, handleRowSelected, refreshData, refGrid }: { data: any; handleRowSelected: any; refreshData: any; refGrid: any }) => {
  const { sessionData, isLoading } = useSession();

  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';

  const router = useRouter();

  const handleRecordDoubleClick = async (args: any) => {
    // console.log(args);
    const { status, kode_dokumen } = args.rowData;
    const header = await getPpHeader({ token, kode_dokumen, entitas: kode_entitas });
    const produksi = header[0].produksi;
    if (header) {
      if (status === 'Proses' || status === 'Tertutup') {
        if (produksi === 'Y') {
          router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { name: 'produksi', kode_pp: kode_dokumen, form_app: 'ViewOnly', tipe: 'dashboard' } });
        } else {
          router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { name: 'barangjadi', kode_pp: kode_dokumen, form_app: 'ViewOnly', tipe: 'dashboard' } });
        }
      } else {
        if (produksi === 'Y') {
          router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { name: 'produksi', kode_pp: kode_dokumen, form_app: 'N', tipe: 'dashboard' } });
        } else {
          router.push({ pathname: '/kcn/ERP/purchase/pp/spp', query: { name: 'barangjadi', kode_pp: kode_dokumen, form_app: 'N', tipe: 'dashboard' } });
        }
      }
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
    height: '50vh',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };
  return (
    <div className="h-full">
      <GridComponent {...gridOptions} queryCellInfo={queryCellInfo} ref={refGrid} enableAdaptiveUI rowSelected={handleRowSelected} recordDoubleClick={handleRecordDoubleClick} dataSource={data}>
        <ColumnsDirective>
          <ColumnDirective field="no_dok" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="tgl" format={'dd-MM-yyyy'} type="date" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="nama_supp" headerText="Departemen" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            columns={[
              {
                field: 'status',
                headerText: 'Dokumen',
                headerTextAlign: 'Center',
                textAlign: 'Center',
                width: '60',
              },
              {
                field: 'status_app',
                headerText: 'Approval',
                headerTextAlign: 'Center',
                textAlign: 'Center',
                width: '60',
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
              return <span>{props.od < 0 ? `(${Math.abs(props.od)})` : props.od}</span>;
            }}
          />
        </ColumnsDirective>
        <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn]} />
      </GridComponent>
    </div>
  );
};

export default PermintaanPembelian;

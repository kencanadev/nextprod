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
  CellEditArgs,
} from '@syncfusion/ej2-react-grids';
import swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { getPoHeader, postDateOT } from '../../../../api';
import { useSession } from '@/pages/api/sessionContext';
import { buttonUbah } from '@/pages/kcn/ERP/purchase/po/component/fungsi';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';

const StatusCheckbox = (args: any, token: string, kode_entitas: string, refreshData: Function) => {
  return (
    <div className="!flex !justify-center">
      <input
        type="checkbox"
        checked={args.status_kirim === 'Y' ? true : false}
        onChange={async (e) => {
          const body = {
            entitas: kode_entitas,
            kode_dokumen: args.kode_dokumen,
            tgl_kirim: moment(args.tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
            status_kirim: args.status_kirim === 'Y' ? 'N' : 'Y',
            no_sjpabrik: args.no_sjpabrik,
            tgl_sjpabrik: args.tgl_sjpabrik === null ? null : moment(args.tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
            tgl_sjfax: args.tgl_sjfax === null ? null : moment(args.tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
            nota: args.nota,
          };
          try {
            const response = await postDateOT(body, token);
            if (response?.status === 200) {
              withReactContent(swalToast).fire({
                icon: 'success',
                title: 'Berhasil ubah data.',
                timer: 2000,
                showConfirmButton: false,
              });
              refreshData();
            }
          } catch (error) {
            withReactContent(swalToast).fire({
              icon: 'error',
              title: 'Gagal ubah data.',
              timer: 2000,
              showConfirmButton: false,
            });
          }

          // if (args.status_kirim === 'Y') {
          //   withReactContent(swalToast).fire({
          //     icon: 'info',
          //     title: 'Barang sudah dikirim.',
          //     timer: 2000,
          //     showConfirmButton: false,
          //   });
          //   return;
          // } else {
          //   const body = {
          //     entitas: kode_entitas,
          //     kode_dokumen: args.kode_dokumen,
          //     tgl_kirim: moment(args.tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
          //     status_kirim: args.status_kirim === 'Y' ? 'N' : 'Y',
          //     no_sjpabrik: args.no_sjpabrik,
          //     tgl_sjpabrik: args.tgl_sjpabrik === null ? null : moment(args.tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
          //     tgl_sjfax: args.tgl_sjfax === null ? null : moment(args.tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
          //     nota: args.nota,
          //   };
          //   const response = await postDateOT(body, token);
          //   if (response?.status === 200) {
          //     withReactContent(swalToast).fire({
          //       icon: 'success',
          //       title: 'Berhasil ubah data.',
          //       timer: 2000,
          //       showConfirmButton: false,
          //     });
          //     refreshData();
          //   }
          // }
        }}
      />
    </div>
  );
};

const KirimCustomer = ({ data, handleRowSelected, refreshData, refGrid, selectedItems }: { data: any; handleRowSelected: any; refreshData: Function; refGrid: any; selectedItems: any }) => {
  const { sessionData, isLoading } = useSession();

  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';

  const router = useRouter();

  const queryCellInfo = (args: any) => {
    if (args.data.status_app === 'Disetujui') {
      args.cell.style.color = 'green';
    } else if (args.data.status_app === 'Baru') {
      args.cell.style.color = 'blue';
    }
  };

  const cellEdit = (args: CellEditArgs) => {
    const { columnName: field } = args;
    if (field === 'no_sjpabrik' || field === 'tgl_sjfax' || field === 'tgl_sjpabrik' || field === 'nota') {
      args.cancel = false;
    } else {
      args.cancel = true;
    }
  };

  const cellSaved = async (args: any) => {
    const { kode_dokumen, tgl_kirim, status_kirim, no_sjpabrik, tgl_sjpabrik, tgl_sjfax, nota } = args.rowData;

    let tgl_sjpabrikValue;
    let tgl_sjfaxValue;
    let no_sjpabrikValue;

    if (args.columnName === 'no_sjpabrik') {
      no_sjpabrikValue = args.value;
    } else {
      if (no_sjpabrik === null) {
        no_sjpabrikValue = null;
      } else {
        no_sjpabrikValue = no_sjpabrik;
      }
    }

    if (args.columnName === 'tgl_sjpabrik') {
      tgl_sjpabrikValue = moment(args.value).format('YYYY-MM-DD HH:mm:ss');
    } else {
      if (tgl_sjpabrik === null) {
        tgl_sjpabrikValue = null;
      } else {
        tgl_sjpabrikValue = moment(tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss');
      }
    }

    if (args.columnName === 'tgl_sjfax') {
      tgl_sjfaxValue = moment(args.value).format('YYYY-MM-DD HH:mm:ss');
    } else {
      if (tgl_sjfax === null) {
        tgl_sjfaxValue = null;
      } else {
        tgl_sjfaxValue = moment(tgl_sjfax).format('YYYY-MM-DD HH:mm:ss');
      }
    }
    const body = {
      entitas: kode_entitas,
      kode_dokumen,
      tgl_kirim: moment(tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
      status_kirim: status_kirim,
      no_sjpabrik: no_sjpabrikValue,
      tgl_sjpabrik: tgl_sjpabrikValue,
      tgl_sjfax: tgl_sjfaxValue,
      nota: args.columnName === 'nota' ? args.value : nota,
    };

    try {
      const res = await postDateOT(body, token);

      if (res?.status === 200) {
        withReactContent(swalToast).fire({
          icon: 'success',
          title: 'Berhasil ubah data.',
          timer: 2000,
          showConfirmButton: false,
        });
        refreshData();
      }
    } catch (error) {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: 'Gagal ubah data.',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleRecordDoubleClick = async (args: any) => {
    const { field } = args.column;
    const header = await getPoHeader({ entitas: kode_entitas, kode_dokumen: selectedItems.kode_dokumen, token });

    if (field === 'no_sjpabrik' || field === 'tgl_sjfax' || field === 'tgl_sjpabrik' || field === 'nota') {
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
      <GridComponent
        {...gridOptions}
        editSettings={{ allowEditing: true, mode: 'Batch' }}
        queryCellInfo={queryCellInfo}
        recordDoubleClick={handleRecordDoubleClick}
        ref={refGrid}
        enableAdaptiveUI
        rowSelected={handleRowSelected}
        dataSource={data}
        cellEdit={cellEdit}
        cellSaved={cellSaved}
      >
        <ColumnsDirective>
          <ColumnDirective field="no_dok" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="tgl" format={'dd-MM-yyyy'} type="date" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            field="tgl_kirim"
            format={'dd-MM-yyyy'}
            type="date"
            headerText="Estimasi. Tgl Dikirim"
            headerTextAlign="Center"
            textAlign="Left"
            width="100"
            clipMode="EllipsisWithTooltip"
          />
          <ColumnDirective field="od" headerText="Overdue (Hari)" format="N" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            columns={[
              {
                field: 'status',
                headerText: 'Dokumen',
                headerTextAlign: 'Center',
                textAlign: 'Left',
                width: '60',
              },
              {
                field: 'status_app',
                headerText: 'Approval',
                headerTextAlign: 'Center',
                textAlign: 'Left',
                width: '60',
              },
            ]}
            headerText="Status"
            headerTextAlign="Center"
            textAlign="Center"
            width="100"
            clipMode="EllipsisWithTooltip"
          />
          <ColumnDirective field="customer" headerText="Nama Customer / No. Order Penjualan" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            field="status_kirim"
            headerText="Barang Sudah Dikirim"
            headerTextAlign="Center"
            textAlign="Center"
            width="100"
            clipMode="EllipsisWithTooltip"
            template={(args: any) => StatusCheckbox(args, token, kode_entitas, refreshData)}
          />
          <ColumnDirective field="no_sjpabrik" headerText="No. Surat Jalan Pabrik" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective
            columns={[
              {
                field: 'tgl_sjfax',
                headerText: 'Facimile',
                headerTextAlign: 'Center',
                textAlign: 'Left',
                width: '80',
                type: 'date',
                format: 'dd-MM-yyyy',
                editType: 'datetimepickeredit',
              },
              {
                field: 'tgl_sjpabrik',
                headerText: 'Diterima',
                headerTextAlign: 'Center',
                textAlign: 'Left',
                width: '80',
                type: 'date',
                format: 'dd-MM-yyyy',
                editType: 'datetimepickeredit',
              },
            ]}
            headerText="Tgl. Estimasi Surat Jalan Pabrik"
            headerTextAlign="Center"
            textAlign="Center"
            width="100"
            clipMode="EllipsisWithTooltip"
          />
          <ColumnDirective field="nota" headerText="Catatan" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="test4" headerText="File Pendukung" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="no_fpb" headerText="No. FPB Referensi" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
          <ColumnDirective field="kode_entitas" headerText="Entitas" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
        </ColumnsDirective>
        <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn]} />
      </GridComponent>
    </div>
  );
};

export default KirimCustomer;

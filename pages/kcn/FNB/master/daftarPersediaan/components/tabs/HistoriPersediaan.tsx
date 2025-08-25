import React, { useEffect, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { fetchHistoryPersediaan } from '../../api/api';
import { parsePrice } from '../../utils/formatCurrency';

const HistoriPersediaan = ({ entitas, formState, token }: any) => {
  const [tabs, setTabs] = useState('Pembelian');
  const [historyData, setHistoryData] = useState([]);

  const fetchData = async () => {
    // entitas, tipe, kode_item, token
    const data = await fetchHistoryPersediaan(entitas, tabs, formState.kode_item, token);
    setHistoryData(data);
  };

  const modifiedData = historyData.map((item: any) => {
    return {
      ...item,
      jumlah_mu: parsePrice(item.jumlah_mu),
      harga_mu: parsePrice(item.harga_mu),
    };
  });

  useEffect(() => {
    fetchData();
  }, [tabs]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1">
        <button onClick={() => setTabs('Pembelian')} className={`${tabs !== 'Pembelian' ? 'bg-slate-950' : 'bg-slate-500'} rounded bg-black px-2 py-1 text-xs text-white`}>
          Pembelian
        </button>
        <button onClick={() => setTabs('Penjualan')} className={`${tabs !== 'Penjualan' ? 'bg-slate-950' : 'bg-slate-500'} rounded bg-black px-2 py-1 text-xs text-white`}>
          Penjualan
        </button>
      </div>
      {tabs === 'Pembelian' && (
        <GridComponent
          id="gridListData"
          locale="id"
          dataSource={modifiedData}
          selectionSettings={{
            mode: 'Row',
            type: 'Single',
          }}
          allowSorting={true}
          autoFit={true}
          width={'100%'}
          allowReordering={true}
          rowHeight={22}
          //   height={370}
          gridLines={'Both'}
          loadingIndicator={{ indicatorType: 'Shimmer' }}
          allowPaging={true}
          pageSettings={{
            pageSize: 15,
            pageCount: 5,
            pageSizes: ['15', '25', '50', '100', 'All'],
          }}
        >
          <ColumnsDirective>
            <ColumnDirective type="date" format={'dd-MM-yyyy'} field="tgl_kontrak" headerText="Tanggal" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="no_reff" headerText="No. PB" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective type="date" format={'dd-MM-yyyy'} field="tgl_reff" headerText="Tgl. Reff" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="no_kontrak" headerText="No. Reff" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="nama_relasi" headerText="Nama Relasi" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="sat_std" headerText="Satuan Std" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="qty_std" headerText="Kuantitas" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="harga" headerText="Harga (KG)" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="harga_mu" headerText="Harga (MU)" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="diskon" headerText="Diskon (%)" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="diskon_mu" headerText="Diskon" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="potongan_mu" headerText="Potongan" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="jumlah_mu" headerText="Jumlah" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="pokok" headerText="Harga Perolehan" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
          </ColumnsDirective>
        </GridComponent>
      )}
      {tabs === 'Penjualan' && (
        <GridComponent
          id="gridListData"
          locale="id"
          dataSource={modifiedData}
          selectionSettings={{
            mode: 'Row',
            type: 'Single',
          }}
          allowSorting={true}
          autoFit={true}
          width={'100%'}
          allowReordering={true}
          rowHeight={22}
          //   height={370}
          gridLines={'Both'}
          loadingIndicator={{ indicatorType: 'Shimmer' }}
          allowPaging={true}
          pageSettings={{
            pageSize: 15,
            pageCount: 5,
            pageSizes: ['15', '25', '50', '100', 'All'],
          }}
        >
          <ColumnsDirective>
            <ColumnDirective type="date" format={'dd-MM-yyyy'} field="tgl_reff" headerText="Tanggal" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="no_reff" headerText="No. Faktur" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="nama_relasi" headerText="Nama Relasi" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="sat_std" headerText="Satuan Std" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="qty_std" headerText="Kuantitas" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="harga_mu" headerText="Harga (MU)" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="diskon" headerText="Diskon (%)" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="diskon_mu" headerText="Diskon" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="potongan_mu" headerText="Potongan" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
            <ColumnDirective field="jumlah_mu" headerText="Jumlah" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
          </ColumnsDirective>
        </GridComponent>
      )}
    </div>
  );
};

export default HistoriPersediaan;

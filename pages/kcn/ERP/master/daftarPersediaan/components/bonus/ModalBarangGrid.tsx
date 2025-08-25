import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import {
  Grid,
  GridComponent,
  ColumnDirective,
  ColumnsDirective,
  CommandColumn,
  Inject,
  Page,
  Edit,
  Filter,
  Toolbar,
  Resize,
  Selection,
  PageSettingsModel,
  FilterSettingsModel,
} from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';
import moment from 'moment';
import { SpreadNumber } from '@/pages/kcn/ERP/fa/fpp/utils';
import { HandleSearchNamaItem, HandleSearchNoItem } from '../../function/function';
// import { HandleSearchNamarayon, HandleSearchNorayon } from '../function/function';

export default function ModalBarangGrid({
  visible,
  onClose,
  gridDetailBarang,
  itemList,
  filterState,
  selectedRowIndexRekeningbarang,
  marginList,
//   setRecalIndikasi,
  setFilterState,
}: {
  visible: boolean;
  onClose: Function;
  gridDetailBarang: any;
  itemList: any;
  filterState: any;
  selectedRowIndexRekeningbarang: any;
  marginList: any;
//   setRecalIndikasi: any;
  setFilterState: any;
}) {
  const { sessionData, isLoading } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const userid = sessionData?.userid ?? '';
  const kode_user = sessionData?.kode_user ?? '';
  const token = sessionData?.token ?? '';
  const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
  const header = 'List Modal Barang';
  const pageSettings: PageSettingsModel = { pageSize: 9 };
  const filterSettings: FilterSettingsModel = { type: 'FilterBar', mode: 'Immediate' };
  const [originalDataSource, setOriginalDataSource] = useState(itemList);
  const gridddRayon = useRef<any>(null);
  const [dialogListddRayon, setDialogListrayon] = useState(itemList);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [searchNorayon, setSearchNorayon] = useState('');
  const [searchNamarayon, setSearchNamarayon] = useState('');

  function hitungPersentase(harga: any, persen: any) {
    return harga * (1 + persen / 100);
  }

  function formatString(input: string) {
    // Split berdasarkan underscore (_)
    const words = input.split('_');

    // Kapitalisasi huruf pertama setiap kata
    const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    // Gabungkan kembali dengan spasi
    return formattedWords.join(' ');
  }
  const handleSelect = (args: any) => {
    setSelectedRow(args.data);
  };
  // console.log('dialogListddRayon', dialogListddRayon);

  const hanldeRecordDoubleClick = async (args: any) => {
    const hargamin = selectedRow.harga5;
    console.log('marginList', marginList);

    gridDetailBarang.current.dataSource[selectedRowIndexRekeningbarang] = {
      ...gridDetailBarang.current.dataSource[selectedRowIndexRekeningbarang],
      no_item: selectedRow.no_item,
      nama_item: selectedRow.nama_item,
    };
      gridDetailBarang.current.refresh();

    onClose();
  };

  useEffect(() => {
    HandleSearchNamaItem('', setSearchNamarayon, gridddRayon, itemList, token, kode_entitas, filterState);
  }, []);

  return (
    <DialogComponent
      id="dialogSimulasiBarang"
      isModal={true}
      width="80%"
      height={550}
      visible={visible}
      close={() => onClose()}
      header={header}
      showCloseIcon={true}
      target="#main-target"
      closeOnEscape={false}
      allowDragging={true}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
      style={{ position: 'fixed' }}
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex h-[10%] gap-2">
          <div className="mb-1 flex w-[110px] flex-col items-start">
            <input
              type="text"
              id="no_barang"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={formatString('no_barang')}
              name="no_barang"
              value={searchNorayon}
              onChange={async (e) => await HandleSearchNoItem(e.target.value, setSearchNorayon, gridddRayon, itemList, token, kode_entitas, filterState)}
              // style={{ height: '4vh' }}
              autoComplete="off"
            />
          </div>
          <div className="mb-1 flex w-full flex-col items-start">
            <input
              type="text"
              id="nama_barang"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={formatString('nama_barang')}
              name="nama_barang"
              value={searchNamarayon}
              onChange={async (e) => await HandleSearchNamaItem(e.target.value, setSearchNamarayon, gridddRayon, itemList, token, kode_entitas, filterState)}
              // style={{ height: '4vh' }}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="h-[80%] w-full">
          <GridComponent
            id="gridBarangSimulasi"
            name="gridBarangSimulasi"
            className="gridBarangSimulasi"
            locale="id"
            // dataSource={itemList}
            rowSelecting={handleSelect}
            recordDoubleClick={hanldeRecordDoubleClick}
            ref={gridddRayon}
            autoFit={true}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            gridLines={'Both'}
            height={'100%'} // Tinggi grid dalam piksel /
          >
            <ColumnsDirective>
              <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Center" width={190} />
              <ColumnDirective
                field="nama_item"
                headerText="Nama Barang"
                headerTextAlign="Center"
                textAlign="Left"
                clipMode="EllipsisWithTooltip"
                width={'auto'}
                // allowEditing={false}
                // editTemplate={editTemplateNorayon}
              />
              <ColumnDirective
                field="harga2"
                headerText="Harga Jual"
                headerTextAlign="Center"
                textAlign="Right"
                format={'N2'}
                clipMode="EllipsisWithTooltip"
                width={125}

                // allowEditing={false}
                // editTemplate={editTemplateNorayon}
              />
              <ColumnDirective
                field="penj_terakhir"
                headerText="harga penjualan akhir"
                headerTextAlign="Center"
                textAlign="Right"
                format={'N2'}
                clipMode="EllipsisWithTooltip"
                width={125}

                // allowEditing={false}
                // editTemplate={editTemplateNorayon}
              />
            </ColumnsDirective>

            <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
          </GridComponent>
        </div>
        <div className="flex h-[10%] w-full justify-end gap-3 py-2">
          <div className="flex h-full gap-2">
            <button
              onClick={hanldeRecordDoubleClick}
              className={` flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                            p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
            >
              OK
            </button>

            <button
              onClick={() => onClose()}
              className={`flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                            p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </DialogComponent>
  );
}

import React, { useState } from 'react';

import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import CustomInput from '../Input';

interface dialogAkunProps {
  isOpen?: boolean;
  onClose?: any;
}

const DialogAturanPersediaan = ({ isOpen, onClose }: dialogAkunProps) => {
  const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);

  const handleTogglePanel = () => {
    setPanelVisible(!panelVisible);
  };

  let buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Simpan',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: () => {},
      // click: masterState === 'BARU' ? saveDialogSupplier : handleUpdateData,
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent
      id="dialogAturanPersediaan"
      name="dialogAturanPersediaan"
      target={'#main-target'}
      header={() => 'Kartu Persediaan'}
      visible={isOpen}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      width="90%"
      height="100%"
      position={{ X: 'center', Y: 14 }}
      style={{ position: 'fixed' }}
      buttons={buttonsInputData}
      allowDragging
      closeOnEscape
      open={(args: any) => {
        args.preventFocus = true;
      }}
      isModal
    >
      <div className="p-2">
        {/* Search Bar */}
        <div className="flex w-full items-end gap-2">
          <div className="flex w-64 flex-col">
            <label htmlFor="">Nama Aturan</label>
            <input type="text" className="w-full rounded-md border border-gray-300 p-2" placeholder="Cari Nama Aturan..." />
          </div>
          <div className="flex items-start gap-1">
            <input type="checkbox" name="" id="" />
            <label htmlFor="">Non Aktif</label>
          </div>
        </div>
        {/* Main */}
        <div className="relative mt-5 flex h-full gap-3 sm:h-[calc(75vh_-_80px)]">
          {panelVisible && (
            <div
              className={`panel absolute z-10 hidden h-full w-[250px] max-w-full flex-none space-y-4  p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                isShowTaskMenu && '!block'
              }`}
              style={{ background: '#dedede' }}
            >
              <div className="flex h-full flex-col pb-8">
                <div className="pb-5">
                  <div className="flex items-center text-center">
                    <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Pilihan Item dan Status</h3>
                  </div>
                </div>
                <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                  <form className="flex h-full flex-col gap-1 overflow-auto">
                    <div>
                      <label className="mt-3 flex cursor-pointer items-center">
                        <input type="checkbox" name="" className="form-checkbox" checked={false} onChange={() => {}} />
                        <span>No. Barang</span>
                      </label>
                      <input type="text" placeholder="" className="form-input" name="" value={''} onChange={() => {}} />
                    </div>
                    <div>
                      <label className="mt-3 flex cursor-pointer items-center">
                        <input type="checkbox" name="" className="form-checkbox" checked={false} onChange={() => {}} />
                        <span>Nama Barang</span>
                      </label>
                      <input type="text" placeholder="" className="form-input" name="" value={''} onChange={() => {}} />
                    </div>
                  </form>
                </PerfectScrollbar>
              </div>
            </div>
          )}

          <div className="h-full flex-1 overflow-auto">
            {/* Table */}
            <GridComponent
              id="gridListData"
              locale="id"
              dataSource={[]}
              allowExcelExport={true}
              excelExportComplete={() => {}}
              allowPdfExport={true}
              pdfExportComplete={() => {}}
              editSettings={{ allowDeleting: true }}
              selectionSettings={{
                mode: 'Row',
                type: 'Single',
              }}
              allowPaging={true}
              allowSorting={true}
              // allowGrouping={true}
              allowFiltering={false}
              allowResizing={true}
              autoFit={true}
              allowReordering={true}
              pageSettings={{
                pageSize: 25,
                pageCount: 5,
                pageSizes: ['25', '50', '100', 'All'],
              }}
              rowHeight={22}
              gridLines={'Both'}
              loadingIndicator={{ indicatorType: 'Shimmer' }}
            >
              <ColumnsDirective>
                <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="grp" headerText="Kategori" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                  field="kustom10"
                  headerText="Kelompok Produk"
                  headerTextAlign="Center"
                  textAlign="Center"
                  // autoFit
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective field="kustom4" headerText="Merek Produk" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="stok" headerText="Stok Minimal" headerTextAlign="Center" textAlign="Center" clipMode="EllipsisWithTooltip" />
              </ColumnsDirective>
              <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
            </GridComponent>
          </div>
        </div>
      </div>
    </DialogComponent>
  );
};

export default DialogAturanPersediaan;

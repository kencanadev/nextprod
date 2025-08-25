import React, { useState } from 'react';

import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Selection, Toolbar } from '@syncfusion/ej2-react-grids';

import DialogListBarang from './DialogListBarang';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface dialogAkunProps {
  isOpen?: boolean;
  onClose?: any;
}

const DialogLabelBarcode = ({ isOpen, onClose }: dialogAkunProps) => {
  const [gridData, setGridData] = useState<any[]>([]);
  const [isDialogListBarangOpen, setIsDialogListBarangOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [showBarcodes, setShowBarcodes] = useState(false);

  const handleRowDoubleClick = (args: any) => {
    setSelectedRowIndex(args.rowIndex);
    setIsDialogListBarangOpen(true);
  };

  const handleSaveDialogListBarang = (selectedItem: any) => {
    if (selectedRowIndex !== null) {
      const updatedData = [...gridData];
      updatedData[selectedRowIndex] = {
        ...updatedData[selectedRowIndex],
        no_item: selectedItem.no_item,
        nama_item: selectedItem.nama_item,
        jumlah: updatedData[selectedRowIndex].jumlah || 1, // Set default to 1 if not present
      };
      setGridData(updatedData);
    }
    setIsDialogListBarangOpen(false);
  };

  const handleAddRow = () => {
    setGridData([...gridData, { no_item: '', nama_item: '', jumlah: 1 }]);
  };

  const handleDeleteRow = () => {
    if (selectedRowIndex !== null) {
      const updatedData = gridData.filter((_, index) => index !== selectedRowIndex);
      setGridData(updatedData);
      setSelectedRowIndex(null);
    }
  };

  const handleClearData = () => {
    setGridData([]);
    setSelectedRowIndex(null);
  };

  const handleActionComplete = (args: any) => {
    if (args.requestType === 'save') {
      const updatedData = [...gridData];
      const changedData = args.data;
      const index = updatedData.findIndex((item) => item.no_item === changedData.no_item);
      if (index !== -1) {
        updatedData[index] = changedData;
        setGridData(updatedData);
      }
    }
  };

  const handlePrintToScreen = () => {
    setShowBarcodes(true);
  };

  const handleCloseBarcodes = () => {
    setShowBarcodes(false);
  };

  const handlePrintPreview = () => {
    const printArea = document.getElementById('print-barcode-area'); // ID area cetak
    if (printArea) {
      html2canvas(printArea).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const imgWidth = 190; // Width sesuai ukuran A4
        const pageHeight = 297; // Tinggi A4 dalam mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Instead of saving, open the PDF in a new window
        const pdfData = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfData);
        window.open(pdfUrl, '_blank');
      });
    }
  };

  const renderBarcodes = (item: any) => {
    const quantity = parseInt(item.jumlah, 10) || 1;
    return Array.from({ length: quantity }, (_, index) => (
      <div key={`${item.no_item}-${index}`} className="m-4">
        <Barcode value={item.nama_item} />
      </div>
    ));
  };

  let buttonsInputData: ButtonPropsModel[] = [
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

  let buttonModalBarcode: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Cetak Printer',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: handlePrintPreview,
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
        // isPrimary: true,
      },
      isFlat: false,
      click: handleCloseBarcodes,
    },
  ];

  return (
    <DialogComponent
      id="dialogLabelBarcode"
      name="dialogLabelBarcode"
      target={'#main-target'}
      header={() => 'Label Barcode'}
      visible={isOpen}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      width="90%"
      height="100%"
      position={{ X: 80, Y: 14 }}
      style={{ position: 'fixed' }}
      buttons={buttonsInputData}
      allowDragging
      closeOnEscape
      open={(args: any) => {
        args.preventFocus = true;
      }}
      isModal
      className="p-2"
      zIndex={998}
    >
      {/* Options */}
      <div className="my-4 flex items-end gap-5">
        <div className="flex items-center gap-1">
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={gridData.length === 0}
            onClick={handlePrintToScreen}
          >
            Cetak Layar
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-700" onClick={handleAddRow}>
            Tambah Baris
          </button>
          <button className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-700" onClick={handleDeleteRow}>
            Hapus Baris
          </button>
          <button className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-700" onClick={handleClearData}>
            Bersihkan Data
          </button>
        </div>
      </div>
      {/* Table */}
      <GridComponent
        dataSource={gridData}
        allowSorting={true}
        allowPaging={true}
        pageSettings={{ pageSize: 15 }}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowSelected={(args) => setSelectedRowIndex(args.rowIndex)}
        recordDoubleClick={handleRowDoubleClick}
        editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' }}
        actionComplete={handleActionComplete}
        toolbar={['Edit', 'Update', 'Cancel']}
      >
        <ColumnsDirective>
          <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Center" allowEditing={false} />
          <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Center" allowEditing={false} />
          <ColumnDirective field="jumlah" headerText="Jumlah Label" headerTextAlign="Center" textAlign="Center" editType="numericedit" edit={{ params: { min: 1 } }} />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Selection, Edit, Toolbar]} />
      </GridComponent>
      {/* Dialog Daftar Barang */}
      <DialogListBarang isOpen={isDialogListBarangOpen} onClose={() => setIsDialogListBarangOpen(false)} onSave={handleSaveDialogListBarang} />
      {/* Dialog Barcodes */}
      {showBarcodes && (
        <DialogComponent width="85%" height="85%" isModal={true} header="Generated Barcodes" buttons={buttonModalBarcode} visible={true} close={handleCloseBarcodes}>
          <div id="print-barcode-area" className="flex flex-wrap items-center justify-between">
            {gridData.map((item) => renderBarcodes(item))}
          </div>
        </DialogComponent>
      )}
    </DialogComponent>
  );
};

export default DialogLabelBarcode;

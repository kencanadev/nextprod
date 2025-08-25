import React, { useEffect, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import axios from 'axios';
import moment from 'moment';

interface dialogPembatalanFPACProps {
  isOpen?: boolean;
  onClose?: any;
  onBatal?: any;
  data: any;
  kode_entitas: any;
}

const DialogPembatalanFPAC = ({ isOpen, onClose, onBatal, data, kode_entitas }: dialogPembatalanFPACProps) => {
  return (
    <DialogComponent
      id="dialogPembatalan"
      isModal={true}
      width="30%"
      height="100%"
      visible={isOpen}
      close={() => {
        onClose();
      }}
      header={'Informasi Pembatalan FPAC'}
      showCloseIcon={true}
      target="#main-target"
      closeOnEscape={false}
      allowDragging={true}
      position={{ X: 'center', Y: 40 }}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      className="p-3"
    >
      <h3 className="mt-3 text-lg font-semibold">*** Pembatalan Form Pembelian Antar Cabang ***</h3>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold">No. FPAC: </span>
          <span>{data?.no_fpac}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Tanggal: </span>
          <span>{moment(data?.tgl_fpac).format('DD-MM-YYYY')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Efektif: </span>
          <span>{moment(data?.tgl_berlaku).format('DD-MM-YYYY')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Customer: </span>
          <span>{data?.nama_relasi}</span>
        </div>
      </div>
      <p className="my-4 text-sm">Proses pembatalan FPAC ini akan membuat transaksi retur jual beli secara otomatis di entitas pembeli, entitas pusat dan entitas penjual.</p>
      <div className="text-sm">
        <p className="mt-1">Transaksi otomatis yang terjadi di entitas {data?.kode_entitas} (beli) :</p>
        <ul className="list-inside list-disc">
          <li>Memo Pengembalian Barang (MPB)</li>
        </ul>
        <p className="mt-1">Transaksi otomatis yang terjadi di entitas {kode_entitas} (pusat) :</p>
        <ul className="list-inside list-disc">
          <li>Tanda Terima Barang (TTB)</li>
          <li>Memo Kredit (MK)</li>
          <li>Memo Pengembalian Barang (MPB)</li>
        </ul>
        <p className="mt-1">Transaksi otomatis yang terjadi di entitas {data?.entitas_cabang_jual} (jual) :</p>
        <ul className="list-inside list-disc">
          <li>Tanda Terima Barang (TTB)</li>
          <li>Memo Kredit (MK)</li>
          <li>Mutasi Barang (MB) Balik</li>
        </ul>
        <p className="my-4 text-sm">*Proses ini tidak bisa dibatalkan, untuk pembatalan transaksi otomatis yang sudah dilaksanakan hanya bisa dilakukan secara manual.</p>
        <div className="my-2 flex items-center gap-2 font-semibold">
          <p>Tgl. Efektif Pembatalan :</p>
          <span className="bg-gray-200 px-2 py-1">{moment().format('DD-MM-YYYY')}</span>
        </div>
        <div className="mr-3 mt-3 flex items-center justify-end gap-3">
          <button className="rounded bg-gray-600 px-5 py-1 text-white" onClick={onClose}>
            Batal
          </button>
          <button className="rounded bg-red-500 px-3 py-1 text-white" onClick={onBatal}>
            Setuju Batalkan FPAC
          </button>
        </div>
      </div>
    </DialogComponent>
  );
};

export default DialogPembatalanFPAC;

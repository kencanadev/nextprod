import swal from 'sweetalert2';
import { AccDireksi } from '../model/api';

import React from 'react';

const fungsi = () => {
  return <div>fungsi</div>;
};

export default fungsi;

// FUNGSI PRINT PREVIEW
export const OnClick_CetakFormPo = (selectedRow: any, statusDok: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Data yang statusnya tidak terbuka tidak dapat dicetak.',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="/kcn/ERP/purchase/po/report/form_po_denganHarga?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPoNonPkp = (selectedRow: any, statusDok: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Data yang statusnya tidak terbuka tidak dapat dicetak.',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_denganHargaNonPkp?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPoTanpaHarga = (selectedRow: any, statusDok: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Data yang statusnya tidak terbuka tidak dapat dicetak.',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="/kcn/ERP/purchase/po/report/form_po_tanpaHarga?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakDaftarPP = (kode_entitas: any, dateStart: any, dateEnd: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
            <html><head>
            <title>Form Daftar Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/daftar_po_print?entitas=${kode_entitas}&tgl_awal=${dateStart?.format('YYYY-MM-DD')}&tgl_akhir=${dateEnd?.format(
    'YYYY-MM-DD'
  )}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

  let win = window.open(
    '',
    '_blank',
    `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
  );

  if (win) {
    let link = win.document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = '/favicon.png';
    win.document.getElementsByTagName('head')[0].appendChild(link);
    win.document.write(iframe);
  } else {
    console.error('Window failed to open.');
  }
};

export const OnClick_CetakFormPoBarangProduksiModel4 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedTipeJenisBarang !== 'Y' && selectedRow !== '') {
    swal.fire({
      title: `Order Pembelian No. ${noSp} bukan PO barang produksi.`,
      icon: 'warning',
    });
    return;
  }
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel4?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPraPpBarangProduksiModel4 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel4?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPoBarangProduksiModel3 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedTipeJenisBarang !== 'Y' && selectedRow !== '') {
    swal.fire({
      title: `Order Pembelian No. ${noSp} bukan PO barang produksi.`,
      icon: 'warning',
    });
    return;
  }

  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel3?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPraPpBarangProduksiModel3 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel3?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPoBarangProduksiModel2 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedTipeJenisBarang !== 'Y' && selectedRow !== '') {
    swal.fire({
      title: `Order Pembelian No. ${noSp} bukan PO barang produksi.`,
      icon: 'warning',
    });
    return;
  }
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel2?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};

export const OnClick_CetakFormPraPpBarangProduksiModel2 = (selectedRow: any, statusDok: any, selectedTipeJenisBarang: any, noSp: any, kode_entitas: string) => {
  if (selectedRow === '') {
    swal.fire({
      title: 'Pilih Data terlebih dahulu.',
      icon: 'error',
    });
    return;
  }
  if (statusDok !== 'Terbuka') {
    swal.fire({
      title: 'Status Dok. Harus Terbuka',
      icon: 'error',
    });
  } else {
    // const param = {
    //     entitas: kode_entitas,
    //     where: `d.kode_pp="${selectedRow}"`,
    // };

    // Encode Base64
    //  const strCommand = btoa(JSON.stringify(param));

    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    let iframe = `
            <html><head>
            <title>Form Order Pembelian | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/form_po_barangProduksiModel2?entitas=${kode_entitas}&kode_sp=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

    let win = window.open(
      '',
      '_blank',
      `status=no,width=${width},height=${height},resizable=yes
          ,left=${leftPosition},top=${topPosition}
          ,screenX=${leftPosition},screenY=${topPosition}
          ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
    );

    if (win) {
      let link = win.document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/favicon.png';
      win.document.getElementsByTagName('head')[0].appendChild(link);
      win.document.write(iframe);
    } else {
      console.error('Window failed to open.');
    }
  }
};
// END FUNGSI PRINT PREVIEW

// FUNGSI BUTTON YANG ADA DI POLIST
export const buttonUbah = (
  kontrak: any,
  selectedTipeJenisBarang: any,
  selectedRow: any,
  tipe_dokumen: any,
  date1: any,
  date2: any,
  dateberlaku1: any,
  dateberlaku2: any,
  datekirim1: any,
  datekirim2: any,
  tipeDokumen: any,
  noPOValue: any,
  namaSuppValue: any,
  namaBarangValue: any,
  isNoPOChecked: any,
  isNamaSuppChecked: any,
  isNamaBarangChecked: any,
  statusDokValue: any,
  statusAppValue: any,
  isTanggalChecked: any
) => {
  let base64EncodedString, jenisTransaksi;
  if (selectedTipeJenisBarang === 'Y') {
    base64EncodedString = btoa(
      `name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
        kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
      }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
    );
  } else {
    if (tipe_dokumen === 'Persediaan') {
      jenisTransaksi = 'barangjadi';
      base64EncodedString = btoa(
        `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
      );
    } else {
      jenisTransaksi = 'nonPersediaan';
      base64EncodedString = btoa(
        `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
      );
    }
  }
  return base64EncodedString;
};

export const buttonUpdateFile = (
  selectedTipeJenisBarang: any,
  selectedRow: any,
  tipe_dokumen: any,
  date1: any,
  date2: any,
  dateberlaku1: any,
  dateberlaku2: any,
  datekirim1: any,
  datekirim2: any,
  tipeDokumen: any,
  noPOValue: any,
  namaSuppValue: any,
  namaBarangValue: any,

  isPoKontrakChecked: any,
  isPoNonKontrakChecked: any,
  isPoBarangProduksiChecked: any,
  isPoDenganPajakChecked: any,
  isKirimanLangsungChecked: any,
  isPembatalanOrderChecked: any,
  isBelumAccDireksiChecked: any,
  isSudahAccDireksiChecked: any,

  isNoPOChecked: any,
  isNamaSuppChecked: any,
  isNamaBarangChecked: any,
  statusDokValue: any,
  statusAppValue: any,
  isTanggalChecked: any
) => {
  let base64EncodedString, jenisTransaksi;
  if (selectedTipeJenisBarang === 'Y') {
    base64EncodedString = btoa(
      `tanggalChecked=${isTanggalChecked}&name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=UPDATE FILE PENDUKUNG&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=UpdateFile`
    );
  } else {
    if (tipe_dokumen === 'Persediaan') {
      jenisTransaksi = 'barangjadi';
      base64EncodedString = btoa(
        `tanggalChecked=${isTanggalChecked}&name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=UPDATE FILE PENDUKUNG&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=UpdateFile`
      );
    } else {
      jenisTransaksi = 'nonPersediaan';
      base64EncodedString = btoa(
        `tanggalChecked=${isTanggalChecked}&name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=UPDATE FILE PENDUKUNG&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=UpdateFile`
      );
    }
  }
  return base64EncodedString;
};

export const buttonApproval = (
  statusDok: any,
  selectedTipeJenisBarang: any,
  selectedRow: any,
  tipe_dokumen: any,
  date1: any,
  date2: any,
  dateberlaku1: any,
  dateberlaku2: any,
  datekirim1: any,
  datekirim2: any,
  tipeDokumen: any,
  noPOValue: any,
  namaSuppValue: any,
  namaBarangValue: any,

  isPoKontrakChecked: any,
  isPoNonKontrakChecked: any,
  isPoBarangProduksiChecked: any,
  isPoDenganPajakChecked: any,
  isKirimanLangsungChecked: any,
  isPembatalanOrderChecked: any,
  isBelumAccDireksiChecked: any,
  isSudahAccDireksiChecked: any,

  isNoPOChecked: any,
  isNamaSuppChecked: any,
  isNamaBarangChecked: any,
  statusDokValue: any,
  statusAppValue: any,
  isTanggalChecked: any
) => {
  let base64EncodedString, jenisTransaksi;
  if (statusDok === 'Tertutup') {
    swal.fire({
      title: `Status approval Disetujui tidak dapat dikoreksi.`,
      icon: 'warning',
    });
    base64EncodedString = '';
  } else {
    if (selectedTipeJenisBarang === 'Y') {
      base64EncodedString = btoa(
        `name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=App`
      );
    } else {
      if (tipe_dokumen === 'Persediaan') {
        jenisTransaksi = 'barangjadi';
        base64EncodedString = btoa(
          `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
            selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
          }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=App`
        );
      } else {
        jenisTransaksi = 'nonPersediaan';
        base64EncodedString = btoa(
          `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
            selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
          }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=App`
        );
      }
    }
  }
  return base64EncodedString;
};

export const buttonPembatalan = (
  statusDok: any,
  selectedTipeJenisBarang: any,
  selectedRow: any,
  tipe_dokumen: any,
  date1: any,
  date2: any,
  dateberlaku1: any,
  dateberlaku2: any,
  datekirim1: any,
  datekirim2: any,
  tipeDokumen: any,
  noPOValue: any,
  namaSuppValue: any,
  namaBarangValue: any,

  isPoKontrakChecked: any,
  isPoNonKontrakChecked: any,
  isPoBarangProduksiChecked: any,
  isPoDenganPajakChecked: any,
  isKirimanLangsungChecked: any,
  isPembatalanOrderChecked: any,
  isBelumAccDireksiChecked: any,
  isSudahAccDireksiChecked: any,

  isNoPOChecked: any,
  isNamaSuppChecked: any,
  isNamaBarangChecked: any,
  statusDokValue: any,
  statusAppValue: any,
  isTanggalChecked: any
) => {
  let base64EncodedString, jenisTransaksi;
  if (statusDok === 'Tertutup') {
    swal.fire({
      title: `Status dok. Tertutup tidak dapat dibatalkan.`,
      icon: 'warning',
    });
    base64EncodedString = '';
  } else {
    if (selectedTipeJenisBarang === 'Y') {
      base64EncodedString = btoa(
        `name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=batal`
      );
    } else {
      if (tipe_dokumen === 'Persediaan') {
        jenisTransaksi = 'barangjadi';
        base64EncodedString = btoa(
          `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
            selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
          }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=batal`
        );
      } else {
        jenisTransaksi = 'nonPersediaan';
        base64EncodedString = btoa(
          `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValue}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
            selectedTipeJenisBarang === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
          }&tanggalChecked=${isTanggalChecked}&kode_sp=${selectedRow}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=batal`
        );
      }
    }
  }
  return base64EncodedString;
};

export const buttonAccDireksi = (noSp: any, tglSp: any, selectedRow: any, kode_entitas: any, nip: any) => {
  swal
    .fire({
      title: 'ACC Order Pembelian',
      // icon: 'question',
      html: `
            <div style='text-align: left; color: #3b3f5c; font-weight: bold;'>
                <div style="margin-left: 108px;margin-top: 20px;">No. PO <span style = 'margin-left:15px'>: ${noSp}</span></div>
                <div style="margin-left: 108px;">Tanggal <span style = 'margin-left:6px'>: ${tglSp}</span>  <input id="tanggal" type="text"></div>
            </div>
        `,
      showCancelButton: true,
      confirmButtonText: 'OK',
      showLoaderOnConfirm: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        AccDireksi(selectedRow, kode_entitas, nip)
          .then((result) => {
            const { sts, msg, psn } = result;
            if (sts === true) {
              swal.fire({
                title: `Data Berhasil di ${psn}.`,
                icon: 'success',
              });
            } else {
              swal.fire({
                title: msg,
                icon: 'warning',
              });
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        // AccDireksi(selectedRow, kode_entitas, nip);
      }
    });
};

export const buttonDetailDok = (selectedRow: any) => {
  return selectedRow;
};

export const rowDoubleClick = (
  kontrak: any,
  produksi: any,
  kode_sp: any,
  tipe_dokumen: any,
  date1: any,
  date2: any,
  dateberlaku1: any,
  dateberlaku2: any,
  datekirim1: any,
  datekirim2: any,
  tipeDokumen: any,
  noPOValue: any,
  namaSuppValue: any,
  namaBarangValue: any,

  isPoKontrakChecked: any,
  isPoNonKontrakChecked: any,
  isPoBarangProduksiChecked: any,
  isPoDenganPajakChecked: any,
  isKirimanLangsungChecked: any,
  isPembatalanOrderChecked: any,
  isBelumAccDireksiChecked: any,
  isSudahAccDireksiChecked: any,

  isNoPOChecked: any,
  isNamaSuppChecked: any,
  isNamaBarangChecked: any,
  statusDokValues: any,
  statusAppValue: any,
  isTanggalChecked: any
) => {
  console.log('kontrak = ', kontrak);

  let base64EncodedString, jenisTransaksi;
  if (produksi === 'Y') {
    base64EncodedString = btoa(
      `name=produksi&statusApp=${statusAppValue}&statusDok=${statusDokValues}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
        kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
      }&tanggalChecked=${isTanggalChecked}&kode_sp=${kode_sp}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
    );
  } else {
    if (tipe_dokumen === 'Persediaan') {
      jenisTransaksi = 'barangjadi';
      base64EncodedString = btoa(
        `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValues}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${kode_sp}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
      );
    } else {
      jenisTransaksi = 'nonPersediaan';
      base64EncodedString = btoa(
        `name=${jenisTransaksi}&statusApp=${statusAppValue}&statusDok=${statusDokValues}&vTipeDokumen=${tipeDokumen}&tglAwal=${date1}&tglAkhir=${date2}&tglBerlaku1=${dateberlaku1}&tglBerlaku2=${dateberlaku2}&tglKirim1=${datekirim1}&tglKirim2=${datekirim2}&jenisTransaksi=${
          kontrak === 'Y' ? 'KONTRAK' : 'NON KONTRAK'
        }&tanggalChecked=${isTanggalChecked}&kode_sp=${kode_sp}&noPo=${noPOValue}&namaSupp=${namaSuppValue}&namaBarang=${namaBarangValue}&isPoKontrakChecked=${isPoKontrakChecked}&isPoNonKontrakChecked=${isPoNonKontrakChecked}&isPoBarangProduksiChecked=${isPoBarangProduksiChecked}&isPoDenganPajakChecked=${isPoDenganPajakChecked}&isKirimanLangsungChecked=${isKirimanLangsungChecked}&isPembatalanOrderChecked=${isPembatalanOrderChecked}&isBelumAccDireksiChecked=${isBelumAccDireksiChecked}&isSudahAccDireksiChecked=${isSudahAccDireksiChecked}&noPoChecked=${isNoPOChecked}&namaSuppChecked=${isNamaSuppChecked}&namaBarangChecked=${isNamaBarangChecked}&tipe=Ubah`
      );
    }
  }
  return base64EncodedString;
};

export const buttonHapusRows = (noSp: any, tglSp: any, selectedRow: any, kode_entitas: any, nip: any) => {
  swal
    .fire({
      title: 'Hapus Order Pembelian',
      // icon: 'question',
      html: `
            <div style='text-align: left; color: #3b3f5c; font-weight: bold;'>
                <div style="margin-left: 108px;margin-top: 20px;">No. PO <span style = 'margin-left:15px'>: ${noSp}</span></div>
                <div style="margin-left: 108px;">Tanggal <span style = 'margin-left:6px'>: ${tglSp}</span>  <input id="tanggal" type="text"></div>
            </div>
        `,
      showCancelButton: true,
      confirmButtonText: 'OK',
      showLoaderOnConfirm: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
      }
    });
};
// END FUNGSI BUTTON YANG ADA DI POLIST

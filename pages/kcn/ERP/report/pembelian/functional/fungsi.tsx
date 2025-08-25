import Swal from 'sweetalert2';

import React from 'react'

const fungsi = () => {
  return (
    <div>fungsi</div>
  )
}

export default fungsi

export async function showLoading1(closeWhenDataIsFulfilled: boolean) {
    if (closeWhenDataIsFulfilled) {
        Swal.fire({
            padding: '3em',
            imageUrl: '/assets/images/loader-1.gif',
            imageWidth: 170,
            imageHeight: 170,
            imageAlt: 'Custom image',
            background: 'rgba(0,0,0,.0)',
            backdrop: 'rgba(0,0,0,0.0)',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            target: '#dialogBaseDialog',
        });
    } else {
        Swal.close(); // Menutup tampilan loading
    }
}

export const klasifikasiSupp = [
    {
        id: 'A',
        value: 'A',
    },
    {
        id: 'B',
        value: 'B',
    },
    {
        id: 'C',
        value: 'C',
    },
    {
        id: 'D',
        value: 'D',
    },
    {
        id: 'E',
        value: 'E',
    },
    {
        id: 'Semua',
        value: 'Semua',
    },
];

const swalDialog = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-primary btn-sm',
        cancelButton: 'btn btn-dark btn-sm ltr:mr-3 rtl:ml-3',
        popup: 'sweet-alerts',
    },
    buttonsStyling: false,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});

export const swalToast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3500,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});

const swalPopUp = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});

// PP
export const OnClick_CetakDaftarPermintaanPembelian = (paramObject: any) => {
    console.log('dataPemintaPilihan = ', paramObject.dataPemintaPilihan);
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_permintaan_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idPemintaPilihan=${paramObject.idPemintaPilihan}&dataPemintaPilihan=${paramObject.dataPemintaPilihan}&dataPemintaUser=${paramObject.dataPemintaUser}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Permintaan Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakDaftarPermintaanPembelianOutstanding = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_permintaan_pembelian_outstanding?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idPemintaPilihan=${paramObject.idPemintaPilihan}&dataPemintaPilihan=${paramObject.dataPemintaPilihan}&dataPemintaUser=${paramObject.dataPemintaUser}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&selectedOd=${paramObject.selectedOd}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Permintaan Pembelian Outstanding | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakDaftarRincianPermintaanPembelian = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rincian_permintaan_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idPemintaPilihan=${paramObject.idPemintaPilihan}&dataPemintaPilihan=${paramObject.dataPemintaPilihan}&dataPemintaUser=${paramObject.dataPemintaUser}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Rincian Permintaan Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakDaftarPermintaanPembelianPerPeminta = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_permintaan_pembelian_perpeminta?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idPemintaPilihan=${paramObject.idPemintaPilihan}&dataPemintaPilihan=${paramObject.dataPemintaPilihan}&dataPemintaUser=${paramObject.dataPemintaUser}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Rincian Permintaan Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

// SP
export const OnClick_CetakDaftarOrderPembelian = (paramObject: any) => {
    console.log('dataPemintaPilihan = ', paramObject.dataPemintaPilihan);
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_order_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Order Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarOrderPembelianOutstanding = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_order_pembelian_outstanding?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&selectedOd=${paramObject.selectedOd}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Order Pembelian Outstanding | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarRincianOrderPembelian = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rincian_order_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Rincian Order Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

//PB
export const OnClick_CetakRekapitulasiPenerimaanBarang = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/rekapitulasi_penerimaan_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&noSjSupp=${paramObject.noSjSupp}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Penerimaan Barang | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarPenerimaanBarangOutstanding = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rekapitulasi_penerimaan_barang_outstanding?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&noSjSupp=${paramObject.noSjSupp}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Penerimaan Barang Outstanding | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakRincianDaftarPenerimaanBarang = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rincian_penerimaan_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&noPb=${paramObject.noPb}&grupPerDokumen=${paramObject.grupPerDokumen}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Rincian LPB | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarPenerimaanBarangPerSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_penerimaan_barang_per_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&kodeSupplierValue=${paramObject.kodeSupplierValue}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Penerimaan Barang Per Supplier | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

//MPB
export const OnClick_CetakDaftarMemoPengembalianBarang = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_memo_pengembalian_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Memo Pengembalian Barang | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarMemoPengembalianBarangOutstanding = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_memo_pengembalian_barang_outstanding?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Memo Pengembalian Barang Outstanding | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakRincianDaftarMemoPengembalianBarang = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rincian_memo_pengembalian_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Rincian MPB | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarMemoPengembalianBarangPerSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_memo_pengembalian_barang_per_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&kodeSupplierValue=${paramObject.kodeSupplierValue}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar MPB Per Supplier | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

//FB
export const OnClick_CetakDaftarFakturPembelian = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_faktur_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Faktur Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarFakturPembelianOutstanding = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_faktur_pembelian_outstanding?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Faktur Pembelian Outstanding | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakRincianDaftarFakturPembelian = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rincian_faktur_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Rincian Faktur Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarFakturPembelianPerSupplier = (paramObject: any) => {
    console.log('dataPemintaPilihan = ', paramObject.dataPemintaPilihan);
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_faktur_pembelian_per_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar FB Per Supplier | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

//Umum
export const OnClick_CetakDaftarBeliPerKelompokBarang = (paramObject: any) => {
    console.log('dataPemintaPilihan = ', paramObject.dataPemintaPilihan);
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_beli_per_kelompok_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Beli Per Kelompok Barang | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const OnClick_CetakDaftarBeliPerKelompokBarangPeriodeBerjalan = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_beli_per_kelompok_barang_periode_berjalan?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Pembelian Per Kelompok Barang Periode Berjalan | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

// Lain Lainnya
export const OnClick_CetakDaftarRekapPembelianPerKelompokBarang = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/daftar_rekap_pembelian_per_kelompok_barang?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Beli Per Kelompok Barang | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakLaporanPembelianPerSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/laporan_pembelian_per_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&noSjSupp=${paramObject.noSjSupp}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Pembelian Per Supplier | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakLaporanRincianPembelianPerItem = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/laporan_rincian_pembelian_per_item?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&noSjSupp=${paramObject.noSjSupp}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&noLpbSupp=${paramObject.noPb}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Daftar Beli Per Jenis Barang | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakLaporanPembelian = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/laporan_pembelian?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&kuantitas=${paramObject.selectedKuantitas}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Laporan Pembelian | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

export const OnClick_CetakLaporanPembelianPerItemSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/pembelian//reports/laporan_pembelian_per_item_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&idSupplierPilihan=${paramObject.idSupplierPilihan}&dataSupplierPilihan=${paramObject.dataSupplierPilihan}&dataSupplier=${paramObject.dataSupplier}&idKategoriPilihan=${paramObject.idKategoriPilihan}&dataKategoriPilihan=${paramObject.dataKategoriPilihan}&dataKategori=${paramObject.dataKategori}&idKelompokPilihan=${paramObject.idKelompokPilihan}&dataKelompokPilihan=${paramObject.dataKelompokPilihan}&dataKelompok=${paramObject.dataKelompok}&idNoItemPilihan=${paramObject.idNoItemPilihan}&dataNoItemPilihan=${paramObject.dataNoItemPilihan}&dataNoItem=${paramObject.dataNoItem}&idNamaItemPilihan=${paramObject.idNamaItemPilihan}&dataNamaItemPilihan=${paramObject.dataNamaItemPilihan}&dataNamaItem=${paramObject.dataNamaItem}&tglAwal=${paramObject.tglAwal}&tglAkhir=${paramObject.tglAkhir}&visiblePrint=${paramObject.visiblePrint}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
        <html><head>
        <title>Pembelian / Barang / Supplier | Next KCN Sytem</title>
        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        </head><body>
        <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};

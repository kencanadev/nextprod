import React from 'react'

const fungsi = () => {
  return (
    <div>fungsi</div>
  )
}

export default fungsi
export const OnClick_CetakDaftarSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/daftar_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Laporan Daftar Supplier | Next KCN Sytem</title>
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

export const OnClick_CetakDaftarHutangDagangSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/daftar_hutang_dagang_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&antara=${paramObject.antara}&tgl_awal=${paramObject.tgl_awal}&tgl_akhir=${paramObject.tgl_akhir}&klasifikasiSupp=${paramObject.klasifikasiSupp}&namaSupp=${paramObject.namaSupp}&jatuhTempo=${paramObject.jatuhTempo}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Laporan Daftar Hutang | Next KCN Sytem</title>
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

export const OnClick_CetakDaftarPengakuanHutangDagangSupplier = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/daftar_hutang_pengakuan_supplier?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tglAwal=${paramObject.tgl_awal}&tglAkhir=${paramObject.tgl_akhir}&kodeSupp=${paramObject.namaSupp}&noLpb=${paramObject.dataNoLpb}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Laporan Daftar Pengakuan Hutang | Next KCN Sytem</title>
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

export const OnClick_CetakRekapitulasiHutangSupplierByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/rekapitulasi_hutang_supplier_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglRekapitulasi}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Aging Hutang Supplier | Next KCN Sytem</title>
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

export const OnClick_CetakRekapitulasiHutangWarkatByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/rekapitulasi_hutang_warkat_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglRekapitulasi}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Aging Hutang Warkat | Next KCN Sytem</title>
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

export const OnClick_CetakRekapitulasiHutangSupplierWarkatByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/rekapitulasi_hutang_supplierWarkat_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglRekapitulasi}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Aging Hutang Supplier + Warkat | Next KCN Sytem</title>
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

export const OnClick_CetakDetailHutangSupplierByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/detail_hutang_supplier_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglDetail}&kodeSupp=${paramObject.namaSupp}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Detail Aging Hutang Supplier | Next KCN Sytem</title>
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

export const OnClick_CetakDetailHutangWarkatByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/detail_hutang_warkat_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglDetail}&kodeSupp=${paramObject.namaSupp}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Detail Aging Hutang Warkat | Next KCN Sytem</title>
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

export const OnClick_CetakDetailHutangSupplierWarkatByUmur = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    let iframeSrc: any;
    iframeSrc = `./report/hutang-usaha-dan-supplier//reports/detail_hutang_supplierWarkat_byUmur?entitas=${paramObject.kode_entitas}&token=${paramObject.token}&tgl=${paramObject.tglDetail}&kodeSupp=${paramObject.namaSupp}&visiblePrint=${paramObject.visiblePrint}`;

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
        <title>Detail Aging Hutang Supplier + Warkat | Next KCN Sytem</title>
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

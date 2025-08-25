export const cetakKartuPersediaan = (paramObj: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  //   let iframeSrc = `./buku-besar/report/daftar_buku_besar?entitas=${paramObj.kode_entitas}&tgl_awal=${paramObj.tgl_awal}&tgl_akhir=${paramObj.tgl_akhir}&checkbox_barang=${paramObj.checkbox_barang}&kode_gudang=${paramObj.kode_gudang}&kode_item=${paramObj.kode_item}&token=${paramObj.token}`;

  let iframeSrc = `/kcn/ERP/master/daftarPersediaan/reports/kartu_persediaan_barang?entitas=${paramObj.kode_entitas}&tgl_awal=${paramObj.tgl_awal}&tgl_akhir=${paramObj.tgl_akhir}&checkbox_barang=${paramObj.checkbox_barang}&kode_gudang=${paramObj.kode_gudang}&kode_item=${paramObj.kode_item}&token=${paramObj.token}`;

  fetch(iframeSrc)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.text();
    })
    .then(() => {
      let iframe = `
            <html><head>
            <title>Kartu Detail Persediaan | Next KCN Sytem</title>
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

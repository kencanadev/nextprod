import { templateLabaRugiStandar, templateNeracaStandar, templateNeracaSkontro, templateArusKas, templateLRKomparasi, templateLRDivisiPenjualan, temlateNeracaKomparasi } from '../template';

export const PrintData = (data: any, objHeader: any, tipe: number, isLandscape: boolean = false) => {
  // Create an iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;

  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Laporan Keuangan</title>
          <style>
            @page {
              margin: 10mm;
              size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .title-red {
              color: red !important;
            }
            .text-blue {
              color: blue !important;
            }
            @media print {
              body {
                width: 100%;
                height: 100%;
              }
              table { page-break-after: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              td { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body onload="window.print();">
          ${tipe === 7601 ? templateNeracaStandar(data, objHeader) : ''}
          ${tipe === 7602 ? templateNeracaSkontro(data, objHeader) : ''}
          ${tipe === 7603 ? templateLabaRugiStandar(data, objHeader) : ''}
          ${tipe === 7604 ? templateArusKas(data, objHeader) : ''}
          ${tipe === 7606 ? templateLRKomparasi(data, objHeader) : ''}
          ${tipe === 7608 ? templateLRDivisiPenjualan(data, objHeader) : ''}
           ${tipe === 7605 ? temlateNeracaKomparasi(data, objHeader) : ''}
        </body>
      </html>
    `);
    iframeDoc.close();

    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };
    }
  } else {
    console.error('Failed to access iframe document.');
  }
};

export const neraca_komparasi = (params: any) => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Neraca Komparasi | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/neraca_komparasi_report?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

                console.log('iframe',iframe);
                

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

export const laba_rugi_standar = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Laba Rugi Standar | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/laba_rugi_standar?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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

export const laba_rugi_komparasi = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Laba Rugi Komparasi | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/laba-rugi-komparasi?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const laba_rugi_komparasi_selisih = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Laba Rugi Komparasi Selisih | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/laba-rugi-komparasi_selisih?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const lr_devisi_penjualan = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Laba Rugi Penjualan | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/lr_devisi_penjualan?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const neraca_std = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Neraca Standar | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/neraca_std?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const rpNeracaSkontro = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Neraca Skontro | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/rpNeracaSkontro?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const cash_flow = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Cash Flow | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/cash_flow?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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
export const harian_kas_warkat = (params: any) => {
  let height = window.screen.availHeight - 150;
  let width = window.screen.availWidth - 200;
  let leftPosition = window.screen.width / 2 - (width / 2 + 10);
  let topPosition = window.screen.height / 2 - (height / 2 + 50);

  let iframe = `
          <html><head>
          <title>Harian Kas  | Next KCN Sytem</title>
          <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
          </head><body>
          <iframe src="/kcn/ERP/report/laporan-keuangan/activejs/harian_kas_warkat?${params}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
          </body></html>`;

          console.log('iframe',iframe);
          

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


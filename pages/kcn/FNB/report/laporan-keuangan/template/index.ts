import moment from 'moment';

const SpreadNumber = (number: any | number | string) => {
    const temp = parseFloat(parseFloat(number).toFixed(2));
    return temp;
};

// Fungsi Helper untuk format currency
const formatCurrency = (number: number) => {
    const absNumber = Math.abs(number);
    const formattedNumber = absNumber.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return number < 0 ? `(${formattedNumber})` : formattedNumber;
};

export const templateNeracaStandar = (data: any, objHeader: any) => {
    const getIndentClass = (tingkat: number) => {
        return `padding-left: ${tingkat * 20}px;`;
    };

    const generateHeader = () => `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid black; position: relative;">
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas === '999' ? 'TRAINING' : objHeader.kode_entitas}</p>
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
      <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">Per tgl. ${objHeader.periode}</p>
    </div>
  `;

    const generateRows = (items: any[]) => {
        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';
                const isTotal = item.ket.toLowerCase().includes('total');

                return `
        <tr>
          <td style="${getIndentClass(item.tingkat)}${isHeader || isTotal ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.ket.trim()}</td>
          <td style="text-align: right; ${isHeader || isTotal ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${
                    item.saldo6 === 0 && item.tingkat !== 2 ? '' : item.saldo6 === 0 && item.tingkat === 2 ? 0 : formatCurrency(item.saldo6)
                }</td>
          <td style="text-align: right; ${isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${
                    item.saldo5 === 0 && item.tingkat !== 1 ? '' : item.saldo5 === 0 && item.tingkat === 1 ? 0 : formatCurrency(item.saldo5)
                }</td>
          <td style="text-align: right; ${isHeader && item.saldo4 !== 0 ? 'font-weight: bold; border-top: 1px solid black; font-size: 14px;' : 'font-size: 14px;'}">${
                    isHeader && item.saldo4 !== 0 ? formatCurrency(item.saldo4) : ''
                }</td>
        </tr>
      `;
            })
            .join('');
    };

    return `
    <div style="font-family: Calibri, sans-serif;">
      <table style="width: 100%; border-collapse: collapse;">
        <colgroup>
          <col style="width: 40%;">
          <col style="width: 15%;">
          <col style="width: 15%;">
          <col style="width: 15%;">
          <col style="width: 15%;">
        </colgroup>
        <thead style="display: table-header-group;">
          <tr>
            <td colspan="5">
              ${generateHeader()}
            </td>
          </tr>
        </thead>
        <tbody>
          ${generateRows(data)}
        </tbody>
      </table>
    </div>
  `;
};

export const templateLabaRugiStandar = (data: any, objHeader: any) => {
    const formatCurrency = (number: number) => {
        const absNumber = Math.abs(number);
        const formattedNumber = absNumber.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return number < 0 ? `(${formattedNumber})` : formattedNumber;
    };
    let labaRUgiKotor: any = 0;
    let BebanOperasionalLabaRugiOperasional: any = 0;
    let totalRow1dan2: any = 0;
    let labaRugiUsahaLain: any = null;

    const getIndentClass = (tingkat: number) => {
        return `padding-left: ${tingkat * 20}px;`;
    };

    const generateHeader = () => `
  <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid black; position: relative;">
    <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas === '999' ? 'TRAINING' : objHeader.kode_entitas}</p>
    <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
    <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">Periode tgl. ${objHeader.periode}</p>
  </div>
`;

    const generateRows = (items: any[]) => {
        return items
            .map((item: any, index: any) => {
                const isHeader = item.header === 'Y';

                if (item.tingkat == 1 && (item.id === 1 || item.id === 2)) {
                    labaRUgiKotor += SpreadNumber(item.mutasi);
                    console.log('index ke ', SpreadNumber(item.mutasi));
                }

                if (item.id === 1 || item.id === 2) {
                    return `
    <tr>
      <td style="${getIndentClass(item.tingkat)}${isHeader || item.tingkat === 1 ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.namaakun.trim()}</td>

      <td style="text-align: right; ${!isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${!isHeader && item.normal === 'K' ? formatCurrency(item.mutasi) : ''}</td>
      <td style="text-align: right; ${isHeader && item.mutasi !== 0 ? 'font-weight: bold;  font-size: 14px;' : 'font-size: 14px;'}">${
                        (isHeader || item.normal === 'D') && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''
                    }</td>

    </tr>
  `;
                }
            })
            .join('');
    };

    const generateRowsBeban = (items: any[]) => {
        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';

                if (item.tingkat == 1 && (item.id === 3 || item.id === 4)) {
                    BebanOperasionalLabaRugiOperasional += SpreadNumber(item.mutasi);
                    console.log('index ke ', SpreadNumber(item.mutasi));
                }

                if (item.id === 3 || item.id === 4) {
                    return `
<tr>
      <td style="${getIndentClass(item.tingkat)}${isHeader || item.tingkat === 1 ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.namaakun.trim()}</td>

      <td style="text-align: right; ${!isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${!isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''}</td>
      <td style="text-align: right; ${isHeader && item.mutasi !== 0 ? 'font-weight: bold;  font-size: 14px;' : 'font-size: 14px;'}">${
                        isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''
                    }</td>

    </tr>
`;
                }
            })
            .join('');
    };

    const generateRowsPendapatanDanBebanUsahaLain = (items: any[]) => {
        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';

                if (item.tingkat == 1 && (item.id === 5 || item.id === 6)) {
                    if (labaRugiUsahaLain === null) {
                        labaRugiUsahaLain = SpreadNumber(item.mutasi);
                    } else {
                        labaRugiUsahaLain -= SpreadNumber(item.mutasi);
                        console.log('index ke ', SpreadNumber(item.mutasi));
                    }
                }

                if (item.id === 5 || item.id === 6) {
                    return `
<tr>
      <td style="${getIndentClass(item.tingkat)}${isHeader || item.tingkat === 1 ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.namaakun.trim()}</td>

      <td style="text-align: right; ${!isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${!isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''}</td>
      <td style="text-align: right; ${isHeader && item.mutasi !== 0 ? 'font-weight: bold;  font-size: 14px;' : 'font-size: 14px;'}">${
                        isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''
                    }</td>

    </tr>
`;
                }
            })
            .join('');
    };

    const generateRowsTerakhir = (items: any[]) => {
        console.log('itemssss', items);

        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';

                if (item.tingkat == 1 && (item.id === 7 || item.id === 8)) {
                    labaRugiUsahaLain -= SpreadNumber(item.mutasi);
                    console.log('index ke ', SpreadNumber(item.mutasi));
                }

                if (item.id === 7 || item.id === 8) {
                    return `
<tr>
    <td style="${getIndentClass(item.tingkat)}${isHeader || item.tingkat === 1 ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.namaakun.trim()}</td>

    <td style="text-align: right; ${!isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${!isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''}</td>
    <td style="text-align: right; ${isHeader && item.mutasi !== 0 ? 'font-weight: bold;  font-size: 14px;' : 'font-size: 14px;'}">${
                        isHeader && item.mutasi !== 0 ? formatCurrency(item.mutasi) : ''
                    }</td>

  </tr>
`;
                }
            })
            .join('');
    };

    return `
  <div style="font-family: Calibri, sans-serif;">
    <table style="width: 100%; border-collapse: collapse;">
      <colgroup>
        <col style="width: 40%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
      </colgroup>
      <thead style="display: table-header-group;">
        
        <tr>
          <td colspan="5">
            ${generateHeader()}
          </td>
        </tr>
      </thead>
      <tbody>
      <tr>
        <td colspan="5" style="font-weight: bold; font-size: 16px;padding-left: ${20}px; ">
        <span color="red">
        
        PENDAPATAN USAHA DAN BEBAN OPERASIOANAL
        </span>
        <td>
      </tr>
      ${generateRows(data)}
      <tr>
      <td colspan="1" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">
          Laba (Rugi) Kotor Usaha
        <td>
        <td style="border-top: 1px solid black">
        </td>
        <td collspan="1">
        ${formatCurrency(SpreadNumber(labaRUgiKotor))}
        </td>
        </tr>
      ${generateRowsBeban(data)}
      <tr>
      <td colspan="1" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">
        Jumlah Beban Operasional<br>
          Laba (Rugi) Operasional
        <td>
        <td style="border-top: 1px solid black">
        </td>
        <td collspan="1">
        <div style="display: inline-block; text-align: right; font-family: Arial, sans-serif;">
<div style="border-bottom: 2px solid black; margin-bottom: 5px;">
  ${formatCurrency(SpreadNumber(BebanOperasionalLabaRugiOperasional))}
</div>
<div>
  ${formatCurrency(SpreadNumber(labaRUgiKotor) - SpreadNumber(BebanOperasionalLabaRugiOperasional))} <span style="display: none;">
${(totalRow1dan2 = SpreadNumber(labaRUgiKotor) - SpreadNumber(BebanOperasionalLabaRugiOperasional))}
</span>

</div>
</div>

        </td>
      </tr>
      <tr>
      <td colspan="5" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">
          PENDAPATAN DAN BEBAN USAHA LAIN
        <td>
        </tr>
      ${generateRowsPendapatanDanBebanUsahaLain(data)}
      <tr>
      <td colspan="2" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">Laba (Rugi) Luar Usaha</td>
      <td style="border-top: 1px solid black">
        </td>
        <td collspan="1">
        <div style="display: inline-block; text-align: right; font-family: Arial, sans-serif;">
<div style=" margin-bottom: 5px;">
  ${formatCurrency(SpreadNumber(labaRugiUsahaLain))}
</div>
</div>
      </tr>
      <tr>
        <td colspan="5" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">
          
        <td>
      </tr>
      ${generateRowsTerakhir(data)}
      <td colspan="1" style="font-weight: bold; font-size: 16px;padding-left: ${20}px;">
          Laba (Rugi) Bersih Operasional
        <td>
        <td style="border-top: 1px solid black">
        </td>
        <td collspan="1">
        <div style="display: inline-block; text-align: right; font-family: Arial, sans-serif;">

<div>
  ${formatCurrency(SpreadNumber(totalRow1dan2) + SpreadNumber(labaRugiUsahaLain))} 
</div>
<!-- <div>
  ${formatCurrency(SpreadNumber(labaRUgiKotor) - SpreadNumber(BebanOperasionalLabaRugiOperasional))} <span style="display: none;">
${(totalRow1dan2 = SpreadNumber(labaRUgiKotor) - SpreadNumber(BebanOperasionalLabaRugiOperasional))}
</span>

</div> -->
</div>

        </td>
      </tr>
      </tbody>
    </table>
  </div>
`;
};

export const templateNeracaSkontro = (data: any, objHeader: any) => {
    // Helper function to generate indent
    const getIndentClass = (tingkat: any) => `padding-left: ${tingkat > 0 ? tingkat * 20 : 5}px; padding-right: ${tingkat === 0 ? 5 : 0}px;`;

    // Generate header HTML
    const generateHeader = () => `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid black; position: relative;">
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas === '999' ? 'TRAINING' : objHeader.kode_entitas}</p>
      <p style="font-weight: bold; font-size: 20px; margin: 0;">${objHeader.title}</p>
      <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">Per tgl. ${objHeader.periode}</p>
    </div>
  `;

    const totalAktiva = data.vtNeracaAktiva.reduce((acc: any, item: any) => {
        // Check if tingkat is 0 and saldo5 is a number (not 0 or 'Y')
        if (item.tingkat === 0 && typeof item.saldo5 === 'number' && item.saldo5 !== 0) {
            return acc + item.saldo5;
        }
        return acc;
    }, 0);

    const totalPasiva = data.vtNeracaPasiva.reduce((acc: any, item: any) => {
        if (item.tingkat === 0 && typeof item.saldo5 === 'number' && item.saldo5 !== 0) {
            return acc + item.saldo5;
        }

        return acc;
    }, 0);

    // Generate rows for a table
    const generateRows = (items: any) =>
        items
            .map((item: any) => {
                const saldo = item.saldo5 || item.saldo4 || item.saldo3 || item.saldo2 || item.saldo1 || 0;
                const isBold = item.header === 'Y' || item.ket.toLowerCase().includes('total');
                const isTotal = item.header === 'Y' && item.ket.toLowerCase().includes('jumlah');
                return `
          <tr>
            <td style="${getIndentClass(item.tingkat)} ${isBold ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'} ${isTotal ? 'padding-bottom: 15px;' : ''}">${item.ket.trim()}</td>
            <td style="text-align: right; ${isBold ? 'font-weight: bold;' : ''} font-size: 12px;">
            ${item.saldo6 === 0 && item.tingkat !== 2 && item.tingkat !== 3 ? '' : item.saldo6 === 0 && (item.tingkat === 2 || item.tingkat === 3) ? 0 : formatCurrency(item.saldo6)}
          </td>
          <td style="text-align: right; ${isBold ? 'font-weight: bold;' : ''} ${isTotal ? 'border-top: 1px solid black; padding-bottom: 15px;' : ''} font-size: 12px;">
              ${
                  item.saldo5 === 0 && (item.ket.toLowerCase().startsWith('aktiva') || item.ket.toLowerCase().startsWith('kewajiban') || item.ket.toLowerCase().startsWith('modal'))
                      ? ''
                      : item.saldo5 === 0 && item.tingkat !== 1 && item.tingkat !== 0
                      ? ''
                      : item.saldo5 === 0 && isTotal
                      ? 0
                      : formatCurrency(item.saldo5)
              }
          </td>
          </tr>
        `;
            })
            .join('');

    // Combine Aktiva and Pasiva sections side-by-side
    return `
    <div style="font-family: Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse;">
        <colgroup>
          <col style="width: 50%;">
          <col style="width: 50%;">
        </colgroup>
        <thead style="display: table-header-group;">
          <tr>
            <td colspan="2">
              ${generateHeader()}
            </td>
          </tr>
        </thead>
          <tbody>
            <tr>
              <td colspan="1">
                <!-- Aktiva -->
                <table style="width: 100%; border-right: 2px solid black;">
                  <tbody">
                    ${generateRows(data.vtNeracaAktiva)}
                    
                  </tbody>
                </table>
              </td>
              <td colspan="1">
                <!-- Pasiva -->
                <table style="width: 100%;">
                  <tbody>
                    ${generateRows(data.vtNeracaPasiva)}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr style="border-top: 2px solid black; border-bottom: 7px double black;">
              <td colspan="1">
                <div style="display: flex; justify-content: space-between;  padding-left: 40px; padding-right: 5px;">
                  <span style="font-weight: bold; font-size: 14px;">Jumlah AKTIVA</span>
                  <span style="text-align: right; font-weight: bold; font-size: 12px;">${formatCurrency(totalAktiva)}</span>
                </div>
              </td>
              <td colspan="1">
                <div style="display: flex; justify-content: space-between; padding-left: 40px; padding-right: 5px;">
                  <span style="font-weight: bold; font-size: 14px;">Jumlah PASIVA</span>
                  <span style="text-align: right; font-weight: bold; font-size: 12px;">${formatCurrency(totalPasiva)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  `;
};

export const templateArusKas = (data: any, objHeader: any) => {
    const getIndentClass = (tingkat: any, ket: string, header: string) => {
        const mainHeader = ket.includes(':');
        return `padding-left: ${tingkat === '' && (header === 'N' || header === '') ? 40 : tingkat === 0 && mainHeader ? 0 : 20}px;`;
        // return `padding-left: ${header === 'Y' && !mainHeader ? 20 : tingkat === '' && (header === 'N' || header === '') ? 40 : 0} px;`;
    };

    const generateHeader = () => `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid black; position: relative;">
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas}</p>
      <p class='title-red' style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
      <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">${objHeader.periode}</p>
    </div>
  `;

    const generateRows = (items: any[]) => {
        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';
                const isTotal = item.ket.toLowerCase().includes('total');
                const mainHeader = item.ket.includes(':');
                const total4 = item.total4 === 'Y';
                const total5 = item.total5 === 'Y';

                return `
        <tr>
          <td 
            style="
            ${getIndentClass(item.tingkat, item.ket, item.header)} 
            ${isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'} 
            ${mainHeader ? 'padding-bottom: 13px;' : ''}
            ${total4 ? 'padding-bottom: 13px;' : ''}
            ${total5 ? 'padding-bottom: 13px;' : ''}
            "
          >
            ${item.ket.trim()}
          </td>
          <td style="text-align: right; ${isHeader || isTotal ? 'font-weight: bold;' : ''} font-size: 12px;">
          ${item.saldo6 === 0 && item.tingkat !== 2 ? '' : item.saldo6 === 0 && item.tingkat === 2 ? 0 : formatCurrency(item.saldo6)}
          </td>
          <td style="text-align: right; ${isHeader && item.saldo5 !== 0 ? 'font-weight: bold; border-top: 1px solid black;' : ''} font-size: 12px;">
          ${item.saldo5 === 0 && item.tingkat !== 1 ? '' : item.saldo5 === 0 && item.tingkat === 1 ? 0 : formatCurrency(item.saldo5)}
          </td>
          <td style="text-align: right; ${isHeader && item.saldo4 !== 0 ? 'font-weight: bold; border-top: 1px solid black;' : ''} font-size: 12px;">
          ${item.total4 !== 'Y' ? '' : formatCurrency(item.saldo4)}
          </td>
        </tr>
      `;
            })
            .join('');
    };

    return `
    <div style="font-family: Calibri, sans-serif;">
      <table style="width: 100%; border-collapse: collapse;">
        <colgroup>
          <col style="width: 50%;">
          <col style="width: 15%;">
          <col style="width: 15%;">
          <col style="width: 15%;">
          <col style="width: 5%;">
        </colgroup>
        <thead style="display: table-header-group;">
          <tr>
            <td colspan="5">
              ${generateHeader()}
            </td>
          </tr>
        </thead>
        <tbody>
          ${generateRows(data)}
        </tbody>
      </table>
    </div>
  `;
};

export const templateLRKomparasi = (data: any, objHeader: any) => {
    let jumlahBebanOperasional;
    let labaRugiOperasional;
    let labaRugiUsahaLain;
    let labaRugiBersihOperasional;
    let labaRugiLuarUsaha;

    const getIndentClass = (tingkat: number) => {
        return `padding-left: ${tingkat === 2 ? 10 : 0}px;`;
    };

    const hitungSelisih = (a: any, b: any) => {
        let num1 = a;
        let num2 = b;

        if (typeof a === 'string') {
            num1 = parseFloat(a);
        }

        if (typeof b === 'string') {
            num2 = parseFloat(b);
        }

        // Jika kedua angka negatif
        if (num1 < 0 && num2 < 0) {
            // Jika angka pertama lebih kecil dari angka kedua (lebih negatif)
            if (Math.abs(num1) > Math.abs(num2)) {
                return -(Math.abs(num1) - Math.abs(num2));
            } else {
                return Math.abs(num2) - Math.abs(num1);
            }
        }

        // Jika num1 positif dan num2 negatif, jumlahkan keduanya
        if (num1 > 0 && num2 < 0) {
            return num1 + Math.abs(num2);
        }

        return -(num1 - num2);
    };

    const hitungPersen = (a: any, b: any, tipe: any = '') => {
        let num1 = a;
        let num2 = b;
        if (typeof a === 'string') {
            num1 = parseFloat(a);
        }

        if (typeof b === 'string') {
            num2 = parseFloat(b);
        }

        const hasil = (num1 / num2) * 100;
        if (tipe === 'p') {
            const hasil = ((num1 - num2) / num2) * 100;

            if (num1 == '0' && num2 == '0') {
                return '0.00';
            }

            if (!isFinite(hasil)) {
                return '100.00';
            }

            if (hasil < 0) {
                return `(${Math.abs(hasil).toFixed(2)})`;
            }

            return hasil.toFixed(2);
        }

        if (num1 == '0' && num2 == '0') {
            return '0.00';
        }

        if (!isFinite(hasil)) {
            return '100.00';
        }

        if (hasil < 0) {
            return `(${Math.abs(hasil).toFixed(2)})`;
        }
        return hasil.toFixed(2);
    };

    const generateHeader = () => `
    <div style="text-align: center; border-bottom: 1px solid black; position: relative;">
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas}</p>
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
      <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">${objHeader.periode}</p>
    </div>
  `;

    const generateRows1 = (items: any[]) => {
        // Group items by ID
        const groupedById = items.reduce((acc: { [key: string]: any[] }, item: any) => {
            if (!acc[item.id]) {
                acc[item.id] = [];
            }
            acc[item.id].push(item);
            return acc;
        }, {});

        // Calculate totals for each group
        const totalsById = Object.entries(groupedById).reduce((acc: { [key: string]: any }, [id, groupItems]) => {
            const totals = groupItems
                .filter((item) => item.header === 'N') // Only calculate for header = 'N'
                .reduce(
                    (acc: any, item: any) => ({
                        mutasi_bl: acc.mutasi_bl + (parseFloat(item.mutasi_bl) || 0),
                        mutasi: acc.mutasi + (parseFloat(item.mutasi) || 0),
                        mutasi_all: acc.mutasi_all + (parseFloat(item.mutasi_all) || 0),
                    }),
                    { mutasi_bl: 0, mutasi: 0, mutasi_all: 0 }
                );

            acc[id] = totals;
            return acc;
        }, {});

        // Add total from id = 1 to id = 2
        if (totalsById['1'] && totalsById['2']) {
            totalsById['2'].mutasi_bl += totalsById['1'].mutasi_bl;
            totalsById['2'].mutasi += totalsById['1'].mutasi;
            totalsById['2'].mutasi_all += totalsById['1'].mutasi_all;
        }

        let mutasi_bl = 0;
        let mutasi = 0;
        let mutasi_all = 0;

        if (totalsById['3'] && totalsById['4']) {
            mutasi_bl = totalsById['3'].mutasi_bl + totalsById['4'].mutasi_bl;
            mutasi = totalsById['3'].mutasi + totalsById['4'].mutasi;
            mutasi_all = totalsById['3'].mutasi_all + totalsById['4'].mutasi_all;
        }

        // Generate rows for each group with totals
        return Object.entries(groupedById)
            .map(([id, groupItems]) => {
                // Filter and map normal rows
                const normalRows = groupItems
                    .filter((item: any) => !item.subtipe.toLowerCase().includes('usaha lain') && item.id < 5)
                    .map((item: any) => {
                        const isHeader = item.header === 'Y';

                        return `
              <tr>
                <td
                  style="
                    ${getIndentClass(item.tingkat)}
                    ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
                  "
                >
                  ${item.namaakun.trim()}
                </td>
                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
                  <div>
                    <span>
                      ${item.mutasi_bl === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_bl) : ''}
                    </span>
                  </div>
                </td>
                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
                  <div>
                    <span>
                      ${item.id != '1' && item.id != '2' && item.header !== 'Y' ? hitungPersen(item.mutasi_bl, totalsById['1'].mutasi_bl) : ''}
                    </span>
                  </div>
                </td>

                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
                  <div>
                    <span>
                      ${item.mutasi === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}
                    </span>
                  </div>
                </td>
                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
                  <div>
                    <span>${item.id != '1' && item.id != '2' && item.header !== 'Y' ? hitungPersen(item.mutasi, totalsById['1'].mutasi) : ''}</span>
                  </div>
                </td>
                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} ${
                            item.tingkat !== 2 ? 'font-weight: bold;' : ''
                        } font-size: 12px;">
                  <div>
                  ${
                      objHeader.tipe === 0
                          ? `
                        <span>
                          ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_all) : ''}
                        </span>
                      `
                          : `
                        <span>
                          ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(hitungSelisih(item.mutasi_bl, item.mutasi)) : ''}
                        </span>
                      `
                  }    
                  </div>
                </td>
                <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} ${
                            item.tingkat !== 2 ? 'font-weight: bold;' : ''
                        } font-size: 12px;">
                  <div>
                  <span>${item.id != '1' && item.id != '2' && item.header !== 'Y' ? hitungPersen(item.mutasi_all, totalsById['1'].mutasi_all) : ''}</span>
                  </div>
                </td>
                ${
                    objHeader.tipe === 1
                        ? `
                    <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
                      <span>${item.header === 'N' ? hitungPersen(item.mutasi, item.mutasi_bl, 'p') : ''}</span>
                    </td>
                  `
                        : ''
                }
              </tr>
            `;
                    })
                    .join('');

                if (parseInt(id) > 4) {
                    return normalRows;
                }

                let title = '';
                switch (id) {
                    case '1':
                        title = 'Penjualan Bersih';
                        break;
                    case '2':
                        title = 'Laba (Rugi) Kotor Usaha';
                        break;
                    case '3':
                        title = 'Jumlah Beban Pemasaran';
                        break;
                    case '4':
                        title = 'Jumlah Beban Umum dan Administrasi';
                    default:
                        break;
                }

                const getPropsByID = (id: string) => {
                    switch (id) {
                        case '2':
                            return {
                                prop1: 'Penjualan Bersih BL',
                                prop2: 'Penjualan BL',
                                prop3: 'Penjualan Bersih',
                                prop4: 'Penjualan',
                                prop5: 'Penjualan Bersih ALL',
                                prop6: 'Penjualan ALL',
                            };
                        case '3':
                            return {
                                prop1: 'Jumlah BB Usaha BL',
                                prop2: 'Penjualan BL',
                                prop3: 'Jumlah BB Usaha',
                                prop4: 'Penjualan',
                                prop5: 'Jumlah BB Usaha ALL',
                                prop6: 'Penjualan ALL',
                            };
                        case '4':
                            return {
                                prop1: 'Jumlah BB Adm BL',
                                prop2: 'Penjualan BL',
                                prop3: 'Jumlah BB Adm',
                                prop4: 'Penjualan',
                                prop5: 'Jumlah BB Adm ALL',
                                prop6: 'Penjualan ALL',
                            };
                        default:
                            return {
                                prop1: '',
                                prop2: '',
                                prop3: '',
                                prop4: '',
                                prop5: '',
                                prop6: '',
                            };
                    }
                };

                // Generate total row for the group
                const totalItem = groupItems.find((item: any) => item.tingkat === 1);
                const props = getPropsByID(id);

                const totalRow = `
          <tr class="total-row" style="padding: 20px 0px;">
            <td class="title-red" style="font-weight: bold; font-size: 14px;">
              ${title}
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${formatCurrency(totalsById[id].mutasi_bl)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${title !== 'Penjualan Bersih' && props.prop1 && props.prop2 ? hitungPersen(totalItem[props.prop1], totalItem[props.prop2]) : ''}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8x;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              <div">
                <span>${formatCurrency(totalsById[id].mutasi)}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              ${
                  objHeader.tipe === 1
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 5px;">
                <span>${title !== 'Penjualan Bersih' && props.prop3 && props.prop4 ? hitungPersen(totalItem[props.prop3], totalItem[props.prop4]) : ''}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 5px;">
                <span>${objHeader.tipe === 0 ? formatCurrency(totalsById[id].mutasi_all) : formatCurrency(hitungSelisih(totalsById[id].mutasi_bl, totalsById[id].mutasi))}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              ${
                  objHeader.tipe === 0
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 5px;">
                ${
                    objHeader.tipe === 0
                        ? `
                  <span>${title !== 'Penjualan Bersih' && props.prop5 && props.prop6 ? hitungPersen(totalItem[props.prop5], totalItem[props.prop6]) : ''}</span>
                  `
                        : ''
                }
              </div>
            </td>
            ${
                objHeader.tipe === 1
                    ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${hitungPersen(totalsById[id].mutasi, totalsById[id].mutasi_bl, 'p')}
                    </span>
                  </td>
                `
                    : ''
            }
          </tr>
        `;

                const persenBebanOp = groupItems.find((item: any) => item.tingkat === 1 && item.id == '4');

                jumlahBebanOperasional = `
          <tr class="total-row" style="padding: 20px 0px;">
            <td class="title-red" style="font-weight: bold; font-size: 14px;">
              Jumlah Beban Operasional
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${formatCurrency(mutasi_bl)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Jumlah BB Opp BL`], persenBebanOp['Penjualan BL']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              <div>
                <span>${formatCurrency(mutasi)}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              ${
                  objHeader.tipe === 1
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Jumlah BB Opp`], persenBebanOp['Penjualan']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              <div>
                <span>${objHeader.tipe === 0 ? formatCurrency(mutasi_all) : formatCurrency(hitungSelisih(mutasi_bl, mutasi))}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              ${
                  objHeader.tipe === 0
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div>
                ${
                    objHeader.tipe === 0
                        ? `
                  <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Jumlah BB Opp ALL`], persenBebanOp['Penjualan ALL']) : ''}</span>
                  `
                        : ''
                }
              </div>
            </td>
             ${
                 objHeader.tipe === 1
                     ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${persenBebanOp ? hitungPersen(mutasi, mutasi_bl, 'p') : ''}
                    </span>
                  </td>
                `
                     : ''
             }
          </tr>
        `;

                labaRugiOperasional = `
          <tr class="total-row">
            <td class="title-red" style="font-weight: bold; font-size: 14px;">
              Laba (Rugi) Operasional
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${formatCurrency(totalsById['2'].mutasi_bl - mutasi_bl)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`LR_Kotor_BL`], persenBebanOp['Penjualan BL']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              <div>
                <span>${formatCurrency(totalsById['2'].mutasi - mutasi)}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              ${
                  objHeader.tipe === 1
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
                `
                      : ''
              }
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`LR_Kotor`], persenBebanOp['Penjualan']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              <div>
                <span>
                ${
                    objHeader.tipe === 0
                        ? formatCurrency(totalsById['2'].mutasi_all - mutasi_all)
                        : formatCurrency(hitungSelisih(totalsById['2'].mutasi_bl - mutasi_bl, totalsById['2'].mutasi - mutasi))
                }
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
                ${
                    objHeader.tipe === 0
                        ? `
                    <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
                  `
                        : ''
                }
              <div>
                ${
                    objHeader.tipe === 0
                        ? `
                  <span>${persenBebanOp ? hitungPersen(persenBebanOp[`LR_Kotor_ALL`], persenBebanOp['Penjualan ALL']) : ''}</span>
                  `
                        : ''
                }
              </div>
            </td>
            ${
                objHeader.tipe === 1
                    ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${hitungPersen(totalsById['2'].mutasi - mutasi, totalsById['2'].mutasi_bl - mutasi_bl, 'p')}
                    </span>
                  </td>
                `
                    : ''
            }
          </tr>
        `;

                labaRugiUsahaLain = `
          <tr class="total-row" style="padding: 20px 0px;">
            <td class="title-red" style="font-weight: bold; font-size: 14px;">
              Laba (Rugi) Usaha Lain
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${formatCurrency((totalsById['6'].mutasi_bl - totalsById['5'].mutasi_bl) * -1)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} border-top: 1px solid black; position: relative;"></td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              ${
                  objHeader.tipe === 1
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
                `
                      : ''
              }
              <div">
                <span>${formatCurrency((totalsById['6'].mutasi - totalsById['5'].mutasi) * -1)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} border-top: 1px solid black; position: relative;"></td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              <div>
                <span>
                ${
                    objHeader.tipe === 0
                        ? formatCurrency((totalsById['6'].mutasi_all - totalsById['5'].mutasi_all) * -1)
                        : formatCurrency(hitungSelisih((totalsById['6'].mutasi_bl - totalsById['5'].mutasi_bl) * -1, (totalsById['6'].mutasi - totalsById['5'].mutasi) * -1))
                }
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px; border-top: 1px solid black; position: relative;' : 'padding-right: 8px;'} ">
            ${
                objHeader.tipe === 0
                    ? `
                <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
              `
                    : ''
            }
            </td>
            ${
                objHeader.tipe === 1
                    ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${hitungPersen((totalsById['6'].mutasi - totalsById['5'].mutasi) * -1, (totalsById['6'].mutasi_bl - totalsById['5'].mutasi_bl) * -1, 'p')}
                    </span>
                  </td>
                `
                    : ''
            }
          </tr>
        `;

                if (objHeader.tampilSaldo) {
                    labaRugiLuarUsaha = `
            <tr class="total-row" style="padding: 20px 0px;">
              <td class="title-red" style="font-weight: bold; font-size: 14px;">
                Laba (Rugi) Luar Usaha
              </td>
              <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
                <div>
                  <span>${formatCurrency((totalsById['8'].mutasi_bl - totalsById['7'].mutasi_bl) * -1)}</span>
                </div>
              </td>
              <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} border-top: 1px solid black; position: relative;"></td>
              <td style="text-align: right;${
                  objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'
              } font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
                <div>
                  <span>${formatCurrency((totalsById['8'].mutasi - totalsById['7'].mutasi) * -1)}</span>
                </div>
              </td>
              <td style="text-align: right;${
                  objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'
              } font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
                ${
                    objHeader.tipe === 1
                        ? `
                    <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
                  `
                        : ''
                }
              </td>
              <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                        objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                    }">
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 5px;">
                  <span>${formatCurrency((totalsById['8'].mutasi_all - totalsById['7'].mutasi_all) * -1)}</span>
                </div>
              </td>
              <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                        objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                    }">
              ${
                  objHeader.tipe === 0
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">-</span>
                `
                      : ''
              }
              </td>
               ${
                   objHeader.tipe === 1
                       ? `
                      <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                        <span>
                          ${hitungPersen((totalsById['8'].mutasi - totalsById['7'].mutasi) * -1, (totalsById['8'].mutasi_bl - totalsById['7'].mutasi_bl) * -1, 'p')}
                        </span>
                      </td>
                    `
                       : ''
               }
            </tr>
          `;
                }

                const labaRugiBersihOperasionalBl = totalsById['2'].mutasi_bl - mutasi_bl + (totalsById['6'].mutasi_bl - totalsById['5'].mutasi_bl) * -1;
                const labaRugiBersihOperasionalM = totalsById['2'].mutasi - mutasi + (totalsById['6'].mutasi - totalsById['5'].mutasi) * -1;
                const labaRugiBersihOperasionalAll = totalsById['2'].mutasi_all - mutasi_all + (totalsById['6'].mutasi_all - totalsById['5'].mutasi_all) * -1;

                labaRugiBersihOperasional = `
          <tr class="total-row" style="padding: 20px 0px;">
            <td class="title-red" style="font-weight: bold; font-size: 14px;">
              Laba (Rugi) Bersih Operasional
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${formatCurrency(labaRugiBersihOperasionalBl)}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black;">
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Laba Bersih BL`], persenBebanOp['Penjualan BL']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              <div>
                <span>${formatCurrency(labaRugiBersihOperasionalM)}</span>
              </div>
            </td>
            <td style="text-align: right;${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 12px; border-top: 1px solid black; position: relative;">
              ${
                  objHeader.tipe === 1
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div>
                <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Laba Bersih`], persenBebanOp['Penjualan']) : ''}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 30px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              <div>
                <span>${objHeader.tipe === 0 ? formatCurrency(labaRugiBersihOperasionalAll) : formatCurrency(hitungSelisih(labaRugiBersihOperasionalBl, labaRugiBersihOperasionalM))}</span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 12px; ${
                    objHeader.tipe === 0 ? 'border-top: 1px solid black; position: relative;' : ''
                }">
              ${
                  objHeader.tipe === 0
                      ? `
                  <span style="position: absolute; top: 0; right: 0; font-weight: bold; font-size: 14px;">+</span>
                `
                      : ''
              }
              <div>
                ${
                    objHeader.tipe === 0
                        ? `
                  <span>${persenBebanOp ? hitungPersen(persenBebanOp[`Laba Bersih ALL`], persenBebanOp['Penjualan ALL']) : ''}</span>
                  `
                        : ''
                }
              </div>
            </td>
            ${
                objHeader.tipe === 1
                    ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${hitungPersen(labaRugiBersihOperasionalM, labaRugiBersihOperasionalBl, 'p')}
                    </span>
                  </td>
                `
                    : ''
            }
          </tr>
        `;

                return normalRows + totalRow;
            })
            .join('');
    };

    const generateRows2 = (items: any[]) => {
        return items
            .filter((item: any) => item.subtipe.toLowerCase().includes('usaha lain'))
            .map((item: any) => {
                const isHeader = item.header === 'Y';
                let saldoNaikTurun = 0;

                if (Math.abs(parseFloat(item.mutasi)) > Math.abs(parseFloat(item.mutasi_bl))) {
                    saldoNaikTurun = Math.abs(Math.abs(parseFloat(item.mutasi_bl)) - Math.abs(parseFloat(item.mutasi)));
                } else {
                    saldoNaikTurun = (parseFloat(item.mutasi_bl) - parseFloat(item.mutasi)) * -1;
                }

                return `
          <tr>
            <td
              style="
                ${getIndentClass(item.tingkat)}
                ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
              "
            >
              ${item.namaakun.trim()}
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
              <div>
                <span>
                  ${item.mutasi_bl === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_bl) : ''}
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;"></td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
              <div>
                <span>
                  ${item.mutasi === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;"></td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} ${
                    item.tingkat !== 2 ? 'font-weight: bold;' : ''
                } font-size: 12px;">
              <div>
                  ${
                      objHeader.tipe === 0
                          ? `
                      <span>
                        ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_all) : ''}
                      </span>
                    `
                          : `
                      <span>
                        ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(saldoNaikTurun) : ''}
                      </span>
                    `
                  }
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;"></td>
            ${
                objHeader.tipe === 1
                    ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${item.header === 'N' ? hitungPersen(item.mutasi, item.mutasi_bl, 'p') : ''}
                    </span>
                  </td>
                `
                    : ''
            }
          </tr>
      `;
            })
            .join('');
    };

    const generateRows3 = (items: any[]) => {
        return items
            .filter((item: any) => !item.subtipe.toLowerCase().includes('usaha lain') && item.id > 6)
            .map((item: any) => {
                const isHeader = item.header === 'Y';
                let saldoNaikTurun = 0;

                if (Math.abs(parseFloat(item.mutasi)) > Math.abs(parseFloat(item.mutasi_bl))) {
                    saldoNaikTurun = Math.abs(Math.abs(parseFloat(item.mutasi_bl)) - Math.abs(parseFloat(item.mutasi)));
                } else {
                    saldoNaikTurun = (parseFloat(item.mutasi_bl) - parseFloat(item.mutasi)) * -1;
                }

                return `
          <tr>
            <td
              style="
                ${getIndentClass(item.tingkat)}
                ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
              "
            >
              ${item.namaakun.trim()}
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
              <div>
                <span>
                  ${item.mutasi_bl === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_bl) : ''}
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'}"></td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} ${item.tingkat !== 2 ? 'font-weight: bold;' : ''} font-size: 12px;">
              <div>
                <span>
                  ${item.mutasi === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}
                </span>
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'}"></td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} ${
                    item.tingkat !== 2 ? 'font-weight: bold;' : ''
                } font-size: 12px;">
              <div>
                  ${
                      objHeader.tipe === 0
                          ? `
                      <span>
                        ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(item.mutasi_all) : ''}
                      </span>
                    `
                          : `
                      <span>
                        ${item.mutasi_all === 0 ? '' : (item.tingkat === 1 && item.header === 'N') || item.tingkat === 2 ? formatCurrency(saldoNaikTurun) : ''}
                      </span>
                    `
                  }
              </div>
            </td>
            <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'}"></td>
             ${
                 objHeader.tipe === 1
                     ? `
                  <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-size: 12px;">
                    <span>
                      ${item.header === 'N' ? hitungPersen(item.mutasi, item.mutasi_bl, 'p') : ''}
                    </span>
                  </td>
                `
                     : ''
             }
          </tr>
      `;
            })
            .join('');
    };

    return `
  <div style="font-family: Calibri, sans-serif;">
    <table style="width: 100%; border-collapse: collapse;">
      <colgroup>
        ${
            objHeader.tipe === 0
                ? `
          <col style="width: 40%;">
          <col style="width: 16%;">
          <col style="width: 4%;">
          <col style="width: 16%;">
          <col style="width: 4%;">
          <col style="width: 16%;">
          <col style="width: 4%;">
          `
                : `
          <col style="width: 62%;">
          <col style="width: 8%;">
          <col style="width: 3%;">
          <col style="width: 8%;">
          <col style="width: 3%;">
          <col style="width: 8%;">
          <col style="width: 3%;">
          <col style="width: 5%;">
          `
        }
      </colgroup>
      <thead>
        <tr>
          <td ${objHeader.tipe === 0 ? "colspan='7'" : "colspan='8'"}>
            ${generateHeader()}
          </td>
        </tr>
        <tr style="border-bottom: 1px solid black; margin-bottom: 20px;">
          <td></td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;">Bln Lalu</td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;"></td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;">Real</td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;"></td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px; padding-left: 10px;'} font-weight: bold; font-size: 14px;">${
        objHeader.tipe === 0 ? 'Th Berjalan' : 'Naik (Turun)'
    }</td>
          <td style="text-align: right; ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;"></td>
          <td style="text-align: right;  ${objHeader.tipe === 0 ? 'padding-right: 10px;' : 'padding-right: 8px;'} font-weight: bold; font-size: 14px;">
          ${objHeader.tipe === 1 ? '%' : ''}
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4" class="text-blue" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
            Pendapatan Usaha dan Beban Operasional
          </td>
        </tr>
        ${generateRows1(data)}
        ${jumlahBebanOperasional}
        ${labaRugiOperasional}
        <tr>
          <td colspan="4" class="text-blue" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
            Pendapatan dan Beban Usaha Lain
          </td>
        </tr>
        ${generateRows2(data)}
        ${labaRugiUsahaLain}
        ${
            objHeader.tampilSaldo
                ? `
        <tr>
        <td colspan="4" class="text-blue" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
        Pendapatan dan Beban Luar Usaha
        </td>
        </tr>
        ${generateRows3(data)}
        ${labaRugiLuarUsaha}
        `
                : ''
        }
        ${labaRugiBersihOperasional}
      </tbody>
    </table>
  </div>
  `;
};

export const templateLRDivisiPenjualan = (data: any, objHeader: any) => {
    const getIndentClass = (tingkat: number) => {
        return `padding-left: ${tingkat === 2 ? 10 : 0}px;`;
    };

    const generateHeader = () => `
    <div style="text-align: center; border-bottom: 1px solid black; position: relative;">
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas}</p>
      <p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
      <p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">${objHeader.periode}</p>
    </div>
  `;

    const generateLRKotorUsaha = data
        .filter((item: any) => item.id === 2)
        .map((item: any) => {
            return `
      <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Laba (Rugi) Kotor Usaha
        </td>
        <td></td>
        <td style="position: relative; border-top: 1px solid black; padding-left: 7px;">
          <span style="position: absolute; top: -20; right: 0;">
            +
          </span>
        </td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          ${item?.['Penjualan Bersih'] ? formatCurrency(item['Penjualan Bersih']) : ''}
        </td>
      </tr>
    `;
        });

    const generateLRBersihOp = data
        .filter((item: any) => item.id === 4 && item.header === 'Y')
        .map((item: any) => {
            return `
      <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Laba (Rugi) Bersih Operasional
        </td>
        <td></td>
        <td></td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          <div style="position: relative; border-top: 1px solid black;">
            <span style="position: absolute; top: -10; right: -10;">
              +
            </span>
            ${item?.['Laba Bersih'] ? formatCurrency(item['Laba Bersih']) : ''}
          </div>
        </td>
      </tr>
    `;
        });

    const generateRows = (items: any[]) => {
        const headerTitle = `
        <tr>
          <td colspan="4" class="title-red" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
            PENDAPATAN USAHA DAN BEBAN OPERASIONAL
          </td>
        </tr>
      `;

        const additionalData = items.find((item: any) => item.header === 'Y' && item.id === 1);

        const jumlahBebanOperasional = `
      <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Jumlah Beban Operasional
        </td>
        <td></td>
        <td style="position: relative; border-top: 1px solid black; padding-left: 7px;">
          <span style="position: absolute; top: -20; right: 0;">
            +
          </span>
        </td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          ${additionalData?.['Jumlah BB Opp'] ? formatCurrency(additionalData['Jumlah BB Opp']) : ''}
        </td>
      </tr>
    `;

        const labaRugiOperasional = `
      <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Laba (Rugi) Operasional
        </td>
        <td></td>
        <td></td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          <div style="position: relative; border-top: 1px solid black;">
            <span style="position: absolute; top: -10; right: -10;">
              -
            </span>
            ${additionalData?.LR_Kotor ? formatCurrency(additionalData.LR_Kotor) : ''}
          </div>
        </td>
      </tr>
    `;

        let normalRows = '';

        items
            .filter((item) => item.id === 1 || item.id === 2 || item.id === 3 || item.id === 4)
            .forEach((item) => {
                const isHeader = item.header === 'Y';

                normalRows += `
          <tr>
            <td
              style="
                ${getIndentClass(item.tingkat)}
                ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
              "
            >
              ${item.namaakun.trim()}
            </td>
            <td style="font-size: 13px; text-align: right;">${item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}</td>
            <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 20px; padding-left: 7px;">${item.tingkat === 1 ? formatCurrency(item.mutasi) : ''}</td>
            <td></td>
          </tr>
          `;

                // Tambahkan generateLRKotorUsaha setelah id = 2
                if (item.id === 2) {
                    normalRows += generateLRKotorUsaha;
                }
            });

        return normalRows ? headerTitle + normalRows + jumlahBebanOperasional + labaRugiOperasional : '';
    };

    const generateRows2 = (items: any[]) => {
        const headerTitle = `
      <tr>
        <td colspan="4" class="title-red" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
          PENDAPATAN DAN BEBAN USAHA LAIN
        </td>
      </tr>
    `;

        const additionalData = items.find((item) => item.id === 5 && item.header === 'Y');

        const lrUsahaLain = `
      <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Laba (Rugi) Usaha Lain
        </td>
        <td></td>
        <td style="position: relative; border-top: 1px solid black; padding-left: 7px;">
          <span style="position: absolute; top: -20; right: 0;">
            -
          </span>
        </td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          ${additionalData?.['LR_Usaha_Lain'] ? formatCurrency(additionalData['LR_Usaha_Lain']) : ''}
        </td>
      </tr>
    `;

        const normalRows = items
            .filter((item) => item.id === 5 || item.id === 6)
            .map((item) => {
                const isHeader = item.header === 'Y';

                const normalRows = `
          <tr>
            <td
              style="
                ${getIndentClass(item.tingkat)}
                ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
              "
            >
            ${item.namaakun.trim()}
            </td>
            <td style="font-size: 13px; text-align: right;">${item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}</td>
            <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 20px; padding-left: 7px;">${item.tingkat === 1 ? formatCurrency(item.mutasi) : ''}</td>
            <td></td>
          </tr>
        `;

                return normalRows;
            })
            .join('');

        return normalRows ? headerTitle + normalRows + lrUsahaLain : '';
    };

    const generateRows3 = (items: any[]) => {
        const headerTitle = `
          <tr>
            <td colspan="4" class="title-red" style="padding: 10px 0px; font-weight: bold; font-size: 14px;">
              PENDAPATAN DAN BEBAN LUAR USAHA
            </td>
          </tr>
        `;

        const additionalData = items.find((item) => item.id === 5 && item.header === 'Y');

        const lrLuarUsaha = `
        <tr>
        <td
          class="title-red"
          style="font-weight: bold; font-size: 14px;"
        >
          Laba (Rugi) Luar Usaha
        </td>
        <td></td>
        <td></td>
        <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 180px; padding-left: 7px;">
          ${additionalData?.['LR_Luar_Usaha'] ? formatCurrency(additionalData['LR_Luar_Usaha']) : ''}
        </td>
      </tr>
      `;

        const normalRows = items
            .filter((item) => item.id === 7 || item.id === 8)
            .map((item) => {
                const isHeader = item.header === 'Y';

                return `
        <tr>
          <td
            style="
              ${getIndentClass(item.tingkat)}
              ${isHeader || item.tingkat <= 1 ? 'font-weight: bold; font-size: 14px;' : 'font-size: 13px;'}
            "
          >
            ${item.namaakun.trim()}
          </td>
          <td style="font-size: 13px; text-align: right;">${item.tingkat === 2 ? formatCurrency(item.mutasi) : ''}</td>
          <td style="font-size: 13px; font-weight: bold; text-align: right; padding-right: 20px; padding-left: 7px;">${item.tingkat === 1 ? formatCurrency(item.mutasi) : ''}</td>
          <td></td>
        </tr>
      `;
            })
            .join('');

        return normalRows ? headerTitle + normalRows + lrLuarUsaha : '';
    };

    return `
    <div style="font-family: Calibri, sans-serif;">
      <table style="width: 100%; border-collapse: collapse;">
        <colgroup>
          <col style="width: 40%;">
          <col style="width: 20%;">
          <col style="width: 20%;">
          <col style="width: 20%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4">
              ${generateHeader()}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid black; margin-bottom: 20px;">
            <td colspan="5" style="font-weight: bold; font-size: 13px;">
              Uraian
            </td>
          </tr>
        </thead>
        <tbody>
          ${generateRows(data)}
          ${generateRows2(data)}
          ${generateRows3(data)}
          ${generateLRBersihOp}
        </tbody>
      </table>
    </div>
  `;
};

export const temlateNeracaKomparasi = (data: any, objHeader: any) => {
    const getIndentClass = (tingkat: number) => {
        return `padding-left: ${tingkat * 20}px;`;
    };

    function hitungPersentase(val1: any, val2: any) {
        const valSelisih = val2 - val1;

        if (val1 === 0 && val2 > 0) return 100; // Naik 100%
        if (val1 > 0 && val2 === 0) return -100; // Turun -100%
        if (val1 === 0 && val2 === 0) return 0; // Tidak ada perubahan

        return (valSelisih / val1) * 100;
    }
    const formatCurrency = (number: number) => {
        const absNumber = Math.abs(number);
        const formattedNumber = absNumber.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        if (number == 0) {
            return '';
        } else {
            return number < 0 ? `(${formattedNumber})` : formattedNumber;
        }
    };
    const formatCurrencyNonBulat = (number: number) => {
        const absNumber = Math.abs(number);
        const formattedNumber = absNumber.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        if (number == 0) {
            return '';
        } else {
            return number < 0 ? `(${formattedNumber})` : formattedNumber;
        }
    };
    const generateHeader = () => `
<div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid black; position: relative;"
<p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.kode_entitas === '999' ? 'TRAINING' : objHeader.kode_entitas}</p>
<p style="font-weight: bold; font-size: 23px; margin: 0px;">${objHeader.title}</p>
<p style="font-weight: bold; font-size: 18px; margin: 0px; padding-bottom: 10px;">Per tgl. ${objHeader.periode}</p>
</div>
`;

    const generateRows = (items: any[]) => {
        return items
            .map((item: any) => {
                const isHeader = item.header === 'Y';

                return `
<tr>
  <td style="${getIndentClass(item.tingkat)}${isHeader ? 'font-weight: bold; font-size: 16px;' : 'font-size: 14px;'}">${item.namaakun}</td>
  <td style="text-align: right; ${isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'} ${
                    item.namaakun.toLowerCase().includes('total') ? 'font-weight: bold; border-top: 1px solid black' : ''
                }">${!isHeader ? formatCurrency(item.balance_bl) : ''}</td>
  <td style="text-align: right; ${isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'} ${
                    item.namaakun.toLowerCase().includes('total') ? 'font-weight: bold; border-top: 1px solid black' : ''
                }">${!isHeader ? formatCurrency(item.balance) : ''}</td>
  <td style="text-align: right; ${isHeader && item.selisih !== 0 ? 'font-weight: bold;  font-size: 14px;' : 'font-size: 14px;'}">${
                    !isHeader && item.namaakun.toLowerCase().includes('total') === false ? formatCurrency(item.balance - item.balance_bl) : ''
                }</td>
              <td style="text-align: right; ${isHeader ? 'font-weight: bold; font-size: 14px;' : 'font-size: 14px;'}">${
                    !isHeader && item.namaakun.toLowerCase().includes('total') === false ? formatCurrencyNonBulat(hitungPersentase(item.balance_bl, item.balance)) : ''
                }</td>
</tr>
`;
            })
            .join('');
    };

    return `
  <div style="font-family: Calibri, sans-serif;">
    <table style="width: 100%; border-collapse: collapse;">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 5%;">
      </colgroup>
      <thead style="display: table-header-group;">
        <tr>
          <td colspan="5">
            ${generateHeader()}
          </td>
        </tr>
        <tr>
          <td></td>
          <td>saldo bln lalu</td>
          <td>saldo</td>
          <td>naik turun</td>
          <td>%</td>
        </tr>
      </thead>
      <tbody>
       ${generateRows(data)}
      </tbody>
    </table>
  </div>
`;
};

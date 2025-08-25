import swal from 'sweetalert2';

export const SpreadNumber = (number: any | number | string) => {
    const temp = parseFloat(parseFloat(number).toFixed(2));
    return temp;
};

export const swalToast = swal.mixin({
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

export const validate = (grid: any, masterData: any, statusPage: any) => {
    const isJurnalNull = grid.dataSource.length === 0;
    const isSatuanNull = grid.dataSource.some((item: any) => item.satuan === null);
    const isQtyNull = grid.dataSource.some((item: any) => item.qty <= 0);

    if (isJurnalNull) {
        return {
            isValid: false,
            message: 'Data Detail belum diisi',
        };
    }

    if (isSatuanNull) {
        return {
            isValid: false,
            message: 'Data Satuan belum diisi',
        };
    }

    if (isQtyNull) {
        return {
            isValid: false,
            message: 'Data Kuantitas tidak boleh kurang/sama dengan nol',
        };
    }

    if (masterData.jenis_bayar === '') {
        return {
            isValid: false,
            message: 'Data Jenis Bayar belum diisi',
        };
    }

    if (masterData.total_rp === 0 || masterData.total_rp === null) {
        return {
            isValid: false,
            message: 'Data Total Rp belum diisi',
        };
    }

    if (masterData.no_rekening === '') {
        return {
            isValid: false,
            message: 'Data No Rekening belum diisi',
        };
    }

    if (masterData.nama_bank === '' || masterData.nama_bank === null) {
        return {
            isValid: false,
            message: 'Data Nama Bank belum diisi',
        };
    }

    if (masterData.no_reff === '' && statusPage === 'PEMBAYARAN') {
        return {
            isValid: false,
            message: 'No. Reff belum diisi.',
        };
    }

    if (masterData.bayar_rp <= 0 && statusPage === 'PEMBAYARAN') {
        return {
            isValid: false,
            message: 'Jumlah Bayar tidak boleh <=0.',
        };
    }

    return { isValid: true, message: '' };
};

// Terbilang
function terbilang(a: any): string {
    var bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    var kalimat = '';
    var isNegative = false;

    if (typeof a === 'number') {
        a = parseFloat(a.toFixed(2));
    } else {
        a = parseFloat(parseFloat(a).toFixed(2));
    }

    // Check if number is negative
    if (a < 0) {
        isNegative = true;
        a = Math.abs(a); // Convert to positive number
    }

    var parts = a.toString().split('.');
    var angkaUtama = parseInt(parts[0]);
    var angkaDesimal = parts[1] ? parseFloat('0.' + parts[1]) : 0;

    function angkaKeKata(angka: number): string {
        if (angka === 0) {
            return '';
        }
        if (angka < 12) {
            return bilangan[angka];
        } else if (angka < 20) {
            return bilangan[angka - 10] + ' Belas';
        } else if (angka < 100) {
            var depan = Math.floor(angka / 10);
            var belakang = angka % 10;
            return bilangan[depan] + ' Puluh ' + (belakang > 0 ? bilangan[belakang] : '');
        } else if (angka < 200) {
            return 'Seratus ' + angkaKeKata(angka - 100);
        } else if (angka < 1000) {
            var depan = Math.floor(angka / 100);
            var belakang = angka % 100;
            return bilangan[depan] + ' Ratus ' + angkaKeKata(belakang);
        } else if (angka < 2000) {
            return 'Seribu ' + angkaKeKata(angka - 1000);
        } else if (angka < 1000000) {
            var depan = Math.floor(angka / 1000);
            var belakang = angka % 1000;
            return angkaKeKata(depan) + ' Ribu ' + angkaKeKata(belakang);
        } else if (angka < 1000000000) {
            var depan = Math.floor(angka / 1000000);
            var belakang = angka % 1000000;
            return angkaKeKata(depan) + ' Juta ' + angkaKeKata(belakang);
        } else if (angka < 1000000000000) {
            var depan = Math.floor(angka / 1000000000);
            var belakang = angka % 1000000000;
            return angkaKeKata(depan) + ' Milyar ' + angkaKeKata(belakang);
        } else if (angka < 1000000000000000) {
            var depan = Math.floor(angka / 1000000000000);
            var belakang = angka % 1000000000000;
            return angkaKeKata(depan) + ' Triliun ' + angkaKeKata(belakang);
        }
        return ''; // Untuk angka yang lebih besar
    }

    kalimat = angkaKeKata(angkaUtama);
    if (kalimat === '') {
        kalimat = 'Nol';
    }

    // Add "Minus" for negative numbers
    if (isNegative) {
        kalimat = 'Minus ' + kalimat;
    }

    // Tambahkan bagian desimal menjadi sen
    if (angkaDesimal > 0) {
        var sen = Math.round(angkaDesimal * 100); // Konversi desimal menjadi sen
        if (sen > 0) {
            kalimat += ' Koma ' + angkaKeKata(sen) + ' Sen';
        }
    }

    return kalimat.trim();
}

// Kalkulasi
export const Recalc = (grid: any, masterData: any, updateState: Function) => {
    let newTotalRp = 0;
    let newTotalDiskonRpMu = 0;
    let newTotalDiskonRp = 0;
    let newNettoRp = 0;
    let newSisaRp = 0;

    // Iterate through all data in the grid
    if (Array.isArray(grid.dataSource)) {
        grid.dataSource.forEach((item: any) => {
            let newHargaMu = item.harga_mu;
            let newHargaBaruMu = item.harga_baru_mu;

            if (item.harga_baru_mu > 0) {
                if (item.diskon > 0) {
                    newHargaBaruMu = item.harga_baru_mu - (item.harga_baru_mu * item.diskon) / 100;
                }

                if (item.potongan_mu > 0) {
                    newHargaBaruMu -= item.potongan_mu;
                }

                item.jumlah_mu = item.qty * newHargaBaruMu;
            } else {
                if (item.diskon > 0) {
                    newHargaMu = item.harga_mu - (item.harga_mu * item.diskon) / 100;
                }

                if (item.potongan_mu > 0) {
                    newHargaMu -= item.potongan_mu;
                }

                item.jumlah_mu = newHargaMu * item.qty;
            }

            // kalkulasi selisih
            if (item.harga_baru_mu > 0) {
                item.selisih_harga_mu = item.harga_baru_mu - item.harga_mu;
            } else {
                item.selisih_harga_mu = 0;
            }

            // Menambahkan jumlah_mu ke newTotalRp
            newTotalRp += item.jumlah_mu;
        });
    }

    // Kalkulasi Diskon
    if (Number(masterData.diskon_dok_mu) > 0 && Number(masterData.total_rp) > 0) {
        newTotalDiskonRp = (100 * Number(masterData.diskon_dok_mu)) / newTotalRp;
        updateState('diskon_dok', newTotalDiskonRp);
        updateState('diskon_dok_mu', masterData.diskon_dok_mu);
    } else if (Number(masterData.diskon_dok) > 0 && Number(masterData.total_rp) > 0) {
        newTotalDiskonRpMu = Math.round((Number(masterData.diskon_dok) * newTotalRp) / 100);
        updateState('diskon_dok', masterData.diskon_dok);
        updateState('diskon_dok_mu', newTotalDiskonRpMu);
    }

    // Kalkulasi Total / Netto
    if (newTotalDiskonRpMu) {
        newNettoRp = newTotalRp - newTotalDiskonRpMu + Number(masterData.kirim_rp);
    } else {
        newNettoRp = newTotalRp - Number(masterData.diskon_dok_mu) + Number(masterData.kirim_rp);
    }

    // Kalkulasi Sisa
    if (Number(masterData.bayar_rp) > 0) {
        newSisaRp = newNettoRp - Number(masterData.lunas_rp) - Number(masterData.bayar_rp);
    } else {
        newSisaRp = newNettoRp - Number(masterData.lunas_rp);
    }

    // Formatted terbilang
    const terbilangSisaRp = terbilang(newSisaRp);

    // Update state
    updateState('total_rp', newTotalRp);
    updateState('netto_rp', newNettoRp);
    updateState('sisa_rp', newSisaRp);
    updateState('terbilang', terbilangSisaRp);
};

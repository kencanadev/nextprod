import { getPesanTransit } from '../api';

export const handleKirimPesan = async (checkedHari: any, quData: any, kode_entitas: string, token: string, tipe: string) => {
  const { ch5, ch7, chUp } = checkedHari;
  let n1 = 0;
  let n2 = 0;
  let wa_pesan = '',
    wa_pesan2 = '',
    tele_pesan = '';

  if (ch5) n1 = 0;
  else if (ch7) n1 = 5;
  else if (chUp) n1 = 7;
  else n1 = 999999;

  if (ch5) n2 = 5;
  if (ch7) n2 = 7;
  if (chUp) n2 = 999999;

  const dataSource = quData.current.dataSource as any[];
  const vtPesan: any = [];
  for (const data of dataSource) {
    if (data.stok_transit > 0) {
      // lakukan query pesan transit
      const params = {
        entitas: kode_entitas,
        param1: data.kode_item,
      };
      const response = await getPesanTransit({ params, token });
      for (const item of response) {
        const hari = item.hari - data.hari_kirim;
        if (hari >= n1 && hari <= n2) {
          const obj = {
            noref: item.noref,
            nopol: item.nopol,
            tanggal: item.tanggal,
            hari: item.hari,
            kuantitas: item.kuantitas,
            nama_item: data.nama_item,
          };
          vtPesan.push(obj);
        }
      }
    }
  }

  for (let i = 0; i < vtPesan.length; i++) {
    const data = vtPesan[i];
    const counter = i + 1;
    wa_pesan = wa_pesan + `${counter}. ${data.nama_item}\nTanggal DO: ${data.tanggal}\nNopol: ${data.nopol}\nUmur: ${data.hari}\n\n`;

    wa_pesan2 = wa_pesan2 + `${counter}. ${data.nama_item}\nTanggal DO: ${data.tanggal}\nNopol: ${data.nopol}\nUmur: ${data.hari}\n\n`;

    tele_pesan = tele_pesan + `${counter}. ${data.nama_item}\nTanggal DO: ${data.tanggal}\nNopol: ${data.nopol}\nUmur: ${data.hari}\n\n`;
  }

  if (wa_pesan === '' || !wa_pesan) {
    return 'Tidak ada pesan yang dikirim.';
  }

  if (tipe === 'transit') {
    wa_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${wa_pesan.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;

    wa_pesan2 = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${wa_pesan2.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;

    tele_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${tele_pesan.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;
  } else if (tipe === 'gd-cust') {
    wa_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${wa_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PENGAMBILAN BARANG KE TOKO TERSEBUT`;

    wa_pesan2 = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${wa_pesan2.trim()}\n\nMOHON SEGERA LAKUKAN PENGAMBILAN BARANG KE TOKO TERSEBUT`;

    tele_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${tele_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PENGAMBILAN BARANG KE TOKO TERSEBUT`;
  } else if (tipe === 'gd-ttb') {
    wa_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${wa_pesan.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;

    wa_pesan2 = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${wa_pesan2.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;

    tele_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TRANSIT AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\nBATAS WAKTU 7 HARi.\n\n${tele_pesan.trim()}\n\nSEGERA SELESAIKAN PROSES TIMBANG, HITUNG DAN IKAT`;
  }
  return {
    wa_pesan,
    wa_pesan2,
    tele_pesan,
  };
};

export const handleKirimPesanCustomer = async (checkedHari: any, quData: any, kode_entitas: string, token: string) => {
  const { ch30, ch90, chUp } = checkedHari;

  let n1 = 0,
    n2 = 0;
  let wa_pesan = '',
    wa_pesan2 = '',
    tele_pesan = '',
    tele_pesan2 = '';

  if (ch30) n1 = 0;
  else if (ch90) n1 = 30;
  else if (chUp) n1 = 91;
  else n1 = 999999;

  if (ch30) n2 = 30;
  if (ch90) n2 = 91;
  if (chUp) n2 = 999999;

  const dataSource = quData as any[];
  const vtPesan: any = [];
  for (const data of dataSource) {
    if (data.stok > 0) {
      if (data.umur >= n1 && data.umur < n2) {
        const obj = {
          nama_relasi: data.nama_relasi,
          hari: data.umur,
          kuantitas: data.stok,
          nama_item: data.nama_item,
          satuan: data.satuan,
          tglDo: data.tgl_do,
        };
        vtPesan.push(obj);
      }
    }
  }

  for (let i = 0; i < vtPesan.length; i++) {
    const data = vtPesan[i];
    const counter = i + 1;

    wa_pesan = wa_pesan + `${counter}. ${data.nama_item}\nCUSTOMER : ${data.nama_relasi}\nJumlah : ${data.kuantitas} ${data.satuan}\nTanggal DO : ${data.tglDo}\nUmur Terlama : ${data.hari}\n\n`;
    // wa_pesan2 = wa_pesan2 + `${counter}. ${data.nama_item}\nCUSTOMER : ${data.nama_relasi}\nJumlah : ${data.kuantitas}\nTanggal DO : ${data.tglDo}\nUmur Terlama : ${data.hari}\n\n`
    tele_pesan = tele_pesan + `${counter}. ${data.nama_item}\nCUSTOMER : ${data.nama_relasi}\nJumlah : ${data.kuantitas} ${data.satuan}\nTanggal DO : ${data.tglDo}\nUmur Terlama : ${data.hari}\n\n`;
    // tele_pesan2 = tele_pesan2 + `${counter}. ${data.nama_item}\nCUSTOMER : ${data.nama_relasi}\nJumlah : ${data.kuantitas}\nTanggal DO : ${data.tglDo}\nUmur Terlama : ${data.hari}\n\n`
  }

  if (wa_pesan === '' || !wa_pesan) return 'Tidak ada data yang akan dikirim pesan';

  wa_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG CUSTOMER AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${wa_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PENGAMBILAN BARANG KE TOKO TERSEBUT`;
  tele_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG CUSTOMER AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${tele_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PENGAMBILAN BARANG KE TOKO TERSEBUT`;

  return {
    wa_pesan,
    // wa_pesan2,
    tele_pesan,
    // tele_pesan2,
  };
};

export const handleKirimPesanTtb = async (checkedHari: any, quData: any, kode_entitas: string, token: string) => {
  const { ch30, ch60, chUp } = checkedHari;

  let n1 = 0,
    n2 = 0;
  let wa_pesan = '',
    wa_pesan2 = '',
    tele_pesan = '',
    tele_pesan2 = '';

  if (ch30) n1 = 0;
  else if (ch60) n1 = 30;
  else if (chUp) n1 = 61;
  else n1 = 999999;

  if (ch30) n2 = 30;
  if (ch60) n2 = 61;
  if (chUp) n2 = 999999;

  const dataSource = quData as any[];
  const vtPesan: any = [];
  for (const data of dataSource) {
    if (data.stok_transit > 0) {
      if (data.umur >= n1 && data.umur < n2) {
        const obj = {
          hari: data.umur,
          kuantitas: data.stok_transit,
          nama_item: data.nama_item,
          satuan: data.satuan,
        };
        vtPesan.push(obj);
      }
    }
  }

  for (let i = 0; i < vtPesan.length; i++) {
    const data = vtPesan[i];
    const counter = i + 1;

    wa_pesan = wa_pesan + `${counter}. ${data.nama_item}\nJumlah : ${data.kuantitas} ${data.satuan}\nUmur Terlama : ${data.hari}\n\n`;
    tele_pesan = tele_pesan + `${counter}. ${data.nama_item}\nJumlah : ${data.kuantitas} ${data.satuan}\nUmur Terlama : ${data.hari}\n\n`;
  }

  if (wa_pesan === '' || !wa_pesan) return 'Tidak ada data yang akan dikirim pesan';

  wa_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TTB AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${wa_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PROSES STOK OPNAME`;
  tele_pesan = `ENTITAS: ${kode_entitas}\nUMUR BARANG DI GUDANG TTB AKAN/TELAH MELEBIHI BATAS WAKTU YANG DITENTUKAN !!\n\n${tele_pesan.trim()}\n\nMOHON SEGERA LAKUKAN PROSES STOK OPNAME`;

  return {
    wa_pesan,
    tele_pesan,
  };
};

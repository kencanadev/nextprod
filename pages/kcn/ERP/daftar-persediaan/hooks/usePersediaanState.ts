import axios from 'axios';
import { useEffect, useState } from 'react';
import swal from 'sweetalert2';

type usePersediaanStateType = {
  kode_entitas: string;
  token: string;
  statusPage: string;
};

export const usePersediaanState = ({ kode_entitas, token, statusPage }: usePersediaanStateType) => {
  const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
  // Master Data State
  const [masterData, setMasterData] = useState({
    entitas: '',
    no_item: '',
    nama_item: '',
    tipe: '',
    satuan: '',
    harga1: '',
    harga2: '',
    diskon: '',
    potongan: '',
    kode_pajak: '',
    grp: '',
    tebal: '',
    panjang: '',
    berat: '',
    minimal: '',
    maksimal: '',
    reorder: '',
    hpp: '',
    kode_akun_persediaan: '',
    kode_akun_jual: '',
    kode_akun_returjual: '',
    kode_akun_diskonitem: '',
    kode_akun_hpp: '',
    kode_akun_returbeli: '',
    kustom4: '',
    kustom5: '',
    kustom6: '',
    kustom7: '',
    kustom8: '',
    kustom9: '',
    kustom10: '',
    status: '',
    userid: '',
    rating: '',
    estimasipo: '',
    nama_grp: '',
    ppn_kontrak: '',
    berat_tabel: '',
    berat_kontrak: '',
    berat_01: '',
    berat_02: '',
    status_item: '',
    kali_harga: '',
    catatan: [],
    paket: [],
    alternatif: [],
    diskonPos: [],
    satuan2: '',
    std2: '',
    konversi2: '',
    satuan3: '',
    std3: '',
    konversi3: '',
    harga3: '',
    harga4: '',
    harga5: '',
    lebar: '',
    liter: '',
    kode_supp: '',
    kode_akun_biaya: '',
    kustom1: '',
    kustom2: '',
    kustom3: '',
    keterangan: '',
    gambar: '',
    tgl_update: '',
    margin: '',
    ambil1: '',
    ambil2: '',
    min_qty: '',
    pot_qty: '',
    potkg_qty: '',
    bunga: '',
    min_tunai: '',
    min_kredit: '',
    konsinyasi: '',
    franco: '',
    tempo_supp: '',
    buffer_in: '',
    buffer_out: '',
    buffer_pab: '',
    minimal_out: '',
    minimal_pab: '',
    bufmax_in: '',
    bufmax_out: '',
    bufmax_pab: '',
    maksimal_out: '',
    maksimal_pab: '',
    min_qty2: '',
    pot_qty2: '',
    potkg_qty2: '',
    berlaku_ms: '',
    marginonly: '',
    nama_cetak: '',
    hari_kirim: '',
    stokstd_in: '',
    stokstd_pab: '',
    harga_kontrak: '',
    rumus_berat: '',
    minto1: '',
    mami1: '',
    minto2: '',
    mami2: '',
    minto3: '',
    mami3: '',
    tgl_hms: '',
    userid_hms: '',
  });

  const updateState = (field: any, value: any) => {
    setMasterData((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Grup Barang State
  const [showDialogGrp, setShowDialogGrp] = useState(false);
  const [listGrpBarang, setListGrpBarang] = useState([]);
  const [filteredGrpBarang, setFilteredGrpBarang] = useState([]);
  const [selectedGrpBarang, setSelectedGrpBarang] = useState('');
  const [searchGrpBarang, setSearchGrpBarang] = useState('');

  // Functions Grup Barang
  const fetchGrpBarang = async () => {
    try {
      const res = await axios.get(`${apiUrl}/erp/master_grup_barang`, {
        params: {
          entitas: kode_entitas,
          param1: 'all',
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setListGrpBarang(res.data.data);
    } catch (error) {
      console.error(`Error fetching Grup Barang: ${error}`);
    }
  };

  const handlePilihGrpBarang = () => {
    setShowDialogGrp(false);

    // Ubah state masterData sesuai dengan grup barang yang dipilih
    updateState('grp', selectedGrpBarang);
  };

  const handleSearchGrpBarang = (keyword: string, field: string) => {
    if (keyword === '') {
      return listGrpBarang;
    } else {
      const filteredData = listGrpBarang.filter((item: any) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  const pencarianBarang = (event: any, field: string) => {
    const searchValue = event;
    if (field === 'grp') {
      setSearchGrpBarang(searchValue);
    }

    const filteredData = handleSearchGrpBarang(searchValue, field);
    setFilteredGrpBarang(filteredData);
  };

  const handleShowDialogGrp = () => setShowDialogGrp((prev) => !prev);

  useEffect(() => {
    fetchGrpBarang();
  }, []);

  // Functions Generate No Barang
  const generateNoItem = async () => {
    if (masterData.grp === '') {
      swal.fire({
        title: 'Kategori harus diisi!',
        icon: 'error',
        target: '#dialogFrmPersediaan',
      });
      return;
    }

    if (masterData.kustom10 === '') {
      swal.fire({
        title: 'Kelompok harus diisi!',
        icon: 'error',
        target: '#dialogFrmPersediaan',
      });
      return;
    }

    try {
      const res = await axios.get(`${apiUrl}/erp/generate_no_barang`, {
        params: {
          entitas: kode_entitas,
          param1: masterData.grp,
          param2: masterData.kustom10,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statusPage === 'UBAH') {
        swal
          .fire({
            icon: 'warning',
            title: 'Apakah akan membuat No. Barang baru?',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
            target: '#dialogFrmPersediaan',
          })
          .then((result) => {
            if (!result.isConfirmed) {
              return;
            }
          });
      }

      const noItem = res.data.data;
      updateState('no_item', noItem);
    } catch (error) {
      console.error('Error generate no barang: ', error);
      swal.fire({
        icon: 'error',
        title: 'Error generate no barang',
        target: '#dialogFrmPersediaan',
      });
    }
  };

  return {
    masterData,
    setMasterData,
    updateState,
    showDialogGrp,
    filteredGrpBarang,
    listGrpBarang,
    handleShowDialogGrp,
    handlePilihGrpBarang,
    pencarianBarang,
    searchGrpBarang,
    setSelectedGrpBarang,
    setShowDialogGrp,
    generateNoItem,
  };
};

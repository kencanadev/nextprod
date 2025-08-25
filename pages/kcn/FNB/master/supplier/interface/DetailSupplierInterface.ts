interface SupplierMaster {
    kode_supp: string;
    kode_relasi: string;
    no_supp: string;
    aktif: string;
    tgl_supp: string;
    kode_akun_hutang: string;
    kode_termin: string;
    kode_mu: string;
    tipe: string;
    diskon_def: any | string;
    kode_pajak: string;
    tipe_pajak: string;
    catatan: any | string;
    userid: string;
    tgl_update: string;
    kode_akun_beban: any | string;
    beban_dikirim: number;
    beban_diambil: number;
    plafond: string;
    kode_gudang: string;
    alias_nama: string;
    alias_alamat: string;
    alias_alamat2: any | string;
    singkat: string;
    kelas: string;
    jenis_pabrik: string;
    kelas_barang: string;
    nama_relasi: string;
    alamat: string;
    alamat2: string;
    kodepos: string;
    kota: string;
    propinsi: string;
    negara: string;
    npwp: string;
    siup: string;
    personal: string;
    ktp: string;
    sim: string;
    telp: string;
    telp2: string;
    hp: any | string;
    hp2: string;
    fax: string;
    email: any | string;
    website: any | string;
    nama_termin: string;
    hutang_supplier: string;
    hutang_Bg: number;
    sp_outstanding: number;
    st: string;
    sisa: number;
  }
  
  interface SupplierRekening {
    kode_supp: string;
    nama_bank: string;
    no_rekening: string;
    nama_rekening: string;
    pkp: string;
    aktif: string;
    tgl_update: string;
    userid: string;
  }
  
  interface SupplierData {
    master: SupplierMaster;
    rekening: SupplierRekening[] | any;
    barang: any;
  }
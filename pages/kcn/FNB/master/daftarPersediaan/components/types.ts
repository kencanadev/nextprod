// types.ts
import { RefObject } from 'react';

export interface StyleButton {
  width: string;
  height: string;
  marginBottom: string;
  marginTop: string;
  marginRight: string;
  backgroundColor: string;
}

export interface InventoryManagementProps {
  panelVisible: boolean;
  handleBaruClick: () => void;
  showEditRecord: () => void;
  handleFilterClick: () => void;
  searchNoPersediaan: string;
  searchNamaPersediaan: string;
  handleChangeSearchNoPersediaan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeSearchNamaPersediaan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearchNoPersediaan: () => void;
  handleClearSearchNamaPersediaan: () => void;
  noPersediaanRef: RefObject<HTMLInputElement>;
  namaPersediaanRef: RefObject<HTMLInputElement>;
  setDialogStatusPersediaan: any;
  setDialogKartuStok: any;
  setDialogLabelBarcode: any;
  selectedId: any;
}

export interface ActionButtonsProps {
  handleBaruClick: () => void;
  showEditRecord: () => void;
  handleFilterClick: () => void;
  panelVisible: boolean;
  styleButton: StyleButton;
}

export interface SearchInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

export interface SearchInputsProps {
  searchNoPersediaan: string;
  searchNamaPersediaan: string;
  handleChangeSearchNoPersediaan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeSearchNamaPersediaan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSearchNoPersediaan: () => void;
  handleClearSearchNamaPersediaan: () => void;
  noPersediaanRef: RefObject<HTMLInputElement>;
  namaPersediaanRef: RefObject<HTMLInputElement>;
}

export interface AdditionalButtonProps {
  id: string;
  text: string;
  onClick: () => void;
  disabled: boolean;
}

export interface IDialogProps {
  isOpen?: boolean;
  onClose?: any;
  masterState?: string;
  token?: any;
  entitas?: any;
  userid?: string;
  itemId?: string;
}

export interface SelectedItem {
  no_item: string;
  nama_item: string;
  nama_grp: string;
  satuan: string;
  kuantitas: number;
}

export interface AlternatifSelectedItem {
  no_item: string;
  nama_item: string;
}

export interface IFilterFormState {
  noBarangValue: string;
  isNoBarangChecked: boolean;
  namaBarang: string;
  isNamaBarangChecked: boolean;
  grupBarang: string;
  isGrupBarangChecked: boolean;
  noBarangSupplier: string;
  isNoBarangSupplierChecked: boolean;
  namaBarangSupplier: string;
  isNamaBarangSupplierChecked: boolean;
  kategori: string;
  isKategoriChecked: boolean;
  kelompokProduk: string;
  isKelompokProdukChecked: boolean;
  merekProduk: string;
  isMerekProdukChecked: boolean;
  tipe: string;
  isTipeChecked: boolean;
  searchNoPersediaan: string;
  searchNamaPersediaan: string;
  aktivasiState: string;
  statusState: string;
  paketProdukState: string;
  barangKonsinyasiState: string;
  dataEksportState: string;
  barangKontrakState: string;
}

export interface IInventoryFormState {
  tipe: string;
  status: string;
  kode_item: string;
  no_item: string;
  status_item: string;
  nama_item: string;
  no_barang_barcode: string;
  nama_supplier: string;
  // Informasi Persediaan
  grp: string; // kategori
  satuan: string;
  kustom10: string; // kelompok
  kustom4: string; // merk
  nama_grp: string;
  harga1: string; // harga_penjualan
  diskon: string;
  potongan: string;
  kode_pajak: string; // pajak
  deskripsi: string;
  minimal: string;
  maksimal: string;
  reorder: string;
  estimasipo: string;
  harga2: string; // harga pembelian
  diskon_pembelian: string;
  hpp: string;
  rating: string; // Prioritas stok
  // Data Tambahan
  kustom9: string; // jenis produk
  kustom8: string; // gabungan
  kustom7: string; // klasifikasi
  kustom6: string; // warna
  kustom5: string; // motif
  // Data Akun
  no_akun_persediaan: string;
  nama_akun_persediaan: string;
  no_akun_jual: string;
  nama_akun_jual: string;
  no_akun_returjual: string;
  nama_akun_returjual: string;
  no_akun_diskonitem: string;
  nama_akun_diskonitem: string;
  no_akun_hpp: string;
  nama_akun_hpp: string;
  no_akun_returbeli: string;
  nama_akun_returbeli: string;
  // Perhitungan Rumus
  tebal: string; // diameter
  berat: string; // massa
  panjang: string;
  berat_tabel: string;
  berat_kontrak: string;
  berat1: string; // toleransi 1
  berat2: string; // toleransi 2
  kali_harga: string;
  ppn_kontrak: string;
  rumus: string;
  // catatan
  tgl: string;
  catatan: string;
  // Paket Produk
  id_item: string;
  kode_itempak: string;
  satuan_paket: string;
  qty: string;
  // alternatif produk
  id_item_alt: string;
  kode_itemalt: string;
}

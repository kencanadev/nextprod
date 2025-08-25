'use client';
import React, { useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import Swal from 'sweetalert2';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import styles from '../daftarRelasi.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
const hubunganKepemilikanArray = [
    {
        name: 'Anggota Keluarga Pemilik',
    },
    {
        name: 'Manager Keuangan',
    },
    {
        name: 'Manager Pembelian',
    },
    {
        name: 'Admin Keuangan',
    },
    {
        name: 'Admin Pembelian',
    },
    {
        name: 'karyawan Toko',
    },
    {
        name: 'Lainnya',
    },
];
const jabatanArray = [
    {
        name: 'Pemilik',
    },
    {
        name: 'Suami / Istri Pemilik',
    },
    {
        name: 'Anak Pemilik',
    },
    {
        name: 'Orang Tua Pemilik',
    },
    {
        name: 'Saudara Lain',
    },
    {
        name: 'Orang Lain (Tidak Memiliki Hub dengan Pemilik',
    },
    {
        name: 'Lainnya',
    },
];
export default function GridKontak({ gridKontak, masterDataState, kode_dokumen = '' }: { gridKontak: any; masterDataState: any; kode_dokumen: any }) {
    const [selectedRowIndexRekeningbarang, setSelectedRowIndexRekeningbarang] = useState(0);
    const [dsBarang, setDsBarang] = useState([]);
    const [visibleSales, setVisibleSales] = useState(false);
    const [dataTerpilih, setDataTerpilih] = useState<any>({});
    const [editMode, setEditMode] = useState(false);

    const swalToast = Swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 2000,
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
    const rowSelectingRekeningbarang = (args: any) => {
        setSelectedRowIndexRekeningbarang(args.rowIndex);
    };

    const handleRekening_EndEdit = async () => {
        gridKontak.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = gridKontak.current.dataSource?.length;
        const lastIndex = gridKontak.current.dataSource[gridKontak.current.dataSource?.length - 1]?.id_relasi;
        console.log('lastIndex', lastIndex);

        const isNotEmptyNamabarang = gridKontak.current.dataSource?.every((item: any) => item.id_supp !== '');
        const isNotEmptyNoRekening = gridKontak.current.dataSource?.every((item: any) => item.kode_jenis !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoRekening)) {
                const newObject = {
                    id_relasi: lastIndex !== undefined ? lastIndex + 1 : 1,
                    kode_relasi: masterDataState === 'BARU' ? '' : kode_dokumen,
                    nama_sales: '',
                    nama_lengkap: '',
                    nama_person: '',
                    jab: '',
                    hubungan: '',
                    bisnis: '',
                    bisnis2: '',
                    telp: '',
                    hp: '',
                    hp2: '',
                    fax: '',
                    email: '',
                    catatan: '',
                    file_kuasa: '',
                    file_ktp: '',
                    file_ttd: '',
                    aktif_kontak: 'Y',
                };
                gridKontak.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    setDataTerpilih(newObject);
                    setVisibleSales(true);
                }, 300);
                // setTimeout(() => {
                //     gridKontak.current!.startEdit();
                // }, 200);
            } else {
                document.getElementById('gridKontak')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data rekening sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#DialogRelasi',
                });
            }
        }
    };
    const deleteRekeningbarang = async () => {
        const selectedListData: any = gridKontak.current!.getSelectedRecords();
        console.log('selectedListData', selectedListData);

        if (selectedListData.length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Produk ${selectedRowIndexRekeningbarang + 1}</p>`,
                    target: '#DialogRelasi',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        // gridKontak.current!.deleteRecord(selectedListData);
                        // setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        // setTimeout(() => {
                        //     gridKontak.current!.refresh();
                        // }, 200);
                        const data = gridKontak.current?.dataSource;
                        let updatedData = data.filter((item: any) => item.id_relasi !== selectedListData[0].id_relasi); // Filter data yang ingin dihapus
                        updatedData = updatedData.map((item: any) => {
                            if (item.id_relasi > selectedListData[0].id_relasi) {
                                return { ...item, id_relasi: item.id_relasi - 1 }; // Kurangi id dengan 1 untuk item setelah id yang dihapus
                            }
                            return item;
                        });
                        gridKontak.current!.dataSource = updatedData;
                        gridKontak.current?.refresh();
                        // setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        setTimeout(() => {
                            gridKontak.current!.refresh();
                        }, 200);
                    }
                });
        } else {
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Pilih Data Rekening Terlebih Dulu</p>`,
                target: '#DialogRelasi',
            });
        }
    };
    const deleteAllRekeningbarang = () => {
        if (Array.isArray(gridKontak.current!.dataSource)) {
            if ((gridKontak.current!.dataSource as any[]).length > 0) {
                withReactContent(Swal)
                    .fire({
                        html: 'Hapus semua data?',
                        width: '15%',
                        target: '#DialogRelasi',
                        showCancelButton: true,
                        confirmButtonText: '<p style="font-size:10px">Ya</p>',
                        cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                    })
                    .then((result) => {
                        if (result.isConfirmed) {
                            (gridKontak.current!.dataSource as any[]).splice(0, (gridKontak.current!.dataSource as any[]).length);

                            gridKontak.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };

    const handleInputChange = (event: any) => {
        const target = event.target || event.currentTarget;
        const { name, type, checked, value } = target;
        const newValue = type === 'checkbox' ? (checked ? 'N' : 'Y') : value;
        setDataTerpilih((oldData: any) => ({ ...oldData, [name]: newValue }));
    };

    const simpanHandle = () => {
        gridKontak.current!.dataSource[dataTerpilih?.id_relasi - 1] = dataTerpilih;
        gridKontak.current!.refresh();
        setVisibleSales(false);
    };

    const batalHandle = () => {
        if (editMode === true) {
            setDataTerpilih({});
            setVisibleSales(false);
            setEditMode(false);
            return;
        }
        const data = gridKontak.current?.dataSource;
        let updatedData = data.filter((item: any) => item.id_relasi !== dataTerpilih.id_relasi); // Filter data yang ingin dihapus
        updatedData = updatedData.map((item: any) => {
            if (item.id_relasi > dataTerpilih.id_relasi) {
                return { ...item, id_relasi: item.id_relasi - 1 }; // Kurangi id dengan 1 untuk item setelah id yang dihapus
            }
            return item;
        });
        gridKontak.current!.dataSource = updatedData;
        gridKontak.current?.refresh();

        setDataTerpilih({});
        setVisibleSales(false);
    };

    const handleEdit = () => {
        const data = gridKontak.current?.dataSource[selectedRowIndexRekeningbarang];
        console.log('data', data);

        setTimeout(() => {
            setDataTerpilih(data);
            setEditMode(true);
            setVisibleSales(true);
        }, 300);
    };

    return (
        <>
            <style>
                {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;
                    }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
            </style>
            <GridComponent
                id="gridKontak"
                name="gridKontak"
                className="gridKontak"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                width={'100%'}
                autoFit={true}
                dataSource={dsBarang}
                ref={gridKontak}
                height={170} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    newRowPosition: 'Bottom',
                }}
                allowKeyboard={false}
                rowSelecting={rowSelectingRekeningbarang}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="id_relasi"
                        isPrimaryKey={true}
                        headerText="ID"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        allowEditing={false}
                        width={50}
                        visible={true}
                    />
                    <ColumnDirective field="nama_lengkap" headerText="Nama Lengkap" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="jab" headerText="Jabatan" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="hubungan" headerText="Hubungan Kepemilikan" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="bisnis" headerText="Telp. Kantor" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="hp2" headerText="WhatsApp" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>

                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
            </GridComponent>
            <div className="mt-3 flex items-center justify-start gap-3">
                <ButtonComponent
                    id="buAddRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-primary e-small"
                    iconCss="e-icons e-small e-plus"
                    onClick={() => addRekeningCustomer('new')}
                />
                <ButtonComponent
                    id="buSingleDeleteRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-info e-small"
                    iconCss="e-icons e-small e-edit"
                    onClick={handleEdit}
                />
                <ButtonComponent
                    id="buSingleDeleteRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-warning e-small"
                    iconCss="e-icons e-small e-trash"
                    onClick={() => deleteRekeningbarang()}
                />
                <ButtonComponent
                    id="buDeleteAllRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-danger e-small"
                    iconCss="e-icons e-small e-erase"
                    onClick={() => deleteAllRekeningbarang()}
                />
            </div>

            {visibleSales && (
                <DialogComponent
                    id="dialogKontakRelasi"
                    name="dialogKontakRelasi"
                    target="#DialogRelasi"
                    style={{ position: 'fixed' }}
                    header={'Kontak Relasi'}
                    visible={visibleSales}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    //enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="500"
                    height="500"
                    // buttons={buttonKontakRelasi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setVisibleSales(false);
                    }}
                    closeOnEscape={true}
                    open={() => {}}
                >
                    <div className="flex h-full w-full flex-col">
                        <div className="h-[90%] w-full overflow-y-auto">
                            <table className={`${styles.table}`} style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '100%' }}>Nama Lengkap</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <TextBoxComponent placeholder="Nama Lengkap" name="nama_lengkap" value={dataTerpilih?.nama_lengkap} onChange={handleInputChange} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className={`${styles.table} border-b`} style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60%' }}>Panggilan</th>
                                        <th style={{ width: '40%' }}>Non Aktif</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <TextBoxComponent placeholder="Panggilan" name="nama_person" value={dataTerpilih?.nama_person} onChange={handleInputChange} />
                                        </td>
                                        <td>
                                            <CheckBoxComponent
                                                // label="Aktif Kontak"
                                                checked={dataTerpilih?.aktif_kontak === 'N'}
                                                value={dataTerpilih?.aktif_kontak}
                                                onChange={handleInputChange}
                                                name="aktif_kontak"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-3">
                                <div className="gap-6">
                                    <div className="mb-3 sm:col-span-2">
                                        <label htmlFor="kota" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                            Jabatan
                                        </label>
                                        <select
                                            value={dataTerpilih?.jab} // Menetapkan nilai default
                                            name="jab"
                                            onChange={handleInputChange}
                                            className=" block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        >
                                            <option value="" disabled selected={!dataTerpilih?.jab}>
                                                {dataTerpilih?.jab === null ? '-- Belum Memilih Jabatan --' : '-- Pilih Jabatan --'}
                                            </option>
                                            {jabatanArray.map((jab, index) => (
                                                <option key={(jab.name, +index + 1)} value={jab.name}>
                                                    {jab.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3 sm:col-span-2">
                                        <label htmlFor="kota" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                            Hubungan Kepemilikan
                                        </label>
                                        <select
                                            value={dataTerpilih?.hubungan} // Menetapkan nilai default
                                            name="hubungan"
                                            onChange={handleInputChange}
                                            className=" block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        >
                                            <option value="" disabled selected={!dataTerpilih?.hubungan}>
                                                {dataTerpilih?.hubungan === null ? '-- Belum Memilih Hubungan --' : '-- Pilih Hubungan --'}
                                            </option>
                                            {hubunganKepemilikanArray.map((hubungan, index) => (
                                                <option key={(hubungan.name, +index + 1)} value={hubungan.name}>
                                                    {hubungan.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mt-3 grid w-full grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="bisnis" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Telp. Kantor 1
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="bisnis"
                                                    id="bisnis"
                                                    value={dataTerpilih?.bisnis}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="bisnis2" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Telp. Kantor 2
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="bisnis2"
                                                    id="bisnis2"
                                                    value={dataTerpilih?.bisnis2}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="telp" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Telp. Rumah
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="telp"
                                                    id="telp"
                                                    value={dataTerpilih?.telp}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="hp" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Handphone
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="hp"
                                                    id="hp"
                                                    value={dataTerpilih?.hp}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="hp2" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    WhatsApp
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="hp2"
                                                    id="hp2"
                                                    value={dataTerpilih?.hp2}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                            <div className="mb-3 w-full">
                                                <label htmlFor="fax" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                                    Facimile
                                                </label>
                                                <input
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                    }}
                                                    name="fax"
                                                    id="fax"
                                                    value={dataTerpilih?.fax}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                    placeholder="Cth: 1234567890123456"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3 sm:col-span-2">
                                        <label htmlFor="email" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={dataTerpilih?.email}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Cth: 1234567890123456"
                                        />
                                    </div>
                                    <div className="mb-3 sm:col-span-2">
                                        <label htmlFor="catatan" className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">
                                            Catatan
                                        </label>
                                        <input
                                            type="catatan"
                                            name="catatan"
                                            id="catatan"
                                            value={dataTerpilih?.catatan}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Cth: Relasi Luar pulau"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex h-[10%] w-full justify-end gap-2">
                            <button
                                className="box-border h-[28px] w-[100px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={simpanHandle}
                            >
                                <u>S</u>impan
                            </button>
                            <button
                                className="box-border h-[28px] w-[100px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={batalHandle}
                            >
                                Ba<u>t</u>al
                            </button>
                        </div>
                    </div>
                </DialogComponent>
            )}
        </>
    );
}

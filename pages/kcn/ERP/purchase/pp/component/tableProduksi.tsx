import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getServerSideProps } from '@/pages/api/getServerSide';
import ItemDlg from '.././modal/itemdlg';
import { useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { number } from 'yup';

interface TableBarangProduksiDlgProps {
    userid: any;
    kode_entitas: any;
    dataApi: any;
    handleUpdate: any;
    handleselectcell: any;
    nilaiValueNoItem: any;
    nilaiValueNamaItem: any;
    handleModalItemChange: any;
    nilaiTotalId: any;
    tipeValue: any;
    handleModalItem: any;
}
const TableBarangProduksi = ({
    dataApi,
    handleUpdate,
    handleselectcell,
    userid,
    kode_entitas,
    nilaiValueNoItem,
    nilaiValueNamaItem,
    handleModalItemChange,
    nilaiTotalId,
    tipeValue,
    handleModalItem,
}: TableBarangProduksiDlgProps) => {
    const [modalItemDlg, setModalItemDlg] = useState(false);
    const [Barangkode_itemSelected, setBarangkode_itemSelected] = useState();
    const [Barangno_itemSelected, setBarangno_itemSelected] = useState();
    const [Barangnama_itemSelected, setBarangnama_itemSelected] = useState();
    const [BarangsatuanSelected, setBarangsatuanSelected] = useState();
    const [BarangbrtSelected, setBarangbrtSelected] = useState();
    const [Barangfpp_diameterSelected, setBarangfpp_diameterSelected] = useState();
    const [Barangfpp_kgSelected, setBarangfpp_kgSelected] = useState();
    const [BarangpanjangSelected, setBarangpanjangSelected] = useState();

    const handleSelectedData = (
        id_pp: any,
        selectedkode_item: any,
        selectedno_item: any,
        selectednama_item: any,
        selectedsatuan: any,
        selectedberat: any,
        selectedfpp_diameter: any,
        selectedfpp_kg: any,
        selectedpanjang: any
    ) => {
        setBarangkode_itemSelected(selectedkode_item);
        setBarangno_itemSelected(selectedno_item);
        setBarangnama_itemSelected(selectednama_item);
        setBarangsatuanSelected(selectedsatuan);
        setBarangbrtSelected(selectedberat);
        setBarangfpp_diameterSelected(selectedfpp_diameter);
        setBarangfpp_kgSelected(selectedfpp_kg);
        setBarangpanjangSelected(selectedpanjang);
        //  console.log(selectedfpp_kg,'kkkkkkkk');

        handleUpdate(selectedno_item, id_pp, 'no_item', selectedberat, selectedsatuan, selectedkode_item, '', selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
        handleUpdate(selectednama_item, id_pp, 'diskripsi', selectedberat, selectedsatuan, selectedkode_item, '', selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
    };

    const handleFocus = (event: any) => event.target.select();

    const formatCurrency = (value: any) => {
        // Menghapus semua karakter selain digit
        // const cleanedValue = value.replace(/[^\d]/g, '');
        const cleanedValue = value.replace(/[^0-9.]/g, '');

        // Mengonversi nilai ke dalam format angka dengan koma sebagai pemisah ribuan
        //const formattedValue = new Intl.NumberFormat('id-ID').format(cleanedValue);
        const formattedValue = parseFloat(cleanedValue).toLocaleString('en-US', {
            minimumFractionDigits: 2,
        });

        // Mengganti titik dengan koma
        // const finalValue = formattedValue.replace(/\./g, ',');

        // return finalValue;

        return cleanedValue;
    };

    // const formatCurrency= (num:any, decimals:any) => num.toLocaleString('en-US', {
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    //   });

    const themeProduksi = useTheme({
        Header: `
        .th {
          border-bottom: 1px solid #a0a8ae;
        }
      `,
        Row: `
      &:nth-of-type(odd) {
        background-color: #f9fafb;
      }
      &:nth-of-type(even) {
        background-color: white;
      }
      &:not(:last-of-type) .td {
        border-bottom: 1px solid #a0a8ae;
      }
    `,
        BaseCell: `
        &:not(:last-of-type) {
          border-right: 1px solid #a0a8ae;
        }
        &:hover, &:focus {
            outline: solid;
            outline-width: 1px;
            outline-offset: -1px;
          }
      `,
        Table: `
    --data-table-library_grid-template-columns: 10% 25% 6% 6% 6% 6% 6% 6% 6% 8% 8% minmax(130px, 1fr);
    `,
    });

    return (
        <Table data={dataApi} theme={themeProduksi} layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}>
            {(tableList: any[]) => (
                <>
                    <Header>
                        <HeaderRow style={{ userSelect: 'none' }}>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">No. Barang</div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">Keterangan</div>
                            </HeaderCell>

                            <HeaderCell
                                gridColumnStart={3}
                                gridColumnEnd={10}
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: '#0c0c0c',
                                    color: 'white',
                                }}
                            >
                                Estimasi Produksi <br />
                                <hr />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Berat(Kg)
                                    </div>

                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Diameter
                                    </div>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Jarak/Cm
                                    </div>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Berat/Btg
                                    </div>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Harga/Kg
                                    </div>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Perkiraan Qty
                                    </div>
                                    <div style={{ userSelect: 'none' }} className="flex">
                                        Harga/Btg
                                    </div>
                                </div>
                            </HeaderCell>

                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">Satuan</div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">Kuantitas</div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">Berat (Kg)</div>
                            </HeaderCell>
                        </HeaderRow>
                    </Header>

                    <Body>
                        {tableList.map((item: any) => (
                            <Row key={item.id_pp} item={item}>
                                <Cell
                                    onClick={() => {
                                        handleselectcell(item.id_pp);
                                    }}
                                >
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            // defaultValue={item.no_item}
                                            value={item.no_item}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'tipeNoItem', item.id_pp)}
                                            onFocus={handleFocus}
                                            onKeyDown={() => {
                                                setModalItemDlg(true);
                                            }}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalItem('tipeNoItem', item.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell
                                    onClick={() => {
                                        handleselectcell(item.id_pp);
                                    }}
                                >
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            // defaultValue={item.diskripsi}
                                            value={item.diskripsi}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'tipeNamaItem', item.id_pp)}
                                            onFocus={handleFocus}
                                            onKeyDown={() => {
                                                setModalItemDlg(true);
                                            }}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalItem('tipeNamaItem', item.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>

                                <>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_qty${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                className="text-right"
                                                defaultValue={item.fpp_qty}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_qty',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_diameter${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                className="text-right"
                                                defaultValue={item.fpp_diameter}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_diameter',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_jarak${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                className="text-right"
                                                defaultValue={item.fpp_jarak}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_jarak',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_kg${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                className="text-right"
                                                defaultValue={item.fpp_kg}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_kg',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_harga_kg${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                className="text-right"
                                                defaultValue={item.fpp_harga_kg}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_harga_kg',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                id={`id_fpp_btg${item.id_pp}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                defaultValue={item.fpp_btg}
                                                onFocus={handleFocus}
                                                className="text-right"
                                                // {parseFloat(item.fpp_btg).toLocaleString('en-US', {
                                                //     minimumFractionDigits: 0,
                                                //  })}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_btg',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell
                                        onClick={() => {
                                            handleselectcell(item.id_pp);
                                        }}
                                    >
                                        <div className="flex">
                                            <input
                                                disabled
                                                id={`id_fpp_harga_btg${item.id_pp}`}
                                                type="text"
                                                className="text-right"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                defaultValue={item.fpp_harga_btg}
                                                onFocus={handleFocus}
                                                onBlur={(event) =>
                                                    handleUpdate(
                                                        event.target.value,
                                                        item.id_pp,
                                                        'fpp_harga_btg',
                                                        item.brt,
                                                        item.satuan,
                                                        item.kode_item,
                                                        '',
                                                        item.fpp_diameter,
                                                        item.fpp_kg,
                                                        item.panjang,
                                                        item.fpp_harga_kg,
                                                        item.fpp_qty
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Cell>
                                </>
                                <Cell
                                    onClick={() => {
                                        handleselectcell(item.id_pp);
                                    }}
                                >
                                    <div className="flex">
                                        <input
                                            disabled
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.satuan}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'satuan')}
                                        />
                                    </div>
                                </Cell>
                                <Cell
                                    onClick={() => {
                                        handleselectcell(item.id_pp);
                                    }}
                                >
                                    <div className="flex">
                                        <input
                                            type="text"
                                            id={`id_qty${item.id_pp}`}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            className="text-right"
                                            defaultValue={item.qty}
                                            onFocus={handleFocus}
                                            onBlur={(event) =>
                                                handleUpdate(
                                                    event.target.value,
                                                    item.id_pp,
                                                    'qty',
                                                    item.brt,
                                                    item.satuan,
                                                    item.kode_item,
                                                    '',
                                                    item.fpp_diameter,
                                                    item.fpp_kg,
                                                    item.panjang,
                                                    item.fpp_harga_kg,
                                                    item.fpp_qty
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                const char = event.key;
                                                const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                if (!isValidChar) {
                                                    event.preventDefault();
                                                }
                                                const inputValue = (event.target as HTMLInputElement).value;
                                                if (char === '.' && inputValue.includes('.')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                </Cell>
                                <Cell
                                    onClick={() => {
                                        handleselectcell(item.id_pp);
                                    }}
                                >
                                    <div className="flex">
                                        <input
                                            disabled
                                            id={`id_berat${item.id_pp}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            className="text-right"
                                            defaultValue={item.berat}
                                            onFocus={handleFocus}
                                            // {parseFloat(item.berat).toLocaleString('en-US', {
                                            //     minimumFractionDigits: 2,
                                            // })}
                                            onBlur={(event) =>
                                                handleUpdate(
                                                    event.target.value,
                                                    item.id_pp,
                                                    'berat',
                                                    item.brt,
                                                    item.satuan,
                                                    item.kode_item,
                                                    '',
                                                    item.fpp_diameter,
                                                    item.fpp_kg,
                                                    item.panjang,
                                                    item.fpp_harga_kg,
                                                    item.fpp_qty
                                                )
                                            }
                                        />
                                    </div>
                                </Cell>
                            </Row>
                        ))}
                    </Body>
                </>
            )}
        </Table>
    );
};

export { getServerSideProps };
export default TableBarangProduksi;
function setDataDetail(arg0: (state: any) => any) {
    throw new Error('Function not implemented.');
}

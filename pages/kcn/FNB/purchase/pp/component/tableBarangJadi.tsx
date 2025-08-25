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
import { useRowSelect, HeaderCellSelect, CellSelect } from '@table-library/react-table-library/select';

interface TableBarangJadiDlgProps {
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
    jenisFilterBarang: any;
}

const TableBarangJadi = ({
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
    jenisFilterBarang,
}: TableBarangJadiDlgProps) => {
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

        handleUpdate(selectedno_item, id_pp, 'no_item', selectedberat, selectedsatuan, selectedkode_item, '', selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
        handleUpdate(selectednama_item, id_pp, 'diskripsi', selectedberat, selectedsatuan, selectedkode_item, '', selectedfpp_diameter, selectedfpp_kg, selectedpanjang);
    };

    const handleFocus = (event: any) => event.target.select();
    console.log('jenisFilterBarang 12 = ', jenisFilterBarang);

    const themeBarangjadi = useTheme({
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
          --data-table-library_grid-template-columns: 22% 40% 10% 15%  minmax(120px, 1fr);
        `,
    });

    const formatCurrency = (value: any) => {
        // Menghapus semua karakter selain digit
        const cleanedValue = value.replace(/[^\d]/g, '');

        // Mengonversi nilai ke dalam format angka dengan koma sebagai pemisah ribuan
        const formattedValue = new Intl.NumberFormat('id-ID').format(cleanedValue);

        // Mengganti titik dengan koma
        const finalValue = formattedValue.replace(/\./g, ',');

        return finalValue;
    };

    return (
        <Table data={dataApi} theme={themeBarangjadi} layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}>
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
                            <HeaderCell
                                hide
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex">id_pp</div>
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
                                            // defaultValue={
                                            //     //{Barangno_itemSelected}
                                            //     item.no_item
                                            // }
                                            value={item.no_item}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'tipeNoItem', item.id_pp, jenisFilterBarang)}
                                            // onChange={(event) => handleUpdate(event.target.value, item.id_pp, 'no_item',  BarangbrtSelected,item.satuan,item.kode_item,'tipeNoItem',)}
                                            onFocus={handleFocus}
                                            onKeyDown={() => {
                                                setModalItemDlg(true);
                                            }}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    //  setModalItemDlgNo(true);
                                                    handleModalItem('tipeNoItem', item.id, jenisFilterBarang);
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
                                            //defaultValue={item.diskripsi}
                                            value={item.diskripsi}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'tipeNamaItem', item.id_pp, jenisFilterBarang)}
                                            onFocus={handleFocus}
                                            onKeyDown={() => {
                                                setModalItemDlg(true);
                                            }}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    // setModalItemDlg(true);
                                                    handleModalItem('tipeNamaItem', item.id, jenisFilterBarang);
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
                                            disabled={true}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.satuan}
                                            onFocus={handleFocus}
                                            //{BarangsatuanSelected}

                                            //onChange={(event) => handleUpdate(event.target.value, item.id_pp, 'satuan', BarangbrtSelected,item.satuan,item.kode_item,'')}
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
                                            id={`id_qty${item.id_pp}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.qty}
                                            className="text-right"
                                            onBlur={(event) => handleUpdate(event.target.value, item.id_pp, 'qty', item.brt, item.satuan, item.kode_item, '')}
                                            onFocus={handleFocus}
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
                                            type="text"
                                            disabled={true}
                                            id={`id_berat${item.id_pp}`}
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
                                            // value={parseFloat(item.berat).toLocaleString('en-US', {
                                            //     minimumFractionDigits: 2,
                                            // })}
                                        />
                                    </div>
                                </Cell>
                                <Cell hide>
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
                                            className="text-right"
                                            defaultValue={item.brt}
                                            onFocus={handleFocus}
                                            //value={BarangbrtSelected}
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
export default TableBarangJadi;
function setDataDetail(arg0: (state: any) => any) {
    throw new Error('Function not implemented.');
}

import React, { useEffect, useRef, useState } from 'react';
import DialogListBarang from '../dialog/DialogListBarang';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Sort, Filter, Toolbar, Edit, Resize, CommandColumn } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, ChangeEventArgs } from '@syncfusion/ej2-react-buttons';
import { DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import axios from 'axios';
import swal from 'sweetalert2';

interface AlternatifProdukPersediaanProps {
  selectedItems: any;
  setSelectedItems: any;
  entitas: string;
  token: string;
}

const AlternatifProdukPersediaan = ({ selectedItems, setSelectedItems, entitas, token }: AlternatifProdukPersediaanProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowIndex2, setSelectedRowIndex2] = useState(0);
  const [selectedItem2, setSelectedItem2] = useState<any>({});
  const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

  const gridProduk2 = useRef<GridComponent | any>(null);
  const gridDaftarBarang2 = useRef<GridComponent | any>(null);

  const handleDataJurnal = async (jenis: any) => {
    const totalLine = gridProduk2.current!.dataSource.length;

    if (jenis === 'new') {
      const detailBarangBaru = {
        id_prod: totalLine + 1,
        id_item: null,
        kode_itemalt: null,
      };

      gridProduk2.current!.addRecord(detailBarangBaru);
      gridProduk2.current!.refresh();
    }
  };

  const editTemplateBarang = (args: any) => {
    return (
      <div>
        <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
          <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <TextBoxComponent value={args.kode_itemalt} readOnly={true} showClearButton={false} />
            <span>
              <ButtonComponent
                id="buNoItem1"
                type="button"
                cssClass="e-primary e-small e-round"
                iconCss="e-icons e-small e-search"
                onClick={() => {
                  setShowDialog(true);
                }}
                style={{ backgroundColor: '#3b3f5c' }}
              />
            </span>
          </div>
        </TooltipComponent>
      </div>
    );
  };

  // fetchdata
  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/erp/list_persediaan?`, {
        params: {
          entitas: entitas,
          param1: 'all',
          param2: 'all',
          param3: 'all',
          param4: 'all',
          param5: 'all',
          param6: 'all',
          param7: 'all',
          param8: 'all',
          param9: 'all',
          param10: 'all',
          param11: 'all',
          param12: 'all',
          param13: 'all',
          param14: 'all',
          param15: 'all',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const modifiedData = res.data.data.map((item: any) => ({
        ...item,
        harga1: parseFloat(item.harga1),
      }));
      setData(modifiedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePilihBarang = () => {
    const detailBarangBaru = {
      id_prod: gridProduk2.current.dataSource.length,
      id_item: gridProduk2.current.dataSource.length,
      kode_itemalt: selectedItem2.kode_item,
      nama_item: selectedItem2.nama_item,
    };

    gridProduk2.current.dataSource[selectedRowIndex2] = detailBarangBaru;
    gridProduk2.current.refresh();
    setShowDialog(false);
  };

  const handleDeleteDataJurnal = () => {
    swal
      .fire({
        title: `Hapus data di baris ${selectedRowIndex2 + 1}?`,
        target: '#dialogBaruEditPersediaan',
        showCancelButton: true,
        confirmButtonText: '<p style="font-size:10px">Ya</p>',
        cancelButtonText: '<p style="font-size:10px">Tidak</p>',
      })
      .then((result) => {
        if (result.isConfirmed) {
          gridProduk2.current.dataSource.splice(selectedRowIndex2, 1);
          gridProduk2.current.dataSource.forEach((item: any, index: any) => {
            item.id_prod2 = index + 1;
          });
          gridProduk2.current.refresh();
        }
      });
  };

  const handleActionComplete = (args: any) => {
    if (args.requestType === 'save') {
      const data = gridProduk2.current.dataSource;
      setSelectedItems(data);
    } else if (args.requestType === 'refresh') {
      const data = gridProduk2.current.dataSource;
      setSelectedItems(data);
    }
  };
  // const handleSave = (item: SelectedItem) => {
  //   const newItem = { ...item };
  //   setSelectedItem([...selectedItem, newItem]);
  // };

  return (
    <div className="p-2">
      <GridComponent
        id="gridProduk2"
        name="gridProduk2"
        locale="id"
        dataSource={selectedItems}
        ref={gridProduk2}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          newRowPosition: 'Bottom',
        }}
        selectionSettings={{ mode: 'Row', type: 'Single' }}
        rowSelected={(args: any) => setSelectedRowIndex2(args.rowIndex)}
        allowResizing={true}
        autoFit={true}
        rowHeight={22}
        height={170}
        gridLines={'Both'}
        actionComplete={handleActionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective field="id_prod" visible={false} isPrimaryKey headerTextAlign="Center" textAlign="Left" headerText="No. Barang" width="100" />
          <ColumnDirective field="id_item" headerTextAlign="Center" textAlign="Left" headerText="No. Barang" width="100" />
          <ColumnDirective field="nama_item" headerTextAlign="Center" textAlign="Left" headerText="Keterangan" width="200" editTemplate={editTemplateBarang} />
        </ColumnsDirective>
        {/* <Inject services={[Page, Sort, Filter, Selection, Edit, Resize, CommandColumn]} /> */}
      </GridComponent>

      <div className="mt-3 flex flex-col gap-2" style={{ width: '70%' }}>
        <div>
          <ButtonComponent
            id="buAdd1"
            type="button" //Solusi tdk refresh halaman saat selesai onClick
            cssClass="e-primary e-small"
            iconCss="e-icons e-small e-plus"
            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
            onClick={() => handleDataJurnal('new')}
          />
          <ButtonComponent
            id="buDelete1"
            // content="Hapus"
            type="button" //Solusi tdk refresh halaman saat selesai onClick
            cssClass="e-warning e-small"
            iconCss="e-icons e-small e-trash"
            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
            onClick={() => {
              handleDeleteDataJurnal();
            }}
          />
          {/* <ButtonComponent
            id="buDeleteAll1"
            // content="Bersihkan"
            type="button" //Solusi tdk refresh halaman saat selesai onClick
            cssClass="e-danger e-small"
            iconCss="e-icons e-small e-erase"
            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
            onClick={() => {
              // handleDeleteDataJurnalAll();
            }}
          /> */}
        </div>
      </div>

      {showDialog && (
        <DialogComponent
          target="#DialogBaruEditPersediaan"
          style={{ position: 'fixed' }}
          header="Daftar Barang"
          visible={showDialog}
          isModal
          close={() => setShowDialog(false)}
          showCloseIcon
          allowDragging
          width="415"
          height="580"
        >
          <GridComponent ref={gridDaftarBarang2} dataSource={data} recordClick={(args: any) => setSelectedItem2(args.rowData)} recordDoubleClick={handlePilihBarang} allowFiltering allowPaging>
            <ColumnsDirective>
              <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" />
              <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" />
              <ColumnDirective field="harga1" format={'N'} textAlign="Right" headerText="Harga Jual" headerTextAlign="Center" />
            </ColumnsDirective>
            {/* <Inject services={[Page, Sort, Filter, Selection]} /> */}
          </GridComponent>
        </DialogComponent>
      )}
    </div>
  );
};

export default AlternatifProdukPersediaan;

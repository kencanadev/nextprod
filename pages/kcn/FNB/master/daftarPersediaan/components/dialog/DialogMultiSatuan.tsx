import React, { useEffect, useState } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { useSession } from '@/pages/api/sessionContext';
import { fetchSatuan } from '../../api/api';

interface dialogMultiSatuanProps {
  isOpen: boolean;
  onClose: any;
  updateState: any;
  formState: any;
}

const DialogMultiSatuan = ({ isOpen, onClose, updateState, formState }: dialogMultiSatuanProps) => {
  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  let gridMultiSatuan: Grid;

  const [data, setData] = useState<any>([
    {
      no: '1',
      satuan: formState?.satuan2,
      std: formState?.std2,
      konversi: formState?.konversi2,
    },
    {
      no: '2',
      satuan: formState?.satuan3,
      std: formState?.std3,
      konversi: formState?.konversi3,
    },
  ]);

  // update state menjadi
  //   updateState('satuan2', data[0].satuan);
  //   updateState('satuan3', data[1].satuan);

  const [dataSatuan, setDataSatuan] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  const fetchData = async () => {
    const data = await fetchSatuan(kode_entitas);
    setDataSatuan(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const editSatuanLain2 = (args: any) => {
    return (
      <DropDownListComponent
        id="satuan"
        name="satuan"
        dataSource={dataSatuan}
        fields={{ value: 'satuan', text: 'satuan' }}
        floatLabelType="Never"
        placeholder={args.satuan}
        onChange={(e: any) => {
          if (selectedRowIndex === 0) {
            updateState('satuan2', e.value);
          } else {
            updateState('satuan3', e.value);
          }
        }}
        value={args.satuan}
      />
    );
  };

  const handleActionComplete = (args: any) => {
    if (args.requestType === 'save') {
      if (args.rowIndex === 0) {
        updateState('std2', args.data.std);
        updateState('konversi2', args.data.konversi);
      } else {
        updateState('std3', args.data.std);
        updateState('konversi3', args.data.konversi);
      }
    }
  };

  let buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Oke',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: () => {
        onClose();
      },
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent
      id="dialogMultiSatuan"
      name="dialogMultiSatuan"
      target={'#DialogBaruEditPersediaan'}
      header={'Multi Satuan'}
      visible={isOpen}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      width={'500px'}
      height={'50%'}
      position={{ X: 'center', Y: 'center' }}
      buttons={buttonsInputData}
      allowDragging
      closeOnEscape
      zIndex={1000}
    >
      <GridComponent
        id="gridMultiSatuan"
        name="gridMultiSatuan"
        className="gridMultiSatuan"
        locale="id"
        ref={(g: any) => (gridMultiSatuan = g)}
        dataSource={data}
        selectionSettings={{
          mode: 'Row',
          type: 'Single',
        }}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          newRowPosition: 'Bottom',
        }}
        allowResizing={true}
        gridLines={'Both'}
        loadingIndicator={{
          indicatorType: 'Shimmer',
        }}
        height={400}
        allowKeyboard={false}
        rowSelected={(args: any) => setSelectedRowIndex(args.rowIndex)}
        actionComplete={handleActionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective field="no" headerText="No." headerTextAlign="Center" textAlign="Center" width="40" allowEditing={false} />
          <ColumnDirective field="satuan" headerText="Satuan Lain" headerTextAlign="Center" textAlign="Left" editTemplate={editSatuanLain2} width="150" />
          <ColumnDirective field="std" headerText="Qty Lain" headerTextAlign="Center" textAlign="Left" width="140" />
          <ColumnDirective field="konversi" headerText="Qty Standar" headerTextAlign="Center" textAlign="Left" width="140" />
        </ColumnsDirective>

        <Inject services={[Selection, Edit, Toolbar]} />
      </GridComponent>
    </DialogComponent>
  );
};

export default DialogMultiSatuan;

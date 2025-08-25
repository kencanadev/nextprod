import React from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { AdditionalButtonProps } from './types';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { validateAlert } from '../utils/sweetalert';

const AdditionalButton = ({ id, text, onClick, disabled }: AdditionalButtonProps) => (
  <ButtonComponent
    id={id}
    cssClass="e-primary e-small"
    style={{
      width: 'auto',
      marginBottom: '0.5em',
      marginTop: '0.5em',
      marginRight: '0.8em',
      backgroundColor: '#e6e6e6',
      color: disabled ? 'gray' : 'green',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5em',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onClick={onClick}
    disabled={disabled}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-arrow-badge-right">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 6l-.112 .006a1 1 0 0 0 -.669 1.619l3.501 4.375l-3.5 4.375a1 1 0 0 0 .78 1.625h6a1 1 0 0 0 .78 -.375l4 -5a1 1 0 0 0 0 -1.25l-4 -5a1 1 0 0 0 -.78 -.375h-6z" />
    </svg>
    {text}
  </ButtonComponent>
);

interface AdditionalButtonsProps {
  setDialogStatusPersediaan: any;
  setDialogKartuStok: any;
  setDialogLabelBarcode: any;
  itemId: any;
}

const AdditionalButtons = ({ setDialogStatusPersediaan, setDialogKartuStok, setDialogLabelBarcode, itemId }: AdditionalButtonsProps) => {
  const router = useRouter();
  const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
  return (
    <div className="flex flex-col md:flex-row">
      {/* <AdditionalButton id="btnInfoDetail" text="Status Persediaan" onClick={() => setDialogStatusPersediaan(true)} /> */}
      <AdditionalButton disabled id="btnInfoDetail" text="Status Persediaan" onClick={() => router.push(`/kcn/ERP/master/daftarPersediaan/statusPersediaan?tabId=${tabId}`)} />
      <AdditionalButton
        disabled={false}
        id="btnInfoKlasifikasi"
        text="Kartu Stok"
        onClick={() => {
          if (!itemId) {
            validateAlert('warning', 'Silahkan pilih item terlebih dahulu', '#main-target');
            return;
          }
          setDialogKartuStok(true);
        }}
      />
      <AdditionalButton disabled={false} id="btnGantiSalesMan" text="Label Barcode" onClick={() => setDialogLabelBarcode(true)} />
      <AdditionalButton disabled id="btnUpdateKlasifikasi" text="Update Harga" onClick={() => {}} />
      <AdditionalButton disabled id="btnExportExcel" text="Grup Barang" onClick={() => {}} />
    </div>
  );
};

export default AdditionalButtons;

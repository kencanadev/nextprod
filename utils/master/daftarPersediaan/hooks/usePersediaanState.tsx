import { useState } from 'react';

const usePersediaanState = () => {
  const [data, setData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
  const [searchNoPersediaan, setSearchNoPersediaan] = useState('');
  const [searchNamaPersediaan, setSearchNamaPersediaan] = useState('');
  const [dialogDetailDataVisible, setDialogDetailDataVisible] = useState(false);
  const [dialogBaruEditPersediaan, setDialogBaruEditPersediaan] = useState(false);
  const [dialogStatusPersediaan, setDialogStatusPersediaan] = useState(false);
  const [dialogLabelBarcode, setDialogLabelBarcode] = useState(false);
  const [dialogKartuStok, setDialogKartuStok] = useState(false);
  const [dialogMode, setDialogMode] = useState('BARU');
  const [detailKodeRelasi, setDetailKodeRelasi] = useState('BARU');
  const [selectedId, setSelectedId] = useState('');

  return {
    data,
    setData,
    showLoader,
    setShowLoader,
    panelVisible,
    setPanelVisible,
    isShowTaskMenu,
    setIsShowTaskMenu,
    searchNoPersediaan,
    setSearchNoPersediaan,
    searchNamaPersediaan,
    setSearchNamaPersediaan,
    dialogDetailDataVisible,
    setDialogDetailDataVisible,
    dialogBaruEditPersediaan,
    setDialogBaruEditPersediaan,
    dialogStatusPersediaan,
    setDialogStatusPersediaan,
    dialogLabelBarcode,
    setDialogLabelBarcode,
    dialogKartuStok,
    setDialogKartuStok,
    dialogMode,
    setDialogMode,
    detailKodeRelasi,
    setDetailKodeRelasi,
    selectedId,
    setSelectedId,
  };
};

export default usePersediaanState;

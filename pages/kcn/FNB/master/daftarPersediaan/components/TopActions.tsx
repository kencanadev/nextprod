import React from 'react';
import ActionButtons from './ActionButtons';
import SearchInputs from './SearchInputs';
import AdditionalButtons from './AdditionalButtons';
import { InventoryManagementProps, StyleButton } from './types';

const TopActions = ({
  panelVisible,
  handleBaruClick,
  showEditRecord,
  handleFilterClick,
  searchNoPersediaan,
  searchNamaPersediaan,
  handleChangeSearchNoPersediaan,
  handleChangeSearchNamaPersediaan,
  handleClearSearchNoPersediaan,
  handleClearSearchNamaPersediaan,
  noPersediaanRef,
  namaPersediaanRef,
  setDialogStatusPersediaan,
  setDialogKartuStok,
  setDialogLabelBarcode,
  selectedId,
}: InventoryManagementProps) => {
  const styleButton: StyleButton = {
    width: '57px',
    height: '28px',
    marginBottom: '0.5em',
    marginTop: '0.5em',
    marginRight: '0.8em',
    backgroundColor: '#3b3f5c',
  };

  return (
    <div className="gap-2 sm:flex">
      <div className="flex flex-col sm:border-r md:flex-row">
        <ActionButtons handleBaruClick={handleBaruClick} showEditRecord={showEditRecord} handleFilterClick={handleFilterClick} panelVisible={panelVisible} styleButton={styleButton} />
      </div>
      <SearchInputs
        searchNoPersediaan={searchNoPersediaan}
        searchNamaPersediaan={searchNamaPersediaan}
        handleChangeSearchNoPersediaan={handleChangeSearchNoPersediaan}
        handleChangeSearchNamaPersediaan={handleChangeSearchNamaPersediaan}
        handleClearSearchNoPersediaan={handleClearSearchNoPersediaan}
        handleClearSearchNamaPersediaan={handleClearSearchNamaPersediaan}
        noPersediaanRef={noPersediaanRef}
        namaPersediaanRef={namaPersediaanRef}
      />
      <AdditionalButtons itemId={selectedId} setDialogStatusPersediaan={setDialogStatusPersediaan} setDialogKartuStok={setDialogKartuStok} setDialogLabelBarcode={setDialogLabelBarcode} />
    </div>
  );
};

export default TopActions;

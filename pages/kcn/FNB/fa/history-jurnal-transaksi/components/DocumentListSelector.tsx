import React, { useState } from 'react';
import { listDokumen } from '../constants';

const DocumentListSelector = () => {
  // State to track checked items
  const [checkedItems, setCheckedItems] = useState<any>({});
  // State to track if all items are selected
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Handle individual checkbox changes
  const handleCheckboxChange = (id: any, kode: any) => {
    const newCheckedItems: any = { ...checkedItems };
    if (newCheckedItems[id]) {
      delete newCheckedItems[id];
    } else {
      newCheckedItems[id] = kode;
    }
    setCheckedItems(newCheckedItems);
    setIsAllSelected(Object.keys(newCheckedItems).length === listDokumen.length);
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Clear all selections
      setCheckedItems({});
      setIsAllSelected(false);
    } else {
      // Select all items
      const allItems: any = {};
      listDokumen.forEach((item) => {
        allItems[item.id] = item.kode;
      });
      setCheckedItems(allItems);
      setIsAllSelected(true);
    }
  };

  // Get selected codes as string
  const getSelectedCodes = () => {
    return Object.values(checkedItems).join(', ');
  };

  return (
    <div className="p-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">Dokumen</span>
        <button className="text-xs font-semibold text-black hover:text-gray-700" onClick={handleSelectAll}>
          {isAllSelected ? 'Hapus Pilihan' : 'Pilih Semua'}
        </button>
      </div>

      <div className="overflow-x-auto rounded bg-gray-300 p-2">
        {listDokumen.map((item) => (
          <div key={item.id} className="mb-1 flex items-center">
            <input type="checkbox" id={`checkbox-${item.id}`} checked={!!checkedItems[item.id]} onChange={() => handleCheckboxChange(item.id, item.kode)} className="cursor-pointer" />
            <label htmlFor={`checkbox-${item.id}`} className="m-0 ml-1 cursor-pointer text-xs text-gray-900">
              {item.text}
            </label>
          </div>
        ))}
      </div>

      {/* Debug info to show selected codes */}
      <div className="mt-2 text-xs text-gray-600">Selected codes: {getSelectedCodes()}</div>
    </div>
  );
};

export default DocumentListSelector;

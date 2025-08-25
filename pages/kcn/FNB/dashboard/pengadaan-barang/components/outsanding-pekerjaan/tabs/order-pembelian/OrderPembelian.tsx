import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { POTabList } from '../../../../constants';
import KirimGudang from './KirimGudang';
import KirimCustomer from './KirimCustomer';

const OrderPembelian = ({
  gudangData,
  customerData,
  handleRowSelected,
  refreshData,
  refGridGudang,
  refGridCustomer,
  selectedItems,
}: {
  gudangData: any;
  customerData: any;
  handleRowSelected: any;
  refreshData: Function;
  refGridGudang: any;
  refGridCustomer: any;
  selectedItems: any;
}) => {
  const [activeMainTab, setActiveMainTab] = useState(POTabList[0].key);

  return (
    <div className="mt-1">
      <div className="-mt-3 flex h-[40px] w-full items-end gap-0 overflow-x-auto overflow-y-hidden border-x-2 border-gray-300">
        {POTabList.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => setActiveMainTab(item.key)}
            layout // Memastikan perubahan ukuran smooth
            animate={{
              height: activeMainTab === item.key ? '28px' : '24px', // Tinggi berbeda
              scale: activeMainTab === item.key ? 1 : 1, // Skala lebih kecil jika tidak aktif
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }} // Transisi lebih smooth
            className={`whitespace-nowrap rounded-b-none rounded-t-md font-semibold transition-all ${
              activeMainTab === item.key
                ? 'bg-[#dedede] px-3 py-2 text-sm text-black' // Tab aktif lebih besar
                : 'border px-2 py-1 text-xs text-gray-500 hover:scale-100 hover:text-black' // Tab tidak aktif lebih kecil & rapat
            }`}
            whileTap={{ scale: 1.05 }} // Efek saat ditekan
          >
            {item.title}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex w-full flex-grow">
        {activeMainTab === 'dikirim_gudang' && <KirimGudang data={gudangData} refGrid={refGridGudang} refreshData={refreshData} handleRowSelected={handleRowSelected} selectedItems={selectedItems} />}
        {activeMainTab === 'dikirim_langsung' && (
          <KirimCustomer data={customerData} refGrid={refGridCustomer} refreshData={refreshData} handleRowSelected={handleRowSelected} selectedItems={selectedItems} />
        )}
      </div>
    </div>
  );
};

export default OrderPembelian;

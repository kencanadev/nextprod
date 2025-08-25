import React, { useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { motion } from 'framer-motion';
import BonusBarang from '../bonus/BonusBarang';
import BonusBarangDialog from '../bonus/BonusBarang';

const tabKlasifikasiArray = ['bonus_barang', 'diskon_kuantitas', 'diskon_tanggal', 'diskon_jam', 'diskon_tanggal_dan_jam'];
const DialogBonusPOS = ({ isOpen, onClose, formState, setFormState }: { isOpen: any; onClose: any; formState: any; setFormState: any }) => {
    const [tabAktif, setTabAktif] = useState('bonus_barang');

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    return (
        <DialogComponent
            id="DialogBaruEditPersediaan"
            name="DialogBaruEdit"
            className="DialogBaruEdit"
            target="#DialogBaruEditPersediaan"
            header={'Ketentuan Bonus dan diskon barang (POS)'}
            visible={isOpen}
            isModal
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="900"
            height="500"
            position={{ X: 40, Y: 14 }}
            style={{ position: 'fixed' }}
            close={() => {
                onClose();
            }}
            allowDragging
            showCloseIcon
            closeOnEscape
            open={(args: any) => {
                args.preventFocus = true;
            }}
            zIndex={999}
        >
            <div className="flex h-full w-full flex-col gap-1">
                <div className=" flex h-[30px] w-full overflow-x-auto overflow-y-hidden border-b border-gray-300">
                    {tabKlasifikasiArray.map((item: any) => (
                        <motion.button
                            key={item.Klasifikasi}
                            onClick={async () => {
                                setTabAktif(item);
                            }}
                            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${tabAktif === item ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                            whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                            transition={{ duration: 0.2 }}
                        >
                            {formatString(item)}
                        </motion.button>
                    ))}
                </div>
                <div className="h-[calc(100%-30px)] w-full">
                    <div className={`h-full w-full `}>
                        <BonusBarangDialog formState={formState} tabAktif={tabAktif} />
                    </div>
                    <div className={`h-full w-full ${tabAktif === 'diskon_kuantitas' ? 'block' : 'hidden'}`}>diskon_kuantitas</div>
                </div>
                <div className="flex h-[30px] justify-end gap-2">
                    <button className="box-border h-[28px] w-[80px] rounded-md bg-[#3a3f5c] px-1 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                        [F6] OK
                    </button>
                    <button 
                    onClick={onClose}
                    className="box-border h-[28px] w-[80px] rounded-md bg-[#3a3f5c] px-1 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                        [F7] Batal
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
};

export default DialogBonusPOS;

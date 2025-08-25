import React, { useState, useRef } from 'react';
import Select from 'react-select';

type Option = {
    value: string;
    label: string; // Mirip dengan Lookup di Delphi
};

const LookupComboBox = ({
    options,
    selectedOption,
    setSelectedOption,
    name,
    trigger,
    disabled,
}: {
    options: Option | any;
    selectedOption: any;
    setSelectedOption: any;
    name: any;
    trigger?: (e: string) => void;
    disabled?: boolean;
}) => {
    const selectRef = useRef<any>(null); // Ref untuk akses Select

    const handleChange = (option: Option | null) => {
        setSelectedOption((oldData: any) => ({
            ...oldData,
            [name]: option?.value ?? '',
        }));
        
        if (selectRef.current) {
            selectRef.current.blur(); // Paksa blur setelah memilih
        }
        if (trigger) {
            trigger(option?.value as string);
        }
    };

    return (
        <div className="w-full">
            <label className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white">Pilih {name}</label>
            <Select
                ref={selectRef}
                options={options}
                value={selectedOption}
                onChange={handleChange}
                getOptionLabel={(e) => `${e.label}`} // Mirip Lookup Delphi
                placeholder={selectedOption === '' ? `Pilih ${name} ` : selectedOption}
                isClearable
                isSearchable
                noOptionsMessage={() => 'Tidak ditemukan'}
                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center', // Pusatkan teks di tengah vertikal
                        borderRadius: '8px',
                        borderColor: disabled
                            ? '#d1d5db' // Warna border abu-abu saat disabled
                            : state.isFocused
                            ? '#3b82f6'
                            : '#d1d5db',
                        boxShadow: state.isFocused && !disabled ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                        backgroundColor: disabled ? '#f3f4f6' : 'rgb(249 250 251)', // Ubah warna latar belakang jika disabled
                        height: '36px',
                        minHeight: '36px',
                        paddingLeft: '10px',
                        cursor: disabled ? 'not-allowed' : 'pointer', // Ubah kursor jika disabled
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        color: disabled ? '#9ca3af' : 'inherit', // Warna placeholder lebih redup jika disabled
                    }),
                }}
                isDisabled={disabled}
            />
        </div>
    );
};

export default LookupComboBox;

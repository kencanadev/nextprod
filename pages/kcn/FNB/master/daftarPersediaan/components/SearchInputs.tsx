import React from 'react';
import { SearchInputProps, SearchInputsProps } from './types';

const SearchInput = ({ id, placeholder, value, onChange, onClear, inputRef }: SearchInputProps) => (
  <div className="relative w-full">
    <input
      type="text"
      id={id}
      name={id}
      className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      placeholder={placeholder}
      style={{ height: '4vh' }}
      value={value}
      ref={inputRef}
      onChange={onChange}
    />
    {value && (
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        onClick={onClear}
      >
        &times;
      </button>
    )}
  </div>
);

const SearchInputs = ({
  searchNoPersediaan,
  searchNamaPersediaan,
  handleChangeSearchNoPersediaan,
  handleChangeSearchNamaPersediaan,
  handleClearSearchNoPersediaan,
  handleClearSearchNamaPersediaan,
  noPersediaanRef,
  namaPersediaanRef,
}: SearchInputsProps) => (
  <div className="flex max-w-xl items-center gap-2">
    <SearchInput id="searchNoSupp" placeholder="No Barang" value={searchNoPersediaan} onChange={handleChangeSearchNoPersediaan} onClear={handleClearSearchNoPersediaan} inputRef={noPersediaanRef} />
    <SearchInput
      id="searchNamaSupp"
      placeholder="Nama Barang"
      value={searchNamaPersediaan}
      onChange={handleChangeSearchNamaPersediaan}
      onClear={handleClearSearchNamaPersediaan}
      inputRef={namaPersediaanRef}
    />
  </div>
);

export default SearchInputs;

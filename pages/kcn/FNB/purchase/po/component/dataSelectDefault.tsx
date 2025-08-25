import React from 'react'

const dataSelectDefault = () => {
  return (
    <div>dataSelectDefault</div>
  )
}

export default dataSelectDefault

export const ValuePajak = [
    { value: 'N', label: 'Tanpa Pajak' },
    { value: 'I', label: 'Include(I)' },
    { value: 'E', label: 'Exclude(E)' },
];

export const ValueCaraPengiriman = [
    { value: 'Dikirim', label: 'Dikirim' },
    { value: 'Ambil Sendiri', label: 'Ambil Sendiri' },
];

export const ValueFax = [
    { value: 'Fax', label: 'Fax' },
    { value: 'Telephone', label: 'Telephone' },
    { value: 'Langsung', label: 'Langsung' },
];

import { ExampleProvider } from '@/utils/konsolidasi/klaim-barang-kurang/ContexKlaimBarangKurang'
import React from 'react'
import KlaimBarangKurangKons from './KlaimBarangKurangKons'

const index = () => {
  return (
    <ExampleProvider>
        <KlaimBarangKurangKons />
    </ExampleProvider>
  )
}

export default index
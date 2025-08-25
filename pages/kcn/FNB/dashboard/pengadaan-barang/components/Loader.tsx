import React from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

import styles from '../pengadaan.module.css';

const Loader = () => {
  return (
    <DialogComponent id="loader" target="#main-target" isModal visible width={'300px'} height={'200px'}>
      <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
        <span className="text-xl font-bold">Fetching Data</span>
        <div className={styles.loader}></div>
      </div>
    </DialogComponent>
  );
};

export default Loader;

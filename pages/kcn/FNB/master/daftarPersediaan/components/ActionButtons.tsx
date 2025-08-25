import React from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { ActionButtonsProps } from './types';

const ActionButtons = ({ handleBaruClick, showEditRecord, handleFilterClick, panelVisible, styleButton }: ActionButtonsProps) => (
  <>
    <TooltipComponent content="Daftarkan Persediaan baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
      <ButtonComponent id="btnBaru" type="submit" style={styleButton} className="e-primary e-small" onClick={handleBaruClick}>
        Baru
      </ButtonComponent>
    </TooltipComponent>
    <TooltipComponent content="Edit data persediaan" opensOn="Hover" openDelay={1000} target="#btnEdit">
      <ButtonComponent id="btnEdit" onClick={showEditRecord} type="submit" style={styleButton} className="e-primary e-small">
        Ubah
      </ButtonComponent>
    </TooltipComponent>
    <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
      <ButtonComponent
        id="btnFilter"
        type="submit"
        cssClass="e-primary e-small"
        style={
          panelVisible
            ? {
                width: '57px',
                height: '28px',
                marginBottom: '0.5em',
                marginTop: '0.5em',
                marginRight: '0.8em',
              }
            : { ...styleButton, color: 'white' }
        }
        onClick={handleFilterClick}
        disabled={panelVisible}
      >
        Filter
      </ButtonComponent>
    </TooltipComponent>
  </>
);

export default ActionButtons;

import React from 'react';

type CustomInputProps = {
  isChecked: boolean;
  setIsChecked: () => void;
  value: string;
  setValue: (e: any) => void;
  name: string;
  title: string;
  placeholder: string;
};

const CustomInput = ({ isChecked, setIsChecked, value, setValue, name, title, placeholder }: CustomInputProps) => {
  return (
    <div>
      <label className="mt-3 flex cursor-pointer items-center">
        <input type="checkbox" name={name} className="form-checkbox" checked={value ? !isChecked : isChecked} onChange={setIsChecked} />
        <span>{title}</span>
      </label>
      <input type="text" placeholder={placeholder} className="form-input" name={name} value={value} onChange={setValue} />
    </div>
  );
};

export default CustomInput;

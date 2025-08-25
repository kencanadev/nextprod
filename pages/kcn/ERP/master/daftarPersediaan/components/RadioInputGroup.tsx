import React from 'react';

type RadioInputGroupProps = {
  title?: string;
  name: string;
  options: { label: string; value: string }[];
  checkedValue: string;
  onChange: (value: string) => void;
};

const RadioInputGroup = ({ title, name, options = [], checkedValue, onChange }: RadioInputGroupProps) => {
  return (
    <div>
      <div className="mt-3 font-bold">
        <span>{title}</span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center">
            <input type="radio" name={name} value={option.value} checked={checkedValue === option.value} onChange={(e) => onChange(e.currentTarget.value)} className="form-radio" />
            <span className="ml-2">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioInputGroup;

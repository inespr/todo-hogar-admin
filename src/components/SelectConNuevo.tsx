'use client';

import { FormControl, FormLabel, Input, Select } from '@chakra-ui/react';

interface Props {
  label: string;
  value: string;
  onSelect: (v: string) => void;
  nuevoValue: string;
  onNuevoChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  isDisabled?: boolean;
  nuevoPlaceholder?: string;
  isRequired?: boolean;
  id?: string;
}

export default function SelectConNuevo({
  label,
  value,
  onSelect,
  nuevoValue,
  onNuevoChange,
  options,
  placeholder = 'Selecciona o añade nuevo',
  isDisabled = false,
  nuevoPlaceholder = 'Escribe el nuevo valor',
  isRequired = false,
  id,
}: Props) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <FormControl isRequired={isRequired} isDisabled={isDisabled}>
      <FormLabel htmlFor={fieldId} fontSize="sm" color="gray.600">{label}</FormLabel>
      <Select
        id={fieldId}
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        placeholder={placeholder}
        color="gray.800"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="__nuevo__">+ Añadir nuevo</option>
      </Select>
      {value === '__nuevo__' && (
        <Input
          id={`${fieldId}-nuevo`}
          mt={2}
          placeholder={nuevoPlaceholder}
          value={nuevoValue}
          onChange={(e) => onNuevoChange(e.target.value)}
          color="gray.800"
          autoFocus
        />
      )}
    </FormControl>
  );
}

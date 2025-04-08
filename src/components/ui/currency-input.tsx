
import React, { useEffect, useState } from "react";
import { Input } from "./input";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

export const CurrencyInput = ({ 
  onValueChange, 
  className,
  value: initialValue,
  ...props 
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState("");
  
  useEffect(() => {
    if (initialValue) {
      formatValue(Number(initialValue));
    }
  }, [initialValue]);

  const formatValue = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    
    setDisplayValue(formatted);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-numeric characters
    value = value.replace(/[^\d]/g, "");
    
    // Convert to number with decimal places
    const numericValue = value ? Number(value) / 100 : 0;
    
    // Format for display
    formatValue(numericValue);
    
    // Call the callback with the numeric value
    if (onValueChange) {
      onValueChange(numericValue);
    }
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  );
};

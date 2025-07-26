"use client";

import React, { useState } from 'react';
import Cards, { Focused } from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreditCardFormProps {
    disabled?: boolean;
}

const CreditCardForm = ({ disabled = false }: CreditCardFormProps) => {
  const [state, setState] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: '' as Focused | undefined,
  });

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    
    // Format card number with spaces
    if (name === 'number') {
        const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        setState((prev) => ({ ...prev, [name]: formattedValue }));
        return;
    }

    // Format expiry date
    if (name === 'expiry') {
        let formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 2) {
            formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
        }
        setState((prev) => ({ ...prev, [name]: formattedValue }));
        return;
    }

    setState((prev) => ({ ...prev, [name]: value }));
  }

  const handleInputFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, focus: evt.target.name as Focused }));
  }

  return (
    <div>
      <Cards
        number={state.number}
        expiry={state.expiry}
        cvc={state.cvc}
        name={state.name}
        focused={state.focus}
      />
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="number">Número de Tarjeta</Label>
            <Input
            type="tel"
            name="number"
            id="number"
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            value={state.number}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            disabled={disabled}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Titular</Label>
            <Input
            type="text"
            name="name"
            id="name"
            placeholder="John Doe"
            value={state.name}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            disabled={disabled}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
            <Label htmlFor="expiry">Fecha de Expiración</Label>
            <Input
                type="text"
                name="expiry"
                id="expiry"
                placeholder="MM/AA"
                maxLength={5}
                value={state.expiry}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                required
                disabled={disabled}
            />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
                type="tel"
                name="cvc"
                id="cvc"
                placeholder="123"
                maxLength={4}
                value={state.cvc}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                required
                disabled={disabled}
            />
            </div>
        </div>
      </div>
    </div>
  );
}

export default CreditCardForm;

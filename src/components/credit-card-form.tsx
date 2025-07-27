
"use client";

import React from 'react';
import Cards, { Focused } from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CreditCardFormProps {
    disabled?: boolean;
    onValidationChange: (isValid: boolean) => void;
}

const creditCardSchema = z.object({
  number: z.string()
    .min(19, "El número de la tarjeta debe tener 16 dígitos.")
    .max(19, "El número de la tarjeta debe tener 16 dígitos."),
  name: z.string().min(1, "El nombre del titular es requerido."),
  expiry: z.string()
    .min(5, "La fecha debe tener el formato MM/AA.")
    .max(5, "La fecha debe tener el formato MM/AA.")
    .refine(val => {
        const [month, year] = val.split('/');
        if (!month || !year || year.length !== 2) return false;
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const cardYear = parseInt(year, 10);
        const cardMonth = parseInt(month, 10);
        if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
            return false;
        }
        return cardMonth >= 1 && cardMonth <= 12;
    }, "La fecha de expiración no es válida o ya pasó."),
  cvc: z.string()
    .min(3, "El CVC debe tener al menos 3 dígitos.")
    .max(4, "El CVC no puede tener más de 4 dígitos.")
    .regex(/^\d+$/, "El CVC solo debe contener números."),
  focus: z.string().optional(),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

const CreditCardForm = ({ disabled = false, onValidationChange }: CreditCardFormProps) => {
    
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    mode: "onChange", // Validate on change to provide real-time feedback
    defaultValues: {
      number: '',
      expiry: '',
      cvc: '',
      name: '',
      focus: '',
    },
  });

  const { formState, watch, setValue, setFocus } = form;
  const cardData = watch();

  React.useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
        const formattedValue = value.replace(/[^\d]/g, '').replace(/(\d{4})/g, '$1 ').trim();
        setValue('number', formattedValue, { shouldValidate: true });
        return;
    }

    if (name === 'expiry') {
        let formattedValue = value.replace(/[^\d]/g, '');
        if (formattedValue.length > 2) {
            formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
        }
        setValue('expiry', formattedValue, { shouldValidate: true });
        return;
    }
     if (name === 'cvc') {
        const formattedValue = value.replace(/[^\d]/g, '');
        setValue('cvc', formattedValue, { shouldValidate: true });
        return;
    }

    setValue(name as keyof CreditCardFormValues, value, { shouldValidate: true });
  }
  
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(e.target.name as keyof CreditCardFormValues);
  }

  return (
    <div>
      <Cards
        number={cardData.number}
        expiry={cardData.expiry}
        cvc={cardData.cvc}
        name={cardData.name}
        focused={cardData.focus as Focused}
      />
      <Form {...form}>
        <form className="mt-6 grid gap-4">
          <FormField
            control={form.control}
            name="number"
            render={() => (
              <FormItem>
                <FormLabel>Número de Tarjeta</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    name="number"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardData.number}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={() => (
              <FormItem>
                <FormLabel>Nombre del Titular</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="expiry"
                render={() => (
                <FormItem>
                    <FormLabel>Expiración</FormLabel>
                    <FormControl>
                    <Input
                        type="text"
                        name="expiry"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        disabled={disabled}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cvc"
                render={() => (
                <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                    <Input
                        type="tel"
                        name="cvc"
                        placeholder="123"
                        maxLength={4}
                        value={cardData.cvc}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        disabled={disabled}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreditCardForm;

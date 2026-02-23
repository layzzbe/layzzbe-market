import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    // Holat: qaysi valyutada ko'rsatilishi ('USD', 'UZS', 'RUB')
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('preferredCurrency') || 'UZS';
    });

    // Hardcode qiymatlar (Haqiqiy loyihada API dan tortish mumkin)
    const rates = {
        USD: 1,
        UZS: 12800,
        RUB: 92
    };

    // Valyuta belgilari
    const symbols = {
        USD: '$',
        UZS: "so'm",
        RUB: '₽'
    };

    useEffect(() => {
        localStorage.setItem('preferredCurrency', currency);
    }, [currency]);

    // Narxni hisoblash va formatlash funksiyasi
    // Backenddan "$49" (string) yoxud 49 (number) ko'rinishida kelishi mumkin.
    const formatPrice = (priceInput) => {
        if (!priceInput) return `${symbols[currency]} 0`;

        // Raqamni ajratib olamiz (faqat raqamlar va nuqta)
        let numericPrice = typeof priceInput === 'string'
            ? parseFloat(priceInput.replace(/[^0-9.]/g, ''))
            : parseFloat(priceInput);

        if (isNaN(numericPrice)) return priceInput;

        // Hisoblash
        const converted = numericPrice * rates[currency];

        // Formatlash (masalan 1,200,000 so'm)
        const formatted = new Intl.NumberFormat('en-US').format(Math.round(converted));

        // Natija ('so'm' o'ngda ko'rinishi odatiy roq, ammo hamma uchun chapda ishlataveramiz)
        if (currency === 'UZS') {
            return `${formatted} ${symbols[currency]}`;
        }

        return `${symbols[currency]}${formatted}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

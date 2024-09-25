export const Currencies = [
    { value: "USD", label: '$ Dollar', local: "en-US" },       // Dólar Americano
    { value: "EUR", label: '€ Euro', local: "de-DE" },         // Euro
    { value: "GBP", label: '£ Pound', local: "en-GB" },        // Libra Esterlina
    { value: "JPY", label: '¥ Yen', local: "ja-JP" },          // Iene Japonês
    { value: "BRL", label: 'R$ Real', local: "pt-BR" },        // Real Brasileiro
    { value: "AUD", label: '$ Australian Dollar', local: "en-AU" }, // Dólar Australiano
    { value: "CAD", label: '$ Canadian Dollar', local: "en-CA" },   // Dólar Canadense
    { value: "CNY", label: '¥ Yuan', local: "zh-CN" },         // Yuan Chinês
    { value: "INR", label: '₹ Rupee', local: "hi-IN" },        // Rúpia Indiana
    { value: "RUB", label: '₽ Ruble', local: "ru-RU" },        // Rublo Russo
    { value: "MXN", label: '$ Mexican Peso', local: "es-MX" }, // Peso Mexicano
    { value: "ZAR", label: 'R Rand', local: "en-ZA" },         // Rand Sul-Africano
    { value: "CHF", label: 'CHF Swiss Franc', local: "de-CH" },// Franco Suíço
    { value: "KRW", label: '₩ Won', local: "ko-KR" },          // Won Sul-Coreano
    { value: "ARS", label: '$ Argentine Peso', local: "es-AR" },// Peso Argentino
];

export type Currency = (typeof Currencies)[0]
  
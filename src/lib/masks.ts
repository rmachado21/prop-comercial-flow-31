// Funções para aplicar máscaras e validar campos

// Máscara para CNPJ: XX.XXX.XXX/XXXX-XX
export const maskCNPJ = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara progressivamente
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Máscara para telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
export const maskPhone = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara progressivamente
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  
  // Para celular (11 dígitos)
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Máscara para CEP: XXXXX-XXX
export const maskCEP = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara progressivamente
  if (numbers.length <= 5) return numbers;
  
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Algoritmo de validação do CNPJ
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[12]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[13]) === digit2;
};

// Validação de telefone
export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Aceita telefone fixo (10 dígitos) ou celular (11 dígitos)
  return numbers.length === 10 || numbers.length === 11;
};

// Validação de CEP
export const validateCEP = (cep: string): boolean => {
  // Remove caracteres não numéricos
  const numbers = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  return numbers.length === 8;
};
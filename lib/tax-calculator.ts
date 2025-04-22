// Saskatchewan Tax Calculator for 2025
// Based on Canada & Saskatchewan tax brackets

interface TaxRate {
  rate: number;
  threshold: number;
}

interface TaxBracket {
  federalRates: TaxRate[];
  provincialRates: TaxRate[];
  cpp: {
    rate: number;
    maxContribution: number;
    exemption: number;
  };
  ei: {
    rate: number;
    maxInsurableEarnings: number;
  };
}

interface TaxBreakdown {
  grossIncome: number;
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  totalDeductions: number;
  netIncome: number;
  effectiveTaxRate: number;
  taxBrackets: {
    federal: string;
    provincial: string;
  };
}

// 2025 Tax rates for Saskatchewan, Canada
const saskatchewanTaxBracket: TaxBracket = {
  federalRates: [
    { rate: 0.15, threshold: 0 },          // 15% on first $53,359
    { rate: 0.205, threshold: 53359 },     // 20.5% on $53,359 to $106,717
    { rate: 0.26, threshold: 106717 },     // 26% on $106,717 to $165,430
    { rate: 0.29, threshold: 165430 },     // 29% on $165,430 to $235,675
    { rate: 0.33, threshold: 235675 }      // 33% on amount over $235,675
  ],
  provincialRates: [
    { rate: 0.105, threshold: 0 },         // 10.5% on first $49,720
    { rate: 0.125, threshold: 49720 },     // 12.5% on $49,720 to $142,058
    { rate: 0.145, threshold: 142058 }     // 14.5% on amount over $142,058
  ],
  cpp: {
    rate: 0.0595,                          // 5.95% for 2025
    maxContribution: 3867.5,               // Annual maximum
    exemption: 3500                        // Basic exemption
  },
  ei: {
    rate: 0.0158,                          // 1.58% for 2025
    maxInsurableEarnings: 63200            // Maximum insurable earnings
  }
};

// Calculate tax for a specific bracket
const calculateTaxForBracket = (income: number, rates: TaxRate[]): number => {
  let tax = 0;
  let remainingIncome = income;

  for (let i = 0; i < rates.length; i++) {
    const currentRate = rates[i];
    const nextThreshold = i < rates.length - 1 ? rates[i + 1].threshold : Infinity;
    const bracketSize = nextThreshold - currentRate.threshold;
    const taxableInBracket = Math.min(
      remainingIncome,
      bracketSize > 0 ? bracketSize : remainingIncome
    );

    if (taxableInBracket <= 0) break;

    tax += taxableInBracket * currentRate.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
};

// Get tax bracket description based on income
const getTaxBracketDescription = (income: number, rates: TaxRate[]): string => {
  for (let i = rates.length - 1; i >= 0; i--) {
    if (income >= rates[i].threshold) {
      return `${(rates[i].rate * 100).toFixed(1)}%`;
    }
  }
  return "0%";
};

// Calculate CPP (Canada Pension Plan) contribution
const calculateCPP = (income: number, cpp: TaxBracket['cpp']): number => {
  if (income <= cpp.exemption) return 0;
  
  const contributionBase = income - cpp.exemption;
  const contribution = contributionBase * cpp.rate;
  
  return Math.min(contribution, cpp.maxContribution);
};

// Calculate EI (Employment Insurance) contribution
const calculateEI = (income: number, ei: TaxBracket['ei']): number => {
  const contribution = income * ei.rate;
  return Math.min(contribution, ei.maxInsurableEarnings * ei.rate);
};

// Calculate complete tax breakdown for Saskatchewan
export const calculateSaskatchewanTax = (income: number): TaxBreakdown => {
  const federalTax = calculateTaxForBracket(income, saskatchewanTaxBracket.federalRates);
  const provincialTax = calculateTaxForBracket(income, saskatchewanTaxBracket.provincialRates);
  const cppContribution = calculateCPP(income, saskatchewanTaxBracket.cpp);
  const eiContribution = calculateEI(income, saskatchewanTaxBracket.ei);
  
  const totalDeductions = federalTax + provincialTax + cppContribution + eiContribution;
  const netIncome = income - totalDeductions;
  const effectiveTaxRate = (totalDeductions / income) * 100;
  
  return {
    grossIncome: income,
    federalTax,
    provincialTax,
    cpp: cppContribution,
    ei: eiContribution,
    totalDeductions,
    netIncome,
    effectiveTaxRate,
    taxBrackets: {
      federal: getTaxBracketDescription(income, saskatchewanTaxBracket.federalRates),
      provincial: getTaxBracketDescription(income, saskatchewanTaxBracket.provincialRates)
    }
  };
};

// Calculate overtime pay based on rate and regular hourly wage
export const calculateOvertimePay = (
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  overtimeMultiplier: 1.5 | 2
): { regularPay: number; overtimePay: number; totalPay: number } => {
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  const totalPay = regularPay + overtimePay;
  
  return {
    regularPay,
    overtimePay,
    totalPay
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (percentage: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(percentage / 100);
};

/**
 * Borrowing Power Calculator
 * 
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 */

// Global constant for mortgage simulation
const LOAN_TERM_MONTHS = 360; // 30 Years
const INTEREST_RATE = 7.0; // 7.0% baseline interest rate
const ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates

// Tax function w/ API call
async function getTax(income) {
    // http://localhost:3000/api/tax?income=[income]
    const response = await fetch(`http://localhost:3000/api/tax?income=${encodeURIComponent(income)}`,
        {
            headers: { Authorization: "Bearer pat_abcdefghijklmnopqrstuvwxyz0123456789"}
        }
    );
    if (!response.ok) {
        throw new Error(`Request for tax has failed: ${response.status}`);
    }
    const data = await response.json();
    return data.tax;
}
// HEM function w/ API call
async function getHEM(income, dependents) {
    // http://localhost:3000/api/hem?income=[income]&dependents=[dependents]
    const response = await fetch(`http://localhost:3000/api/hem?income=${encodeURIComponent(income)}&dependents=${encodeURIComponent(dependents)}`,
        {headers: {
            Authorization: "Bearer pat_abcdefghijklmnopqrstuvwxyz0123456789"
        }
        }
    );
    if (!response.ok) {
        throw new Error(`Request for HEM has failed: ${response.status}`);
    }
    const data = await response.json();
    return data.hem;
}

/**
 * Calculates the total borrowing power amount and the monthly repayment configuration
 */
async function calculateBorrowingPower(income, dependents, expenses, creditLimits, annualAssessmentRate) {
    // 1. Calculate Net Monthly Income after tax deductions
    const annualTax = await getTax(income);
    const netMonthlyIncome = (income - annualTax) / 12;

    // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
    const baselineHEM = await getHEM(income, dependents);
    const totalLivingExpenses = Math.max(expenses, baselineHEM);

    // 3. Calculate credit card liability (~3% of total limits)
    const creditCardLiability = creditLimits * 0.03;

    // 4. Calculate monthly repayment capacity
    const maxMonthlyRepayment = netMonthlyIncome - totalLivingExpenses - creditCardLiability;

    // Return early if user cannot afford a loan at all
    if (maxMonthlyRepayment <= 0) {
        return { maxLoanAmount: 0, monthlyRepayment: 0 };
    }

    // 5. Calculate the monthly interest rate
    const monthlyRate = (annualAssessmentRate / 100) / 12;

    // 6. Calculate maximum borrowing power using the following formula:
    // P = M * (1 - (1 + R)^-N) / R
    const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, - LOAN_TERM_MONTHS)) / monthlyRate);

    return {
        maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
        monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2))
    };
}

async function runConsoleMode() {
    const readLine = require ('node:readline/promises');
    const rl = readLine.createInterface({ input: process.stdin, output: process.stdout });

    console.log("Mortgage Borrowing Power Calculator");
    console.log("===================================");
    
    const income = await rl.question("Gross Annual Income: $");
    const dependents = await rl.question("Number of Dependents: ");
    const expenses = await rl.question("Declared Monthly Expenses: ");
    const creditLimits = await rl.question("Total Credit Card Limits: $ ");
    const assessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;
    const result = await calculateBorrowingPower(
                        parseFloat(income),
                        parseInt(dependents),
                        parseFloat(expenses),
                        parseFloat(creditLimits),
                        assessmentRate  
                    );
    console.log("\n--- Calculation Summary ---");
    console.log(`Maximum Borrowing Power at ${INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`);
    console.log(`Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`);
                    
    rl.close();
}

if (require.main === module) {
    runConsoleMode();
}

module.exports = { calculateBorrowingPower };
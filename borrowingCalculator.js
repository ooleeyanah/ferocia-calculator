/**
 * Borrowing Power Calculator
 * 
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 */

class BorrowingCalculator {
    // Global constant for mortgage simulation
    static LOAN_TERM_MONTHS = 360; // 30 Years
    static INTEREST_RATE = 7.0; // 7.0% baseline interest rate
    static ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates

    constructor({ apiBaseUrl = 'http://localhost:3000', authToken } = {}) {
        this.apiBaseUrl = apiBaseUrl;
        this.authToken = authToken;
    }

    validateIncome(income) {
        if (isNaN(income)) {
            throw new Error(`Income needs to be a float number`);
        } else if (!Number.isFinite(income)) {
            throw new Error(`Infinity cannot be used as an argument`);
        } else if (income <= 0) {
            throw new Error(`Income needs to be positive`);
        }
        return true;
    }

    validateDependents(dependents) {
        if (isNaN(dependents) || Number.isInteger(dependents) === false) {
            throw new Error(`Dependents needs to be a number`);
        } else if (dependents < 0) {
            throw new Error(`Dependents needs to be zero or a positive number`);
        };
        return true;
    }

    // Tax function w/ API call
    async getTax(income) {
        this.validateIncome(income);
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/tax?income=${encodeURIComponent(income)}`,
                { headers: { Authorization: `Bearer ${this.authToken}` } });
            if (response.ok) {
                const data = await response.json();
                return data.tax;
            }
            throw new Error(`Request for tax has failed: ${response.status}`);

        } catch (error) {
            throw new Error(`Request for tax has failed: ${error.message}`);
        }
    }

    // HEM function w/ API call
    async getHEM(income, dependents) {
        this.validateIncome(income);
        this.validateDependents(dependents);
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/hem?income=${encodeURIComponent(income)}&dependents=${encodeURIComponent(dependents)}`,
                { headers: { Authorization: `Bearer ${this.authToken}` } });

            if (response.ok) {
                const data = await response.json();
                return data.hem;
            }
            throw new Error(`Request for HEM has failed: ${response.status}`);
        } catch (error) {
            throw new Error(`Request for HEM has failed: ${error.message}`);
        }
    }

    /**
     * Calculates the total borrowing power amount and the monthly repayment configuration
     */
    async calculateBorrowingPower(income, dependents, expenses, creditLimits, annualAssessmentRate) {
        if ([income, dependents, expenses, creditLimits, annualAssessmentRate].some(p => p === undefined)) {
            throw new Error(`All arguments are required`);
        }
        if ([income, dependents, expenses, creditLimits, annualAssessmentRate].some(p => p === NaN)) {
            throw new Error(`All arguments must be numbers`);
        }

        // 1. Calculate Net Monthly Income after tax deductions
        const annualTax = await this.getTax(income);
        const netMonthlyIncome = (income - annualTax) / 12;

        // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
        const baselineHEM = await this.getHEM(income, dependents);
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
        const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, - BorrowingCalculator.LOAN_TERM_MONTHS)) / monthlyRate);

        return {
            maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
            monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2))
        };
    }

    async runConsoleMode() {
        const readLine = require('node:readline/promises');
        const rl = readLine.createInterface({ input: process.stdin, output: process.stdout });
        try {
            console.log("Mortgage Borrowing Power Calculator");
            console.log("===================================");

            const income = await rl.question("Gross Annual Income: $");
            const dependents = await rl.question("Number of Dependents: ");
            const expenses = await rl.question("Declared Monthly Expenses: ");
            const creditLimits = await rl.question("Total Credit Card Limits: $ ");
            const assessmentRate = BorrowingCalculator.INTEREST_RATE + BorrowingCalculator.ASSESSMENT_RATE_BUFFER;
            const result = await this.calculateBorrowingPower(
                parseFloat(income),
                parseInt(dependents),
                parseFloat(expenses),
                parseFloat(creditLimits),
                assessmentRate
            );
            console.log("\n--- Calculation Summary ---");
            console.log(`Maximum Borrowing Power at ${BorrowingCalculator.INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`);
            console.log(`Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`);
        } catch (error) {
            console.error(error.message);
        } finally {
            rl.close();
        }
    }
}

if (require.main === module) {
    new BorrowingCalculator({ authToken: "pat_abcdefghijklmnopqrstuvwxyz0123456789" }).runConsoleMode();
}

module.exports = { BorrowingCalculator };
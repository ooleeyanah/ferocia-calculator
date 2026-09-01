# Borrowing Power Calculator

This program runs a borrowing power calculator within the console and with a local server on port 3000.
For an example of a borrowing power calculator: (https://www.bendigobank.com.au/personal/loans/calculators/borrowing-power/).

## This repo is a coding exercise created by Ferocia for their Junior Engineer Application Process.
borrowingCalculator.js and test_calculator.js have been altered from their originals for the purposes of the exercise. This exercise has been completed by Uliana Deshin (August, 2026).

### getTax(income) and getHEM(income, dependents)
The code needs to calculate tax on income and a HEM (Household Expense Measure) value, which are handled respectively by getTax(income) and getHEM(income, dependents).
Each function has been changed from their original code to include an API call.
Ferocia has provided a server.js which can you run locally to expose the following 2 development endpoints:
    http://localhost:3000/api/tax?income=[income]
    http://localhost:3000/api/hem?income=[income]&dependents=[dependents]
Both return JSON and require an authentication header with a valid PAT (Personal Access Token). See server.md for full documentation including the development PAT.

### Extendable class
borrowingCalculator in borrowingCalculator.js has become an extendable class, which includes the following functions:
    validateIncome
    validateDependents
    getTax
    getHEM
    calculateBorrowingPower
    runConsoleMode
This class is then exported to be used in test_calculator.js. See test commands at the bottom of this README.

### Test coverage

Test coverage is run with Istanbul and the nyc command alongside mocha. Coverage of borrowingCalculator.js is at 98.57%.

## Setup

Make sure you have Node.js installed.

Install dependencies:
```
npm install
```

## Server

You wil need to run the development API in it's own terminal window.
(The server will be available at http://localhost:3000/).
To start the server run the following command:
```
npm run api
```
Note: You can stop the server with Ctrl+C


## Running

Run the calculator with:
```
npm start
```


## Testing

Run tests with:
```
npm test
```

Run test coverage with:
```
npm run test:coverage
```


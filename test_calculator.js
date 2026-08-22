/**
 * Borrowing Power Calculator Test Suite
 */


const assert = require('assert'); 
const {calculateBorrowingPower} = require('./borrowingCalculator');

describe('Term Deposit Calculator Tests', () => {

  it('should calculate borrowing power for standard values', async () => {
    const result =  await calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
    assert.strictEqual(result.monthlyRepayment, 4600, 'Monthly repayment should equal $4600');
  });

  // Validation error tests
  it('should return an error for negative income', async () => {
    await assert.rejects( async () => {
      await calculateBorrowingPower(-3000, 0, 2000, 10000, 7.0);
    },
  Error, `Income cannot be negative or zero`);
  });

  it('should return an error for zero income', async () => {
  await assert.rejects( async () => {
      await calculateBorrowingPower(0, 0, 2000, 10000, 7.0);
    },
  Error, `Income cannot be negative or zero`);
  });

  it('should return an error for non-numeric dependents', async () => {
  await assert.rejects( async () => {
      await calculateBorrowingPower(0, "meow", 2000, 10000, 7.0);
    },
  Error, `Dependents needs to be a number from zero to three`);
  });

  it('should return an error for negative dependents', async () => {
  await assert.rejects( async () => {
      await calculateBorrowingPower(0, -2, 2000, 10000, 7.0);
    },
  Error, `Dependents cannot be less than zero`);
  });

  it('should return an error for fractional dependents', async () => {
  await assert.rejects( async () => {
      await calculateBorrowingPower(0, 2.5, 2000, 10000, 7.0);
    },
  Error, `Dependents needs to be a whole number`);  
  });

  it('should return an error for missing arguments', async () => {
  await assert.rejects ( async () => {
      await calculateBorrowingPower();
  },
Error, `You are missing an argument`);
  });
  //Undefined arguments in calculateBorrowingPower
  it('should return an error if any arguments are undefined', async () => {
    await assert.rejects( async () => {
      await calculateBorrowingPower(120000, 1, undefined, 10000);
    },
  Error, `All arguments are required`);
});
// infinity should return error
  it('should return an error if there is Infinity in any argument', async () => {
    await assert.rejects( async () => {
      await calculateBorrowingPower(120000, 1, Infinity, 10000);
    },
  Error, `Infinity cannot be used as an argument`);
});
// NaN should return error
  it('should return an error if there is NaN in any argument', async () => {
    await assert.rejects( async () => {
      await calculateBorrowingPower("120000abc", 1, 3000, 10000);
    },
  Error, `All arguments must be numbers`);
});
});

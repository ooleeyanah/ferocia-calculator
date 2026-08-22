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
  it('should return an error for invalid negative inputs', async () => {
    // testing for negative income error
    await assert.rejects( async () => {
      await calculateBorrowingPower(-3000, 0, 2000, 10000, 7.0);
    },
  Error, `Income cannot be negative or zero`);
  // testing for 0 income error
  await assert.rejects( async () => {
      await calculateBorrowingPower(0, 0, 2000, 10000, 7.0);
    },
  Error, `Income cannot be negative or zero`);
  });

});


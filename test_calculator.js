/**
 * Borrowing Power Calculator Test Suite
 */


const assert = require('assert'); 
const {calculateBorrowingPower} = require('./borrowingCalculator');

describe('Term Deposit Calculator Tests', () => {

  // it('should calculate borrowing power for standard values', async () => {
  //   const result =  await calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
  //   assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
  //   assert.strictEqual(result.monthlyRepayment, 4600, 'Monthly repayment should equal $4600');
  // });

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
// Expense/affordability 
  it('should use expenses if it is higher than baselineHEM', async () => {
    const result = await calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.strictEqual(result.monthlyRepayment, 4600)
  });
  it('should use baselineHEM if it is higher than expenses', async () => {
    const result = await calculateBorrowingPower(120000, 2, 4000, 10000, 7.5);
    assert.strictEqual(result.monthlyRepayment, 3700)
  });
  it('should return zero when repayment capacity equals zero', async () => {
    // net monthly income = 8375, HEM = 3100, CCL = 300
    // 8375 - 8075 - 300 = 0
    const result = await calculateBorrowingPower(120000, 2, 8075, 10000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
  it('should return zero when repayment capacity is below zero', async () => {
    // net monthly income = 8375, HEM = 9000, CCL = 300
    // 8375 - 90000 - 300 = -925
    const result = await calculateBorrowingPower(120000, 2, 9000, 10000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
  it('should show zero credit card limits if credit limits are zero', async () => {
    //creditcardliability is private so i have to make a new var to calc
    // so showing difference between 0 and 10000 ccl should show 10% of 10000 which is 300
    const noCreditLimit = await calculateBorrowingPower(120000, 2, 3000, 0, 7.5);
    const creditLimit = await calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.strictEqual(noCreditLimit.monthlyRepayment - creditLimit.monthlyRepayment, 300);
  });
// tax boundaries
it('should calculate monthly repayment just below the $20,000 tax threshold', async () => {
    const result = await calculateBorrowingPower(
      19999, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.58);
  });

  it('should calculate monthly repayment at the $20,000 tax threshold', async () => {
    const result = await calculateBorrowingPower(
      20000, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.67);
  });

  it('should calculate monthly repayment just above the $20,000 tax threshold', async () => {
    const result = await calculateBorrowingPower(
      20001, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.75);
  });
  it('should calculate monthly repayment just below the $50,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(49999, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 2524.92);
});

it('should calculate monthly repayment at the $50,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(50000, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 2191.67);
});

it('should calculate monthly repayment just above the $50,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(50001, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 2191.75);
});

it('should calculate monthly repayment just below the $100,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(99999, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 4716.58);
});

it('should calculate monthly repayment at the $100,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(100000, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 4716.67);
});

it('should calculate monthly repayment just above the $100,000 tax threshold', async () => {
  const result = await calculateBorrowingPower(100001, 0, 0, 0, 7.5);

  assert.strictEqual(result.monthlyRepayment, 4716.75);
});
})

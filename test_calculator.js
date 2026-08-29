/**
 * Borrowing Power Calculator Test Suite
 */


const sinon = require('sinon');
const assert = require('assert');
const { BorrowingCalculator } = require('./borrowingCalculator');

const calculator = new BorrowingCalculator({ authToken: 'pat_abcdefghijklmnopqrstuvwxyz0123456789' });
const unauthCalculator = new BorrowingCalculator({ authToken: 'wrong_token' });

describe('Testing validateIncome', () => {
  it('should return true for a valid integer value', () => {
    assert.ok(() => calculator.validateIncome(12000))
  });
  it('should return true for valid float value', () => {
    assert.ok(() => calculator.validateIncome(12000.55))
  });
  it('should throw an error if income is NaN', () => {
    assert.throws(() => calculator.validateIncome("meow"),
      {
        name: 'Error',
        message: 'Income needs to be a float number'
      }
    )
  });
  it('should throw an error if income is negative', () => {
    assert.throws(() => calculator.validateIncome(-300),
      {
        name: 'Error',
        message: 'Income needs to be positive'
      }
    )
  });
  it('should throw an error if income is zero', () => {
    assert.throws(() => calculator.validateIncome(0),
      {
        name: 'Error',
        message: 'Income needs to be positive'
      }
    )
  });
  it('should throw an error if income is Infinity', () => {
    assert.throws(() => calculator.validateIncome(Infinity),
      {
        name: 'Error',
        message: 'Infinity cannot be used as an argument'
      }
    )
  });
})

describe('Testing validateDependents', () => {
  it('should return true for a valid integer value', () => {
    assert.ok(() => calculator.validateDependents(2))
  });
  it('should return true for zero', () => {
    assert.ok(() => calculator.validateDependents(0))
  });
  it('should throw an error if dependents is NaN', () => {
    assert.throws(() => calculator.validateDependents("meow"),
      {
        name: 'Error',
        message: 'Dependents needs to be a number'
      }
    )
  });
  it('should throw an error if income is not an integer', () => {
    assert.throws(() => calculator.validateDependents(2.5),
      {
        name: 'Error',
        message: 'Dependents needs to be a number'
      }
    )
  });
  it('should throw an error if dependents is negative', () => {
    assert.throws(() => calculator.validateDependents(-2),
      {
        name: 'Error',
        message: 'Dependents needs to be zero or a positive number'
      }
    )
  });
})

describe('Testing getTax', () => {
  it('should return a tax value for a valid income', async () => {
    const tax = await calculator.getTax(120000);
    assert.strictEqual(tax, 24000);
  });
  it('should throw an error for invalid income', async () => {
    await assert.rejects(
      () => calculator.getTax("meow"),
      { message: 'Income needs to be a float number' }
    );
  });
  it('should return an error for unauthorized API access', async () => {
    await assert.rejects(
      () => unauthCalculator.getTax(120000, 1, 2000, 10000, 7.0),
      { message: 'Request for tax has failed: Request for tax has failed: 401' }
    );
  });
});

describe('Testing getHEM', () => {
  it('should return a HEM value for valid income and dependents', async () => {
    const hem = await calculator.getHEM(120000, 1);
    assert.strictEqual(hem, 2700);
  });
  it('should throw an error for invalid income', async () => {
    await assert.rejects(
      () => calculator.getHEM("meow", 1),
      { message: 'Income needs to be a float number' }
    );
  });
  it('should throw an error for invalid dependents', async () => {
    await assert.rejects(
      () => calculator.getHEM(120000, "meow"),
      { message: 'Dependents needs to be a number' }
    );
  });
  it('should throw an error for negative dependents', async () => {
    await assert.rejects(
      () => calculator.getHEM(120000, -1),
      { message: 'Dependents needs to be zero or a positive number' }
    );
  });
});

describe('Testing getHEM errors with stubbing', () => {
  const calculator = new BorrowingCalculator({ authToken: 'pat_test' });
  let fetchStub;
  beforeEach(() => {
    fetchStub = sinon.stub(global, 'fetch');
  });
  afterEach(() => {
    fetchStub.restore();
  });
  it('should throw an error on a network failure', async () => {
    fetchStub.rejects(new TypeError('fetch failed'));
    await assert.rejects(
      () => calculator.getHEM(120000, 1),
      { message: 'Request for HEM has failed: fetch failed' }
    );
  });
  it('should throw an error when API returns a non-ok response', async () => {
    fetchStub.resolves({
      ok: false, status: 500, json: async () => ({})
    });
    await assert.rejects(
      () => calculator.getHEM(120000, 1),
      { message: 'Request for HEM has failed: Request for HEM has failed: 500' }
    );
  });
  it('should call fetch with the expected URL and auth header', async () => {
    fetchStub.resolves({ ok: true, status: 200, json: async () => ({ hem: 2700 }) });
    await calculator.getHEM(120000, 1);
    assert.strictEqual(fetchStub.calledOnce, true);
    const [url, options] = fetchStub.firstCall.args;
    assert.ok(url.includes('/api/hem?income=120000&dependents=1'));
    assert.strictEqual(options.headers.Authorization, 'Bearer pat_test');
  });
});

describe('Term Deposit Calculator Tests', () => {
  // Validation error tests
  it('should return an error for negative income', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(-3000, 0, 2000, 10000, 7.0),
      { message: 'Income needs to be positive' }
    );
  });

  it('should return an error for zero income', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(0, 0, 2000, 10000, 7.0),
      { message: 'Income needs to be positive' }
    );
  });

  it('should return an error for non-numeric dependents', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(120000, "meow", 2000, 10000, 7.0),
      { message: 'Dependents needs to be a number' }
    );
  });

  it('should return an error for negative dependents', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(120000, -2, 2000, 10000, 7.0),
      { message: 'Dependents needs to be zero or a positive number' }
    );
  });

  it('should return an error for fractional dependents', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(120000, 2.5, 2000, 10000, 7.0),
      { message: 'Dependents needs to be a number' }
    );
  });

  it('should return an error for missing arguments', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(),
      { message: 'All arguments are required' }
    );
  });
  //Undefined arguments in calculateBorrowingPower
  it('should return an error if any arguments are undefined', async () => {
    await assert.rejects(
      () => calculator.calculateBorrowingPower(120000, 1, undefined, 10000, 7.0),
      { message: 'All arguments are required' }
    );
  });
  // infinity should return error
  it('should return an error if there is Infinity in any argument', async () => {
    await assert.rejects(async () => {
      await calculator.calculateBorrowingPower(120000, 1, Infinity, 10000);
    },
      Error, `Infinity cannot be used as an argument`);
  });
  // NaN should return error
  it('should return an error if there is NaN in any argument', async () => {
    await assert.rejects(async () => {
      await calculator.calculateBorrowingPower("120000abc", 1, 3000, 10000);
    },
      Error, `All arguments must be numbers`);
  });
  // Expense/affordability 
  it('should use expenses if it is higher than baselineHEM', async () => {
    const result = await calculator.calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.strictEqual(result.monthlyRepayment, 4600)
  });
  it('should use baselineHEM if it is higher than expenses', async () => {
    const result = await calculator.calculateBorrowingPower(120000, 2, 4000, 10000, 7.5);
    assert.strictEqual(result.monthlyRepayment, 3700)
  });
  it('should return zero when repayment capacity equals zero', async () => {
    // net monthly income = 8375, HEM = 3100, CCL = 300
    // 8375 - 8075 - 300 = 0
    const result = await calculator.calculateBorrowingPower(120000, 2, 8075, 10000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
  it('should return zero when repayment capacity is below zero', async () => {
    // net monthly income = 8375, HEM = 9000, CCL = 300
    // 8375 - 90000 - 300 = -925
    const result = await calculator.calculateBorrowingPower(120000, 2, 9000, 10000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
  it('should show zero credit card liability if credit limits are zero', async () => {
    //creditcardliability is private so i have to make a new var to calc
    // so showing difference between 0 and 10000 ccl should show 3% of 10000 which is 300
    const noCreditLimit = await calculator.calculateBorrowingPower(120000, 2, 3000, 0, 7.5);
    const creditLimit = await calculator.calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.strictEqual(noCreditLimit.monthlyRepayment - creditLimit.monthlyRepayment, 300);
  });
  // tax boundaries
  it('should calculate monthly repayment just below the $20,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(
      19999, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.58);
  });

  it('should calculate monthly repayment at the $20,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(
      20000, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.67);
  });

  it('should calculate monthly repayment just above the $20,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(
      20001, 0, 0, 0, 7.5
    );

    assert.strictEqual(result.monthlyRepayment, 66.75);
  });
  it('should calculate monthly repayment just below the $50,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(49999, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 2191.58);
  });

  it('should calculate monthly repayment at the $50,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(50000, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 2191.67);
  });

  it('should calculate monthly repayment just above the $50,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(50001, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 2191.75);
  });

  it('should calculate monthly repayment just below the $100,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(99999, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 4716.58);
  });

  it('should calculate monthly repayment at the $100,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(100000, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 4716.67);
  });

  it('should calculate monthly repayment just above the $100,000 tax threshold', async () => {
    const result = await calculator.calculateBorrowingPower(100001, 0, 0, 0, 7.5);

    assert.strictEqual(result.monthlyRepayment, 4716.75);
  });
})


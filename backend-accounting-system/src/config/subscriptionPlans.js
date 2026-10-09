const DEFAULT_PAID_PLAN_PRICES = {
  "3months": 1999,
  "6months": 2999,
  yearly: 4999,
};

function configuredPrice(environmentKey, defaultValue) {
  const value = process.env[environmentKey];
  if (value === undefined || value === "") return defaultValue;

  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`${environmentKey} must be a non-negative number`);
  }

  return price;
}

const PLAN_PRICES = {
  trial: 0,
  "3months": configuredPrice("SUBSCRIPTION_PRICE_3MONTHS", DEFAULT_PAID_PLAN_PRICES["3months"]),
  "6months": configuredPrice("SUBSCRIPTION_PRICE_6MONTHS", DEFAULT_PAID_PLAN_PRICES["6months"]),
  yearly: configuredPrice("SUBSCRIPTION_PRICE_YEARLY", DEFAULT_PAID_PLAN_PRICES.yearly),
  custom: 0,
};

module.exports = { PLAN_PRICES, SUBSCRIPTION_CURRENCY: "EGP" };

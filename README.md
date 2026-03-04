# cipherschools-qa-assignment

## Repository overview
This repository contains a complete QA internship assignment with:

- **E2E automation (Playwright + Node.js)** for a full learner journey on Practice Software Testing.
- **Load testing with k6** for the search API.
- **Performance test plan with JMeter** (`.jmx`) for concurrent traffic and response assertions.
- **Environment configuration template** in `config/.env.example`.

## Project structure

```text
cipherschools-qa-assignment/
│
├── e2e/
│   └── playwright_e2e_test.js
│
├── load/
│   ├── jmeter/
│   │   └── search_api_test_plan.jmx
│   │
│   └── k6/
│       └── search_load_test.js
│
├── config/
│   └── .env.example
│
└── README.md
```

## Setup instructions

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd cipherschools-qa-assignment
npm install
npx playwright install chromium
```

### 2) Configure environment variables

Copy the sample env file and adjust values if needed:

```bash
cp config/.env.example config/.env
```

The E2E script reads `BASE_URL` from environment variables.

## How to run Playwright E2E test

Run:

```bash
npm run e2e
```

> This command uses the **Playwright test runner** (`@playwright/test`).

### What this test does
The script performs this learner journey:

1. Reads `BASE_URL` from environment variables.
2. Navigates to `https://with-bugs.practicesoftwaretesting.com`.
3. Registers a new user with realistic details.
4. Logs in using the newly created credentials.
5. Searches for `hammer`.
6. Opens the first product result.
7. Adds the product to cart.
8. Asserts that the cart item count increments.

It uses the Playwright test runner with `async/await`, robust selectors (`role`, `label`, and `data-test`), explicit waits, and cart count increment assertions with built-in polling.

## How to run k6 load test

Install k6 (if not installed) and run:

```bash
k6 run load/k6/search_load_test.js
# or
cd load/k6 && k6 run search_load_test.js
```

### k6 load profile

- Ramp up to **20 VUs** in **10s**
- Hold **20 VUs** for **30s**
- Ramp down to **0 VUs** in **10s**

### k6 thresholds

- `p(95)` request duration `< 2000ms`
- request failure rate `< 1%`

## JMeter test plan explanation

File: `load/jmeter/search_api_test_plan.jmx`

This test plan:

- Calls the search endpoint:  
  `GET https://api-with-bugs.practicesoftwaretesting.com/products/search?q=hammer`
- Simulates **10 concurrent users**.
- Runs for **60 seconds** (scheduler-enabled thread group).
- Includes assertions:
  - Status code is `200`
  - Response time is under `2000ms`
  - Response body contains `hammer` (indicating matching product results)

### Run JMeter in non-GUI mode

```bash
jmeter -n -t load/jmeter/search_api_test_plan.jmx -l results.jtl
```

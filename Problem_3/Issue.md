# Issues in Readme

## Overview
This document outlines the computational inefficiencies and anti-patterns identified in the provided ReactJS/TypeScript code block. Below are the detailed issues and suggestions for improvement.

## Identified Issues

### 1. Type Errors
- **Problem:** The `WalletBalance` interface lacks the `blockchain` property, causing `getPriority` to fail due to undefined access.
- **Impact:** Type safety is compromised, leading to runtime errors.

### 2. Logic Error
- **Problem:** In the `filter` function, `lhsPriority` is used but undefined; it should be `balancePriority`.
- **Impact:** Incorrect filtering logic due to variable naming mismatch.

### 3. Inefficient Filtering
- **Problem:** The `filter` condition allows negative or zero balances (`balance.amount <= 0`), which may be unintended.
- **Suggestion:** Clarify logic (e.g., `balance.amount > 0`) to ensure only positive balances are included.
- **Impact:** Potential inclusion of invalid data.

### 4. Incomplete Sorting
- **Problem:** The `sort` function lacks a return value for equal priorities, leading to inconsistent sorting results.
- **Suggestion:** Add `return 0` for cases where priorities are equal.
- **Impact:** Unpredictable order of elements with the same priority.

### 5. Unnecessary Dependency
- **Problem:** `useMemo` depends on `prices`, but it’s not used in the `filter` or `sort` logic.
- **Suggestion:** Remove `prices` from the dependency array.
- **Impact:** Unnecessary re-computation when `prices` changes.

### 6. Formatting Issue
- **Problem:** `toFixed()` without a parameter may return inconsistent decimal places.
- **Suggestion:** Specify precision (e.g., `toFixed(2)`).
- **Impact:** Inconsistent display of monetary values.

### 7. Type Mismatch
- **Problem:** `formattedBalances` uses `WalletBalance`, but `toFixed()` returns a string, conflicting with `amount: number` in the interface.
- **Suggestion:** Ensure `FormattedWalletBalance` correctly uses `formatted: string`.
- **Impact:** Type safety and compilation errors.

### 8. Key Warning
- **Problem:** Using `index` as a `key` in `rows` can cause performance issues with reordering.
- **Suggestion:** Use a unique key (e.g., `balance.currency + balance.amount`).
- **Impact:** Potential React performance degradation and bugs during list updates.
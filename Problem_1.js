// ==================================
// Method 1: Use loop
// ==================================
function sum_to_n_a(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// ==================================
// Method 2: Use math
// ==================================
function sum_to_n_b(n) {
    return n * (n + 1) / 2;
}

// ==================================
// Method 3: Use recursion
// ==================================
function sum_to_n_c(n) {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
}

console.log("Method 1 - for loop:", sum_to_n_a(5));  // Output: 15
console.log("Method 2 - formula:", sum_to_n_b(5));   // Output: 15
console.log("Method 3 - recursion:", sum_to_n_c(5)); // Output: 15

// ─── Default code snippets for each language ─────────────────────────────────
// Each snippet introduces CodePulse and includes a simple, meaningful sample program.

export const DEFAULT_CODES = {
  javascript: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

const numbers = [2, 4, 7, 10, 13];
const primes = numbers.filter(isPrime);

console.log("Original numbers:", numbers);
console.log("Prime numbers:", primes);
`,

  typescript: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

interface Product {
  name: string;
  price: number;
}

function calculateTotal(products: Product[]): number {
  return products.reduce((sum, item) => sum + item.price, 0);
}

const cart: Product[] = [
  { name: "Laptop", price: 1200 },
  { name: "Mouse", price: 25 }
];

console.log("Total price: $" + calculateTotal(cart));
`,

  python: `# 🚀 Welcome to CodePulse — The Intelligent Code Workspace
# Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
# Try the Scratch Pad for notes and to-dos!

def is_prime(num: int) -> bool:
    """Check if a number is prime."""
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

numbers = [2, 4, 7, 10, 13]
primes = [n for n in numbers if is_prime(n)]

print(f"Original numbers: {numbers}")
print(f"Prime numbers: {primes}")
`,

  java: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

// Note: class is not public so it works with any filename (e.g. prog.java)
class Main {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 7, 10, 13};

        System.out.println("Checking prime numbers:");
        for (int num : numbers) {
            if (isPrime(num)) {
                System.out.println(num + " is prime");
            }
        }
    }

    // Returns true if num is a prime number
    static boolean isPrime(int num) {
        if (num <= 1) return false;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
}
`,

  cpp: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

#include <iostream>
#include <vector>

using namespace std;

// Function to check if a number is prime
bool isPrime(int num) {
    if (num <= 1) return false;
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) return false;
    }
    return true;
}

int main() {
    vector<int> numbers = {2, 4, 7, 10, 13};
    
    cout << "Checking prime numbers:" << endl;
    for (int num : numbers) {
        if (isPrime(num)) {
            cout << num << " is prime" << endl;
        }
    }
    return 0;
}
`,

  c: `/* 🚀 Welcome to CodePulse — The Intelligent Code Workspace
   Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
   Try the Scratch Pad for notes and to-dos! */

#include <stdio.h>
#include <stdbool.h>

/* Function to check if a number is prime */
bool isPrime(int num) {
    if (num <= 1) return false;
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) return false;
    }
    return true;
}

int main() {
    int numbers[] = {2, 4, 7, 10, 13};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Checking prime numbers:\\n");
    for (int i = 0; i < size; i++) {
        if (isPrime(numbers[i])) {
            printf("%d is prime\\n", numbers[i]);
        }
    }
    return 0;
}
`,

  csharp: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

using System;
using System.Linq;

class Program {
    static void Main() {
        int[] numbers = { 2, 4, 7, 10, 13 };
        
        var primes = numbers.Where(IsPrime);
        
        Console.WriteLine("Prime numbers: " + string.Join(", ", primes));
    }

    // Method to check if a number is prime
    static bool IsPrime(int num) {
        if (num <= 1) return false;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
}
`,

  go: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

package main

import "fmt"

// isPrime checks if a number is prime
func isPrime(num int) bool {
	if num <= 1 {
		return false
	}
	for i := 2; i*i <= num; i++ {
		if num%i == 0 {
			return false
		}
	}
	return true
}

func main() {
	numbers := []int{2, 4, 7, 10, 13}
	
	fmt.Println("Checking prime numbers:")
	for _, num := range numbers {
		if isPrime(num) {
			fmt.Printf("%d is prime\\n", num)
		}
	}
}
`,

  rust: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

// Function to check if a number is prime
fn is_prime(num: u32) -> bool {
    if num <= 1 {
        return false;
    }
    for i in 2..=(num as f64).sqrt() as u32 {
        if num % i == 0 {
            return false;
        }
    }
    true
}

fn main() {
    let numbers = vec![2, 4, 7, 10, 13];
    
    println!("Checking prime numbers:");
    for num in numbers {
        if is_prime(num) {
            println!("{} is prime", num);
        }
    }
}
`,

  php: `<?php
// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

// Function to check if a number is prime
function isPrime($num) {
    if ($num <= 1) return false;
    for ($i = 2; $i * $i <= $num; $i++) {
        if ($num % $i == 0) return false;
    }
    return true;
}

$numbers = [2, 4, 7, 10, 13];

echo "Checking prime numbers:\\n";
foreach ($numbers as $num) {
    if (isPrime($num)) {
        echo "$num is prime\\n";
    }
}
?>
`,

  ruby: `# 🚀 Welcome to CodePulse — The Intelligent Code Workspace
# Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
# Try the Scratch Pad for notes and to-dos!

# Method to check if a number is prime
def is_prime?(num)
  return false if num <= 1
  (2..Math.sqrt(num)).each do |i|
    return false if num % i == 0
  end
  true
end

numbers = [2, 4, 7, 10, 13]
primes = numbers.select { |n| is_prime?(n) }

puts "Original numbers: #{numbers}"
puts "Prime numbers: #{primes}"
`,

  swift: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

import Foundation

// Function to check if a number is prime
func isPrime(_ num: Int) -> Bool {
    if num <= 1 { return false }
    if num <= 3 { return true }
    
    let limit = Int(Double(num).squareRoot())
    if limit >= 2 {
        for i in 2...limit {
            if num % i == 0 { return false }
        }
    }
    return true
}

let numbers = [2, 4, 7, 10, 13]
let primes = numbers.filter(isPrime)

print("Original numbers: \\(numbers)")
print("Prime numbers: \\(primes)")
`,

  kotlin: `// 🚀 Welcome to CodePulse — The Intelligent Code Workspace
// Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
// Try the Scratch Pad for notes and to-dos!

// Function to check if a number is prime
fun isPrime(num: Int): Boolean {
    if (num <= 1) return false
    var i = 2
    while (i * i <= num) {
        if (num % i == 0) return false
        i++
    }
    return true
}

fun main() {
    val numbers = listOf(2, 4, 7, 10, 13)
    val primes = numbers.filter { isPrime(it) }
    
    println("Original numbers: $numbers")
    println("Prime numbers: $primes")
}
`,

  shell: `#!/bin/bash
# 🚀 Welcome to CodePulse — The Intelligent Code Workspace
# Write code, hit "Run" to execute it, or "Review" for instant AI feedback.
# Try the Scratch Pad for notes and to-dos!

# Function to check if a number is even
is_even() {
    if [ $(($1 % 2)) -eq 0 ]; then
        echo "$1 is even"
    else
        echo "$1 is odd"
    fi
}

numbers=(2 7 10)

echo "Checking numbers:"
for num in "\${numbers[@]}"; do
    is_even $num
done
`,
};

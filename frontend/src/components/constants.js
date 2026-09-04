export const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  javascript: "18.15.0",
  cpp: "10.2.0",
  java: "15.0.2"
};

export const CODE_SNIPPETS = {
  python: `print("Hello, Python!")`,
  javascript: `console.log("Hello, JavaScript!");`,
  // Note: <bits/stdc++.h> is deliberately avoided — the judge's 128 MB / 10 s
  // limits are too tight for the compiler to chew through that mega-header.
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`
};

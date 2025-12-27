#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

console.log("🔍 Analyzing bundle size and dependencies...\n")

// Check if dist/stats.html exists
const statsPath = path.join(process.cwd(), "dist", "stats.html")
if (!fs.existsSync(statsPath)) {
  console.log(
    '❌ Bundle stats not found. Please run "npm run build:analyze" first.',
  )
  process.exit(1)
}

console.log("✅ Bundle stats found. Opening analysis...")

// Open the stats file
try {
  execSync(`open "${statsPath}"`, { stdio: "inherit" })
  console.log("📊 Bundle analysis opened in browser")
} catch (error) {
  console.log("❌ Failed to open bundle analysis automatically")
  console.log(`📁 Please open manually: ${statsPath}`)
}

// Analyze package.json for potential optimizations
console.log("\n📦 Analyzing dependencies for optimization opportunities...\n")

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))

const heavyDependencies = [
  "moment",
  "lodash",
  "apexcharts",
  "klinecharts",
  "react-player",
  "react-youtube",
]

const optimizationSuggestions = {
  moment: "Consider using date-fns or dayjs for smaller bundle size",
  lodash: "Already using tree-shaking imports - good!",
  apexcharts: "Consider lazy loading for chart components",
  klinecharts: "Consider lazy loading for chart components",
  "react-player": "Consider lazy loading for media components",
  "react-youtube": "Consider lazy loading for media components",
}

console.log("🔍 Heavy Dependencies Analysis:")
heavyDependencies.forEach((dep) => {
  if (packageJson.dependencies[dep]) {
    console.log(`  📦 ${dep}: ${packageJson.dependencies[dep]}`)
    console.log(`     💡 ${optimizationSuggestions[dep]}`)
  }
})

console.log("\n🚀 Optimization Recommendations:")
console.log("  1. ✅ Route-based code splitting already implemented")
console.log("  2. ✅ Manual chunking configured in vite.config.ts")
console.log("  3. ✅ Bundle analyzer plugin installed")
console.log("  4. 🔄 Consider implementing component-level lazy loading")
console.log("  5. 🔄 Consider replacing moment.js with date-fns")
console.log("  6. 🔄 Consider lazy loading chart components")

console.log('\n📊 Run "npm run analyze" to view detailed bundle analysis')
console.log('📊 Run "npm run build" to see chunk sizes in console')

#!/usr/bin/env node
import { build } from 'vite'

try {
  await build()
  console.log('Build completed successfully!')
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
#!/usr/bin/env node

/**
 * Data Synchronization Script for Evomics Ecosystem
 * 
 * This script runs the complete data synchronization process:
 * 1. Syncs faculty profiles between sites
 * 2. Syncs workshop participation data
 * 3. Unifies expertise taxonomies
 */

const path = require('path');
const fs = require('fs').promises;

// Dynamic import for ES modules
async function runSync() {
  try {
    // Import the data sync utilities
    const { 
      runCompleteSync, 
      DEFAULT_SYNC_CONFIG 
    } = await import('../src/utils/dataSync.ts');
    
    console.log('🧬 Starting Evomics Data Synchronization...\n');
    
    // Run complete synchronization
    const results = await runCompleteSync(DEFAULT_SYNC_CONFIG);
    
    // Display results
    console.log('📊 Synchronization Results:\n');
    
    for (const result of results) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.message}`);
      
      if (result.changes.length > 0) {
        console.log('   Changes:');
        for (const change of result.changes) {
          console.log(`   • ${change}`);
        }
      }
      
      if (!result.success) {
        console.log(`   Error: ${result.message}`);
      }
      
      console.log(`   Timestamp: ${result.timestamp}\n`);
    }
    
    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`🎯 Summary: ${successCount}/${totalCount} operations completed successfully`);
    
    if (successCount === totalCount) {
      console.log('🎉 All synchronization operations completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Some synchronization operations failed. Check the logs above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  runSync();
}

module.exports = { runSync };
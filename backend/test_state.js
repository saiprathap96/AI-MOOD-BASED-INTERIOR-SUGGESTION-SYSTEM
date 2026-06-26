const db = require('./utils/db');

async function runTest() {
  try {
    await db.init();
    
    let history = await db.getAllSuggestions();
    console.log('--- BEFORE DELETION ---');
    console.log('Total count:', history.length);
    history.forEach(h => console.log(`- ID: ${h.id}`));
    
    if (history.length === 0) {
      console.log('Database empty, nothing to delete.');
      return;
    }
    
    const target = history[0].id;
    console.log(`\nDeleting single target: ${target}`);
    const result = await db.deleteSuggestion(target);
    console.log('Deletion result:', result);
    
    history = await db.getAllSuggestions();
    console.log('\n--- AFTER DELETION ---');
    console.log('Total count:', history.length);
    history.forEach(h => console.log(`- ID: ${h.id}`));
    
  } catch (err) {
    console.error('Error running test:', err);
  }
}

runTest();

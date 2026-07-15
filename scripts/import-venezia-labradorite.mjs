if (!process.argv.some((argument) => argument.startsWith('--category='))) {
  process.argv.push('--category=labradorite');
}

await import('./import-venezia-quartzite.mjs');

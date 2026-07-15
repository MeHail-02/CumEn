if (!process.argv.some((argument) => argument.startsWith('--category='))) {
  process.argv.push('--category=oniks');
}

await import('./import-venezia-quartzite.mjs');

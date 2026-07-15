if (!process.argv.some((argument) => argument.startsWith('--category='))) {
  process.argv.push('--category=travertin');
}

await import('./import-venezia-quartzite.mjs');

// stats.js (à lancer en parallèle ou intégré dans index.js)
setInterval(() => {
    const m = process.memoryUsage();
    console.log(`── Mémoire Node.js ──
    RSS       : ${(m.rss       /1024/1024).toFixed(2)} MB
    heapTotal : ${(m.heapTotal /1024/1024).toFixed(2)} MB
    heapUsed  : ${(m.heapUsed  /1024/1024).toFixed(2)} MB
    external  : ${(m.external  /1024/1024).toFixed(2)} MB
    `);
  }, 60_000); // toutes les 60 s
  
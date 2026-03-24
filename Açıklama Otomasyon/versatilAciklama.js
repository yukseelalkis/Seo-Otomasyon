const { main } = require("./index");

main().catch((error) => {
  console.error("Hata:", error.message);
  process.exitCode = 1;
});

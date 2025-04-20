import { isTshirt } from "./ai.js";
import { processProducts } from "./mongoHelper.js";

console.log("🔍 Starting AI TSHIRT classifier...");

let successCount = 0;
let errorCount = 0;

await processProducts(async (doc, col) => {
  try {
    if (!doc.title) {
      console.warn(`⚠️  Skipping document with missing title: _id=${doc._id}`);
      errorCount++;
      return;
    }

    const is = await isTshirt(doc.title);
    const newType = is ? "TSHIRT" : "OTHER";

    await col.updateOne({ _id: doc._id }, { $set: { type: newType } });

    console.log(`✅ "${doc.title}" → ${newType}`);
    successCount++;

  } catch (err) {
    console.error(`❌ Error processing "${doc?.title || 'unknown'}":`, err.message);
    errorCount++;
  }
});

console.log("\n🎉 Classification complete!");
console.log(`🔹 Success: ${successCount}`);
console.log(`🔸 Errors : ${errorCount}`);

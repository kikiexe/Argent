import { createClient } from "@supabase/supabase-js";

async function testRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.length !== 4) {
    console.log("Usage: bun run scratch/test-rls.ts <email-a> <pass-a> <email-b> <pass-b>");
    process.exit(1);
  }

  const [emailA, passA, emailB, passB] = args;

  console.log("Initializing Supabase clients...");
  const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  /* 1. Authenticate User A */
  console.log(`Authenticating User A (${emailA})...`);
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({ email: emailA, password: passA });
  if (errA) {
    console.error("Auth A failed:", errA.message);
    process.exit(1);
  }
  const userAId = authA.user.id;
  console.log(`User A authenticated. ID: ${userAId}`);

  /* 2. Authenticate User B */
  console.log(`Authenticating User B (${emailB})...`);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({ email: emailB, password: passB });
  if (errB) {
    console.error("Auth B failed:", errB.message);
    process.exit(1);
  }
  const userBId = authB.user.id;
  console.log(`User B authenticated. ID: ${userBId}`);

  /* Clean up any test categories if they exist */
  await clientA.from("categories").delete().eq("name", "RLS_TEST_CATEGORY");

  /* 3. User A inserts a category */
  console.log("\n--- Testing INSERT ---");
  console.log("User A inserting test category 'RLS_TEST_CATEGORY'...");
  const { data: insertedCat, error: insertErr } = await clientA
    .from("categories")
    .insert({
      name: "RLS_TEST_CATEGORY",
      type: "EXPENSE",
      user_id: userAId
    })
    .select()
    .single();

  if (insertErr) {
    console.error("Insert failed:", insertErr.message);
    process.exit(1);
  }
  const categoryId = insertedCat.id;
  console.log(`Category inserted successfully. ID: ${categoryId}`);

  /* 4. User B attempts to read User A's category */
  console.log("\n--- Testing SELECT (Isolation) ---");
  console.log("User B reading categories...");
  const { data: catsB, error: selectErrB } = await clientB
    .from("categories")
    .select("*");

  if (selectErrB) {
    console.error("Select for User B failed:", selectErrB.message);
  } else {
    const hasA = catsB.some(c => c.id === categoryId);
    if (hasA) {
      console.error("SECURITY FAILURE: User B was able to see User A's category!");
    } else {
      console.log("SECURITY SUCCESS: User B cannot see User A's category.");
    }
  }

  /* 5. User B attempts to modify User A's category */
  console.log("\n--- Testing UPDATE (Isolation) ---");
  console.log("User B attempting to rename User A's category...");
  const { data: updateB, error: updateErrB } = await clientB
    .from("categories")
    .update({ name: "HACKED_BY_B" })
    .eq("id", categoryId)
    .select();

  if (updateErrB) {
    console.log(`Update failed as expected: ${updateErrB.message}`);
  }
  
  /* Double check name from User A's perspective */
  const { data: catCheckA } = await clientA
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (catCheckA && catCheckA.name === "RLS_TEST_CATEGORY") {
    console.log("SECURITY SUCCESS: User B was unable to modify User A's category name.");
  } else {
    console.error("SECURITY FAILURE: User B successfully renamed User A's category!");
  }

  /* 6. Test Transactions RLS */
  console.log("\n--- Testing Transactions RLS ---");
  console.log("User A inserting test transaction under category...");
  const { data: insertedTx, error: txInsertErr } = await clientA
    .from("transactions")
    .insert({
      type: "EXPENSE",
      amount: 150000,
      category_id: categoryId,
      date: "2026-07-26",
      note: "RLS_TEST_TX",
      user_id: userAId
    })
    .select()
    .single();

  if (txInsertErr) {
    console.error("Transaction insert failed:", txInsertErr.message);
    process.exit(1);
  }
  const txId = insertedTx.id;
  console.log(`Transaction inserted successfully. ID: ${txId}`);

  /* User B reads transactions */
  console.log("User B reading transactions...");
  const { data: txsB, error: txSelectErrB } = await clientB
    .from("transactions")
    .select("*");

  if (txSelectErrB) {
    console.error("Transactions select for User B failed:", txSelectErrB.message);
  } else {
    const hasTx = txsB.some(t => t.id === txId);
    if (hasTx) {
      console.error("❌ SECURITY FAILURE: User B was able to see User A's transaction!");
    } else {
      console.log("✅ SECURITY SUCCESS: User B cannot see User A's transaction.");
    }
  }

  /* User B attempts to modify User A's transaction */
  console.log("User B attempting to modify User A's transaction amount...");
  const { error: txUpdateErrB } = await clientB
    .from("transactions")
    .update({ amount: 999999 })
    .eq("id", txId);

  if (txUpdateErrB) {
    console.log(`Transaction update failed as expected: ${txUpdateErrB.message}`);
  }

  /* Double check transaction amount from User A's perspective */
  const { data: txCheckA } = await clientA
    .from("transactions")
    .select("amount")
    .eq("id", txId)
    .single();

  if (txCheckA && Number(txCheckA.amount) === 150000) {
    console.log("✅ SECURITY SUCCESS: User B was unable to modify User A's transaction amount.");
  } else {
    console.error("❌ SECURITY FAILURE: User B successfully modified User A's transaction!");
  }

  /* 7. Test Monthly Budgets RLS */
  console.log("\n--- Testing Monthly Budgets RLS ---");
  /* Clean up any test budget if exists */
  await clientA.from("monthly_budgets").delete().eq("year", 2099);

  console.log("User A inserting test budget for year 2099...");
  const { data: insertedBudget, error: budgetInsertErr } = await clientA
    .from("monthly_budgets")
    .insert({
      month: 7,
      year: 2099,
      total_limit: 5000000,
      user_id: userAId
    })
    .select()
    .single();

  if (budgetInsertErr) {
    console.error("Budget insert failed:", budgetInsertErr.message);
    process.exit(1);
  }
  const budgetId = insertedBudget.id;
  console.log(`Budget inserted successfully. ID: ${budgetId}`);

  /* User B reads budgets */
  console.log("User B reading budgets...");
  const { data: budgetsB, error: budgetSelectErrB } = await clientB
    .from("monthly_budgets")
    .select("*");

  if (budgetSelectErrB) {
    console.error("Budgets select for User B failed:", budgetSelectErrB.message);
  } else {
    const hasBudget = budgetsB.some(b => b.id === budgetId);
    if (hasBudget) {
      console.error("❌ SECURITY FAILURE: User B was able to see User A's budget!");
    } else {
      console.log("✅ SECURITY SUCCESS: User B cannot see User A's budget.");
    }
  }

  /* User B attempts to modify User A's budget */
  console.log("User B attempting to modify User A's budget limit...");
  const { error: budgetUpdateErrB } = await clientB
    .from("monthly_budgets")
    .update({ total_limit: 9000000 })
    .eq("id", budgetId);

  if (budgetUpdateErrB) {
    console.log(`Budget update failed as expected: ${budgetUpdateErrB.message}`);
  }

  /* Double check budget limit from User A's perspective */
  const { data: budgetCheckA } = await clientA
    .from("monthly_budgets")
    .select("total_limit")
    .eq("id", budgetId)
    .single();

  if (budgetCheckA && Number(budgetCheckA.total_limit) === 5000000) {
    console.log("✅ SECURITY SUCCESS: User B was unable to modify User A's budget limit.");
  } else {
    console.error("❌ SECURITY FAILURE: User B successfully modified User A's budget limit!");
  }

  /* Clean up all test data */
  console.log("\nCleaning up test data...");
  await clientA.from("transactions").delete().eq("id", txId);
  await clientA.from("monthly_budgets").delete().eq("id", budgetId);
  await clientA.from("categories").delete().eq("id", categoryId);
  console.log("Done.");
}

testRLS();

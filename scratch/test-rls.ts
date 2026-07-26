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

  /* Clean up */
  console.log("\nCleaning up test data...");
  await clientA.from("categories").delete().eq("id", categoryId);
  console.log("Done.");
}

testRLS();

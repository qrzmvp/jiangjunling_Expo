
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbspfrjxokthzvdmibuo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic3Bmcmp4b2t0aHp2ZG1pYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTA3NDIsImV4cCI6MjA4MjA2Njc0Mn0.k3ThDJVhf8yf0kw4dpbqWwQpfJMQkPgX5bwmU7zLghc';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // No need to persist for this test script
  }
});

async function testAuthFlow() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  console.log(`Testing with email: ${email}`);

  // 1. Try to Sign Up (Registration)
  console.log('Attempting Sign Up...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.log('Sign Up Error:', signUpError.message);
    
    // If user already exists, try to sign in
    if (signUpError.message.includes('already registered') || signUpError.status === 400) {
       console.log('User exists, attempting Sign In...');
       const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Sign In Failed:', signInError.message);
      } else {
        console.log('Sign In Successful!', signInData.user.id);
      }
    }
  } else {
    if (signUpData.user) {
        console.log('Sign Up Successful!', signUpData.user.id);
        // Now try to sign in with the same credentials to verify the flow for existing users
        console.log('Now testing re-login (simulating existing user)...');
        
        // We need to sign out first or just use a new call
        await supabase.auth.signOut();

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            console.error('Re-login Failed:', signInError.message);
        } else {
            console.log('Re-login Successful!', signInData.user.id);
        }

    } else {
        console.log('Sign Up initiated, but no user data returned (maybe email confirmation required?)');
    }
  }
}

testAuthFlow();

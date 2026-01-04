
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qzcblykahxzktiprxhbf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Y2JseWthaHh6a3RpcHJ4aGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU0MjksImV4cCI6MjA4MjQ5MTQyOX0.LSVP7CMvqOu2SBaCQjwYoxKO-B4z7Dhcvjthyorbziw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLeaderboard() {
  console.log('🔵 Fetching leaderboard data from Supabase...');
  
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_user_id: null
  });

  if (error) {
    console.error('❌ Error fetching leaderboard:', error);
    return;
  }

  console.log('✅ Leaderboard Data:');
  console.log('------------------------------------------------');
  console.log('Rank | Name | Signal Count | ID');
  console.log('------------------------------------------------');
  
  if (data && data.length > 0) {
    data.forEach((trader, index) => {
      console.log(`${index + 1} | ${trader.name} | ${trader.signal_count} | ${trader.id}`);
    });
  } else {
    console.log('No data found.');
  }
  console.log('------------------------------------------------');
}

verifyLeaderboard();

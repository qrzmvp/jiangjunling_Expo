// 测试 Supabase 数据库表
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbspfrjxokthzvdmibuo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic3Bmcmp4b2t0aHp2ZG1pYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTA3NDIsImV4cCI6MjA4MjA2Njc0Mn0.k3ThDJVhf8yf0kw4dpbqWwQpfJMQkPgX5bwmU7zLghc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('=== 检查 Supabase 数据库表 ===\n');

  // 尝试查询 users 表
  console.log('1️⃣ 查询 users 表:');
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5);
  
  if (usersError) {
    console.log('❌ users 表错误:', usersError.message);
  } else {
    console.log('✅ users 表存在，记录数:', usersData?.length || 0);
    if (usersData && usersData.length > 0) {
      console.log('字段:', Object.keys(usersData[0]));
    }
  }

  console.log('\n2️⃣ 查询 auth.users (系统表):');
  const { data: authUsersData, error: authUsersError } = await supabase.auth.getUser();
  
  if (authUsersError) {
    console.log('❌ 未登录或获取失败:', authUsersError.message);
  } else {
    console.log('✅ 当前登录用户:', authUsersData?.user?.email || '未登录');
  }

  console.log('\n=== 检查完成 ===');
}

checkTables();

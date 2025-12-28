// 检查 Supabase 中的 profiles 表
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbspfrjxokthzvdmibuo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic3Bmcmp4b2t0aHp2ZG1pYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTA3NDIsImV4cCI6MjA4MjA2Njc0Mn0.k3ThDJVhf8yf0kw4dpbqWwQpfJMQkPgX5bwmU7zLghc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  console.log('=== 检查 Supabase 数据库中的表 ===\n');

  // 1. 检查 profiles 表
  console.log('1️⃣ 检查 profiles 表:');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ profiles 表错误:', error.message);
      console.log('   详细信息:', error);
    } else {
      console.log('✅ profiles 表存在');
      console.log('   记录数:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('   字段:', Object.keys(data[0]));
        console.log('   示例数据:', data[0]);
      } else {
        console.log('   表是空的');
      }
    }
  } catch (e) {
    console.log('❌ 查询异常:', e.message);
  }

  console.log('\n2️⃣ 检查 users 表:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ users 表错误:', error.message);
    } else {
      console.log('✅ users 表存在');
      console.log('   记录数:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('   字段:', Object.keys(data[0]));
      } else {
        console.log('   表是空的');
      }
    }
  } catch (e) {
    console.log('❌ 查询异常:', e.message);
  }

  console.log('\n=== 检查完成 ===');
}

checkProfiles();

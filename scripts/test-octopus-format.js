/**
 * 测试八爪鱼格式数据的 webhook
 * 使用真实的八爪鱼导出数据格式: {ColumnNames, Values}
 */

const WEBHOOK_URL = 'https://qzcblykahxzktiprxhbf.supabase.co/functions/v1/rpa-webhook';

// 八爪鱼实际导出的数据格式
const octopusData = {
  "ColumnNames": ["KOL名称", "数据源", "方向", "交易对", "入场价", "止盈价", "止损价", "杠杆", "创建时间"],
  "Values": [
    ["舒琴操作日记VIP分享", "舒琴操作日记VIP分享\n🔥｜舒琴行情分析", "做空", "ETH/USDT", "3165-3190", "3075", "3220", "2x", "17:40"],
    ["A", "A\n🔥交易员-moritz", "做多", "HYPE/USDT", "37.39", "50.753", "34.976", "未提供", "17:31"],
    ["Sveezy 🔥 | Unity", "Sveezy 🔥 | Unity\n🔥｜trader-sveezy", "现货", "EVAA/USDT", "0.8878", "未提供", "0.8503", "未提供", "17:13"],
    ["cryptoamanclubpremium", "cryptoamanclubpremium\n🔥｜amans-vip", "做多", "ETH/USDT", "-", "2995", "2940", "未提供", "16:29"],
    ["A", "A\n🔥wwg-muzzagin", "做多", "ETH/USDT", "3060", "未提供", "未提供", "未提供", "16:23"]
  ]
};

async function testOctopusWebhook() {
  console.log('=== 测试八爪鱼格式数据 ===\n');
  console.log('发送数据:');
  console.log(JSON.stringify(octopusData, null, 2));
  console.log('\n发送请求到:', WEBHOOK_URL);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(octopusData),
    });

    const result = await response.json();
    
    console.log('\n=== 响应结果 ===');
    console.log('状态码:', response.status);
    console.log('响应体:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ 测试成功!');
      console.log(`- 自动创建交易员: ${result.results.traders_auto_created} 个`);
      console.log(`- 处理信号: ${result.results.signals_processed} 个`);
      console.log(`- 成功创建信号: ${result.results.signals_created} 个`);
      
      if (result.results.errors.length > 0) {
        console.log('\n⚠️ 错误列表:');
        result.results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('\n❌ 测试失败:', result.error);
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

testOctopusWebhook();

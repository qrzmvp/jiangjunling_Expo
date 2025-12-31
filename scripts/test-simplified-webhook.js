/**
 * 简化版测试 - 只发送信号数据
 * 演示最简单的使用方式
 */

const WEBHOOK_URL = 'https://qzcblykahxzktiprxhbf.supabase.co/functions/v1/rpa-webhook';

// 简化版数据 - 只需要信号数组
const simplifiedData = {
  signals: [
    {
      trader_name: 'John_Trader_' + Date.now(),
      currency: 'BTC/USDT',
      direction: '做多',
      entry_price: '95000',
      stop_loss: '94000',
      take_profit: '97000',
      leverage: '10x'
    },
    {
      trader_name: 'Mary_Trader_' + Date.now(),
      currency: 'ETH/USDT',
      direction: '做空',
      entry_price: '3000',
      stop_loss: '3100',
      take_profit: '2800',
      leverage: '5x'
    },
    {
      trader_name: 'Alice_Trader_' + Date.now(),
      currency: 'SOL/USDT',
      direction: '做多',
      entry_price: '150',
      stop_loss: '145',
      take_profit: '160',
      leverage: '10x'
    }
  ]
};

async function testSimplified() {
  console.log('🎯 简化版测试 - 只发送信号数据\n');
  console.log('📦 数据结构:');
  console.log(JSON.stringify(simplifiedData, null, 2));
  console.log('\n📌 注意: 没有发送 traders 数组,只有 signals 数组!');
  console.log('系统会自动为每个交易员创建记录\n');

  try {
    console.log('⏳ 发送请求...');
    const startTime = Date.now();
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simplifiedData)
    });

    const duration = Date.now() - startTime;
    const result = await response.json();

    console.log(`✅ 请求完成 (耗时: ${duration}ms)\n`);
    console.log('📊 响应结果:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 成功!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 处理统计:`);
      console.log(`  ├─ 交易员处理: ${result.results.traders_processed} 个`);
      console.log(`  ├─ 交易员创建: ${result.results.traders_created} 个`);
      console.log(`  ├─ 交易员更新: ${result.results.traders_updated} 个`);
      console.log(`  ├─ 🆕 自动创建交易员: ${result.results.traders_auto_created} 个`);
      console.log(`  ├─ 信号处理: ${result.results.signals_processed} 条`);
      console.log(`  └─ 信号创建: ${result.results.signals_created} 条`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n✨ 关键发现:');
      console.log(`  • 没有发送 traders 数组: traders_processed = ${result.results.traders_processed}`);
      console.log(`  • 自动创建了 ${result.results.traders_auto_created} 个交易员`);
      console.log(`  • 所有 ${result.results.signals_created} 个信号都成功创建`);
      console.log('\n💡 结论: 你只需要关注信号数据,交易员会自动处理!');
      
      if (result.results.errors.length > 0) {
        console.log('\n⚠️  错误:');
        result.results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('\n❌ 失败:', result.error);
    }

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     RPA Webhook 简化测试 - 只发送信号数据              ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

testSimplified().then(() => {
  console.log('\n✅ 测试完成!');
  console.log('\n📝 使用建议:');
  console.log('  1. 在八爪鱼中只需要提取信号相关字段');
  console.log('  2. 不需要额外的交易员去重逻辑');
  console.log('  3. 数据结构更简单,配置更容易');
  console.log('  4. 系统会自动处理一切! 🚀');
}).catch(console.error);

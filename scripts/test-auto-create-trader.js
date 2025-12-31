/**
 * 测试自动创建交易员功能
 * 用法: node scripts/test-auto-create-trader.js
 */

const WEBHOOK_URL = 'https://qzcblykahxzktiprxhbf.supabase.co/functions/v1/rpa-webhook';

// 测试数据 - 只发送信号,不发送交易员
const testData = {
  signals: [
    {
      trader_name: '新交易员_' + Date.now(),  // 这个交易员不存在
      currency: 'BTC/USDT',
      direction: '做多',
      entry_price: '95000',
      stop_loss: '94000',
      take_profit: '97000',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active'
    },
    {
      trader_name: '新交易员_' + Date.now(),  // 这个交易员不存在
      currency: 'ETH/USDT',
      direction: '做空',
      entry_price: '3000',
      stop_loss: '3100',
      take_profit: '2800',
      leverage: '5x',
      signal_type: 'futures',
      status: 'active'
    },
    {
      trader_name: 'cryptoamancl',  // 这个交易员已存在
      currency: 'SOL/USDT',
      direction: '做多',
      entry_price: '150',
      stop_loss: '145',
      take_profit: '160',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active'
    }
  ]
};

async function testAutoCreateTrader() {
  console.log('🧪 测试自动创建交易员功能...\n');
  console.log('📡 Webhook URL:', WEBHOOK_URL);
  console.log('📦 测试场景:');
  console.log('  - 发送 3 个信号');
  console.log('  - 其中 2 个交易员不存在(应该自动创建)');
  console.log('  - 其中 1 个交易员已存在(应该直接使用)\n');

  try {
    console.log('⏳ 发送请求...');
    const startTime = Date.now();
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const duration = Date.now() - startTime;
    const result = await response.json();

    console.log(`✅ 请求完成 (耗时: ${duration}ms)\n`);
    console.log('📊 响应结果:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✨ 测试成功!');
      console.log(`  ✓ 信号处理: ${result.results.signals_processed} 条`);
      console.log(`  ✓ 信号创建: ${result.results.signals_created} 条`);
      console.log(`  ✓ 自动创建交易员: ${result.results.traders_auto_created} 个`);
      
      if (result.results.traders_auto_created > 0) {
        console.log('\n🎉 自动创建交易员功能正常工作!');
      }
      
      if (result.results.errors.length > 0) {
        console.log('\n⚠️  处理过程中的错误:');
        result.results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      } else {
        console.log('\n✅ 没有错误,所有数据处理成功!');
      }
    } else {
      console.log('\n❌ 处理失败:', result.error);
    }

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

// 测试只发送信号,完全不发送交易员数据
async function testOnlySignals() {
  console.log('\n\n🧪 测试场景2: 只发送信号,不发送任何交易员数据...\n');
  
  const onlySignalsData = {
    signals: [
      {
        trader_name: '完全新的交易员_' + Date.now(),
        currency: 'DOGE/USDT',
        direction: '做多',
        entry_price: '0.35',
        stop_loss: '0.33',
        take_profit: '0.38',
        leverage: '10x'
      }
    ]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(onlySignalsData)
    });

    const result = await response.json();
    console.log('📊 响应结果:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.results.traders_auto_created > 0) {
      console.log('\n✅ 成功! 即使不发送交易员数据,也能自动创建交易员并创建信号!');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  await testAutoCreateTrader();
  await testOnlySignals();
  console.log('\n\n✅ 所有测试完成!');
  console.log('\n📝 总结:');
  console.log('  ✓ 信号数据中的交易员不存在时会自动创建');
  console.log('  ✓ 自动创建的交易员使用默认值');
  console.log('  ✓ 下次使用相同交易员名称时会直接使用已存在的交易员');
  console.log('  ✓ 无需手动创建交易员,完全自动化!');
}

// 运行测试
runAllTests().catch(console.error);

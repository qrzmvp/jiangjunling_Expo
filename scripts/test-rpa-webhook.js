/**
 * 测试 RPA Webhook 功能
 * 用法: node scripts/test-rpa-webhook.js
 */

const WEBHOOK_URL = 'https://qzcblykahxzktiprxhbf.supabase.co/functions/v1/rpa-webhook';

// 测试数据 - 模拟从八爪鱼抓取的数据
const testData = {
  traders: [
    {
      name: 'cryptoamancl',
      description: 'amans-vip | 资深加密货币交易员',
      signal_count: 156,
      followers_count: 2995,
      win_rate: 85.5,
      is_online: true,
      is_online_today: true
    },
    {
      name: 'muzsays',
      description: 'wwg-muzz | 专注ETH交易',
      signal_count: 89,
      followers_count: 3060,
      win_rate: 78.2,
      is_online: true,
      is_online_today: true
    },
    {
      name: 'bhezzy23',
      description: 'wwg-bry | 合约交易专家',
      signal_count: 124,
      followers_count: 2850,
      win_rate: 82.1,
      is_online: false,
      is_online_today: true
    },
    {
      name: 'strades_02',
      description: 'a-trader | 波段交易',
      signal_count: 67,
      followers_count: 3027,
      win_rate: 76.8,
      is_online: true,
      is_online_today: true
    },
    {
      name: 'ye.koi',
      description: 'ye-时间熵 | BTC专家',
      signal_count: 201,
      followers_count: 884,
      win_rate: 88.3,
      is_online: true,
      is_online_today: true
    }
  ],
  signals: [
    {
      trader_name: 'cryptoamancl',
      currency: 'ETH/USDT',
      direction: '做多',
      entry_price: '2995',
      stop_loss: '2940',
      take_profit: '3100',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date('2025-12-31T16:29:00Z').toISOString()
    },
    {
      trader_name: 'muzsays',
      currency: 'ETH/USDT',
      direction: '做多',
      entry_price: '3060',
      stop_loss: '3000',
      take_profit: '3200',
      leverage: '5x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date('2025-12-31T16:22:00Z').toISOString()
    },
    {
      trader_name: 'bhezzy23',
      currency: 'ETH/USDT',
      direction: '做空',
      entry_price: '2850',
      stop_loss: '2900',
      take_profit: '2700',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date('2025-12-31T01:35:00Z').toISOString()
    },
    {
      trader_name: 'strades_02',
      currency: 'ETH/USDT',
      direction: '做空',
      entry_price: '3027',
      stop_loss: '3058',
      take_profit: '2950',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date('2025-12-31T00:16:00Z').toISOString()
    },
    {
      trader_name: 'ye.koi',
      currency: 'BTC/USDT',
      direction: '做多',
      entry_price: '884',
      stop_loss: '872',
      take_profit: '920',
      leverage: '10x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date('2025-12-30T23:36:00Z').toISOString()
    },
    {
      trader_name: 'cryptoamancl',
      currency: 'BTC/USDT',
      direction: 'long',
      entry_price: '95000-96000',
      stop_loss: '94000',
      take_profit: '98000',
      leverage: '20x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date().toISOString()
    },
    {
      trader_name: 'muzsays',
      currency: 'SOL/USDT',
      direction: 'short',
      entry_price: '180',
      stop_loss: '185',
      take_profit: '170',
      leverage: '15x',
      signal_type: 'futures',
      status: 'active',
      signal_time: new Date().toISOString()
    }
  ]
};

async function testWebhook() {
  console.log('🚀 开始测试 RPA Webhook...\n');
  console.log('📡 Webhook URL:', WEBHOOK_URL);
  console.log('📦 测试数据:');
  console.log(`  - 交易员数量: ${testData.traders.length}`);
  console.log(`  - 信号数量: ${testData.signals.length}\n`);

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
      console.log('\n✨ 数据处理成功!');
      console.log(`  ✓ 交易员处理: ${result.results.traders_processed} 条`);
      console.log(`  ✓ 交易员创建: ${result.results.traders_created} 条`);
      console.log(`  ✓ 交易员更新: ${result.results.traders_updated} 条`);
      console.log(`  ✓ 信号处理: ${result.results.signals_processed} 条`);
      console.log(`  ✓ 信号创建: ${result.results.signals_created} 条`);
      
      if (result.results.errors.length > 0) {
        console.log('\n⚠️  处理过程中的错误:');
        result.results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('\n❌ 处理失败:', result.error);
    }

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

// 测试单个交易员
async function testSingleTrader() {
  console.log('\n\n🧪 测试单个交易员数据...\n');
  
  const singleData = {
    traders: [
      {
        name: '测试交易员_' + Date.now(),
        description: '这是一个测试交易员',
        signal_count: 0,
        followers_count: 0,
        win_rate: 0,
        is_online: true,
        is_online_today: true
      }
    ]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(singleData)
    });

    const result = await response.json();
    console.log('📊 响应结果:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 测试单个信号
async function testSingleSignal() {
  console.log('\n\n🧪 测试单个信号数据 (需要先有交易员)...\n');
  
  const singleData = {
    signals: [
      {
        trader_name: 'cryptoamancl',
        currency: 'DOGE/USDT',
        direction: '做多',
        entry_price: '0.35',
        stop_loss: '0.33',
        take_profit: '0.38',
        leverage: '10x',
        signal_type: 'futures',
        status: 'active'
      }
    ]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(singleData)
    });

    const result = await response.json();
    console.log('📊 响应结果:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 执行所有测试
async function runAllTests() {
  await testWebhook();
  await testSingleTrader();
  await testSingleSignal();
  console.log('\n\n✅ 所有测试完成!');
}

// 运行测试
runAllTests().catch(console.error);

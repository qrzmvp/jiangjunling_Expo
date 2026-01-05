const ccxt = require('ccxt');

// 模拟信号数据
const mockSignal = {
    id: 'signal_001',
    symbol: 'BTC/USDT',
    direction: 'long', // 'long' or 'short'
    entry_price: 42000,
    stop_loss: 41000,
    take_profit: 44000,
    signal_time: 1704067200000, // 2024-01-01 00:00:00 UTC
    principal: 1000 // USDT
};

async function backtestSignal(signal) {
    console.log(`开始回测信号: ${signal.symbol} ${signal.direction.toUpperCase()}`);
    console.log(`入场: ${signal.entry_price}, 止损: ${signal.stop_loss}, 止盈: ${signal.take_profit}`);

    // 1. 初始化交易所实例 (以币安为例)
    const exchange = new ccxt.binance();
    
    // 2. 获取K线数据
    // 注意：实际使用时需要处理分页获取，因为一次请求可能无法覆盖整个持仓周期
    // 这里获取从信号时间开始的1分钟K线
    const timeframe = '1m';
    const since = signal.signal_time;
    const limit = 1000; // 获取1000根K线

    try {
        // 模拟获取数据 (实际使用时取消注释下面这行)
        // const ohlcv = await exchange.fetchOHLCV(signal.symbol, timeframe, since, limit);
        
        // 这里为了演示，我们生成一些模拟的K线数据
        const ohlcv = generateMockOHLCV(signal);

        // 3. 模拟交易过程
        let status = 'open';
        let exitPrice = 0;
        let exitTime = 0;
        let exitReason = '';

        for (const candle of ohlcv) {
            const [timestamp, open, high, low, close, volume] = candle;

            if (signal.direction === 'long') {
                // 做多逻辑
                // 检查是否触发止损 (Low <= SL)
                if (low <= signal.stop_loss) {
                    status = 'closed';
                    exitPrice = signal.stop_loss;
                    exitTime = timestamp;
                    exitReason = 'stop_loss';
                    break;
                }
                // 检查是否触发止盈 (High >= TP)
                if (high >= signal.take_profit) {
                    status = 'closed';
                    exitPrice = signal.take_profit;
                    exitTime = timestamp;
                    exitReason = 'take_profit';
                    break;
                }
            } else {
                // 做空逻辑
                // 检查是否触发止损 (High >= SL)
                if (high >= signal.stop_loss) {
                    status = 'closed';
                    exitPrice = signal.stop_loss;
                    exitTime = timestamp;
                    exitReason = 'stop_loss';
                    break;
                }
                // 检查是否触发止盈 (Low <= TP)
                if (low <= signal.take_profit) {
                    status = 'closed';
                    exitPrice = signal.take_profit;
                    exitTime = timestamp;
                    exitReason = 'take_profit';
                    break;
                }
            }
        }

        // 4. 计算收益
        if (status === 'closed') {
            const quantity = signal.principal / signal.entry_price;
            let pnl = 0;

            if (signal.direction === 'long') {
                pnl = (exitPrice - signal.entry_price) * quantity;
            } else {
                pnl = (signal.entry_price - exitPrice) * quantity;
            }

            const roi = (pnl / signal.principal) * 100;

            console.log('-----------------------------------');
            console.log(`回测结果: ${exitReason === 'take_profit' ? '✅ 止盈' : '❌ 止损'}`);
            console.log(`退出时间: ${new Date(exitTime).toISOString()}`);
            console.log(`退出价格: ${exitPrice}`);
            console.log(`盈亏金额: ${pnl.toFixed(2)} USDT`);
            console.log(`收益率: ${roi.toFixed(2)}%`);
            
            return {
                pnl,
                roi,
                exitReason
            };
        } else {
            console.log('-----------------------------------');
            console.log('回测结果: 持仓中 (未触发止盈止损)');
            // 可以按当前最新价计算浮动盈亏
            return null;
        }

    } catch (error) {
        console.error('获取数据或计算出错:', error);
    }
}

// 生成模拟数据的辅助函数
function generateMockOHLCV(signal) {
    const data = [];
    let currentPrice = signal.entry_price;
    let time = signal.signal_time;

    // 模拟100分钟的走势
    for (let i = 0; i < 100; i++) {
        // 随机波动 -0.1% 到 +0.1%
        const change = currentPrice * (Math.random() * 0.002 - 0.001);
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + Math.random() * 10;
        const low = Math.min(open, close) - Math.random() * 10;
        
        data.push([time, open, high, low, close, 100]);
        
        // 故意制造一个止盈的情况 (在第50分钟)
        if (i === 50) {
             if (signal.direction === 'long') {
                 data[i][2] = signal.take_profit + 10; // High > TP
             } else {
                 data[i][3] = signal.take_profit - 10; // Low < TP
             }
        }

        currentPrice = close;
        time += 60000; // +1 minute
    }
    return data;
}

// 运行回测
backtestSignal(mockSignal);

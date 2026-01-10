const ccxt = require('ccxt');
const { HttpsProxyAgent } = require('https-proxy-agent');
const winston = require('winston');
const path = require('path');

// --- 1. 配置日志记录 (Module 1 Logger Setup) ---
// 日志文件路径
const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'backtest_verification.log');

// 确保 logs 目录存在
const fs = require('fs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level}: ${message}`;
                })
            )
        }),
        new winston.transports.File({ filename: logFile })
    ]
});

// --- 2. 验证逻辑 ---

async function verifyOHLCV() {
    logger.info('🔄 开始验证 CCXT fetchOHLCV 接口...');
    
    // 初始化交易所
    const exchangeId = 'binance'; 
    
    // 🔥 关键修改：默认不挂代理，依赖 VPN 接管
    // 如果您需要强制挂代理，请取消下面注释并填入正确的 http://127.0.0.1:端口
    let agent = undefined;
    if (process.env.PROXY_URL) {
        logger.info(`🔌 使用环境变量代理: ${process.env.PROXY_URL}`);
        agent = new HttpsProxyAgent(process.env.PROXY_URL);
    } else {
        logger.info('🌍 未检测到 PROXY_URL，尝试使用直连 (依赖 VPN)...');
    }

    try {
        const exchange = new ccxt[exchangeId]({
            'enableRateLimit': true,
            'timeout': 30000,
            'agent': agent
        });

        const symbol = 'BTC/USDT';
        const timeframe = '1m';
        const since = Date.now() - (60 * 60 * 1000); 
        const limit = 5;

        logger.info(`📡 请求参数: 交易所=${exchangeId}, 交易对=${symbol}, 周期=${timeframe}`);
        
        // 核心接口调用
        const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since, limit);

        logger.info(`✅ 成功获取 ${ohlcv.length} 条 K 线数据！`);
        
        if (ohlcv.length > 0) {
            const firstCandle = ohlcv[0];
            const dateStr = new Date(firstCandle[0]).toISOString();
            
            logger.info(`📊 数据样本 (第一条): 时间=${dateStr}, 收盘价=${firstCandle[4]}`);
            
            console.table([{
                'Time': dateStr,
                'Open': firstCandle[1],
                'High': firstCandle[2],
                'Low': firstCandle[3],
                'Close': firstCandle[4],
                'Vol': firstCandle[5]
            }]);
            
            logger.info(`✅ 验证通过！日志已记录到 ${logFile}`);
        } 

    } catch (error) {
        logger.error(`❌ 接口调用失败！错误类型: ${error.name}, 信息: ${error.message}`);
        
        if (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('fetch failed'))) {
            logger.warn('⚠️  可能是网络问题。');
            logger.warn('   当前 VPN 似乎接管了网络。如果依然失败，请确认 VPN 处于“全局模式 (Global Mode)”。');
        }
    }
}

verifyOHLCV();

-- 创建交易对表
CREATE TABLE IF NOT EXISTS public.trading_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE, -- 交易对名称，如 BTC/USDT
  display_name TEXT, -- 展示名称，可以是中文或其他友好名称
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 添加注释
COMMENT ON TABLE public.trading_pairs IS '交易对表';
COMMENT ON COLUMN public.trading_pairs.symbol IS '交易对符号，如 BTC/USDT';
COMMENT ON COLUMN public.trading_pairs.display_name IS '交易对展示名称';
COMMENT ON COLUMN public.trading_pairs.created_at IS '创建时间';
COMMENT ON COLUMN public.trading_pairs.updated_at IS '更新时间';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_trading_pairs_symbol ON public.trading_pairs(symbol);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_trading_pairs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trading_pairs_updated_at
  BEFORE UPDATE ON public.trading_pairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trading_pairs_updated_at();

-- 启用 RLS (Row Level Security)
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：允许所有人读取
CREATE POLICY "允许所有人查看交易对"
  ON public.trading_pairs
  FOR SELECT
  TO public
  USING (true);

-- 创建 RLS 策略：仅允许认证用户插入（云函数会使用 service role，不受此限制）
CREATE POLICY "允许认证用户创建交易对"
  ON public.trading_pairs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 创建 RLS 策略：仅允许认证用户更新
CREATE POLICY "允许认证用户更新交易对"
  ON public.trading_pairs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

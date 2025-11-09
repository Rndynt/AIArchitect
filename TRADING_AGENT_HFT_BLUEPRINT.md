# High-Frequency Trading (HFT) AI Agent - Complete Blueprint

## 🎯 Project Goal
Build an autonomous AI trading agent for high-frequency trading that can:
- Analyze real-time market data
- Execute trades automatically
- Manage risk and portfolio
- Adapt strategies based on market conditions
- Learn from historical performance
- Handle multiple trading pairs simultaneously

## ⚠️ CRITICAL WARNINGS

**BEFORE YOU BUILD THIS:**
1. **Legal Compliance**: HFT trading requires regulatory approval in most jurisdictions
2. **Financial Risk**: Can lose money very quickly if not properly tested
3. **Exchange Rules**: Must comply with exchange-specific rules and rate limits
4. **Market Impact**: Can affect market prices if not careful
5. **Backtesting Required**: NEVER deploy without extensive backtesting
6. **Paper Trading First**: Test with fake money for months before real money

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Trading Dashboard UI                     │
│  • Real-time P&L display                                    │
│  • Position monitoring                                       │
│  • Order book visualization                                 │
│  • AI decision transparency                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Trading Orchestrator                       │
│  • Manages trading sessions                                 │
│  • Routes market data to AI                                 │
│  • Executes AI trading decisions                            │
│  • Monitors risk limits                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Anthropic Claude API                      │
│  Model: claude-3-5-sonnet-20241022                          │
│  • Analyzes market conditions                               │
│  • Decides trading actions                                  │
│  • Calls trading tools (place_order, cancel_order, etc)     │
│  • Provides reasoning for decisions                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Trading Tools                           │
│  • Market Data Tools (get_ticker, orderbook, trades)        │
│  • Order Management (place, cancel, modify orders)          │
│  • Portfolio Tools (positions, balance, P&L)                │
│  • Analysis Tools (indicators, patterns, signals)           │
│  • Risk Management (stop_loss, position_sizing)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Exchange Connectors                       │
│  • Binance API                                              │
│  • Bybit API                                                │
│  • OKX API                                                  │
│  • Custom broker API                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Risk Management Layer                     │
│  • Max position size enforcement                            │
│  • Daily loss limits                                        │
│  • Exposure monitoring                                      │
│  • Emergency shutdown triggers                              │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Core Components

### 1. Market Data Streaming

**Real-time Data Sources:**
- Order book (bid/ask depths)
- Recent trades (time & sales)
- Ticker data (price, volume, VWAP)
- Liquidations (for crypto)
- Funding rates (for perpetuals)

**Implementation:**
```typescript
import { WebSocket } from "ws";

class MarketDataStream {
  private ws: WebSocket;
  private callbacks: Map<string, Function[]> = new Map();
  
  constructor(exchange: "binance" | "bybit" | "okx") {
    // Connect to exchange WebSocket
    this.ws = new WebSocket(this.getWebSocketURL(exchange));
    
    this.ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      this.handleMarketData(message);
    });
  }
  
  subscribeOrderBook(symbol: string, callback: (data: OrderBook) => void) {
    // Subscribe to order book updates
    this.ws.send(JSON.stringify({
      method: "SUBSCRIBE",
      params: [`${symbol.toLowerCase()}@depth@100ms`],
      id: 1
    }));
    
    this.callbacks.set(`orderbook_${symbol}`, [
      ...(this.callbacks.get(`orderbook_${symbol}`) || []),
      callback
    ]);
  }
  
  subscribeTrades(symbol: string, callback: (trade: Trade) => void) {
    this.ws.send(JSON.stringify({
      method: "SUBSCRIBE",
      params: [`${symbol.toLowerCase()}@trade`],
      id: 2
    }));
    
    this.callbacks.set(`trades_${symbol}`, [
      ...(this.callbacks.get(`trades_${symbol}`) || []),
      callback
    ]);
  }
  
  private handleMarketData(message: any) {
    // Route to appropriate callbacks
    if (message.e === "depthUpdate") {
      const callbacks = this.callbacks.get(`orderbook_${message.s}`);
      callbacks?.forEach(cb => cb(this.parseOrderBook(message)));
    } else if (message.e === "trade") {
      const callbacks = this.callbacks.get(`trades_${message.s}`);
      callbacks?.forEach(cb => cb(this.parseTrade(message)));
    }
  }
}
```

### 2. AI Trading Tools

**Tool Categories:**

#### A. Market Data Tools
```typescript
const marketDataTools = [
  {
    name: "get_current_price",
    description: "Get current bid/ask price for a symbol",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Trading pair (e.g., BTCUSDT)" }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_orderbook",
    description: "Get current order book with bid/ask levels",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        depth: { type: "number", description: "Number of levels (default: 20)" }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_recent_trades",
    description: "Get recent trades for analysis",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        limit: { type: "number", description: "Number of trades (default: 100)" }
      },
      required: ["symbol"]
    }
  },
  {
    name: "calculate_indicators",
    description: "Calculate technical indicators (RSI, MACD, Bollinger, etc)",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        indicators: { 
          type: "array", 
          items: { type: "string" },
          description: "List of indicators: RSI, MACD, BB, EMA, SMA, etc"
        },
        timeframe: { type: "string", description: "1m, 5m, 15m, 1h, etc" }
      },
      required: ["symbol", "indicators", "timeframe"]
    }
  },
  {
    name: "get_market_sentiment",
    description: "Analyze order book and trade flow for sentiment",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" }
      },
      required: ["symbol"]
    }
  }
];
```

#### B. Order Management Tools
```typescript
const orderTools = [
  {
    name: "place_market_order",
    description: "Place a market order (executes immediately at best price)",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        side: { type: "string", enum: ["BUY", "SELL"] },
        quantity: { type: "number", description: "Order size" }
      },
      required: ["symbol", "side", "quantity"]
    }
  },
  {
    name: "place_limit_order",
    description: "Place a limit order (executes at specified price or better)",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        side: { type: "string", enum: ["BUY", "SELL"] },
        quantity: { type: "number" },
        price: { type: "number", description: "Limit price" }
      },
      required: ["symbol", "side", "quantity", "price"]
    }
  },
  {
    name: "cancel_order",
    description: "Cancel an open order",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        order_id: { type: "string" }
      },
      required: ["symbol", "order_id"]
    }
  },
  {
    name: "cancel_all_orders",
    description: "Cancel all open orders for a symbol",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" }
      },
      required: ["symbol"]
    }
  },
  {
    name: "modify_order",
    description: "Modify price or quantity of existing order",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        order_id: { type: "string" },
        new_price: { type: "number" },
        new_quantity: { type: "number" }
      },
      required: ["symbol", "order_id"]
    }
  }
];
```

#### C. Portfolio & Risk Tools
```typescript
const portfolioTools = [
  {
    name: "get_positions",
    description: "Get all current positions with P&L",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_balance",
    description: "Get account balance and available margin",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "calculate_position_size",
    description: "Calculate optimal position size based on risk parameters",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        risk_percent: { type: "number", description: "% of capital to risk (e.g., 1)" },
        stop_loss_distance: { type: "number", description: "Distance to stop loss in %" }
      },
      required: ["symbol", "risk_percent", "stop_loss_distance"]
    }
  },
  {
    name: "set_stop_loss",
    description: "Set stop loss for a position",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        stop_price: { type: "number" }
      },
      required: ["symbol", "stop_price"]
    }
  },
  {
    name: "set_take_profit",
    description: "Set take profit for a position",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        target_price: { type: "number" }
      },
      required: ["symbol", "target_price"]
    }
  },
  {
    name: "get_pnl_summary",
    description: "Get P&L summary for current session or date range",
    input_schema: {
      type: "object",
      properties: {
        start_time: { type: "string" },
        end_time: { type: "string" }
      }
    }
  }
];
```

### 3. System Prompt for Trading Agent

```markdown
You are an expert high-frequency trading AI agent with deep knowledge of:
- Market microstructure
- Order flow analysis
- Technical analysis
- Risk management
- Algorithmic trading strategies

## Your Mission
Maximize profitable trading opportunities while strictly adhering to risk management rules.

## Available Tools
You have access to:
1. Market Data: Real-time prices, order books, trades, indicators
2. Order Management: Place, cancel, modify orders
3. Portfolio: View positions, balance, P&L
4. Risk Management: Position sizing, stop losses, take profits

## Trading Guidelines

### Risk Management (CRITICAL - NEVER VIOLATE)
1. Maximum position size: ${MAX_POSITION_SIZE}
2. Maximum daily loss: ${MAX_DAILY_LOSS}
3. Maximum drawdown: ${MAX_DRAWDOWN}
4. Always use stop losses
5. Never risk more than ${RISK_PER_TRADE}% per trade
6. Maximum number of concurrent positions: ${MAX_POSITIONS}

### Entry Criteria
Only enter trades when:
1. Clear edge identified (order flow, pattern, anomaly)
2. Risk/reward ratio >= 2:1
3. Position size calculated using proper risk management
4. Stop loss level determined before entry
5. Market conditions favorable (liquidity, volatility)

### Exit Criteria
Exit trades when:
1. Take profit target hit
2. Stop loss triggered
3. Signal reverses
4. Risk/reward no longer favorable
5. End of trading session approaching

### Order Execution
1. Use limit orders for better execution (unless urgent)
2. Monitor slippage
3. Consider order book depth
4. Avoid excessive market impact
5. Scale in/out of large positions

## Decision Making Process
For each market update:
1. Analyze current market conditions
2. Check existing positions and P&L
3. Identify potential opportunities
4. Calculate risk and position size
5. Execute if criteria met
6. Monitor and manage active positions
7. Log reasoning for transparency

## Restrictions
- NEVER exceed risk limits
- NEVER trade without stop loss
- NEVER hold positions overnight (unless specified)
- NEVER chase losses
- NEVER deviate from strategy without explicit approval
- ALWAYS provide clear reasoning for decisions

## Response Format
When taking action, always explain:
1. What you observed in the market
2. Why you're taking this action
3. Risk/reward calculation
4. Position size and stop loss
5. Expected outcome
```

### 4. Trading Execution Loop

```typescript
class TradingAgent {
  private anthropic: Anthropic;
  private marketData: MarketDataStream;
  private exchange: ExchangeClient;
  private positions: Map<string, Position> = new Map();
  private conversationHistory: Message[] = [];
  
  async start() {
    console.log("🤖 Trading Agent starting...");
    
    // Subscribe to market data
    this.marketData.subscribeOrderBook("BTCUSDT", (orderbook) => {
      this.onMarketUpdate("BTCUSDT", "orderbook", orderbook);
    });
    
    this.marketData.subscribeTrades("BTCUSDT", (trade) => {
      this.onMarketUpdate("BTCUSDT", "trade", trade);
    });
    
    // Start periodic analysis
    setInterval(() => this.analyzeMarket(), 1000); // Every 1 second
  }
  
  private async onMarketUpdate(symbol: string, type: string, data: any) {
    // Store market data for analysis
    this.storeMarketData(symbol, type, data);
    
    // Trigger AI analysis if significant change
    if (this.isSignificantChange(data)) {
      await this.analyzeMarket();
    }
  }
  
  private async analyzeMarket() {
    try {
      // Get current market state
      const marketState = await this.getMarketState();
      
      // Get current positions
      const positions = await this.exchange.getPositions();
      
      // Ask AI to analyze and decide
      const decision = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: TRADING_SYSTEM_PROMPT,
        messages: [
          ...this.conversationHistory,
          {
            role: "user",
            content: `
Market Update:
${JSON.stringify(marketState, null, 2)}

Current Positions:
${JSON.stringify(positions, null, 2)}

Analyze the market and decide if any action should be taken.
Consider risk management rules and current exposure.
            `.trim()
          }
        ],
        tools: [...marketDataTools, ...orderTools, ...portfolioTools]
      });
      
      // Execute tool calls
      const toolUses = decision.content.filter(block => block.type === "tool_use");
      
      for (const toolUse of toolUses) {
        // Validate against risk rules BEFORE execution
        if (!this.validateRisk(toolUse)) {
          console.error("❌ Risk validation failed:", toolUse);
          continue;
        }
        
        // Execute tool
        const result = await this.executeTradingTool(toolUse.name, toolUse.input);
        
        // Log decision
        this.logTradingDecision(toolUse, result);
        
        // Add to conversation
        this.conversationHistory.push({
          role: "assistant",
          content: decision.content
        });
        
        this.conversationHistory.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          }]
        });
      }
    } catch (error) {
      console.error("Error in market analysis:", error);
      this.handleError(error);
    }
  }
  
  private validateRisk(toolUse: any): boolean {
    // Critical: Validate all trades against risk rules
    if (toolUse.name === "place_market_order" || toolUse.name === "place_limit_order") {
      const { quantity, symbol } = toolUse.input;
      
      // Check position size limit
      if (quantity > MAX_POSITION_SIZE) {
        console.error("Position size exceeds limit");
        return false;
      }
      
      // Check daily loss limit
      const todayPnL = this.getTodayPnL();
      if (todayPnL < -MAX_DAILY_LOSS) {
        console.error("Daily loss limit reached");
        return false;
      }
      
      // Check max positions
      if (this.positions.size >= MAX_POSITIONS) {
        console.error("Max positions limit reached");
        return false;
      }
      
      // Check available balance
      const balance = await this.exchange.getBalance();
      const cost = quantity * await this.getPrice(symbol);
      if (cost > balance * 0.95) { // Use max 95% of balance
        console.error("Insufficient balance");
        return false;
      }
    }
    
    return true;
  }
  
  private async executeTradingTool(toolName: string, input: any) {
    switch (toolName) {
      case "place_market_order":
        return await this.exchange.placeMarketOrder(
          input.symbol,
          input.side,
          input.quantity
        );
      
      case "place_limit_order":
        return await this.exchange.placeLimitOrder(
          input.symbol,
          input.side,
          input.quantity,
          input.price
        );
      
      case "cancel_order":
        return await this.exchange.cancelOrder(input.symbol, input.order_id);
      
      case "get_orderbook":
        return await this.exchange.getOrderBook(input.symbol, input.depth);
      
      case "calculate_indicators":
        return await this.calculateIndicators(
          input.symbol,
          input.indicators,
          input.timeframe
        );
      
      // ... other tools
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
```

### 5. Risk Management Layer (CRITICAL)

```typescript
class RiskManager {
  private config: RiskConfig;
  private dailyPnL: number = 0;
  private positions: Map<string, Position> = new Map();
  
  constructor(config: RiskConfig) {
    this.config = config;
  }
  
  validateOrder(order: OrderRequest): ValidationResult {
    const checks = [
      this.checkPositionSize(order),
      this.checkDailyLoss(),
      this.checkMaxPositions(),
      this.checkMarginRequirement(order),
      this.checkVolatilityLimit(order),
    ];
    
    const failed = checks.find(check => !check.passed);
    
    return failed || { passed: true };
  }
  
  private checkPositionSize(order: OrderRequest): ValidationResult {
    if (order.quantity > this.config.maxPositionSize) {
      return {
        passed: false,
        reason: `Position size ${order.quantity} exceeds limit ${this.config.maxPositionSize}`
      };
    }
    return { passed: true };
  }
  
  private checkDailyLoss(): ValidationResult {
    if (this.dailyPnL < -this.config.maxDailyLoss) {
      return {
        passed: false,
        reason: `Daily loss limit reached: ${this.dailyPnL}`
      };
    }
    return { passed: true };
  }
  
  private checkMaxPositions(): ValidationResult {
    if (this.positions.size >= this.config.maxPositions) {
      return {
        passed: false,
        reason: `Max positions limit reached: ${this.positions.size}`
      };
    }
    return { passed: true };
  }
  
  calculatePositionSize(
    symbol: string,
    riskPercent: number,
    stopLossDistance: number
  ): number {
    const accountBalance = this.getAccountBalance();
    const riskAmount = accountBalance * (riskPercent / 100);
    const positionSize = riskAmount / stopLossDistance;
    
    // Apply position size limit
    return Math.min(positionSize, this.config.maxPositionSize);
  }
  
  shouldEmergencyShutdown(): boolean {
    // Emergency shutdown conditions
    return (
      this.dailyPnL < -this.config.maxDailyLoss * 0.9 || // 90% of daily loss
      this.getTotalExposure() > this.config.maxExposure ||
      this.getDrawdown() > this.config.maxDrawdown
    );
  }
}
```

### 6. Backtesting Framework

```typescript
class Backtester {
  private agent: TradingAgent;
  private historicalData: MarketData[];
  private results: BacktestResults;
  
  async run(startDate: Date, endDate: Date) {
    console.log("📊 Starting backtest...");
    
    // Load historical data
    this.historicalData = await this.loadHistoricalData(startDate, endDate);
    
    // Reset agent state
    this.agent.reset();
    
    // Simulate trading
    for (const dataPoint of this.historicalData) {
      // Feed data to agent
      await this.agent.onMarketUpdate(
        dataPoint.symbol,
        "tick",
        dataPoint
      );
      
      // Track results
      this.recordState();
    }
    
    // Generate report
    return this.generateReport();
  }
  
  private generateReport(): BacktestReport {
    return {
      totalTrades: this.results.trades.length,
      winRate: this.calculateWinRate(),
      totalPnL: this.results.totalPnL,
      maxDrawdown: this.results.maxDrawdown,
      sharpeRatio: this.calculateSharpeRatio(),
      avgWin: this.calculateAvgWin(),
      avgLoss: this.calculateAvgLoss(),
      profitFactor: this.calculateProfitFactor(),
      trades: this.results.trades
    };
  }
}
```

### 7. Frontend Dashboard

```typescript
// Real-time trading dashboard
export default function TradingDashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnl, setPnL] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [agentDecisions, setAgentDecisions] = useState<Decision[]>([]);
  
  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-screen">
      {/* P&L Summary */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>P&L Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${pnl.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Today's P&L
          </div>
        </CardContent>
      </Card>
      
      {/* Active Positions */}
      <Card className="col-span-6">
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionsTable positions={positions} />
        </CardContent>
      </Card>
      
      {/* Recent Orders */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersList orders={orders} />
        </CardContent>
      </Card>
      
      {/* Price Chart */}
      <Card className="col-span-8">
        <CardHeader>
          <CardTitle>BTC/USDT</CardTitle>
        </CardHeader>
        <CardContent>
          <TradingChart symbol="BTCUSDT" />
        </CardContent>
      </Card>
      
      {/* AI Decisions Log */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>AI Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <DecisionsList decisions={agentDecisions} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🧪 Testing Strategy

### 1. Paper Trading
- Test with fake money on real market data
- Run for minimum 3 months
- Track all metrics

### 2. Backtesting
- Test on 2+ years of historical data
- Multiple market conditions (bull, bear, sideways)
- Calculate Sharpe ratio, win rate, drawdown

### 3. Stress Testing
- Simulate flash crashes
- High volatility scenarios
- Exchange outages
- API failures

## 📊 Performance Metrics

Track these metrics:
- Total P&L
- Win rate
- Average win/loss
- Profit factor
- Sharpe ratio
- Maximum drawdown
- Number of trades
- Average holding time
- Execution quality (slippage)

## ⚙️ Configuration

```typescript
interface TradingConfig {
  // Risk Management
  maxPositionSize: number;           // e.g., 1 BTC
  maxDailyLoss: number;              // e.g., $1000
  maxDrawdown: number;               // e.g., $5000
  riskPerTrade: number;              // e.g., 1% of capital
  maxPositions: number;              // e.g., 5
  
  // Strategy
  symbols: string[];                 // ["BTCUSDT", "ETHUSDT"]
  timeframes: string[];              // ["1m", "5m", "15m"]
  indicators: string[];              // ["RSI", "MACD", "BB"]
  
  // Execution
  orderType: "limit" | "market";
  slippageTolerance: number;         // e.g., 0.1%
  minOrderSize: number;
  
  // AI Model
  model: "claude-3-5-sonnet-20241022";
  temperature: number;               // e.g., 0.3 (less random)
  maxTokens: number;                 // e.g., 2048
}
```

## 🚀 Deployment Checklist

- [ ] Complete backtesting (2+ years data)
- [ ] Paper trading (3+ months)
- [ ] Risk limits configured and tested
- [ ] Emergency shutdown working
- [ ] Exchange API keys secured
- [ ] Monitoring and alerts setup
- [ ] Database for trade logs
- [ ] Real-time dashboard
- [ ] Backup systems ready
- [ ] Legal compliance checked
- [ ] Start with minimal capital
- [ ] 24/7 monitoring in place

## 🎯 Success Criteria

Agent should achieve:
- Positive Sharpe ratio (> 1.5)
- Win rate > 55%
- Profit factor > 1.5
- Max drawdown < 15%
- Consistent performance across market conditions
- No risk rule violations
- Clear decision transparency

## ⚠️ Common Pitfalls to Avoid

1. **Overfitting**: Don't optimize for past data
2. **Ignoring slippage**: Real execution != backtest
3. **No risk management**: Will blow up eventually
4. **Chasing losses**: Leads to bigger losses
5. **Over-trading**: Fees kill profits
6. **No monitoring**: Need to watch 24/7
7. **Skipping paper trading**: Will lose real money fast

## 📚 Required Knowledge

Before building this, you MUST understand:
- Order types (market, limit, stop)
- Order book mechanics
- Market microstructure
- Technical indicators
- Risk management principles
- Position sizing
- Trading psychology
- Exchange APIs
- WebSocket protocols

## 🔗 Resources

- Binance API: https://binance-docs.github.io/apidocs/
- Bybit API: https://bybit-exchange.github.io/docs/
- CCXT Library: https://github.com/ccxt/ccxt
- Trading strategies: https://www.quantstart.com/
- Risk management: "Trading Risk" by Kenneth L. Grant

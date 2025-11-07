const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config()

// Configuration
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  STARTING_BALANCE: 10000, // Paper trading starting balance
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// User data storage
let userData = {};
try {
  userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
} catch (e) {
  userData = {};
}

function saveUserData() {
  fs.writeFileSync('userData.json', JSON.stringify(userData, null, 2));
}

// Initialize user profile
function initUser(userId) {
  if (!userData[userId]) {
    userData[userId] = {
      balance: CONFIG.STARTING_BALANCE,
      portfolio: {},
      completedLessons: [],
      quizScores: {},
      trades: [],
      level: 1,
      experience: 0,
    };
    saveUserData();
  }
  return userData[userId];
}

// Trading curriculum
const curriculum = {
  1: {
    title: "📚 Lesson 1: Stock Market Basics",
    content: `**Welcome to Stock Trading!**

**What is a Stock?**
A stock represents ownership in a company. When you buy a stock, you own a small piece of that company.

**Key Terms:**
• **Share**: A single unit of stock
• **Ticker Symbol**: Short code for a stock (e.g., AAPL for Apple)
• **Market Cap**: Total value of all shares
• **Volume**: Number of shares traded

**How Money is Made:**
1. **Capital Gains**: Buy low, sell high
2. **Dividends**: Regular payments from profitable companies

**Types of Orders:**
• **Market Order**: Buy/sell immediately at current price
• **Limit Order**: Buy/sell only at a specific price or better

**Next Steps:**
Complete the quiz with \`!quiz 1\` to unlock Lesson 2!`,
    quiz: [
      {
        question: "What does owning a stock represent?",
        options: ["A) Lending money to a company", "B) Owning part of a company", "C) Betting on stock prices", "D) Buying company products"],
        correct: 1
      },
      {
        question: "What is a ticker symbol?",
        options: ["A) A stock's price", "B) A short code for a stock", "C) The company's CEO", "D) Trading volume"],
        correct: 1
      }
    ]
  },
  2: {
    title: "📈 Lesson 2: Reading Charts & Trends",
    content: `**Understanding Price Charts**

**Chart Types:**
• **Line Chart**: Simple price over time
• **Candlestick**: Shows open, high, low, close prices
• **Bar Chart**: Similar to candlestick

**Trend Analysis:**
• **Uptrend**: Higher highs and higher lows 📈
• **Downtrend**: Lower highs and lower lows 📉
• **Sideways**: No clear direction ➡️

**Support & Resistance:**
• **Support**: Price level where stock tends to stop falling
• **Resistance**: Price level where stock tends to stop rising

**Key Indicators:**
• **Moving Averages**: Average price over time periods
• **Volume**: Higher volume = stronger moves
• **RSI**: Shows if stock is overbought/oversold

**Practice:**
Use \`!chart AAPL\` to see real charts!
Complete \`!quiz 2\` when ready.`,
    quiz: [
      {
        question: "What is an uptrend?",
        options: ["A) Prices going down", "B) Prices going sideways", "C) Higher highs and higher lows", "D) Random movement"],
        correct: 2
      },
      {
        question: "What is support?",
        options: ["A) Price level where stock stops falling", "B) Price level where stock stops rising", "C) Average price", "D) Trading volume"],
        correct: 0
      }
    ]
  },
  3: {
    title: "💰 Lesson 3: Risk Management",
    content: `**Protecting Your Capital**

**Golden Rules:**
1. **Never risk more than 1-2% per trade**
2. **Always use stop losses**
3. **Don't put all eggs in one basket**

**Position Sizing:**
If you have $10,000:
• Risk per trade: $100-200 (1-2%)
• If stop loss is 5% away, position size = $2,000-4,000

**Stop Loss:**
Predetermined price where you exit to limit losses.
Example: Buy at $100, stop at $95 = 5% max loss

**Risk/Reward Ratio:**
Aim for at least 2:1
• Risk $100 to make $200
• If you're right 40% of the time, you're still profitable!

**Diversification:**
• Don't put more than 10-20% in any single stock
• Spread across different sectors

**Emotional Control:**
• Stick to your plan
• Don't revenge trade after losses
• Take profits systematically

Complete \`!quiz 3\` to continue!`,
    quiz: [
      {
        question: "What's the recommended risk per trade?",
        options: ["A) 10-20%", "B) 5-10%", "C) 1-2%", "D) 25%+"],
        correct: 2
      },
      {
        question: "What is a stop loss?",
        options: ["A) Maximum profit target", "B) Price where you exit to limit losses", "C) Average buying price", "D) Daily trading limit"],
        correct: 1
      }
    ]
  },
  4: {
    title: "🎯 Lesson 4: Entry & Exit Strategies",
    content: `**When to Buy & Sell**

**Entry Strategies:**

1. **Breakout Trading**
   • Buy when price breaks above resistance
   • High volume confirms breakout
   • Example: Stock at $50 resistance → breaks to $51

2. **Pullback Trading**
   • Wait for dip in uptrend
   • Buy at support level
   • Lower risk entry

3. **Bottom Fishing** (Advanced)
   • Buy oversold stocks
   • High risk, high reward
   • Need strong confirmation

**Exit Strategies:**

1. **Profit Targets**
   • Set target before entering (e.g., 10% gain)
   • Take partial profits along the way

2. **Trailing Stop Loss**
   • Stop loss that follows price up
   • Locks in profits as stock rises

3. **Time-Based Exits**
   • Exit if trade doesn't work in X days
   • Frees capital for better opportunities

**The Setup Checklist:**
✓ Clear trend direction
✓ Volume confirmation
✓ Risk/reward at least 2:1
✓ Stop loss defined
✓ Position size calculated

Practice with \`!paper buy SYMBOL SHARES\`!
Complete \`!quiz 4\` when ready.`,
    quiz: [
      {
        question: "What confirms a breakout?",
        options: ["A) Low volume", "B) High volume", "C) Sideways price", "D) Decreasing volume"],
        correct: 1
      },
      {
        question: "What's a trailing stop loss?",
        options: ["A) Fixed stop price", "B) Stop that moves with price", "C) No stop loss", "D) Average entry price"],
        correct: 1
      }
    ]
  },
  5: {
    title: "🧠 Lesson 5: Trading Psychology",
    content: `**Master Your Mind**

**Common Psychological Traps:**

1. **FOMO (Fear of Missing Out)**
   • Chasing stocks that already moved
   • Solution: Stick to your plan, wait for setups

2. **Revenge Trading**
   • Trading to "get back" losses
   • Solution: Take a break after losses

3. **Overconfidence**
   • Taking excessive risk after wins
   • Solution: Stay consistent with position sizing

4. **Analysis Paralysis**
   • Too much research, never executing
   • Solution: Have clear entry rules

**Winning Mindset:**

✓ **Trading is a Marathon**: Focus on long-term consistency
✓ **Losses are Tuition**: Learn from every trade
✓ **Process > Outcome**: Good process leads to good results
✓ **Stay Humble**: Market can humble anyone

**The Professional Routine:**
1. Pre-market: Review watchlist & news
2. During market: Execute plan, avoid impulsive trades
3. Post-market: Journal trades & review

**Trading Journal:**
Track every trade:
• Entry/exit prices
• Reasoning
• Emotions felt
• What you learned

**Keys to Success:**
• Small consistent gains > big risky wins
• Protect capital first, profits second
• Never stop learning

Complete \`!quiz 5\` to graduate! 🎓`,
    quiz: [
      {
        question: "What is FOMO?",
        options: ["A) Following a plan", "B) Fear of missing out", "C) Taking profits", "D) Using stop losses"],
        correct: 1
      },
      {
        question: "What should you focus on?",
        options: ["A) Every single trade outcome", "B) Getting rich quick", "C) Long-term consistency", "D) Copying other traders"],
        correct: 2
      }
    ]
  }
};

// Get stock quote
async function getQuote(symbol) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${CONFIG.FINNHUB_API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return null;
  }
}

// Paper trading functions
async function paperBuy(userId, symbol, shares) {
  const user = initUser(userId);
  const quote = await getQuote(symbol);
  
  if (!quote || !quote.c) {
    return { success: false, message: "Could not fetch stock price. Check symbol." };
  }

  const price = quote.c;
  const cost = price * shares;

  if (cost > user.balance) {
    return { success: false, message: `Insufficient funds. Need $${cost.toFixed(2)}, have $${user.balance.toFixed(2)}` };
  }

  user.balance -= cost;
  
  if (!user.portfolio[symbol]) {
    user.portfolio[symbol] = { shares: 0, avgPrice: 0 };
  }

  const currentTotal = user.portfolio[symbol].shares * user.portfolio[symbol].avgPrice;
  user.portfolio[symbol].shares += shares;
  user.portfolio[symbol].avgPrice = (currentTotal + cost) / user.portfolio[symbol].shares;

  user.trades.push({
    type: 'BUY',
    symbol,
    shares,
    price,
    date: new Date().toISOString()
  });

  user.experience += 10;
  checkLevelUp(user);

  saveUserData();
  return { success: true, price, cost };
}

async function paperSell(userId, symbol, shares) {
  const user = initUser(userId);
  
  if (!user.portfolio[symbol] || user.portfolio[symbol].shares < shares) {
    return { success: false, message: "You don't own enough shares to sell." };
  }

  const quote = await getQuote(symbol);
  if (!quote || !quote.c) {
    return { success: false, message: "Could not fetch stock price." };
  }

  const price = quote.c;
  const revenue = price * shares;
  const costBasis = user.portfolio[symbol].avgPrice * shares;
  const profitLoss = revenue - costBasis;

  user.balance += revenue;
  user.portfolio[symbol].shares -= shares;

  if (user.portfolio[symbol].shares === 0) {
    delete user.portfolio[symbol];
  }

  user.trades.push({
    type: 'SELL',
    symbol,
    shares,
    price,
    profitLoss,
    date: new Date().toISOString()
  });

  user.experience += 15;
  checkLevelUp(user);

  saveUserData();
  return { success: true, price, revenue, profitLoss };
}

function checkLevelUp(user) {
  const requiredXP = user.level * 100;
  if (user.experience >= requiredXP) {
    user.level++;
    user.experience -= requiredXP;
    return true;
  }
  return false;
}

// Bot ready
client.once('ready', () => {
  console.log(`📚 ${client.user.tag} is ready to teach!`);
});

// Handle messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();
  const userId = message.author.id;

  // Start learning
  if (command === '!start') {
    initUser(userId);
    const embed = new EmbedBuilder()
      .setTitle('🎓 Welcome to Stock Trading School!')
      .setDescription(
        'Learn to trade stocks profitably with our structured curriculum!\n\n' +
        '**Features:**\n' +
        '📚 5 comprehensive lessons\n' +
        '📝 Quizzes to test knowledge\n' +
        '💰 Paper trading practice\n' +
        '📊 Real-time market data\n' +
        '🎯 Track your progress\n\n' +
        '**Get Started:**\n' +
        'Type `!lesson 1` to begin!'
      )
      .setColor('#00FF00')
      .setFooter({ text: 'Starting Balance: $10,000' });
    
    message.reply({ embeds: [embed] });
  }

  // View lesson
  if (command === '!lesson') {
    const lessonNum = parseInt(args[1]);
    
    if (!lessonNum || lessonNum < 1 || lessonNum > 5) {
      message.reply('Usage: `!lesson [1-5]`');
      return;
    }

    const user = initUser(userId);
    const lesson = curriculum[lessonNum];

    // Check if previous lessons completed
    if (lessonNum > 1 && !user.completedLessons.includes(lessonNum - 1)) {
      message.reply(`🔒 Complete Lesson ${lessonNum - 1} first!`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(lesson.title)
      .setDescription(lesson.content)
      .setColor('#3498db')
      .setFooter({ text: `Your Level: ${user.level} | XP: ${user.experience}` });

    message.reply({ embeds: [embed] });
  }

  // Take quiz
  if (command === '!quiz') {
    const lessonNum = parseInt(args[1]);
    
    if (!lessonNum || !curriculum[lessonNum]) {
      message.reply('Usage: `!quiz [1-5]`');
      return;
    }

    const user = initUser(userId);
    const quiz = curriculum[lessonNum].quiz;
    let score = 0;

    const embed = new EmbedBuilder()
      .setTitle(`📝 Lesson ${lessonNum} Quiz`)
      .setColor('#f39c12');

    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      embed.addFields({
        name: `Question ${i + 1}:`,
        value: `${q.question}\n${q.options.join('\n')}`
      });
    }

    embed.setFooter({ text: 'Reply with your answers (e.g., "B A" for question 1=B, question 2=A)' });
    
    const quizMsg = await message.reply({ embeds: [embed] });

    const filter = m => m.author.id === userId;
    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 120000 });

    collector.on('collect', m => {
      const answers = m.content.toUpperCase().split(' ');
      
      quiz.forEach((q, idx) => {
        const userAnswer = answers[idx];
        const correctLetter = q.options[q.correct][0];
        
        if (userAnswer === correctLetter) {
          score++;
        }
      });

      const passed = score >= quiz.length * 0.7;
      const resultEmbed = new EmbedBuilder()
        .setTitle(passed ? '✅ Quiz Passed!' : '❌ Quiz Failed')
        .setDescription(`Score: ${score}/${quiz.length}\n\n${passed ? `Great job! Lesson ${lessonNum} completed.\n+50 XP` : 'Study the lesson again and retry!'}`)
        .setColor(passed ? '#00FF00' : '#FF0000');

      if (passed && !user.completedLessons.includes(lessonNum)) {
        user.completedLessons.push(lessonNum);
        user.quizScores[lessonNum] = score;
        user.experience += 50;
        checkLevelUp(user);
        saveUserData();

        if (lessonNum < 5) {
          resultEmbed.addFields({ name: 'Next Step:', value: `Type \`!lesson ${lessonNum + 1}\` to continue!` });
        } else {
          resultEmbed.addFields({ name: '🎓 Congratulations!', value: 'You\'ve completed the curriculum! Start paper trading with `!paper help`' });
        }
      }

      message.reply({ embeds: [resultEmbed] });
    });
  }

  // Paper trading commands
  if (command === '!paper') {
    const subCmd = args[1]?.toLowerCase();

    if (subCmd === 'buy') {
      const symbol = args[2]?.toUpperCase();
      const shares = parseInt(args[3]);

      if (!symbol || !shares || shares <= 0) {
        message.reply('Usage: `!paper buy SYMBOL SHARES`\nExample: `!paper buy AAPL 10`');
        return;
      }

      const result = await paperBuy(userId, symbol, shares);
      
      if (result.success) {
        const embed = new EmbedBuilder()
          .setTitle('✅ Order Filled')
          .setDescription(`Bought ${shares} shares of ${symbol}`)
          .addFields(
            { name: 'Price', value: `$${result.price.toFixed(2)}`, inline: true },
            { name: 'Total Cost', value: `$${result.cost.toFixed(2)}`, inline: true },
            { name: 'Remaining Balance', value: `$${userData[userId].balance.toFixed(2)}`, inline: true }
          )
          .setColor('#00FF00');
        message.reply({ embeds: [embed] });
      } else {
        message.reply(`❌ ${result.message}`);
      }
    }

    if (subCmd === 'sell') {
      const symbol = args[2]?.toUpperCase();
      const shares = parseInt(args[3]);

      if (!symbol || !shares || shares <= 0) {
        message.reply('Usage: `!paper sell SYMBOL SHARES`');
        return;
      }

      const result = await paperSell(userId, symbol, shares);
      
      if (result.success) {
        const plEmoji = result.profitLoss >= 0 ? '📈' : '📉';
        const plColor = result.profitLoss >= 0 ? '#00FF00' : '#FF0000';
        
        const embed = new EmbedBuilder()
          .setTitle('✅ Order Filled')
          .setDescription(`Sold ${shares} shares of ${symbol}`)
          .addFields(
            { name: 'Price', value: `$${result.price.toFixed(2)}`, inline: true },
            { name: 'Revenue', value: `$${result.revenue.toFixed(2)}`, inline: true },
            { name: `${plEmoji} P/L`, value: `$${result.profitLoss.toFixed(2)}`, inline: true }
          )
          .setColor(plColor);
        message.reply({ embeds: [embed] });
      } else {
        message.reply(`❌ ${result.message}`);
      }
    }

    if (subCmd === 'portfolio' || subCmd === 'p') {
      const user = initUser(userId);
      let totalValue = user.balance;
      
      const embed = new EmbedBuilder()
        .setTitle('💼 Your Portfolio')
        .setColor('#3498db')
        .addFields({ name: 'Cash', value: `$${user.balance.toFixed(2)}`, inline: true });

      for (const [symbol, position] of Object.entries(user.portfolio)) {
        const quote = await getQuote(symbol);
        if (quote && quote.c) {
          const currentValue = quote.c * position.shares;
          const costBasis = position.avgPrice * position.shares;
          const pl = currentValue - costBasis;
          const plPercent = (pl / costBasis) * 100;
          
          totalValue += currentValue;
          
          embed.addFields({
            name: `${symbol}`,
            value: `Shares: ${position.shares}\nAvg: $${position.avgPrice.toFixed(2)}\nCurrent: $${quote.c.toFixed(2)}\nP/L: $${pl.toFixed(2)} (${plPercent.toFixed(2)}%)`,
            inline: true
          });
        }
      }

      const totalPL = totalValue - CONFIG.STARTING_BALANCE;
      const totalPLPercent = (totalPL / CONFIG.STARTING_BALANCE) * 100;

      embed.addFields(
        { name: 'Total Value', value: `$${totalValue.toFixed(2)}`, inline: true },
        { name: 'Total P/L', value: `$${totalPL.toFixed(2)} (${totalPLPercent.toFixed(2)}%)`, inline: true }
      );

      message.reply({ embeds: [embed] });
    }

    if (subCmd === 'help') {
      const helpEmbed = new EmbedBuilder()
        .setTitle('📊 Paper Trading Commands')
        .setColor('#e67e22')
        .addFields(
          { name: '!paper buy SYMBOL SHARES', value: 'Buy shares (e.g., !paper buy AAPL 10)' },
          { name: '!paper sell SYMBOL SHARES', value: 'Sell shares' },
          { name: '!paper portfolio (or p)', value: 'View your portfolio' },
          { name: '!paper reset', value: 'Reset your paper account' }
        );
      message.reply({ embeds: [helpEmbed] });
    }

    if (subCmd === 'reset') {
      userData[userId] = {
        balance: CONFIG.STARTING_BALANCE,
        portfolio: {},
        completedLessons: userData[userId]?.completedLessons || [],
        quizScores: userData[userId]?.quizScores || {},
        trades: [],
        level: userData[userId]?.level || 1,
        experience: userData[userId]?.experience || 0,
      };
      saveUserData();
      message.reply('✅ Paper trading account reset to $10,000');
    }
  }

  // Check progress
  if (command === '!progress') {
    const user = initUser(userId);
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Your Progress')
      .setColor('#9b59b6')
      .addFields(
        { name: 'Level', value: `${user.level}`, inline: true },
        { name: 'Experience', value: `${user.experience}/${user.level * 100} XP`, inline: true },
        { name: 'Lessons Completed', value: `${user.completedLessons.length}/5`, inline: true },
        { name: 'Total Trades', value: `${user.trades.length}`, inline: true }
      );

    if (user.completedLessons.length > 0) {
      embed.addFields({
        name: 'Completed Lessons',
        value: user.completedLessons.map(l => `✅ Lesson ${l}`).join('\n')
      });
    }

    message.reply({ embeds: [embed] });
  }

  // Help command
  if (command === '!help' || command === '!learn') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('🎓 Stock Trading Bot - Commands')
      .setColor('#3498db')
      .setDescription('Learn to trade stocks profitably!')
      .addFields(
        { name: '📚 Learning', value: '`!start` - Begin your journey\n`!lesson [1-5]` - View lesson\n`!quiz [1-5]` - Take quiz\n`!progress` - Check progress' },
        { name: '💰 Paper Trading', value: '`!paper help` - Trading commands\n`!paper buy SYMBOL SHARES`\n`!paper sell SYMBOL SHARES`\n`!paper portfolio`' },
        { name: '📊 Market Data', value: '`!quote SYMBOL` - Get stock price\n`!chart SYMBOL` - View chart' }
      )
      .setFooter({ text: 'Start with !start to begin learning!' });

    message.reply({ embeds: [helpEmbed] });
  }

  // Get stock quote
  if (command === '!quote') {
    const symbol = args[1]?.toUpperCase();
    if (!symbol) {
      message.reply('Usage: `!quote SYMBOL`');
      return;
    }

    const quote = await getQuote(symbol);
    if (!quote || !quote.c) {
      message.reply('Could not fetch quote. Check symbol.');
      return;
    }

    const change = quote.c - quote.pc;
    const changePercent = (change / quote.pc) * 100;
    const color = change >= 0 ? '#00FF00' : '#FF0000';
    const arrow = change >= 0 ? '📈' : '📉';

    const embed = new EmbedBuilder()
      .setTitle(`${symbol} Quote`)
      .addFields(
        { name: 'Price', value: `$${quote.c.toFixed(2)}`, inline: true },
        { name: `${arrow} Change`, value: `$${change.toFixed(2)} (${changePercent.toFixed(2)}%)`, inline: true },
        { name: 'High', value: `$${quote.h.toFixed(2)}`, inline: true },
        { name: 'Low', value: `$${quote.l.toFixed(2)}`, inline: true },
        { name: 'Open', value: `$${quote.o.toFixed(2)}`, inline: true },
        { name: 'Prev Close', value: `$${quote.pc.toFixed(2)}`, inline: true }
      )
      .setColor(color)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }

  // Chart link
  if (command === '!chart') {
    const symbol = args[1]?.toUpperCase();
    if (!symbol) {
      message.reply('Usage: `!chart SYMBOL`');
      return;
    }

    message.reply(`📊 **${symbol} Chart:** https://finviz.com/quote.ashx?t=${symbol}`);
  }
});

// Login
client.login(CONFIG.DISCORD_TOKEN);

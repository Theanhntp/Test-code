import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

interface Token {
  symbol: string;
  name: string;
  price: number;
}

const SwapForm: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<string>('0.00');
  const [loading, setLoading] = useState<boolean>(false);
  const [pricesLoading, setPricesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [fromDropdownOpen, setFromDropdownOpen] = useState<boolean>(false);
  const [toDropdownOpen, setToDropdownOpen] = useState<boolean>(false);

  const tokenNames: Record<string, string> = {
    'SWTH': 'Switcheo',
    'ETH': 'Ethereum',
    'USDC': 'USD Coin',
    'WBTC': 'Wrapped Bitcoin',
    'NEO': 'Neo',
    'GAS': 'Neo Gas',
    'BUSD': 'Binance USD',
    'DAI': 'Dai Stablecoin',
    'WETH': 'Wrapped Ethereum'
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setPricesLoading(true);
        const response = await fetch('https://interview.switcheo.com/prices.json');
        const data: TokenPrice[] = await response.json();
        
        const uniqueTokens = data.reduce((acc: Record<string, TokenPrice>, current) => {
          if (!acc[current.currency] || new Date(current.date) > new Date(acc[current.currency].date)) {
            acc[current.currency] = current;
          }
          return acc;
        }, {});

        const tokenList = Object.keys(tokenNames)
          .map(symbol => {
            const priceData = uniqueTokens[symbol];
            return priceData ? {
              symbol,
              name: tokenNames[symbol],
              price: priceData.price
            } : null;
          })
          .filter((token): token is Token => token !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setTokens(tokenList);
        
        if (tokenList.length >= 2) {
          setFromToken('ETH');
          setToToken('USDC');
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        setError('Failed to load token prices. Please try again.');
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    if (amount && fromToken && toToken && tokens.length > 0) {
      const fromPrice = tokens.find(t => t.symbol === fromToken)?.price || 0;
      const toPrice = tokens.find(t => t.symbol === toToken)?.price || 0;
      
      if (fromPrice > 0 && toPrice > 0) {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount)) {
          const converted = (numAmount * fromPrice) / toPrice;
          setConvertedAmount(converted.toFixed(6));
        }
      }
    } else {
      setConvertedAmount('0.00');
    }
  }, [amount, fromToken, toToken, tokens]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleSwapTokens = () => {
    if (fromToken && toToken) {
      setFromToken(toToken);
      setToToken(fromToken);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromToken || !toToken) {
      setError('Please select both tokens');
      return;
    }
    
    if (fromToken === toToken) {
      setError('Please select different tokens');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 3000);
  };

  const getTokenIcon = (symbol: string) => 
    `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

  const TokenDropdown: React.FC<{
    selectedToken: string;
    onSelect: (token: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    placeholder: string;
    excludeToken?: string;
  }> = ({ selectedToken, onSelect, isOpen, onToggle, placeholder, excludeToken }) => (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        {selectedToken ? (
          <div className="flex items-center space-x-3">
            <img 
              src={getTokenIcon(selectedToken)} 
              alt={selectedToken}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-left">
              <div className="font-semibold text-gray-900">{selectedToken}</div>
              <div className="text-sm text-gray-500">
                {tokens.find(t => t.symbol === selectedToken)?.name}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            {tokens
              .filter(token => token.symbol !== excludeToken)
              .map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    onSelect(token.symbol);
                    onToggle();
                  }}
                  className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                >
                  <img 
                    src={getTokenIcon(token.symbol)} 
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  <div className="text-sm text-gray-600">${token.price.toFixed(4)}</div>
                </button>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (pricesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading token prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Token Swap</h1>
            <p className="text-gray-600">Exchange tokens at real-time rates</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <TokenDropdown
                selectedToken={fromToken}
                onSelect={setFromToken}
                isOpen={fromDropdownOpen}
                onToggle={() => setFromDropdownOpen(!fromDropdownOpen)}
                placeholder="Select token"
                excludeToken={toToken}
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <motion.button
                type="button"
                onClick={handleSwapTokens}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                disabled={!fromToken || !toToken}
              >
                <ArrowUpDown className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            {/* To Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <TokenDropdown
                selectedToken={toToken}
                onSelect={setToToken}
                isOpen={toDropdownOpen}
                onToggle={() => setToDropdownOpen(!toDropdownOpen)}
                placeholder="Select token"
                excludeToken={fromToken}
              />
            </div>

            {/* Converted Amount Display */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">You'll receive approximately</div>
              <div className="text-2xl font-bold text-gray-900">
                {convertedAmount} {toToken || '---'}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Swap completed successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !fromToken || !toToken || !amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Swap Tokens</span>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SwapForm;
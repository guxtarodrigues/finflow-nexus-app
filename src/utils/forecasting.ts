
import { format, addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Simple linear regression for forecasting
export const calculateLinearRegression = (data: number[]): { slope: number; intercept: number } => {
  const n = data.length;
  if (n <= 1) return { slope: 0, intercept: data[0] || 0 };
  
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xSum = xValues.reduce((sum, x) => sum + x, 0);
  const ySum = data.reduce((sum, y) => sum + y, 0);
  const xySum = xValues.reduce((sum, x, i) => sum + x * data[i], 0);
  const xSquaredSum = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;
  
  return { slope, intercept };
};

// Predict next n values based on linear regression
export const predictNextValues = (
  data: number[], 
  periods: number,
  regressionParams?: { slope: number; intercept: number }
): number[] => {
  const { slope, intercept } = regressionParams || calculateLinearRegression(data);
  const startIndex = data.length;
  
  return Array.from({ length: periods }, (_, i) => {
    const prediction = slope * (startIndex + i) + intercept;
    return Math.max(0, prediction); // Ensure no negative predictions
  });
};

// Calculate moving average
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  if (data.length < window) return [...data];
  
  const result = [];
  for (let i = 0; i <= data.length - window; i++) {
    const slice = data.slice(i, i + window);
    const avg = slice.reduce((sum, val) => sum + val, 0) / window;
    result.push(avg);
  }
  
  return result;
};

// Calculate month-over-month growth rate
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Format data for charts
export const formatMonthlyForecastData = (
  historicalData: number[], 
  forecastData: number[], 
  startDate: Date
) => {
  const result = [];
  
  // Format historical data
  for (let i = 0; i < historicalData.length; i++) {
    const date = subMonths(startDate, historicalData.length - i);
    result.push({
      month: format(date, 'MMM/yyyy'),
      value: historicalData[i],
      type: 'historical'
    });
  }
  
  // Format forecast data
  for (let i = 0; i < forecastData.length; i++) {
    const date = addMonths(startDate, i + 1);
    result.push({
      month: format(date, 'MMM/yyyy'),
      value: forecastData[i],
      type: 'forecast'
    });
  }
  
  return result;
};

// Calculate seasonality adjusted forecast
export const calculateSeasonalForecast = (
  monthlyData: { [key: string]: number[] }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  
  // Calculate average for each month
  Object.entries(monthlyData).forEach(([month, values]) => {
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      result[month] = sum / values.length;
    } else {
      result[month] = 0;
    }
  });
  
  return result;
};

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LedgerEntry } from '../../domain/types';

interface SavingsLineProps {
  ledger: LedgerEntry[];
  monthsToShow?: number;
  createdAt?: number; // epoch ms; when provided and no ledger, show zero line from createdAt
}

interface ChartDataPoint {
  date: string;
  balance: number;
  displayDate: string;
}

export default function SavingsLine({ ledger, monthsToShow = 3, createdAt }: SavingsLineProps) {
  // Generate chart data from ledger
  const chartData = generateChartData(ledger, monthsToShow, createdAt);

  // Always render the chart; when chartData has minimal points, it's okay

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="displayDate" 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
            labelStyle={{ color: '#0f172a' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Generates daily balance data points for the chart (one point per day)
 */
function generateChartData(ledger: LedgerEntry[], monthsToShow: number, createdAt?: number): ChartDataPoint[] {
  const now = Date.now();
  const startTimeDefault = now - (monthsToShow * 30 * 24 * 60 * 60 * 1000);
  const startTime = Math.min(createdAt ?? startTimeDefault, startTimeDefault);

  if (ledger.length === 0) {
    // Show a flat zero-line from max(createdAt, startTime) to now
    const rangeStart = Math.max(startTime, createdAt ?? startTimeDefault);
    const startDate = new Date(rangeStart);
    const endDate = new Date(now);
    return [
      { date: startDate.toISOString(), balance: 0, displayDate: formatDateShort(startDate) },
      { date: endDate.toISOString(), balance: 0, displayDate: formatDateShort(endDate) },
    ];
  }

  // Sort ledger by timestamp (should already be sorted, but ensure it)
  const sortedLedger = [...ledger].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate starting balance (sum of all entries before startTime)
  const entriesBeforeStart = sortedLedger.filter(entry => entry.timestamp < startTime);
  let runningBalance = entriesBeforeStart.reduce((sum, entry) => sum + entry.value, 0);

  // Filter to only entries within the time range
  const relevantEntries = sortedLedger.filter(entry => entry.timestamp >= startTime);

  if (relevantEntries.length === 0) {
    const startDateAlt = new Date(Math.max(startTime, createdAt ?? startTimeDefault));
    const endDateAlt = new Date(now);
    return [
      { date: startDateAlt.toISOString(), balance: Math.max(0, runningBalance), displayDate: formatDateShort(startDateAlt) },
      { date: endDateAlt.toISOString(), balance: Math.max(0, runningBalance), displayDate: formatDateShort(endDateAlt) },
    ];
  }

  // Group transactions by day and calculate end-of-day balance
  const dailyBalances = new Map<string, { balance: number; timestamp: number }>();

  // Add starting point
  const startDateKey = getDateKey(new Date(startTime));
  dailyBalances.set(startDateKey, { 
    balance: Math.max(0, runningBalance), 
    timestamp: startTime 
  });

  // Process each transaction
  for (const entry of relevantEntries) {
    runningBalance += entry.value;
    const entryDate = new Date(entry.timestamp);
    const dateKey = getDateKey(entryDate);
    
    // Update the balance for this day (overwrite with the latest balance for the day)
    dailyBalances.set(dateKey, { 
      balance: Math.max(0, runningBalance),
      timestamp: entry.timestamp 
    });
  }

  // Convert to array and sort by date
  const dataPoints: ChartDataPoint[] = Array.from(dailyBalances.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .map(([dateKey, data]) => ({
      date: new Date(data.timestamp).toISOString(),
      balance: data.balance,
      displayDate: formatDateShort(new Date(data.timestamp)),
    }));

  // Add current point if the last entry isn't today
  const lastEntry = relevantEntries[relevantEntries.length - 1];
  const todayKey = getDateKey(new Date(now));
  const lastEntryKey = getDateKey(new Date(lastEntry.timestamp));
  
  if (todayKey !== lastEntryKey) {
    const currentDate = new Date(now);
    dataPoints.push({
      date: currentDate.toISOString(),
      balance: Math.max(0, runningBalance),
      displayDate: formatDateShort(currentDate),
    });
  }

  return dataPoints;
}

/**
 * Gets a date key in YYYY-MM-DD format for grouping
 */
function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats date for chart display
 */
function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


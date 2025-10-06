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
 * Generates daily balance data points for the chart
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

  // Filter to only entries within the time range
  const relevantEntries = sortedLedger.filter(entry => entry.timestamp >= startTime);

  if (relevantEntries.length === 0) {
    const startDateAlt = new Date(Math.max(startTime, createdAt ?? startTimeDefault));
    const endDateAlt = new Date(now);
    return [
      { date: startDateAlt.toISOString(), balance: 0, displayDate: formatDateShort(startDateAlt) },
      { date: endDateAlt.toISOString(), balance: 0, displayDate: formatDateShort(endDateAlt) },
    ];
  }

  // Calculate balance at each entry point
  const dataPoints: ChartDataPoint[] = [];
  let runningBalance = 0;

  // Calculate starting balance (sum of all entries before startTime)
  const entriesBeforeStart = sortedLedger.filter(entry => entry.timestamp < startTime);
  runningBalance = entriesBeforeStart.reduce((sum, entry) => sum + entry.value, 0);

  // Add starting point
  const startDate = new Date(startTime);
  dataPoints.push({
    date: startDate.toISOString(),
    balance: Math.max(0, runningBalance),
    displayDate: formatDateShort(startDate),
  });

  // Add data point for each transaction
  for (const entry of relevantEntries) {
    runningBalance += entry.value;
    const entryDate = new Date(entry.timestamp);
    dataPoints.push({
      date: entryDate.toISOString(),
      balance: Math.max(0, runningBalance),
      displayDate: formatDateShort(entryDate),
    });
  }

  // Add current point if the last entry isn't today
  const lastEntry = relevantEntries[relevantEntries.length - 1];
  const daysSinceLastEntry = (now - lastEntry.timestamp) / (24 * 60 * 60 * 1000);
  
  if (daysSinceLastEntry > 1) {
    const currentDate = new Date(now);
    dataPoints.push({
      date: currentDate.toISOString(),
      balance: Math.max(0, runningBalance),
      displayDate: formatDateShort(currentDate),
    });
  }

  // Sample data points if there are too many (keep every Nth point)
  if (dataPoints.length > 30) {
    const step = Math.ceil(dataPoints.length / 30);
    const sampledPoints = dataPoints.filter((_, index) => index % step === 0);
    // Always include the last point
    if (sampledPoints[sampledPoints.length - 1] !== dataPoints[dataPoints.length - 1]) {
      sampledPoints.push(dataPoints[dataPoints.length - 1]);
    }
    return sampledPoints;
  }

  return dataPoints;
}

/**
 * Formats date for chart display
 */
function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


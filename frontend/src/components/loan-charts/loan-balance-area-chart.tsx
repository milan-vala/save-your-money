import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatShortDate,
} from "@src/utils/loan-formatters";

type LoanBalanceDatum = {
  ts: number;
  balance: number;
};

type LoanBalanceAreaChartProps = {
  data: LoanBalanceDatum[];
  todayTs: number;
};

export function LoanBalanceAreaChart({
  data,
  todayTs,
}: LoanBalanceAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
        <XAxis
          dataKey="ts"
          type="number"
          tickFormatter={(value: number) => formatShortDate(value)}
          domain={["dataMin", "dataMax"]}
        />
        <YAxis tickFormatter={formatCompactCurrency} />
        <Tooltip
          labelFormatter={(value: number) => formatDate(value)}
          formatter={(value: number) => formatCurrency(value)}
        />
        <ReferenceLine
          x={todayTs}
          stroke="#f43f5e"
          strokeDasharray="5 5"
          label={{ value: "Today", fill: "#f43f5e", fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

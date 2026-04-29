import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@src/utils/loan-formatters";

type PaidVsRemainingDatum = {
  metric: string;
  paid: number;
  remaining: number;
};

type PaidVsRemainingBarChartProps = {
  data: PaidVsRemainingDatum[];
};

export function PaidVsRemainingBarChart({
  data,
}: PaidVsRemainingBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
        <XAxis type="number" tickFormatter={formatCompactCurrency} />
        <YAxis dataKey="metric" type="category" width={70} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="paid" fill="#3b82f6" name="Paid" radius={[0, 6, 6, 0]} />
        <Bar
          dataKey="remaining"
          fill="#94a3b8"
          name="Remaining"
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

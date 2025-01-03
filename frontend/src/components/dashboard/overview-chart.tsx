import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarDataPoint } from '@/types/data-point';

interface OverviewChartProps {
  overviewChartData: Array<BarDataPoint>;
}

const OverviewChart: React.FC<OverviewChartProps> = ({ overviewChartData }) => {
  const rooms = Object.keys(overviewChartData[0]).filter(
    (key) => key !== 'date',
  );

  const chartConfig = rooms.reduce(
    (config, room, index) => {
      config[room] = {
        label: room,
        color: `hsl(var(--chart-${index}))`,
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>,
  );

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>Showing Usage for the last 30 days</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={overviewChartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="usage"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {rooms.map((room, index) => (
              <Bar
                key={room}
                dataKey={room}
                stackId="a"
                fill={`hsl(var(--chart-${index}))`}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export { OverviewChart };

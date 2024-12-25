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
} from '@/components/ui/chart';

type DataPoint = {
  date: string;
  [key: string]: number | string;
};

interface OverviewChartProps {
  overviewChartData: Array<DataPoint>;
  overviewChartTags: Array<string>;
}

const OverviewChart: React.FC<OverviewChartProps> = ({
  overviewChartData,
  overviewChartTags,
}) => {
  const chartConfig = {
    views: {
      label: 'Page Views',
    },
  } as Record<string, { label: string; color?: string }>;

  overviewChartTags.forEach((tag, index) => {
    chartConfig[tag] = {
      label: overviewChartTags[index],
      color: `hsl(var(--chart-${index}))`,
    };
  });

  const [activeChart, setActiveChart] = React.useState<string>(
    overviewChartTags[0],
  );

  const total = React.useMemo(() => {
    const result: Record<string, number> = {};
    overviewChartTags.forEach((tag) => {
      result[tag] = overviewChartData.reduce(
        (acc, curr) =>
          acc + (typeof curr[tag] === 'number' ? (curr[tag] as number) : 0),
        0,
      );
    });
    return result;
  }, [overviewChartData, overviewChartTags]);

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Plug Tag Trends</CardTitle>
          <CardDescription>
            Showing Total Usage of Tags for the last 30 days
          </CardDescription>
        </div>
        <div className="flex">
          {overviewChartTags.map((chart) => (
            <button
              key={chart}
              data-active={activeChart === chart}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(chart)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[chart].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[chart].toLocaleString()}
              </span>
            </button>
          ))}
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
            <CartesianGrid vertical={false} />
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
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export { OverviewChart };

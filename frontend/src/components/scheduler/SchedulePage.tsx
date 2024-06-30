import React, { useState } from 'react';
import RuleTable from './RuleTable';
import RuleAdder from './RuleAdder';
import { Container, Grid } from '@mantine/core';
import { Schedule, NewRule, Rule } from './types';

const SchedulePage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 1,
      device_name: 'Living Room Light',
      action: 'Turn Off',
      time: '21:00',
      schedule: [Schedule.MON],
    },
    {
      id: 2,
      device_name: 'Kitchen Light',
      action: 'Turn On',
      time: '07:00',
      schedule: [Schedule.TUE],
    },
    {
      id: 3,
      device_name: 'Living Room Light',
      action: 'Turn On',
      time: '06:00',
      schedule: [Schedule.WED],
    },
    {
      id: 4,
      device_name: 'Bedroom Heater',
      action: 'Turn Off',
      time: '22:00',
      schedule: [Schedule.THU],
    },
  ]);

  const handleAddRule = (newRule: {
    device_name: string;
    action: string;
    time: string;
    schedule: Schedule[];
  }) => {
    const newId = rules.length ? rules[rules.length - 1].id + 1 : 1;
    setRules([...rules, { id: newId, ...newRule }]);
  };

  const handleDeleteRule = (id: number) => {
    setRules((prevRules) => prevRules.filter((rule) => rule.id !== id));
  };

  const handleUpdateRule = (updatedRule: Rule) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === updatedRule.id ? updatedRule : rule,
      ),
    );
  };

  const handleTestRunRule = (id: number) => {
    console.log(`test running rule ${id}`);
  };

  return (
    <Container>
      <Grid>
        <Grid.Col span={6}>
          <RuleAdder onAddRule={handleAddRule} />
        </Grid.Col>
        <Grid.Col span={6}>
          <RuleTable
            rules={rules}
            onDeleteRule={handleDeleteRule}
            onUpdateRule={handleUpdateRule}
            testRunRule={handleTestRunRule}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default SchedulePage;

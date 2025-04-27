// Import React using "import *" syntax to avoid TypeScript issues with esModuleInterop
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('basic test works', () => {
  render(<div data-testid="hello">Hello World</div>);
  expect(screen.getByTestId('hello')).toBeInTheDocument();
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});

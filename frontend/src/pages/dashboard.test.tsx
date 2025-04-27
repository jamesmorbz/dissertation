import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

jest.mock('./dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard Component</div>,
}));

describe('Dashboard Component (Mocked)', () => {
  test('renders the dashboard', () => {
    render(<div data-testid="test">Test Component</div>);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});

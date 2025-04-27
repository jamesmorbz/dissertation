import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SplashScreen } from './home';

// Mock react-router-dom before importing the component
jest.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
}));

// Mock the components that are imported
jest.mock('@/components/navbar/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button className={className} data-testid="ui-button">
      {children}
    </button>
  ),
}));

describe('SplashScreen Component', () => {
  test('renders the splash screen with all elements', () => {
    render(<SplashScreen />);

    // Check if the navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();

    // Check if the main headings and text are rendered
    expect(screen.getByText('Welcome to Selene')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Monitor, forecast, and optimize your household energy usage with ease.',
      ),
    ).toBeInTheDocument();

    // Check if the Get Started button exists
    expect(screen.getByText('Get Started')).toBeInTheDocument();

    // Check if the image is rendered
    const image = screen.getByAltText('Dashboard preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/home-page.png');

    // Check if the footer content is rendered
    expect(
      screen.getByText('© 2024 Selene. All rights reserved.'),
    ).toBeInTheDocument();

    // Check if all footer links are present
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  test('links have correct routes', () => {
    render(<SplashScreen />);

    // Check if the Get Started button links to dashboard
    const getStartedButton = screen.getByText('Get Started').closest('a');
    expect(getStartedButton).toHaveAttribute('href', '/dashboard');

    // Check if footer links have correct href attributes
    const aboutLink = screen.getByText('About Us').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');

    const privacyLink = screen.getByText('Privacy Policy').closest('a');
    expect(privacyLink).toHaveAttribute('href', '/privacy');

    const termsLink = screen.getByText('Terms of Service').closest('a');
    expect(termsLink).toHaveAttribute('href', '/terms');

    const contactLink = screen.getByText('Contact Us').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});

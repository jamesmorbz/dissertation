import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Login } from './login';
import { userService } from '@/services/user';

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/user', () => ({
  userService: {
    login: jest.fn(),
  },
}));

jest.mock('@/components/navbar/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>,
}));

const mockNavigate = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<Login />);

    // Check if the component renders with all expected elements
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    // Use getAllByText for elements that might appear multiple times
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
    expect(
      screen.getByText('Enter your email below to login to your account'),
    ).toBeInTheDocument();

    // Use more specific and reliable selectors
    expect(screen.getByText('Username / Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('user OR user@example.com'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('shows validation error when submitting with empty fields', async () => {
    // Mock preventDefault to avoid React warnings
    const preventDefault = jest.fn();

    render(<Login />);

    // Submit the form without entering credentials
    const form = screen.getByRole('button', { name: /login/i }).closest('form');
    fireEvent.submit(form, { preventDefault });

    // Wait for error to be rendered (use a RegExp to make the test more flexible)
    await waitFor(() => {
      expect(
        screen.getByText(/username and password are required/i),
      ).toBeInTheDocument();
    });
  });

  test('calls login service and navigates on successful login', async () => {
    // Mock successful login response
    (userService.login as jest.Mock).mockResolvedValue({
      status: 200,
      data: { access_token: 'fake-token' },
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(<Login />);

    // Fill in the form using more specific selectors
    const usernameInput = screen.getByPlaceholderText(
      'user OR user@example.com',
    );
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for the login process to complete
    await waitFor(() => {
      // Check if login service was called with correct parameters
      expect(userService.login).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
      );

      // Check if token was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'fake-token',
      );

      // Check if navigation happened
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows error message on login failure', async () => {
    // Mock failed login response
    (userService.login as jest.Mock).mockResolvedValue({
      status: 401,
      data: { detail: 'Invalid username or password' },
    });

    render(<Login />);

    // Fill in the form
    const usernameInput = screen.getByPlaceholderText(
      'user OR user@example.com',
    );
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for the login process to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(
        screen.getByText('Invalid username or password'),
      ).toBeInTheDocument();
    });
  });

  test('shows error message on API error', async () => {
    // Mock API error
    (userService.login as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    render(<Login />);

    // Fill in the form
    const usernameInput = screen.getByPlaceholderText(
      'user OR user@example.com',
    );
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for the login process to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(
        screen.getByText(/An error occurred. Please try again later/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  test('disables login button during submission', async () => {
    // Mock login with delay to test loading state
    (userService.login as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: 200,
            data: { access_token: 'fake-token' },
          });
        }, 100);
      });
    });

    render(<Login />);

    // Fill in the form
    const usernameInput = screen.getByPlaceholderText(
      'user OR user@example.com',
    );
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Check if button is disabled and shows loading text
    expect(loginButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();

    // Wait for the login process to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

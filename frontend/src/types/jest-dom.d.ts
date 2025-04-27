import '@testing-library/jest-dom';

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    interface Matchers<R, T = any> {
      toBeInTheDocument(): R;
      toHaveTextContent(content: string | RegExp): R;
      toBeVisible(): R;
      // Add any other matchers you use
    }
  }
}

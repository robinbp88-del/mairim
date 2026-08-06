import { render, screen } from '@testing-library/react';
import App from './App';

test('viser Mairim-velkomst', () => {
  render(<App />);
  expect(screen.getByText(/Jeg er Mairim/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Kom i gang/i })).toBeInTheDocument();
});

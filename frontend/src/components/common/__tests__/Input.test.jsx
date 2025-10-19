/**
 * Unit Tests for Input Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Email" name="email" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input label="Email" name="email" error="Email is required" />);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should handle onChange events', () => {
    const handleChange = jest.fn();
    render(<Input label="Email" name="email" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalled();
    expect(input.value).toBe('test@example.com');
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input label="Email" name="email" type="email" />);
    let input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input label="Password" name="password" type="password" />);
    input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input label="Age" name="age" type="number" />);
    input = screen.getByLabelText('Age');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should display placeholder text', () => {
    render(<Input label="Email" name="email" placeholder="Enter your email" />);

    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Email" name="email" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should show required indicator', () => {
    render(<Input label="Email" name="email" required />);

    // Check for asterisk in label
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should apply error styles when error is present', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300'); // Component uses border-red-300 for errors
  });

  it('should support helper text', () => {
    render(<Input label="Email" name="email" helperText="We'll never share your email" />);

    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('should support custom className on wrapper', () => {
    const { container } = render(<Input label="Email" name="email" className="custom-input" />);

    // className is applied to the wrapper div, not the input
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-input');
  });

  it('should support defaultValue', () => {
    render(<Input label="Email" name="email" defaultValue="default@example.com" />);

    const input = screen.getByRole('textbox');
    expect(input.value).toBe('default@example.com');
  });
});

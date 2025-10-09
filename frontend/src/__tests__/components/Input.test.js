import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../../../components/Input';

// Since Input uses forwardRef, we need to test its imperative handle
describe('Input component', () => {
  it('renders with label and proper attributes', () => {
    render(<Input label="Test Label" type="email" required />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Test Label')).toBeRequired();
  });

  it('handles focus and blur events', () => {
    render(<Input label="Test Input" />);
    
    const input = screen.getByLabelText('Test Input');
    const inputGroup = input.closest('.input-group');
    
    fireEvent.focus(input);
    expect(inputGroup).toHaveClass('focused');
    
    fireEvent.blur(input);
    expect(inputGroup).not.toHaveClass('focused');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input label="Test Input" error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Test Input" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Input');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref and exposes imperative methods', () => {
    const ref = React.createRef();
    render(<Input label="Test Input" ref={ref} />);
    
    // Test focus method
    ref.current.focus();
    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveFocus();
    
    // Test getValue method
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(ref.current.getValue()).toBe('test value');
    
    // Test setValue method
    ref.current.setValue('new value');
    expect(input.value).toBe('new value');
    
    // Test blur method
    ref.current.blur();
    expect(input).not.toHaveFocus();
  });

  it('updates hasValue class when value changes', () => {
    const ref = React.createRef();
    render(<Input label="Test Input" ref={ref} />);
    
    const input = screen.getByLabelText('Test Input');
    const inputGroup = input.closest('.input-group');
    
    // Initially should not have has-value class
    expect(inputGroup).not.toHaveClass('has-value');
    
    // Set value and trigger change
    fireEvent.change(input, { target: { value: 'test' } });
    expect(inputGroup).toHaveClass('has-value');
    
    // Clear value
    fireEvent.change(input, { target: { value: '' } });
    expect(inputGroup).not.toHaveClass('has-value');
  });
});
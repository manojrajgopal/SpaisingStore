import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../../components/Input';

// Since Input uses forwardRef, we need to test it properly
describe('Input', () => {
  it('renders with label and handles ref', async () => {
    const ref = React.createRef();
    
    render(<Input ref={ref} label="Test Input" />);
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    
    // Test ref methods
    ref.current.focus();
    expect(document.activeElement).toBe(ref.current);
    
    ref.current.setValue('test value');
    expect(ref.current.getValue()).toBe('test value');
  });

  it('shows error message when provided', () => {
    render(<Input error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    const ref = React.createRef();
    
    render(<Input ref={ref} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    
    expect(ref.current.getValue()).toBe('hello');
  });
});
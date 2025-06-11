import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';

jest.mock('axios');

describe('TransactionForm', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { internalValue: 3.14, externalValue: 5.67 } });
  });

  it('renders and submits a transaction successfully', async () => {
    axios.post.mockResolvedValue({ data: { id: 'tx123' } });

    render(<TransactionForm />);
    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'user123' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Asset Code/i), { target: { value: 'PI' } });
    fireEvent.change(screen.getByLabelText(/Value Type/i), { target: { value: 'external' } });
    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText(/Transaction successful/i)).toBeInTheDocument();
    });
  });

  it('shows validation error if fields are missing', async () => {
    render(<TransactionForm />);
    fireEvent.click(screen.getByText(/Submit/i));
    await waitFor(() => {
      expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed transaction', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Network error' } } });
    render(<TransactionForm />);
    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: 'user321' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Asset Code/i), { target: { value: 'PI' } });
    fireEvent.click(screen.getByText(/Submit/i));
    await waitFor(() => {
      expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
    });
  });
});

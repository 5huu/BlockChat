import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 20px;
`;

const DropdownContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  background-color: #333333;
  color: white;
  font-size: 14px;
`;

const AddButton = styled.button`
  padding: 10px 15px;
  background-color: #444444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555555;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  background-color: #333333;
  color: white;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #444444;
    cursor: not-allowed;
  }
`;

const RecipientSelect = ({
    recipients,
    selectedRecipient,
    onRecipientChange,
    onAddRecipient,
    isLoading
}) => {
    const [newRecipient, setNewRecipient] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddRecipient = async (e) => {
        e.preventDefault();
        if (newRecipient && !isLoading) {
            try {
                await onAddRecipient(newRecipient);
                setNewRecipient('');
                setIsAdding(false);
            } catch (error) {
                console.error('Error adding recipient:', error);
            }
        }
    };

    return (
        <Container>
            <DropdownContainer>
                <Select
                    value={selectedRecipient}
                    onChange={(e) => onRecipientChange(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="">Select a recipient</option>
                    {recipients.map((recipient) => (
                        <option key={recipient} value={recipient}>
                            {recipient}
                        </option>
                    ))}
                </Select>
                <AddButton
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? '✕' : '+'}
                </AddButton>
            </DropdownContainer>

            {isAdding && (
                <Form onSubmit={handleAddRecipient}>
                    <Input
                        type="text"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="Enter recipient address"
                        disabled={isLoading}
                    />
                    <SubmitButton
                        type="submit"
                        disabled={!newRecipient || isLoading}
                    >
                        {isLoading ? 'Adding...' : 'Add'}
                    </SubmitButton>
                </Form>
            )}
        </Container>
    );
};

export default RecipientSelect;

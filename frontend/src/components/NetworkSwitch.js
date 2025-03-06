import React from 'react';
import styled from 'styled-components';
import { switchNetwork } from '../utils/web3';

const SwitchContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const SwitchButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.$isActive ? '#007bff' : '#444444'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background-color: ${props => props.$isActive ? '#0056b3' : '#555555'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const NetworkSwitch = ({ currentNetwork, onNetworkSwitch, isLoading }) => {
  const handleSwitch = async (network) => {
    try {
      await switchNetwork(network);
      onNetworkSwitch(network);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert('Failed to switch network. Please try again.');
    }
  };

  return (
    <SwitchContainer>
      <SwitchButton
        onClick={() => handleSwitch('SEPOLIA')}
        $isActive={currentNetwork === 'SEPOLIA'}
        disabled={isLoading || currentNetwork === 'SEPOLIA'}
      >
        Sepolia
      </SwitchButton>
      <SwitchButton
        onClick={() => handleSwitch('GANACHE')}
        $isActive={currentNetwork === 'GANACHE'}
        disabled={isLoading || currentNetwork === 'GANACHE'}
      >
        Ganache
      </SwitchButton>
    </SwitchContainer>
  );
};

export default NetworkSwitch; 
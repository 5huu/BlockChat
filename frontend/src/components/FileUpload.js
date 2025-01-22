import React, { useState } from 'react';
import styled from 'styled-components';

const FileUploadContainer = styled.div`
  display: inline-block;
  margin-left: 10px;
`;

const FileUploadLabel = styled.label`
  cursor: pointer;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.span`
  padding: 8px 16px;
  background-color: #444444;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555555;
  }
`;

const FileName = styled.span`
  margin-left: 10px;
  font-size: 12px;
  color: #777777;
`;

const FileUpload = ({ onFileSelect, isUploading }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    return (
        <FileUploadContainer>
            <FileUploadLabel>
                <FileInput
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                <FileUploadButton>
                    {isUploading ? 'Uploading...' : '📎 Attach File'}
                </FileUploadButton>
            </FileUploadLabel>
            {fileName && !isUploading && (
                <FileName>{fileName}</FileName>
            )}
        </FileUploadContainer>
    );
};

export default FileUpload;

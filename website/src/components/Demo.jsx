import React, { useState } from 'react';
import axios from 'axios';

const Demo = () => {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (file) {
            setIsLoading(true);
            setError(null);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:5000/predict', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setPrediction(response.data.genre);
            } catch (error) {
                console.error('Error:', error);
                setError(error.response ? error.response.data : error.message);
                setPrediction(null);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-64 p-4 border rounded shadow">
            <div
                className="h-32 border-2 border-dashed rounded flex items-center justify-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                    accept="audio/*"
                />
                <label htmlFor="fileInput" className="text-center">
                    {file ? file.name : 'Drag audio file or click to upload'}
                </label>
            </div>
            <button
                onClick={handleSubmit}
                disabled={!file || isLoading}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
                {isLoading ? 'Processing...' : (file ? 'Predict Genre' : 'Upload an audio file')}
            </button>
            {prediction && (
                <div className="mt-4 text-center">
                    <p>Predicted Genre: <strong>{prediction}</strong></p>
                </div>
            )}
            {error && (
                <div className="mt-4 text-center text-red-500">
                    <p>Error: {JSON.stringify(error)}</p>
                </div>
            )}
        </div>
    );
};

export default Demo;
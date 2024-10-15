import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://sonataai-g44y.onrender.com';

const Demo = () => {
    const [files, setFiles] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'audio/*' });

    const removeFile = (fileToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
        setPredictions((prevPredictions) => {
            const newPredictions = { ...prevPredictions };
            delete newPredictions[fileToRemove.name];
            return newPredictions;
        });
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('Please upload at least one audio file.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await axios.post(`${API_URL}/predict`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return { name: file.name, genre: response.data.genre };
                })
            );

            const newPredictions = results.reduce((acc, result) => {
                acc[result.name] = result.genre;
                return acc;
            }, {});

            setPredictions(newPredictions);
        } catch (error) {
            console.error('Error:', error);
            setError(error.response ? error.response.data.error : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <div
                {...getRootProps()}
                className={`p-6 mt-4 border-2 border-dashed rounded-lg text-center cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} />
                <p className="text-gray-500">
                    {isDragActive ? 'Drop the audio files here...' : 'Drag & drop audio files here, or click to select files'}
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Uploaded Files:</h3>
                    <ul className="space-y-2">
                        {files.map((file) => (
                            <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                <span className="truncate">{file.name}</span>
                                <button
                                    onClick={() => removeFile(file)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`mt-4 w-full p-2 rounded ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-medium`}
            >
                {isLoading ? 'Processing...' : 'Predict Genres'}
            </button>

            {Object.keys(predictions).length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Predictions:</h3>
                    <ul className="space-y-2">
                        {Object.entries(predictions).map(([fileName, genre]) => (
                            <li key={fileName} className="bg-gray-100 p-2 rounded">
                                <span className="font-medium">{fileName}:</span> {genre}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && (
                <div className="mt-4 text-center text-red-500">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default Demo;

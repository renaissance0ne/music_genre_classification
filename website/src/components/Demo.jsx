import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';

const Demo = () => {
    const [files, setFiles] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = (fileToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
        setPredictions((prevPredictions) => {
            const newPredictions = { ...prevPredictions };
            delete newPredictions[fileToRemove.name];
            return newPredictions;
        });
    };

    const handleSubmit = async () => {
        if (files.length > 0) {
            setIsLoading(true);
            setError(null);

            try {
                const results = await Promise.all(
                    files.map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await axios.post('http://localhost:5000/predict', formData, {
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
                setError(error.response ? error.response.data : error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-md p-6 border rounded shadow">
            <div
                {...getRootProps()}
                className={`h-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} accept="audio/*" />
                <p className="text-center">
                    {isDragActive
                        ? 'Drop the audio files here...'
                        : 'Drag audio files or click to upload'}
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Uploaded Files:</h3>
                    <ul className="space-y-2">
                        {files.map((file) => (
                            <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                <span className="truncate">{file.name}</span>
                                <button
                                    onClick={() => removeFile(file)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={files.length === 0 || isLoading}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
                {isLoading ? 'Processing...' : (files.length > 0 ? 'Predict Genres' : 'Upload audio files')}
            </button>

            {Object.keys(predictions).length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Predictions:</h3>
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
                    <p>Error: {JSON.stringify(error)}</p>
                </div>
            )}
        </div>
    );
};

export default Demo;
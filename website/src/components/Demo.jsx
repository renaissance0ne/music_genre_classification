import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';

const Demo = () => {
    const [files, setFiles] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Replace this URL with your Render deployment URL
    const RENDER_API_URL = 'https://mc-backend-34nr.onrender.com';

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
        if (files.length === 0) {
            fileInputRef.current.click();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await axios.post(RENDER_API_URL, formData, {
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
    };

    const handleFileInputChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    return (
        <div className="w-full md:max-w-lg lg:max-w-2xl p-6 border rounded shadow">
            <div
                {...getRootProps()}
                className={`h-48 md:h-64 lg:h-64 border-2 border-dashed rounded flex items-center justify-center cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} accept="audio/*" />
                <p className="text-center text-white font-medium text-lg">
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
                disabled={isLoading}
                className="mt-4 w-full p-2 black_btn orange_gradient"
            >
                {isLoading ? 'Processing...' : (files.length > 0 ? 'Predict Genres' : 'Upload audio files')}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
            />

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
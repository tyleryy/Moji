"use client";
import { useState } from 'react';
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file:', error.message);
        alert('Error uploading file.');
      } else {
        console.log('File uploaded successfully:', data);
        alert('File uploaded successfully.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error occurred.');
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadPage;

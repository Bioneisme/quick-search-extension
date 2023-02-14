import React, {useState} from 'react'
import api from "../../api";

const FileUploadComponent = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ file: string, pages: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFileChange = (event: any) => {
        setSelectedFile(event.target.files[0]);
    }

    const onFileUpload = (event: any) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("file", selectedFile as File);
        api.post('/data/uploadPdf', formData).then(res => {
            if (res.data) {
                setResult(res.data);
                setError(null);
            }
        }).catch(e => {
            setError(e.response.data.message || e.message);
            setResult(null);
        });
    }

    return (
        <div className="container">
            <div className="row">
                <form onSubmit={onFileUpload}>
                    <h3>Upload .pdf file</h3>
                    <div className="form-group">
                        <input type="file" onChange={onFileChange}/>
                    </div>
                    <div className="form-group">
                        <button className="btn btn-primary" type="submit">Upload</button>
                    </div>
                </form>
                {error && <p style={{color: 'red'}}>{error}</p>}
                {result && <p>{`File ${result.file} with ${result.pages} pages uploaded!`}</p>}
            </div>
        </div>
    );
}

export default FileUploadComponent
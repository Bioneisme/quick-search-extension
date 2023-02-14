import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import FileUploadComponent from "./components/FileUploadComponent/FileUploadComponent";
import api from "./api";

const Popup = () => {
    const [status, setStatus] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [files, setFiles] = useState<{ _id: string, filename: string, pages: number }[]>([]);
    const [quizzes, setQuizzes] = useState<{
        _id: string, filename: string, date: string,
        answers: [{ username: string, answer: string }]
    }[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<{
        _id: string, filename: string, date: string,
        answers: [{ username: string, answer: string }]
    }>();
    const [isSaved, setIsSaved] = useState("");

    useEffect(() => {
        let queryOptions = {active: true, currentWindow: true};

        async function getStatusInfo() {
            let tab = await chrome.tabs.query(queryOptions);
            chrome.tabs.sendMessage(tab[0].id || 0, {method: 'getStatus'}, function (response) {
                if (response.status) {
                    setStatus(true);
                } else {
                    setStatus(false);
                }
            });

            chrome.tabs.sendMessage(tab[0].id || 0, {method: 'getFile'}, function (response) {
                if (response.file) {
                    setShowOptions(true);
                    setSelectedFile(response.file);
                    handleCheckbox({target: {checked: true}});
                } else {
                    setShowOptions(false);
                }
            });
        }

        getStatusInfo().then();
    }, []);

    const handleClick = async () => {
        let queryOptions = {active: true, currentWindow: true};
        let tab = await chrome.tabs.query(queryOptions);

        chrome.tabs.sendMessage(tab[0].id || 0, {method: 'change'}, function (response) {
            if (response) {
                setStatus(status => !status);
            }
        });
    }

    const downloadPage = async () => {
        let queryOptions = {active: true, currentWindow: true};
        let tab = await chrome.tabs.query(queryOptions);

        chrome.tabs.sendMessage(tab[0].id || 0, {method: 'getPageHTML'}, function (response) {
            if (response.status == 'ok') {
                setIsSaved("Saved");
            } else {
                setIsSaved("Error: " + response.message);
            }
        });
    }

    const handleCheckbox = (e: any) => {
        const value = e.target.checked;
        if (value) {
            setShowOptions(true);
        } else {
            setShowOptions(false);
        }
        let queryOptions = {active: true, currentWindow: true};

        async function changeChecked() {
            let tab = await chrome.tabs.query(queryOptions);
            if (value) {
                chrome.tabs.sendMessage(tab[0].id || 0,
                    {method: 'setFile', file: selectedFile || files[0].filename});
            } else {
                chrome.tabs.sendMessage(tab[0].id || 0, {method: 'removeFile'});
            }
        }

        async function getFiles() {
            try {
                const res = await api.get('/data/getFiles');
                setFiles(res.data.files);
            } catch (e) {
                console.log(e);
            }
        }

        if (files.length === 0)
            getFiles().then();
        changeChecked().then();
    }

    const changeSelectedFile = (e: any) => {
        let queryOptions = {active: true, currentWindow: true};

        setSelectedFile(e.target.key);

        async function changeChecked() {
            let tab = await chrome.tabs.query(queryOptions);
            chrome.tabs.sendMessage(tab[0].id || 0,
                {method: 'setFile', file: e.target.value});
        }

        changeChecked().then();
    }

    const handleQuiz = async (e: any) => {
        api.get("/data/getQuizzes").then(res => {
            setQuizzes(res.data);
            setSelectedQuiz(res.data[0]);
        });
    }

    const selectQuiz = async (e: any) => {
        const id = e.target.value;
        const quiz = quizzes.find(quiz => quiz._id === id);
        setSelectedQuiz(quiz);
    }

    return (
        <>
            <span> Search by selection: {status ? "Enable" : "Disable"} </span>
            <button onClick={handleClick}>{status ? "Disable" : "Enable"}</button>
            <br/>
            <button onClick={downloadPage}>Send Page</button>
            <span>{isSaved}</span>
            <br/>
            <div>
                <label> Search in a specific file: </label>
                {showOptions ? <input
                    type="checkbox"
                    name="select"
                    checked
                    onChange={handleCheckbox}
                /> : <input
                    type="checkbox"
                    name="select"
                    onChange={handleCheckbox}
                />}

            </div>
            {showOptions && <select onChange={changeSelectedFile}>
                {files.map((file, index) => {
                    return (
                        (selectedFile === file.filename)
                            ?
                            <option key={file._id} value={file.filename} selected>
                                {file.filename}
                            </option>
                            :
                            <option key={file._id} value={file.filename}>
                                {file.filename}
                            </option>
                    )
                })}
            </select>
            }
            <hr/>
            <button onClick={handleQuiz}>Get Answers from TG</button>
            <br/>
            <select onChange={selectQuiz} style={{fontSize: "10px", width: "150px"}}>
                {quizzes.length > 0 && quizzes.map((quiz, index) => {
                    return (
                        <option style={{width: "100%"}} key={index} value={quiz._id}>
                            {index}. ({quiz.date}) {quiz.filename}
                        </option>
                    )
                })
                }
            </select>
            <br/>
            {selectedQuiz && <div>
                <h5>{selectedQuiz.filename} ({selectedQuiz.date})</h5>
                <ul style={{height: '150px', width: '80%', overflow: 'hidden', overflowY: 'scroll'}}>
                    {selectedQuiz.answers.map((answer, index) => {
                        return (
                            <li key={index}>
                                {answer.username}: {answer.answer}
                            </li>
                        )
                    })
                    }
                </ul>
            </div>}
            <FileUploadComponent/>
        </>
    );
};

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);

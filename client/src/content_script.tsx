import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import MouseTooltip from "guyllkegen-react-sticky-mouse-tooltip";
import {setLock} from "./settingsStorage";
import api from "./api";

const TextSelection = () => {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isMouseTooltipVisible, setIsMouseTooltipVisible] = useState(false);

    useEffect(() => {
        chrome.runtime.onMessage.addListener(handleMessages);
        changeEvent();

        return () => {
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("dblclick", doubleClick);
            chrome.runtime.onMessage.removeListener(handleMessages);
        };
    }, []);

    const handleMessages = (request: any, sender: any, sendResponse: any) => {
        if (request.method == 'getPageHTML') {
            const html = document.documentElement.outerHTML;
            const blob = new Blob([html], {type: "text/html"});
            const fileName = document.title;
            const file = new File([blob], `${fileName}.html`);
            const formData = new FormData();
            formData.append("file", file);
            api.post("/data/saveHTML", formData).then(res => {
                if (res.data.status == 'ok') {
                    sendResponse({status: 'ok'});
                } else {
                    sendResponse({status: 'error', message: res.data.message});
                }
            });
        }
        if (request.method == 'getStatus') {
            sendResponse({status: localStorage.getItem("lock")});
        }
        if (request.method == 'setFile') {
            localStorage.setItem("file", request.file);
            sendResponse({status: 'ok'});
        }
        if (request.method == 'removeFile') {
            localStorage.removeItem("file");
            sendResponse({status: 'ok'});
        }
        if (request.method == 'getFile') {
            sendResponse({file: localStorage.getItem("file")});
        }
        if (request.method == 'change') {
            setLock();
            changeEvent();
            sendResponse({status: "ok"});
        }
    }

    const changeEvent = () => {
        if (localStorage.getItem("lock")) {
            document.addEventListener("mouseup", handleSelection);
            document.addEventListener("dblclick", doubleClick);
        } else {
            setIsMouseTooltipVisible(false);
            setText("");
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("dblclick", doubleClick);
        }
    }

    const doubleClick = () => {
        setIsMouseTooltipVisible(isMouseTooltipVisible => !isMouseTooltipVisible);
    }

    const handleSelection = async () => {
        const selectedText = window.getSelection()?.toString().trim();
        if (selectedText) {
            const selectedFile = localStorage.getItem("file");
            setIsMouseTooltipVisible(true);
            try {
                const res = selectedFile ?
                    await api.post('/data/findImgByText', {text: selectedText, file: selectedFile}) :
                    await api.post('/data/findImgByTextAll', {text: selectedText});

                setError(null);
                setText(res.data);
            } catch (e: any) {
                setError(e.response.data.message || e.message);
                setText("");
            }
        }
    };

    return (
        <>
            <MouseTooltip
                visible={isMouseTooltipVisible}
                offsetX={15}
                offsetY={10}
            >
                {error && <p style={{color: 'red'}}>{error}</p>}
                {text && <img src={`http://localhost:5000/uploads/img/${text}`} alt={text}/>}
            </MouseTooltip>
        </>
    );
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<TextSelection/>);
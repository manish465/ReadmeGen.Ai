import { useEffect, useState } from "react";
import InputList from "../components/InputList";
import * as _ from "lodash";
import Notification from "../components/Notification";
import Modal from "../components/Modal";

interface NotificationState {
    show: boolean;
    message: string;
    type: "success" | "error";
}

interface ModalState {
    isOpen: boolean;
    title: string;
    content: string;
}

const GenrateForm = () => {
    const [repoData, setRepoData] = useState<string>("");
    const [filePathListData, setFilePathListData] = useState<string[]>([""]);
    const [infoTextListData, setInfoTextListData] = useState<string[]>([""]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [streamedContent, setStreamedContent] = useState<string>("");

    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        message: "",
        type: "success",
    });

    const [readmeModal, setReadmeModal] = useState<ModalState>({
        isOpen: false,
        title: "",
        content: "",
    });

    useEffect(() => {
        if (streamedContent) {
            setReadmeModal((prev) => ({
                ...prev,
                isOpen: true,
                title: "Generating README.md",
                content: streamedContent,
            }));
        }
    }, [streamedContent]);

    const handleSubmit = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        event.preventDefault();
        setIsLoading(true);
        closeNotification();
        setStreamedContent("");

        const filteredFilePathList = filePathListData.filter(
            (filePath) => !_.isEmpty(filePath.trim()),
        );
        const filteredInfoTextList = infoTextListData.filter(
            (infoText) => !_.isEmpty(infoText.trim()),
        );

        const params = new URLSearchParams({
            repo: repoData,
            inputFilePathList: JSON.stringify(filteredFilePathList),
            customCommands: JSON.stringify(filteredInfoTextList),
        });

        const eventSource = new EventSource(
            `http://localhost:9020/api/v1/readme/generate?${params}`,
        );

        eventSource.onmessage = (event) => {
            try {
                const newContent = event.data;
                setStreamedContent((prevContent) => prevContent + newContent);
            } catch (error) {
                console.error("Error processing message:", error);
                handleError("Error processing server response");
                eventSource.close();
            }
        };

        eventSource.addEventListener("complete", () => {
            handleComplete();
            eventSource.close();
        });

        eventSource.onerror = (error) => {
            handleError("Error generating README: Connection failed");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    };

    const handleError = (message: string) => {
        setIsLoading(false);
        setNotification({
            message,
            type: "error",
            show: true,
        });
        setReadmeModal((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const handleComplete = () => {
        setIsLoading(false);
        setReadmeModal((prev) => ({
            ...prev,
            title: "Generated README.md",
        }));
        setNotification({
            show: true,
            message: "README generated successfully!",
            type: "success",
        });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const closeModal = () => {
        setReadmeModal({ ...readmeModal, isOpen: false });
    };

    const getPreviewContent = () => {
        if (!streamedContent) return "";
        const lines = streamedContent.split("\n");
        return lines.slice(-3).join("\n");
    };

    return (
        <>
            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            <Modal
                isOpen={readmeModal.isOpen}
                onClose={closeModal}
                title={readmeModal.title}
                downloadContent={readmeModal.content}>
                <pre className='streaming-content'>{readmeModal.content}</pre>
            </Modal>

            {isLoading && (
                <div className='loading-overlay'>
                    <div className='loading-spinner'></div>
                    <div className='loading-text'>
                        Generating README...
                        {streamedContent && (
                            <div className='stream-preview'>
                                {getPreviewContent()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className='form-container'>
                <div className='form-header'>
                    <h1>ReadMeGen.AI</h1>
                    <p>Provide your project details</p>
                </div>
                <form id='git-form'>
                    <div className='form-group'>
                        <label htmlFor='githubUrl'>GitHub Repository URL</label>
                        <input
                            type='url'
                            id='githubUrl'
                            name='githubUrl'
                            placeholder='e.g., https://github.com/username/repository.git'
                            required
                            value={repoData}
                            onChange={(event) =>
                                setRepoData(event.target.value)
                            }
                        />
                    </div>
                    <InputList
                        data={filePathListData}
                        headerText='File Paths that you can improve the context to generate readme'
                        placeholderText='e.g., src/components/Button.js'
                        submitButtonText='Add File Path'
                        setCurrentData={setFilePathListData}
                    />
                    <InputList
                        data={infoTextListData}
                        headerText='Info Text'
                        placeholderText='e.g., info related to this repo'
                        submitButtonText='Add Info Text'
                        setCurrentData={setInfoTextListData}
                    />
                    <button
                        type='submit'
                        className='submit-btn'
                        onClick={handleSubmit}>
                        Generate Readme.md
                    </button>
                </form>
            </div>
        </>
    );
};

export default GenrateForm;

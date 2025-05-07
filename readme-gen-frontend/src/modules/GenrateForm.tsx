import { useState } from "react";
import InputList from "../components/InputList";
import axios from "axios";
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

    const handleSubmit = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        event.preventDefault();
        setIsLoading(true);
        closeNotification();

        axios
            .post("http://localhost:9020/api/v1/readme", {
                repo: repoData,
                inputFilePathList: filePathListData.filter(
                    (filePath) => !_.isEmpty(filePath.trim()),
                ),
                customCommands: infoTextListData.filter(
                    (infoText) => !_.isEmpty(infoText.trim()),
                ),
            })
            .then((response) => {
                setReadmeModal({
                    isOpen: true,
                    title: "Generated README.md",
                    content: response.data,
                });
            })
            .catch((error) =>
                setNotification({
                    message: error.message || "An unexpected error occurred.",
                    type: "error",
                    show: true,
                }),
            )
            .finally(() => {
                setIsLoading(false);
            });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const closeModal = () => {
        setReadmeModal({ ...readmeModal, isOpen: false });
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
                <pre>{readmeModal.content}</pre>
            </Modal>

            {isLoading && (
                <div className='loading-overlay'>
                    <div className='loading-spinner'></div>
                    <div className='loading-text'>Generating README...</div>
                </div>
            )}

            <div className='form-conatiner'>
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
                        headerText='File Paths that you can improve the context to genrate readme'
                        placeholderText='e.g., src/components/Button.js'
                        submitButtonText='Add File Path'
                        setCurrentData={(data: string[]) =>
                            setFilePathListData(data)
                        }
                    />
                    <InputList
                        data={infoTextListData}
                        headerText='Info Text'
                        placeholderText='e.g., info realated to this repo'
                        submitButtonText='Add Info Text'
                        setCurrentData={(data: string[]) =>
                            setInfoTextListData(data)
                        }
                    />
                    <button
                        type='submit'
                        className='submit-btn'
                        onClick={(event) => handleSubmit(event)}>
                        Genrate Readme.md
                    </button>
                </form>
            </div>
        </>
    );
};

export default GenrateForm;

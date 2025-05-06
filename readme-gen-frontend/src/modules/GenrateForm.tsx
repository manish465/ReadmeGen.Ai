import { useState } from "react";
import InputList from "../components/InputList";

const GenrateForm = () => {
    const [repoData, setRepoData] = useState<string>("");
    const [filePathListData, setFilePathListData] = useState<string[]>([""]);
    const [infoTextListData, setInfoTextListData] = useState<string[]>([""]);

    return (
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
                        onChange={(event) => setRepoData(event.target.value)}
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
                <button type='submit' className='submit-btn'>
                    Genrate Readme.md
                </button>
            </form>
        </div>
    );
};

export default GenrateForm;

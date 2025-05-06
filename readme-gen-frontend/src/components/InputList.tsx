import { IInputListProps } from "../types/GenrateFormTypes";

const InputList = ({
    headerText,
    data,
    placeholderText,
    submitButtonText,
    setCurrentData,
}: IInputListProps) => {
    const handelAddData = (data: string[]) => {
        setCurrentData([...data, ""]);
    };

    const handelRemoveData = (data: string[], key: number) => {
        setCurrentData(data.filter((_, index) => index !== key));
    };

    const handelOnChangeData = (data: string[], key: number, value: string) => {
        setCurrentData(
            data.map((item, index) => (index === key ? value : item)),
        );
    };

    return (
        <>
            <hr />
            <div className='form-group'>
                <label>{headerText}</label>
                <div className='list-input-group'>
                    {data.map((value: string, key) => (
                        <div className='input-item'>
                            <input
                                key={key}
                                type='text'
                                value={value}
                                placeholder={placeholderText}
                                onChange={(event) =>
                                    handelOnChangeData(
                                        data,
                                        key,
                                        event.target.value,
                                    )
                                }
                            />
                            <button
                                type='button'
                                className='remove-btn'
                                onClick={() => handelRemoveData(data, key)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type='button'
                    className='add-btn'
                    onClick={() => handelAddData(data)}>
                    + {submitButtonText}
                </button>
            </div>
        </>
    );
};

export default InputList;

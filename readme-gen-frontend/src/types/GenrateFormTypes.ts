export interface IInputListProps {
    data: string[];
    headerText: string;
    placeholderText: string;
    submitButtonText: string;
    setCurrentData: (data: string[]) => void;
}

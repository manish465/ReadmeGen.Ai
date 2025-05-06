export interface NotificationState {
    show: boolean;
    message: string;
    type: "success" | "error";
}

export interface ModalState {
    isOpen: boolean;
    title: string;
    content: string;
}

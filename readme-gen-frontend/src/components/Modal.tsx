interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    downloadContent?: string;
    downloadFileName?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    downloadContent,
    downloadFileName = "download.md",
}) => {
    if (!isOpen) return null;

    const handleDownload = () => {
        if (downloadContent) {
            const blob = new Blob([downloadContent], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>{title}</h2>
                    <button onClick={onClose} className='modal-close-btn'>
                        &times;
                    </button>
                </div>
                <div className='modal-body'>{children}</div>
                {downloadContent && (
                    <div className='modal-footer'>
                        <button
                            onClick={handleDownload}
                            className='modal-download-btn'>
                            Download as MD
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

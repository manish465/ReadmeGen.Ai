import {
    render,
    fireEvent,
    screen,
    waitFor,
    act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import GenerateForm from "../../modules/GenrateForm";

class MockEventSource {
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: ((error: any) => void) | null = null;
    private _completeCallback: (() => void) | null = null;

    constructor(public url: string) {}

    addEventListener(event: string, callback: () => void) {
        if (event === "complete") {
            this._completeCallback = callback;
        }
    }

    close() {}

    _emitMessage(data: string) {
        if (this.onmessage) {
            this.onmessage({ data });
        }
    }

    _emitComplete() {
        if (this._completeCallback) {
            this._completeCallback();
        }
    }

    _emitError(error: any) {
        if (this.onerror) {
            this.onerror(error);
        }
    }
}

global.EventSource = MockEventSource as any;

let mockEventSource: MockEventSource;

describe("GenerateForm Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEventSource = new MockEventSource("");
    });

    it("renders form elements correctly", () => {
        render(<GenerateForm />);

        expect(screen.getByText("ReadMeGen.AI")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(
                /github.com\/username\/repository.git/i,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/File Paths that you can improve the context/i),
        ).toBeInTheDocument();
        expect(screen.getAllByText(/Info Text/i)[0]).toBeInTheDocument(); // Use getAllByText for multiple matches
    });

    it("handles form input changes", () => {
        render(<GenerateForm />);

        const repoInput = screen.getByPlaceholderText(
            /github.com\/username\/repository.git/i,
        );
        fireEvent.change(repoInput, {
            target: { value: "https://github.com/test/repo.git" },
        });

        expect(repoInput).toHaveValue("https://github.com/test/repo.git");
    });

    it("handles successful README generation", async () => {
        render(<GenerateForm />);

        // Fill form
        const repoInput = screen.getByPlaceholderText(
            /github.com\/username\/repository.git/i,
        );
        fireEvent.change(repoInput, {
            target: { value: "https://github.com/test/repo.git" },
        });

        // Mock EventSource before submitting
        const originalEventSource = global.EventSource;
        global.EventSource = jest.fn(() => mockEventSource) as any;

        // Submit form
        const submitButton = screen.getByText(/Generate Readme.md/i);
        fireEvent.click(submitButton);

        // Simulate streaming responses
        act(() => {
            mockEventSource._emitMessage("# Test Repo\n");
            mockEventSource._emitMessage("## Description\n");
            mockEventSource._emitMessage("This is a test repository");
            mockEventSource._emitComplete();
        });

        // Wait for success message
        await waitFor(() => {
            expect(
                screen.getByText(/README generated successfully!/i),
            ).toBeInTheDocument();
        });

        // Restore original EventSource
        global.EventSource = originalEventSource;
    });

    it("handles generation error", async () => {
        render(<GenerateForm />);

        // Mock EventSource before submitting
        const originalEventSource = global.EventSource;
        global.EventSource = jest.fn(() => mockEventSource) as any;

        // Submit form
        const submitButton = screen.getByText(/Generate Readme.md/i);
        fireEvent.click(submitButton);

        // Simulate error
        act(() => {
            mockEventSource._emitError(new Error("Connection failed"));
        });

        // Verify error notification
        await waitFor(() => {
            expect(
                screen.getByText(/Error generating README: Connection failed/i),
            ).toBeInTheDocument();
        });

        // Restore original EventSource
        global.EventSource = originalEventSource;
    });

    it("handles modal close", async () => {
        render(<GenerateForm />);

        // Mock EventSource before submitting
        const originalEventSource = global.EventSource;
        global.EventSource = jest.fn(() => mockEventSource) as any;

        // Submit form
        const submitButton = screen.getByText(/Generate Readme.md/i);
        fireEvent.click(submitButton);

        // Simulate content and completion
        act(() => {
            mockEventSource._emitMessage("# Test Content");
            mockEventSource._emitComplete();
        });

        // Wait for modal to appear and close it
        await waitFor(() => {
            const closeButton = screen.getByLabelText(/close/i);
            fireEvent.click(closeButton);
        });

        // Verify modal is closed
        await waitFor(() => {
            expect(
                screen.queryByText(/# Test Content/),
            ).not.toBeInTheDocument();
        });

        // Restore original EventSource
        global.EventSource = originalEventSource;
    });

    it("shows preview content while loading", async () => {
        render(<GenerateForm />);

        // Mock EventSource before submitting
        const originalEventSource = global.EventSource;
        global.EventSource = jest.fn(() => mockEventSource) as any;

        // Submit form
        const submitButton = screen.getByText(/Generate Readme.md/i);
        fireEvent.click(submitButton);

        // Emit multiple messages
        act(() => {
            mockEventSource._emitMessage("Line 1\n");
            mockEventSource._emitMessage("Line 2\n");
            mockEventSource._emitMessage("Line 3\n");
            mockEventSource._emitMessage("Line 4\n");
        });

        // Verify preview shows last 3 lines
        await waitFor(() => {
            const preview = screen.getByText(/Line 2.*Line 3.*Line 4/s);
            expect(preview).toBeInTheDocument();
        });

        // Restore original EventSource
        global.EventSource = originalEventSource;
    });
});

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InputList from "../../components/InputList";

describe("InputList component", () => {
    let data: string[];
    let setCurrentData: jest.Mock;

    beforeEach(() => {
        data = ["Item 1", "Item 2"];
        setCurrentData = jest.fn();
        render(
            <InputList
                headerText='Test Header'
                data={data}
                placeholderText='Enter item'
                submitButtonText='Add Item'
                setCurrentData={setCurrentData}
            />,
        );
    });

    it("renders header text", () => {
        expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("renders all inputs from data array", () => {
        const inputs = screen.getAllByPlaceholderText("Enter item");
        expect(inputs.length).toBe(data.length);
        expect(inputs[0]).toHaveValue("Item 1");
        expect(inputs[1]).toHaveValue("Item 2");
    });

    it("calls setCurrentData on input change", () => {
        const input = screen.getAllByPlaceholderText("Enter item")[0];
        fireEvent.change(input, { target: { value: "Updated Item 1" } });
        expect(setCurrentData).toHaveBeenCalledWith([
            "Updated Item 1",
            "Item 2",
        ]);
    });

    it("calls setCurrentData with one less item on remove", () => {
        const removeButtons = screen.getAllByText("Remove");
        fireEvent.click(removeButtons[0]);
        expect(setCurrentData).toHaveBeenCalledWith(["Item 2"]);
    });

    it("adds a new empty input on clicking add button", () => {
        const addButton = screen.getByText("+ Add Item");
        fireEvent.click(addButton);
        expect(setCurrentData).toHaveBeenCalledWith([...data, ""]);
    });
});

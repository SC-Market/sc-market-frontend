import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { AttributeFilterSection } from "../AttributeFilterSection"

// Mock i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

describe("AttributeFilterSection", () => {
  describe("select type", () => {
    it("renders single-select dropdown", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="select"
          allowedValues={["4", "5", "6"]}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Component Size filter")).toBeInTheDocument()
    })

    it("renders with selected value", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="select"
          allowedValues={["4", "5", "6"]}
          selectedValues={["4"]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Component Size filter")).toBeInTheDocument()
    })
  })

  describe("multiselect type with checkboxes", () => {
    it("renders checkboxes for few options", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="class"
          displayName="Component Class"
          attributeType="multiselect"
          allowedValues={["Military", "Stealth", "Industrial"]}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByText("Component Class")).toBeInTheDocument()
      expect(screen.getByLabelText("Military")).toBeInTheDocument()
      expect(screen.getByLabelText("Stealth")).toBeInTheDocument()
      expect(screen.getByLabelText("Industrial")).toBeInTheDocument()
    })

    it("handles checkbox selection", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="class"
          displayName="Component Class"
          attributeType="multiselect"
          allowedValues={["Military", "Stealth"]}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      const checkbox = screen.getByLabelText("Military")
      fireEvent.click(checkbox)

      expect(onChange).toHaveBeenCalledWith(["Military"])
    })

    it("handles checkbox deselection", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="class"
          displayName="Component Class"
          attributeType="multiselect"
          allowedValues={["Military", "Stealth"]}
          selectedValues={["Military"]}
          onChange={onChange}
        />,
      )

      const checkbox = screen.getByLabelText("Military")
      fireEvent.click(checkbox)

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe("multiselect type with autocomplete", () => {
    it("renders autocomplete for many options", () => {
      const onChange = jest.fn()
      const manyValues = Array.from({ length: 10 }, (_, i) => `Value ${i}`)
      
      render(
        <AttributeFilterSection
          attributeName="manufacturer"
          displayName="Manufacturer"
          attributeType="multiselect"
          allowedValues={manyValues}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByLabelText("Manufacturer filter")).toBeInTheDocument()
    })
  })

  describe("range type", () => {
    it("renders min and max inputs", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      expect(screen.getByText("Component Size")).toBeInTheDocument()
      expect(screen.getByLabelText("Component Size minimum")).toBeInTheDocument()
      expect(screen.getByLabelText("Component Size maximum")).toBeInTheDocument()
    })

    it("handles min value change", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={[]}
          onChange={onChange}
        />,
      )

      const minInput = screen.getByLabelText("Component Size minimum")
      fireEvent.change(minInput, { target: { value: "4" } })

      expect(onChange).toHaveBeenCalledWith(["4"])
    })

    it("handles max value change", () => {
      const onChange = jest.fn()
      render(
        <AttributeFilterSection
          attributeName="size"
          displayName="Component Size"
          attributeType="range"
          allowedValues={null}
          selectedValues={["4"]}
          onChange={onChange}
        />,
      )

      const maxInput = screen.getByLabelText("Component Size maximum")
      fireEvent.change(maxInput, { target: { value: "8" } })

      expect(onChange).toHaveBeenCalledWith(["4", "8"])
    })
  })
})

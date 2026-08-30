import { describe, it, expect } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import { Button } from "../Button"
import { Input } from "../Input"
import { Spinner } from "../Spinner"

describe("@ros/ui - Core Primitives", () => {
    it("renders Button component and handles text content", () => {
        render(<Button>Submit Order</Button>)
        const btn = screen.getByRole("button", { name: "Submit Order" })
        expect(btn).toBeDefined()
    })

    it("renders Input component with placeholder", () => {
        render(<Input placeholder="Enter store name" />)
        const input = screen.getByPlaceholderText("Enter store name")
        expect(input).toBeDefined()
    })

    it("renders Spinner component without crashing", () => {
        const { container } = render(<Spinner />)
        expect(container.firstChild).toBeDefined()
    })
})

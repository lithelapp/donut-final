import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import List from "../../src/pages/list/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Define the mock data for donuts
const mockDonuts = [
  { id: 1, name: "Pink heart", price: 1.99, imageName: "donut-1" },
  { id: 2, name: "The tiger", price: 1.79, imageName: "donut-2" },
  { id: 3, name: "Iced delight", price: 1.89, imageName: "donut-3" },
];

// Create MSW handlers
const handlers = [
  http.get("/donuts.json", () => {
    return HttpResponse.json(mockDonuts);
  }),
];

// Set up MSW server
const server = setupServer(...handlers);

// Create a wrapper for the component with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Setup MSW lifecycle hooks
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Common assertions
const assertLoadingState = () => {
  expect(screen.getByRole("progressbar")).toBeInTheDocument();
};

// Helper function for selecting donuts
const selectDonut = (chompButtons: HTMLElement[], index: number) => {
  fireEvent.click(chompButtons[index]);
};

// Helper function for checking total price (to handle the text split in DOM)
const assertTotalPrice = (expectedPrice: number) => {
  const priceContainer = screen.getByText(/Total Price: £/).parentElement;
  expect(priceContainer).toHaveTextContent(expectedPrice.toString());
};

describe("Donut List Component", () => {
  it("should render all donuts when API request is successful", async () => {
    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Check loading state
    assertLoadingState();

    // Wait for donuts to load
    const pinkHeartDonut = await screen.findByText("Pink heart");
    expect(pinkHeartDonut).toBeInTheDocument();

    // Verify all donuts are rendered
    expect(screen.getByText("The tiger")).toBeInTheDocument();
    expect(screen.getByText("Iced delight")).toBeInTheDocument();

    // Verify prices are rendered correctly
    expect(screen.getByText("£1.99")).toBeInTheDocument();
    expect(screen.getByText("£1.79")).toBeInTheDocument();
    expect(screen.getByText("£1.89")).toBeInTheDocument();
    const donutImages = screen.getAllByRole("img");
    expect(donutImages).toHaveLength(3);    // Verify all image sources exist (without depending on specific order)
    const imageSources = donutImages.map((img) => img.getAttribute("src"));
    expect(imageSources).toContain("/images/donut-1.svg");
    expect(imageSources).toContain("/images/donut-2.svg");
    expect(imageSources).toContain("/images/donut-3.svg");
    
    // Verify "Chomp-a-donut" buttons exist
    const chompButtons = screen.getAllByRole("button", {
      name: /chomp-a-donut/i,
    });
    expect(chompButtons).toHaveLength(3);

    // Verify total price starts at zero
    assertTotalPrice(0.0);
    
    // Verify reset button is disabled when no donuts are selected
    const resetButton = screen.getByRole("button", { name: /reset/i });
    expect(resetButton).toBeDisabled();
  });

  it("should display a message when no donuts are available", async () => {
    // Override the default handler to return an empty array
    server.use(
      http.get("/donuts.json", () => {
        return HttpResponse.json([]);
      })
    );

    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Check loading state
    assertLoadingState();

    // Wait for the empty state message to appear
    const emptyMessage = await screen.findByText(
      "No donuts available at the moment. Please check back later!"
    );
    expect(emptyMessage).toBeInTheDocument(); // Verify that the "Reset" button still exists

    // Verify total price is zero
    assertTotalPrice(0.0);

    // Verify that no donut images or "Chomp-a-donut" buttons are rendered
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /chomp-a-donut/i })
    ).not.toBeInTheDocument();
  });

  it("should display an error message when API request fails", async () => {
    // Override the default handler to simulate a server error
    server.use(
      http.get("/donuts.json", () => {
        return new Response(null, { status: 500 });
      })
    );

    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Check loading state
    assertLoadingState();

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/Failed to load donuts/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-red-500");

    // Verify that we don't see any donut-related UI elements
    expect(
      screen.queryByRole("button", { name: /reset/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Total Price:")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /chomp-a-donut/i })
    ).not.toBeInTheDocument();
  });
  
  it("should update total price and enable reset button when donuts are selected", async () => {
    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Check loading state
    assertLoadingState();

    // Wait for donuts to load
    await screen.findByText("Pink heart");

    // Verify initial total price is zero
    expect(screen.getByText("Total Price: £0.00")).toBeInTheDocument();

    // Get all "Chomp-a-donut" buttons
    const chompButtons = screen.getAllByRole("button", {
      name: /chomp-a-donut/i,
    });

    selectDonut(chompButtons, 0);
    
    // Verify reset button is enabled after selecting a donut
    const resetButton = screen.getByRole("button", { name: /reset/i });
    expect(resetButton).toBeEnabled();    // Select the second donut (The tiger - £1.79)
    selectDonut(chompButtons, 1);

    // Select the third donut (Iced delight - £1.89)
    selectDonut(chompButtons, 2);
    assertTotalPrice(5.67);
  });

  it("should reset total price when reset button is clicked", async () => {
    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Wait for donuts to load
    await screen.findByText("Pink heart");

    // Get all "Chomp-a-donut" buttons
    const chompButtons = screen.getAllByRole("button", {
      name: /chomp-a-donut/i,
    });
    // Select a donut to increase the total price
    selectDonut(chompButtons, 0);
    const priceContainer = screen.getByText(/Total Price: £/).parentElement;
    expect(priceContainer).not.toHaveTextContent("0");

    // Click Reset button to clear the total
    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);
    assertTotalPrice(0.0);
  });

  it("should show special message when all donuts are selected", async () => {
    // Setup the test with React Query wrapper
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <List />
      </Wrapper>
    );

    // Wait for donuts to load
    await screen.findByText("Pink heart");

    // Initially, the congratulatory message should not be present
    expect(
      screen.queryByText(/Congratulations! You chomped all the donuts/i)
    ).not.toBeInTheDocument();

    // Get all "Chomp-a-donut" buttons
    const chompButtons = screen.getAllByRole("button", {
      name: /chomp-a-donut/i,
    });

    // Select all donuts one by one
    for (let i = 0; i < mockDonuts.length; i++) {
      selectDonut(chompButtons, i);
    }

    // Verify the congratulatory message appears
    expect(
      screen.getByText(/Congratulations! You chomped all the donuts/i)
    ).toBeInTheDocument();

    // Verify all buttons are disabled
    const disabledButtons = screen.getAllByRole("button", {
      name: /chomp-a-donut/i,
    });

    disabledButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    // Click Reset button to clear the selection
    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    // Verify congratulatory message disappears
    expect(
      screen.queryByText(/Congratulations! You chomped all the donuts/i)
    ).not.toBeInTheDocument();
  });
});

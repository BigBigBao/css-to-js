import React from "react";
import { render, wait, fireEvent } from "@testing-library/react";
import mockedTransformers from "../transformers";
import Home from "../home";

// The transform functions are already unit tested, so replace them with stubs
jest.mock("../transformers", () => {
  // TODO: use Transformer type (or will Jest KNOWWW that it should be same TYPE??? :O)
  // mabye `typeof realTransformers`??
  return {
    css2js: {
      id: 0,
      name: "CSS => JS object",
      transform: jest.fn(x => x.toUpperCase()),
      from: "css",
      to: "js"
    },
    js2css: {
      id: 1,
      name: "JS object => CSS",
      transform: jest.fn(x => x),
      from: "js",
      to: "css"
    }
  };
});

// This should be the same as the default transformer state in home.js
const defaultTransformer = mockedTransformers.css2js;

describe("<Home />", () => {
  test("renders without exploding", () => {
    render(<Home />);
  });

  test("has an element that lets the user enter text", () => {
    const { getByRole } = render(<Home />);
    expect(getByRole("textbox")).toBeInTheDocument();
  });

  test("displays some output on load", async () => {
    const { getByTitle } = render(<Home />);
    const outputBox = getByTitle("output");

    await wait(() => expect(outputBox.textContent).not.toBe(""));
  });

  test("transforms the input when it is changed", async () => {
    const { getByRole, getByTitle, findByText } = render(<Home />);
    const inputBox = getByRole("textbox");
    const outputBox = getByTitle("output");
    const testInput = "my test input";
    const expectedOutput = defaultTransformer.transform(testInput);

    fireEvent.change(inputBox, { target: { value: testInput } });

    expect(await findByText(testInput)).toBeInTheDocument();
    await wait(() => expect(outputBox.textContent).toBe(expectedOutput));
  });

  // TODO: can we somehow abstract away from the "default transformer"?
  // Maybe just use the "first" transformer as default? Though that's less explicit
  // and makes it harder to understand how the default transformer is set.
});

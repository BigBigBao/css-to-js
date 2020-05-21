import * as babelParser from "@babel/parser";
import { Expression, Node, ObjectExpression } from "@babel/types";
import { ChildNode, Declaration, parse, Root } from "postcss";

export function parseJsObject(input: string): [ObjectExpression, string] {
  let expression: Expression;
  let rawLines: string;
  try {
    rawLines = input;
    expression = babelParser.parseExpression(input);
  } catch {
    // Try parsing again, but wrap the input in curly braces
    // This is to support passing input without curly braces
    rawLines = `{${input}}`;
    expression = babelParser.parseExpression(rawLines);
  }

  if (expression.type !== "ObjectExpression") {
    throw new Error("Expression is not an object expression");
  }

  return [expression, rawLines];
}

/**
 * Gets the string representation of an AST node, given the input code.
 * @param node AST node
 * @param code input code that AST was generated from
 */
export function nodeToString(node: Node, code: string) {
  const { start, end } = node;
  if (start === null || end === null) {
    // I'm not sure when this would happen, but it probably means
    // we can't convert this node to string
    throw new Error(
      `Can't convert node to string: ${JSON.stringify(node, null, 2)}`
    );
  }

  // Copy the string value directly from the input code
  return code.slice(start, end).trim();
}

/**
 * Finds all css delcarations
 * @param root PostCss AST Root
 */
function getCssProps(root: Root): Declaration[] {
  const { nodes } = root;

  if (!nodes) {
    return [];
  }

  function iterate(nodes: ChildNode[], declarations: Declaration[] = []) {
    nodes.forEach((item) => {
      if (item.type === "decl") {
        declarations.push(item);
      } else if (item.type === "rule" && item?.nodes) {
        iterate(item.nodes, declarations);
      }
    });

    return declarations;
  }

  return iterate(nodes);
}
/**
 * Parses css into PostCss AST and returns array of declarations
 * @param css css string
 */
export function parseCss(css: string): Declaration[] {
  try {
    const root: Root = parse(css);
    return getCssProps(root);
  } catch (e) {
    throw new Error("Could not parse CSS");
  }
}
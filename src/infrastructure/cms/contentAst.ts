import ts from "typescript";
import type { ContentPointer } from "../../domain/cms/entities/ContentPointer";
import { describePointer } from "../../domain/cms/entities/ContentPointer";

/**
 * AST TO FIND, TEXT TO REPLACE.
 *
 * The content files carry more comment than code — the reasoning behind a cut paragraph,
 * why a link is absent, which sentence is the client's and which is drafted, and the
 * `TODO(client)` markers the client reviews against. Losing that would be worse than
 * having no CMS at all, which rules out the obvious approach: parsing with the TypeScript
 * compiler, transforming the tree and printing it back. `ts.createPrinter` reconstructs a
 * file from nodes; comments attached loosely (a `//` line above a property, a block above
 * a function) move or vanish, and formatting is re-derived rather than preserved.
 *
 * So the AST is used only to LOCATE — it gives the exact character span of one string
 * literal — and the edit is a splice of that span in the original text. Every other byte
 * of the file, comment and blank line included, is carried through untouched. The result
 * is then run through the repo's own Prettier so a longer string re-wraps the way a human
 * edit would, and Prettier preserves comments by design.
 *
 * A regex over the file would have been simpler and is what this replaces: the same
 * sentence appears in several files, `createCta("Talk to us", "/contact")` appears eleven
 * times, and an approved string is deliberately reused rather than retyped. There is no
 * pattern that reliably picks out one of them. A path through the tree picks exactly one.
 */

/** `foo`, `"foo"` and `0` as property keys all read back as their text. */
function propertyNameText(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
}

/** Sees through `as const`, `satisfies X` and redundant parentheses. */
function unwrap(node: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    return unwrap(node.expression);
  }
  return node;
}

/**
 * What a pointer starts from: a top-level `const` (exported or not — both are
 * addressable), or a top-level function, in which case it is the expression that function
 * returns.
 *
 * The function case is not a generality, it is two specific places. `toCustomDetail` in
 * ways-to-work.content.ts holds the whole Custom Creative Partnership — its paragraph, its
 * "what this covers" list and its image alt — inside a function body rather than in a
 * constant, and `toDetail` in creative-services.content.ts holds the one CTA every
 * capability shares. Without this, that content would have had to be reported unwritable
 * for a reason that is an implementation detail of where it was declared.
 */
function findBinding(source: ts.SourceFile, symbol: string): ts.Expression | undefined {
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === symbol &&
          declaration.initializer
        ) {
          return declaration.initializer;
        }
      }
    }
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === symbol && statement.body) {
      const returned = statement.body.statements.find(ts.isReturnStatement);
      if (returned?.expression) {
        return returned.expression;
      }
    }
  }
  return undefined;
}

/**
 * One step down the path. A number addresses an array element OR a call argument, which
 * is what lets `createCta("Talk to us", "/contact")` and
 * `MediaRef.create({ ... })` be walked into with the same notation.
 */
function step(node: ts.Expression, segment: string | number): ts.Expression | undefined {
  const target = unwrap(node);

  if (typeof segment === "number") {
    if (ts.isArrayLiteralExpression(target)) {
      return target.elements[segment];
    }
    if (ts.isCallExpression(target) || ts.isNewExpression(target)) {
      return target.arguments?.[segment];
    }
    return undefined;
  }

  if (ts.isObjectLiteralExpression(target)) {
    for (const property of target.properties) {
      if (ts.isPropertyAssignment(property) && propertyNameText(property.name) === segment) {
        return property.initializer;
      }
    }
  }
  return undefined;
}

export class ContentPathError extends Error {
  constructor(pointer: ContentPointer, detail: string) {
    super(`${describePointer(pointer)}: ${detail}`);
    this.name = "ContentPathError";
  }
}

export interface LocatedLiteral {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

export function parseContent(fileName: string, text: string): ts.SourceFile {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/**
 * The span of the string literal a pointer addresses, or a thrown error naming exactly
 * where the walk stopped. A path that lands on anything other than a literal — a
 * `.map()` call, an imported binding, a template with substitutions — is reported as
 * such, because that value is genuinely not editable in this file and the UI has to be
 * able to say so rather than write something wrong.
 */
export function locateLiteral(source: ts.SourceFile, pointer: ContentPointer): LocatedLiteral {
  const binding = findBinding(source, pointer.symbol);
  if (!binding) {
    throw new ContentPathError(pointer, `no top-level binding named "${pointer.symbol}".`);
  }

  const node = pointer.path.reduce<ts.Expression | undefined>(
    (current, segment) => (current ? step(current, segment) : undefined),
    binding,
  );

  if (!node) {
    throw new ContentPathError(pointer, "the path does not resolve to a node.");
  }

  const literal = unwrap(node);
  if (!ts.isStringLiteral(literal) && !ts.isNoSubstitutionTemplateLiteral(literal)) {
    throw new ContentPathError(
      pointer,
      "the value is not a string literal — it is computed, imported or interpolated, so it cannot be written here.",
    );
  }

  return { start: literal.getStart(source), end: literal.getEnd(), text: literal.text };
}

/**
 * A TypeScript string literal for `value`, quoted the way Prettier would quote it: double
 * quotes unless the string contains more of them than single quotes. Matching Prettier
 * here is not cosmetic — the file is formatted immediately afterwards, and a literal it
 * would rewrite produces a diff larger than the edit.
 */
export function toStringLiteral(value: string): string {
  const doubles = (value.match(/"/g) ?? []).length;
  const singles = (value.match(/'/g) ?? []).length;
  const quote = doubles > singles ? "'" : '"';

  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(quote, "g"), `\\${quote}`)
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");

  return `${quote}${escaped}${quote}`;
}

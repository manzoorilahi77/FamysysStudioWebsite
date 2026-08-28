import { InvalidHexColorError } from "../errors/ValueObjectErrors";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export class HexColor {
  private constructor(readonly value: string) {}

  static create(value: string): HexColor {
    if (!HEX_COLOR_PATTERN.test(value)) {
      throw new InvalidHexColorError(value);
    }
    return new HexColor(value.toUpperCase());
  }

  equals(other: HexColor): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

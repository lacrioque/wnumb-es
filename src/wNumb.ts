// Types
/**
 * Types exported from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/wnumb/index.d.ts
 */
interface WNumbOptions {
  /** The number of decimals to include in the result. Limited to 7. */
  decimals: number;
  /**
   * The decimal separator.
   * Defaults to '.' if thousand isn't already set to '.'.
   */
  mark: string;
  /**
   * Separator for large numbers. For example: ' ' would result in a formatted number of 1 000 000.
   */
  thousand: string;
  /**
   * A string to prepend to the number. Use cases include prefixing with money symbols such as '$' or '€'.
   */
  prefix: string;
  /**
   * A number to append to a number. For example: ',-'.
   */
  suffix: string;
  /**
   * The prefix for negative values. Defaults to '-' if negativeBefore isn't set.
   */
  negative: string;
  /**
   * The prefix for a negative number. Inserted before prefix.
   */
  negativeBefore: string;
  /**
   * This is a powerful option to manually modify the slider output.
   * For example, to show a number in another currency:
   * function( value ){
   *  return value * 1.32;
   * }
   */
  encoder: (value: number) => number;
  /**
   * Reverse the operations set in encoder.
   * Use this option to undo modifications made while encoding the value.
   * function( value ){
   *   return value / 1.32;
   * }
   */
  decoder: (value: number) => number;
  /**
   * Similar to encoder, but applied after all other formatting options are applied.
   */
  edit: (value: string, originalInput: number) => string;
  /**
   * Similar to decoder and the reverse for edit.
   * Applied before all other formatting options are applied.
   */
  undo: (value: string) => string;
}

// General

// Reverse a string
export function strReverse(a: string): string {
  return a
    .split("")
    .reverse()
    .join("");
}

// Check if a string starts with a specified prefix.
export function strStartsWith(input: string, match: string): boolean {
  return input.substring(0, match.length) === match;
}

// Check is a string ends in a specified suffix.
export function strEndsWith(input: string, match: string): boolean {
  return input.slice(-1 * match.length) === match;
}

// Throw an error if formatting options are incompatible.
export function throwEqualError(
  F: WNumbOptions,
  a: keyof WNumbOptions,
  b: keyof WNumbOptions,
  message?: string
) {
  if ((F[a] || F[b]) && F[a] === F[b]) {
    throw new Error(`Error: ${message || ""}${a}`);
  }
}

// Check if a number is finite and not NaN
export function isValidNumber(input: unknown): boolean {
  return typeof input === "number" && isFinite(input);
}

// Provide rounding-accurate toFixed method.
// Borrowed: http://stackoverflow.com/a/21323330/775265
export function toFixed(value: number, exp: number): string {
  const split = value.toString().split("e");
  const rounded = Math.round(
    +(split[0] + "e" + (split[1] ? +split[1] + exp : exp))
  );
  const roundedSplit = rounded.toString().split("e");
  return (+(
    roundedSplit[0] +
    "e" +
    (roundedSplit[1] ? +roundedSplit[1] - exp : -exp)
  )).toFixed(exp);
}

export class wNumb {
  private _options: WNumbOptions;

  constructor(options: Partial<WNumbOptions>) {
    this._options = options = this.validate(options);
  }

  // Formatting
  // Accept a number as input, output formatted string.
  private formatTo(
    input: number,
    options: WNumbOptions
  ): string | undefined {
    let originalInput = input,
      inputIsNegative,
      inputPieces,
      inputBase: string,
      inputDecimals = "",
      output: string = "";

    // Apply user encoder to the input.
    // Expected outcome: number.
    input = options.encoder(input);

    // Stop if no valid number was provided, the number is infinite or NaN.
    if (!isValidNumber(input)) {
      return undefined;
    }

    // Rounding away decimals might cause a value of -0
    // when using very small ranges. Remove those cases.
    if (parseFloat(input.toFixed(options.decimals)) === 0) {
      input = 0;
    }

    // Formatting is done on absolute numbers,
    // decorated by an optional negative symbol.
    if (input < 0) {
      inputIsNegative = true;
      input = Math.abs(input);
    }

    let inputAsString;

    // Reduce the number of decimals to the specified option.
    inputAsString = toFixed(input, options.decimals);

    // Transform the number into a string, so it can be split.
    inputAsString = input.toString();

    inputBase = input + "";
    // Break the number on the decimal separator.
    if (inputAsString.indexOf(".") !== -1) {
      inputPieces = inputAsString.split(".");
      inputBase = inputPieces[0];
      inputDecimals = options.mark + inputPieces[1];
    }

    // Group numbers in sets of three.
    if (options.thousand) {
      const inputBaseThousandSplit = strReverse(inputBase).match(/.{1,3}/g) || [
        inputBase
      ];
      inputBase = strReverse(
        inputBaseThousandSplit.join(strReverse(options.thousand))
      );
    }

    // If the number is negative, prefix with negation symbol.
    if (inputIsNegative && options.negativeBefore) {
      output += options.negativeBefore;
    }

    // Prefix the number
    if (options.prefix) {
      output += options.prefix;
    }

    // Normal negative option comes after the prefix. Defaults to '-'.
    if (inputIsNegative && options.negative) {
      output += options.negative;
    }

    // Append the actual number.
    output += inputBase;
    output += inputDecimals;

    // Apply the suffix.
    if (options.suffix) {
      output += options.suffix;
    }

    // Run the output through a user-specified post-formatter.
    output = options.edit(output, originalInput) + "";

    // All done.
    return output;
  }

  // Accept a sting as input, output decoded number.
  private formatFrom(
    input: string,
    options: WNumbOptions
  ): number | undefined {
    let originalInput = input,
      inputIsNegative,
      stringOutput = "",
      output: number = 0;

    // User defined pre-decoder. Result must be a non empty string.
    input = options.undo(input);

    // Test the input. Can't be empty.
    if (!input || typeof input !== "string") {
      return undefined;
    }

    // If the string starts with the negativeBefore value: remove it.
    // Remember is was there, the number is negative.
    if (
      options.negativeBefore &&
      strStartsWith(input, options.negativeBefore)
    ) {
      input = input.replace(options.negativeBefore, "");
      inputIsNegative = true;
    }

    // Repeat the same procedure for the prefix.
    if (options.prefix && strStartsWith(input, options.prefix)) {
      input = input.replace(options.prefix, "");
    }

    // And again for negative.
    if (options.negative && strStartsWith(input, options.negative)) {
      input = input.replace(options.negative, "");
      inputIsNegative = true;
    }

    // Remove the suffix.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
    if (options.suffix && strEndsWith(input, options.suffix)) {
      input = input.slice(0, -1 * options.suffix.length);
    }

    // Remove the thousand grouping.
    if (options.thousand) {
      input = input.split(options.thousand).join("");
    }

    // Set the decimal separator back to period.
    if (options.mark) {
      input = input.replace(options.mark, ".");
    }

    // Prepend the negative symbol.
    if (inputIsNegative) {
      stringOutput += "-";
    }

    // Add the number
    stringOutput += input;

    // Trim all non-numeric characters (allow '.' and '-');
    stringOutput = stringOutput.replace(/[^0-9\.\-.]/g, "");

    // The value contains no parse-able number.
    if (stringOutput === "") {
      return undefined;
    }

    // Covert to number.
    output = Number(stringOutput);

    // Run the user-specified post-decoder.
    output = options.decoder(output);

    // Check is the output is valid, otherwise: return false.
    if (!isValidNumber(output)) {
      return undefined;
    }

    return output;
  }

  // Framework

  // Parse cleanOptions from Input
  private defaultDecimals(decimals: number): number {
    if (decimals < 0 || decimals > 8) {
      throw new Error("decimal option needs to be between 0 and 8");
    }
    return decimals;
  }

  // Validate formatting options
  public validate(
    inputOptions: Partial<WNumbOptions>
  ): WNumbOptions {
    const cleanOptions: WNumbOptions = {
      decimals: this.defaultDecimals(inputOptions.decimals || 0),
      mark: inputOptions.mark || ".",
      thousand: inputOptions.thousand || "",
      prefix: inputOptions.prefix || "",
      suffix: inputOptions.suffix || "",
      negative: inputOptions.negativeBefore || "-",
      negativeBefore: inputOptions.negativeBefore || "",
      encoder: inputOptions.encoder || ((v) => v),
      decoder: inputOptions.decoder || ((v) => v),
      edit: inputOptions.edit || ((v, o) => v),
      undo: inputOptions.undo || ((v) => v)
    };

    throwEqualError(
      cleanOptions,
      "mark",
      "thousand",
      "Options 'mark' cannot be the same as option 'thousand' "
    );
    throwEqualError(
      cleanOptions,
      "prefix",
      "negative",
      "Options 'prefix' cannot be the same as option 'negative' "
    );
    throwEqualError(
      cleanOptions,
      "prefix",
      "negativeBefore",
      "Options 'prefix' cannot be the same as option 'negativeBefore' "
    );

    return cleanOptions;
  }

  public get options(): WNumbOptions {
    return { ...this._options };
  }

  public set options(nOpt: Partial<WNumbOptions>) {
    this._options = this.validate(nOpt);
  }

  public to(input: number) {
    return this.formatTo(input, this._options);
  }

  public from(input: string) {
    return this.formatFrom(input, this._options);
  }
}

export default (options: Partial<WNumbOptions>) => new wNumb(options);

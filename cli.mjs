#! /usr/bin/env node
import { Command, Option } from "commander/esm.mjs";
import { norwegianblue, ERROR_404_TEXT } from "./norwegianblue.mjs";

const program = new Command();

let myProduct;

program
  .description(
    `CLI to show end-of-life dates for a number of products, from https://endoflife.date

For example:

* \`eol python\` to see Python EOLs
* \`eol ubuntu\` to see Ubuntu EOLs
* \`eol all\` to list all available products

Something missing? Please contribute! https://endoflife.date/contribute`
  )
  .argument(
    "[product]",
    'Product to check, or "all" to list all available',
    "all"
  )
  .action((product) => {
    myProduct = product;
  })
  .addOption(
    new Option("-f, --format <format>", "The format of output")
      // .choices(["html", "json", "markdown", "rst", "tsv"])
      .choices(["json", "markdown"])
      .default("markdown")
  )
  .addOption(
    new Option("-c, --color <enabled>", "Color terminal output", "auto")
      .choices(["yes", "no", "auto"])
      .default("auto")
  )
  // .option("--clear-cache", "Clear cache before running")
  .option("-v, --verbose", "Print debug messages to stderr")
  .version(`norwegianblue 0.0.1 (node ${process.version})`);
program.parse();
const args = program.opts();

const output = await norwegianblue(
  myProduct,
  args.format,
  args.color,
  args.verbose
  // clear_cache=args.clear_cache,
);
if (output === ERROR_404_TEXT) {
  console.error(output);
  process.exit(1);
}
console.log(output);

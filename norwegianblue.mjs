import { markdownTable } from "markdown-table";
import chalk from "chalk";
import envPaths from "env-paths";
import fetch from "node-fetch";
import fs from "fs";
import stringWidth from "string-width";

const CACHE_DIR = envPaths("norwegianblue", { suffix: "" }).cache;
const USER_AGENT = "nodewegianblue/0.0.1";
export const ERROR_404_TEXT = "Product not found, run 'eol all' for list";

const printVerbose = (verbose, str) => {
  if (verbose) {
    console.log(str);
  }
};

const cacheFilename = (url) => {
  // yyyy-mm-dd-url-slug.json
  const slug = url.replace(/[:/.]/g, "-").replace(/-{2,}/g, "-");

  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);
  today = today.toISOString().split("T")[0];

  return `${CACHE_DIR}/${today}-${slug}.json`;
};

const loadCache = (cache_file) => {
  if (!fs.existsSync(cache_file)) {
    return {};
  }

  const data = JSON.parse(fs.readFileSync(cache_file));
  return data;
};

const saveCache = (cache_file, data) => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(cache_file, JSON.stringify(data));
};

function isEmpty(object) {
  return Object.keys(object).length === 0;
}

// TODO
// def _clear_cache_now():
//     """Delete all cache files now"""
//     cache_files = CACHE_DIR.glob("**/*.json")
//     for cache_file in cache_files:
//         cache_file.unlink()
//
// def _clear_cache():
//     """Delete old cache files, run as last task"""
//     cache_files = CACHE_DIR.glob("**/*.json")
//     today = dt.datetime.utcnow().strftime("%Y-%m-%d")
//     for cache_file in cache_files:
//         if not cache_file.name.startswith(today):
//             cache_file.unlink()
//
// atexit.register(_clear_cache)

export const norwegianblue = async (
  product = "all",
  format = "markdown",
  color = "yes",
  verbose = false
  // clear_cache: bool = False,
) => {
  // Call the API and return result
  const url = `https://endoflife.date/api/${product.toLowerCase()}.json`;

  // TODO if clear_cache:
  // TODO      _clear_cache_now()

  const myCacheFilename = cacheFilename(url);
  printVerbose(
    verbose,
    `Human URL:\thttps://endoflife.date/${product.toLowerCase()}`
  );
  printVerbose(verbose, `API URL:\t${url}`);
  printVerbose(verbose, `Cache file:\t${myCacheFilename}`);

  let data = {};
  if (fs.existsSync(myCacheFilename)) {
    printVerbose(verbose, "Cache file exists");
    data = loadCache(myCacheFilename);
  }
  if (isEmpty(data)) {
    // No cache, or couldn't load cache
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    printVerbose(verbose, `HTTP status code: ${response.status}`);

    if (response.status === 404) {
      return ERROR_404_TEXT;
    }
    data = await response.json();

    saveCache(myCacheFilename, data);
  }

  if (format == "json") {
    return JSON.stringify(data);
  }

  if (product == "all") {
    return data.join("\n");
  }

  data = ltsify(data);
  if (color != "no" && format != "html" /* TODO && canDoColour()*/) {
    data = colourify(data);
  }

  let output = tabulate(data);
  // TODO other formats
  return markdownTable(output, { stringLength: stringWidth });
};

const ltsify = (data) => {
  //If a cycle is LTS, append LTS to the cycle version and remove the LTS column
  for (let cycle of data) {
    if ("lts" in cycle) {
      if (cycle.lts) {
        cycle.cycle = `${cycle.cycle} LTS`;
      }
      delete cycle.lts;
    }
  }
  return data;
};

const colourify = (data) => {
  // Add colour to dates:
  // red: in the past
  // yellow: will pass in six months
  // green: will pass after six months

  const now = new Date();
  let sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(now.getMonth() + 6);

  for (let cycle of data) {
    for (let property of ["support", "eol", "discontinued"]) {
      if (!(property in cycle)) {
        continue;
      }

      // Handle Boolean
      let colour;
      if (typeof cycle[property] == "boolean") {
        if (property === "support") {
          colour = cycle["support"] ? "green" : "red";
        } else {
          // "eol" and "discontinued"
          colour = cycle[property] ? "red" : "green";
        }
        cycle[property] = chalk.keyword(colour)(cycle[property]);
      }

      // Handle date
      const dateStr = cycle[property];
      // Convert "2020-01-01" string to date
      const date = new Date(dateStr);
      if (date < now) {
        cycle[property] = chalk.red(dateStr);
      } else if (date < sixMonthsFromNow) {
        cycle[property] = chalk.yellow(dateStr);
      } else if (dateStr) {
        cycle[property] = chalk.green(dateStr);
      }
    }
  }
  return data;
};

const tabulate = (data) => {
  const preferred_headers = [
    "cycle",
    "latest",
    "release",
    "support",
    "discontinued",
    "eol",
  ];
  // Skip some headers, only used internally at https://endoflife.date
  const skipped_headers = ["cycleShortHand", "latestShortHand"];

  let headers = data.map(Object.keys)[0];
  let new_headers = [];

  // Put headers in preferred order
  for (let preferred of preferred_headers) {
    if (headers.includes(preferred)) {
      new_headers.push(preferred);
    }
  }

  // With the rest at the end
  for (let header of headers) {
    if (!new_headers.includes(header) && !skipped_headers.includes(header)) {
      new_headers.push(header);
    }
  }
  headers = new_headers;

  let rows = [];
  for (let cycle of data) {
    let row = [];
    for (let header of headers) {
      row.push(cycle[header]);
    }
    rows.push(row);
  }

  data = [headers].concat(rows);
  return data;
};

# norwegianblue

[![GitHub](https://img.shields.io/github/license/hugovk/nodewegianblue.svg)](LICENSE.txt)
[![Code style: Prettier](https://img.shields.io/badge/code_style-Prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

CLI for [endoflife.date](https://endoflife.date/docs/api/) to show end-of-life dates
for a number of products.

Node.js version of [norwegianblue](https://github.com/hugovk/norwegianblue) for Python.

## Installation

### From PyPI

```bash
npm install norwegianblue --global
```

### From source

```bash
git clone https://github.com/hugovk/nodewegianblue
cd nodewegianblue
npm install --global
```

## Example command-line use

Run `eol`, `norwegianblue`, `nodewegianblue` or `nodeol`, they do the same thing.

Top-level help:

```console
$ eol --help
Usage: eol [options] [product]

CLI to show end-of-life dates for a number of products, from https://endoflife.date

For example:

* `eol python` to see Python EOLs
* `eol ubuntu` to see Ubuntu EOLs
* `eol all` to list all available products

Something missing? Please contribute! https://endoflife.date/contribute

Arguments:
  product                Product to check, or "all" to list all available (default: "all")

Options:
  -f, --format <format>  The format of output (choices: "json", "markdown", default: "markdown")
  -c, --color <enabled>  Color terminal output (choices: "yes", "no", "auto", default: "auto")
  -v, --verbose          Print debug messages to stderr
  -V, --version          output the version number
  -h, --help             display help for command
```

List all available products with end-of-life dates:

```console
$ # eol all
$ # or:
$ eol
alpine
amazon-linux
android
bootstrap
centos
...
```

Show end-of-life dates:

```console
$ norwegianblue node
| cycle  | latest  | release    | support    | eol        |
| ------ | ------- | ---------- | ---------- | ---------- |
| 17     | 17.1.0  | 2021-10-19 | 2022-04-01 | 2022-06-01 |
| 16 LTS | 16.13.0 | 2021-04-20 | 2022-10-18 | 2024-04-30 |
| 15     | 15.14.0 | 2020-10-20 | 2021-04-01 | 2021-06-01 |
| 14 LTS | 14.18.1 | 2020-04-21 | 2021-10-19 | 2023-04-30 |
| 12 LTS | 12.22.7 | 2019-04-23 | 2020-10-20 | 2022-04-30 |
| 10 LTS | 10.24.1 | 2018-04-24 | 2020-05-19 | 2021-04-30 |
```

The table is Markdown, ready for pasting in GitHub issues and PRs:

| cycle  | latest  | release    | support    | eol        |
| ------ | ------- | ---------- | ---------- | ---------- |
| 17     | 17.1.0  | 2021-10-19 | 2022-04-01 | 2022-06-01 |
| 16 LTS | 16.13.0 | 2021-04-20 | 2022-10-18 | 2024-04-30 |
| 15     | 15.14.0 | 2020-10-20 | 2021-04-01 | 2021-06-01 |
| 14 LTS | 14.18.1 | 2020-04-21 | 2021-10-19 | 2023-04-30 |
| 12 LTS | 12.22.7 | 2019-04-23 | 2020-10-20 | 2022-04-30 |
| 10 LTS | 10.24.1 | 2018-04-24 | 2020-05-19 | 2021-04-30 |

With options:

```console
$ eol ubuntu --format json | jq
[
  {
    "cycle": "21.10 'Impish Indri'",
    "cycleShortHand": "ImpishIndri",
    "lts": false,
    "release": "2021-10-14",
    "support": "2022-07-31",
    "eol": "2022-07-31",
    "latest": "21.10",
    "link": "https://wiki.ubuntu.com/ImpishIndri/ReleaseNotes/"
  },
...
```

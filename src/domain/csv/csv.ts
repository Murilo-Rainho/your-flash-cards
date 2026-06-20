/**
 * Generic CSV codec (RFC 4180-style). Pure TS (rule 01): no React/Expo/infra.
 *
 * `serializeCsv` quotes any field containing the delimiter, a quote, or a line break and
 * doubles embedded quotes. `parseCsv` reverses that, tolerating `\n`, `\r\n` and lone `\r`.
 */

const FIELD_DELIMITER = ',';
const RECORD_DELIMITER = '\n';
const QUOTE = '"';

function needsQuoting(value: string): boolean {
  return (
    value.includes(FIELD_DELIMITER) ||
    value.includes(QUOTE) ||
    value.includes('\n') ||
    value.includes('\r')
  );
}

export function escapeCsvField(value: string): string {
  if (!needsQuoting(value)) {
    return value;
  }

  return `${QUOTE}${value.replace(/"/g, '""')}${QUOTE}`;
}

export function serializeCsv(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map(escapeCsvField).join(FIELD_DELIMITER)).join(RECORD_DELIMITER);
}

/**
 * Parses CSV content into rows of string cells. Fully blank lines are dropped so a trailing
 * newline does not yield a spurious record.
 */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let field = '';
  let inQuotes = false;
  let index = 0;

  const pushField = () => {
    currentRow.push(field);
    field = '';
  };

  const pushRow = () => {
    pushField();
    rows.push(currentRow);
    currentRow = [];
  };

  while (index < content.length) {
    const char = content[index];

    if (inQuotes) {
      if (char === QUOTE) {
        if (content[index + 1] === QUOTE) {
          field += QUOTE;
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      field += char;
      index += 1;
      continue;
    }

    if (char === QUOTE) {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === FIELD_DELIMITER) {
      pushField();
      index += 1;
      continue;
    }

    if (char === '\r') {
      if (content[index + 1] === '\n') {
        index += 1;
      }

      pushRow();
      index += 1;
      continue;
    }

    if (char === '\n') {
      pushRow();
      index += 1;
      continue;
    }

    field += char;
    index += 1;
  }

  if (field.length > 0 || currentRow.length > 0 || inQuotes) {
    pushRow();
  }

  return rows.filter((row) => !(row.length === 1 && row[0] === ''));
}

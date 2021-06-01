// @flow strict

/**
 * This file is AUTOMATICALLY GENERATED.
 * DO NOT edit this file manually.
 *
 * Instead, update the `*.grammar` file, and re-run `generate-ast`
 */

import type { Encoding } from './encodings'

import invariant from 'invariant'

function isBytes(node: Node): boolean %checks {
    return (
        node.baseType === 'blob' ||
        node.baseType === 'binary' ||
        node.baseType === 'varbinary' ||
        node.baseType === 'tinyblob' ||
        node.baseType === 'mediumblob' ||
        node.baseType === 'longblob'
    )
}

function isDataType(node: Node): boolean %checks {
    return (
        node.baseType === 'json' ||
        isNumeric(node) ||
        isTemporal(node) ||
        isTextual(node) ||
        isBytes(node)
    )
}

function isInteger(node: Node): boolean %checks {
    return (
        node.baseType === 'tinyint' ||
        node.baseType === 'mediumint' ||
        node.baseType === 'smallint' ||
        node.baseType === 'int' ||
        node.baseType === 'bigint'
    )
}

function isNumeric(node: Node): boolean %checks {
    return isInteger(node) || isReal(node)
}

function isReal(node: Node): boolean %checks {
    return (
        node.baseType === 'decimal' ||
        node.baseType === 'float' ||
        node.baseType === 'double'
    )
}

function isTemporal(node: Node): boolean %checks {
    return (
        node.baseType === 'datetime' ||
        node.baseType === 'timestamp' ||
        node.baseType === 'date' ||
        node.baseType === 'year' ||
        node.baseType === 'time'
    )
}

function isTextual(node: Node): boolean %checks {
    return (
        node.baseType === 'char' ||
        node.baseType === 'varchar' ||
        node.baseType === 'text' ||
        node.baseType === 'mediumtext' ||
        node.baseType === 'longtext'
    )
}

function isTextualOrEnum(node: Node): boolean %checks {
    return node.baseType === 'enum' || isTextual(node)
}

export type Bytes = Blob | Binary | VarBinary | TinyBlob | MediumBlob | LongBlob

export type DataType = Numeric | Temporal | Textual | Bytes | Json

export type Integer = TinyInt | MediumInt | SmallInt | Int | BigInt

export type Numeric = Integer | Real

export type Real = Decimal | Float | Double

export type Temporal = DateTime | Timestamp | Date | Year | Time

export type Textual = Char | VarChar | Text | MediumText | LongText

export type TextualOrEnum = Textual | Enum

export type Node =
    | BigInt
    | Binary
    | Blob
    | Char
    | Date
    | DateTime
    | Decimal
    | Double
    | Enum
    | Float
    | Int
    | Json
    | LongBlob
    | LongText
    | MediumBlob
    | MediumInt
    | MediumText
    | SmallInt
    | Text
    | Time
    | Timestamp
    | TinyBlob
    | TinyInt
    | VarBinary
    | VarChar
    | Year

function isNode(node: Node): boolean %checks {
    return (
        node.baseType === 'bigint' ||
        node.baseType === 'binary' ||
        node.baseType === 'blob' ||
        node.baseType === 'char' ||
        node.baseType === 'date' ||
        node.baseType === 'datetime' ||
        node.baseType === 'decimal' ||
        node.baseType === 'double' ||
        node.baseType === 'enum' ||
        node.baseType === 'float' ||
        node.baseType === 'int' ||
        node.baseType === 'json' ||
        node.baseType === 'longblob' ||
        node.baseType === 'longtext' ||
        node.baseType === 'mediumblob' ||
        node.baseType === 'mediumint' ||
        node.baseType === 'mediumtext' ||
        node.baseType === 'smallint' ||
        node.baseType === 'text' ||
        node.baseType === 'time' ||
        node.baseType === 'timestamp' ||
        node.baseType === 'tinyblob' ||
        node.baseType === 'tinyint' ||
        node.baseType === 'varbinary' ||
        node.baseType === 'varchar' ||
        node.baseType === 'year'
    )
}

export type BigInt = {|
    baseType: 'bigint',
    length: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Binary = {|
    baseType: 'binary',
    length: number,
|}

export type Blob = {|
    baseType: 'blob',
    length: number,
|}

export type Char = {|
    baseType: 'char',
    encoding: Encoding | null,
    length: number,
|}

export type Date = {|
    baseType: 'date',
|}

export type DateTime = {|
    baseType: 'datetime',
    fsp: number,
|}

export type Decimal = {|
    baseType: 'decimal',
    length: number,
    precision: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Double = {|
    baseType: 'double',
    length: number,
    precision: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Enum = {|
    baseType: 'enum',
    encoding: Encoding | null,
    values: Array<string>,
|}

export type Float = {|
    baseType: 'float',
    length: number,
    precision: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Int = {|
    baseType: 'int',
    length: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Json = {|
    baseType: 'json',
|}

export type LongBlob = {|
    baseType: 'longblob',
|}

export type LongText = {|
    baseType: 'longtext',
    encoding: Encoding | null,
|}

export type MediumBlob = {|
    baseType: 'mediumblob',
|}

export type MediumInt = {|
    baseType: 'mediumint',
    length: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type MediumText = {|
    baseType: 'mediumtext',
    encoding: Encoding | null,
|}

export type SmallInt = {|
    baseType: 'smallint',
    length: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type Text = {|
    baseType: 'text',
    encoding: Encoding | null,
|}

export type Time = {|
    baseType: 'time',
    fsp: number,
|}

export type Timestamp = {|
    baseType: 'timestamp',
    fsp: number,
|}

export type TinyBlob = {|
    baseType: 'tinyblob',
|}

export type TinyInt = {|
    baseType: 'tinyint',
    length: number,
    unsigned: boolean,
    zeroFill: boolean,
|}

export type VarBinary = {|
    baseType: 'varbinary',
    length: number,
|}

export type VarChar = {|
    baseType: 'varchar',
    encoding: Encoding | null,
    length: number,
|}

export type Year = {|
    baseType: 'year',
|}

export default {
    BigInt(length: number, unsigned: boolean, zeroFill: boolean): BigInt {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "BigInt" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "BigInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "BigInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'bigint',
            length,
            unsigned,
            zeroFill,
        }
    },

    Binary(length: number): Binary {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Binary" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        return {
            baseType: 'binary',
            length,
        }
    },

    Blob(length: number): Blob {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Blob" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        return {
            baseType: 'blob',
            length,
        }
    },

    Char(encoding: Encoding | null, length: number): Char {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "Char" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Char" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        return {
            baseType: 'char',
            encoding,
            length,
        }
    },

    Date(): Date {
        return {
            baseType: 'date',
        }
    },

    DateTime(fsp: number): DateTime {
        invariant(
            typeof fsp === 'number',
            `Invalid value for "fsp" arg in "DateTime" call.\nExpected: number\nGot:      ${JSON.stringify(
                fsp,
            )}`,
        )

        return {
            baseType: 'datetime',
            fsp,
        }
    },

    Decimal(
        length: number,
        precision: number,
        unsigned: boolean,
        zeroFill: boolean,
    ): Decimal {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Decimal" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof precision === 'number',
            `Invalid value for "precision" arg in "Decimal" call.\nExpected: number\nGot:      ${JSON.stringify(
                precision,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "Decimal" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "Decimal" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'decimal',
            length,
            precision,
            unsigned,
            zeroFill,
        }
    },

    Double(
        length: number,
        precision: number,
        unsigned: boolean,
        zeroFill: boolean,
    ): Double {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Double" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof precision === 'number',
            `Invalid value for "precision" arg in "Double" call.\nExpected: number\nGot:      ${JSON.stringify(
                precision,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "Double" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "Double" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'double',
            length,
            precision,
            unsigned,
            zeroFill,
        }
    },

    Enum(encoding: Encoding | null, values: Array<string>): Enum {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "Enum" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        invariant(
            Array.isArray(values) &&
                values.length > 0 &&
                values.every((item) => typeof item === 'string'),
            `Invalid value for "values" arg in "Enum" call.\nExpected: string+\nGot:      ${JSON.stringify(
                values,
            )}`,
        )

        return {
            baseType: 'enum',
            encoding,
            values,
        }
    },

    Float(
        length: number,
        precision: number,
        unsigned: boolean,
        zeroFill: boolean,
    ): Float {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Float" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof precision === 'number',
            `Invalid value for "precision" arg in "Float" call.\nExpected: number\nGot:      ${JSON.stringify(
                precision,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "Float" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "Float" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'float',
            length,
            precision,
            unsigned,
            zeroFill,
        }
    },

    Int(length: number, unsigned: boolean, zeroFill: boolean): Int {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "Int" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "Int" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "Int" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'int',
            length,
            unsigned,
            zeroFill,
        }
    },

    Json(): Json {
        return {
            baseType: 'json',
        }
    },

    LongBlob(): LongBlob {
        return {
            baseType: 'longblob',
        }
    },

    LongText(encoding: Encoding | null = null): LongText {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "LongText" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        return {
            baseType: 'longtext',
            encoding,
        }
    },

    MediumBlob(): MediumBlob {
        return {
            baseType: 'mediumblob',
        }
    },

    MediumInt(length: number, unsigned: boolean, zeroFill: boolean): MediumInt {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "MediumInt" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "MediumInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "MediumInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'mediumint',
            length,
            unsigned,
            zeroFill,
        }
    },

    MediumText(encoding: Encoding | null = null): MediumText {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "MediumText" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        return {
            baseType: 'mediumtext',
            encoding,
        }
    },

    SmallInt(length: number, unsigned: boolean, zeroFill: boolean): SmallInt {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "SmallInt" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "SmallInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "SmallInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'smallint',
            length,
            unsigned,
            zeroFill,
        }
    },

    Text(encoding: Encoding | null = null): Text {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "Text" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        return {
            baseType: 'text',
            encoding,
        }
    },

    Time(fsp: number): Time {
        invariant(
            typeof fsp === 'number',
            `Invalid value for "fsp" arg in "Time" call.\nExpected: number\nGot:      ${JSON.stringify(
                fsp,
            )}`,
        )

        return {
            baseType: 'time',
            fsp,
        }
    },

    Timestamp(fsp: number): Timestamp {
        invariant(
            typeof fsp === 'number',
            `Invalid value for "fsp" arg in "Timestamp" call.\nExpected: number\nGot:      ${JSON.stringify(
                fsp,
            )}`,
        )

        return {
            baseType: 'timestamp',
            fsp,
        }
    },

    TinyBlob(): TinyBlob {
        return {
            baseType: 'tinyblob',
        }
    },

    TinyInt(length: number, unsigned: boolean, zeroFill: boolean): TinyInt {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "TinyInt" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        invariant(
            typeof unsigned === 'boolean',
            `Invalid value for "unsigned" arg in "TinyInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                unsigned,
            )}`,
        )

        invariant(
            typeof zeroFill === 'boolean',
            `Invalid value for "zeroFill" arg in "TinyInt" call.\nExpected: boolean\nGot:      ${JSON.stringify(
                zeroFill,
            )}`,
        )

        return {
            baseType: 'tinyint',
            length,
            unsigned,
            zeroFill,
        }
    },

    VarBinary(length: number): VarBinary {
        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "VarBinary" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        return {
            baseType: 'varbinary',
            length,
        }
    },

    VarChar(encoding: Encoding | null, length: number): VarChar {
        invariant(
            encoding === null,
            `Invalid value for "encoding" arg in "VarChar" call.\nExpected: Encoding?\nGot:      ${JSON.stringify(
                encoding,
            )}`,
        )

        invariant(
            typeof length === 'number',
            `Invalid value for "length" arg in "VarChar" call.\nExpected: number\nGot:      ${JSON.stringify(
                length,
            )}`,
        )

        return {
            baseType: 'varchar',
            encoding,
            length,
        }
    },

    Year(): Year {
        return {
            baseType: 'year',
        }
    },

    // Node groups
    isNode,
    isBytes,
    isDataType,
    isInteger,
    isNumeric,
    isReal,
    isTemporal,
    isTextual,
    isTextualOrEnum,
}

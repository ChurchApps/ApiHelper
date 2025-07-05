// Based on https://www.npmjs.com/package/omit-empty
// The project appears to be abandoned, but needed modification to allow for empty arrays.

"use strict";

import typeOf from "kind-of";

interface OmitEmptyOptions {
    omitZero?: boolean;
    omitEmptyArray?: boolean;
    excludedProperties?: string[];
}

interface RuntimeOptions {
    omitZero: boolean;
    omitEmptyArray: boolean;
    excludedProperties: string[];
}

export class OmitEmpty {
    public static omitEmpty(obj: unknown, options: OmitEmptyOptions = {}): unknown {
        const runtimeOpts = OmitEmpty._buildRuntimeOpts(options);

        const omit = (value: unknown, opts: RuntimeOptions): unknown => {
            if (Array.isArray(value)) {
                value = value.map(v => omit(v, opts)).filter(v => !OmitEmpty.isEmpty(v, opts));
            }

            if (typeOf(value) === "object" && value !== null) {
                const result: Record<string, unknown> = {};
                for (const key of Object.keys(value as Record<string, unknown>)) {
                    if (!opts.excludedProperties.includes(key)) {
                        const val = omit((value as Record<string, unknown>)[key], opts);
                        if (val !== void 0) {
                            result[key] = val;
                        }
                    }
                }
                value = result;
            }

            if (!OmitEmpty.isEmpty(value, opts)) {
                return value;
            }
        };

        const res = omit(obj, runtimeOpts);
        if (res === void 0) {
            return typeOf(obj) === "object" ? {} : res;
        }
        return res;
    }


    private static _buildRuntimeOpts(options: OmitEmptyOptions = {}): RuntimeOptions {
        return {
            omitZero: options.omitZero || false,
            omitEmptyArray: options.omitEmptyArray || false,
            excludedProperties: options.excludedProperties || []
        };
    };

    private static isEmpty(value: unknown, runtimeOpts: RuntimeOptions): boolean {
        switch (typeOf(value)) {
            case "null":
            case "undefined":
                return true;
            case "boolean":
            case "function":
            case "date":
            case "regexp":
                return false;
            case "string":
            case "arguments":
                return (value as string).length === 0;
            case "file":
            case "map":
            case "set":
                return (value as { size: number }).size === 0;
            case "number":
                return runtimeOpts.omitZero ? value === 0 : false;
            case "error":
                return (value as Error).message === "";
            case "array":
                if (runtimeOpts.omitEmptyArray) {
                    for (const ele of (value as unknown[])) {
                        if (!OmitEmpty.isEmpty(ele, runtimeOpts)) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            case "object":
                for (const key of Object.keys(value as Record<string, unknown>)) {
                    if (!OmitEmpty.isEmpty((value as Record<string, unknown>)[key], runtimeOpts)) {
                        return false;
                    }
                }
                return true;
            default: {
                return true;
            }
        }
    }

}
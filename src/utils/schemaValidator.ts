import { Ajv, Schema } from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import { JSONObject, ValidationResult } from '../types/common';

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
});
addKeywords(ajv, 'uniqueItemProperties');
ajvErrors(ajv);

/**
 * Validates a JSON object against a provided JSON Schema.
 * @template T - The target type to cast the data to upon successful validation.
 * @param {JSONObject} data - The raw JSON data/object to validate.
 * @param {Schema} schema - The AJV-compatible JSON Schema definition.
 * @returns {ValidationResult<T>} A structured result containing:
 * - `success`: True if the data satisfies the schema.
 * - `data`: The validated data cast to T (Note: check `success` before use).
 * - `errors`: A list of validation failures with their property paths and messages.
 */
export const validateJson = <T>(
    data: JSONObject,
    schema: Schema,
): ValidationResult<T> => {
    const validate = ajv.compile(schema);
    const isValid = validate(data);

    return {
        success: !!isValid,
        data: data as T,
        errors:
            validate.errors?.map((err) => ({
                path: err.instancePath || 'root',
                message: err.message,
            })) || [],
    };
};

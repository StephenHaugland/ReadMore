const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.bookSchema = Joi.object({
    book: Joi.object({
        title: Joi.string().required().escapeHTML(),
        author: Joi.string().required().escapeHTML(),
        subtitle: Joi.string().allow(''),
        coverUrl: Joi.string(),
        genre: Joi.string().required(),
        description: Joi.string().allow(''),
        pageCount: Joi.number().min(0).allow('')
    }).required()
})

module.exports.entrySchema = Joi.object({
    entry: Joi.object({
        book: Joi.string().hex().length(24).escapeHTML(),
        shelf:Joi.string().required().escapeHTML(),
        quillNotes: Joi.string().allow('')
    }).required()
})

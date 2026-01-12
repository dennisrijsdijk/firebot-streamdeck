const variable: SpoofedVariable = {
    definition: {
        handle: "OR",
        description: "Returns true if any of the conditions return true. Only works within $if[]",
        usage: "OR[condition, condition, ...]",
        examples: [
            {
                usage: 'OR[a === a, b === c]',
                description: "Returns true as a equals a"
            }
        ]
    }
};

export default variable;
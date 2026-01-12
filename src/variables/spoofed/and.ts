const variable: SpoofedVariable = {
    definition: {
        handle: "AND",
        description: "Returns true if all of the conditions are true. Only works within $if[]",
        usage: "AND[condition, condition, ...]",
        examples: [
            {
                usage: 'AND[a === a, b === b]',
                description: "Returns true as a equals a and b equals b"
            }
        ]
    }
};

export default variable;
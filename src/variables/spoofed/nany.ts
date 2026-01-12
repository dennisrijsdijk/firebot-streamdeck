const variable: SpoofedVariable = {
    definition: {
        handle: "NANY",
        description: "Returns true if all of the conditions return false. Only works within $if[]",
        usage: "NANY[condition, condition, ...]",
        examples: [
            {
                usage: 'NANY[a === a, b === c]',
                description: "Returns false as a equals a"
            }
        ]
    }
};

export default variable;
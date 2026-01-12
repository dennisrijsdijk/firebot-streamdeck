const variable: SpoofedVariable = {
    definition: {
        handle: "NOR",
        description: "Returns true if all of the conditions return false. Only works within $if[]",
        usage: "NOR[condition, condition, ...]",
        examples: [
            {
                usage: 'NOR[a === a, b === c]',
                description: "Returns false as a equals a"
            }
        ]
    }
};

export default variable;
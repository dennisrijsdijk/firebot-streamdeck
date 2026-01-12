const variable: SpoofedVariable = {
    definition: {
        handle: "if",
        description: "Returns the parameter based on the condition's result.",
        usage: "if[condition, when_true, when_false]",
        examples: [
            {
                usage: "if[a === a, yes, no]",
                description: "Returns yes as a equals a"
            },
            {
                usage: "if[$counter[test] > 100, high, low]",
                description: "Returns high if the 'test' counter's value is greater than 100, otherwise returns low"
            }
        ]
    }
};

export default variable;
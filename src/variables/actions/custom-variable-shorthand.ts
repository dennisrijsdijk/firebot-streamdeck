import { SpoofedVariable } from "../../types/replace-variables";

const variable: SpoofedVariable = {
    definition: {
        handle: "customVariable",
        description: "Retrieves the value for a customVariable. If path is specified, walks the item before returning the value",
        usage: "$name[...path?]",
        examples: [
            {
                usage: '$example',
                description: "Returns the value of the customVariable 'example'; Synonymous with $customVariable[example]"
            },
            {
                usage: '$example[path, to, value]',
                description: "Returns the value of the customVariable 'example' at property path 'path.to.value'; Synonymous with $customVariable[example, path.to.value]"
            }
        ]
    }
};

export default variable;
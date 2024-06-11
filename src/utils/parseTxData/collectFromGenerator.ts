export function collectFromGenerator<GGenerator = unknown>(generatorFunc: () => Generator<GGenerator>) {
    const result: GGenerator[] = [];
    const generator = generatorFunc();

    for (let value of generator) {
        result.push(value);
    }

    return result;
}

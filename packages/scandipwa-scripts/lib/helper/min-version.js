// TODO: remove and upgrade the semver after this PR will be merged (https://github.com/npm/node-semver/pull/341)

const SemVer = require('semver/classes/semver')
const Range = require('semver/classes/range')
const gt = require('semver/functions/gt')

const minVersion = (rangeExpected, loose) => {
    let minver = new SemVer('0.0.0');
    const range = new Range(rangeExpected, loose);

    for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];

        for (let i = 0; i < comparators.length; i++) {
            const comparator = comparators[i];
            const compver = new SemVer(comparator.semver.version);

            switch (comparator.operator) {
                case '>': // Larger
                    if (compver.prerelease.length === 0) {
                        // For pre-releases, bump it one up
                        compver.patch++
                    } else {
                        // Otherwise, increase by one 
                        compver.prerelease.push(0)
                    }

                    compver.raw = compver.format()
                    // vvv fallthrough to case bellow vvv
                case '':
                case '>=': // Exact OR larger & equal
                    if (gt(compver, minver)) {
                        minver = compver
                    }
                    break;
                case '<':
                case '<=': // Smaller OR smaller & equal
                    // Ignore maximum versions
                    break;
                default:
                    throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
        }
    }

    if (minver && range.test(minver)) {
        return minver;
    }

    return null;
}

module.exports = minVersion;

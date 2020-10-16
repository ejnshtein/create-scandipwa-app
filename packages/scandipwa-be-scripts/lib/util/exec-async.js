/* eslint-disable max-len */
const { exec, spawn } = require('child_process');

/**
 * Execute bash command
 * @param {String} command Bash command
 * @param {Object} options Child process exec options ([docs](https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback))
 * @returns {Promise<String>}
 */
const execAsync = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => (err ? reject(err) : resolve(stdout)));
});
// capture = don't output stdout/stderr, return with promises response
// echo = capture + output in the end
const execAsyncWithCallback = (command, { callback = () => {} } = {}) => {
    const childProcess = spawn(
        'bash',
        ['-c', command],
        {
            stdio: 'pipe'
        }
    );

    return new Promise((resolve, reject) => {
        let stdout = '';
        childProcess.stdout.on('data', (data) => {
            stdout += data;
            callback(data.toString());
        });
        childProcess.stderr.on('data', (data) => {
            stdout += data;
            callback(data.toString());
        });
        childProcess.on('error', (error) => {
            reject(error);
        });
        childProcess.on('close', (code) => {
            if (code > 0) {
                reject(stdout);
            } else {
                resolve(stdout);
            }
        });
    });
};

const execAsyncBool = async (command, options) => {
    const result = await execAsync(command, options);
    if (result.toString().trim() === '1') {
        throw new Error('');
    }
};

module.exports = {
    execAsync,
    execAsyncBool,
    execAsyncWithCallback
};

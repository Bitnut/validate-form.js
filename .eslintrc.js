module.exports = {
    // parserOptions: {
    //   parser: 'babel-eslint'
    // },
    env: {
        browser: true,
        jquery: true
    },
    extends: [
        'standard'
    ],
    rules: {
        // allow async-await
        'generator-star-spacing': 'off',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: ['error', 'always'],
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-var': ['error'],
        'arrow-body-style': ['error', 'always'],
        'arrow-parens': ['error', 'always']
    }
};

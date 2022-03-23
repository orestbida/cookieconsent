module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "indent": ["warn", 4],
        "linebreak-style": ["warn", "unix"],
        "quotes": ["warn", "single"],
        "semi": ["warn", "always"],
        "no-unused-vars": ["warn"]
    }
}
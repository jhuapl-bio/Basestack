module.exports = {
    plugins: {
        'postcss-import': {
            filter: (result) => {
                return result.includes('assets/styles')
            }
        },
        tailwindcss: {},
        autoprefixer: {},
    }
}
module.exports = {
    getLog: async (req, res) => {
        const {logEntry} = req.body
        console.log(logEntry)
    }
}
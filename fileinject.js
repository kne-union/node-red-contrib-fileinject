const bodyParser = require('body-parser')

module.exports = function (RED) {
    const requestSize = '50mb'

    function Node (config) {
        RED.nodes.createNode(this, config);
        const node = this;

        RED.httpAdmin.get('/node-red-contrib-fileinject/status', function (req, res) {
            const n = RED.nodes.getNode(req.query.id)
            let status = {};
            if ('true' === req.query.status) {
                status = {fill:'red', shape:'dot', text:'文件正在上传...'}
            }
            if (n) {
                n.status(status);
            }
            res.json({});
        });


        RED.httpAdmin.post('/node-red-contrib-fileinject/:id', bodyParser.raw({ type: '*/*', limit: requestSize }), function(req,res) {
            const node = RED.nodes.getNode(req.params.id)

            if (node != null) {
                try {
                    node.receive({payload: req.body, filename: req.headers["x-filename"], mimetype: req.headers["content-type"]})
                    node.status({})
                    res.sendStatus(200)
                } catch(err) {
                    res.sendStatus(500)
                    node.error(RED._("inject-file.failed", { error: err.toString() }))
                }
            } else {
                res.status(404).send("no node found")
            }
        })

        this.on('input', function (msg) {
            if(msg.payload !== '') {
                node.send(msg)
            }
        })
    }
    RED.nodes.registerType('fileinject', Node)
};

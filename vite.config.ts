import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as express from 'express';

const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
        server.middlewares.use('/guide-assets/index.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                versions: [{
                    "minecraftVersion": "1.20",
                    "modVersion": "15.0.0",
                    "lastUpdate": 1687037012967
                }]
            }));
        })
        server.middlewares.use('/guide-assets/1.20', express.static('C:/AE2/Fabric/build/guide'))
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), myPlugin()],
})

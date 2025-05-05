import Consul from 'consul';
import { app } from './app';

const port: string = process.env.PORT || '3000';

const consulClient = new Consul({
    host: 'consul-service',
    port: 8500,
    secure: false,
});

const registerService = async () => {
    try {
        await consulClient.agent.service.register({
            id: process.env.NAME || 'default-service-id',
            name: process.env.NAME || 'default-service-name',
            address: 'localhost',
            port: Number(port),
            check: {
                name: 'health-check',
                http: `http://prompt-service:${port}/api/v1/prompt/health-check`,
                interval: '10s',
                timeout: '5s',
                deregistercriticalserviceafter: '1m',
            },
        });
        console.log('Service registered with Consul');
    } catch (error) {
        console.error('Failed to register service:', error);
    }
};

const deregisterService = async () => {
    try {
        await consulClient.agent.service.deregister(process.env.NAME || 'default-service-id');
        console.log('Service deregistered from Consul');
    } catch (error) {
        console.error('Failed to deregister service:', error);
    }
};

app.listen(Number(port), async () => {
    console.log('Server is running in http://localhost:' + port);
    await registerService();
});

process.on('SIGINT', async () => {
    await deregisterService();
    process.exit();
});

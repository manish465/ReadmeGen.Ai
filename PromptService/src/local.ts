import { app } from './app';

const port: string = process.env.PORT || '3000';

app.listen(Number(port), () => {
    console.log('Server is running in http://localhost:' + port);
});

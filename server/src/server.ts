import * as express from 'express';

export function startServer() {
  const app = express();
  app.get('/register', async (req: any, res: any) => {
    console.log('Received request');
    res.send({success: true});
  });

  app.listen(3000, () => {
    console.log('Server has started on port 3000');
  });
}
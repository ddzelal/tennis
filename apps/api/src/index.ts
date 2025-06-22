import express, { type Request, type Response } from 'express';

const app = express();
const port = 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from api!');
});

app.listen(port, () => {
  console.log(`Api running on http://localhost:${port}`);
}); 
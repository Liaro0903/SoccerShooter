import express from 'express';
import * as path from 'path';

const PORT = 3001;
const app = express();

app.use(express.static(path.join(__dirname, 'private')));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
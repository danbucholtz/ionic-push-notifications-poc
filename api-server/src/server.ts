import { join } from 'path';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as admin from 'firebase-admin';

const userMap = new Map<string, NotificationData>();

export function startServer() {
  const app = express();

  app.use(bodyParser.json());
  
  app.use((req: any, res: any, next: Function) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('/register', (req: any, res: any) => {
    const name = req.body.name;
    const token = req.body.token;
    const os = req.body.os;
    userMap.set(name, {
      name,
      token,
      os
    });
    console.log(`${name} registered for notifications with token ${token} on ${os}`);
    res.send({success: true});
  });

  app.get('/users', (req: any, res: any) => {
    const list = Array.from(userMap).map((value: [string, NotificationData]) => {
      return value[1];
    });
    console.log('list: ', list);
    res.send({success: true, list: list});
  });

  app.post('/send', async (req: any, res: any) => {
    try {
      const names = req.body.users.map((user: any) => user.name);
      for (const name of names) {
        const notificationData = userMap.get(name);
        if (!notificationData) {
          throw new Error(`The name ${name} is not found`);
        }

        const notification = {
          data: {
            message: req.body.message,
            fixed: '3',
            somethingElse: 'taco',
            isLate: 'false'
          },
          token: notificationData.token
        };

        console.log(`Sending notification to ${name} with message ${req.body.message}`);
        const response = await admin.messaging().send(notification);
        console.log('Successfully sent notification: ', response);
        res.send({success: true});
      }
    } catch (ex) {
      console.log('Something went wrong: ', ex);
      res.send({success: false});
    }
  });

  const pathName = join(__dirname, '..', 'firebase-service-account.json');
  const serviceAccount = require(pathName);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://israeli-birthright-poc.firebaseio.com"
  });

  app.listen(3000, () => {
    console.log('Server has started on port 3000');
  });
}

export interface NotificationData {
  name: string;
  token: string;
  os: string;
}
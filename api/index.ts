import serverless from 'serverless-http';
import { createApp } from '../server/src/app';

export default serverless(createApp());


'use server';
import {config} from 'dotenv';
config({path: '.env'});

import './flows/generate-weekly-content';
import './flows/rag-chatbot-companion';
import './flows/transcribe-sermon';
import './flows/translate-sermon-content';
import './flows/generate-monday-clip';
import './flows/translate-transcript';
import './flows/cleanup-transcript';
